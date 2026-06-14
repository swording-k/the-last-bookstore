/* ============================================================
   booktheater.js - 书中剧场 (VN 沉浸式剧情推进版 v2.0)
   全屏场景 + 角色选择 + 旁白/对话/探索/自由对话 四阶段推进
   ============================================================ */

var BookTheater = {
  // ============ 状态 ============
  _book: null,
  _world: null,
  _character: null,
  _state: 'select',  // 'select'|'narration'|'dialogue'|'explore'|'chat'|'free_chat'
  _storyline: null,
  _storyIndex: -1,
  _history: [],
  _streaming: false,
  _dialogueTimer: null,

  /* ==========================================================
     打开剧场 — 显示角色选择界面
     ========================================================== */
  open: function(book) {
    if (!book || !book.bookWorld) return;
    this._book = book;
    this._world = JSON.parse(JSON.stringify(book.bookWorld)); // deep copy
    this._character = null;
    this._state = 'select';
    this._storyline = null;
    this._storyIndex = -1;
    this._history = [];
    this._streaming = false;

    var old = document.getElementById('book-theater');
    if (old) old.remove();

    var modal = document.createElement('div');
    modal.id = 'book-theater';
    modal.innerHTML = this._buildHTML(book, this._world);
    document.body.appendChild(modal);
    this._bind();
    this._showCharacterSelect();
  },

  close: function() {
    var modal = document.getElementById('book-theater');
    if (modal) modal.remove();
    this._streaming = false;
    this._state = 'select';
  },

  /* ==========================================================
     HTML 结构
     ========================================================== */
  _buildHTML: function(book, world) {
    return '' +
      '<div class="bt-backdrop"></div>' +
      '<section class="bt-stage">' +

        /* 全屏场景背景 */
        '<div class="bt-scene" id="bt-scene"' + this._sceneStyle(world) + '>' +
          '<div class="bt-hotspots" id="bt-hotspots"></div>' +
          '<div class="bt-character-model" id="bt-character-model"></div>' +
        '</div>' +

        /* 关闭按钮 */
        '<button class="bt-close" id="bt-close" title="\u5173\u95ed">\u00d7</button>' +

        /* ---- 角色选择界面（初始显示）---- */
        '<div class="bt-select-screen" id="bt-select-screen">' +
          '<div class="bt-select-inner">' +
            '<p class="bt-select-kicker">\u4e66\u4e2d\u5267\u573a \xb7 ' + this._esc(book.title) + '</p>' +
            '<h2 class="bt-select-title">\u9009\u62e9\u4f60\u7684\u89d2\u8272\u89c6\u89d2</h2>' +
            '<p class="bt-select-subtitle">\u4f60\u5c06\u4ee5\u8be5\u89d2\u8272\u7684\u7b2c\u4e00\u4eba\u79f0\u63a8\u8fdb\u5267\u60c5</p>' +
            '<div class="bt-select-cards" id="bt-select-cards"></div>' +
          '</div>' +
        '</div>' +

        /* ---- 旁白界面（全屏文字）---- */
        '<div class="bt-narration-screen" id="bt-narration-screen">' +
          '<div class="bt-narration-text" id="bt-narration-text"></div>' +
          '<div class="bt-narration-hint" id="bt-narration-hint">\u70b9\u51fb\u7ee7\u7eed</div>' +
        '</div>' +

        /* ---- 对话界面（底部对话框）---- */
        '<div class="bt-dialogue-screen" id="bt-dialogue-screen">' +
          '<div class="bt-dialogue-name" id="bt-dialogue-name"></div>' +
          '<div class="bt-dialogue-text" id="bt-dialogue-text"></div>' +
          '<div class="bt-dialogue-hint" id="bt-dialogue-hint">\u70b9\u51fb\u7ee7\u7eed</div>' +
        '</div>' +

        /* ---- 探索界面（热点提示）---- */
        '<div class="bt-explore-screen" id="bt-explore-screen">' +
          '<div class="bt-explore-text" id="bt-explore-text"></div>' +
        '</div>' +

        /* ---- 自由对话界面（底部聊天面板）---- */
        '<div class="bt-freechat-screen" id="bt-freechat-screen">' +
          '<div class="bt-head" id="bt-head">' +
            '<div class="bt-kicker">\u4e66\u4e2d\u5267\u573a \xb7 ' + this._esc(book.title) + '</div>' +
            '<h2>' + this._esc(world.sceneTitle || '') + '</h2>' +
            '<p>' + this._esc(world.sceneSubtitle || '') + '</p>' +
          '</div>' +
          '<div class="bt-layout">' +
            '<div class="bt-characters" id="bt-characters"></div>' +
            '<main class="bt-chat">' +
              '<div class="bt-active" id="bt-active"></div>' +
              '<div class="bt-messages" id="bt-messages"></div>' +
              '<div class="bt-prompts" id="bt-prompts"></div>' +
              '<div class="bt-input-row">' +
                '<input id="bt-input" type="text" autocomplete="off" placeholder="\u95ee\u4e66\u4e2d\u4eba\u7269\u4e00\u53e5\u8bdd..." />' +
                '<button id="bt-send">\u53d1\u9001</button>' +
              '</div>' +
            '</main>' +
          '</div>' +
        '</div>' +

      '</section>';
  },

  /* ==========================================================
     角色选择界面
     ========================================================== */
  _showCharacterSelect: function() {
    this._state = 'select';
    var screen = document.getElementById('bt-select-screen');
    var cards = document.getElementById('bt-select-cards');
    if (!screen || !cards) return;

    // 隐藏其他界面，显示选择界面
    this._hideAllScreens();
    screen.classList.add('active');

    var self = this;
    cards.innerHTML = '';
    this._world.characters.forEach(function(character) {
      var card = document.createElement('div');
      card.className = 'bt-select-card';
      card.innerHTML =
        '<div class="bt-select-card-img">' +
          (character.image
            ? '<div class="bt-select-portrait" style="background-image:url(' + self._escAttr(character.image) + ')"></div>'
            : '<span class="bt-select-avatar">' + self._esc(character.avatar || '\ud83c\udfad') + '</span>') +
        '</div>' +
        '<div class="bt-select-card-info">' +
          '<h3>' + self._esc(character.name) + '</h3>' +
          '<p class="bt-select-role">' + self._esc(character.role || '') + '</p>' +
          '<p class="bt-select-goal">' + self._esc(character.goal || '') + '</p>' +
        '</div>' +
        '<div class="bt-select-enter">\u9009\u62e9\u6b64\u89d2\u8272\u203a</div>';
      card.onclick = function() {
        self._startStory(character);
      };
      cards.appendChild(card);
    });
  },

  /* ==========================================================
     \u5f00\u59cb\u67d0\u89d2\u8272\u7684\u5267\u60c5
     ========================================================== */
  _startStory: function(character) {
    this._character = character;
    this._state = 'narration';
    this._history = [];

    // 加载该角色的 storyline
    if (character.storyline && character.storyline.length > 0) {
      this._storyline = character.storyline;
    } else {
      // 如果没有 storyline，直接进自由对话
      this._showFreeChat();
      return;
    }

    this._storyIndex = 0;
    this._hideAllScreens();
    this._updateCharacterModel();
    this._advanceStory();
  },

  /* ==========================================================
     \u63a8\u8fdb\u5267\u60c5\u5230\u4e0b\u4e00\u6b65
     ========================================================== */
  _advanceStory: function() {
    if (!this._storyline || this._storyIndex < 0 || this._storyIndex >= this._storyline.length) {
      // 剧情结束，进入自由对话
      this._showFreeChat();
      return;
    }

    var step = this._storyline[this._storyIndex];

    switch (step.type) {
      case 'narration':
        this._showNarration(step);
        break;
      case 'dialogue':
        this._showDialogue(step);
        break;
      case 'explore':
        this._showExplore(step);
        break;
      case 'chat':
        this._showChat(step);
        break;
      case 'free_chat':
        this._showFreeChat();
        break;
      default:
        // 未知类型，跳过
        this._storyIndex++;
        this._advanceStory();
    }
  },

  /* ==========================================================
     \u65c1\u767d\u754c\u9762\u663e\u793a
     ========================================================== */
  _showNarration: function(step) {
    this._state = 'narration';
    this._hideAllScreens();

    var screen = document.getElementById('bt-narration-screen');
    var textEl = document.getElementById('bt-narration-text');
    var hintEl = document.getElementById('bt-narration-hint');
    if (!screen || !textEl) return;

    screen.classList.add('active');
    textEl.textContent = step.text || '';
    if (hintEl) hintEl.style.opacity = '1';

    // 点击继续
    var self = this;
    screen.onclick = function() {
      if (self._streaming) return;
      self._storyIndex++;
      self._advanceStory();
    };
  },

  /* ==========================================================
     \u5bf9\u8bdd\u754c\u9762\u663e\u793a
     ========================================================== */
  _showDialogue: function(step) {
    this._state = 'dialogue';
    this._hideAllScreens();

    var screen = document.getElementById('bt-dialogue-screen');
    var nameEl = document.getElementById('bt-dialogue-name');
    var textEl = document.getElementById('bt-dialogue-text');
    var hintEl = document.getElementById('bt-dialogue-hint');
    if (!screen || !textEl) return;

    screen.classList.add('active');

    // 显示说话者名字
    if (nameEl) {
      var speakerName = '';
      if (step.speaker === this._character.id) {
        speakerName = this._character.name;
      } else {
        // 查找其他角色
        var speaker = this._findCharacterById(step.speaker);
        speakerName = speaker ? speaker.name : step.speaker;
      }
      nameEl.textContent = speakerName;
    }

    // 打字机效果显示文字
    textEl.textContent = '';
    var fullText = step.text || '';
    var charIndex = 0;
    var typingSpeed = 45; // 每个字符的毫秒数
    var self = this; // 必须在 setInterval 之前定义

    if (this._dialogueTimer) clearInterval(this._dialogueTimer);
    this._dialogueTimer = setInterval(function() {
      if (charIndex < fullText.length) {
        textEl.textContent += fullText.charAt(charIndex);
        charIndex++;
      } else {
        clearInterval(self._dialogueTimer);
        if (hintEl) hintEl.style.opacity = '1';
      }
    }, typingSpeed);

    screen.onclick = function() {
      if (self._streaming) return;
      // 如果打字还没完成，立即显示全部文字
      if (charIndex < fullText.length) {
        clearInterval(self._dialogueTimer);
        textEl.textContent = fullText;
        charIndex = fullText.length;
        if (hintEl) hintEl.style.opacity = '1';
        return;
      }
      self._storyIndex++;
      self._advanceStory();
    };
  },

  /* ==========================================================
     \u63a2\u7d22\u754c\u9762\u663e\u793a
     ========================================================== */
  _showExplore: function(step) {
    this._state = 'explore';
    this._hideAllScreens();

    var screen = document.getElementById('bt-explore-screen');
    var textEl = document.getElementById('bt-explore-text');
    var hotspots = document.getElementById('bt-hotspots');
    if (!screen || !textEl) return;

    screen.classList.add('active');
    textEl.textContent = step.text || '\u70b9\u51fb\u573a\u666f\u4e2d\u7684\u7ebf\u7d22\u63a2\u7d22';

    // 显示热点
    if (hotspots) {
      hotspots.innerHTML = '';
      var self = this;
      (this._world.sceneHotspots || []).forEach(function(spot) {
        var btn = document.createElement('button');
        btn.className = 'bt-hotspot hotspot-' + self._esc(spot.id || 'clue');
        btn.style.left = self._num(spot.x, 50) + '%';
        btn.style.top = self._num(spot.y, 50) + '%';
        btn.innerHTML = '<span></span><em>' + self._esc(spot.label || '\u7ebf\u7d22') + '</em>';
        btn.onclick = function() {
          if (self._streaming) return;
          // 点击热点后推进剧情
          self._storyIndex++;
          self._advanceStory();
        };
        hotspots.appendChild(btn);
      });
    }

    // 也可以点击屏幕任意位置跳过探索（如果热点不明显）
    // screen.onclick = function() {
    //   if (self._streaming) return;
    //   self._storyIndex++;
    //   self._advanceStory();
    // };
  },

  /* ==========================================================
     \u89e3\u9501\u81ea\u7531\u5bf9\u8bdd\u63d0\u793a
     ========================================================== */
  _showChat: function(step) {
    this._state = 'chat';
    this._hideAllScreens();

    // 显示自由对话界面，但提示用户可以开始提问
    var screen = document.getElementById('bt-freechat-screen');
    if (screen) {
      screen.classList.add('active');
    }
    this._renderCharacterForChat();

    // 显示提示消息
    var msgs = document.getElementById('bt-messages');
    if (msgs) {
      msgs.innerHTML = '';
      this._addMessage(step.text || '\u4f60\u53ef\u4ee5\u5f00\u59cb\u63d0\u95ee\u4e86', 'character');
    }

    var cards = (this._character.promptCards || []).concat(this._world.globalPromptCards || []);
    var prompts = document.getElementById('bt-prompts');
    if (prompts) {
      prompts.innerHTML = '';
      var self = this;
      cards.slice(0, 6).forEach(function(text) {
        var card = document.createElement('button');
        card.className = 'bt-prompt';
        card.textContent = text;
        card.onclick = function() { self._ask(text); };
        prompts.appendChild(card);
      });
    }

    this._state = 'free_chat';
  },

  /* ==========================================================
     \u81ea\u7531\u5bf9\u8bdd\u6a21\u5f0f
     ========================================================== */
  _showFreeChat: function() {
    this._state = 'free_chat';
    this._hideAllScreens();

    var screen = document.getElementById('bt-freechat-screen');
    if (screen) {
      screen.classList.add('active');
    }
    this._renderCharacterForChat();

    // 如果消息为空，显示开场白
    var msgs = document.getElementById('bt-messages');
    if (msgs && msgs.children.length === 0) {
      this._addMessage(this._character.opening || '\u4f60\u60f3\u95ee\u4ec0\u4e48\uff1f', 'character');
    }
  },

  /* ==========================================================
     \u9690\u85cf\u6240\u6709\u754c\u9762\uff0c\u663e\u793a\u6307\u5b9a\u754c\u9762
     ========================================================== */
  _hideAllScreens: function() {
    var ids = ['bt-select-screen', 'bt-narration-screen', 'bt-dialogue-screen', 'bt-explore-screen', 'bt-freechat-screen'];
    var self = this;
    ids.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });

    // 也隐藏热点
    var hotspots = document.getElementById('bt-hotspots');
    if (hotspots) hotspots.innerHTML = '';
  },

  /* ==========================================================
     \u66f4\u65b0\u7acb\u7ed8\u6a21\u578b
     ========================================================== */
  _updateCharacterModel: function() {
    var model = document.getElementById('bt-character-model');
    if (!model) return;
    model.innerHTML = this._figureHTML(this._character);
  },

  /* ==========================================================
     \u6839\u636e ID \u67e5\u627e\u89d2\u8272
     ========================================================== */
  _findCharacterById: function(id) {
    if (!this._world || !this._world.characters) return null;
    for (var i = 0; i < this._world.characters.length; i++) {
      if (this._world.characters[i].id === id) return this._world.characters[i];
    }
    return null;
  },

  /* ==========================================================
     \u81ea\u7531\u5bf9\u8bdd\u6a21\u5f0f\u4e0b\u7684\u89d2\u8272\u6e32\u67d3
     ========================================================== */
  _renderCharacterForChat: function() {
    var chars = document.getElementById('bt-characters');
    var active = document.getElementById('bt-active');
    if (!chars || !active || !this._character) return;

    var self = this;
    chars.innerHTML = '';
    this._world.characters.forEach(function(character) {
      var btn = document.createElement('button');
      btn.className = 'bt-character' + (character.id === self._character.id ? ' active' : '');
      btn.innerHTML =
        '<span class="bt-avatar">' + self._esc(character.avatar || '\ud83c\udfad') + '</span>' +
        '<span><strong>' + self._esc(character.name) + '</strong></span>';
      btn.onclick = function() {
        if (self._streaming) return;
        self._character = character;
        self._history = [];
        self._renderCharacterForChat();
      };
      chars.appendChild(btn);
    });

    active.innerHTML =
      '<div class="bt-active-avatar">' + this._esc(this._character.avatar || '\ud83c\udfad') + '</div>' +
      '<div><h3>' + this._esc(this._character.name) + '</h3>' +
      '<p>' + this._esc(this._character.role) + ' \xb7 ' + this._esc(this._character.goal || '') + '</p></div>';
  },

  /* ==========================================================
     \u7ed1\u5b9a\u4e8b\u4ef6
     ========================================================== */
  _bind: function() {
    var close = document.getElementById('bt-close');
    var backdrop = document.querySelector('#book-theater .bt-backdrop');
    var input = document.getElementById('bt-input');
    var send = document.getElementById('bt-send');

    var self = this;
    if (close) close.onclick = this.close.bind(this);
    if (backdrop) backdrop.onclick = this.close.bind(this);

    if (send) send.onclick = function() { self._sendInput(); };
    if (input) {
      input.onkeydown = function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          self._sendInput();
        }
      };
    }
  },

  /* ==========================================================
     \u53d1\u9001\u7528\u6237\u8f93\u5165
     ========================================================== */
  _sendInput: function() {
    var input = document.getElementById('bt-input');
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    this._ask(text);
  },

  /* ==========================================================
     \u53d1\u9001\u6d88\u606f\uff08AI \u5bf9\u8bdd\uff09
     ========================================================== */
  _ask: function(text) {
    if (this._streaming || !this._character) return;
    this._streaming = true;

    this._addMessage(text, 'player');
    var typing = this._addTyping();
    var self = this;

    if (window.LLM && LLM.chatWithBookCharacter && (!LLM.hasConfiguredKey || LLM.hasConfiguredKey())) {
      LLM.chatWithBookCharacter(this._book, this._character, text, this._history, function(content, done) {
        if (typing) typing.remove();
        self._streamMessage(content, done);
      }).then(function(answer) {
        self._pushHistory(text, answer);
      }).catch(function() {
        if (typing) typing.remove();
        var fb = self.fallbackCharacterReply(text);
        self._streamMessage(fb, true);
        self._pushHistory(text, fb);
      });
    } else {
      setTimeout(function() {
        if (typing) typing.remove();
        var fb = self.fallbackCharacterReply(text);
        self._streamMessage(fb, true);
        self._pushHistory(text, fb);
      }, 260);
    }
  },

  /* ==========================================================
     \u6dfb\u52a0\u6d88\u606f\u5230\u5bf9\u8bdd\u6846
     ========================================================== */
  _addMessage: function(text, type) {
    var msgs = document.getElementById('bt-messages');
    if (!msgs) return null;
    var el = document.createElement('div');
    el.className = 'bt-msg ' + (type === 'player' ? 'player' : 'character');
    var speaker = type === 'player' ? '\u4f60' : (this._character ? this._character.name : '\u4e66\u4e2d\u4eba\u7269');
    el.innerHTML = '<span>' + this._esc(speaker) + '</span><p>' + this._esc(text) + '</p>';
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  },

  /* ==========================================================
     \u6dfb\u52a0\u201c\u6b63\u5728\u8f93\u5165\u201d\u63d0\u793a
     ========================================================== */
  _addTyping: function() {
    var msgs = document.getElementById('bt-messages');
    if (!msgs) return null;
    var el = document.createElement('div');
    el.className = 'bt-typing';
    el.textContent = '\u58a8\u6c34\u6b63\u5728\u663e\u5f71...';
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  },

  /* ==========================================================
     \u6d41\u5f0f\u663e\u793a AI \u56de\u590d
     ========================================================== */
  _streamMessage: function(content, done) {
    var msgs = document.getElementById('bt-messages');
    if (!msgs) return;
    var bubble = document.getElementById('bt-stream');
    if (!bubble) {
      var el = this._addMessage('', 'character');
      bubble = el ? el.querySelector('p') : null;
      if (bubble) bubble.id = 'bt-stream';
    }
    if (bubble) {
      bubble.textContent = content;
      msgs.scrollTop = msgs.scrollHeight;
    }
    if (done) {
      if (bubble) bubble.removeAttribute('id');
      this._streaming = false;
    }
  },

  /* ==========================================================
     \u5386\u53f2\u8bb0\u5f55\uff08\u7528\u4e8e AI \u4e0a\u4e0b\u6587\uff09
     ========================================================== */
  _pushHistory: function(playerText, answer) {
    this._history.push({ role: 'user', content: playerText });
    this._history.push({ role: 'assistant', content: answer });
    if (this._history.length > 8) this._history = this._history.slice(this._history.length - 8);
  },

  /* ==========================================================
     \u70ed\u70b9\u6e32\u67d3\uff08\u5728\u81ea\u7531\u5bf9\u8bdd\u6a21\u5f0f\u4e0b\u4f7f\u7528\uff09
     ========================================================== */
  _renderHotspots: function(container) {
    if (!container) return;
    var spots = this._world && this._world.sceneHotspots ? this._world.sceneHotspots : [];
    var self = this;
    container.innerHTML = '';
    spots.forEach(function(spot) {
      var btn = document.createElement('button');
      btn.className = 'bt-hotspot hotspot-' + self._esc(spot.id || 'clue');
      btn.style.left = self._num(spot.x, 50) + '%';
      btn.style.top = self._num(spot.y, 50) + '%';
      btn.innerHTML = '<span></span><em>' + self._esc(spot.label || '\u7ebf\u7d22') + '</em>';
      btn.onclick = function() {
        if (self._streaming) return;
        self._ask(spot.prompt || ('\u6211\u6ce8\u610f\u5230\u4e86' + (spot.label || '\u8fd9\u4e2a\u7ebf\u7d22') + '\u3002'));
      };
      container.appendChild(btn);
    });
  },

  /* ==========================================================
     \u4eba\u7269\u7acb\u7ed5 HTML\uff08\u56fe\u7247\u6216 CSS \u51e0\u4f55\u4eba\u5f62\uff09
     ========================================================== */
  _figureHTML: function(character) {
    var id = character && character.id ? character.id : 'unknown';
    if (character && character.image) {
      return '' +
        '<div class="bt-portrait figure-' + this._esc(id) + '" style="--bt-character-image:url(' + this._escAttr(character.image) + ')">' +
        '</div>';
    }
    // 无图片时的 CSS 几何人形 fallback
    return '' +
      '<div class="bt-figure figure-' + this._esc(id) + '">' +
        '<div class="fig-shadow"></div>' +
        '<div class="fig-head"><span class="fig-face">' + this._esc(character.avatar || '') + '</span></div>' +
        '<div class="fig-neck"></div>' +
        '<div class="fig-body"></div>' +
        '<div class="fig-arm arm-left"></div>' +
        '<div class="fig-arm arm-right"></div>' +
        '<div class="fig-prop"></div>' +
      '</div>';
  },

  /* ==========================================================
     HTML \u8f6c\u4e49
     ========================================================== */
  _esc: function(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  _escAttr: function(text) {
    return String(text == null ? '' : text).replace(/["'()\\\n\r]/g, '');
  },

  _num: function(value, fallback) {
    var n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  },

  /* ==========================================================
     \u573a\u666f\u80cc\u666f\u6837\u5f0f
     ========================================================== */
  _sceneStyle: function(world) {
    if (!world || !world.sceneImage) return '';
    return ' style="--bt-scene-image:url(' + this._escAttr(world.sceneImage) + ')"';
  },

  /* ==========================================================
     \u672c\u5730\u964d\u7ea7\u56de\u590d\uff08AI \u5931\u8d25\u65f6\u4f7f\u7528\uff09
     ========================================================== */
  fallbackCharacterReply: function(playerMsg) {
    var c = this._character || {};
    if (c.id === 'holmes') {
      if (/\u89c2\u5bdf|\u8eab\u4e0a|\u7ebf\u7d22/.test(playerMsg)) return '\u5148\u4ece\u6700\u5c0f\u7684\u4e8b\u5b9e\u5f00\u59cb\uff1a\u978b\u5e95\u3001\u8896\u53e3\u3001\u505c\u987f\u3001\u89c6\u7ebf\u3002\u666e\u901a\u4eba\u6025\u7740\u89e3\u91ca\uff0c\u4fa6\u63a2\u5148\u628a\u4e8b\u5b9e\u6446\u5728\u684c\u4e0a\u3002';
      if (/\u533a\u522b|\u666e\u901a\u4eba/.test(playerMsg)) return '\u533a\u522b\u4e0d\u5728\u806a\u660e\uff0c\u800c\u5728\u7eaa\u5f8b\u3002\u666e\u901a\u4eba\u770b\u89c1\u7ed3\u8bba\u60f3\u8981\u7684\u8bc1\u636e\uff0c\u4fa6\u63a2\u53ea\u63a5\u53d7\u8bc1\u636e\u5141\u8bb8\u7684\u7ed3\u8bba\u3002';
      return '\u522b\u6025\u7740\u95ee\u7b54\u6848\u3002\u628a\u4f60\u770b\u89c1\u7684\u4e09\u4ef6\u5c0f\u4e8b\u5199\u4e0b\u6765\uff0c\u518d\u95ee\uff1a\u54ea\u4e00\u4ef6\u65e0\u6cd5\u7528\u5e38\u8bc6\u89e3\u91ca\uff1f\u90a3\u91cc\u624d\u6709\u6848\u4ef6\u3002';
    }
    if (c.id === 'prince') {
      if (/\u5927\u4eba|\u5947\u602a/.test(playerMsg)) return '\u5927\u4eba\u603b\u559c\u6b22\u628a\u6570\u5b57\u5f53\u6210\u7b54\u6848\u3002\u4ed6\u4eec\u95ee\u4e00\u9897\u661f\u503c\u591a\u5c11\u94b1\uff0c\u5374\u4e0d\u95ee\u5b83\u591c\u91cc\u6709\u6ca1\u6709\u966a\u8c01\u53d1\u5149\u3002';
      if (/\u5b64\u72ec|\u8bfb/.test(playerMsg)) return '\u5b64\u72ec\u7684\u65f6\u5019\uff0c\u5c31\u6162\u6162\u8bfb\u3002\u4f60\u4f1a\u53d1\u73b0\u6709\u4e9b\u661f\u661f\u4e0d\u662f\u4e3a\u4e86\u7167\u4eae\u8def\uff0c\u800c\u662f\u4e3a\u4e86\u8ba9\u4f60\u77e5\u9053\u81ea\u5df1\u5e76\u4e0d\u662f\u4e00\u4e2a\u4eba\u3002';
      return '\u5982\u679c\u4f60\u613f\u610f\u4e3a\u4e00\u6735\u82b1\u6d47\u6c34\u3001\u6321\u98ce\u3001\u542c\u5979\u8bf4\u8bdd\uff0c\u5979\u5c31\u4e0d\u518d\u53ea\u662f\u5343\u4e07\u6735\u82b1\u4e2d\u7684\u4e00\u6735\u3002';
    }
    if (c.id === 'fox') {
      if (/\u9a6f\u517b|\u7279\u522b|\u65f6\u95f4/.test(playerMsg)) return '\u9a6f\u517b\u5c31\u662f\u5efa\u7acb\u5173\u7cfb\u3002\u4f60\u4e3a\u4e00\u4e2a\u4eba\u82b1\u6389\u7684\u65f6\u95f4\uff0c\u4f1a\u8ba9\u4ed6\u4ece\u4eba\u7fa4\u91cc\u6162\u6162\u4eae\u8d77\u6765\u3002';
      return '\u771f\u6b63\u91cd\u8981\u7684\u4e1c\u897f\u5e38\u5e38\u5f88\u5b89\u9759\u3002\u5b83\u4e0d\u4f1a\u558a\u4f60\uff0c\u53ea\u4f1a\u5728\u4f60\u6bcf\u5929\u51c6\u65f6\u5230\u8fbe\u65f6\uff0c\u6084\u6084\u53d8\u5f97\u4e0d\u53ef\u66ff\u4ee3\u3002';
    }
    if (c.id === 'rose') {
      if (/\u5bb3\u6015|\u8bf4\u53cd\u8bdd|\u61c2/.test(playerMsg)) return '\u9a84\u50b2\u6709\u65f6\u5019\u53ea\u662f\u53e6\u4e00\u79cd\u5bb3\u6015\u3002\u6211\u6709\u523a\uff0c\u53ef\u6211\u8fd8\u662f\u5e0c\u671b\u6709\u4eba\u770b\u89c1\u6211\u5728\u98ce\u91cc\u53d1\u6296\u3002';
      return '\u7231\u4e00\u6735\u82b1\u4e0d\u662f\u8bc1\u660e\u5979\u5b8c\u7f8e\uff0c\u800c\u662f\u5728\u5979\u4efb\u6027\u3001\u654f\u611f\u3001\u5e26\u523a\u7684\u65f6\u5019\uff0c\u4ecd\u7136\u613f\u610f\u66ff\u5979\u7f69\u4e0a\u73bb\u7483\u7f69\u3002';
    }
    if (c.id === 'watson') {
      if (/\u9002\u5408|\u8bfb\u8005/.test(playerMsg)) return '\u5b83\u9002\u5408\u90a3\u4e9b\u613f\u610f\u6162\u4e00\u70b9\u7684\u4eba\u3002\u4f60\u4e0d\u5fc5\u9a6c\u4e0a\u7834\u6848\uff0c\u53ea\u8981\u8ddf\u7740\u798f\u5c14\u6469\u65af\u5b66\u4f1a\u91cd\u65b0\u770b\u89c1\u4e16\u754c\u3002';
      if (/\u4e3a\u4ec0\u4e48|\u8ddf\u968f/.test(playerMsg)) return '\u56e0\u4e3a\u4ed6\u8ba9\u6211\u76f8\u4fe1\uff0c\u518d\u6df7\u4e71\u7684\u73b0\u5b9e\u91cc\u4e5f\u6709\u7ebf\u7d22\u3002\u6211\u7684\u5de5\u4f5c\u662f\u8bb0\u5f55\u90a3\u675f\u5149\uff0c\u8ba9\u522b\u4eba\u4e5f\u80fd\u770b\u89c1\u3002';
      return '\u63a8\u7406\u6545\u4e8b\u7684\u597d\u5904\uff0c\u4e0d\u53ea\u662f\u8c1c\u5e95\u3002\u5b83\u8ba9\u4f60\u5728\u4e0d\u5b89\u91cc\u4fdd\u6301\u8010\u5fc3\uff0c\u5728\u590d\u6742\u91cc\u7ec3\u4e60\u6e05\u9192\u3002';
    }
    if (c.id === 'lestrade' || /\u8bc1\u636e|\u8bef\u5224|\u8868\u8c61/.test(playerMsg)) return '\u8b66\u65b9\u5e38\u72af\u7684\u9519\uff0c\u662f\u5148\u76f8\u4fe1\u6700\u54cd\u4eae\u7684\u89e3\u91ca\u3002\u8bc1\u636e\u5fc5\u987b\u80fd\u88ab\u53cd\u590d\u68c0\u67e5\uff0c\u4e0d\u80fd\u53ea\u8ba9\u4eba\u89c9\u5f97\u5408\u7406\u3002';
    return '\u6211\u4e0d\u559c\u6b22\u6f02\u4eae\u731c\u60f3\u3002\u7ed9\u6211\u65f6\u95f4\u3001\u5730\u70b9\u3001\u8bc1\u4eba\u548c\u7269\u8bc1\uff0c\u7136\u540e\u6211\u4eec\u518d\u8c08\u8c01\u6700\u53ef\u7591\u3002';
  }
};

/* ==========================================================
   \u793a\u8303\u6309\u94ae\u7ed1\u5b9a\uff08\u7528\u4e8e\u6d4b\u8bd5\uff09
   ========================================================== */
function bindBookTheaterDemoButton() {
  var btn = document.getElementById('demo-open-theater');
  if (!btn) return;
  btn.onclick = function() {
    var book = null;
    if (typeof GameData !== 'undefined' && GameData.books) {
      for (var i = 0; i < GameData.books.length; i++) {
        if (GameData.books[i].id === 'b25') {
          book = GameData.books[i];
          break;
        }
      }
    }
    if (book) BookTheater.open(book);
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindBookTheaterDemoButton);
} else {
  bindBookTheaterDemoButton();
}
