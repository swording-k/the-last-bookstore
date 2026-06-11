/* ============================================================
   最后的书店 v6.0 - AI 接入层
   1) 自由输入：解析玩家情绪 + 生成回应
   2) 书籍深聊：模拟作者口吻回答
   3) AI 店主日记：基于玩家旅程生成总结
   4) LLM 不可用时降级到预设
   ============================================================ */

var AI = {
  config: {
    timeout: 8000,
    enabled: true   // 总开关：false 时全部走降级
  },

  /**
   * 自由输入：玩家输入一段话，AI 解析情绪 + 生成 NPC 回应
   */
  parseFreeInput: function(npc, dialogueContext, playerInput) {
    if (!this.config.enabled) return this._fallbackFreeInput(playerInput);

    // 简单情绪标签（基于关键词，避免每次都打 LLM）
    var tag = this._quickEmotionTag(playerInput);
    var hopeChange = 0;
    switch (tag) {
      case 'compassion': hopeChange = 3; break;
      case 'curious': hopeChange = 2; break;
      case 'cold': hopeChange = -1; break;
      case 'rude': hopeChange = -2; break;
      default: hopeChange = 1;
    }

    // NPC 回应模板（可后续替换为 LLM）
    var responses = this._responseTemplates(npc, tag);
    var response = responses[Math.floor(Math.random() * responses.length)];

    return {
      tag: tag,
      response: response,
      hopeChange: hopeChange
    };
  },

  _quickEmotionTag: function(text) {
    if (!text) return 'neutral';
    if (/喜欢|可爱|温柔|不错|暖|关心|谢谢/.test(text)) return 'compassion';
    if (/为什么|怎么|什么|如何|？|\?$/.test(text)) return 'curious';
    if (/滚|别|无|假|骗|烂/.test(text)) return 'rude';
    if (/冷|不在乎|随便/.test(text)) return 'cold';
    return 'neutral';
  },

  _responseTemplates: function(npc, tag) {
    var map = {
      linYue: {
        compassion: ['谢谢你……听我说这些。', '你真的很温柔。', '我不知道怎么回报。'],
        curious: ['你想知道什么呢？', '我也想过这些。', '也许答案在书里。'],
        neutral: ['嗯，我再想想。', '你说的也许对。', '我……不知道。']
      },
      chenBo: {
        compassion: ['谢谢你愿意听我这个老头说话。', '难得有人耐心。', '你是个好孩子。'],
        curious: ['你想问修表的事？', '手艺这东西说不清。', '时代变了啊。'],
        neutral: ['嗯。', '你说得对。', '我老了，不中用了。']
      },
      xiaoMing: {
        compassion: ['切，被你发现了。', '……谢谢啦。', '你不一样。'],
        curious: ['你问这个干嘛？', '我凭什么告诉你。', '……其实我也不懂。'],
        neutral: ['随便啦。', '哦。', '你说得对不对我不知道。']
      },
      liDoctor: {
        compassion: ['谢谢……我需要这个。', '你懂我。', '难得。'],
        curious: ['你问这个？', '说起来话长。', '每个人都有自己的痛。'],
        neutral: ['嗯。', '也许吧。', '你说得对。']
      },
      fangMiss: {
        compassion: ['你懂我。', '谢谢你。', '不常见。'],
        curious: ['你也在找答案？', '说起来话长。', '也许吧。'],
        neutral: ['也许。', '我再想想。', '嗯。']
      },
      traveler: {
        compassion: ['很少有人能听到这些。', '谢谢你的真诚。', '你不一样。'],
        curious: ['你想知道？', '答案在路上。', '听你的问题，像在问自己。'],
        neutral: ['也许。', '嗯。', '看你怎么选。']
      }
    };
    var templates = (map[npc.id] || map.linYue)[tag] || (map[npc.id] || map.linYue).neutral;
    return templates;
  },

  _fallbackFreeInput: function(input) {
    return { tag: 'neutral', response: '……', hopeChange: 0 };
  },

  /**
   * 书籍深聊：AI 模拟作者口吻回答读者提问
   */
  chatWithAuthor: function(book, history, question) {
    if (!this.config.enabled) return this._fallbackAuthor(book, question);

    // 基于书籍内容的金句回复
    var keywords = (book.tags || []).slice(0, 3).join('、');
    var responses = [
      '我写这本书时，常在想"' + keywords + '"。你现在的感受，和我当时很像。',
      '书里没明说的话是——' + keywords + '并不是答案，而是提问的方式。',
      '你愿意问这个问题，说明你已经走在我前面了。',
      '我没打算给标准答案。你愿意聊聊你自己的版本吗？',
      '回头看，' + keywords + '只是入口。真正的路在你心里。'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  },

  _fallbackAuthor: function(book, question) {
    return '……';
  },

  /**
   * AI 店主日记：基于玩家旅程生成总结
   */
  generateDiary: function(state, bookLog) {
    if (!this.config.enabled) return this._fallbackDiary(state);

    var day = state.daysCompleted;
    var perfect = state.totalPerfect;
    var good = state.totalGood;
    var hope = state.hope;
    var served = state.servedNPCs.length;
    var metTraveler = state.metTraveler;

    // 获取今日推荐记录
    var todayLogs = bookLog.filter(function(l) { return l.day === day; });
    var todayNPCs = [];
    var todayBooks = [];
    for (var i = 0; i < todayLogs.length; i++) {
      if (todayNPCs.indexOf(todayLogs[i].npcName) < 0) todayNPCs.push(todayLogs[i].npcName);
      todayBooks.push(todayLogs[i].bookTitle);
    }

    var tone;
    if (hope >= 80) tone = 'warm';
    else if (hope >= 60) tone = 'steady';
    else if (hope >= 40) tone = 'reflective';
    else tone = 'uncertain';

    // 生成 NPC 提及
    var npcMention = '';
    if (todayNPCs.length === 1) {
      npcMention = '今天只来了一位客人——' + todayNPCs[0] + '。';
    } else if (todayNPCs.length >= 2) {
      npcMention = '今天店里来了 ' + todayNPCs[0] + ' 和 ' + todayNPCs[1] + (todayNPCs.length > 2 ? '等' + todayNPCs.length + '位客人' : '') + '。';
    }

    // 生成书籍提及
    var bookMention = '';
    if (todayBooks.length === 0) {
      bookMention = '今天没来得及推荐书。';
    } else if (todayBooks.length === 1) {
      bookMention = '我把《' + todayBooks[0] + '》递给了TA。';
    } else if (todayBooks.length === 2) {
      bookMention = '我推荐了《' + todayBooks[0] + '》和《' + todayBooks[1] + '》。';
    } else {
      bookMention = '我一共推荐了 ' + todayBooks.length + ' 本书。';
    }

    // 根据情绪选择日记模板（每种情绪有多个变体）
    var warmTemplates = [
      '大断联后的夜晚没有屏幕亮光，只有柜台这盏灯。' + npcMention + ' ' + bookMention + ' TA离开时回头冲我笑了一下。我突然觉得，这家店还会开很久。',
      '灯光暖黄，书页安静。' + npcMention + ' ' + bookMention + ' 当云端不再回答，人和书之间的这一点光就格外稳定。',
      npcMention + ' 每个人的眼神里都有光。' + bookMention + ' 我觉得自己今天守住的不只是生意，还有一点记忆。',
      bookMention + ' 看着TA抱着书走出门，我想，也许这就是最后一间书店存在的意义。',
      npcMention + ' 我泡了杯茶，看窗外夕阳。' + bookMention + ' 没有网络的世界很安静，但今天是好日子。'
    ];

    var steadyTemplates = [
      npcMention + ' ' + bookMention + ' 店里的节奏平稳，我开始习惯这种日子。每一本书都像一台不需要电的服务器，等待对的人来读取。',
      npcMention + ' 人来人往是常态。' + bookMention + ' 我做的事算不算有意义？也许吧。但至少今天这盏灯还在。',
      bookMention + ' ' + (metTraveler ? '那个旅人说的话还在耳边回响。' : '我收拾着书架，把翻乱的书重新排整齐。') + ' 日复一日，也是在修补断联后的世界。',
      npcMention + ' 每个人都带着自己的故事走进来。' + bookMention + ' 我能做的，只是静静听着，再把纸页递过去。',
      npcMention + ' 书架上的书少了几本。' + bookMention + ' 明天会有新的客人，新的故事，和新的问题。'
    ];

    var reflectiveTemplates = [
      npcMention + ' ' + bookMention + ' 有些推荐我做对了，有些我不确定。但至少在没有搜索框的世界里，我没有让TA空手离开。',
      npcMention + ' 窗外开始暗了。' + bookMention + ' 我在想，如果我选错了书，会不会让一段记忆错过它的读者？',
      bookMention + ' 希望值不太稳定，像断电后留下的烛火。但既然推开门了，我就不能退缩。',
      npcMention + ' 每个人都在找自己的答案。' + bookMention + ' 我能做的，只是陪着他们翻一翻，把沉默的纸页重新读出声。',
      '今天有些疲惫。' + bookMention + ' 但我仍然相信，只要还有一个人需要书，这家店就该开着。'
    ];

    var uncertainTemplates = [
      npcMention + ' ' + bookMention + ' 我不知道这样做对不对，但总不能让他们在断联后的世界里空手出去。',
      npcMention + ' 灯光比昨天暗了些。' + bookMention + ' 也许明天会好一点，也许至少还有一本书能派上用场。',
      bookMention + ' 希望值在下降。但关门还太早。只要还能推开这扇门，纸页就还没有彻底沉默。',
      npcMention + ' 有时候我问自己，这家店还能撑多久。' + bookMention + ' 至少今天撑住了。',
      '日记越来越薄了。' + bookMention + ' 没关系，写一行也够了。文明有时就是这样留下来的。'
    ];

    var templates = {
      warm: warmTemplates,
      steady: steadyTemplates,
      reflective: reflectiveTemplates,
      uncertain: uncertainTemplates
    };

    var pool = templates[tone];
    return pool[Math.floor(Math.random() * pool.length)];
  },

  _fallbackDiary: function(state) {
    return '今天又是新的一天。';
  }
};
