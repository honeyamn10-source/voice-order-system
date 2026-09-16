<p align="center">
  <img src="https://github.com/honeyamn10-source/honeyamn10-source/raw/main/assets/voice-order-system.svg" alt="Voice Order System" width="100%" />
</p>

<h1 align="center">Voice Order System</h1>

<p align="center">
  <b>Conversational ordering over the phone — powered by the browser's native speech engine.</b>
  <br />
  <em>Collect pickup orders through a natural voice conversation, backed by an AI model and persisted to Supabase.</em>
</p>

<p align="center">
  <a href="https://github.com/honeyamn10-source/voice-order-system/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
  <a href="https://github.com/honeyamn10-source/voice-order-system"><img src="https://img.shields.io/badge/version-0.1.0-blue.svg" alt="Version"></a>
  <a href="https://github.com/honeyamn10-source/voice-order-system/actions/workflows/blank.yml"><img src="https://img.shields.io/badge/CI-passing-brightgreen.svg" alt="CI"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/node.js-22.x-339933.svg" alt="Node.js 22"></a>
</p>

---

A browser voice-order prototype that turns a phone call into a guided conversation. **Alex** — an AI assistant — collects the order item-by-item through speech recognition (Web Speech API), confirms the details aloud via speech synthesis, and saves the structured order to a Supabase database.

> **Stage:** Prototype requiring deployment setup and end-to-end validation.

## ✨ Features

- 🎙️ **Full voice loop** — Speech → AI → Speech, no typing required
- 🔁 **Guided order flow** — collects items, name, phone and pickup time one field per turn
- 🧠 **Model fallback** — OpenRouter with Mistral Nemo (and automatic fallback)
- 💾 **Structured persistence** — orders saved to Supabase when `[SAVE_ORDER:{...}]` is detected
- 📊 **Dashboard-ready** — `recent_orders` and `daily_summary` views for reporting
- ⚡ **Zero-cost backend checks** — CI validates syntax and request handling with mocked responses

## 🚀 How it works

```
User speaks
    │  Web Speech API (browser built-in)
    ▼
Text sent to Vercel /api/converse
    │  OpenRouter → Mistral Nemo (with model fallback)
    ▼
Alex's reply text returned
    │  If [SAVE_ORDER:{...}] detected → Supabase insert
    ▼
Reply text spoken aloud via SpeechSynthesis API
    │  Mic re-activates automatically
    ▼
Repeat until order saved
```

### Order flow

Alex collects the order in four guided turns:

1. **Items** — pizza / burger / salad
2. **Customer name**
3. **Phone number**
4. **Pickup time** → confirms → saves to Supabase → call ends

## 📁 Repository layout

```
voice-order-system/
├── index.html              ← Frontend (deploy to GitHub Pages)
├── api/
│   └── converse.js         ← Backend handler (deploy to Vercel)
├── converse.js             ← Shared backend logic
├── vercel.json             ← Vercel configuration (auto-detected)
├── supabase_schema.sql     ← Run once in the Supabase SQL editor
├── tests/                  ← Node.js test suite (mocked model)
└── .github/workflows/      ← CI checks
```

## 🧪 Local checks

Requires **Node.js 22**.

```bash
npm run check     # syntax check for all server handlers
npm test          # handler tests with a mocked model response
```

No API keys or database are required for the checks — live speech recognition, model access and order persistence still need deployment acceptance testing.

## ☁️ Deployment

### Step 1 — Supabase

1. Go to [supabase.com](https://supabase.com) → your project → **SQL Editor**
2. Paste the contents of `supabase_schema.sql` and click **Run**
3. Go to **Settings → API** and copy the **Project URL** and the **anon / public key**

### Step 2 — Vercel (backend)

1. Push this repository to GitHub
2. New project at [vercel.com](https://vercel.com) → import the repository
3. Add the environment variables:

   | Variable             | Value                                  |
   | -------------------- | -------------------------------------- |
   | `OPENROUTER_API_KEY` | Your key from [openrouter.ai](https://openrouter.ai) |
   | `SUPABASE_URL`       | Your Supabase project URL              |
   | `SUPABASE_ANON_KEY`  | Your Supabase anon key                 |

4. Deploy and copy your Vercel URL (e.g. `https://myshop.vercel.app`)

### Step 3 — Frontend (GitHub Pages)

1. Open `index.html`
2. Find `const BACKEND = 'https://YOUR-PROJECT.vercel.app/api/converse';`
3. Replace it with your actual Vercel URL
4. Push to your GitHub Pages repository and enable Pages
5. Visit your GitHub Pages URL to test the conversation

## 📊 Dashboard queries

```sql
-- Recent orders
SELECT * FROM recent_orders;

-- Daily summary
SELECT * FROM daily_summary;
```

## ⚠️ Voice support

The frontend relies on browser speech recognition and speech synthesis. Availability and microphone permissions vary by browser and device — verify recognition, playback, and saved orders on your target devices. This project is a browser voice interface, **not** a verified telephone integration.

## 🛡️ Security

- No keys are stored client-side; backend keys live in Vercel environment variables
- Supabase Row Level Security should be enabled on production tables
- See [SECURITY.md](SECURITY.md) for the vulnerability reporting policy

## 🤝 Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) first, and review the [Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License

[MIT](LICENSE) © 2026 [Bittu Sharma](https://github.com/honeyamn10-source)