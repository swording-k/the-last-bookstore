import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

const data = read('data.js');
const index = read('index.html');
const renderer = read('renderer.js');
const game = read('game.js');
const llm = read('llm.js');

assert.match(data, /id:\s*'b25'/, 'library should include the Holmes demo book');
assert.match(data, /title:\s*'福尔摩斯探案集'/, 'Holmes should be visible as a detective novel');
assert.match(data, /id:\s*'b01'[\s\S]*bookWorld:\s*\{[\s\S]*小王子[\s\S]*狐狸[\s\S]*玫瑰/, 'Little Prince should include a second configured book world');
assert.match(data, /detective:\s*\{[^}]*侦探推理/s, 'library should include a detective category');
assert.match(data, /bookWorld:\s*\{[\s\S]*夏洛克·福尔摩斯[\s\S]*华生医生[\s\S]*雷斯垂德探长/, 'Holmes should include a configured book world with three characters');
assert.match(data, /sceneImage:\s*'assets\/theater\/holmes-lab-generated\.png'/, 'Holmes theater should use an original generated lab background');
assert.match(data, /image:\s*'assets\/theater\/holmes-character\.png'/, 'Holmes should use an original generated character portrait');
assert.match(data, /sceneImage:\s*'assets\/theater\/b612-generated\.png'/, 'Little Prince theater should use an original generated B612 background');
assert.match(data, /sceneHotspots:\s*\[[\s\S]*试管[\s\S]*案卷/, 'Holmes theater should expose clickable investigative scene hotspots');

assert.ok(exists('booktheater.js'), 'booktheater.js should exist');
assert.ok(exists('assets/theater/holmes-lab-generated.png'), 'Generated Holmes lab background should exist in project assets');
assert.ok(exists('assets/theater/holmes-character.png'), 'Generated Holmes character image should exist in project assets');
assert.ok(exists('assets/theater/b612-generated.png'), 'Generated B612 background should exist in project assets');
assert.match(index, /src="booktheater\.js(?:\?[^"]*)?"/, 'index should load booktheater.js');
assert.match(index, /demo-open-theater/, 'demo toolbar should expose the theater shortcut');
assert.match(renderer, /dtl-theater/, 'book detail should expose the theater action');
assert.match(renderer, /BookTheater\.open/, 'book detail should open BookTheater');
assert.match(game, /openDemoTheater/, 'Game should expose a demo theater shortcut');
assert.match(llm, /chatWithBookCharacter/, 'LLM should expose book-character chat');

const theater = read('booktheater.js');
assert.match(theater, /var BookTheater\s*=/, 'BookTheater should be a global module');
assert.match(theater, /open:\s*function/, 'BookTheater should have an open entry point');
assert.match(theater, /promptCards/, 'BookTheater should render prompt cards');
assert.match(theater, /fallbackCharacterReply/, 'BookTheater should work without a live API key');
assert.match(theater, /圣巴塞洛缪医院实验室|贝克街 221B/, 'Theater should carry a strong visual scene identity');
assert.match(theater, /fox|rose|prince/, 'Theater fallback should include non-detective character voices');
assert.match(theater, /bt-character-model/, 'Theater should render a character model area');
assert.match(theater, /_figureHTML/, 'Theater should build visible character figures');
assert.match(theater, /bt-conversation-mode/, 'Theater should enter a roomier conversation mode after the player asks');
assert.match(theater, /bt-hotspots/, 'Theater should render clickable scene hotspots');
assert.match(theater, /bt-portrait/, 'Theater should render generated character portraits when configured');

const style = read('style.css');
assert.match(style, /bt-theme-b25[\s\S]*prop-a/, 'Holmes theater should include visible Baker Street scene props');
assert.match(style, /bt-theme-b01[\s\S]*prop-a/, 'Little Prince theater should include visible B612 scene props');
assert.match(style, /figure-holmes[\s\S]*fig-prop/, 'Holmes should have a distinct character figure');
assert.match(style, /figure-prince[\s\S]*figure-fox[\s\S]*figure-rose/, 'Little Prince characters should have distinct figures');
assert.match(style, /\.bt-layout[\s\S]*height:\s*390px/, 'Theater layout should reserve enough vertical space for readable dialogue');
assert.match(style, /\.bt-scene[\s\S]*height:\s*200px/, 'Theater scene should stay compact enough to leave room for chat');
assert.match(style, /\.bt-msg p[\s\S]*font-size:\s*16px/, 'Theater dialogue text should be presentation-readable');
assert.match(style, /\.bt-scene::before[\s\S]*background-image:\s*var\(--bt-scene-image\)/, 'Theater scene should support generated bitmap backgrounds');
assert.match(style, /\.bt-portrait[\s\S]*background-image:\s*var\(--bt-character-image\)/, 'Theater should support generated bitmap character portraits');
assert.match(style, /\.bt-stage\.bt-conversation-mode[\s\S]*\.bt-prompts[\s\S]*display:\s*none/, 'Conversation mode should hide prompt cards to give replies more room');
assert.match(style, /\.bt-stage\.bt-conversation-mode[\s\S]*\.bt-layout[\s\S]*height:\s*495px/, 'Conversation mode should make the chat area large enough for live replies');
assert.match(style, /@media \(max-width:\s*760px\)[\s\S]*\.bt-characters[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/, 'Narrow theater should keep character cards inside the viewport');
assert.match(style, /@media \(max-width:\s*760px\)[\s\S]*\.bt-prompts[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/, 'Narrow theater should wrap prompt cards instead of overflowing');
assert.match(style, /@media \(max-width:\s*760px\)[\s\S]*\.bt-immersive[\s\S]*padding:\s*0 14px 8px/, 'Narrow theater scene should be padded for the actual phone-sized judging viewport');

assert.match(index, /style\.css\?v=generated-theater2/, 'Index should version theater CSS so judges do not see stale cached layout');
assert.match(index, /booktheater\.js\?v=generated-theater2/, 'Index should version theater JS so judges do not see stale cached theater logic');

console.log('booktheater contract ok');
