import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

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
      // Automatically confirm the user's email since an email server hasn't been configured.
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

// Resolve the user from the Authorization header (if present and valid).
// Anon key callers return null so the global anon scope still works for
// landing/health.
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

// Per-user scoping: when a real user token is present, all CRUD is scoped
// under `u:{userId}:{collection}:{id}`. Anonymous callers (anon key) share
// the legacy `{collection}:{id}` namespace so the public landing demo keeps
// working.
function prefixFor(userId: string | null, collection: Collection) {
  return userId ? `u:${userId}:${collection}:` : `${collection}:`;
}

for (const collection of COLLECTIONS) {
  app.get(`${BASE}/${collection}`, async (c) => {
    try {
      const userId = await getUserId(c.req.header("Authorization"));
      const items = await kv.getByPrefix(prefixFor(userId, collection));
      return c.json({ items: items ?? [] });
    } catch (err) {
      console.log(`Error listing ${collection}: ${err}`);
      return c.json({ error: `Failed to list ${collection}: ${err}` }, 500);
    }
  });

  app.post(`${BASE}/${collection}`, async (c) => {
    try {
      const userId = await getUserId(c.req.header("Authorization"));
      const body = await c.req.json();
      const id =
        body.id ||
        `${collection.slice(0, 1)}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const record = { ...body, id, updatedAt: new Date().toISOString() };
      await kv.set(`${prefixFor(userId, collection)}${id}`, record);
      return c.json({ item: record });
    } catch (err) {
      console.log(`Error creating ${collection}: ${err}`);
      return c.json({ error: `Failed to create ${collection}: ${err}` }, 500);
    }
  });

  app.put(`${BASE}/${collection}/:id`, async (c) => {
    try {
      const userId = await getUserId(c.req.header("Authorization"));
      const id = c.req.param("id");
      const body = await c.req.json();
      const key = `${prefixFor(userId, collection)}${id}`;
      const existing = await kv.get(key);
      const record = {
        ...(existing || {}),
        ...body,
        id,
        updatedAt: new Date().toISOString(),
      };
      await kv.set(key, record);
      return c.json({ item: record });
    } catch (err) {
      console.log(`Error updating ${collection}: ${err}`);
      return c.json({ error: `Failed to update ${collection}: ${err}` }, 500);
    }
  });

  app.delete(`${BASE}/${collection}/:id`, async (c) => {
    try {
      const userId = await getUserId(c.req.header("Authorization"));
      const id = c.req.param("id");
      await kv.del(`${prefixFor(userId, collection)}${id}`);
      return c.json({ ok: true });
    } catch (err) {
      console.log(`Error deleting ${collection}: ${err}`);
      return c.json({ error: `Failed to delete ${collection}: ${err}` }, 500);
    }
  });
}

Deno.serve(app.fetch);
