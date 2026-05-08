import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

const BASE = "/make-server-2d50666c";

app.get(`${BASE}/health`, (c) => c.json({ status: "ok" }));

// Seller signup. Auto-confirms email since no email server is configured.
app.post(`${BASE}/signup`, async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    if (!email || !password) {
      return c.json({ error: "Email and password required" }, 400);
    }
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || "" },
      email_confirm: true,
    });
    if (error) {
      console.log(`Signup error for ${email}: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }
    return c.json({ user: data.user });
  } catch (err) {
    console.log(`Unexpected signup error: ${err}`);
    return c.json({ error: `Signup failed: ${err}` }, 500);
  }
});

// Resolve the user from the Authorization header
async function getUserId(authHeader: string | undefined): Promise<string | null> {
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  if (!token) return null;
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user?.id) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

const COLLECTIONS = ["products", "orders", "campaigns"] as const;
type Collection = (typeof COLLECTIONS)[number];

for (const collection of COLLECTIONS) {
  // List
  app.get(`${BASE}/${collection}`, async (c) => {
    try {
      const userId = await getUserId(c.req.header("Authorization"));
      if (!userId) return c.json({ error: "Unauthorized" }, 401);

      const { data, error } = await supabaseAdmin
        .from(collection)
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return c.json({ items: data ?? [] });
    } catch (err) {
      console.log(`Error listing ${collection}: ${err}`);
      return c.json({ error: `Failed to list ${collection}: ${err}` }, 500);
    }
  });

  // Create
  app.post(`${BASE}/${collection}`, async (c) => {
    try {
      const userId = await getUserId(c.req.header("Authorization"));
      if (!userId) return c.json({ error: "Unauthorized" }, 401);

      const body = await c.req.json();
      // Remove id if present to let Postgres generate it, or keep if it's a valid UUID
      const { id, ...rest } = body;
      
      const { data, error } = await supabaseAdmin
        .from(collection)
        .insert({ ...rest, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return c.json({ item: data });
    } catch (err) {
      console.log(`Error creating ${collection}: ${err}`);
      return c.json({ error: `Failed to create ${collection}: ${err}` }, 500);
    }
  });

  // Update
  app.put(`${BASE}/${collection}/:id`, async (c) => {
    try {
      const userId = await getUserId(c.req.header("Authorization"));
      if (!userId) return c.json({ error: "Unauthorized" }, 401);

      const id = c.req.param("id");
      const body = await c.req.json();
      const { user_id, created_at, ...updateData } = body;

      const { data, error } = await supabaseAdmin
        .from(collection)
        .update(updateData)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return c.json({ item: data });
    } catch (err) {
      console.log(`Error updating ${collection}: ${err}`);
      return c.json({ error: `Failed to update ${collection}: ${err}` }, 500);
    }
  });

  // Delete
  app.delete(`${BASE}/${collection}/:id`, async (c) => {
    try {
      const userId = await getUserId(c.req.header("Authorization"));
      if (!userId) return c.json({ error: "Unauthorized" }, 401);

      const id = c.req.param("id");
      const { error } = await supabaseAdmin
        .from(collection)
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      return c.json({ ok: true });
    } catch (err) {
      console.log(`Error deleting ${collection}: ${err}`);
      return c.json({ error: `Failed to delete ${collection}: ${err}` }, 500);
    }
  });
}

Deno.serve(app.fetch);
