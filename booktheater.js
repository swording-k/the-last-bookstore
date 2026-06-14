/* ============================================================
   booktheater.js - 书中剧场 v4.0 (左立绘 + 右对话 布局)

   布局设计：
   - 左侧：超大人物全身立绘 + 场景背景（45%宽度）
   - 右侧：对话/旁白面板（55%宽度）
   - 像游戏里跟NPC对话一样：左边看到人物，右边看对话

   功能保留：
   - 角色选择 → 旁白 → 对话 → 探索 → 自由对话
   - 打字机效果、剧情推进、AI自由对话
   ============================================================ */

var BookTheater = {
  _imgVer: 'v20260614c', // 图片版本号，替换立绘时更新此值以强制浏览器刷新缓存
  // ============ 状态 ============
  _book: null,
  _world: null,
  _character: null,       // 当前扮演的角色
  _speaker: null,         // 当前正在说话的角色
  _state: 'select',       // select | story | free_chat
  _storyline: null,
  _storyIndex: -1,
  _history: [],
  _streaming: false,
  _typingTimer: null,
  _typingDone: false,

  /* ==========================================================
     打开剧场 — 如果传入 character，跳过选择界面
     ========================================================== */
  open: function(book, preSelectedCharacter) {
    if (!book || !book.bookWorld) return;
    this._book = book;
    this._world = JSON.parse(JSON.stringify(book.bookWorld));
    this._character = null;
    this._speaker = null;
    this._state = 'select';
    this._storyline = null;
    this._storyIndex = -1;
    this._history = [];
    this._streaming = false;
    this._clearTimer();

    var old = document.getElementById('book-theater');
    if (old) old.remove();

    var modal = document.createElement('div');
    modal.id = 'book-theater';
    modal.innerHTML = this._buildHTML(book, this._world);
    document.body.appendChild(modal);
    this._bind();
    
    // 入场动画
    var self = this;
    requestAnimationFrame(function() {
      modal.classList.add('bt-entered');
      // 如果已预选角色，直接开始剧情；否则显示选择界面
      if (preSelectedCharacter && preSelectedCharacter.storyline) {
        self._startStory(preSelectedCharacter);
      } else {
        self._showSelect();
      }
    });
  },

  close: function() {
    this._clearTimer();
    var modal = document.getElementById('book-theater');
    if (modal) {
      modal.classList.remove('bt-entered');
      var self = this;
      setTimeout(function() { if (modal.parentNode) modal.remove(); }, 300);
    }
    this._state = 'select';
  },

  /* ==========================================================
     HTML 结构 — 左右分栏布局 (v4.0)
     ========================================================== */
  _buildHTML: function(book, world) {
    return '' +
      '<div class="bt-backdrop"></div>' +
      '<section class="bt-stage" id="bt-stage"' + this._sceneStyle(world) + '>' +

        /* ======== 关闭按钮 ======== */
        '<button class="bt-close" id="bt-close" title="\u5173\u95ed">\u00d7</button>' +

        /* ======== 左侧：场景 + 立绘区域 ======== */
        '<div class="bt-left-panel" id="bt-left-panel">' +
          /* 场景背景 */
          '<div class="bt-scene" id="bt-scene">' +
            '<div class="bt-hotspots" id="bt-hotspots"></div>' +
          '</div>' +
          /* 人物立绘 — 超大，始终可见 */
          '<div class="bt-character-model" id="bt-character-model"></div>' +
        '</div>' +

        /* ======== 右侧：对话/旁白面板 ======== */
        '<div class="bt-right-panel" id="bt-right-panel">' +

          /* VN 对话框 */
          '<div class="vn-box" id="vn-box">' +
            /* 名字标签 */
            '<div class="vn-nameplate" id="vn-nameplate">' +
              '<span class="vn-speaker-name" id="vn-speaker-name"></span>' +
            '</div>' +
            /* 文字区域 */
            '<div class="vn-text-area" id="vn-text-area">' +
              '<p class="vn-text" id="vn-text"></p>' +
            '</div>' +
            /* 继续提示 */
            '<span class="vn-continue-hint" id="vn-continue-hint">&#9664; &#9664; \u70b9\u51fb\u7ee7\u7eed</span>' +
          '</div>' +

          /* 探索模式提示 */
          '<div class="vn-explore-hint" id="vn-explore-hint">' +
            '<span id="vn-explore-text"></span>' +
          '</div>' +

          /* 自由对话界面 */
          '<div class="bt-chat-panel" id="bt-chat-panel">' +
            '<div class="bt-chat-header">' +
              '<div class="bt-chat-title" id="bt-chat-title"></div>' +
              '<div class="bt-chat-characters" id="bt-chat-characters"></div>' +
            '</div>' +
            '<div class="bt-chat-messages" id="bt-chat-messages"></div>' +
            '<div class="bt-chat-prompts" id="bt-chat-prompts"></div>' +
            '<div class="bt-chat-input-row">' +
              '<input id="bt-input" type="text" autocomplete="off" placeholder="\u95ee\u4e00\u53e5\u8bdd..." />' +
              '<button id="bt-send">\u53d1\u9001</button>' +
            '</div>' +
          '</div>' +

        '</div>' +

        /* ======== 角色选择界面（覆盖层）===== */
        '<div class="bt-select-overlay" id="bt-select-overlay">' +
          '<div class="bt-select-inner">' +
            '<p class="bt-select-kicker">BOOK THEATER &middot; ' + this._esc(book.title) + '</p>' +
            '<h2 class="bt-select-title">\u9009\u62e9\u4f60\u7684\u89d2\u8272\u89c6\u89d2</h2>' +
            '<p class="bt-select-subtitle">\u4f60\u5c06\u4ee5\u8be5\u89d2\u8272\u7684\u7b2c\u4e00\u4eba\u79f0\u4f53\u9a8c\u6545\u4e8b</p>' +
            '<div class="bt-select-cards" id="bt-select-cards"></div>' +
          '</div>' +
        '</div>' +

      '</section>';
  },

  /* ==========================================================
     
     阶段1：角色选择
     ========================================================== */
  _showSelect: function() {
    this._state = 'select';
    this._hideCharacterModel();
    
    var overlay = document.getElementById('bt-select-overlay');
    var cards = document.getElementById('bt-select-cards');
    var vnBox = document.getElementById('vn-box');
    if (!overlay || !cards) return;

    overlay.classList.add('active');
    if (vnBox) vnBox.classList.remove('active');

    var self = this;
    cards.innerHTML = '';
    this._world.characters.forEach(function(char) {
      var card = document.createElement('div');
      card.className = 'bt-select-card';
      
      var imgHTML = '';
      if (char.image) {
        imgHTML = '<div class="bt-select-portrait" style="background-image:url(' + self._escAttr(char.image) + '?' + self._imgVer + ')"></div>';
      } else {
        imgHTML = '<span class="bt-select-avatar">' + self._esc(char.avatar || '?') + '</span>';
      }

      card.innerHTML =
        '<div class="bt-select-card-img">' + imgHTML + '</div>' +
        '<h3>' + self._esc(char.name) + '</h3>' +
        '<p class="bt-select-role">' + self._esc(char.role || '') + '</p>' +
        '<p class="bt-select-goal">' + self._esc(char.goal || '') + '</p>' +
        '<span class="bt-select-arrow">&rsaquo;</span>';

      card.onclick = function() { self._startStory(char); };
      cards.appendChild(card);
    });
  },

  /* ==========================================================
     
     阶段2：开始剧情
     ========================================================== */
  _startStory: function(character) {
    this._character = character;
    this._speaker = character;

    // 隐藏选择界面
    var overlay = document.getElementById('bt-select-overlay');
    if (overlay) overlay.classList.remove('active');

    // 显示立绘
    this._showCharacterModel(character);

    // 加载剧情线
    if (character.storyline && character.storyline.length > 0) {
      this._storyline = character.storyline;
      this._storyIndex = 0;
      this._state = 'story';

      var self = this;
      setTimeout(function() { self._advanceStep(); }, 400);
    } else {
      this._enterFreeChat(character.opening);
    }
  },

  /* ==========================================================
     剧情推进引擎
     ========================================================== */
  _advanceStep: function() {
    if (!this._storyline || this._storyIndex < 0 || this._storyIndex >= this._storyline.length) {
      this._enterFreeChat(this._character.closing || '\u6545\u4e8b\u5230\u6b64\u7ed3\u675f...');
      return;
    }

    var step = this._storyline[this._storyIndex];
    switch (step.type) {
      case 'narration':  this._showNarration(step); break;
      case 'dialogue':   this._showDialogue(step);  break;
      case 'explore':    this._showExplore(step);   break;
      case 'chat':       this._showChatUnlock(step); break;
      default:
        this._storyIndex++;
        this._advanceStep();
    }
  },

  /* ==========================================================
     旁白模式 — 无名字标签，斜体文字
     ========================================================== */
  _showNarration: function(step) {
    this._clearTimer();
    var vnBox = document.getElementById('vn-box');
    var textEl = document.getElementById('vn-text');
    var hintEl = document.getElementById('vn-continue-hint');
    if (!vnBox || !textEl) return;

    vnBox.classList.add('active');
    vnBox.classList.add('vn-narration-mode');
    
    textEl.textContent = '';
    if (hintEl) hintEl.style.opacity = '0';

    var fullText = step.text || '';
    var idx = 0;
    var speed = 40;
    var self = this;
    this._typingDone = false;

    this._typingTimer = setInterval(function() {
      if (idx < fullText.length) {
        textEl.textContent += fullText.charAt(idx);
        idx++;
      } else {
        self._clearTimer();
        self._typingDone = true;
        if (hintEl) hintEl.style.opacity = '1';
      }
    }, speed);

    vnBox.onclick = function(e) {
      e.stopPropagation();
      if (self._streaming) return;
      if (!self._typingDone) {
        self._clearTimer();
        textEl.textContent = fullText;
        self._typingDone = true;
        if (hintEl) hintEl.style.opacity = '1';
        return;
      }
      self._storyIndex++;
      self._advanceStep();
    };
  },

  /* ==========================================================
     对话模式 — 有名字标签 + 切换说话者立绘
     ========================================================== */
  _showDialogue: function(step) {
    this._clearTimer();
    var vnBox = document.getElementById('vn-box');
    var nameplate = document.getElementById('vn-nameplate');
    var nameEl = document.getElementById('vn-speaker-name');
    var textEl = document.getElementById('vn-text');
    var hintEl = document.getElementById('vn-continue-hint');
    if (!vnBox || !textEl) return;

    vnBox.classList.add('active');
    vnBox.classList.remove('vn-narration-mode');

    // 找到说话者
    var speakerChar = null;
    if (step.speaker === this._character.id) {
      speakerChar = this._character;
    } else {
      speakerChar = this._findChar(step.speaker);
    }

    if (nameEl) {
      nameEl.textContent = speakerChar ? speakerChar.name : (step.speaker || '');
    }

    // 切换到说话者的立绘（左侧！）
    if (speakerChar) {
      this._switchPortrait(speakerChar);
    }

    textEl.textContent = '';
    if (hintEl) hintEl.style.opacity = '0';

    var fullText = step.text || '';
    var idx = 0;
    var speed = 38;
    var self = this;
    this._typingDone = false;

    this._typingTimer = setInterval(function() {
      if (idx < fullText.length) {
        textEl.textContent += fullText.charAt(idx);
        idx++;
      } else {
        self._clearTimer();
        self._typingDone = true;
        if (hintEl) hintEl.style.opacity = '1';
      }
    }, speed);

    vnBox.onclick = function(e) {
      e.stopPropagation();
      if (self._streaming) return;
      if (!self._typingDone) {
        self._clearTimer();
        textEl.textContent = fullText;
        self._typingDone = true;
        if (hintEl) hintEl.style.opacity = '1';
        return;
      }
      self._storyIndex++;
      self._advanceStep();
    };
  },

  /* ==========================================================
     探索阶段
     ========================================================== */
  _showExplore: function(step) {
    this._clearTimer();
    
    var vnBox = document.getElementById('vn-box');
    if (vnBox) {
      vnBox.classList.remove('active');
      vnBox.onclick = null;
    }

    // 切换回当前角色的立绘
    this._switchPortrait(this._character);

    var exploreHint = document.getElementById('vn-explore-hint');
    var exploreText = document.getElementById('vn-explore-text');
    if (exploreHint && exploreText) {
      exploreText.textContent = step.text || '\u70b9\u51fb\u573a\u666f\u4e2d\u7684\u7ebf\u7d22\u63a2\u7d22';
      exploreHint.classList.add('active');
    }

    var hotspotsEl = document.getElementById('bt-hotspots');
    if (hotspotsEl) {
      hotspotsEl.innerHTML = '';
      var self = this;
      var spots = this._world.sceneHotspots || [];
      spots.forEach(function(spot) {
        var btn = document.createElement('button');
        btn.className = 'bt-hotspot hotspot-' + self._esc(spot.id || 'clue');
        btn.style.left = self._num(spot.x, 50) + '%';
        btn.style.top = self._num(spot.y, 50) + '%';
        btn.innerHTML = '<span></span><em>' + self._esc(spot.label || '\u7ebf\u7d22') + '</em>';
        btn.onclick = function(e) {
          e.stopPropagation();
          if (self._streaming) return;
          if (exploreHint) exploreHint.classList.remove('active');
          hotspotsEl.innerHTML = '';
          self._storyIndex++;
          self._advanceStep();
        };
        hotspotsEl.appendChild(btn);
      });
    }

    var stage = document.getElementById('bt-stage');
    if (stage && spots.length === 0) {
      var self = this;
      stage.onclick = function(e) {
        if (e.target.closest('.bt-close')) return;
        if (exploreHint) exploreHint.classList.remove('active');
        stage.onclick = null;
        self._storyIndex++;
        self._advanceStep();
      };
    } else if (stage) {
      var self = this;
      stage.onclick = function(e) {
        if (e.target.closest('.bt-hotspot') || e.target.closest('.bt-close') || e.target.closest('.vn-box')) return;
        if (exploreHint) exploreHint.classList.remove('active');
        hotspotsEl.innerHTML = '';
        stage.onclick = null;
        self._storyIndex++;
        self._advanceStep();
      };
    }
  },

  /* ==========================================================
     解锁自由对话
     ========================================================== */
  _showChatUnlock: function(step) {
    this._clearTimer();

    var fakeNarration = { text: step.text || '\u73b0\u5728\uff0c\u4f60\u53ef\u4ee5\u81ea\u7531\u5730\u4e0e' + this._character.name + '\u4ea4\u6d41\u4e86...' };
    var self = this;
    
    this._showNarration(fakeNarration);
    var vnBox = document.getElementById('vn-box');
    if (vnBox) {
      vnBox.onclick = function(e) {
        e.stopPropagation();
        if (self._streaming) return;
        if (!self._typingDone) {
          self._clearTimer();
          var txtEl = document.getElementById('vn-text');
          if (txtEl) txtEl.textContent = fakeNarration.text;
          self._typingDone = true;
          var hint = document.getElementById('vn-continue-hint');
          if (hint) hint.style.opacity = '1';
          return;
        }
        vnBox.onclick = null;
        self._storyIndex++;
        self._enterFreeChat('');
      };
    }
  },

  /* ==========================================================
     进入自由对话模式
     ========================================================== */
  _enterFreeChat: function(openingMsg) {
    this._state = 'free_chat';
    this._clearTimer();

    var vnBox = document.getElementById('vn-box');
    if (vnBox) {
      vnBox.classList.remove('active');
      vnBox.onclick = null;
    }
    var exploreHint = document.getElementById('vn-explore-hint');
    if (exploreHint) exploreHint.classList.remove('active');

    this._switchPortrait(this._character);

    var chatPanel = document.getElementById('bt-chat-panel');
    if (chatPanel) chatPanel.classList.add('active');

    this._renderChatHeader();

    var msgs = document.getElementById('bt-chat-messages');
    if (msgs && msgs.children.length === 0) {
      if (openingMsg && openingMsg.length > 0) {
        this._addChatMsg(openingMsg, 'character');
      } else if (this._character.opening) {
        this._addChatMsg(this._character.opening, 'character');
      }
    }

    this._renderPromptCards();
  },

  /* ==========================================================
     自由对话：渲染头部
     ========================================================== */
  _renderChatHeader: function() {
    var titleEl = document.getElementById('bt-chat-title');
    var charsEl = document.getElementById('bt-chat-characters');
    if (titleEl) {
      titleEl.textContent = this._world.sceneTitle || '';
    }
    if (!charsEl || !this._world.characters) return;

    var self = this;
    charsEl.innerHTML = '';
    this._world.characters.forEach(function(c) {
      var btn = document.createElement('button');
      btn.className = 'bt-chip' + (c.id === self._character.id ? ' active' : '');
      btn.textContent = c.name;
      btn.onclick = function() {
        if (self._streaming) return;
        self._character = c;
        self._switchPortrait(c);
        self._history = [];
        self._renderChatHeader();
        var msgs = document.getElementById('bt-chat-messages');
        if (msgs) msgs.innerHTML = '';
        if (c.opening) self._addChatMsg(c.opening, 'character');
        self._renderPromptCards();
      };
      charsEl.appendChild(btn);
    });
  },

  /* ==========================================================
     快捷问题卡片
     ========================================================== */
  _renderPromptCards: function() {
    var container = document.getElementById('bt-chat-prompts');
    if (!container) return;

    var cards = [];
    if (this._character.promptCards) cards = cards.concat(this._character.promptCards);
    if (this._world.globalPromptCards) cards = cards.concat(this._world.globalPromptCards);

    container.innerHTML = '';
    var self = this;
    cards.slice(0, 6).forEach(function(text) {
      var btn = document.createElement('button');
      btn.className = 'bt-prompt-chip';
      btn.textContent = text;
      btn.onclick = function() { self._ask(text); };
      container.appendChild(btn);
    });
  },

  /* ==========================================================
     立绘控制 — 显示在左侧！
     ========================================================== */
  _showCharacterModel: function(character) {
    var el = document.getElementById('bt-character-model');
    if (!el) return;
    el.innerHTML = this._figureHTML(character);
    el.style.opacity = '1';
  },

  _hideCharacterModel: function() {
    var el = document.getElementById('bt-character-model');
    if (el) el.style.opacity = '0';
  },

  _switchPortrait: function(character) {
    if (this._speaker === character) return;
    this._speaker = character;
    var el = document.getElementById('bt-character-model');
    if (!el) return;
    var self = this;
    el.style.opacity = '0';
    setTimeout(function() {
      el.innerHTML = self._figureHTML(character);
      el.style.opacity = '1';
    }, 220);
  },

  /* ==========================================================
     工具方法
     ========================================================== */
  _findChar: function(id) {
    if (!this._world || !this._world.characters) return null;
    for (var i = 0; i < this._world.characters.length; i++) {
      if (this._world.characters[i].id === id) return this._world.characters[i];
    }
    return null;
  },

  _clearTimer: function() {
    if (this._typingTimer) {
      clearInterval(this._typingTimer);
      this._typingTimer = null;
    }
  },

  _figureHTML: function(character) {
    var id = character ? character.id : 'unknown';
    if (character && character.image) {
      return '<div class="bt-portrait" style="--bt-character-image:url(' + this._escAttr(character.image) + '?' + this._imgVer + ')"></div>';
    }
    return '<div class="bt-figure"><span class="bt-figure-icon">' + this._esc(character ? (character.avatar || '?') : '?') + '</span></div>';
  },

  /* ==========================================================
     AI 对话
     ========================================================== */
  _sendInput: function() {
    var input = document.getElementById('bt-input');
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    this._ask(text);
  },

  _ask: function(text) {
    if (this._streaming || !this._character) return;
    this._streaming = true;

    this._addChatMsg(text, 'player');
    var typing = this._addChatTyping();
    var self = this;

    if (window.LLM && LLM.chatWithBookCharacter && (!LLM.hasConfiguredKey || LLM.hasConfiguredKey())) {
      LLM.chatWithBookCharacter(this._book, this._character, text, this._history, function(content, done) {
        if (typing && typing.parentNode) typing.remove();
        self._streamChatMsg(content, done);
      }).then(function(answer) {
        self._pushHistory(text, answer);
      }).catch(function() {
        if (typing && typing.parentNode) typing.remove();
        var fb = self.fallbackReply(text);
        self._streamChatMsg(fb, true);
        self._pushHistory(text, fb);
      });
    } else {
      setTimeout(function() {
        if (typing && typing.parentNode) typing.remove();
        var fb = self.fallbackReply(text);
        self._streamChatMsg(fb, true);
        self._pushHistory(text, fb);
      }, 260);
    }
  },

  /* ==========================================================
     聊天消息 UI
     ========================================================== */
  _addChatMsg: function(text, type) {
    var container = document.getElementById('bt-chat-messages');
    if (!container) return null;
    var div = document.createElement('div');
    div.className = 'bt-msg ' + type;
    var label = type === 'player' ? '\u4f60' : (this._character ? this._character.name : '\u4e66\u4e2d\u4eba\u7269');
    div.innerHTML = '<span>' + this._esc(label) + '</span><p>' + this._esc(text) + '</p>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
  },

  _addChatTyping: function() {
    var container = document.getElementById('bt-chat-messages');
    if (!container) return null;
    var div = document.createElement('div');
    div.className = 'bt-typing-msg';
    div.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
  },

  _streamChatMsg: function(content, done) {
    var container = document.getElementById('bt-chat-messages');
    if (!container) return;
    var bubble = document.getElementById('bt-stream-bubble');
    if (!bubble) {
      var msgDiv = this._addChatMsg('', 'character');
      bubble = msgDiv ? msgDiv.querySelector('p') : null;
      if (bubble) bubble.id = 'bt-stream-bubble';
    }
    if (bubble) {
      bubble.textContent = content;
      container.scrollTop = container.scrollHeight;
    }
    if (done) {
      if (bubble) bubble.removeAttribute('id');
      this._streaming = false;
    }
  },

  _pushHistory: function(q, a) {
    this._history.push({ role:'user', content:q });
    this._history.push({ role:'assistant', content:a });
    if (this._history.length > 8) this._history = this._history.slice(-8);
  },

  /* ==========================================================
     本地降级回复
     ============================================================ */
  fallbackReply: function(msg) {
    var c = this._character || {};
    if (c.id === 'holmes') {
      if (/\u89c2\u5bdf|\u7ebf\u7d22/.test(msg)) return '\u5148\u4ece\u6700\u5c0f\u7684\u4e8b\u5b9e\u5f00\u59cb\uff1a\u978b\u5e95\u3001\u8896\u53e3\u3001\u505c\u987f\u3001\u89c6\u7ebf\u3002\u4fa6\u63a2\u5148\u628a\u4e8b\u5b9e\u6440\u684c\u4e0a\uff0c\u518d\u8c08\u76d8\u5b50\u3002';
      return '别急着问答案。把你看见的三件小事写下来，再问：哪一件无法用常识解释？';
    }
    if (c.id === 'prince') {
      if (/\u5b64\u72ec/.test(msg)) return '\u5b64\u72ec\u7684\u65f6\u5019\uff0c\u5c31\u6162\u6162\u8bfb\u3002\u4f1a\u53d1\u73b0\u6709\u4e9b\u661f\u661f\u4e0d\u662f\u4e3a\u4e86\u7167\u4eae\u8def\uff0c\u800c\u662f\u4e3a\u4e86\u8ba9\u4f60\u77e5\u9053\u81ea\u5df1\u5e76\u4e0d\u662f\u4e00\u4e2a\u4eba\u3002';
      return '\u5982\u679c\u4f60\u613f\u610f\u4e3e\u4e00\u6735\u82b1\u6d47\u6c34\u3001\u6321\u98ce\u3001\u542c\u5979\u8bf4\u8bdd\uff0c\u5979\u5c31\u4e0d\u518d\u53ea\u662f\u5343\u4e07\u6735\u82b1\u4e2d\u7684\u4e00\u6735\u3002';
    }
    if (c.id === 'fox') return '\u771f\u6b63\u91cd\u8981\u7684\u4e1c\u897f\u5e38\u5e38\u5f88\u5b89\u9759\u3002\u5b83\u4e0d\u4f1a\u558a\u4f60\uff0c\u53ea\u4f1a\u5728\u4f60\u6bcf\u5929\u51c6\u65f6\u5230\u8fbe\u65f6\u6084\u6084\u53d8\u5f97\u4e0d\u53ef\u66ff\u4ee3\u3002';
    if (c.id === 'rose') return '\u7231\u4e00\u6735\u82b1\u4e0d\u662f\u8bc1\u660e\u5979\u5b8c\u7f8e\uff0c\u800c\u662f\u5728\u5979\u4efb\u6027\u3001\u654f\u611f\u3001\u5e26\u523a\u7684\u65f6\u5019\uff0c\u4ecd\u7136\u613f\u610f\u66ff\u5979\u7f69\u4e0a\u73bb\u7483\u7f69\u3002';
    if (c.id === 'watson') return '\u63a8\u7406\u6545\u4e8b\u7684\u597d\u5904\uff0c\u4e0d\u53ea\u662f\u8c1c\u5e95\u3002\u5b83\u8ba9\u4f60\u5728\u4e0d\u5b89\u91cc\u4fdd\u6301\u8010\u5fc3\uff0c\u5728\u590d\u6742\u91cc\u7ec3\u4e60\u6e05\u9192\u3002';
    if (c.id === 'lestrade') return '\u8b66\u65b9\u5e38\u72af\u7684\u9519\uff0c\u662f\u5148\u76f8\u4fe1\u6700\u54cd\u4eae\u7684\u89e3\u91ca\u3002\u8bc1\u636e\u5fc5\u987b\u80fd\u88ab\u53cd\u590d\u68c0\u67e5\uff0c\u4e0d\u80fd\u53ea\u8ba9\u4eba\u89c9\u5f97\u5408\u7406\u3002';
    return '\u6211\u4e0d\u559c\u6b22\u6f02\u4eae\u731c\u60f3\u3002\u7ed9\u6211\u65f6\u95f4\u3001\u5730\u70b9\u3001\u8bc1\u4eba\u548c\u7269\u8bc1\uff0c\u7136\u540e\u6211\u4eec\u518d\u8c08\u8c01\u6700\u53ef\u7591\u3002';
  },

  /* ==========================================================
     HTML 安全
     ============================================================ */
  _esc: function(t) {
    return String(t == null ? '' : t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  },
  _escAttr: function(t) {
    return String(t == null ? '' : t).replace(/["'()\\\n\r]/g, '');
  },
  _num: function(v, fallback) {
    var n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  },
  _sceneStyle: function(w) {
    if (!w || !w.sceneImage) return '';
    return ' style="--bt-scene-image:url(' + this._escAttr(w.sceneImage) + ')"';
  },

  /* ==========================================================
     事件绑定
     ============================================================ */
  _bind: function() {
    var closeBtn = document.getElementById('bt-close');
    var backdrop = document.querySelector('#book-theater .bt-backdrop');
    var sendBtn = document.getElementById('bt-send');
    var inputEl = document.getElementById('bt-input');

    var self = this;
    if (closeBtn) closeBtn.onclick = function() { self.close(); };
    if (backdrop) backdrop.onclick = function() { self.close(); };
    if (sendBtn) sendBtn.onclick = function() { self._sendInput(); };
    if (inputEl) {
      inputEl.onkeydown = function(e) {
        if (e.key === 'Enter') { e.preventDefault(); self._sendInput(); }
      };
    }
  }
};

/* ==========================================================
   示范按钮绑定
   ============================================================ */
function bindBookTheaterDemoButton() {
  var btn = document.getElementById('demo-open-theater');
  if (!btn) return;
  btn.onclick = function() {
    var book = null;
    if (typeof GameData !== 'undefined' && GameData.books) {
      for (var i = 0; i < GameData.books.length; i++) {
        if (GameData.books[i].id === 'b25') { book = GameData.books[i]; break; }
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
