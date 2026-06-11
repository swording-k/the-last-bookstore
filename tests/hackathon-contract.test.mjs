import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function stripTags(html) {
  return html.replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const indexText = stripTags(read('index.html'));
const dataText = read('data.js');
const allPublicSource = [
  'index.html',
  'data.js',
  'game.js',
  'renderer.js',
  'engine.js',
  'ai.js',
  'llm.js',
  'README.md',
  'docs/AI-CREATION.md',
  'docs/DEV.md'
].map(read).join('\n');

assert.match(indexText, /数字世界|云端|服务器|大断联/, 'title screen should establish the digital collapse premise');
assert.match(indexText, /最后一间书店|最后的书店/, 'title screen should make the last-bookstore premise explicit');
assert.match(dataText, /数字世界|云端|服务器|大断联/, 'day narratives should carry the premise into gameplay');
assert.doesNotMatch(allPublicSource, /sk-[A-Za-z0-9_-]{16,}/, 'public source should not contain hard-coded API keys');

console.log('hackathon contract ok');
