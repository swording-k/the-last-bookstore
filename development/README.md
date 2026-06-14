# 黑客松开发包 — 「我的书店」6 小时快速上手

> 腾讯云 AI 黑客松 40 赛道 / MiniCamp 参赛使用
> 目标：在 6 小时内为《最后的书店》新增「我的书店」个人页功能

## 📁 文档索引

| 文档 | 用途 | 谁需要读 |
|---|---|---|
| **[PLAN-mystore.md](./PLAN-mystore.md)** | 完整开发计划（产品 + 技术 + 6h 时间轴） | 所有人（先读这个） |
| **[DEV-HANDOVER.md](./DEV-HANDOVER.md)** | 接手开发指南（含完整代码骨架） | 写代码的 agent / 你 |
| **[DEMO-SCRIPT.md](./DEMO-SCRIPT.md)** | 演示稿（4 分钟 + Q&A 预案） | 演讲者 |

## 🚀 快速开始

```bash
# 1. 备份（强烈建议）
cp -r /Users/baojian/Desktop/the-last-bookstore /Users/baojian/Desktop/the-last-bookstore_backup_v6

# 2. 启动本地服务
cd /Users/baojian/Desktop/the-last-bookstore && python3 -m http.server 9876
# 打开 http://127.0.0.1:9876/index.html
```

## 📋 任务清单（按顺序）

- [ ] **0h - 0.5h**：备份 + 玩通一遍游戏理解循环
- [ ] **0.5h - 1h**：`engine.js` 加 `mylist: []` 字段
- [ ] **1h - 3h**：建 `mystore.js` + 写主页面 UI
- [ ] **3h - 4h**：在结果面板加「📖 我也想读」按钮
- [ ] **4h - 5h**：LLM 回信 + 复制待读清单
- [ ] **5h - 5:45h**：完整测试 + 录演示视频
- [ ] **5:45h - 6h**：演练 + 收尾

详见 [PLAN-mystore.md](./PLAN-mystore.md) 的"四、6 小时时间轴"。

## 🎯 关键设计原则

1. **不破坏现有游戏循环**——只读 `Engine.state`
2. **离线优先**——所有功能断网也能跑
3. **6 小时砍功能优先级**：
   - 必做：mylist 按钮 + 个人页 + 复制待读清单
   - 必做：LLM 回信 + fallback
   - 可选：海报生成（依赖 html2canvas）
   - 可不：把海报做精（直接"长按截图"提示）

## ⚠️ 风险预案

| 风险 | 应对 |
|---|---|
| LLM 不响应 | 已有 fallback，3 套手写体回信模板 |
| API key 失效 | 演示前 30 分钟换 key |
| 现场 WiFi 断 | 个人页是纯本地，**断网也能跑** |
| 时间不够 | 先砍海报功能——回信是次要，个人页是核心 |
| 评委问版权 | "我们做 AI 解读+引流，**不抢微信读书生意**" |

详见 [PLAN-mystore.md](./PLAN-mystore.md) 的"五、风险预案"。

## 🆘 紧急联系

- 完整代码骨架 → [DEV-HANDOVER.md](./DEV-HANDOVER.md) 第 2.3 节
- 调试技巧 → [DEV-HANDOVER.md](./DEV-HANDOVER.md) 第 4 节
- 演示前 5 分钟 → [DEMO-SCRIPT.md](./DEMO-SCRIPT.md) 末 Checklist

---

**写于 2026-06-14 · 比赛前一天**

加油 💪
