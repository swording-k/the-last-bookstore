import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

process.env.MINIMAX_API_KEY = 'test-only-key';
delete process.env.MINIMAX_API_BASE;
delete process.env.MINIMAX_MODEL;

const require = createRequire(import.meta.url);
const handler = require('../api/chat.js');

function responseMock() {
  return {
    statusCode: 200,
    headers: {},
    chunks: [],
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; this.ended = true; return this; },
    write(chunk) { this.chunks.push(Buffer.from(chunk)); },
    end() { this.ended = true; return this; }
  };
}

let forwarded;
global.fetch = async (url, options) => {
  forwarded = { url, options, body: JSON.parse(options.body) };
  return new Response('data: {"choices":[{"delta":{"content":"你好"}}]}\n\ndata: [DONE]\n\n', {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' }
  });
};

const res = responseMock();
await handler({
  method: 'POST',
  body: {
    model: 'attacker-selected-model',
    messages: [{ role: 'user', content: '测试' }],
    stream: true,
    temperature: 0.7
  }
}, res);

assert.equal(forwarded.url, 'https://api.minimaxi.com/v1/chat/completions');
assert.equal(forwarded.options.headers.Authorization, 'Bearer test-only-key');
assert.equal(forwarded.body.model, 'MiniMax-M2.5-highspeed', 'server must control the model');
assert.equal(forwarded.body.reasoning_split, true, 'reasoning must be separated from player-visible dialogue');
assert.deepEqual(forwarded.body.messages, [{ role: 'user', content: '测试' }]);
assert.equal(res.statusCode, 200);
assert.equal(res.headers['content-type'], 'text/event-stream; charset=utf-8');
assert.match(Buffer.concat(res.chunks).toString(), /你好/);

const bad = responseMock();
await handler({ method: 'POST', body: { messages: [] } }, bad);
assert.equal(bad.statusCode, 400);

console.log('api chat proxy ok');
