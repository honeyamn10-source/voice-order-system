# My Shop — Voice Agent · Deploy Guide

## File Structure
```
myshop/
├── index.html          ← Frontend (deploy to GitHub Pages)
├── api/
│   └── converse.js     ← Backend (deploy to Vercel)
├── vercel.json         ← Vercel config (auto-detected)
├── supabase_schema.sql ← Run once in Supabase SQL editor
└── README.md
```

---

## Step 1 — Supabase
1. Go to supabase.com → your project → SQL Editor
2. Paste the contents of `supabase_schema.sql` and click Run
3. Go to Settings → API and copy:
   - **Project URL** (looks like: https://xxxx.supabase.co)
   - **anon / public key**

---

## Step 2 — Vercel (Backend)
1. Push this whole folder to a GitHub repo
2. Go to vercel.com → New Project → import your repo
3. In **Environment Variables**, add:
   - `OPENROUTER_API_KEY`  → your key from openrouter.ai
   - `SUPABASE_URL`        → your Supabase project URL
   - `SUPABASE_ANON_KEY`   → your Supabase anon key
4. Deploy. Copy your Vercel URL (e.g. `https://myshop.vercel.app`)

---

## Step 3 — Frontend (GitHub Pages)
1. Open `index.html`
2. Find line: `const BACKEND = 'https://YOUR-PROJECT.vercel.app/api/converse';`
3. Replace with your actual Vercel URL
4. Push `index.html` to your GitHub Pages repo
5. Done — visit your GitHub Pages URL to test

---

## How It Works (Retell AI-style)
```
User speaks
    ↓ Web Speech API (browser built-in)
Text sent to Vercel /api/converse
    ↓ OpenRouter → Mistral Nemo (with model fallback)
Alex's reply text returned
    ↓ If [SAVE_ORDER:{...}] detected → Supabase insert
Reply text spoken aloud via SpeechSynthesis API
    ↓ Mic re-activates automatically
Repeat until order saved
```

## Order Flow
Alex collects in this order (one field per turn):
1. Items (pizza / burger / salad)
2. Customer name
3. Phone number
4. Pickup time
→ Confirms → saves to Supabase → call ends

## Dashboard Queries (for your dashboard pages)
```sql
-- Recent orders
SELECT * FROM recent_orders;

-- Daily summary
SELECT * FROM daily_summary;
```

## Voice Support
- Desktop: Chrome, Edge (full support)
- iOS Safari: works with audio unlock (handled automatically)
- Firefox: not supported (no SpeechRecognition API)
