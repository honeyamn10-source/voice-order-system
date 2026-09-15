import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/converse.js';

function response() {
  return {
    statusCode: 200, headers: {}, body: undefined,
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    end() { return this; },
  };
}

test('preflight is accepted without contacting providers', async () => {
  const res = response();
  await handler({ method: 'OPTIONS' }, res);
  assert.equal(res.statusCode, 200);
  assert.match(res.headers['Access-Control-Allow-Methods'], /POST/);
});

test('unsupported methods and missing messages are rejected', async () => {
  for (const [req, status] of [
    [{ method: 'GET' }, 405],
    [{ method: 'POST', body: {} }, 400],
  ]) {
    const res = response();
    await handler(req, res);
    assert.equal(res.statusCode, status);
    assert.ok(res.body.error);
  }
});

test('API entry point returns a conversation response', async (t) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, payload: JSON.parse(options.body) });
    return { ok: true, json: async () => ({
      choices: [{ message: { content: 'What would you like to order?' } }],
    }) };
  });
  const res = response();
  await handler({ method: 'POST', body: {
    messages: [{ role: 'user', content: 'Hello' }],
  } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.reply, 'What would you like to order?');
  assert.equal(res.body.saved_order, null);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://openrouter.ai/api/v1/chat/completions');
  assert.equal(calls[0].payload.messages.at(-1).content, 'Hello');
});
