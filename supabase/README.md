# NHAI Supabase Setup

1. Open your Supabase project.
2. Go to SQL Editor.
3. Run `supabase/nhai-schema.sql`.
4. Add these values to the web app `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

5. Restart the Next.js dev server.

The mobile app still talks to the Next.js API. For a real phone, set the mobile coordinator URL to your computer or deployed web app:

```env
EXPO_PUBLIC_COORDINATOR_API_URL=http://192.168.1.25:4001
```

Do not put `SUPABASE_SERVICE_ROLE_KEY` in the mobile app.
