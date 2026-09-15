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
    [{ method: 'POST', body: { messages: [] } }, 400],
  ]) {
    const res = response();
    await handler(req, res);
    assert.equal(res.statusCode, status);
    assert.ok(res.body.error);
  }
});

test('oversized conversations are rejected', async () => {
  const res = response();
  const messages = Array.from({ length: 25 }, () => ({ role: 'user', content: 'x' }));
  await handler({ method: 'POST', body: { messages } }, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /too many messages/);
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

test('saves a validated order and echoes it back', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url) => {
    if (url.startsWith('https://openrouter.ai')) {
      return { ok: true, json: async () => ({
        choices: [{
          message: {
            content: 'Order set! [SAVE_ORDER:{"items":["Pizza","burger"],"customer_name":"Jamie","phone":"555-1234","pickup_time":"6:30pm"}]',
          },
        }],
      }) };
    }
    if (url.includes('/rest/v1/orders')) {
      return { ok: true, json: async () => ([{ id: 1 }]) };
    }
    throw new Error(`unexpected URL: ${url}`);
  });
  const res = response();
  await handler({ method: 'POST', body: {
    messages: [{ role: 'user', content: 'pizza and burger, name Jamie, 555-1234, 6:30pm' }],
  } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.reply, 'Order set!', 'SAVE_ORDER block must be stripped');
  assert.deepEqual(res.body.saved_order.items, ['pizza', 'burger'], 'items lowercased + validated');
  assert.equal(res.body.saved_order.total, 21.49);
});

test('rejects orders with no menu items', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: true, json: async () => ({
      choices: [{ message: { content: 'Done [SAVE_ORDER:{"items":["totally-unknown"],"total":999}]' } }],
    }),
  }));
  const res = response();
  await handler({ method: 'POST', body: {
    messages: [{ role: 'user', content: 'hi' }],
  } }, res);
  assert.equal(res.body.saved_order, null, 'invalid order is not saved');
});
