import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const llm = read('llm.js');
assert.ok(fs.existsSync(path.join(root, 'api/chat.js')), 'MiniMax server proxy should exist at api/chat.js');
const api = read('api/chat.js');
const gitignore = read('.gitignore');

assert.match(llm, /['"]\/api\/chat['"]/, 'browser AI transport should use the same-origin server proxy');
assert.doesNotMatch(llm, /dashscope|qwen-plus|api\.minimax\.io/i, 'browser code should not call an AI provider directly');
assert.match(api, /process\.env\.MINIMAX_API_KEY/, 'server proxy should read the MiniMax key from a server-only environment variable');
assert.match(api, /https:\/\/api\.minimaxi\.com\/v1\/chat\/completions/, 'server proxy should call the official MiniMax China OpenAI-compatible endpoint');
assert.match(api, /MiniMax-M2\.5-highspeed/, 'server proxy should use an available low-latency MiniMax model for the game');
assert.match(api, /reasoning_split:\s*true/, 'server proxy should keep model reasoning out of player-visible dialogue');
assert.match(api, /text\/event-stream/, 'server proxy should preserve streaming responses');
assert.ok(gitignore.includes('.env.local'), 'local MiniMax secrets must be gitignored');

const publicFiles = ['llm.js', 'game.js', 'renderer.js', 'booktheater.js', 'mystore.js', 'index.html', 'api/chat.js'];
const publicSource = publicFiles.map(read).join('\n');
assert.doesNotMatch(publicSource, /sk-(?:api-)?[A-Za-z0-9_-]{16,}/, 'public source must not contain API keys');

console.log('minimax contract ok');
