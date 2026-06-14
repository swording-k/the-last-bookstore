/* ============================================================
   最后的书店 v6.0 - 核心引擎（重写）
   - 显式状态机，无 setTimeout 嵌套
   - 数据不可变，advanceDialogue 复制而非修改
   - 结局条件边界严格
   ============================================================ */

var Engine = {
  // 全局唯一状态
  state: {
    day: 1,
    hope: 50,
    reputation: 0,
    timeOfDay: 'morning',   // morning / afternoon / evening / night
    currentNPC: null,
    dialogueIndex: 0,
    phase: 'title',         // title / narrative / doorbell / dialogue / bookshelf / result / night / ending
    customersToday: [],
    customerIndex: 0,
    daysCompleted: 0,
    totalPerfect: 0,
    totalGood: 0,
    metTraveler: false,
    servedNPCs: [],
    npcVisitCount: {},      // 记录每个 NPC 的访问次数
    bookLog: [],
    mylist: [],             // 玩家标记“我也想读”的书
    flags: {},
    diary: ''              // AI 店主日记（备用，预留接口）
  },

  // 显式状态机
  _phase: null,
  setPhase: function(p) {
    this._phase = p;
    this.state.phase = p;
  },

  // ============ 存档 ============
  init: function() {
    var saved = localStorage.getItem('tlb_save');
    if (saved) {
      try {
        var s = JSON.parse(saved);
        for (var k in s) {
          if (s.hasOwnProperty(k) && s[k] !== undefined) this.state[k] = s[k];
        }
        if (!Array.isArray(this.state.mylist)) this.state.mylist = [];
      } catch (e) { console.warn('存档损坏，已重置', e); }
    }
    return this.state;
  },

  save: function(slot) {
    localStorage.setItem('tlb_save_' + slot, JSON.stringify(this.state));
    localStorage.setItem('tlb_save_info_' + slot, JSON.stringify({
      day: this.state.day,
      hope: this.state.hope,
      rep: this.state.reputation,
      time: new Date().toLocaleString('zh-CN')
    }));
  },

  load: function(slot) {
    var data = localStorage.getItem('tlb_save_' + slot);
    if (!data) return false;
    try {
      var obj = JSON.parse(data);
      for (var k in obj) {
        if (obj.hasOwnProperty(k)) this.state[k] = obj[k];
      }
      return true;
    } catch (e) { return false; }
  },

  // ============ 每日循环 ============
  startDay: function() {
    this.state.timeOfDay = 'morning';
    this.state.customersToday = this._buildQueue();
    this.state.customerIndex = 0;
    this.setPhase('doorbell');
    return this.state.customersToday;
  },

  _buildQueue: function() {
    var pool = [];
    var d = this.state.day;
    var allNPCs = ['linYue', 'chenBo', 'xiaoMing', 'liDoctor', 'fangMiss'];

    // === 7 天叙事弧线 NPC 排期 ===
    if (d === 1) {
      // 第一天：介绍两位核心 NPC
      pool = ['linYue', 'chenBo'];
    } else if (d === 2) {
      // 第二天：介绍其余三位中的两位
      pool = ['xiaoMing', 'liDoctor'];
    } else if (d === 3) {
      // 第三天：方小姐初次登场 + 林月回访
      pool = ['fangMiss', 'linYue'];
    } else if (d === 4) {
      // 第四天：陈伯和小明回访
      pool = ['chenBo', 'xiaoMing'];
    } else if (d === 5) {
      // 第五天：李医生和方小姐回访，全部 5 人完成一轮回访
      pool = ['liDoctor', 'fangMiss'];
      // 旅人可能在第五天出现
      if (!this.state.metTraveler && this.state.hope >= 60) {
        this.state.metTraveler = true;
        pool.push('traveler');
      }
    } else if (d === 6) {
      // 第六天：旅人必定出现（如果还没来过），加上一位回访老友
      if (!this.state.metTraveler) {
        this.state.metTraveler = true;
        pool.push('traveler');
      }
      // 选一位还没第三次来的 NPC
      var candidates = allNPCs.filter(function(n) {
        return (this.state.npcVisitCount[n] || 0) < 3;
      }.bind(this));
      if (candidates.length === 0) candidates = allNPCs;
      pool.push(candidates[Math.floor(Math.random() * candidates.length)]);
    } else {
      // 第七天及以后：高潮日
      if (!this.state.metTraveler) {
        this.state.metTraveler = true;
        pool.push('traveler');
      }
      // 最后一位——选一个对你变化最大的 NPC
      var best = 'linYue'; // 默认
      var bestCount = 0;
      for (var i = 0; i < allNPCs.length; i++) {
        var cnt = this.state.npcVisitCount[allNPCs[i]] || 0;
        if (cnt > bestCount) { bestCount = cnt; best = allNPCs[i]; }
      }
      pool.push(best);
    }

    return pool;
  },

  // ============ 顾客推进 ============
  advanceCustomer: function() {
    if (this.state.customerIndex >= this.state.customersToday.length) return null;
    var npcId = this.state.customersToday[this.state.customerIndex];
    // 拷贝 NPC 数据，避免修改源
    var npcSrc = GameData.npcs[npcId];
    this.state.currentNPC = JSON.parse(JSON.stringify(npcSrc));
    this.state.currentNPC.id = npcId;

    // 记录访问次数
    if (!this.state.npcVisitCount[npcId]) this.state.npcVisitCount[npcId] = 0;
    this.state.npcVisitCount[npcId]++;
    var visitNum = this.state.npcVisitCount[npcId];

    // 回访时使用 returnDialogue
    if (visitNum > 1 && this.state.currentNPC.returnDialogue) {
      this.state.currentNPC.dialogue = JSON.parse(JSON.stringify(this.state.currentNPC.returnDialogue));
    }

    if (this.state.servedNPCs.indexOf(npcId) < 0) this.state.servedNPCs.push(npcId);
    this.state.dialogueIndex = 0;
    this.setPhase('dialogue');
    // 时段推进
    var idx = this.state.customerIndex;
    if (idx === 0) this.state.timeOfDay = 'morning';
    else if (idx === 1) this.state.timeOfDay = 'afternoon';
    else this.state.timeOfDay = 'evening';
    this.state.customerIndex++;
    return this.state.currentNPC;
  },

  hasMoreCustomers: function() {
    return this.state.customerIndex < this.state.customersToday.length;
  },

  // ============ 对话系统（核心修复点）============
  getCurrentDialogue: function() {
    var npc = this.state.currentNPC;
    if (!npc || !npc.dialogue) return null;
    return npc.dialogue[this.state.dialogueIndex] || null;
  },

  /**
   * 推进对话。
   * - 当前位置是选项：应用 effect，next 由选项 response 决定
   * - 当前位置是 action / 末尾：dialogueIndex++
   * 永远不修改原 data.dialogue；任何 response 注入到 state.currentNPC 的临时副本
   */
  advanceDialogue: function(optionIdx) {
    var diag = this.getCurrentDialogue();
    if (!diag) return null;

    if (diag.options && optionIdx !== undefined && optionIdx !== null) {
      var opt = diag.options[optionIdx];
      if (!opt) {
        this.state.dialogueIndex++;
        return this.getCurrentDialogue();
      }
      // 应用选项效果
      this.state.hope = Math.max(0, Math.min(100, this.state.hope + (opt.effect.hopeChange || 0)));
      this.state.reputation += (opt.effect.repChange || 0);
      this.state.dialogueIndex++;

      var next = this.getCurrentDialogue();
      if (next && opt.response) {
        // 修改临时副本的 text（不污染源数据）
        next.text = opt.response;
        next.isResponse = true;
      }
      return next;
    }

    this.state.dialogueIndex++;
    return this.getCurrentDialogue();
  },

  shouldShowOptions: function() {
    var d = this.getCurrentDialogue();
    return !!(d && d.options && d.options.length > 0 && !d._optionShown);
  },

  shouldRecommend: function() {
    var d = this.getCurrentDialogue();
    return !!(d && d.action === 'recommend');
  },

  // ============ 书籍评估 ============
  evaluateBook: function(bookId) {
    var npc = this.state.currentNPC;
    var book = null;
    for (var i = 0; i < GameData.books.length; i++) {
      if (GameData.books[i].id === bookId) { book = GameData.books[i]; break; }
    }
    if (!npc || !book) return null;

    var isPerfect = false;
    if (book.bestMatch) {
      for (var j = 0; j < book.bestMatch.length; j++) {
        if (book.bestMatch[j] === npc.id) { isPerfect = true; break; }
      }
    }

    var match, title, deltaHope, deltaRep, message;
    if (isPerfect) {
      match = 'perfect';
      title = '完美匹配';
      deltaHope = 8 + Math.floor(Math.random() * 5);
      deltaRep = 5;
      message = '你选的这本书，仿佛就是为 TA 准备的。';
      this.state.totalPerfect++;
    } else if (book.category === 'literature' || book.category === 'philosophy' || book.category === 'psychology') {
      match = 'good';
      title = '好的推荐';
      deltaHope = 4 + Math.floor(Math.random() * 4);
      deltaRep = 2;
      message = '书不一定是最对的那本，但也是一本有力量的书。';
      this.state.totalGood++;
    } else {
      match = 'neutral';
      title = '一般';
      deltaHope = 1 + Math.floor(Math.random() * 2);
      deltaRep = 0;
      message = '书本身不错，但和 TA 此刻的心境还有一点距离。';
    }

    this.state.hope = Math.max(0, Math.min(100, this.state.hope + deltaHope));
    this.state.reputation += deltaRep;

    this.state.bookLog.push({
      day: this.state.day,
      npcId: npc.id,
      npcName: npc.name,
      bookId: book.id,
      bookTitle: book.title,
      match: match,
      effect: { hope: deltaHope, rep: deltaRep }
    });

    return {
      match: match,
      title: title,
      book: book,
      deltaHope: deltaHope,
      deltaRep: deltaRep,
      recommendReason: book.recommendReason,
      message: message
    };
  },

  // ============ 收尾 / 结局 ============
  endDay: function() {
    this.state.daysCompleted++;
    this.state.day++;
    this.state.currentNPC = null;
    this.state.dialogueIndex = 0;
    this.setPhase('night');
  },

  checkEnding: function() {
    var s = this.state;
    // 隐藏结局——最后的读者：坚持到底 + 遇到旅人 + 足够多的完美推荐
    // 但不要求超高希望值，这是属于"坚守者"的结局
    if (s.daysCompleted >= 7 && s.metTraveler && s.totalPerfect >= 5 && s.hope >= 60) {
      return GameData.endings.hiddenEnding;
    }
    // 真结局——点燃希望：高希望值 + 遇到旅人 + 出色的推荐记录
    if (s.daysCompleted >= 6 && s.hope >= 80 && s.totalPerfect >= 4 && s.metTraveler) {
      return GameData.endings.trueEnding;
    }
    // 好结局——守望者：中等希望值以上，坚持够久
    if (s.daysCompleted >= 5 && s.hope >= 60 && s.hope < 80) {
      return GameData.endings.goodEnding;
    }
    // 普通结局——平凡日子：希望值偏低，但还在坚持
    if (s.daysCompleted >= 3 && s.hope >= 40 && s.hope < 60) {
      return GameData.endings.normalEnding;
    }
    return null;
  },

  advanceTime: function() {
    var order = ['morning', 'afternoon', 'evening', 'night'];
    var idx = order.indexOf(this.state.timeOfDay);
    if (idx >= 0 && idx < order.length - 1) this.state.timeOfDay = order[idx + 1];
    return this.state.timeOfDay;
  },

  getTimeLabel: function() {
    var map = { morning:'清晨', afternoon:'午后', evening:'傍晚', night:'深夜' };
    return map[this.state.timeOfDay] || '';
  }
};
