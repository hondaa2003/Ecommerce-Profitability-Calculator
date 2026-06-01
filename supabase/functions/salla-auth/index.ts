import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SALLA_CLIENT_ID = Deno.env.get("SALLA_CLIENT_ID")!;
const SALLA_CLIENT_SECRET = Deno.env.get("SALLA_CLIENT_SECRET")!;
const REDIRECT_URI = "https://wljecfqzxvojsypqbkzp.supabase.co/functions/v1/salla-auth/callback";
const APP_URL = "https://ecommerce-profitability-calculator.vercel.app";

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // Route A — redirect merchant to Salla login
  if (path.endsWith("/connect")) {
    const userId = url.searchParams.get("user_id");
    if (!userId) return new Response("Missing user_id", { status: 400 });

    const sallaUrl = `https://accounts.salla.sa/oauth2/auth?client_id=${SALLA_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=offline_access&state=${userId}`;
    return Response.redirect(sallaUrl, 302);
  }

  // Route B — receive code from Salla and exchange for token
  if (path.endsWith("/callback")) {
    const code = url.searchParams.get("code");
    const userId = url.searchParams.get("state");

    if (!code || !userId) return new Response("Missing code or state", { status: 400 });

    const tokenRes = await fetch("https://accounts.salla.sa/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: SALLA_CLIENT_ID,
        client_secret: SALLA_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return new Response(JSON.stringify(tokenData), { status: 400 });
    }

    const storeRes = await fetch("https://api.salla.dev/admin/v2/store/info", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const storeData = await storeRes.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase.from("stores").upsert({
      user_id: userId,
      platform: "salla",
      store_id: String(storeData.data?.id || ""),
      store_name: storeData.data?.name || "Salla Store",
      store_url: storeData.data?.domain || "",
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      token_expires_at: new Date(Date.now() + (tokenData.expires_in || 1209600) * 1000).toISOString(),
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,platform" });

    return Response.redirect(`${APP_URL}/integrations?salla=connected`, 302);
  }

  // Route C — webhook for orders
  if (req.method === "POST") {
    const body = await req.json();
    const event = body.event;
    const merchantId = String(body.merchant);

    if (event === "order.created" || event === "order.updated" || event === "order.status.updated") {
      const order = body.data;
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data: store } = await supabase
        .from("stores")
        .select("id, user_id")
        .eq("store_id", merchantId)
        .eq("platform", "salla")
        .single();

      if (store) {
        const statusMap: Record<string, string> = {
          "تم الشحن": "Delivered",
          "مكتمل": "Delivered",
          "ملغي": "Returned",
          "مرتجع": "Returned",
          "قيد المعالجة": "Pending",
          "جديد": "Pending",
        };

        await supabase.from("orders").upsert({
          user_id: store.user_id,
          store_id: store.id,
          external_id: String(order.id),
          amount: order.amounts?.total?.amount || 0,
          status: statusMap[order.status?.name] || "Pending",
          customer_name: order.customer?.first_name || "Salla Customer",
          created_at: order.date?.date || new Date().toISOString(),
        }, { onConflict: "external_id" });
      }
    }

    return new Response("OK", { status: 200 });
  }

  return new Response("Not found", { status: 404 });
});