import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SALLA_CLIENT_ID = Deno.env.get("SALLA_CLIENT_ID")!;
const SALLA_CLIENT_SECRET = Deno.env.get("SALLA_CLIENT_SECRET")!;
const APP_URL = Deno.env.get("APP_URL")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/salla-auth/callback`;
const SALLA_AUTH_URL = "https://accounts.salla.sa/oauth2/auth";
const SALLA_TOKEN_URL = "https://accounts.salla.sa/oauth2/token";
const SALLA_API_BASE = "https://api.salla.dev/admin/v2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-salla-event",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/\/$/, "");

  try {
    // ── Route A: GET /salla-auth/connect ──
    if (req.method === "GET" && path.endsWith("/connect")) {
      const userId = url.searchParams.get("user_id");
      if (!userId) {
        return new Response("Missing user_id query parameter", {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        });
      }

      const params = new URLSearchParams({
        client_id: SALLA_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: "code",
        scope: "offline_access",
        state: userId,
      });

      const redirectUrl = `${SALLA_AUTH_URL}?${params.toString()}`;
      console.log(`[salla-auth] redirecting user ${userId} to Salla OAuth`);

      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          Location: redirectUrl,
        },
      });
    }

    // ── Route B: GET /salla-auth/callback ──
    if (req.method === "GET" && path.endsWith("/callback")) {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const error = url.searchParams.get("error");

      if (error) {
        console.error(`[salla-auth] OAuth error: ${error}`);
        return new Response(null, {
          status: 302,
          headers: {
            ...corsHeaders,
            Location: `${APP_URL}/integrations?salla=error`,
          },
        });
      }

      if (!code || !state) {
        console.error("[salla-auth] Missing code or state in callback");
        return new Response("Missing code or state", {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "text/plain" },
        });
      }

      const userId = state;
      console.log(`[salla-auth] callback received — code present, user_id=${userId}`);

      // Exchange code for access token
      const tokenRes = await fetch(SALLA_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "authorization_code",
          client_id: SALLA_CLIENT_ID,
          client_secret: SALLA_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          code,
        }),
      });

      if (!tokenRes.ok) {
        const errBody = await tokenRes.text();
        console.error(`[salla-auth] token exchange failed (${tokenRes.status}): ${errBody}`);
        return new Response(null, {
          status: 302,
          headers: {
            ...corsHeaders,
            Location: `${APP_URL}/integrations?salla=error`,
          },
        });
      }

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;
      const refreshToken = tokenData.refresh_token;
      const expiresIn = tokenData.expires_in || 1209600;

      if (!accessToken) {
        console.error("[salla-auth] No access_token in token response");
        return new Response(null, {
          status: 302,
          headers: {
            ...corsHeaders,
            Location: `${APP_URL}/integrations?salla=error`,
          },
        });
      }

      // Fetch store info from Salla API
      let storeName = "Salla Store";
      let storeUrl = "";
      let sallaStoreId = "";

      try {
        const storeRes = await fetch(`${SALLA_API_BASE}/store/info`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (storeRes.ok) {
          const storeData = await storeRes.json();
          if (storeData.data) {
            storeName = storeData.data.name || storeName;
            storeUrl = storeData.data.domain || "";
            sallaStoreId = String(storeData.data.id);
          }
        }
      } catch (err) {
        console.warn("[salla-auth] Could not fetch store info:", err);
      }

      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
      const supabase = getSupabase();

      // Remove any existing Salla store for this user (one store per platform per user)
      await supabase
        .from("stores")
        .delete()
        .eq("user_id", userId)
        .eq("platform", "salla");

      // Insert new store record linked to the user
      const { error: insertErr } = await supabase.from("stores").insert({
        user_id: userId,
        platform: "salla",
        store_id: sallaStoreId,
        store_name: storeName,
        store_url: storeUrl,
        access_token: accessToken,
        refresh_token: refreshToken || null,
        token_expires_at: expiresAt,
        is_active: true,
      });

      if (insertErr) {
        console.error("[salla-auth] Failed to insert store:", insertErr);
        return new Response(null, {
          status: 302,
          headers: {
            ...corsHeaders,
            Location: `${APP_URL}/integrations?salla=error`,
          },
        });
      }

      console.log(`[salla-auth] store connected: ${storeName} (${sallaStoreId}) for user ${userId}`);
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          Location: `${APP_URL}/integrations?salla=connected`,
        },
      });
    }

    // ── Route C: POST /salla-auth/webhook ──
    if (req.method === "POST" && path.endsWith("/webhook")) {
      const eventType = req.headers.get("X-Salla-Event") || "";
      const body = await req.json();
      const event = body.event || eventType || "";
      const merchantId = String(body.merchant || "");

      console.log(`[salla-auth] webhook: event=${event} merchant=${merchantId}`);

      const supabase = getSupabase();

      if (event === "app.store.uninstall") {
        const { error } = await supabase
          .from("stores")
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("store_id", merchantId)
          .eq("platform", "salla");

        if (error) {
          console.error("[salla-auth] Failed to deactivate store:", error);
        }

        console.log(`[salla-auth] store uninstalled: ${merchantId}`);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (
        event === "order.created" ||
        event === "order.updated" ||
        event === "order.status.updated"
      ) {
        const order = body.data || body;

        if (!order || !order.id) {
          return new Response(JSON.stringify({ success: true, skipped: "no order data" }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: store } = await supabase
          .from("stores")
          .select("id, user_id")
          .eq("store_id", merchantId)
          .eq("platform", "salla")
          .eq("is_active", true)
          .maybeSingle();

        if (!store || !store.user_id) {
          console.log(`[salla-auth] order ${order.id} skipped — store not linked to user`);
          return new Response(JSON.stringify({ success: true, skipped: "store not linked" }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const amount = typeof order.amounts?.total?.amount === "number"
          ? order.amounts.total.amount
          : Number(order.total) || 0;

        const mappedStatus = mapSallaStatus(order.status?.name || "");

        const customerName = [
          order.customer?.first_name,
          order.customer?.last_name,
        ]
          .filter(Boolean)
          .join(" ")
          .trim() || "Salla Customer";

        const orderDate = order.date?.date || order.created_at || new Date().toISOString();

        const { error } = await supabase.from("orders").upsert(
          {
            user_id: store.user_id,
            store_id: store.id,
            external_id: String(order.id),
            amount,
            status: mappedStatus,
            customer_name: customerName,
            created_at: orderDate,
          },
          { onConflict: "external_id" }
        );

        if (error) {
          console.error(`[salla-auth] order upsert failed for ${order.id}:`, error.message);
        }

        console.log(`[salla-auth] order ${order.id} upserted (status=${mappedStatus})`);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Unknown webhook event — acknowledge
      console.log(`[salla-auth] unhandled webhook event: ${event}`);
      return new Response(JSON.stringify({ success: true, unhandled: event }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Fallback ──
    return new Response("Salla Auth — routes: /connect, /callback, /webhook", {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  } catch (err) {
    console.error("[salla-auth] unhandled error:", err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function mapSallaStatus(sallaStatus: string): string {
  const s = sallaStatus.trim();
  const map: Record<string, string> = {
    "تم الشحن": "Delivered",
    "مكتمل": "Delivered",
    "ملغي": "Returned",
    "مرتجع": "Returned",
    "قيد المعالجة": "Pending",
    "جديد": "Pending",
  };
  return map[s] || "Pending";
}