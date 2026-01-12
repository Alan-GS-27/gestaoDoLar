import { serve } from "https://deno.land/std@0.214.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type InvitePayload = {
  email: string;
  household_id: string;
  redirect_to?: string;
  access_token?: string;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed." }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  const url = Deno.env.get("PROJECT_URL");
  const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

  if (!url || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ error: "Missing Supabase env vars." }),
      { status: 500, headers: corsHeaders },
    );
  }

  const body = (await req.json().catch(() => null)) as InvitePayload | null;

  const headerToken =
    req.headers.get("authorization") ?? req.headers.get("Authorization");
  const token = headerToken?.replace("Bearer ", "") ?? body?.access_token ?? "";
  if (!token) {
    return new Response(JSON.stringify({ error: "Missing auth token." }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  const supabase = createClient(url, serviceRoleKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) {
    return new Response(JSON.stringify({ error: "Invalid user." }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  if (!body?.email || !body?.household_id) {
    return new Response(JSON.stringify({ error: "Invalid payload." }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const redirectTo =
    body.redirect_to ?? `${url.replace(/\/$/, "")}/aceitar-convite`;

  const { data: membership } = await supabase
    .from("household_members")
    .select("id")
    .eq("household_id", body.household_id)
    .eq("user_id", authData.user.id)
    .eq("ativo", true)
    .maybeSingle();

  if (!membership) {
    return new Response(JSON.stringify({ error: "Not allowed." }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  let invitedUserId: string | null = null;

  const { data: existingUser, error: existingError } =
    await supabase.auth.admin.getUserByEmail(body.email);

  if (!existingError && existingUser?.user) {
    invitedUserId = existingUser.user.id;
  } else {
    const { data: invited, error: inviteError } =
      await supabase.auth.admin.inviteUserByEmail(body.email, {
        redirectTo,
      });

    if (inviteError || !invited?.user) {
      return new Response(
        JSON.stringify({ error: inviteError?.message ?? "Invite failed." }),
        { status: 400, headers: corsHeaders },
      );
    }

    invitedUserId = invited.user.id;
  }

  if (!invitedUserId) {
    return new Response(JSON.stringify({ error: "User not found." }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { error: upsertError } = await supabase
    .from("household_members")
    .upsert(
      {
        household_id: body.household_id,
        user_id: invitedUserId,
        ativo: false,
        papel: "membro",
      },
      { onConflict: "household_id,user_id" },
    );

  if (upsertError) {
    return new Response(JSON.stringify({ error: upsertError.message }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  return new Response(
    JSON.stringify({ ok: true, user_id: invitedUserId }),
    { status: 200, headers: corsHeaders },
  );
});
