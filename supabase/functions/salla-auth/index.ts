import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SALLA_CLIENT_ID = Deno.env.get("SALLA_CLIENT_ID")!;
const SALLA_CLIENT_SECRET = Deno.env.get("SALLA_CLIENT_SECRET")!;
const APP_URL = Deno.env.get("APP_URL")!;

serve(async (req) => {
  const url = new URL(req.url);

  // ── Step A: Redirect merchant to Salla OAuth login ──
  if (url.pathname.endsWith("/connect")) {
    const userId = url.searchParams.get("user_id");
    if (!userId) {
      return new Response("Missing user_id", { status: 400 });
    }

    const sallaAuthUrl =
      `https://accounts.salla.sa/oauth2/auth` +
      `?client_id=${SALLA_CLIENT_ID}` +
      `&redirect_uri=${APP_URL}/api/salla-auth/callback` +
      `&response_type=code` +
      `&scope=offline_access` +
      `&state=${userId}`;

    return Response.redirect(sallaAuthUrl, 302);
  }

  // ── Step B: Receive authorization code from Salla, exchange for token ──
  if (url.pathname.endsWith("/callback")) {
    const code = url.searchParams.get("code");
    const userId = url.searchParams.get("state");

    if (!code || !userId) {
      return new Response("Missing authorization code", { status: 400 });
    }

    // Exchange code for access token
    const tokenRes = await fetch("https://accounts.salla.sa/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: SALLA_CLIENT_ID,
        client_secret: SALLA_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: `${APP_URL}/api/salla-auth/callback`,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Token exchange failed:", errText);
      return new Response("Failed to exchange code for token", { status: 500 });
    }

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return new Response("No access token received from Salla", { status: 500 });
    }

    // Fetch store info from Salla API
    let storeName = "Salla Store";
    let storeDomain = "";
    let storeId = "";
    try {
      const storeRes = await fetch("https://api.salla.dev/admin/v2/store/info", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (storeRes.ok) {
        const storeData = await storeRes.json();
        if (storeData.data) {
          storeName = storeData.data.name || storeName;
          storeDomain = storeData.data.domain || "";
          storeId = String(storeData.data.id || "");
        }
      }
    } catch (err) {
      console.warn("Could not fetch store info:", err);
    }

    // Save to Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const expiresAt = new Date(
      Date.now() + ((tokenData.expires_in || 1209600) * 1000)
    ).toISOString();

    const { error: upsertError } = await supabase.from("stores").upsert({
      user_id: userId,
      platform: "salla",
      store_id: storeId,
      store_name: storeName,
      store_url: storeDomain,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: expiresAt,
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,platform" });

    if (upsertError) {
      console.error("Failed to save store:", upsertError);
      return new Response("Failed to save store connection", { status: 500 });
    }

    // Redirect merchant back to the app dashboard
    return Response.redirect(`${APP_URL}/app/settings?salla=connected`, 302);
  }

  // ── Step C: Webhook — receive order events from Salla automatically ──
  if (url.pathname.endsWith("/webhook") && req.method === "POST") {
    try {
      const body = await req.json();
      const event = body.event;
      const order = body.data;
      const merchantId = String(body.merchant || order?.store_id || "");

      if (event === "order.created" || event === "order.updated" || event === "order.status.updated") {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Find the connected store for this merchant
        const { data: store } = await supabase
          .from("stores")
          .select("id, user_id")
          .eq("store_id", merchantId)
          .eq("platform", "salla")
          .eq("is_active", true)
          .single();

        if (store) {
          await supabase.from("orders").upsert({
            user_id: store.user_id,
            store_id: store.id,
            external_id: String(order.id),
            amount: order.amounts?.total?.amount || order.total || 0,
            status: mapSallaStatus(order.status?.name || order.status || ""),
            customer_name: order.customer?.first_name || order.customer?.name || "Salla Customer",
            created_at: order.date?.date || order.created_at || new Date().toISOString(),
          }, { onConflict: "external_id" });
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Webhook error:", err);
      return new Response("Webhook processing error", { status: 500 });
    }
  }

  return new Response("Salla OAuth Edge Function", { status: 200 });
});

function mapSallaStatus(sallaStatus: string): string {
  const map: Record<string, string> = {
    "تم الشحن": "Delivered",
    "مكتمل": "Delivered",
    "ملغي": "Returned",
    "مرتجع": "Returned",
    "قيد المعالجة": "Pending",
    "جديد": "Pending",
  };
  return map[sallaStatus] || "Pending";
}