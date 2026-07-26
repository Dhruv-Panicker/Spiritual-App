// Broadcast a push notification to all registered devices.
// Admin-only: the caller's JWT is checked against public.is_admin() before
// any tokens are read. Tokens never leave the server — this replaces the old
// flow where the admin's phone downloaded every user's push token.
//
// Body: { title: string, body: string, data?: object, excludeToken?: string }
// Response: { sent: number, total: number }

import { createClient } from 'jsr:@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const CHUNK_SIZE = 100;

Deno.serve(async (req) => {
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    // Verify the caller is an admin using their own JWT (RLS-scoped client)
    const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: isAdmin, error: adminError } = await userClient.rpc('is_admin');
    if (adminError || isAdmin !== true) {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { title, body, data, excludeToken } = await req.json();
    if (!title || !body) {
      return Response.json({ error: 'title and body are required' }, { status: 400 });
    }

    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: rows, error } = await admin.from('push_tokens').select('token');
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const tokens = (rows ?? [])
      .map((r) => r.token as string)
      .filter((t) => t && t !== excludeToken);

    let sent = 0;
    for (let i = 0; i < tokens.length; i += CHUNK_SIZE) {
      const messages = tokens.slice(i, i + CHUNK_SIZE).map((to) => ({
        to,
        sound: 'default',
        title,
        body,
        data: { ...(data ?? {}), timestamp: new Date().toISOString() },
      }));
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(messages),
      });
      const json = await res.json();
      if (Array.isArray(json.data)) {
        sent += json.data.filter((item: { status: string }) => item.status === 'ok').length;
      }
    }

    return Response.json({ sent, total: tokens.length });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
});
