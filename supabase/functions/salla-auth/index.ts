import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SALLA_CLIENT_ID = Deno.env.get("SALLA_CLIENT_ID")!;
const SALLA_CLIENT_SECRET = Deno.env.get("SALLA_CLIENT_SECRET")!;

serve(async (req) => {
  if (req.method === "GET") {
    return new Response("Salla Easy Mode Webhook — POST only", { status: 200 });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const eventType = req.headers.get("X-Salla-Event") || "";

  try {
    const body = await req.json();
    const event = body.event || eventType;
    const merchantId = String(body.merchant || "");

    console.log(`[salla-auth] event=${event} merchant=${merchantId}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── EVENT A: app.store.authorize (Easy Mode — token sent directly) ──
    if (event === "app.store.authorize") {
      const accessToken = body.access_token || body.data?.access_token;
      const refreshToken = body.refresh_token || body.data?.refresh_token;
      const expiresIn = body.expires_in || body.data?.expires_in || 1209600;

      if (!accessToken) {
        console.error("Missing access_token in authorize webhook");
        return new Response(JSON.stringify({ success: false, error: "Missing access_token" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Fetch store info from Salla API
      let storeName = "Salla Store";
      let storeUrl = "";
      let sallaStoreId = merchantId;
      try {
        const storeRes = await fetch("https://api.salla.dev/admin/v2/store/info", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (storeRes.ok) {
          const storeData = await storeRes.json();
          if (storeData.data) {
            storeName = storeData.data.name || storeName;
            storeUrl = storeData.data.domain || "";
            sallaStoreId = String(storeData.data.id || merchantId);
          }
        }
      } catch (err) {
        console.warn("Could not fetch store info, using defaults:", err);
      }

      const expiresAt = new Date(Date.now() + (expiresIn * 1000)).toISOString();

      // Check if store already exists for this merchant
      const { data: existing } = await supabase
        .from("stores")
        .select("id")
        .eq("store_id", sallaStoreId)
        .eq("platform", "salla")
        .single();

      if (existing) {
        await supabase.from("stores").update({
          store_name: storeName,
          store_url: storeUrl,
          access_token: accessToken,
          refresh_token: refreshToken || null,
          token_expires_at: expiresAt,
          is_active: true,
          updated_at: new Date().toISOString(),
        }).eq("id", existing.id);
      } else {
        await supabase.from("stores").insert({
          store_id: sallaStoreId,
          platform: "salla",
          store_name: storeName,
          store_url: storeUrl,
          access_token: accessToken,
          refresh_token: refreshToken || null,
          token_expires_at: expiresAt,
          is_active: true,
        });
      }

      console.log(`[salla-auth] store authorized: ${storeName} (${sallaStoreId})`);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ── EVENT B: order.created / order.updated ──
    if (event === "order.created" || event === "order.updated" || event === "order.status.updated") {
      const order = body.data || body;
      if (!order || !order.id) {
        return new Response(JSON.stringify({ success: false, error: "Missing order data" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Find the connected store for this merchant
      const { data: store } = await supabase
        .from("stores")
        .select("id, user_id")
        .eq("store_id", merchantId)
        .eq("platform", "salla")
        .eq("is_active", true)
        .single();

      if (!store || !store.user_id) {
        console.log(`[salla-auth] order ${order.id} skipped — store not linked to user`);
        return new Response(JSON.stringify({ success: true, skipped: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const orderData = {
        user_id: store.user_id,
        store_id: store.id,
        external_id: String(order.id),
        amount: order.amounts?.total?.amount || order.total || 0,
        status: mapSallaStatus(order.status?.name || order.status || ""),
        customer_name: order.customer?.first_name ||
          `${order.customer?.first_name || ""} ${order.customer?.last_name || ""}`.trim() ||
          "Salla Customer",
        created_at: order.date?.date || order.created_at || new Date().toISOString(),
      };

      // Upsert by external_id (deduplicates)
      const { error } = await supabase.from("orders").upsert(orderData, {
        onConflict: "external_id",
      });

      if (error) {
        console.error(`[salla-auth] order upsert failed:`, error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.log(`[salla-auth] order ${order.id} upserted`);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Unknown event — acknowledge to avoid retries
    console.log(`[salla-auth] unhandled event: ${event}`);
    return new Response(JSON.stringify({ success: true, unhandled: event }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[salla-auth] webhook error:", err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
});

function mapSallaStatus(sallaStatus: string): string {
  const map: Record<string, string> = {
    "\u062A\u0645 \u0627\u0644\u0634\u062D\u0646": "Delivered",
    "\u0645\u0643\u062A\u0645\u0644": "Delivered",
    "\u0645\u0644\u063A\u064A": "Returned",
    "\u0645\u0631\u062A\u062C\u0639": "Returned",
    "\u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629": "Pending",
    "\u062C\u062F\u064A\u062F": "Pending",
  };
  return map[sallaStatus] || "Pending";
}