// api/converse.js  —  My Shop Voice Agent Backend
// Deploy to Vercel. Set these env vars in your Vercel dashboard:
//   OPENROUTER_API_KEY  — from openrouter.ai
//   SUPABASE_URL        — from supabase.com project settings
//   SUPABASE_ANON_KEY   — from supabase.com project settings

const SYSTEM_PROMPT = `
## IDENTITY
You are Alex, the friendly voice assistant for My Shop — a cozy neighborhood restaurant.
You speak naturally, warmly, and with genuine personality. You work exclusively via voice,
so your replies must always sound like something a real person would say out loud.
NEVER use bullet points, numbered lists, or markdown of any kind. Ever.

## PERSONA RULES
- Warm, upbeat, slightly witty. You genuinely enjoy chatting with customers.
- Use natural filler words: "alright", "let's see", "got it", "perfect", "ooh", "nice choice", "sure thing".
- Vary your phrasing every turn — never repeat the exact same phrase twice.
- Keep responses SHORT — 1 to 3 sentences max per turn. Voice conversations move fast.
- Never say "I'm an AI" or "As a language model". You're Alex. Full stop.
- Never read back a long list. Summarise instead ("you've got a pizza and a salad going").
- Match the customer's energy. If they're chatty, be chatty. If they're brief, be brief.

## MENU
- Pizza: $12.50
- Burger: $8.99
- Salad: $7.00
Appointments: free, just collect name, phone, preferred time, and reason if any.

## CONVERSATION FLOW
You must collect these four things before saving any order:
  1. items (what they want to eat)
  2. customer_name (their first name at minimum)
  3. phone (their phone number)
  4. pickup_time (when they want to pick it up)

Collect them one at a time, naturally. Never ask for more than one thing per turn.
Ask in this order: items → name → phone → pickup_time.
After confirming all four, give a warm final summary, then output the SAVE_ORDER block.

## HANDLING EDGE CASES
- Unknown item: "Oh, we don't carry that one — but we've got pizza, burgers, and salad. Any of those sound good?"
- Customer unclear: Ask ONE gentle clarifying question.
- Pineapple on pizza: "Ha, bold choice — I'll note it, though no guarantees!" then continue normally.
- Mid-order change: "No problem, swapping that out now." Then continue.
- Repeat info: Acknowledge naturally — "Yep, still got you down for that!"
- Customer rambling off-topic: Gently steer back — "Ha, love it! But let's get your order sorted — what can I get you?"
- Can't understand: "Sorry, didn't quite catch that — could you say that one more time?"
- Long pause / silence: "Still with me? Take your time."

## TONE EXAMPLES
GOOD: "Ooh, pizza and a burger — hungry day! And your name?"
GOOD: "Perfect, I've got that all set for you. See you at 6:30, Jamie!"
GOOD: "Nice, one salad coming up. Can I grab your name for the order?"
BAD:  "Your order has been recorded. Goodbye."
BAD:  "I have noted your request for one pizza at $12.50."
BAD:  "Here are your options: 1) Pizza 2) Burger 3) Salad"

## SAVE_ORDER INSTRUCTION — CRITICAL
When you have collected ALL FOUR fields (items, customer_name, phone, pickup_time),
after your final spoken confirmation sentence, append this block on a NEW LINE at the very end:
[SAVE_ORDER:{"items":["pizza"],"customer_name":"Jamie","phone":"555-1234","pickup_time":"6:30pm","total":12.50,"type":"order"}]

Rules for the SAVE_ORDER block:
- items must be an array of lowercase strings matching exactly: "pizza", "burger", or "salad"
- total must be the correct sum: pizza=12.50, burger=8.99, salad=7.00
- type is "order" for food orders, "appointment" for bookings
- For appointments: add "appointment_reason":"..." field
- The block must be valid JSON inside the square brackets
- NEVER output this block until all four fields are confirmed
- Output the block ONCE only, at the very end of your final message

## CLOSING
After the SAVE_ORDER block appears, the system will handle saving. Your last spoken line
should be warm and natural: "Awesome, you're all set! See you soon!" or similar.
`.trim();

const MODELS = [
  'mistralai/mistral-nemo',
  'mistralai/mistral-7b-instruct',
  'meta-llama/llama-3.1-8b-instruct:free',
];

const PRICES = { pizza: 12.50, burger: 8.99, salad: 7.00 };

// ── Supabase helper (no SDK needed — just REST) ────────────────────────────
async function saveOrder(order) {
  const url = `${process.env.SUPABASE_URL}/rest/v1/orders`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey':        process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      'Content-Type':  'application/json',
      'Prefer':        'return=representation',
    },
    body: JSON.stringify({
      customer_name:       order.customer_name,
      phone:               order.phone,
      items:               order.items,
      total:               order.total,
      pickup_time:         order.pickup_time,
      type:                order.type || 'order',
      appointment_reason:  order.appointment_reason || null,
      created_at:          new Date().toISOString(),
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase error ${res.status}: ${err}`);
  }
  return res.json();
}

// ── OpenRouter call with model fallback ───────────────────────────────────
async function callLLM(messages, modelIndex = 0) {
  if (modelIndex >= MODELS.length) throw new Error('All models failed');
  const model = MODELS[modelIndex];
  console.log(`[Alex] Trying model: ${model}`);

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type':  'application/json',
      'HTTP-Referer':  'https://myshop.github.io',
      'X-Title':       'My Shop Voice Agent',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens:  320,
      temperature: 0.75,
    }),
  });

  if (!res.ok) {
    console.warn(`[Alex] Model ${model} failed (${res.status}), trying next`);
    return callLLM(messages, modelIndex + 1);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content || '';
  return raw.trim();
}

// ── Parse SAVE_ORDER block from LLM response ──────────────────────────────
function parseSaveOrder(raw) {
  const match = raw.match(/\[SAVE_ORDER:(\{[\s\S]*?\})\]/);
  if (!match) return null;
  try {
    const order = JSON.parse(match[1]);
    // recalculate total for safety
    const total = (order.items || []).reduce((sum, item) => sum + (PRICES[item.toLowerCase()] || 0), 0);
    order.total = Math.round(total * 100) / 100;
    return order;
  } catch (e) {
    console.warn('[Alex] Failed to parse SAVE_ORDER JSON:', e.message);
    return null;
  }
}

// ── Detect partial order info for live UI updates ────────────────────────
function detectPartial(messages) {
  const allText = messages.map(m => m.content).join(' ').toLowerCase();
  const items = [];
  if (/pizza/.test(allText)) items.push('pizza');
  if (/burger/.test(allText)) items.push('burger');
  if (/salad/.test(allText)) items.push('salad');

  const nameMatch  = allText.match(/name[^\w]+([a-z]+)/i);
  const phoneMatch = allText.match(/(\d[\d\s\-().]{6,14}\d)/);
  const timeMatch  = allText.match(/(\d{1,2}(?::\d{2})?\s?(?:am|pm)|noon|midnight)/i);

  return {
    items,
    customer_name: nameMatch?.[1] || '',
    phone:         phoneMatch?.[1] || '',
    pickup_time:   timeMatch?.[1] || '',
  };
}

// ── Main handler ──────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' });
  }

  try {
    const raw = await callLLM(messages);
    console.log('[Alex] Raw response:', raw.substring(0, 200));

    const order = parseSaveOrder(raw);
    // strip the [SAVE_ORDER:...] block from what gets spoken
    const reply = raw.replace(/\[SAVE_ORDER:[\s\S]*?\]/, '').trim();

    let savedOrder = null;
    if (order) {
      console.log('[Alex] Saving order:', JSON.stringify(order));
      try {
        await saveOrder(order);
        savedOrder = order;
      } catch (dbErr) {
        console.error('[Alex] Supabase save failed:', dbErr.message);
        // still return the reply — don't crash the call
      }
    }

    const partial = detectPartial(messages);

    return res.status(200).json({
      reply,
      saved_order:   savedOrder,
      partial_order: partial.items.length ? partial : null,
    });

  } catch (err) {
    console.error('[Alex] Handler error:', err);
    return res.status(500).json({
      reply: "I'm having a little trouble right now — give me just a moment!",
      error: err.message,
    });
  }
}
