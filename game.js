/* ============================================================
   最后的书店 v6.0 - 主控制器（重写）
   显式转移，无 setTimeout 嵌套回调
   ============================================================ */

var Game = {
  // 单步状态机：IDLE / TYPING / WAITING_FOR_CHOICE / WAITING_FOR_ACTION / TRANSITION
  _inputState: 'IDLE',

  init: function() {
    Engine.init();
    Renderer.init();
    AudioManager.init();

    var startBtn = document.getElementById('btn-start');
    if (startBtn) startBtn.onclick = function() { Game.startGame(); };

    this._bindTopButtons();
    this._initDemoMode();
  },

  _bindTopButtons: function() {
    var saveBtn = document.getElementById('btn-save');
    var menuBtn = document.getElementById('btn-menu');
    var muteBtn = document.getElementById('btn-mute');
    var libraryBtn = document.getElementById('btn-library');
    var myStoreBtn = document.getElementById('btn-mystore');
    if (saveBtn) saveBtn.onclick = function() { Game.showSaveMenu(); };
    if (menuBtn) menuBtn.onclick = function() { Game.showMenu(); };
    if (muteBtn) muteBtn.onclick = function() { AudioManager.toggleMute(); Renderer.updateMuteBtn(); };
    if (libraryBtn) libraryBtn.onclick = function() { Game.openLibrary(); };
    if (myStoreBtn) myStoreBtn.onclick = function() {
      console.log('[Game] MyStore button clicked');
      if (window.MyStore) {
        try {
          MyStore.open();
        } catch(e) {
          console.error('[Game] MyStore.open() error:', e);
          alert('打开我的书店时出错：' + e.message);
        }
      } else {
        console.error('[Game] window.MyStore not found!');
        alert('我的书店功能未加载，请刷新页面重试。');
      }
    };

    // AI 自由交谈按钮
    var aiChatBtn = document.getElementById('btn-ai-chat');
    if (aiChatBtn) {
      aiChatBtn.onclick = function() {
        var npc = Engine.state.currentNPC;
        if (!npc) return;
        // 从 NPC 数据构建上下文
        var npcData = {
          name: npc.name,
          tag: npc.tag || '',
          mood: npc.mood || '有些心事',
          backstory: Game._buildNPCBackstory(npc),
          currentTopic: Game._buildNPCTopic(npc)
        };
        Renderer.openAIChat({ type: 'npc', title: '💬 和 ' + npc.name + ' 聊天', data: npcData });
      };
    }
  },

  /* ============ 启动 / 重启 ============ */
  startGame: function() {
    AudioManager.playBGM('morning');
    Renderer.showScreen('game-screen');
    Engine.state.phase = 'narrative';
    Engine.state.day = 1;
    Engine.state.timeOfDay = 'morning';
    Renderer.updateTopBar();

    // 第一天先展示叙事
    Renderer.showNarrative(function() {
      Engine.startDay();
      Renderer.renderScene();
      Renderer.updateTopBar();
      Renderer.showDoorbell(true);
    });
  },

  /* ============ 门铃 ============ */
  onDoorbellClicked: function() {
    AudioManager.playSFX('doorbell');
    Renderer.showDoorbell(false);

    if (Engine.hasMoreCustomers()) {
      var npc = Engine.advanceCustomer();
      if (npc) {
        Renderer.renderScene();
        Renderer.showDialoguePanel(true);
        this._renderCurrentDialogue();
      } else {
        this._showNight();
      }
    } else {
      this._showNight();
    }
  },

  /* ============ 单步渲染当前对话 ============ */
  _renderCurrentDialogue: function() {
    var diag = Engine.getCurrentDialogue();
    if (!diag) {
      // 对话结束，看是否要推荐 / 跳转
      this._afterDialogueDone();
      return;
    }

    Renderer.hideOptions();
    Renderer.hideActions();

    // 显示 AI 自由交谈按钮
    document.getElementById('dlg-ai-chat').classList.remove('hidden');

    var npc = Engine.state.currentNPC;
    var isNarrator = !!diag.isNarrator;

    Renderer.setDialogueContent(
      diag.text,
      isNarrator ? '' : npc.name,
      isNarrator ? '' : npc.tag,
      isNarrator
    );

    if (diag.options && diag.options.length > 0) {
      this._inputState = 'TYPING';
      // 打字完成后再显示选项
      Renderer.setAdvanceCallback(function() {
        if (Game._inputState === 'TYPING') {
          Renderer.skipTyping();
        }
        Game._showCurrentOptions();
        Game._inputState = 'WAITING_FOR_CHOICE';
      });
    } else if (diag.action === 'recommend') {
      this._inputState = 'TYPING';
      Renderer.setAdvanceCallback(function() {
        if (Game._inputState === 'TYPING') {
          Renderer.skipTyping();
        }
        Game._showRecommendAction();
        Game._inputState = 'WAITING_FOR_ACTION';
      });
    } else {
      // 普通 narration / npc 独白，点了就下一句
      this._inputState = 'TYPING';
      Renderer.setAdvanceCallback(function() {
        if (Game._inputState === 'TYPING') {
          Renderer.skipTyping();
        }
        Engine.state.dialogueIndex++;
        Game._renderCurrentDialogue();
      });
    }
  },

  _showCurrentOptions: function() {
    var diag = Engine.getCurrentDialogue();
    if (!diag || !diag.options) return;
    var self = this;
    Renderer.showOptions(diag.options, function(idx) {
      // 应用选项
      var opt = diag.options[idx];
      if (opt && opt.effect) {
        Engine.state.hope = Math.max(0, Math.min(100, Engine.state.hope + (opt.effect.hopeChange || 0)));
        Engine.state.reputation += (opt.effect.repChange || 0);
      }
      Engine.state.dialogueIndex++;
      // 显示选项反馈
      var next = Engine.getCurrentDialogue();
      if (next && opt && opt.response) {
        next.text = opt.response;
        next.isResponse = true;
      }
      Renderer.updateTopBar();
      self._renderCurrentDialogue();
    });
  },

  _showRecommendAction: function() {
    Renderer.showAction('recommend', '推荐一本书', function() {
      Game._openBookshelf();
    });
  },

  openLibrary: function() {
    Renderer.showBookshelf(null, { freeBrowse: true });
  },

  /* ============ 现场演示模式 ============ */
  _initDemoMode: function() {
    var demoOn = false;
    try {
      demoOn = new URLSearchParams(location.search).has('demo') ||
        localStorage.getItem('tlb_demo_mode') === '1';
    } catch (e) {}
    if (!demoOn) return;

    var bar = document.getElementById('demo-toolbar');
    if (!bar) return;
    bar.classList.remove('hidden');
    this._bindDemoToolbar();
    this._updateDemoAIStatus();
  },

  _bindDemoToolbar: function() {
    var start = document.getElementById('demo-start-flow');
    var toggle = document.getElementById('demo-toggle');
    var ending = document.getElementById('demo-show-ending');
    var mystore = document.getElementById('demo-open-mystore');
    var theater = document.getElementById('demo-open-theater');

    if (toggle) toggle.onclick = function() {
      var bar = document.getElementById('demo-toolbar');
      if (bar) bar.classList.toggle('collapsed');
    };
    if (start) start.onclick = function() { Game.startGame(); };
    if (ending) ending.onclick = function() {
      Game._seedDemoJourney();
      Renderer.showEnding(GameData.endings.trueEnding, function() { location.reload(); }, function() {
        if (window.MyStore) MyStore.open();
      });
    };
    if (mystore) mystore.onclick = function() {
      Game._seedDemoJourney();
      if (window.MyStore) MyStore.open();
    };
    if (theater) theater.onclick = function() { Game.openDemoTheater(); };
  },

  _updateDemoAIStatus: function() {
    var status = document.getElementById('demo-ai-status');
    if (!status) return;
    status.textContent = 'AI: MiniMax';
    status.classList.add('live');
  },

  _hasDemoAIKey: function() {
    return !!(window.LLM && LLM.hasConfiguredKey && LLM.hasConfiguredKey());
  },

  _seedDemoJourney: function() {
    Engine.state.day = 7;
    Engine.state.daysCompleted = 7;
    Engine.state.hope = 86;
    Engine.state.reputation = 28;
    Engine.state.timeOfDay = 'night';
    Engine.state.totalPerfect = 5;
    Engine.state.totalGood = 3;
    Engine.state.metTraveler = true;
    Engine.state.servedNPCs = ['linYue', 'chenBo', 'xiaoMing', 'liDoctor', 'fangMiss', 'traveler'];
    Engine.state.bookLog = [
      { day: 1, npcId: 'linYue', npcName: '林月', bookId: 'b05', bookTitle: '活出生命的意义', match: 'perfect' },
      { day: 1, npcId: 'chenBo', npcName: '陈伯', bookId: 'b13', bookTitle: '匠人', match: 'perfect' },
      { day: 2, npcId: 'xiaoMing', npcName: '小明', bookId: 'b01', bookTitle: '小王子', match: 'perfect' },
      { day: 3, npcId: 'liDoctor', npcName: '李医生', bookId: 'b09', bookTitle: '当呼吸化为空气', match: 'perfect' }
    ];
    Engine.state.mylist = [
      { bookId: 'b05', bookTitle: '活出生命的意义', author: '[奥] 弗兰克尔', day: 1, npcId: 'linYue', npcName: '林月', addedAt: Date.now() },
      { bookId: 'b01', bookTitle: '小王子', author: '[法] 圣埃克苏佩里', day: 2, npcId: 'xiaoMing', npcName: '小明', addedAt: Date.now() }
    ];
    Renderer.updateTopBar();
  },

  openDemoTheater: function() {
    var book = null;
    for (var i = 0; i < GameData.books.length; i++) {
      if (GameData.books[i].id === 'b25') {
        book = GameData.books[i];
        break;
      }
    }
    if (book && window.BookTheater) BookTheater.open(book);
  },

  _openBookshelf: function() {
    Renderer.showDialoguePanel(false);
    Renderer.showBookshelf(function(bookId) {
      var result = Engine.evaluateBook(bookId);
      if (result) {
        Renderer.hideBookshelf();
        Renderer.showResult(result, function() {
          // 结果确认后继续
          if (Engine.hasMoreCustomers()) {
            Engine.setPhase('doorbell');
            Renderer.renderScene();
            setTimeout(function() { Renderer.showDoorbell(true); }, 400);
          } else {
            Game._showNight();
          }
        });
      }
    });
  },

  _afterDialogueDone: function() {
    if (Engine.hasMoreCustomers()) {
      Engine.setPhase('doorbell');
      Renderer.renderScene();
      setTimeout(function() { Renderer.showDoorbell(true); }, 400);
    } else {
      this._showNight();
    }
  },

  /* ============ 夜间 / 结局 ============ */
  _showNight: function() {
    Engine.endDay();
    AudioManager.playBGM('night');
    AudioManager.playSFX('night');
    Renderer.renderScene();
    Renderer.showDialoguePanel(false);

    var ending = Engine.checkEnding();
    if (ending) {
      Renderer.showEnding(ending, function() { location.reload(); }, function() {
        if (window.MyStore) MyStore.open();
      });
      return;
    }

    var stats = [];
    if (Engine.state.bookLog.length > 0) {
      var todayLogs = Engine.state.bookLog.filter(function(l) { return l.day === Engine.state.day - 1; });
      if (todayLogs.length > 0) {
        stats.push('今日推荐了 ' + todayLogs.length + ' 本书');
      }
    }
    stats.push('累计完美推荐 ' + Engine.state.totalPerfect + ' 次');
    stats.push('累计 ' + Engine.state.totalGood + ' 次尚可');

    Renderer.showNight(stats, function() {
      Game._nextDay();
    });
  },

  _nextDay: function() {
    document.getElementById('night-panel').classList.add('hidden');
    AudioManager.playBGM('morning');
    Engine.state.timeOfDay = 'morning';
    Renderer.renderScene();
    Renderer.updateTopBar();

    // 检查结局
    var ending = Engine.checkEnding();
    if (ending) {
      Renderer.showEnding(ending, function() { location.reload(); }, function() {
        if (window.MyStore) MyStore.open();
      });
      return;
    }

    // 每天开始前展示叙事
    Renderer.showNarrative(function() {
      Engine.startDay();
      Renderer.renderScene();
      Renderer.updateTopBar();
      Renderer.showDoorbell(true);
    });
  },

  /* ============ 存档菜单 ============ */
  showSaveMenu: function() {
    var slotsHtml = '';
    for (var i = 1; i <= 3; i++) {
      var infoStr = localStorage.getItem('tlb_save_info_' + i);
      var info = null;
      try { info = infoStr ? JSON.parse(infoStr) : null; } catch (e) {}
      if (info && info.day) {
        slotsHtml += '<div class="save-row">' +
          '<div class="save-info"><div class="save-day">存档 ' + i + ' — 第 ' + info.day + ' 天</div>' +
          '<div class="save-time">' + (info.time || '') + '</div></div>' +
          '<div class="save-btns">' +
            '<button class="sl-btn sl-save" data-act="save" data-slot="' + i + '">覆盖</button>' +
            '<button class="sl-btn sl-load" data-act="load" data-slot="' + i + '">读取</button>' +
          '</div></div>';
      } else {
        slotsHtml += '<div class="save-row"><span class="slot-empty">空存档</span>' +
          '<div class="save-btns"><button class="sl-btn sl-save" data-act="save" data-slot="' + i + '">保存</button></div></div>';
      }
    }

    var overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML =
      '<div class="menu-box">' +
        '<h3>📁 存档管理</h3>' +
        '<div class="save-list">' + slotsHtml + '</div>' +
        '<button class="menu-item" id="sv-close">关闭</button>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.onclick = function(e) {
      if (e.target === overlay) overlay.remove();
      if (e.target.id === 'sv-close') overlay.remove();
      var act = e.target.getAttribute('data-act');
      if (act === 'save') { Engine.save(parseInt(e.target.getAttribute('data-slot'))); alert('已保存到存档 ' + e.target.getAttribute('data-slot')); overlay.remove(); }
      if (act === 'load') {
        var slot = parseInt(e.target.getAttribute('data-slot'));
        if (confirm('确定读取存档 ' + slot + '？当前进度会丢失。')) {
          if (Engine.load(slot)) location.reload();
          else alert('存档为空！');
        }
      }
    };
  },

  /* ============ 主菜单 ============ */
  showMenu: function() {
    var overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML =
      '<div class="menu-box">' +
        '<h3>☰ 菜单</h3>' +
        '<button class="menu-item" id="m-save">📁 存档管理</button>' +
        '<button class="menu-item" id="m-restart">🔄 重新开始</button>' +
        '<button class="menu-item" id="m-mute">🔊 静音切换</button>' +
        '<button class="menu-item" id="m-close">关闭</button>' +
      '</div>';
    document.body.appendChild(overlay);

    document.getElementById('m-save').onclick = function() { overlay.remove(); Game.showSaveMenu(); };
    document.getElementById('m-restart').onclick = function() { if (confirm('重新开始？当前进度会丢失。')) location.reload(); };
    document.getElementById('m-mute').onclick = function() { AudioManager.toggleMute(); Renderer.updateMuteBtn(); };
    document.getElementById('m-close').onclick = function() { overlay.remove(); };
    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
  },

  /* ============ NPC 上下文构建（给 AI） ============ */
  _buildNPCBackstory: function(npc) {
    // 从 NPC 的对话数据中提取故事背景
    var dia = npc.dialogue || [];
    var lines = [];
    for (var i = 0; i < Math.min(dia.length, 3); i++) {
      if (dia[i].isNarrator && dia[i].text) lines.push(dia[i].text);
      if (dia[i].speaker === npc.id && dia[i].text) lines.push(dia[i].text);
    }
    return lines.join(' ');
  },

  _buildNPCTopic: function(npc) {
    // 提取 NPC 当前在意的话题
    var dia = npc.returnDialogue || npc.dialogue || [];
    if (dia.length >= 3) {
      var last = dia[dia.length - 2]; // 倒数第二句通常是问题
      if (last && last.text) return last.text.replace(/"/g, '');
    }
    var tag = npc.tag || '';
    return tag + '站在书店里，准备说出自己的心事。';
  }
};

/* ============ DOM Ready ============ */
document.addEventListener('DOMContentLoaded', function() {
  Game.init();
});
