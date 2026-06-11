# DEV.md — 最后的书店 / The Last Bookstore

> 给 Codex / 下一个开发者看的工程文档。
> 项目目标：腾讯云 AI 黑客松 40 赛道 · 叙事剧情游戏 · AI CAN DO IT

---

## 1. 项目概览

**《最后的书店》** 是一款 7 天的剧情向 Web 游戏。玩家扮演中国北方小镇「橡木镇」唯一还在营业的书店老板，每天接待 1–2 位访客，通过对话了解他们，推荐合适的书。每天的选择会累积希望值（hope）和声誉（rep），最终导向 4 种结局之一。

| 维度 | 数据 |
| --- | --- |
| 类型 | 文字冒险 / 经营 / 治愈 |
| 平台 | Web（HTML + CSS + 原生 JS，零构建） |
| 周期 | 7 天 / 局 |
| NPC | 6（林月、陈伯、小明、李医生、方小姐、神秘旅人） |
| 书籍 | 24（覆盖文学、哲学、心理、社科四大类） |
| 结局 | 4（平凡日子、守望者、点燃希望、最后的读者） |
| 存档 | 3 个 localStorage 槽 |
| 风格 | 电影感暖色调（参见 `style.css`） |

---

## 2. 目录结构

```
the-last-bookstore/
├── index.html              # 完整 DOM 结构（标题/游戏/结局 3 屏）
├── style.css               # 32KB 主题样式（电影感 / 4 时段 / 全部组件）
├── data.js                 # 6 NPC + 24 书 + 4 结局 + 对话树
├── engine.js               # 状态机（state + 转移函数，无副作用调用）
├── game.js                 # 主控制器（DOM 事件 + 流程编排）
├── renderer.js             # 渲染层（打字机、面板、模态、动画）
├── audio.js                # BGM（4 时段 cross-fade）+ SFX + 静音持久化
├── scene.js                # 场景特效（40 颗粒子、时段背景切换）
├── ai.js                   # AI 适配层（自由输入/作者对话/日记/匹配，全部带 fallback）
├── _old/                   # 原 WorkBuddy 版本（参考/废弃）
├── assets/
│   ├── portraits/          # 6 张 NPC 立绘（PNG, 1024×1024）
│   ├── covers/             # 24 张书封面（PNG, 3:4）
│   ├── scenes/             # 4 张场景氛围图（PNG, 1920×1080）
│   ├── music/              # 4 段 BGM（MP3, ~60–90s 循环）
│   └── sfx/                # 4 个音效（MP3, doorbell/page/select/night）
├── docs/
│   ├── GDD.md              # 原始游戏设计文档（2 万字，含完整对话树）
│   ├── DEV.md              # 本文件
│   └── AI-CREATION.md      # AI 创作说明（参赛提交用）
└── README.md               # 一页快速开始
```

---

## 3. 状态机

**唯一的真相之源：`Engine.state`（在 `engine.js`）**。

```js
Engine.state = {
  // 进度
  day: 1,                          // 当前天（1..7）
  daysCompleted: 0,                // 已结束的天数
  phase: 'title',                  // title | doorbell | dialogue | result | night | ending
  timeOfDay: 'morning',            // morning | afternoon | evening | night

  // 经济
  hope: 50,                        // 0..100
  reputation: 0,                   // 无上限

  // NPC
  currentNPC: null,                // 正在接待的 NPC 对象
  currentNPCId: null,              // 同上 .id
  customersToday: [],              // 今日队列（NPC id 数组）
  customerIndex: 0,                // 当前队列位置
  metTraveler: false,              // 是否见过旅人
  npcAffection: {},                // { [npcId]: int }
  bookLog: [],                     // 推荐记录 { day, npcId, bookId, match, delta }

  // 对话
  dialogueIndex: 0,                // 当前 NPC dialogue[] 索引

  // 累计
  totalPerfect: 0,                  // perfect 次数
  totalGood: 0,                    // good 次数
};
```

**状态转移函数（全部 pure / idempotent）**：

| 函数 | 副作用 | 何时调 |
| --- | --- | --- |
| `Engine.init()` | 重置 state | 启动 / 重新开始 |
| `Engine.startDay()` | build queue, set doorbell | 每天开始 |
| `Engine.advanceCustomer()` | 取出下一个 NPC | 门铃响应 |
| `Engine.applyEffect(eff)` | 修改 hope/rep | 玩家选 option |
| `Engine.evaluateBook(id)` | 返回 `{match, deltaHope, deltaRep, reason}` | 玩家点书 |
| `Engine.endDay()` | day++ | 接待完当天所有 NPC |
| `Engine.checkEnding()` | 返回 ending 对象 or null | 每天夜间 |

**Game 是 view-controller**（`game.js`），负责把状态变化映射到 UI 调用。`Renderer` 只读 state + DOM。**没有 setTimeout 嵌套**。

---

## 4. 对话数据结构（data.js）

```js
GameData.npcs.linYue = {
  id: 'linYue',
  name: '林月',
  tag: '年轻母亲',
  portrait: 'assets/portraits/linYue.png',
  // ... 颜色等元数据
  bestMatch: ['b01', 'b13', 'b14'],   // 完美匹配书单
  dialogue: [
    { text: '门上的铃铛响了一声……', isNarrator: true },
    { text: '她看起来很疲惫……', isNarrator: true },
    { text: '"请问……这里可以随便看看吗？"',
      options: [
        { text: '"当然请进。…"', effect: { hopeChange: 1 }, response: '她松了口气…' },
        { text: '"你看起来有心事……"', effect: { hopeChange: 2, repChange: 1 }, response: '她愣了一下…' },
        { text: '"打烊前随便看吧。"', effect: { hopeChange: -1, repChange: -1 }, response: '她点了点头…' }
      ]
    },
    // ...更多 dialogue，下一句、recommend action、leave 等
  ]
};

GameData.books.b01 = {
  id: 'b01', title: '小王子', author: '[法] 圣埃克苏佩里',
  category: '文学小说', cover: 'assets/covers/b01.png',
  description: '…', reason: '…',  // 通用描述 + 推荐理由
  isbN: '9787020042494'
};

GameData.endings = {
  trueEnding: { id, title, kind: 'true', text, stats: [...] },
  goodEnding: { id, title, kind: 'good', text, stats: [...] },
  normalEnding: { id, title, kind: 'normal', text, stats: [...] },
  hiddenEnding: { id, title, kind: 'hidden', text, stats: [...] }
};
```

**Option 字段是 `text`，不是 `label`（注意：原 data 字段名沿用）**。

---

## 5. 匹配算法（evaluateBook）

`Engine.evaluateBook(bookId)` 的判定顺序：

1. **perfect**：bookId 在 `npc.bestMatch` 内 → `{match: 'perfect', deltaHope: 10, deltaRep: 5}`
2. **good**：book.category ∈ {文学小说, 哲学思辨, 心理成长} → `deltaHope: 5, deltaRep: 2`
3. **neutral**：其余 → `deltaHope: 1, deltaRep: 0`
4. **mismatch**：分类冲突（社科→文学等）→ `deltaHope: -1, deltaRep: -1`

**匹配理由（reason）会显示在 Result 面板**，告诉玩家为什么这本书合适/不合适。

---

## 6. 结局边界

```js
// engine.js: checkEnding()
if (s.metTraveler && s.totalPerfect >= 5 && s.hope >= 70)
  return hiddenEnding;             // 最后的读者（隐藏，优先）
if (s.hope >= 85 && s.daysCompleted >= 6 && s.totalPerfect >= 4 && s.metTraveler)
  return trueEnding;               // 点燃希望（真结局）
if (s.hope >= 70 && s.daysCompleted >= 5 && s.totalPerfect >= 2)
  return goodEnding;               // 守望者
return normalEnding;               // 平凡日子
```

隐藏结局需要在第 6 晚之前见过旅人 + 5+ 完美推荐 + 70+ 希望。

---

## 7. AI 模块（ai.js）

AI 模块化设计，**所有调用都有本地 fallback**，绝不阻塞游戏：

```js
AI.config = {
  enabled: true,                  // 一键关闭
  provider: 'openai',             // 'openai' | 'claude' | 'mock'
  apiKey: '<YOUR_KEY>',           // 留空则全部走 fallback
  endpoint: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-4o-mini',
  timeout: 8000
};
```

四个 AI 功能：

| 函数 | 用途 | Fallback 策略 |
| --- | --- | --- |
| `AI.parseFreeInput(npc, history, text)` | 自由输入 → 情绪标签 + 回应 | 关键词词典 |
| `AI.chatWithAuthor(book, history, q)` | 与作者对话 | 书籍内置 8 条台词 |
| `AI.generateDiary(state, bookLog)` | 每日店主日记 | 模板填充（hope/rep/天气） |
| `AI.suggestBook(npc, books, history)` | （未启用，备查） | 评分排序 |

**接入真 LLM**（参考 `ai.js` 末尾的 `callLLM` 实现）：

```js
async function callLLM(systemPrompt, userPrompt) {
  const r = await fetch(AI.config.endpoint, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${AI.config.apiKey}`,
               'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: AI.config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 200
    })
  });
  const j = await r.json();
  return j.choices[0].message.content;
}
```

每个 AI 入口都包 `Promise.race([callLLM(...), timeout(8000), fallback])`，超时即走本地。

---

## 8. 视觉规范

- **主色**：暖木色 `#D4A574` / 牛皮纸 `#E8C99B` / 金边 `#B8844E` / 暗背景 `#1A0F08`
- **字体**：标题 `Noto Serif SC`，正文 `Noto Serif SC`，点缀 `Cormorant Garamond`
- **4 时段背景**（body class `tod-morning/afternoon/evening/night`）—— 渐变色 + 亮度，**不切换图片**（节省带宽）
- **粒子**：`scene.js` 生成 40 颗漂浮尘埃（`position: fixed` + 渐变 + 缓动）
- **打字机**：32 ms/字，光标脉动
- **选项**：1px 金边 + hover 暖色高亮 + click 缩放反馈

---

## 9. 部署

```bash
# 本地
cd the-last-bookstore
python3 -m http.server 8080
# 访问 http://localhost:8080/

# 静态托管（Vercel/Netlify/腾讯云 COS）
# 直接上传整个目录即可。零构建。
```

**注意**：
- 必须用 HTTP（不能 `file://`），因为 audio 模块用 `fetch` 加载 MP3
- 离线场景下会自动静默音频失败，游戏不阻塞

---

## 10. 已知边界 / 扩展点

1. **AI 接入**：当前 `AI.config.apiKey` 留空，需要参赛 demo 时填入；接入后会在 night panel 显示 LLM 生成的日记
2. **多存档导入/导出**：当前只支持单设备 localStorage 3 槽；可加 JSON 导入导出
3. **全键盘导航**：当前主要鼠标；可加 1-9 选 option / Enter 推进
4. **i18n**：当前中文 only；data.js 结构支持 i18n 字段扩展
5. **成就系统**：4 结局 + 6 NPC 偏好 + 24 书籍，可加 Steam 风格成就

---

## 11. 调试清单

| 症状 | 排查 |
| --- | --- |
| 控制台 `Audio is not a constructor` | 浏览器 `Audio` 全局被覆盖；audio.js 已改名为 `AudioManager` |
| NPC portrait 不显示 | 检查 `assets/portraits/<id>.png` 是否存在 |
| BGM 不响 | 浏览器自动播放策略，需用户首次点击；可在 console 调 `AudioManager.playBGM('morning')` |
| 打字机卡住 | `Renderer._typeTimer` 残留；调 `Renderer.skipTyping()` 解锁 |
| 结局不触发 | 看 `Engine.state.daysCompleted` 和 `metTraveler` 是否满足边界 |

---

## 12. 关键文件改动历史

| 文件 | 改动 | 原因 |
| --- | --- | --- |
| `audio.js` | `var Audio` → `var AudioManager` | 避免覆盖浏览器原生 `Audio` 构造器 |
| `index.html` | 调整 script 加载顺序 | audio.js 必须在 renderer.js 之前 |
| `index.html` | doorbell div 加 `onclick` | 之前门铃点击没绑事件 |
| `game.js` | `Engine.dialogueIndex++` → `Engine.state.dialogueIndex++` | bug：用了不存在的 path |

---

## 13. 测试

**单元测试（Node mock 跑过）**：状态机、4 结局、书籍评估、AI 三个入口 — 全过。

**E2E（Playwright + Chromium 真实跑过）**：

1. ✅ 标题画面 → 开始
2. ✅ 书店场景 + 门铃提示
3. ✅ 林月对话（含打字机、3 句 narration + 3 选项）
4. ✅ 选友好选项 → 希望值 +2 / 声誉 +1
5. ✅ 多轮对话推进
6. ✅ 推荐按钮触发
7. ✅ 14 本书书架（按分类分组）
8. ✅ 《小王子》详情（真实 cover + 系统推荐标）
9. ✅ 完美匹配 Result（hope +10 / rep +5）
10. ✅ 继续 → 第二个 NPC 门铃
11. ✅ True Ending（点燃希望，hope=85/days=6/perfect=4/traveler）
12. ✅ Hidden Ending（最后的读者，totalPerfect=6/traveler/hope=75）

完整截图见 `_screens/`（开发时保留）。Mavis 已用真实浏览器验证。

---

_— Mavis 2026/06/11_
