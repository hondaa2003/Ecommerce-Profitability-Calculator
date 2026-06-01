import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SALLA_CLIENT_ID = Deno.env.get("SALLA_CLIENT_ID")!;
const SALLA_CLIENT_SECRET = Deno.env.get("SALLA_CLIENT_SECRET")!;
const APP_URL = Deno.env.get("APP_URL")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-salla-event",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method === "GET") {
    return new Response("Salla Easy Mode Webhook — POST only", {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const eventType = req.headers.get("X-Salla-Event") || "";

  try {
    const body = await req.json();
    const event = body.event || eventType || "";
    const merchantId = String(body.merchant || "");

    console.log(`[salla-auth] event=${event} merchant=${merchantId}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── EVENT A: app.store.authorize (Easy Mode — token sent directly on install) ──
    if (event === "app.store.authorize") {
      const accessToken = body.access_token || body.data?.access_token || "";
      const refreshToken = body.refresh_token || body.data?.refresh_token || "";
      const expiresIn = body.expires_in || body.data?.expires_in || 1209600;

      if (!accessToken) {
        console.error("[salla-auth] Missing access_token in authorize webhook");
        return new Response(JSON.stringify({ success: false, error: "Missing access_token" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

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
        } else {
          console.warn(`[salla-auth] Store info API returned status ${storeRes.status}`);
        }
      } catch (err) {
        console.warn("[salla-auth] Could not fetch store info:", err);
      }

      const expiresAt = expiresIn
        ? new Date(Date.now() + expiresIn * 1000).toISOString()
        : null;

      const { data: existing } = await supabase
        .from("stores")
        .select("id")
        .eq("store_id", sallaStoreId)
        .eq("platform", "salla")
        .maybeSingle();

      if (existing) {
        const { error: updateErr } = await supabase
          .from("stores")
          .update({
            store_name: storeName,
            store_url: storeUrl,
            access_token: accessToken,
            refresh_token: refreshToken || null,
            token_expires_at: expiresAt,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (updateErr) {
          console.error("[salla-auth] Failed to update store:", updateErr);
        }
      } else {
        const { error: insertErr } = await supabase
          .from("stores")
          .insert({
            store_id: sallaStoreId,
            platform: "salla",
            store_name: storeName,
            store_url: storeUrl,
            access_token: accessToken,
            refresh_token: refreshToken || null,
            token_expires_at: expiresAt,
            is_active: true,
            user_id: null,
          });

        if (insertErr) {
          console.error("[salla-auth] Failed to insert store:", insertErr);
        }
      }

      console.log(`[salla-auth] store authorized: ${storeName} (${sallaStoreId})`);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── EVENT B: app.store.uninstall ──
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

    // ── EVENT C: order.created / order.updated / order.status.updated ──
    if (
      event === "order.created" ||
      event === "order.updated" ||
      event === "order.status.updated"
    ) {
      const order = body.data || body;

      if (!order || !order.id) {
        console.warn("[salla-auth] Missing order data in webhook");
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

      if (!store) {
        console.log(`[salla-auth] order ${order.id} skipped — store not found for merchant ${merchantId}`);
        return new Response(JSON.stringify({ success: true, skipped: "store not found" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!store.user_id) {
        console.log(`[salla-auth] order ${order.id} skipped — store not yet linked to a user`);
        return new Response(JSON.stringify({ success: true, skipped: "store not linked to user" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const amount = typeof order.amounts?.total?.amount === "number"
        ? order.amounts.total.amount
        : Number(order.total) || 0;

      const statusName = order.status?.name || "";
      const mappedStatus = mapSallaStatus(statusName);

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
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log(`[salla-auth] order ${order.id} upserted (status=${mappedStatus})`);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Unknown event — acknowledge to prevent Salla retries ──
    console.log(`[salla-auth] unhandled event: ${event}`);
    return new Response(JSON.stringify({ success: true, unhandled: event }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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