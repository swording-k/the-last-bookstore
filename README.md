# 最后的书店 / The Last Bookstore

> 腾讯云 AI 黑客松 40 赛道 · 叙事剧情游戏 · AI CAN DO IT
> 大断联后的第 7 年，云端知识沉默，纸质书重新成为人类能握在手里的记忆。
> 你能不能在第 7 天之前，点燃这个小镇最后一点希望？

## 🎮 立即体验

**👉 <https://swording-k.github.io/the-last-bookstore/>**

（GitHub Pages 部署，浏览器直接打开，无需下载任何东西。）

> 戴上耳机、关灯、把窗口放到最大 — BGM + 暖色场景 + 打字机叙事的沉浸感比录屏好十倍。
> 完整一周目约 25 分钟。

### 本地运行（如果 Pages 还没起来）

```bash
git clone https://github.com/swording-k/the-last-bookstore.git
cd the-last-bookstore
python3 -m http.server 8080
# 打开 http://localhost:8080/
```

## 关于

7 天。24 本书。6 个灵魂。1 间还在营业的书店。

你扮演橡木镇唯一还在营业的书店老板。每天门铃会响，会有带着故事的人走进来 — 疲惫的母亲、孤独的老农、自卑的小孩、超负荷的医生、迷惘的女诗人、神秘的旅人。你要做的不只是卖书，而是**听懂他们**，**推荐对的那一本**。

每一次对话、每一次选择都会影响 **希望值（hope）** 和 **声誉（rep）**。7 天后，4 种结局之一等着你。

## 怎么玩

1. 点 **推开那扇门** 开始
2. 每天开场看一段**叙事过场**（大断联背景介绍 + 当日目标）
3. 门铃响 → **接待** → 看 NPC 故事 → **选回应**（三个分支按钮）
4. 想聊点不一样的？点 **💬 和 TA 自由交谈**，AI 真 NPC 实时对话
5. 选完后 **推荐一本书** → 在 24 本书里选 → 看匹配度（完美 / 良好 / 中性）
6. 一本书完成 → 继续接待下一个
7. 一天结束 → **看店主日记**（AI 生成）→ 推进到下一天
8. 第 7 天结束 → 触发结局

## 4 种结局

| 结局 | 条件 | 感觉 |
| --- | --- | --- |
| **平凡日子** | 7 天后希望值 40-60 | 你只是个守店的 |
| **守望者** | 7 天后希望值 60-80 | 你让几个人不再孤单 |
| **点燃希望** ✦ TRUE | 第 6+ 天 + hope≥80 + 见过旅人 | 整个小镇都变了 |
| **最后的读者** 🌙 HIDDEN | 第 7 天 + hope≥60 + 见过旅人 + 5+ 完美 | 旅人留下的旧书，笔迹是祖父的 |

## AI 用了哪里？

- **6 张 NPC 立绘**（matrix AI 出图，3 轮 prompt 迭代）
- **24 张书封面**（同上）
- **4 段 BGM / 4 个 SFX**（matrix AI 音乐生成）
- **NPC 自由对话**（阿里云百炼 qwen-plus 流式，6 秒内生成含剧情细节的角色扮演回复）
- **书籍 AI 导读**（同上，问作者问题、聊书背后故事）
- **每日店主日记**（模板 + LLM 润色）
- **结果世界风注释**（完美/良好/中性匹配各一套氛围文案）

详细：[docs/AI-CREATION.md](docs/AI-CREATION.md)

## 技术

- 纯 HTML / CSS / 原生 JS，**零构建**
- 全部源码 < 100KB（不含资源）
- localStorage 3 槽存档
- **离线可玩**（AI 部分有本地 fallback，断网也不卡）
- 6 NPC + 24 书 + 4 结局 = 完整可重玩

工程文档：[docs/DEV.md](docs/DEV.md)
原始 GDD：[docs/GDD.md](docs/GDD.md)

## 📺 作品演示

**评委专用演示页**（HTML 幻灯片，键盘翻页，含游戏截图）：  
👉 <https://swording-k.github.io/the-last-bookstore/presentation.html>

## 部署

| 平台 | 状态 | 链接 |
| --- | --- | --- |
| GitHub Pages | 游戏本体 | <https://swording-k.github.io/the-last-bookstore/> |
| GitHub Pages | 演示文稿 | <https://swording-k.github.io/the-last-bookstore/presentation.html> |
| Vercel | 可一键导入 | `vercel.json` 已包含 |

## 演示真实 LLM

本仓库 `llm.js` 已硬编码一个**演示用 API Key**（阿里云百炼 qwen-plus，限额度小）。
- 部署到公网前，**务必**把它换掉 — 不然 Key 会泄露、别人可以蹭你的额度
- 推荐做法：把 Key 部署在云端，前端从环境变量注入到 `window.TLB_LLM_API_KEY`

## 控制台快捷键

```js
Engine.state                          // 查看当前状态
Engine.state.hope = 99               // 强行改希望值（debug 用）
Engine.state.metTraveler = true      // 见过旅人
Game._showNight()                    // 强制触发夜间面板
AudioManager.toggleMute()             // 切换静音
Renderer.skipTyping()                 // 跳过打字机
Renderer.showScreen('ending-screen') // 直接跳到结局页
```

## 致谢

- 腾讯云 AI 黑客松
- 矩阵 AI (matrix MCP) — 出图 / 出音乐
- 阿里云百炼 — qwen-plus 流式对话
- Codex — 联调优化（叙事过场 / AI 接入 / 结局平衡）
- 那个让我们坚持把《最后》做完的下午

---

_— 2026.06.11 —_
