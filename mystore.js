/* ============================================================
   mystore.js - 纸页方舟 / 我的书店
   结局后的个人档案页：推荐记录、想读清单、回信与复制。
   ============================================================ */

var MyStore = {
  open: function() {
    var screen = document.getElementById('mystore-screen');
    var content = document.getElementById('mystore-content');
    if (!screen || !content) return;

    if (!Array.isArray(Engine.state.mylist)) Engine.state.mylist = [];

    screen.classList.remove('hidden');
    Renderer.showScreen('mystore-screen');
    content.innerHTML = this._buildHTML(Engine.state);
    this._bindInteractions();
    if (window.AudioManager) AudioManager.playBGM('morning');
  },

  addToMylist: function(book, npc) {
    if (!book) return false;
    if (!Array.isArray(Engine.state.mylist)) Engine.state.mylist = [];

    var exists = Engine.state.mylist.some(function(item) {
      return item.bookId === book.id;
    });
    if (exists) return false;

    Engine.state.mylist.push({
      bookId: book.id,
      bookTitle: book.title,
      author: book.author,
      day: Engine.state.day,
      npcId: npc && npc.id ? npc.id : '',
      npcName: npc && npc.name ? npc.name : '',
      addedAt: Date.now()
    });
    return true;
  },

  removeFromMylist: function(bookId) {
    if (!Array.isArray(Engine.state.mylist)) return false;
    var before = Engine.state.mylist.length;
    Engine.state.mylist = Engine.state.mylist.filter(function(item) {
      return item.bookId !== bookId;
    });
    return Engine.state.mylist.length !== before;
  },

  isInMylist: function(bookId) {
    if (!Array.isArray(Engine.state.mylist)) return false;
    return Engine.state.mylist.some(function(item) { return item.bookId === bookId; });
  },

  toggleResultBook: function(result) {
    if (!result || !result.book) return false;
    if (this.isInMylist(result.book.id)) {
      return !this.removeFromMylist(result.book.id);
    }
    return this.addToMylist(result.book, Engine.state.currentNPC);
  },

  copyReadingList: function() {
    var items = this._getMylistBooks(Engine.state);
    if (items.length === 0) {
      this._toast('你还没有加入想读的书。');
      return '';
    }

    var lines = ['我在《最后的书店》里想读这些书：'];
    items.forEach(function(item, idx) {
      lines.push((idx + 1) + '. 《' + item.book.title + '》 - ' + item.book.author);
    });
    lines.push('');
    lines.push('游戏不是终点，它只是把我带回真实阅读的入口。');

    var text = lines.join('\n');
    this._copyText(text);
    this._toast('已复制 ' + items.length + ' 本书名，可以去微信读书、图书馆或书店搜索。');
    return text;
  },

  showReply: function(bookId, npcName) {
    var book = this._findBook(bookId);
    if (!book) return;

    var old = document.getElementById('ms-reply-modal');
    if (old) old.remove();

    var modal = document.createElement('div');
    modal.id = 'ms-reply-modal';
    modal.innerHTML =
      '<div class="ms-reply-overlay"></div>' +
      '<div class="ms-reply-box">' +
        '<button class="ms-reply-close" title="关闭">×</button>' +
        '<div class="ms-reply-kicker">一个月后</div>' +
        '<h3>' + (npcName || '一位读者') + ' 写来的回信</h3>' +
        '<div class="ms-reply-paper" id="ms-reply-paper">信纸展开了，墨水正在慢慢显影……</div>' +
      '</div>';
    document.body.appendChild(modal);

    modal.querySelector('.ms-reply-overlay').onclick = function() { modal.remove(); };
    modal.querySelector('.ms-reply-close').onclick = function() { modal.remove(); };

    var paper = document.getElementById('ms-reply-paper');
    var npc = { name: npcName || '一位读者' };
    if (window.LLM && LLM.generateReply) {
      LLM.generateReply(book, npc, function(content, done) {
        paper.textContent = content;
      });
    } else {
      paper.textContent = this._fallbackReply(book, npc);
    }
  },

  _buildHTML: function(state) {
    var stats = this._calcStats(state);
    var recommended = this._getRecommendedBooks(state);
    var mylist = this._getMylistBooks(state);

    return '' +
      '<div class="ms-hero">' +
        '<div class="ms-mark">纸页方舟</div>' +
        '<h1>我的书店</h1>' +
        '<p>你在七天里为别人找书，也在书页之间找回了自己的阅读欲望。游戏不是终点，而是通往真实阅读的入口。</p>' +
      '</div>' +
      '<div class="ms-stats">' +
        '<div><strong>' + stats.days + '</strong><span>守店天数</span></div>' +
        '<div><strong>' + stats.customers + '</strong><span>来访灵魂</span></div>' +
        '<div><strong>' + stats.books + '</strong><span>推荐书籍</span></div>' +
        '<div><strong>' + stats.mylist + '</strong><span>我想读</span></div>' +
      '</div>' +
      this._renderRecommended(recommended) +
      this._renderMylist(mylist) +
      '<div class="ms-actions">' +
        '<button class="ms-primary" id="ms-copy-list">复制待读清单</button>' +
        '<button class="ms-secondary" id="ms-restart">重新开始</button>' +
      '</div>';
  },

  _calcStats: function(state) {
    return {
      days: state.daysCompleted || Math.max(0, (state.day || 1) - 1),
      customers: state.servedNPCs ? state.servedNPCs.length : 0,
      books: state.bookLog ? state.bookLog.length : 0,
      mylist: state.mylist ? state.mylist.length : 0
    };
  },

  _renderRecommended: function(items) {
    var html = '<section class="ms-section"><div class="ms-section-head"><h2>我推荐过的书</h2><p>每一本书都曾被交到一个具体的人手里。</p></div>';
    if (items.length === 0) {
      return html + '<div class="ms-empty">还没有推荐记录。</div></section>';
    }
    html += '<div class="ms-grid">';
    items.forEach(function(item) {
      var book = item.book;
      if (!book) return;
      html += '<article class="ms-card">' +
        '<img src="assets/covers/' + book.id + '.png" alt="' + book.title + '">' +
        '<div><h3>' + book.title + '</h3><p>' + book.author + '</p><span>推荐给 ' + (item.npcName || '读者') + '</span></div>' +
        '<button class="ms-link ms-reply-btn" data-book-id="' + book.id + '" data-npc-name="' + (item.npcName || '') + '">一个月后</button>' +
      '</article>';
    });
    return html + '</div></section>';
  },

  _renderMylist: function(items) {
    var html = '<section class="ms-section ms-mylist"><div class="ms-section-head"><h2>我想读的书</h2><p>这些不是战利品，是你离开游戏后还能带走的真实清单。</p></div>';
    if (items.length === 0) {
      return html + '<div class="ms-empty">推荐结果页点“我也想读这本书”，这里就会变成你的待读书架。</div></section>';
    }
    html += '<div class="ms-grid">';
    items.forEach(function(item) {
      var book = item.book;
      if (!book) return;
      html += '<article class="ms-card ms-card-want">' +
        '<img src="assets/covers/' + book.id + '.png" alt="' + book.title + '">' +
        '<div><h3>' + book.title + '</h3><p>' + book.author + '</p><span>第 ' + item.day + ' 天加入</span></div>' +
      '</article>';
    });
    return html + '</div></section>';
  },

  _bindInteractions: function() {
    var copyBtn = document.getElementById('ms-copy-list');
    if (copyBtn) copyBtn.onclick = this.copyReadingList.bind(this);

    var restartBtn = document.getElementById('ms-restart');
    if (restartBtn) restartBtn.onclick = function() { location.reload(); };

    var replyBtns = document.querySelectorAll('.ms-reply-btn');
    for (var i = 0; i < replyBtns.length; i++) {
      replyBtns[i].onclick = function() {
        MyStore.showReply(this.getAttribute('data-book-id'), this.getAttribute('data-npc-name'));
      };
    }
  },

  _getRecommendedBooks: function(state) {
    var logs = state.bookLog || [];
    return logs.map(function(log) {
      return Object.assign({}, log, { book: MyStore._findBook(log.bookId) });
    }).filter(function(item) { return !!item.book; });
  },

  _getMylistBooks: function(state) {
    var list = state.mylist || [];
    return list.map(function(item) {
      return Object.assign({}, item, { book: MyStore._findBook(item.bookId) });
    }).filter(function(item) { return !!item.book; });
  },

  _findBook: function(bookId) {
    for (var i = 0; i < GameData.books.length; i++) {
      if (GameData.books[i].id === bookId) return GameData.books[i];
    }
    return null;
  },

  _copyText: function(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function() {});
      return;
    }
    var area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); } catch (e) {}
    area.remove();
  },

  _toast: function(text) {
    var old = document.getElementById('ms-toast');
    if (old) old.remove();
    var toast = document.createElement('div');
    toast.id = 'ms-toast';
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 2600);
  },

  _fallbackReply: function(book, npc) {
    return (npc.name || '一位读者') + '在信里写道：\n\n' +
      '那天从书店带走《' + book.title + '》以后，我花了很久才真正翻开它。奇怪的是，书页没有替我解决问题，却让我知道自己并不是孤身一人。\n\n' +
      '谢谢你没有急着给答案，而是把一本书递到我手里。';
  }
};
