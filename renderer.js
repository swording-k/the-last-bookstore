/* ============================================================
   最后的书店 v6.0 - 渲染器（重写）
   DOM 渲染 + 打字机 + 面板
   ============================================================ */

var Renderer = {
  _typeTimer: null,
  _typeSpeed: 32,        // ms/字
  _typeState: 'IDLE',    // IDLE / TYPING / WAITING
  _advanceCb: null,
  _resultCallback: null,

  init: function() {
    this._bindDialogueClick();
    SceneFX.init();
    this.updateTopBar();
    this.updateMuteBtn();
  },

  /* ============ 屏幕切换 ============ */
  showScreen: function(id) {
    var els = document.querySelectorAll('.screen');
    for (var i = 0; i < els.length; i++) els[i].classList.remove('active');
    var el = document.getElementById(id);
    if (el) el.classList.add('active');
  },

  /* ============ 每日清晨叙事 ============ */
  showNarrative: function(onContinue) {
    var panel = document.getElementById('narrative-panel');
    if (!panel) return;
    panel.classList.remove('hidden');

    var day = Engine.state.day;
    var narratives = GameData.dayNarratives;
    var nar = narratives[Math.min(day - 1, narratives.length - 1)];

    var dayEl = document.getElementById('nar-day');
    var titleEl = document.getElementById('nar-title');
    var textEl = document.getElementById('nar-text');
    var goalEl = document.getElementById('nar-goal');
    var sceneBg = document.getElementById('nar-scene');
    var btn = document.getElementById('nar-continue');

    if (dayEl) dayEl.textContent = 'DAY ' + day + ' · ' + nar.mood;
    if (titleEl) titleEl.textContent = nar.title;
    if (textEl) textEl.textContent = nar.text;
    if (goalEl) goalEl.textContent = nar.goal;

    // 场景背景色（渐变模拟氛围）
    if (sceneBg && nar.sceneBg) {
      sceneBg.style.background = 'linear-gradient(180deg, ' + nar.sceneBg + ' 0%, var(--color-paper) 100%)';
    }

    // 按钮文案
    if (btn) {
      btn.textContent = day === 7 ? '推开最后的门' : '推开今天的门';
      btn.onclick = function() {
        panel.classList.add('hidden');
        if (onContinue) onContinue();
      };
    }
  },

  /* ============ 场景 ============ */
  renderScene: function() {
    var scene = document.getElementById('scene-area');
    if (!scene) return;

    // 时段切换场景图
    var tod = Engine.state.timeOfDay;
    SceneFX.transitionTo(tod);

    // NPC 渲染
    this._renderNPC();
  },

  _renderNPC: function() {
    var container = document.getElementById('npc-sprite');
    var wrap = document.getElementById('npc-wrap');
    if (!container || !wrap) return;

    var npc = Engine.state.currentNPC;
    if (!npc || Engine.state.phase !== 'dialogue') {
      container.innerHTML = '';
      wrap.classList.add('hidden');
      return;
    }
    wrap.classList.remove('hidden');
    // 用立绘 PNG
    var img = document.createElement('img');
    img.src = 'assets/portraits/' + npc.id + '.png';
    img.alt = npc.name;
    img.className = 'npc-portrait';
    img.onerror = function() {
      // 加载失败：fallback 到 SVG
      this.outerHTML = Renderer._portraitSVG(npc, 200);
    };
    container.innerHTML = '';
    container.appendChild(img);
  },

  _portraitSVG: function(npc, size) {
    // 占位 SVG，理论上 PNG 都加载成功
    var c = npc.colors || { skin:'#F5DEB3', clothes:'#7B68EE', hair:'#4A3728' };
    var s = size;
    var svg = '<svg width="' + s + '" height="' + Math.round(s * 1.3) + '" viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg" style="image-rendering:pixelated">' +
      '<rect x="25" y="55" width="50" height="60" rx="8" fill="' + c.clothes + '"/>' +
      '<rect x="40" y="48" width="20" height="12" fill="' + c.skin + '"/>' +
      '<ellipse cx="50" cy="32" rx="26" ry="28" fill="' + c.skin + '"/>' +
      '<path d="M24 28 Q26 4 50 6 Q74 4 76 28 L68 14 L32 14 Z" fill="' + c.hair + '"/>' +
      '<ellipse cx="39" cy="30" rx="5" ry="6" fill="white"/><circle cx="40" cy="31" r="2.5" fill="#333"/>' +
      '<ellipse cx="61" cy="30" rx="5" ry="6" fill="white"/><circle cx="60" cy="31" r="2.5" fill="#333"/>' +
      '<path d="M43 48 Q50 53 57 48" stroke="#B07070" stroke-width="2" fill="none"/>' +
      '</svg>';
    return svg;
  },

  /* ============ 顶栏 ============ */
  updateTopBar: function() {
    var dayEl = document.getElementById('day-display');
    var timeEl = document.getElementById('time-display');
    var hopeFill = document.getElementById('hope-fill');
    var hopeNum = document.getElementById('hope-num');
    var repEl = document.getElementById('rep-display');

    if (dayEl) dayEl.textContent = '第 ' + Engine.state.day + ' 天';
    if (timeEl) timeEl.textContent = Engine.getTimeLabel();
    if (hopeFill) {
      hopeFill.style.width = Engine.state.hope + '%';
      // 颜色随值变化
      if (Engine.state.hope >= 70) hopeFill.style.background = 'linear-gradient(90deg, #7FB069, #4A8B3A)';
      else if (Engine.state.hope >= 40) hopeFill.style.background = 'linear-gradient(90deg, #D4A574, #B8844E)';
      else hopeFill.style.background = 'linear-gradient(90deg, #B05F4E, #8B3A2E)';
    }
    if (hopeNum) hopeNum.textContent = Engine.state.hope;
    if (repEl) repEl.textContent = '声誉 ' + Engine.state.reputation;
  },

  updateMuteBtn: function() {
    var btn = document.getElementById('btn-mute');
    if (btn) btn.textContent = AudioManager.isMuted() ? '🔇' : '🔊';
  },

  /* ============ 门铃 ============ */
  showDoorbell: function(show) {
    var el = document.getElementById('doorbell');
    if (!el) return;
    if (show) {
      el.classList.remove('hidden');
      el.style.animation = 'none';
      void el.offsetHeight;
      el.style.animation = '';
    } else {
      el.classList.add('hidden');
    }
  },

  /* ============ 对话面板 ============ */
  showDialoguePanel: function(show) {
    var panel = document.getElementById('dialogue-panel');
    if (panel) panel.classList.toggle('hidden', !show);
    // 同步控制 AI 聊天按钮
    var aiBtn = document.getElementById('dlg-ai-chat');
    if (aiBtn) aiBtn.classList.toggle('hidden', !show);
  },

  setDialogueContent: function(text, speakerName, tag, isNarrator) {
    var nameEl = document.getElementById('dlg-name');
    var tagEl = document.getElementById('dlg-tag');
    var portEl = document.getElementById('dlg-portrait');
    var textEl = document.getElementById('dlg-text');
    var nameBox = tagEl ? tagEl.parentElement : null;

    if (nameBox) nameBox.style.display = isNarrator ? 'none' : 'flex';
    if (nameEl) nameEl.textContent = isNarrator ? '' : (speakerName || '');
    if (tagEl) tagEl.textContent = isNarrator ? '' : (tag || '');

    if (portEl) {
      var npc = Engine.state.currentNPC;
      if (npc && !isNarrator) {
        var portrait = document.createElement('img');
        portrait.src = 'assets/portraits/' + npc.id + '.png';
        portrait.alt = npc.name;
        portrait.onerror = function() { this.outerHTML = Renderer._portraitSVG(npc, 56); };
        portEl.innerHTML = '';
        portEl.appendChild(portrait);
        portEl.style.display = 'block';
      } else {
        portEl.innerHTML = '';
        portEl.style.display = 'none';
      }
    }

    if (textEl) this.typeText(textEl, text || '');
  },

  /* ============ 打字机 ============ */
  typeText: function(el, fullText) {
    if (this._typeTimer) {
      clearTimeout(this._typeTimer);
      this._typeTimer = null;
    }
    this._typeState = 'TYPING';
    el.innerHTML = '';
    el.classList.add('typing');

    var idx = 0;
    var self = this;
    function step() {
      if (idx < fullText.length) {
        el.innerHTML = fullText.substring(0, idx + 1).replace(/\n/g, '<br>');
        idx++;
        self._typeTimer = setTimeout(step, self._typeSpeed);
      } else {
        el.classList.remove('typing');
        self._typeState = 'WAITING';
        // 箭头提示
        var hint = document.createElement('span');
        hint.className = 'cursor-hint';
        hint.textContent = ' ▼';
        el.appendChild(hint);
        if (self._advanceCb) {
          var cb = self._advanceCb;
          self._advanceCb = null;
          cb();
        }
      }
    }
    step();
  },

  skipTyping: function() {
    if (this._typeTimer) {
      clearTimeout(this._typeTimer);
      this._typeTimer = null;
    }
    this._typeState = 'IDLE';
  },

  setAdvanceCallback: function(cb) {
    this._advanceCb = cb;
  },

  /* ============ 统一点击处理 ============ */
  _bindDialogueClick: function() {
    var panel = document.getElementById('dialogue-panel');
    if (!panel) return;
    var self = this;
    panel.addEventListener('click', function(e) {
      // 选项/操作按钮的点击由自己的 listener 处理，不在这里响应
      if (e.target.closest('.opt-btn') || e.target.closest('.act-btn')) return;

      if (self._typeState === 'TYPING') {
        // 跳过打字，显示完整文字
        var textEl = document.getElementById('dlg-text');
        if (textEl) {
          var npc = Engine.state.currentNPC;
          var diag = Engine.getCurrentDialogue();
          if (diag) {
            textEl.innerHTML = diag.text.replace(/\n/g, '<br>') +
              '<span class="cursor-hint"> ▼</span>';
          }
          self._typeState = 'WAITING';
        }
      } else if (self._typeState === 'WAITING' && self._advanceCb) {
        var cb = self._advanceCb;
        self._advanceCb = null;
        cb();
      }
    });
  },

  /* ============ 选项 ============ */
  showOptions: function(options, onSelect) {
    var container = document.getElementById('dlg-options');
    if (!container) return;
    container.innerHTML = '';
    container.classList.remove('hidden');

    for (var i = 0; i < options.length; i++) {
      (function(opt, idx) {
        var btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.textContent = opt.text;
        btn.onclick = function(ev) {
          ev.stopPropagation();
          Renderer._typeState = 'IDLE';
          container.classList.add('hidden');
          onSelect(idx);
        };
        container.appendChild(btn);
      })(options[i], i);
    }
  },

  hideOptions: function() {
    var el = document.getElementById('dlg-options');
    if (el) { el.innerHTML = ''; el.classList.add('hidden'); }
  },

  /* ============ 操作按钮（推荐 / 下一句）============ */
  showAction: function(atype, label, onClick) {
    var area = document.getElementById('dlg-action');
    if (!area) return;
    area.classList.remove('hidden');
    area.innerHTML = '';
    // 推荐阶段隐藏 AI 闲聊按钮，聚焦在推荐动作上
    document.getElementById('dlg-ai-chat').classList.add('hidden');

    var cls = atype === 'recommend' ? 'act-btn act-rec' : 'act-btn act-next';
    var btn = document.createElement('button');
    btn.className = cls;
    btn.textContent = label;
    btn.onclick = function(ev) {
      ev.stopPropagation();
      Renderer._typeState = 'IDLE';
      area.classList.add('hidden');
      onClick();
    };
    area.appendChild(btn);
  },

  hideActions: function() {
    var area = document.getElementById('dlg-action');
    if (area) { area.innerHTML = ''; area.classList.add('hidden'); }
  },

  /* ============ 书架选书 ============ */
  showBookshelf: function(onSelectBook, options) {
    options = options || {};
    var freeBrowse = !!options.freeBrowse;
    var panel = document.getElementById('book-panel');
    if (!panel) return;
    panel.classList.remove('hidden');

    var grid = document.getElementById('book-grid');
    var hintEl = document.getElementById('bk-hint');
    var titleEl = panel.querySelector('.bk-header h3');
    if (!grid) return;
    grid.innerHTML = '';

    var npc = Engine.state.currentNPC;
    if (titleEl) {
      titleEl.textContent = freeBrowse ? '📖 自由书库 — 随便翻一本书' : '📚 书架 — 选一本书推荐给 TA';
    }
    if (hintEl && freeBrowse) {
      hintEl.textContent = '不用等待 NPC。你可以直接查看书籍简介、进入书中剧场，或和店主聊这本书。';
    } else if (hintEl && npc) {
      hintEl.textContent = npc.name + ' 此刻最需要的是……';
    } else if (hintEl) {
      hintEl.textContent = '';
    }

    var books = GameData.books;
    var cats = GameData.categories;

    // 当前激活的分类筛选（null = 全部）
    var activeCat = null;

    // 渲染分类 tab 和书籍网格的函数
    var self = this;
    renderFeaturedTheaterBooks();

    function orderedBooks() {
      if (freeBrowse) {
        var theaterBooks = books.filter(function(book) { return !!book.bookWorld; });
        var ordinaryBooks = books.filter(function(book) { return !book.bookWorld; });
        return theaterBooks.concat(ordinaryBooks);
      }
      return books.slice();
    }

    function renderFeaturedTheaterBooks() {
      var old = document.getElementById('bk-featured-theaters');
      if (old) old.remove();
      if (!freeBrowse || !hintEl || !hintEl.parentNode) return;

      var theaterBooks = books.filter(function(book) { return !!book.bookWorld; });
      if (theaterBooks.length === 0) return;

      var box = document.createElement('div');
      box.id = 'bk-featured-theaters';
      box.className = 'bk-featured-theaters';
      box.innerHTML = '<div class="bk-featured-head"><strong>沉浸式剧场推荐</strong><span>这些书可以直接进入角色对谈</span></div>';

      var row = document.createElement('div');
      row.className = 'bk-featured-row';
      theaterBooks.forEach(function(book) {
        var btn = document.createElement('button');
        btn.className = 'bk-featured-card';
        btn.innerHTML =
          '<span>进入剧场</span>' +
          '<strong>' + book.title + '</strong>' +
          '<em>' + ((book.bookWorld && book.bookWorld.sceneTitle) || '书中世界') + '</em>';
        btn.onclick = function() {
          if (window.BookTheater) {
            BookTheater.open(book);
          } else {
            self.showBookDetail(book, onSelectBook, options);
          }
        };
        row.appendChild(btn);
      });
      box.appendChild(row);
      hintEl.parentNode.insertBefore(box, hintEl.nextSibling);
    }

    function renderBooks(filter) {
      grid.innerHTML = '';
      var list = orderedBooks();
      for (var i = 0; i < list.length; i++) {
        if (filter && list[i].category !== filter) continue;
        (function(book) {
          var card = document.createElement('div');
          card.className = 'bk-card' + (book.bookWorld ? ' has-theater' : '');
          card.tabIndex = 0;

          var catInfo = cats[book.category] || { name: '其他', color: '#888' };
          var darkColor = self._darken(book.coverColor, 30);
          var localCover = 'assets/covers/' + book.id + '.png';
          var theaterMark = book.bookWorld ? '<div class="bk-theater-mark">沉浸式剧场</div>' : '';

          card.innerHTML =
            '<div class="bk-cover" style="background:linear-gradient(135deg,' + book.coverColor + ',' + darkColor + ')">' +
              '<img class="bk-cover-img" src="' + localCover + '" alt="' + book.title + '" ' +
                   'onload="this.classList.add(\'loaded\');var ico=this.nextElementSibling;if(ico)ico.style.display=\'none\'" ' +
                   'onerror="this.style.display=\'none\';this.classList.remove(\'loaded\');var ico=this.nextElementSibling;if(ico)ico.style.display=\'\'" />' +
              '<span class="bk-cover-icon">📖</span>' +
              '<span class="bk-cover-title">' + book.title + '</span>' +
              '<span class="bk-cat-tag">' + catInfo.name + '</span>' +
              theaterMark +
            '</div>' +
            '<div class="bk-title">' + book.title + '</div>' +
            '<div class="bk-cat" style="background:' + catInfo.color + '22;color:' + catInfo.color + '">' + catInfo.name + '</div>';

          card.onclick = function(ev) {
            ev.stopPropagation();
            self.showBookDetail(book, onSelectBook, options);
          };
          grid.appendChild(card);
        })(list[i]);
      }
      if (freeBrowse && !filter) {
        var theaterCards = Array.prototype.slice.call(grid.querySelectorAll('.bk-card.has-theater'));
        theaterCards.reverse().forEach(function(card) {
          grid.insertBefore(card, grid.firstChild);
        });
      }
      // 更新计数
      var countEl = document.getElementById('bk-count');
      if (countEl) {
        var cnt = filter ? books.filter(function(b) { return b.category === filter; }).length : books.length;
        countEl.textContent = cnt + ' 本';
      }
    }

    // 构建分类标签
    var catTabs = document.getElementById('bk-cat-tabs');
    if (catTabs) {
      catTabs.innerHTML = '';
      // "全部" 标签
      var allTab = document.createElement('button');
      allTab.className = 'bk-cat-tab active';
      allTab.textContent = '全部';
      allTab.onclick = function() {
        setActiveTab(null, this);
      };
      catTabs.appendChild(allTab);

      // 各分类标签
      var catKeys = Object.keys(cats);
      for (var k = 0; k < catKeys.length; k++) {
        (function(key) {
          var cat = cats[key];
          var tab = document.createElement('button');
          tab.className = 'bk-cat-tab';
          tab.textContent = (cat.icon || '') + ' ' + cat.name;
          tab.onclick = function() {
            setActiveTab(key, tab);
          };
          catTabs.appendChild(tab);
        })(catKeys[k]);
      }
    }

    function setActiveTab(catKey, tabEl) {
      activeCat = catKey;
      // 更新 tab 状态
      var tabs = catTabs.querySelectorAll('.bk-cat-tab');
      for (var t = 0; t < tabs.length; t++) tabs[t].classList.remove('active');
      tabEl.classList.add('active');
      // 重新渲染
      renderBooks(catKey);
    }

    // 初始渲染（全部）
    renderBooks(null);

    var closeBtn = panel.querySelector('.bk-close');
    if (closeBtn) closeBtn.onclick = function() { panel.classList.add('hidden'); };
  },

  hideBookshelf: function() {
    var panel = document.getElementById('book-panel');
    if (panel) panel.classList.add('hidden');
  },

  /* ============ 书籍详情弹窗 ============ */
  showBookDetail: function(book, onConfirm, options) {
    options = options || {};
    var old = document.getElementById('book-detail-modal');
    if (old) old.remove();

    var modal = document.createElement('div');
    modal.id = 'book-detail-modal';

    var coverDark = this._darken(book.coverColor, 40);
    var catObj = GameData.categories[book.category] || { color: '#888', name: '其他' };
    var blurbHtml = (book.blurb || '').replace(/\n\n/g, '</p><p>').replace(/\n/g, '');

    var isBestMatch = false;
    if (book.bestMatch && Engine.state.currentNPC) {
      isBestMatch = book.bestMatch.indexOf(Engine.state.currentNPC.id) >= 0;
    }
    var matchBadge = isBestMatch ? '<div class="match-badge">✦ 可能是 TA 最需要的那一本</div>' : '';

    var theaterBtn = book.bookWorld
      ? '<button class="dtl-theater" id="dtl-theater">进入书中剧场</button>'
      : '';
    var confirmHtml = onConfirm && !options.freeBrowse
      ? '<button class="dtl-confirm" id="dtl-confirm">推荐这本书</button>'
      : '';

    modal.innerHTML =
      '<div class="dtl-overlay" id="dtl-overlay"></div>' +
      '<div class="dtl-box">' +
        '<div class="dtl-close" id="dtl-close">×</div>' +
        '<div class="dtl-cover-wrap">' +
          '<img class="dtl-img" src="assets/covers/' + book.id + '.png" alt="' + book.title + '" id="dtl-cover-img" />' +
          '<div class="dtl-fallback" id="dtl-fallback" style="display:none;background:linear-gradient(135deg,' + book.coverColor + ',' + coverDark + ')">📖</div>' +
        '</div>' +
        '<div class="dtl-info">' +
          '<h2 class="dtl-title">' + book.title + '</h2>' +
          '<p class="dtl-author">' + book.author + '</p>' +
          '<p class="dtl-isbn">ISBN: ' + book.isbn + '</p>' +
          '<span class="dtl-cat-badge" style="background:' + catObj.color + '22;color:' + catObj.color + '">' + catObj.name + '</span>' +
          matchBadge +
          '<div class="dtl-blurb"><p>' + blurbHtml + '</p></div>' +
        '</div>' +
        '<div class="dtl-actions">' +
          confirmHtml +
          theaterBtn +
          '<button class="dtl-ai-ask" id="dtl-ai-ask">🤖 AI 导读 — 和店主聊聊这本书</button>' +
          '<button class="dtl-back" id="dtl-back">← 返回书架</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    var self = this;
    document.getElementById('dtl-close').onclick = function() { modal.remove(); };
    document.getElementById('dtl-overlay').onclick = function() { modal.remove(); };
    document.getElementById('dtl-back').onclick = function() { modal.remove(); };
    var confirm = document.getElementById('dtl-confirm');
    if (confirm) {
      confirm.onclick = function() {
        modal.remove();
        if (onConfirm) onConfirm(book.id);
      };
    }
    var theater = document.getElementById('dtl-theater');
    if (theater) {
      theater.onclick = function() {
        modal.remove();
        if (window.BookTheater) BookTheater.open(book);
      };
    }
    document.getElementById('dtl-ai-ask').onclick = function() {
      // 先关闭当前书籍详情弹窗，再打开 AI 聊天面板
      modal.remove();
      self.openAIChat({
        type: 'book',
        title: '📖 聊聊《' + book.title + '》',
        data: {
          title: book.title,
          author: book.author,
          category: catObj.name,
          blurb: (book.blurb || '').replace(/<[^>]+>/g, ''),
          bestMatch: book.bestMatch || '',
          recommendReason: book.recommendReason || '',
          coreMessage: book.coreMessage || ''
        }
      });
    };

    var img = document.getElementById('dtl-cover-img');
    var fb = document.getElementById('dtl-fallback');
    if (img && fb) {
      img.onload = function() { this.classList.add('loaded'); };
      img.onerror = function() { this.style.display = 'none'; this.classList.remove('loaded'); fb.style.display = 'flex'; };
      // 如果图片已完成加载（缓存命中），手动触发
      if (img.complete && img.naturalWidth > 0) { img.classList.add('loaded'); }
    }
  },

  /* ============ 结果面板 ============ */
  showResult: function(result, onDone) {
    var panel = document.getElementById('result-panel');
    if (!panel) return;
    panel.classList.remove('hidden');

    var content = document.getElementById('result-content');
    if (!content) return;

    var icons = { perfect: '🌟', good: '✅', neutral: '➖', mismatch: '❌' };
    var icon = icons[result.match] || '📖';

    var efx = '';
    if (result.deltaHope > 0) efx += '<div class="efx-pos">希望值 +' + result.deltaHope + '</div>';
    if (result.deltaHope < 0) efx += '<div class="efx-neg">希望值 ' + result.deltaHope + '</div>';
    if (result.deltaRep > 0) efx += '<div class="efx-pos">声誉 +' + result.deltaRep + '</div>';

    content.innerHTML =
      '<div class="res-icon">' + icon + '</div>' +
      '<div class="res-title">' + result.title + '</div>' +
      '<div class="res-book">' + result.book.title + ' — ' + result.book.author + '</div>' +
      '<div class="res-message">' + (result.message || '') + '</div>' +
      '<div class="res-world-note">' + this._buildWorldResultNote(result) + '</div>' +
      (result.recommendReason ? '<div class="res-afterword">💡 ' + result.recommendReason + '</div>' : '') +
      '<div class="res-effects">' + efx + '</div>' +
      '<button class="act-btn act-mylist" id="res-mylist">📖 我也想读这本书</button>' +
      '<button class="act-btn act-next" id="res-continue">继续</button>';

    var self = this;
    var mylistBtn = document.getElementById('res-mylist');
    if (mylistBtn) {
      var alreadyAdded = window.MyStore && MyStore.isInMylist(result.book.id);
      if (alreadyAdded) {
        mylistBtn.textContent = '✓ 已加入我的待读清单';
        mylistBtn.classList.add('added');
      }
      mylistBtn.onclick = function(ev) {
        ev.stopPropagation();
        if (!window.MyStore) return;
        if (MyStore.isInMylist(result.book.id)) return;
        MyStore.addToMylist(result.book, Engine.state.currentNPC);
        this.textContent = '✓ 已加入我的待读清单';
        this.classList.add('added');
      };
    }

    document.getElementById('res-continue').onclick = function() {
      panel.classList.add('hidden');
      Renderer.updateTopBar();
      if (onDone) onDone();
    };

    // 调一个微动画
    this._animateResultIn(panel);
  },

  _animateResultIn: function(panel) {
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(20px) scale(0.95)';
    setTimeout(function() {
      panel.style.transition = 'all 0.4s cubic-bezier(.34, 1.56, .64, 1)';
      panel.style.opacity = '1';
      panel.style.transform = 'translateY(0) scale(1)';
    }, 20);
  },

  _buildWorldResultNote: function(result) {
    var npc = Engine.state.currentNPC;
    var name = npc && npc.name ? npc.name : 'TA';
    if (result.match === 'perfect') {
      return '大断联之后，纸书不再只是商品。你把一本能被带回家、反复翻开的答案，交到了' + name + '手里。';
    }
    if (result.match === 'good') {
      return '没有云端索引的时代，每一次推荐都要靠倾听。' + name + '也许还会在这本书里找到一盏小灯。';
    }
    if (result.match === 'neutral') {
      return '这本书保存着珍贵的知识，但它和' + name + '此刻的困境之间，还隔着几页没有翻开的路。';
    }
    return '书仍然珍贵，只是这一次，它没有抵达最需要它的人。';
  },

  /* ============ 夜间面板 ============ */
  showNight: function(stats, onContinue) {
    var panel = document.getElementById('night-panel');
    if (!panel) return;
    panel.classList.remove('hidden');

    var content = document.getElementById('night-content');
    if (!content) return;

    // AI 店主日记
    var diary = '';
    if (typeof AI !== 'undefined' && AI.generateDiary) {
      diary = AI.generateDiary(Engine.state, Engine.state.bookLog);
    }

    var currentDay = Engine.state.day;
    var statsHtml = '<div class="night-stat">第 ' + (currentDay - 1) + ' 天结束</div>';
    statsHtml += '<div class="night-stat">希望值 ' + Engine.state.hope + ' / 100</div>';
    statsHtml += '<div class="night-stat">声誉 ' + Engine.state.reputation + '</div>';
    for (var i = 0; i < stats.length; i++) {
      statsHtml += '<div class="night-stat">' + stats[i] + '</div>';
    }

    // 根据天数动态调整按钮文案
    var btnText;
    if (currentDay >= 7) {
      btnText = '推开明日的门 — 这是最后一段路了';
    } else if (currentDay >= 5) {
      btnText = '推开明日的门 — 故事接近尾声';
    } else if (currentDay >= 3) {
      btnText = '推开明日的门 — 继续前行';
    } else {
      btnText = '推开明日的门';
    }

    // 夜间场景文案也随天数变化
    var nightSummary;
    if (currentDay >= 7) {
      nightSummary = '门外的风停了。这些年，这间书店见过了太多人。明天是最后的篇章。';
    } else if (currentDay >= 5) {
      nightSummary = '门外的风渐弱。店里只剩书页翻动的声音。还有人在等明天的故事。';
    } else if (currentDay >= 3) {
      nightSummary = '门外的风轻了些。店里很安静，但书架上的每一本书都记得今天来过的人。';
    } else {
      nightSummary = '门外的风停了，店里只剩书页翻动的声音。明天会有人来。';
    }

    content.innerHTML =
      '<div class="night-moon">🌙</div>' +
      '<h3>打烊了</h3>' +
      '<div class="night-diary">' + (diary || '今天又是新的一天。') + '</div>' +
      '<div class="night-summary">' + nightSummary + '</div>' +
      '<div class="night-stats">' + statsHtml + '</div>' +
      '<button class="act-btn act-open" id="nt-next">' + btnText + '</button>';

    document.getElementById('nt-next').onclick = function() {
      panel.classList.add('hidden');
      if (onContinue) onContinue();
    };
  },

  /* ============ 结局画面 ============ */
  showEnding: function(ending, onRestart, onMyStore) {
    var screen = document.getElementById('ending-screen');
    if (!screen) return;
    screen.classList.remove('hidden');
    screen.classList.add('active');
    AudioManager.playBGM('night');

    var content = document.getElementById('ending-content');
    if (!content) return;

    content.innerHTML =
      '<div class="ending-stars" id="end-stars"></div>' +
      '<div class="ending-type">' + (ending.type || 'ENDING').toUpperCase() + '</div>' +
      '<h2 class="ending-title">' + (ending.icon || '📖') + ' ' + ending.title + '</h2>' +
      '<div class="ending-summary" id="end-text"></div>' +
      '<div class="ending-stats">' +
        '<div>希望值: ' + Engine.state.hope + ' / 100</div>' +
        '<div>服务天数: ' + Engine.state.daysCompleted + '</div>' +
        '<div>完美推荐: ' + Engine.state.totalPerfect + ' 次</div>' +
        '<div>服务过的客人: ' + Engine.state.servedNPCs.length + ' 位</div>' +
      '</div>' +
      '<button class="btn-start end-mystore" id="end-mystore">打开我的书店</button>' +
      '<button class="btn-start" id="end-restart">📖 重新开始</button>';

    // 打字机逐行显示
    var textEl = document.getElementById('end-text');
    var lines = (ending.summary || '').split('\n');
    var li = 0;
    function showLine() {
      if (li < lines.length) {
        var p = document.createElement('p');
        p.textContent = lines[li];
        textEl.appendChild(p);
        li++;
        setTimeout(showLine, 700);
      }
    }
    showLine();

    this._makeStars();

    document.getElementById('end-restart').onclick = function() {
      if (onRestart) onRestart();
    };
    var myStoreBtn = document.getElementById('end-mystore');
    if (myStoreBtn) {
      myStoreBtn.onclick = function() {
        if (onMyStore) onMyStore();
        else if (window.MyStore) MyStore.open();
      };
    }
  },

  _makeStars: function() {
    var c = document.getElementById('end-stars');
    if (!c) return;
    for (var i = 0; i < 80; i++) {
      var s = document.createElement('div');
      s.className = 'star';
      var dur = 2 + Math.random() * 3;
      s.style.cssText = 'position:absolute;width:' + (1 + Math.random() * 2) + 'px;height:' + (1 + Math.random() * 2) + 'px;background:white;border-radius:50%;left:' + (Math.random() * 100) + '%;top:' + (Math.random() * 100) + '%;opacity:' + (0.4 + Math.random() * 0.6) + ';animation:twinkle ' + dur.toFixed(1) + 's infinite alternate;';
      c.appendChild(s);
    }
  },

  /* ============ 工具 ============ */
  _darken: function(hex, amt) {
    try {
      var num = parseInt(hex.replace('#', ''), 16);
      var r = Math.max(0, (num >> 16) - Math.round(2.55 * amt));
      var g = Math.max(0, ((num >> 8) & 0xFF) - Math.round(2.55 * amt));
      var b = Math.max(0, (num & 0xFF) - Math.round(2.55 * amt));
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    } catch (e) { return hex; }
  },

  /* ============ AI 聊天面板 ============ */
  _aiConfig: null,  // { type: 'npc' | 'book', data: ... }
  _aiHistory: null,
  _aiStreaming: false,

  /**
   * 打开 AI 聊天面板
   * @param config { type: 'npc'|'book', title, data }
   */
  openAIChat: function(config) {
    var panel = document.getElementById('ai-chat-panel');
    var title = document.getElementById('ai-chat-title');
    var msgs = document.getElementById('ai-chat-msgs');
    var input = document.getElementById('ai-chat-input');
    if (!panel || !title || !msgs || !input) return;

    this._aiConfig = config;
    this._aiHistory = [];
    this._aiStreaming = false;
    msgs.innerHTML = '';

    title.textContent = config.title;

    // 添加系统欢迎消息
    var welcome = config.type === 'npc'
      ? '（' + config.data.name + '站在你面前，似乎在等你开口。）'
      : '这本《' + config.data.title + '》就在书架上。有什么想问店主的吗？';

    this._addAIMessage(welcome, 'ai', true);

    panel.classList.remove('hidden');
    input.value = '';
    input.focus();

    // 绑定发送事件（只绑一次）
    var self = this;
    var sendBtn = document.getElementById('ai-chat-send');
    var closeBtn = document.getElementById('ai-chat-close');

    var doSend = function() {
      var txt = input.value.trim();
      if (!txt || self._aiStreaming) return;
      self._addAIMessage(txt, 'player');
      input.value = '';
      self._aiStreaming = true;
      self._sendToAI(txt);
    };

    sendBtn.onclick = doSend;
    input.onkeydown = function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
    };
    closeBtn.onclick = function() {
      panel.classList.add('hidden');
      self._aiStreaming = false;
      // 关闭时恢复游戏 BGM/声音？不需要，因为全程都在游戏里
    };
  },

  _addAIMessage: function(text, sender, isSystem) {
    var msgs = document.getElementById('ai-chat-msgs');
    if (!msgs) return;

    var el = document.createElement('div');
    el.className = 'ai-msg ' + (sender === 'player' ? 'ai-msg-player' : 'ai-msg-ai');
    if (isSystem) el.className += ' ai-msg-system';

    var senderName = '';
    if (sender === 'player') {
      senderName = '你';
    } else if (this._aiConfig && this._aiConfig.type === 'npc') {
      senderName = this._aiConfig.data.name;
    } else {
      senderName = '店主';
    }

    el.innerHTML =
      '<div class="ai-msg-sender">' + senderName + '</div>' +
      '<div class="ai-msg-bubble">' + text + '</div>';

    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  },

  _addAITyping: function() {
    var msgs = document.getElementById('ai-chat-msgs');
    if (!msgs) return null;
    var el = document.createElement('div');
    el.className = 'ai-typing-indicator';
    el.id = 'ai-typing';
    el.innerHTML = '<div class="ai-typing-dot"></div><div class="ai-typing-dot"></div><div class="ai-typing-dot"></div>';
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  },

  _removeAITyping: function() {
    var el = document.getElementById('ai-typing');
    if (el) el.remove();
  },

  /**
   * 流式追加内容到最后一个 AI 消息气泡
   */
  _streamChunk: function(content, done) {
    var msgs = document.getElementById('ai-chat-msgs');
    if (!msgs) return;

    // 查找或创建流式气泡
    var bubble = msgs.querySelector('#ai-stream-bubble');
    if (!bubble) {
      this._removeAITyping();

      var el = document.createElement('div');
      el.className = 'ai-msg ai-msg-ai';
      var senderName = this._aiConfig && this._aiConfig.type === 'npc'
        ? this._aiConfig.data.name : '店主';
      el.innerHTML =
        '<div class="ai-msg-sender">' + senderName + '</div>' +
        '<div class="ai-msg-bubble" id="ai-stream-bubble"></div>';
      msgs.appendChild(el);
      bubble = document.getElementById('ai-stream-bubble');
    }

    if (bubble) {
      bubble.textContent = content;
      msgs.scrollTop = msgs.scrollHeight;
    }

    if (done) {
      var streamEl = document.getElementById('ai-stream-bubble');
      if (streamEl) streamEl.removeAttribute('id');
      this._aiStreaming = false;
    }
  },

  _sendToAI: function(playerMsg) {
    var self = this;
    var cfg = this._aiConfig;

    // 添加历史记录
    this._aiHistory.push({ role: 'user', content: playerMsg });

    // 显示打字指示器
    this._addAITyping();

    if (cfg.type === 'npc') {
      LLM.chatWithNPC(cfg.data, playerMsg, this._aiHistory.slice(0, -1), function(content, done) {
        self._streamChunk(content, done);
        if (done) self._aiHistory.push({ role: 'assistant', content: content });
      });
    } else if (cfg.type === 'book') {
      LLM.askAboutBook(cfg.data, playerMsg, this._aiHistory.slice(0, -1), function(content, done) {
        self._streamChunk(content, done);
        if (done) self._aiHistory.push({ role: 'assistant', content: content });
      });
    }
  }
};
