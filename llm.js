/**
 * LLM.js — AI 大模型接入模块
 * MiniMax API（通过同源服务器代理，浏览器不接触密钥）
 * 
 * 两大场景：
 *   llm.chatWithNPC(npcState, playerMsg, onChunk) — NPC 自由对话
 *   llm.askAboutBook(book, playerMsg, onChunk)     — 书籍 AI 导读
 */

var LLM = (function() {
  'use strict';

  // ============ 配置 ============
  // GitHub Pages 是纯静态托管，没有 /api/chat serverless 函数。
  // 当检测到运行在 GitHub Pages（github.io 或 swording-k.github.io）时，
  // 把请求转发到 Vercel 的同名 API，密钥仍然安全地保存在 Vercel 服务端。
  var _host = (typeof location !== 'undefined') ? location.hostname : '';
  var API_BASE = (_host.indexOf('github.io') !== -1)
    ? 'https://the-last-bookstore.vercel.app/api/chat'
    : '/api/chat';
  var MODEL = 'MiniMax-M2.5-highspeed';
  var MAX_TOKENS = 512;
  var TEMPERATURE = 0.8;            // NPC 对话需要一点创造性
  var BOOK_TEMPERATURE = 0.6;       // 书籍问答稍严谨

  // ============ 核心调用 ============

  /**
   * 非流式调用（备用）
   */
  function callLLM(messages, temperature) {
    temperature = temperature || TEMPERATURE;
    return fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        max_tokens: MAX_TOKENS,
        temperature: temperature,
        top_p: 0.9
      })
    })
    .then(function(res) {
      if (!res.ok) {
        return res.text().then(function(t) { throw new Error('API 错误 ' + res.status + ': ' + t); });
      }
      return res.json();
    })
    .then(function(data) {
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      }
      throw new Error('API 返回为空');
    });
  }

  /**
   * 流式调用（打字机效果）
   * onChunk(content, done) — 每收到一块文字调用一次，done=true 时完成
   */
  function callLLMStream(messages, temperature, onChunk) {
    temperature = temperature || TEMPERATURE;
    return fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        max_tokens: MAX_TOKENS,
        temperature: temperature,
        top_p: 0.9,
        stream: true
      })
    })
    .then(function(res) {
      if (!res.ok) {
        return res.text().then(function(t) { throw new Error('API 错误 ' + res.status + ': ' + t); });
      }
      return readStream(res, onChunk);
    })
    .then(function(content) {
      return content;
    });
  }

  /**
   * 读取 SSE 流
   */
  function readStream(response, onChunk) {
    var reader = response.body.getReader();
    var decoder = new TextDecoder();
    var buffer = '';
    var fullContent = '';

    function process() {
      return reader.read().then(function(result) {
        if (result.done) {
          if (onChunk) onChunk(fullContent, true);
          return fullContent;
        }

        buffer += decoder.decode(result.value, { stream: true });
        var lines = buffer.split('\n');
        // 最后一个可能不完整，保留
        buffer = lines.pop() || '';

        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (!line || line === 'data: [DONE]') continue;
          if (line.indexOf('data: ') !== 0) continue;

          try {
            var json = JSON.parse(line.slice(6));
            if (json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content) {
              var chunk = json.choices[0].delta.content;
              fullContent += chunk;
              if (onChunk) onChunk(fullContent, false);
            }
          } catch(e) {
            // 跳过解析失败的行
          }
        }

        return process(); // 继续读
      });
    }

    return process();
  }

  // ============ NPC 自由对话 ============

  /**
   * NPC 系统提示词构建
   */
  function buildNPCPrompt(npcState) {
    var n = npcState;
    var prompt = '你是橡木镇唯一一家书店——"最后的书店"里的一位顾客。\n\n';
    prompt += '## 你的身份\n';
    prompt += '- 名字：' + n.name + '\n';
    prompt += '- 身份：' + (n.tag || '镇上居民') + '\n';
    prompt += '- 现在的心情：' + (n.mood || '有些心事') + '\n\n';

    if (n.backstory) {
      prompt += '## 你的故事\n' + n.backstory + '\n\n';
    }

    if (n.currentTopic) {
      prompt += '## 今天你在意的\n' + n.currentTopic + '\n\n';
    }

    prompt += '## 对话规则\n';
    prompt += '- 你正站在书店里和店主交谈。用自然的口语回复，不要太长（1-4句话）。\n';
    prompt += '- 根据你的处境和心情说话。如果是来倾诉，就真诚地说；如果是来寻求建议，就坦率地问。\n';
    prompt += '- 你可以提到自己喜欢或不喜欢的书，但不要直接要求店主推荐——那是店主的工作。\n';
    prompt += '- 语气自然，像真人对话。可以带一些停顿、犹豫、叹息。\n';
    prompt += '- 如果话题聊开了，可以问问店主自己的想法（书、人生、这家店）。\n\n';
    prompt += '记住：你不是在完成任务，你是一个真实的人，带着自己的心事走进了这家书店。';

    return prompt;
  }

  /**
   * 与 NPC 自由聊天（流式）
   * @param npcState {name, tag, mood, backstory, currentTopic}
   * @param playerMsg 玩家说的话
   * @param history 对话历史 [{role, content}, ...]
   * @param onChunk 实时回调
   */
  function chatWithNPC(npcState, playerMsg, history, onChunk) {
    var messages = [
      { role: 'system', content: buildNPCPrompt(npcState) }
    ];

    // 对话历史
    if (history && history.length > 0) {
      for (var i = 0; i < history.length; i++) {
        messages.push(history[i]);
      }
    }

    // 当前玩家消息
    messages.push({ role: 'user', content: playerMsg });

    return callLLMStream(messages, TEMPERATURE, onChunk).catch(function(err) {
      console.error('[LLM NPC Chat]', err);
      // 降级回复
      var name = npcState && npcState.name ? npcState.name : 'TA';
      var fallbacks = [
        name + '看了看你，轻轻点了点头。',
        name + '沉默了一会儿："你说得对……让我想想。"',
        name + '抬起头看着你："谢谢你能这么问我。"',
        '"我喜欢你这家书店，"' + name + '环顾四周说，"希望它一直在。"'
      ];
      var fb = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      onChunk(fb, true);
      return fb;
    });
  }

  // ============ 书籍 AI 导读 ============

  /**
   * 书籍系统提示词构建
   */
  function buildBookPrompt(book) {
    var query = '你是"最后的书店"的店主——一个读过上万本书、对每本书都有自己的理解的人。\n\n';
    query += '你正在给一位客人介绍这本书。书的基本信息如下：\n\n';
    query += '## 基本信息\n';
    query += '- 书名：《' + book.title + '》\n';
    query += '- 作者：' + book.author + '\n';
    query += '- 类型：' + (book.category || '文学') + '\n\n';

    if (book.blurb) {
      query += '## 内容简介\n' + book.blurb + '\n\n';
    }

    if (book.bestMatch) {
      query += '## 适合人群\n' + book.bestMatch + '\n\n';
    }

    if (book.recommendReason) {
      query += '## 推荐理由\n' + book.recommendReason + '\n\n';
    }

    if (book.coreMessage) {
      query += '## 书籍内核\n' + book.coreMessage + '\n\n';
    }

    query += '## 对话规则\n';
    query += '- 你是通读此书的老书虫，对它有温暖的个人理解。用自然的口语推荐它。\n';
    query += '- 客人可能问任何问题：这本书讲了什么、为什么值得读、适合怎样的人、作者想表达什么……\n';
    query += '- 可以引用书中的金句或段落（自己编的也行，但要符合书的精神）。\n';
    query += '- 回答不超过 3-4 句话。像书店店主在柜台边和客人闲聊。\n';
    query += '- 如果真的不了解客人问的细节，可以说"这本书最打动我的其实是……"然后说你自己的感受。\n';
    query += '- 语气温暖、有感染力。你推荐的不是书，而是读这本书的体验。';

    return query;
  }

  /**
   * 向 AI 店主请教书籍（流式）
   * @param book 书籍对象 {title, author, category, blurb, bestMatch, recommendReason, coreMessage}
   * @param playerMsg 玩家的问题
   * @param history 对话历史
   * @param onChunk 实时回调
   */
  function askAboutBook(book, playerMsg, history, onChunk) {
    var messages = [
      { role: 'system', content: buildBookPrompt(book) }
    ];

    if (history && history.length > 0) {
      for (var i = 0; i < history.length; i++) {
        messages.push(history[i]);
      }
    }

    messages.push({ role: 'user', content: playerMsg });

    return callLLMStream(messages, BOOK_TEMPERATURE, onChunk).catch(function(err) {
      console.error('[LLM Book]', err);
      var fallbacks = [
        '这本《' + book.title + '》最打动我的地方，是它在最平凡的地方找到了光。',
        book.title + '啊……我记得第一次翻开它，是一整个下午没能放下。',
        '要说这本书好在哪——大概是你读完之后，看世界的眼光会有一点不一样。',
        book.author + '的文字像老朋友坐在一起说话，不紧不慢，但句句都在心里。'
      ];
      var fb = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      onChunk(fb, true);
      return fb;
    });
  }

  // ============ 一个月后回信 ============

  function generateReply(book, npc, onChunk) {
    var readerName = npc && npc.name ? npc.name : '一位读者';
    var messages = [
      {
        role: 'system',
        content: '你是《最后的书店》里曾经被店主帮助过的读者。请写一封一个月后的回信，温暖、具体、克制，不超过180字。'
      },
      {
        role: 'user',
        content: '读者：' + readerName + '\n书：《' + book.title + '》\n作者：' + book.author + '\n推荐理由：' + (book.recommendReason || '') + '\n请写回信。'
      }
    ];

    return callLLMStream(messages, 0.7, onChunk).catch(function(err) {
      console.error('[LLM Reply]', err);
      var fb = fallbackReply(book, readerName);
      if (onChunk) onChunk(fb, true);
      return fb;
    });
  }

  function fallbackReply(book, readerName) {
    var openings = [
      readerName + '在信里写道：',
      '一个月后，' + readerName + '寄来一张折得很整齐的纸：',
      readerName + '把信放在门缝里，字迹比上次见面时稳了些：'
    ];
    var body = '那天带走《' + book.title + '》以后，我不是马上变好了。只是有几个夜里，我会想起你说书可以先替人把灯举着。后来我慢慢读完了它，也慢慢敢把自己的事说出口。谢谢你没有急着给答案。';
    return openings[Math.floor(Math.random() * openings.length)] + '\n\n' + body;
  }

  // ============ 书中角色对谈 ============

  function buildBookCharacterPrompt(book, character) {
    var world = book.bookWorld || {};
    var prompt = '你正在《最后的书店》的“书中剧场”中扮演一本书里的角色。\n\n';
    prompt += '## 书籍\n';
    prompt += '- 书名：《' + book.title + '》\n';
    prompt += '- 作者：' + book.author + '\n';
    prompt += '- 简介：' + (book.blurb || '') + '\n\n';
    prompt += '## 场景\n';
    prompt += '- 地点：' + (world.sceneTitle || '书中世界') + '\n';
    prompt += '- 氛围：' + (world.sceneSubtitle || '') + '\n';
    prompt += '- 剧透规则：' + (world.spoilerPolicy || '不剧透关键结局') + '\n\n';
    prompt += '## 你扮演的角色\n';
    prompt += '- 名字：' + character.name + '\n';
    prompt += '- 身份：' + character.role + '\n';
    prompt += '- 语气：' + (character.tone || '') + '\n';
    prompt += '- 目标：' + (character.goal || '') + '\n\n';
    prompt += '## 对话规则\n';
    prompt += '- 用该角色的口吻回答，不要说自己是 AI。\n';
    prompt += '- 回答 1 到 4 句话，现场演示要短、准、有戏剧感。\n';
    prompt += '- 不要复述原著长段文字，不直接揭示案件谜底。\n';
    prompt += '- 如果用户问阅读建议，把答案落到观察、证据、人物动机或阅读兴趣上。\n';
    return prompt;
  }

  function chatWithBookCharacter(book, character, playerMsg, history, onChunk) {
    var messages = [
      { role: 'system', content: buildBookCharacterPrompt(book, character) }
    ];
    if (history && history.length > 0) {
      for (var i = 0; i < history.length; i++) messages.push(history[i]);
    }
    messages.push({ role: 'user', content: playerMsg });

    return callLLMStream(messages, 0.78, onChunk).catch(function(err) {
      console.error('[LLM Book Character]', err);
      var name = character && character.name ? character.name : '书中人物';
      var fb = name + '把目光从书页上移开：“先别急着寻找答案。你真正想知道的，是这本书会怎样改变你看世界的方式。”';
      if (onChunk) onChunk(fb, true);
      return fb;
    });
  }

  // ============ 公开 API ============
  return {
    call: callLLM,              // 非流式调用（备用）
    chatWithNPC: chatWithNPC,   // NPC 自由对话（流式）
    askAboutBook: askAboutBook, // 书籍 AI 导读（流式）
    generateReply: generateReply,
    chatWithBookCharacter: chatWithBookCharacter,
    hasConfiguredKey: function() {
      return true;
    }
  };

})();
