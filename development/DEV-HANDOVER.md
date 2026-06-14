# 接手开发指南 — 给 Codex / Workbuddy / 其他 agent

> **目的**：让一个**没玩过这个游戏**的 AI agent 能在 6 小时内完成「我的书店」功能。
> 
> **目标工程**：`/Users/baojian/Desktop/the-last-bookstore/`
> 
> **核心改动**：新增 `mystore.js` + 改 5 个现有文件
> 
> **配套计划**：`PLAN-mystore.md`（先看那个）

---

## 0. 必读：30 秒理解这个游戏

《最后的书店》是一个**纯前端 web 叙事游戏**：
- 玩家扮演橡木镇唯一还在营业的书店老板
- 7 天剧情，每天接待 1-3 个 NPC
- 每个 NPC 带着自己的故事，玩家通过 3 选项 + AI 自由对话**听懂** TA
- 然后从 24 本书里选 1 本推荐给 TA
- 选对了（bestMatch）= 完美匹配，hope 涨得多
- 7 天后触发 4 种结局之一

**代码组成**（**全部 var/global，不模块化**）：
- `index.html` — 入口 + DOM 骨架
- `engine.js` — `Engine` 全局对象，状态机 + 存档
- `game.js` — `Game` 全局对象，主控制器
- `renderer.js` — `Renderer` 全局对象，DOM 渲染
- `data.js` — `GameData` 全局常量，24 本书 + 6 NPC + 4 结局
- `llm.js` — `LLM` IIFE，封装阿里云百炼 API
- `ai.js` — `AI` 全局对象，模板 + 降级
- `audio.js` — `AudioManager` 全局对象，BGM/SFX
- `scene.js` — `SceneFX` 全局对象，背景/光影动画
- `style.css` — 单一 CSS 文件

**所有 JS 用 `var`，没有 ES module。** 所以新模块**必须挂在 window**。

---

## 1. 接手前 3 件事

### 1.1 备份
```bash
cp -r /Users/baojian/Desktop/the-last-bookstore /Users/baojian/Desktop/the-last-bookstore_backup_v6
```

### 1.2 启动本地服务
```bash
cd /Users/baojian/Desktop/the-last-bookstore && python3 -m http.server 9876
# 打开 http://127.0.0.1:9876/index.html
```

### 1.3 玩通一遍
推开门 → 接待林月 → 选"喝水" → 选"静静地等待" → 选"已经做得够好了" → 选"也许一本书能给你一些力量" → 推荐一本书。**只玩 1 天就够**——你只需要理解循环。

---

## 2. 关键代码位置（要改的 5 个文件）

### 2.1 `engine.js` — 加一个 state 字段

**位置**：`Engine.state` 对象（约第 10 行）

**改动**：
```javascript
state: {
    day: 1,
    hope: 50,
    // ... 现有字段
    bookLog: [],
    flags: {},
    diary: '',
    mylist: []   // 🆕 新增：我标记"想读"的书
}
```

**为什么放这里**：现有 `Engine.save/load` 会自动存档它，**零额外成本**。

---

### 2.2 `index.html` — 加一个屏幕容器

**位置**：`<div id="ending-screen">` 之后

**改动**：加一个完整的 div
```html
<!-- 我的书店 -->
<div id="mystore-screen" class="screen mystore-screen hidden">
  <div class="mystore-bg">
    <!-- 装饰粒子、暖色背景 -->
  </div>
  <div class="mystore-content" id="mystore-content">
    <!-- 由 mystore.js 动态填充 -->
  </div>
</div>
```

**加载顺序**：在 `<script src="llm.js"></script>` 之后加 `<script src="mystore.js"></script>`

---

### 2.3 `mystore.js` — 🆕 全新文件（约 400 行）

**结构**：
```javascript
/* ============================================================
   mystore.js — 「我的书店」个人页模块
   
   挂载到 window.MyStore
   
   依赖：
   - Engine.state（读）
   - GameData.books（读）
   - LLM.generateReply（新加，下面会讲）
   - Renderer（用 showScreen / hideBookshelf 等方法）
   ============================================================ */

var MyStore = {
  
  /**
   * 主入口：打开个人页
   * 调用时机：游戏结局后，玩家点"查看我的书店"按钮
   */
  open: function() {
    // 1. 切换到 mystore screen
    Renderer.showScreen('mystore-screen');
    
    // 2. 渲染内容
    var state = Engine.state;
    var content = document.getElementById('mystore-content');
    content.innerHTML = this._buildHTML(state);
    
    // 3. 绑定交互
    this._bindInteractions(state);
    
    // 4. 播放暖色 BGM（复用现有 AudioManager）
    if (window.AudioManager) AudioManager.playBGM('morning');
  },
  
  /**
   * 渲染 HTML（返回字符串）
   */
  _buildHTML: function(state) {
    var stats = this._calcStats(state);
    var recommendedBooks = this._getRecommendedBooks(state);
    var mylist = this._getMylistBooks(state);
    var unplayedBooks = this._getUnplayedBooks(state, recommendedBooks, mylist);
    
    return ''
      + this._renderHeader(stats)
      + this._renderRecommendedSection(recommendedBooks)
      + this._renderMylistSection(mylist, unplayedBooks)
      + this._renderQuoteSection()
      + this._renderActions(state);
  },
  
  /**
   * 计算玩家游玩摘要
   */
  _calcStats: function(state) {
    return {
      days: state.daysCompleted || state.day - 1,
      customers: state.servedNPCs ? state.servedNPCs.length : 0,
      books: state.bookLog ? state.bookLog.length : 0,
      replies: 0,  // TODO: 跟回信系统对接
      ending: this._getEndingName(state)
    };
  },
  
  // ... 更多辅助方法
};
```

**具体实现细节**（给 agent 完整照着写的脚手架）：

```javascript
// === 辅助方法 ===

_getEndingName: function(state) {
  // 调用 Engine.checkEnding() 拿当前结局对象
  var ending = Engine.checkEnding ? Engine.checkEnding() : null;
  return ending ? ending.title : '守望者';
},

_getRecommendedBooks: function(state) {
  // 从 state.bookLog 拿，每条记录里有 bookId, npcName, day
  if (!state.bookLog) return [];
  return state.bookLog.map(function(log) {
    var book = GameData.books.find(function(b) { return b.id === log.bookId; });
    return Object.assign({}, log, { book: book });
  });
},

_getMylistBooks: function(state) {
  if (!state.mylist) return [];
  return state.mylist.map(function(item) {
    var book = GameData.books.find(function(b) { return b.id === item.bookId; });
    return Object.assign({}, item, { book: book });
  });
},

_getUnplayedBooks: function(state, recommended, mylist) {
  // 玩家没推荐过、也没加"想读"的书
  var excludedIds = new Set();
  recommended.forEach(function(r) { if (r.book) excludedIds.add(r.book.id); });
  mylist.forEach(function(m) { if (m.book) excludedIds.add(m.book.id); });
  
  return GameData.books.filter(function(b) {
    return !excludedIds.has(b.id);
  }).slice(0, 6);  // 最多展示 6 本未接触的书
},

// === 渲染各 section ===

_renderHeader: function(stats) {
  return ''
    + '<div class="ms-header">'
    + '  <h1>📚 我的书店</h1>'
    + '  <p class="ms-sub">THE LAST BOOKSTORE · 你的 7 天</p>'
    + '</div>'
    + '<div class="ms-stats">'
    + '  <div class="ms-stat"><strong>' + stats.days + '</strong><span>天</span></div>'
    + '  <div class="ms-stat"><strong>' + stats.customers + '</strong><span>位客人</span></div>'
    + '  <div class="ms-stat"><strong>' + stats.books + '</strong><span>本书</span></div>'
    + '  <div class="ms-stat ms-stat-ending">🌟 ' + stats.ending + '</div>'
    + '</div>';
},

_renderRecommendedSection: function(books) {
  if (books.length === 0) {
    return '<div class="ms-empty">你还没推荐过任何书</div>';
  }
  
  var html = '<div class="ms-section">'
    + '  <h2>📖 我推荐过的书</h2>'
    + '  <div class="ms-book-grid">';
  
  books.forEach(function(item) {
    if (!item.book) return;
    var b = item.book;
    var catObj = GameData.categories[b.category] || { name: '其他' };
    html += ''
      + '<div class="ms-book-card" data-book-id="' + b.id + '" data-npc-name="' + item.npcName + '">'
      + '  <div class="ms-book-cover" style="background:linear-gradient(135deg,' + b.coverColor + ',' + b.coverColor + '88)">'
      + '    <span class="ms-cover-title">' + b.title + '</span>'
      + '  </div>'
      + '  <div class="ms-book-meta">'
      + '    <div class="ms-book-title">' + b.title + '</div>'
      + '    <div class="ms-book-npc">→ ' + item.npcName + '</div>'
      + '    <div class="ms-book-match">' + (item.match === 'perfect' ? '🌟 完美' : item.match === 'good' ? '✅ 良好' : '➖ 一般') + '</div>'
      + '  </div>'
      + '  <button class="ms-btn-reply" data-book-id="' + b.id + '" data-npc-id="' + (item.npcId || '') + '">💌 1 个月后</button>'
      + '</div>';
  });
  
  html += '</div></div>';
  return html;
},

_renderMylistSection: function(mylist, unplayed) {
  var html = '<div class="ms-section ms-section-mylist">'
    + '  <h2>⭐ 我想读的书</h2>';
  
  if (mylist.length > 0) {
    html += '<div class="ms-book-grid">';
    mylist.forEach(function(item) {
      if (!item.book) return;
      var b = item.book;
      html += ''
        + '<div class="ms-book-card ms-card-mylist">'
        + '  <div class="ms-book-cover" style="background:linear-gradient(135deg,' + b.coverColor + ',' + b.coverColor + '88)">'
        + '    <span class="ms-cover-title">' + b.title + '</span>'
        + '    <span class="ms-cover-check">✓</span>'
        + '  </div>'
        + '  <div class="ms-book-meta">'
        + '    <div class="ms-book-title">' + b.title + '</div>'
        + '    <div class="ms-book-npc">' + b.author + '</div>'
        + '  </div>'
        + '</div>';
    });
    html += '</div>';
  }
  
  // 提示去线下读
  html += '<div class="ms-mylist-cta">'
    + '  <p>想读的书，去 <strong>微信读书 / 得到 / 京东</strong> 搜书名</p>'
    + '  <button class="ms-btn-copy" id="ms-btn-copy">📋 复制待读清单（' + mylist.length + ' 本）</button>'
    + '</div>';
  
  // 推荐未接触的书（让玩家发现新书）
  if (unplayed.length > 0) {
    html += '<div class="ms-discover">'
      + '  <h3>📚 你可能也想读</h3>'
      + '  <p class="ms-discover-sub">这些书还没出现在你的游戏里</p>'
      + '  <div class="ms-book-grid">';
    unplayed.forEach(function(b) {
      html += ''
        + '<div class="ms-book-card ms-card-discover" data-book-id="' + b.id + '">'
        + '  <div class="ms-book-cover" style="background:linear-gradient(135deg,' + b.coverColor + ',' + b.coverColor + '88)">'
        + '    <span class="ms-cover-title">' + b.title + '</span>'
        + '  </div>'
        + '  <div class="ms-book-meta">'
        + '    <div class="ms-book-title">' + b.title + '</div>'
        + '    <div class="ms-book-npc">' + b.author + '</div>'
        + '  </div>'
        + '</div>';
    });
    html += '</div></div>';
  }
  
  html += '</div>';
  return html;
},

_renderQuoteSection: function() {
  return ''
    + '<div class="ms-section ms-quotes">'
    + '  <h2>一些句子</h2>'
    + '  <blockquote>"如果知识只剩纸页，那就把灯点亮。"</blockquote>'
    + '  <blockquote>"这家店的价值不在于卖了多少本书，而在于对走进来的每一个人，给出了正确的那一句回答。"</blockquote>'
    + '</div>';
},

_renderActions: function(state) {
  return ''
    + '<div class="ms-actions">'
    + '  <button class="ms-btn-restart" id="ms-btn-restart">← 重新开始</button>'
    + '  <button class="ms-btn-share" id="ms-btn-share">📤 分享我的书店</button>'
    + '</div>';
},

// === 交互绑定 ===

_bindInteractions: function(state) {
  var self = this;
  
  // 复制待读清单
  var copyBtn = document.getElementById('ms-btn-copy');
  if (copyBtn) {
    copyBtn.onclick = function() {
      self._copyMylist(state);
    };
  }
  
  // 回信按钮
  var replyBtns = document.querySelectorAll('.ms-btn-reply');
  replyBtns.forEach(function(btn) {
    btn.onclick = function() {
      var bookId = btn.getAttribute('data-book-id');
      var npcId = btn.getAttribute('data-npc-id');
      self._openReply(bookId, npcId);
    };
  });
  
  // 重新开始
  var restartBtn = document.getElementById('ms-btn-restart');
  if (restartBtn) {
    restartBtn.onclick = function() {
      if (confirm('重新开始？当前进度会丢失。')) {
        localStorage.removeItem('tlb_save');
        location.reload();
      }
    };
  }
  
  // 分享（暂用复制文字方案）
  var shareBtn = document.getElementById('ms-btn-share');
  if (shareBtn) {
    shareBtn.onclick = function() {
      self._copyShareText(state);
    };
  }
},

_copyMylist: function(state) {
  if (!state.mylist || state.mylist.length === 0) {
    alert('你还没标记任何想读的书～\n回到游戏中，遇到喜欢的书点"我也想读"按钮。');
    return;
  }
  
  var text = '📚 我在《最后的书店》里想读的书：\n\n';
  state.mylist.forEach(function(item) {
    var book = GameData.books.find(function(b) { return b.id === item.bookId; });
    if (book) {
      text += '• 《' + book.title + 》' + ' —— ' + book.author + '\n';
    }
  });
  text += '\n推荐去微信读书/得到搜这些书名。';
  
  this._copyToClipboard(text, '已复制 ' + state.mylist.length + ' 本书名 — 打开微信读书搜一搜');
},

_copyShareText: function(state) {
  var stats = this._calcStats(state);
  var text = '📚 我在《最后的书店》里度过了 ' + stats.days + ' 天，'
    + '接待了 ' + stats.customers + ' 位客人，推荐了 ' + stats.books + ' 本书。\n'
    + '结局：' + stats.ending + '\n\n'
    + '你也来当一次书店老板：\n'
    + '👉 https://swording-k.github.io/the-last-bookstore/';
  
  this._copyToClipboard(text, '已复制 — 粘贴给朋友');
},

_copyToClipboard: function(text, msg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      alert(msg);
    });
  } else {
    // fallback
    var ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      alert(msg);
    } catch (e) {
      prompt('复制这段文字：', text);
    }
    document.body.removeChild(ta);
  }
},

_openReply: function(bookId, npcId) {
  // 找到书和 NPC
  var book = GameData.books.find(function(b) { return b.id === bookId; });
  var npc = GameData.npcs[npcId];
  
  if (!book) return;
  
  // 弹出信纸 UI
  var modal = document.createElement('div');
  modal.className = 'ms-reply-modal';
  modal.innerHTML = ''
    + '<div class="ms-reply-overlay"></div>'
    + '<div class="ms-reply-paper">'
    + '  <div class="ms-reply-close">×</div>'
    + '  <div class="ms-reply-header">📬 一个月后，橡木镇</div>'
    + '  <div class="ms-reply-content" id="ms-reply-content">'
    + '    <div class="ms-reply-typing">店主正在写...</div>'
    + '  </div>'
    + '</div>';
  document.body.appendChild(modal);
  
  modal.querySelector('.ms-reply-close').onclick = function() { modal.remove(); };
  modal.querySelector('.ms-reply-overlay').onclick = function() { modal.remove(); };
  
  // 调用 LLM
  var contentEl = document.getElementById('ms-reply-content');
  LLM.generateReply(book, npc, function(chunk, done) {
    contentEl.innerHTML = '<div class="ms-reply-text">' + chunk.replace(/\n/g, '<br>') + '</div>';
    if (done) {
      contentEl.innerHTML += '<div class="ms-reply-footer">—— ' + (npc ? npc.name : 'TA') + '</div>';
    }
  });
},

// === 暴露 API ===
open: function() { /* ... 见上面 ... */ }
};
```

**这就是完整骨架**。agent 复制 → 调整 → 即可。

---

### 2.4 `llm.js` — 加一个新函数

**位置**：现有 `askAboutBook` 函数之后

**改动**：加一个 `generateReply(book, npc, onChunk)`

```javascript
/**
 * 生成"1 个月后回信"
 * @param book {title, author, blurb, ...}
 * @param npc {name, tag, ...} 可选
 * @param onChunk (content, done) => void
 */
function generateReply(book, npc, onChunk) {
  var npcName = npc ? npc.name : 'TA';
  var npcTag = npc ? (npc.tag || '镇上居民') : '镇上居民';
  
  var prompt = '你是 ' + npcName + '（' + npcTag + '）。\n\n';
  prompt += '一个月前，橡木镇书店的老板推荐了一本书给你：《' + book.title + '》\n';
  prompt += '作者：' + book.author + '\n';
  prompt += '内容简介：' + (book.blurb || '').substring(0, 200) + '\n\n';
  prompt += '请给书店老板写一封 3-5 句的短信：\n';
  prompt += '1. 那本书你看完了吗？\n';
  prompt += '2. 它有没有帮到你当时的困境？\n';
  prompt += '3. 一个具体的细节（一句话、一个小动作、一段对话）\n';
  prompt += '4. 最后一句道谢\n\n';
  prompt += '语气真诚、克制，不要太煽情。像一封手写的信。';
  
  var messages = [
    { role: 'system', content: prompt }
  ];
  
  return callLLMStream(messages, 0.7, onChunk).catch(function(err) {
    console.error('[LLM Reply]', err);
    // 降级：模板回信
    var fallbacks = [
      npcName + '：\n那本书我看了。\n' + (book.recommendReason || '谢谢你。') + '\n——' + npcName,
      '店主：\n' + npcName + '在门口留了张纸条。\n"' + (book.title) + '读完了。我女儿每天要听一段。"\n——' + npcName,
      '一封信被塞在门缝里：\n"' + (book.recommendReason || '谢谢你推荐这本书。') + '\n我会记住的。"\n——' + npcName
    ];
    var fb = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    onChunk(fb, true);
    return fb;
  });
}

// 在 return 里暴露
return {
  call: callLLM,
  chatWithNPC: chatWithNPC,
  askAboutBook: askAboutBook,
  generateReply: generateReply   // 🆕
};
```

---

### 2.5 `renderer.js` — 加一个"我想读"按钮

**位置**：`showResult` 函数（约第 523 行）——在结果面板里加按钮

**改动**：
```javascript
content.innerHTML =
  '<div class="res-icon">' + icon + '</div>' +
  '<div class="res-title">' + result.title + '</div>' +
  '<div class="res-book">' + result.book.title + ' — ' + result.book.author + '</div>' +
  '<div class="res-message">' + (result.message || '') + '</div>' +
  '<div class="res-world-note">' + this._buildWorldResultNote(result) + '</div>' +
  (result.recommendReason ? '<div class="res-afterword">💡 ' + result.recommendReason + '</div>' : '') +
  '<div class="res-effects">' + efx + '</div>' +
  // 🆕 新增按钮
  '<button class="act-btn act-mylist" id="res-mylist">📖 我也想读这本书</button>' +
  '<button class="act-btn act-next" id="res-continue">继续</button>';

// 🆕 绑定点击
var mylistBtn = document.getElementById('res-mylist');
if (mylistBtn) {
  mylistBtn.onclick = function(ev) {
    ev.stopPropagation();
    Game._toggleMylist(result.book.id);
  };
}
```

---

### 2.6 `game.js` — 加 `_toggleMylist` + 改结局 onClose

**位置**：`_showNight` 函数（结局分支，约第 209 行）+ 新增一个方法

**改动 1**：加方法
```javascript
/**
 * 切换"我想读"状态
 */
_toggleMylist: function(bookId) {
  if (!Engine.state.mylist) Engine.state.mylist = [];
  
  var idx = Engine.state.mylist.findIndex(function(m) { return m.bookId === bookId; });
  var btn = document.getElementById('res-mylist');
  
  if (idx >= 0) {
    // 移除
    Engine.state.mylist.splice(idx, 1);
    if (btn) {
      btn.textContent = '📖 我也想读这本书';
      btn.classList.remove('added');
    }
    alert('已从想读列表移除');
  } else {
    // 加入
    var npc = Engine.state.currentNPC;
    Engine.state.mylist.push({
      bookId: bookId,
      day: Engine.state.day,
      npcId: npc ? npc.id : null,
      addedAt: Date.now()
    });
    if (btn) {
      btn.textContent = '✓ 已加入想读';
      btn.classList.add('added');
    }
    alert('✓ 已加入「想读」列表 — 结局后可在「我的书店」找到它');
  }
}
```

**改动 2**：结局 onClose 改跳到 mystore
```javascript
// 找到：Renderer.showEnding(ending, function() { location.reload(); });
// 改为：
Renderer.showEnding(ending, function() { 
  // 跳到「我的书店」
  if (window.MyStore) {
    MyStore.open();
  } else {
    location.reload();
  }
});
```

---

### 2.7 `style.css` — 加个人页样式

**位置**：文件末尾追加

**改动**：约 200 行。关键样式：

```css
/* ============ 我的书店 ============ */
.mystore-screen {
  background: linear-gradient(180deg, #2A1810 0%, #1A0F08 100%);
  color: #E8D5B7;
  min-height: 100vh;
  overflow-y: auto;
  font-family: 'Noto Serif SC', serif;
}

.ms-header { text-align: center; padding: 40px 20px 20px; }
.ms-header h1 { font-size: 36px; margin: 0; color: #D4A574; }
.ms-sub { color: #8B7355; font-size: 14px; letter-spacing: 2px; }

.ms-stats {
  display: flex;
  justify-content: center;
  gap: 30px;
  padding: 20px;
  background: rgba(212, 165, 116, 0.05);
  border-radius: 12px;
  margin: 20px;
}
.ms-stat { text-align: center; }
.ms-stat strong { display: block; font-size: 28px; color: #D4A574; }
.ms-stat span { font-size: 12px; color: #8B7355; }
.ms-stat-ending { color: #7FB069; align-self: center; }

.ms-section { padding: 20px; }
.ms-section h2 { 
  color: #D4A574; 
  border-bottom: 1px solid rgba(212, 165, 116, 0.2);
  padding-bottom: 10px;
  font-size: 20px;
}

.ms-book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  padding: 16px 0;
}

.ms-book-card {
  background: rgba(255, 248, 225, 0.04);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
  cursor: pointer;
}
.ms-book-card:hover { transform: translateY(-4px); }

.ms-book-cover {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 12px;
  text-align: center;
}
.ms-cover-title {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
.ms-cover-check {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #7FB069;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ms-book-meta { padding: 10px; }
.ms-book-title { font-size: 14px; color: #E8D5B7; font-weight: 600; }
.ms-book-npc { font-size: 12px; color: #8B7355; margin-top: 4px; }
.ms-book-match { font-size: 11px; margin-top: 4px; }

.ms-btn-reply, .ms-btn-copy, .ms-btn-restart, .ms-btn-share {
  width: 100%;
  background: rgba(212, 165, 116, 0.15);
  color: #D4A574;
  border: 1px solid rgba(212, 165, 116, 0.3);
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  margin-top: 6px;
  transition: all 0.2s;
}
.ms-btn-reply:hover, .ms-btn-copy:hover, .ms-btn-restart:hover, .ms-btn-share:hover {
  background: rgba(212, 165, 116, 0.25);
}

.ms-mylist-cta {
  text-align: center;
  padding: 16px;
  background: rgba(127, 176, 105, 0.05);
  border-radius: 8px;
  margin-top: 12px;
}
.ms-mylist-cta p { color: #7FB069; margin: 0 0 12px; }

.ms-discover { margin-top: 20px; }
.ms-discover h3 { color: #B8A089; font-size: 16px; }
.ms-discover-sub { color: #6B5D4F; font-size: 12px; }

.ms-quotes { text-align: center; }
.ms-quotes blockquote {
  font-style: italic;
  color: #B8A089;
  border-left: none;
  padding: 12px 20px;
  margin: 12px 0;
}

.ms-actions {
  display: flex;
  gap: 12px;
  padding: 20px;
  justify-content: center;
}

.act-mylist {
  background: rgba(127, 176, 105, 0.2) !important;
  color: #7FB069 !important;
  border: 1px solid rgba(127, 176, 105, 0.4) !important;
}
.act-mylist.added {
  background: rgba(127, 176, 105, 0.4) !important;
}

/* 回信 modal */
.ms-reply-modal {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1000; display: flex; align-items: center; justify-content: center;
}
.ms-reply-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
}
.ms-reply-paper {
  position: relative;
  background: linear-gradient(180deg, #FFF8E1, #F5E6C8);
  color: #3A2A1A;
  max-width: 480px;
  width: 90%;
  padding: 40px 32px;
  border-radius: 4px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  font-family: 'Noto Serif SC', serif;
  line-height: 1.8;
  max-height: 70vh;
  overflow-y: auto;
}
.ms-reply-close {
  position: absolute; top: 12px; right: 16px;
  font-size: 24px; cursor: pointer; color: #8B7355;
}
.ms-reply-header {
  text-align: center; color: #8B7355; font-size: 14px;
  border-bottom: 1px dashed #C9A876;
  padding-bottom: 12px; margin-bottom: 20px;
}
.ms-reply-typing { text-align: center; color: #8B7355; }
.ms-reply-text { white-space: pre-wrap; }
.ms-reply-footer { text-align: right; margin-top: 20px; color: #8B7355; }
```

---

## 3. 完整改动清单（按执行顺序）

1. ✅ 备份工程
2. ✏️ `engine.js` line 28 附近加 `mylist: []`
3. ✏️ `index.html` 加 `<div id="mystore-screen">` 和 `<script src="mystore.js">`
4. 🆕 新建 `mystore.js`（用上面的骨架）
5. ✏️ `llm.js` 加 `generateReply` 函数
6. ✏️ `renderer.js` `showResult` 加按钮 + 绑定
7. ✏️ `game.js` 加 `_toggleMylist` + 改结局 onClose
8. ✏️ `style.css` 末尾加 200 行
9. 🧪 启动本地服务 + 玩通一遍
10. 🧪 验证：开新局、玩 3 天、加 1 本想读、触发结局、打开 mystore
11. 🧪 验证：LLM 断网时回信 fallback
12. 📹 录演示视频

---

## 4. 调试技巧

### 4.1 快速触发结局（不用玩 7 天）
```javascript
// 在浏览器控制台跑：
Engine.state.day = 7;
Engine.state.daysCompleted = 7;
Engine.state.hope = 85;
Engine.state.metTraveler = true;
Engine.state.totalPerfect = 5;
Engine.checkEnding();  // 应该返回 trueEnding 对象
```

### 4.2 快速塞测试数据
```javascript
Engine.state.bookLog = [
  { day:1, npcName:'林月', bookId:'b01', bookTitle:'小王子', match:'perfect', effect:{hope:10,rep:5} },
  { day:1, npcName:'陈伯', bookId:'b03', bookTitle:'月亮与六便士', match:'good', effect:{hope:5,rep:2} }
];
Engine.state.mylist = [
  { bookId:'b11', day:1, npcId:'linYue', addedAt:Date.now() },
  { bookId:'b12', day:1, npcId:'xiaoMing', addedAt:Date.now() }
];
Engine.state.servedNPCs = ['linYue', 'chenBo'];
```

### 4.3 常见错误排查
- **"MyStore is not defined"** → `<script src="mystore.js">` 没加或顺序错
- **"Engine.state.mylist is undefined"** → engine.js 没加字段
- **个人页打开后是空白** → 控制台看 `MyStore._buildHTML(state)` 返回了什么
- **复制按钮没反应** → https 环境才支持 `navigator.clipboard`，http 走 fallback

---

## 5. 不要做的事

- ❌ **不要改 NPC 对话树**（会破坏 state 持久化）
- ❌ **不要改 4 结局的判定逻辑**（会破坏游戏平衡）
- ❌ **不要加新书到 GameData.books**（除非你也加封面 PNG 到 assets/covers/）
- ❌ **不要重构 renderer.js**（你只要 patch 1 个函数）
- ❌ **不要引入新框架**（保持 var + global）
- ❌ **不要依赖外部 CDN**（除可选的 html2canvas）

---

## 6. 测试 checklist

完成开发后跑一遍：

- [ ] 浏览器打开 `http://127.0.0.1:9876/index.html`，无 console error
- [ ] 推开那扇门 → 第 1 天 → 接待林月 → 选书 → 看到「📖 我也想读这本书」按钮
- [ ] 点击按钮 → 看到「✓ 已加入想读」+ alert
- [ ] 玩到第 7 天触发结局 → 「查看我的书店」按钮
- [ ] 个人页正确显示 7 天摘要、推荐过的书、想读的书、未接触的书
- [ ] 点击「💌 1 个月后」→ 4 秒内出现回信（5 句话内）
- [ ] 点击「📋 复制待读清单」→ 粘贴出书名列表
- [ ] 关 wifi 再玩 → 回信 fallback 文案出现
- [ ] F5 刷新 → 进度保留（mylist 不丢）

---

**完。祝你开发顺利，评委面前不翻车。**

—— Mavis · 2026-06-14
