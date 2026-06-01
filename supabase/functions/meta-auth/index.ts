import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const META_APP_ID = Deno.env.get("META_APP_ID")!;
const META_APP_SECRET = Deno.env.get("META_APP_SECRET")!;
const REDIRECT_URI = "https://wljecfqzxvojsypqbkzp.supabase.co/functions/v1/meta-auth/callback";
const APP_URL = "https://ecommerce-profitability-calculator.vercel.app";

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // ── Route A: GET /meta-auth/connect ──
  if (req.method === "GET" && path.endsWith("/connect")) {
    const userId = url.searchParams.get("user_id");
    if (!userId) return new Response("Missing user_id", { status: 400 });

    const metaUrl =
      `https://www.facebook.com/v18.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${userId}&scope=ads_read,ads_management,business_management&response_type=code`;

    return Response.redirect(metaUrl, 302);
  }

  // ── Route B: GET /meta-auth/callback ──
  if (req.method === "GET" && path.endsWith("/callback")) {
    const code = url.searchParams.get("code");
    const userId = url.searchParams.get("state");

    if (!code || !userId) return new Response("Missing code or state", { status: 400 });

    // Exchange code for short-lived access token
    const tokenParams = new URLSearchParams({
      client_id: META_APP_ID,
      client_secret: META_APP_SECRET,
      redirect_uri: REDIRECT_URI,
      code,
    });

    const tokenRes = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?${tokenParams.toString()}`
    );

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return new Response(JSON.stringify(tokenData), { status: 400 });
    }

    // Exchange for long-lived token
    const longTokenRes = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&fb_exchange_token=${tokenData.access_token}`
    );

    const longTokenData = await longTokenRes.json();
    const accessToken = longTokenData.access_token || tokenData.access_token;
    const expiresIn = longTokenData.expires_in || 5184000; // ~60 days

    const supabase = getSupabase();

    await supabase.from("meta_connections").upsert(
      {
        user_id: userId,
        access_token: accessToken,
        token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
        created_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    return Response.redirect(`${APP_URL}/integrations?meta=connected`, 302);
  }

  // ── Route C: POST /meta-auth/sync-ads ──
  if (req.method === "POST" && path.endsWith("/sync-ads")) {
    const body = await req.json();
    const userId = body.user_id;

    if (!userId) return new Response(JSON.stringify({ error: "Missing user_id" }), { status: 400 });

    const supabase = getSupabase();

    const { data: conn } = await supabase
      .from("meta_connections")
      .select("access_token")
      .eq("user_id", userId)
      .single();

    if (!conn?.access_token) {
      return new Response(JSON.stringify({ error: "Meta not connected" }), { status: 400 });
    }

    const token = conn.access_token;

    // Fetch ad accounts
    const accountsRes = await fetch(
      `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name&access_token=${token}`
    );
    const accountsData = await accountsRes.json();
    const accounts = accountsData.data || [];

    if (accounts.length === 0) {
      return new Response(JSON.stringify({ success: true, campaigns: 0, message: "No ad accounts found" }), { status: 200 });
    }

    let syncedCount = 0;

    for (const account of accounts) {
      try {
        const insightsRes = await fetch(
          `https://graph.facebook.com/v18.0/${account.id}/insights?fields=campaign_name,spend,impressions,clicks,actions&date_preset=last_30d&access_token=${token}`
        );
        const insightsData = await insightsRes.json();
        const campaigns = insightsData.data || [];

        for (const campaign of campaigns) {
          const actions = campaign.actions || [];
          const purchaseAction = actions.find(
            (a: { action_type: string }) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase"
          );
          const revenue = purchaseAction ? parseFloat(purchaseAction.value) || 0 : 0;

          await supabase.from("campaigns").upsert(
            {
              user_id: userId,
              name: campaign.campaign_name || "Meta Campaign",
              platform: "meta",
              spend: parseFloat(campaign.spend) || 0,
              revenue,
              impressions: parseInt(campaign.impressions) || 0,
              clicks: parseInt(campaign.clicks) || 0,
              orders_count: purchaseAction ? parseInt(purchaseAction.value) || 0 : 0,
            },
            { onConflict: "user_id,name,platform" }
          );

          syncedCount++;
        }
      } catch (err) {
        console.error(`[meta-auth] Failed to sync account ${account.id}:`, err);
      }
    }

    return new Response(
      JSON.stringify({ success: true, campaigns: syncedCount, accounts: accounts.length }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response("Not found", { status: 404 });
});