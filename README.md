# YourBite

Vite + React port of the YourBite calorie/training tracker, wired up to Supabase for
magic-link sign-in and per-user data storage, with AI calls proxied through a Supabase
Edge Function so no API key ships to the browser.

## One-time Supabase setup

1. **Database tables** — already created in your project (`profiles`, `daily_status`,
   `meal_logs`, `exercise_logs`, `food_cache`, `training_plans`, `trainer_chat_messages`).
   [`supabase/schema.sql`](supabase/schema.sql) is a reference copy for setting up a
   fresh project later — no need to run it again here.
2. **Email magic link** — in the dashboard under Authentication > Providers, the Email
   provider is on by default and already supports magic links (no SMTP setup needed).
3. **AI proxy Edge Function** — deploy `supabase/functions/ai-proxy` and give it your
   Anthropic key as a secret (requires the [Supabase CLI](https://supabase.com/docs/guides/cli)):
   ```bash
   supabase login
   supabase link --project-ref ahyyxbebvelzkulyzvig
   supabase functions deploy ai-proxy
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
   ```

## Local development

```bash
npm install
npm run dev
```

`.env.local` already has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` filled in.
Sign in with your own email, confirm the flow works, and check the `user_data` table
in Supabase's Table Editor to see it saving.

## Deploying to Netlify

Push this repo to GitHub, connect it in Netlify, and add these two environment
variables under Site configuration > Environment variables before deploying:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

(same values as `.env.local`)
