#!/usr/bin/env python3
"""生成《最后的书店》增强版作品介绍 PPT（简化版）"""

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
import os

BASE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(BASE, 'assets')
SCREENSHOTS = [
    os.path.join(ASSETS, '截屏2026-06-11 22.12.25.png'),
    os.path.join(ASSETS, '截屏2026-06-11 22.12.31.png'),
    os.path.join(ASSETS, '截屏2026-06-11 22.12.38.png'),
    os.path.join(ASSETS, '截屏2026-06-11 22.12.55.png'),
    os.path.join(ASSETS, '截屏2026-06-11 22.13.20.png'),
]
SCENE_BG = os.path.join(ASSETS, 'scenes', 'evening.png')

# ══ 颜色 ══
CREAM      = RGBColor(0xFF, 0xF8, 0xE1)
TAN        = RGBColor(0xD4, 0xA5, 0x74)
GOLDEN     = RGBColor(0xB8, 0x84, 0x4E)
DARK       = RGBColor(0x3E, 0x27, 0x23)
DEEP       = RGBColor(0x2C, 0x18, 0x10)
PURPLE     = RGBColor(0x5D, 0x4E, 0x8A)
PAPER      = RGBColor(0xFA, 0xF3, 0xE0)
WARM_GRAY  = RGBColor(0x8B, 0x7B, 0x6E)

W = 13.333   # slide width in inches
H = 7.5      # slide height

prs = Presentation()
prs.slide_width  = Inches(W)
prs.slide_height = Inches(H)

# ══ helpers ══

def bg(slide, img_path):
    if os.path.exists(img_path):
        slide.shapes.add_picture(img_path, 0, 0, prs.slide_width, prs.slide_height)

def rect(slide, l, t, w, h, color, line_color=None):
    s = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, l, t, w, h)
    s.fill.solid()
    s.fill.fore_color.rgb = color
    if line_color:
        s.line.color.rgb = line_color
        s.line.width = Pt(1.5)
    else:
        s.line.fill.background()
    return s

def txt(slide, l, t, w, h, text, size=14, color=DEEP, bold=False,
        align=PP_ALIGN.LEFT, wrap=True):
    tb = slide.shapes.add_textbox(l, t, w, h)
    tf = tb.text_frame
    tf.word_wrap = wrap
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(size)
    p.font.color.rgb = color
    p.font.bold = bold
    p.alignment = align
    return tb

def mtxt(slide, l, t, w, h, lines, size=14, color=DEEP, bold=False,
         align=PP_ALIGN.LEFT, line_spacing=1.5):
    tb = slide.shapes.add_textbox(l, t, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = line
        p.font.size = Pt(size)
        p.font.color.rgb = color
        p.font.bold = bold
        p.alignment = align
        p.space_after = Pt(size * (line_spacing - 1))
    return tb

def shot(slide, img, l, t, w, h=None):
    if not os.path.exists(img):
        print(f"  ⚠ 截图不存在: {os.path.basename(img)}")
        return
    if h is None:
        h = w
    pic = slide.shapes.add_picture(img, l, t, w, h)
    pic.line.color.rgb = TAN
    pic.line.width = Pt(1.5)
    return pic

def section(slide, title, sub=None):
    rect(slide, Inches(0.6), Inches(0.5), Inches(0.08), Inches(0.7), TAN)
    txt(slide, Inches(0.9), Inches(0.45), Inches(11), Inches(0.6),
        title, size=26, color=DEEP, bold=True)
    if sub:
        txt(slide, Inches(0.9), Inches(1.0), Inches(11), Inches(0.4),
            sub, size=13, color=GOLDEN)

# ══ Slide 1 — 封面 ══
print("📄 Slide 1 — 封面")
slide = prs.slides.add_slide(prs.slide_layouts[6])
bg(slide, SCENE_BG)
# 深色遮罩（用半透明矩形 + 黑色）
overlay = rect(slide, Inches(0), Inches(0), Inches(W), Inches(H), DARK)
# 无法直接设置 alpha，改用渐变思路或纯色叠加
# 用黑色矩形 + 手动调透明度不太行，直接深棕色吧
overlay.fill.solid()
overlay.fill.fore_color.rgb = DARK
# 实际上 pptx 不支持 alpha，改用不透明深色 + 加亮文字

txt(slide, Inches(0), Inches(1.8), Inches(W), Inches(1.2),
    '最后的书店', size=56, color=PAPER, bold=True, align=PP_ALIGN.CENTER)
txt(slide, Inches(0), Inches(3.0), Inches(W), Inches(0.6),
    'THE LAST BOOKSTORE', size=20, color=TAN, align=PP_ALIGN.CENTER)
# 分割线
line = rect(slide, Inches(5), Inches(3.7), Inches(3.333), Pt(2), TAN)
txt(slide, Inches(0), Inches(4.0), Inches(W), Inches(0.8),
    '大断联后的第 7 年 · 云端沉默，纸页仍在发光', size=16,
    color=PAPER, align=PP_ALIGN.CENTER)
txt(slide, Inches(0), Inches(4.6), Inches(W), Inches(1.0),
    '腾讯云 AI 黑客松 #40 · 叙事剧情游戏赛道 · AI CAN DO IT',
    size=14, color=GOLDEN, align=PP_ALIGN.CENTER)
txt(slide, Inches(0), Inches(6.2), Inches(W), Inches(0.5),
    '纯前端 Web 游戏 ｜ 7 天叙事 ｜ 24 本书 ｜ 6 个 NPC ｜ 4 种结局 ｜ AI 深度集成',
    size=12, color=GOLDEN, align=PP_ALIGN.CENTER)

# ══ Slide 2 — 游戏概述 ══
print("📄 Slide 2 — 游戏概述")
slide = prs.slides.add_slide(prs.slide_layouts[6])
rect(slide, Inches(0), Inches(0), Inches(W), Inches(H), PAPER)
section(slide, '游戏概述', '当你拥有镇上最后一间书店，书成了最珍贵的记忆载体')

mtxt(slide, Inches(0.75), Inches(1.8), Inches(5.5), Inches(4.5), [
    '🗺 世界观：204X 年，"大断联"降临——全球网络、服务器、',
    '电子设备同时永久失效。人类一夜回到 analog 时代。',
    '',
    '📖 纸质书成为最珍贵的知识载体，橡木镇只剩一间还在',
    '营业的书店——你继承的「墨香书店」。',
    '',
    '👤 你扮演祖父的书店继承人。他的信里写着：',
    '"这家店的价值不在于卖了多少本书，',
    '而在于对走进来的每一个人，',
    '给出了正确的那一句回答。"',
    '',
    '🎯 目标：7 天内，通过为每位来访者推荐合适的书，',
    '累积希望值（Hope），改变小镇的命运。',
], size=14, line_spacing=1.4)
shot(slide, SCREENSHOTS[0], Inches(7.0), Inches(1.5), Inches(5.5))

# ══ Slide 3 — 核心玩法 ══
print("📄 Slide 3 — 核心玩法")
slide = prs.slides.add_slide(prs.slide_layouts[6])
rect(slide, Inches(0), Inches(0), Inches(W), Inches(H), PAPER)
section(slide, '核心玩法机制', '倾听 → 理解 → 推荐 → 改变')

flow = [
    ('🌅 每日清晨', '叙事过场\n了解当日背景'),
    ('🔔 门铃响起', 'NPC 来访\n倾听他们的故事'),
    ('💬 对话选择', '3 分支选项\n或 AI 自由交谈'),
    ('📚 推荐书籍', '24 本书中选一本\n完美/良好/一般/不匹配'),
    ('🌙 打烊纪录', 'AI 生成店主日记\n更新希望值'),
]
sw = Inches(2.2)
sx = Inches(0.5)
for i, (title, desc) in enumerate(flow):
    x = sx + i * (sw + Inches(0.22))
    rect(slide, x, Inches(1.95), sw, Inches(2.0), RGBColor(0xFF, 0xF0, 0xD8))
    txt(slide, x + Inches(0.1), Inches(2.0), sw - Inches(0.2), Inches(0.5),
        title, size=14, color=DEEP, bold=True, align=PP_ALIGN.CENTER)
    txt(slide, x + Inches(0.1), Inches(2.55), sw - Inches(0.2), Inches(0.8),
        desc, size=12, color=WARM_GRAY, align=PP_ALIGN.CENTER)
    if i < 4:
        txt(slide, x + sw + Inches(0.02), Inches(2.65), Inches(0.2), Inches(0.4),
            '→', size=20, color=TAN, bold=True, align=PP_ALIGN.CENTER)

txt(slide, Inches(0.75), Inches(4.3), Inches(5), Inches(0.4),
    '游戏主画面预览', size=14, color=GOLDEN, bold=True)
shot(slide, SCREENSHOTS[1], Inches(2.0), Inches(4.7), Inches(9.33))

# ══ Slide 4 — NPC 系统 ══
print("📄 Slide 4 — NPC 系统")
slide = prs.slides.add_slide(prs.slide_layouts[6])
rect(slide, Inches(0), Inches(0), Inches(W), Inches(H), PAPER)
section(slide, '6 位 NPC · 7 天叙事弧线', '每个来访者带着各自的困境，而每本书都可能改变一个人的人生轨迹')

npcs = [
    ('林月', '年轻母亲', '疲惫迷茫，寻找生活的意义', TAN),
    ('陈伯', '孤独老农', '怀念过去，担忧传统的消逝', RGBColor(0xB8, 0x84, 0x4E)),
    ('小明', '自卑小孩', '好奇心旺盛却缺乏自信', RGBColor(0x3D, 0x99, 0x70)),
    ('李医生', '超负荷医生', '职业倦怠，质疑自己的选择', RGBColor(0x41, 0x69, 0xE1)),
    ('方小姐', '迷惘诗人', '在现实与理想间挣扎', PURPLE),
    ('旅人', '神秘访客', '隐藏着与祖父有关的秘密', RGBColor(0xC9, 0xA2, 0x27)),
]
cw = Inches(1.85)
for i, (name, tag, desc, clr) in enumerate(npcs):
    x = Inches(0.42) + i * (cw + Inches(0.18))
    rect(slide, x + Inches(0.25), Inches(1.7), Inches(1.35), Inches(1.0), clr)
    txt(slide, x, Inches(1.75), cw, Inches(0.35), name, size=14, color=DEEP, bold=True, align=PP_ALIGN.CENTER)
    txt(slide, x, Inches(2.1), cw, Inches(0.25), tag, size=10, color=GOLDEN, align=PP_ALIGN.CENTER)
    txt(slide, x, Inches(2.35), cw, Inches(0.5), desc, size=9, color=WARM_GRAY, align=PP_ALIGN.CENTER)

mtxt(slide, Inches(0.75), Inches(3.1), Inches(6.0), Inches(3.5), [
    '📅 7 天叙事弧线设计',
    '────────────────────────────',
    'Day 1  「忐忑」林月(初) + 陈伯(初)    尝试开店',
    'Day 2  「不安」小明(初) + 李医生(初)   试探人心',
    'Day 3  「紧张」方小姐(初) + 林月(回)   暗流涌动',
    'Day 4  「低落」陈伯(回) + 小明(回)     裂缝出现',
    'Day 5  「疲惫」李医生(回) + 方小姐(回)  ⚡ 关键转折',
    'Day 6  「希望」旅人(条件) + 随机回访   曙光初现',
    'Day 7  「坚定」最深互动 NPC 最终回访   终章',
], size=12, line_spacing=1.3)
shot(slide, SCREENSHOTS[2], Inches(7.0), Inches(3.8), Inches(5.5))

# ══ Slide 5 — 书籍推荐系统 ══
print("📄 Slide 5 — 书籍推荐系统")
slide = prs.slides.add_slide(prs.slide_layouts[6])
rect(slide, Inches(0), Inches(0), Inches(W), Inches(H), PAPER)
section(slide, '24 本书 + 智能匹配推荐', '每本书都有最佳匹配 NPC，推荐正确与否影响希望值和结局')

shot(slide, SCREENSHOTS[3], Inches(0.5), Inches(1.7), Inches(6.0))

mtxt(slide, Inches(7.0), Inches(1.7), Inches(5.8), Inches(5.0), [
    '📊 四大分类，每类 6 本',
    '────────────────────────────',
    '文学小说：《小王子》《挪威的森林》《月亮与', '  六便士》《百年孤独》《活着》《局外人》',
    '',
    '哲学思辨：《活出生命的意义》《悉达多》',
    '  《苏菲的世界》《瓦尔登湖》《被讨厌的勇气》',
    '  《沉思录》',
    '',
    '心理成长：《自卑与超越》《非暴力沟通》',
    '  《也许你该找个人聊聊》《心流》《共情的力量》',
    '  《思考，快与慢》',
    '',
    '社会人文：《乡土中国》《枪炮病菌与钢铁》',
    '  《人类简史》《乌合之众》《娱乐至死》',
    '  《寂静的春天》',
    '',
    '🎯 匹配等级',
    '────────────────────────────',
    '🌟 完美匹配 → Hope +8~12 | ✅ 好推荐 → Hope +4~7',
    '➖ 一般     → Hope +1~2   | ❌ 不匹配 → Hope -3~-5',
], size=11, line_spacing=1.25)

# ══ Slide 6 — AI 集成 ══
print("📄 Slide 6 — AI 深度集成")
slide = prs.slides.add_slide(prs.slide_layouts[6])
rect(slide, Inches(0), Inches(0), Inches(W), Inches(H), PAPER)
section(slide, '5 大 AI 集成点', '从对话到日记，AI 贯穿游戏全流程')

ai_items = [
    ('💬', 'NPC 自由交谈', 'MiniMax-M2.5-highspeed\n流式打字机效果\n实时角色扮演对话'),
    ('🤖', '书籍 AI 导读', '与"作者灵魂"对话\n根据书籍主题生成回复\n深挖书中哲理'),
    ('📝', '每日店主日记', '根据当日希望值/事件\nAI 生成治愈向日记\n个性化叙事收尾'),
    ('🧠', '情感识别匹配', 'NLP 情绪意图分类\n8 类情感标签\n动态调整推荐逻辑'),
    ('🎨', 'AI 素材生成', 'Matrix AI 出图/出音乐\n6 NPC 立绘 + 24 封面\n4 BGM + 4 SFX'),
]
aw = Inches(2.25)
for i, (icon, title, desc) in enumerate(ai_items):
    x = Inches(0.5) + i * (aw + Inches(0.22))
    rect(slide, x, Inches(1.8), aw, Inches(2.5), RGBColor(0xFF, 0xF0, 0xD8))
    txt(slide, x, Inches(1.9), aw, Inches(0.5), icon, size=28, align=PP_ALIGN.CENTER)
    txt(slide, x, Inches(2.45), aw, Inches(0.4), title, size=14, color=DEEP, bold=True, align=PP_ALIGN.CENTER)
    txt(slide, x + Inches(0.15), Inches(2.9), aw - Inches(0.3), Inches(1.2), desc, size=11, color=WARM_GRAY, align=PP_ALIGN.CENTER)

txt(slide, Inches(0.75), Inches(4.5), Inches(5), Inches(0.4),
    'AI 自由交谈界面预览', size=14, color=GOLDEN, bold=True)
shot(slide, SCREENSHOTS[4], Inches(2.0), Inches(4.9), Inches(9.33))

# ══ Slide 7 — 叙事弧线详情 ══
print("📄 Slide 7 — 叙事弧线")
slide = prs.slides.add_slide(prs.slide_layouts[6])
rect(slide, Inches(0), Inches(0), Inches(W), Inches(H), PAPER)
section(slide, '叙事设计与情感弧线', '7 天从忐忑到坚定，希望值的每次变化都在影响小镇的命运')

days = [
    ('Day 1', '忐忑', '林月(初) + 陈伯(初)', '首次开店，面对陌生访客', '开始'),
    ('Day 2', '不安', '小明(初) + 李医生(初)', '试探人心，积累信任', '累积'),
    ('Day 3', '紧张', '方小姐(初) + 林月(回)', '暗流涌动，回访NPC变化', '转折'),
    ('Day 4', '低落', '陈伯(回) + 小明(回)', '裂缝出现，考验耐心', '低谷'),
    ('Day 5', '疲惫', '李医生(回) + 方小姐(回)', '⚡ 关键转折点，旅人条件', '突变'),
    ('Day 6', '希望', '旅人(条件) + 随机回访', '曙光初现，秘密揭露', '上升'),
    ('Day 7', '坚定', '最深互动NPC最终回访', '终章，所有选择揭晓', '结局'),
]
# 表头
cols = [(Inches(0.5), Inches(1.3)), (Inches(1.9), Inches(1.0)),
        (Inches(3.0), Inches(2.2)), (Inches(5.3), Inches(3.2)), (Inches(8.6), Inches(1.8))]
headers = ['Day', '情绪', 'NPC 排期', '叙事要点', '剧情权重']
for (x, w), h in zip(cols, headers):
    rect(slide, x, Inches(1.8), w, Inches(0.45), TAN)
    txt(slide, x, Inches(1.82), w, Inches(0.42), h, size=12, color=PAPER, bold=True, align=PP_ALIGN.CENTER)

rh = Inches(0.65)
for i, (day, mood, npc, point, weight) in enumerate(days):
    y = Inches(2.25) + i * rh
    bg_c = RGBColor(0xFF, 0xF5, 0xE8) if i % 2 == 0 else PAPER
    rect(slide, Inches(0.5), y, Inches(10.0), rh, bg_c)
    txt(slide, Inches(0.5), y + Inches(0.1), Inches(1.3), rh - Inches(0.2), day, size=13, color=DEEP, bold=True, align=PP_ALIGN.CENTER)
    txt(slide, Inches(1.9), y + Inches(0.1), Inches(1.0), rh - Inches(0.2), mood, size=13, color=GOLDEN, bold=True, align=PP_ALIGN.CENTER)
    txt(slide, Inches(3.0), y + Inches(0.1), Inches(2.2), rh - Inches(0.2), npc, size=12, color=DEEP, align=PP_ALIGN.CENTER)
    txt(slide, Inches(5.3), y + Inches(0.1), Inches(3.2), rh - Inches(0.2), point, size=12, color=WARM_GRAY, align=PP_ALIGN.LEFT)
    txt(slide, Inches(8.6), y + Inches(0.1), Inches(1.8), rh - Inches(0.2), weight, size=12, color=PURPLE, bold=True, align=PP_ALIGN.CENTER)

# ══ Slide 8 — 结局系统 ══
print("📄 Slide 8 — 结局系统")
slide = prs.slides.add_slide(prs.slide_layouts[6])
rect(slide, Inches(0), Inches(0), Inches(W), Inches(H), PAPER)
section(slide, '4 种结局 · 多重命运', '你的每一个选择都在书写小镇的结局')

endings = [
    ('🌙 最后的读者', 'HIDDEN', 'days≥7, metTraveler,\ntotalPerfect≥5, hope≥60',
     '旅人留下的旧书，字迹是祖父的。\n原来你等待的最后一个读者，是过去的自己。', PURPLE),
    ('🌟 点燃希望', 'TRUE ENDING', 'days≥6, hope≥80,\ntotalPerfect≥4, metTraveler',
     '整个小镇都变了。书店灯光重新亮起，\n你的选择点燃了一个社区的希望。', RGBColor(0xE0, 0x7A, 0x5F)),
    ('🏠 守望者', 'GOOD ENDING', 'days≥5, hope 60–79',
     '你让几个人不再孤单。虽然前路漫长，\n但你决定守在这里，守到他们回来。', GOLDEN),
    ('📖 平凡日子', 'NORMAL', 'days≥3, hope 40–59',
     '你只是个守店的。日子波澜不惊，\n但书还在，书店还在，这足够了。', WARM_GRAY),
]
ew = Inches(2.9)
for i, (title, tag, cond, desc, clr) in enumerate(endings):
    x = Inches(0.55) + i * (ew + Inches(0.22))
    rect(slide, x, Inches(1.8), ew, Inches(4.5), RGBColor(0xFF, 0xF5, 0xE8))
    rect(slide, x, Inches(1.8), ew, Inches(0.08), clr)
    txt(slide, x + Inches(0.15), Inches(2.0), Inches(1.2), Inches(0.3), tag, size=10, color=clr, bold=True)
    txt(slide, x + Inches(0.1), Inches(2.4), ew - Inches(0.2), Inches(0.5), title, size=16, color=DEEP, bold=True)
    txt(slide, x + Inches(0.1), Inches(3.0), ew - Inches(0.2), Inches(0.3), '触发条件', size=11, color=GOLDEN, bold=True)
    txt(slide, x + Inches(0.1), Inches(3.35), ew - Inches(0.2), Inches(0.8), cond, size=10, color=WARM_GRAY)
    txt(slide, x + Inches(0.1), Inches(4.3), ew - Inches(0.2), Inches(1.3), desc, size=12, color=DEEP)

# ══ Slide 9 — 技术架构 ══
print("📄 Slide 9 — 技术架构")
slide = prs.slides.add_slide(prs.slide_layouts[6])
rect(slide, Inches(0), Inches(0), Inches(W), Inches(H), PAPER)
section(slide, '技术架构与亮点', '零构建 · 纯前端 · 离线可玩 · AI 深度集成')

mx = ['Engine\n状态机', 'Renderer\n渲染层', 'Game\n控制器', 'AI\nLLM 层', 'Scene\n场景特效', 'Audio\n音乐音效']
for i, name in enumerate(mx):
    x = Inches(0.5) + i * Inches(2.05)
    rect(slide, x, Inches(1.75), Inches(1.85), Inches(0.9), TAN)
    txt(slide, x, Inches(1.8), Inches(1.85), Inches(0.75), name, size=12, color=PAPER, bold=True, align=PP_ALIGN.CENTER)

rect(slide, Inches(0.5), Inches(2.75), Inches(12.333), Inches(0.6), RGBColor(0xFF, 0xF0, 0xD8))
txt(slide, Inches(0.5), Inches(2.78), Inches(12.333), Inches(0.55),
    'Data Layer: GameData (24 本书 + 6 NPC + 对话树 + 结局条件)  |  Engine.state (全局唯一状态)',
    size=13, color=DEEP, align=PP_ALIGN.CENTER)

techs = [
    ('零构建工具', 'HTML/CSS/JS 直引，浏览器即开即玩'),
    ('离线可玩', 'AI 模块全面 fallback，断网也不中断体验'),
    ('状态机驱动', 'Engine → Renderer → Game 三层解耦'),
    ('数据不可变', '对话推进深拷贝 NPC，不修改源数据'),
    ('localStorage 存档', '3 槽存档 + 自动保存'),
    ('动态场景特效', '40 颗 CSS 粒子 + 4 时段渐变切换'),
    ('响应式音频', '4 段 BGM cross-fade + 4 SFX，静音持久化'),
    ('LLM 流式对话', 'MiniMax API + 安全代理 + 打字机效果'),
]
for i, (title, desc) in enumerate(techs):
    col = i % 2
    row = i // 2
    x = Inches(0.55) + col * Inches(6.3)
    y = Inches(3.7) + row * Inches(0.63)
    txt(slide, x, y, Inches(0.35), Inches(0.35), '▸', size=14, color=TAN, bold=True)
    txt(slide, x + Inches(0.35), y, Inches(2.0), Inches(0.35), title, size=13, color=DEEP, bold=True)
    txt(slide, x + Inches(2.35), y, Inches(3.5), Inches(0.35), desc, size=12, color=WARM_GRAY)

txt(slide, Inches(0), Inches(6.8), Inches(W), Inches(0.4),
    '源码 < 100KB（不含资源）| GitHub Pages + Vercel 双部署 | 完全离线可玩',
    size=11, color=GOLDEN, align=PP_ALIGN.CENTER)

# ══ Slide 10 — 总结 ══
print("📄 Slide 10 — 总结")
slide = prs.slides.add_slide(prs.slide_layouts[6])
bg(slide, SCENE_BG)
# 深色遮罩
overlay2 = rect(slide, Inches(0), Inches(0), Inches(W), Inches(H), DARK)

txt(slide, Inches(0), Inches(1.2), Inches(W), Inches(1.0),
    '感谢聆听', size=48, color=PAPER, bold=True, align=PP_ALIGN.CENTER)
txt(slide, Inches(0), Inches(2.3), Inches(W), Inches(0.6),
    '—— 来自《最后的书店》开发团队', size=18, color=TAN, align=PP_ALIGN.CENTER)

line3 = rect(slide, Inches(5), Inches(3.1), Inches(3.333), Pt(2), TAN)

mtxt(slide, Inches(2.5), Inches(3.5), Inches(8.333), Inches(2.5), [
    '🎮 在线体验：https://swording-k.github.io/the-last-bookstore/',
    '📂 源码仓库：https://github.com/swording-k/the-last-bookstore',
    '',
    '🛠 技术栈：HTML5 + CSS3 + JavaScript（零构建）  |  AI 引擎：MiniMax + Matrix AI',
    '🎨 风格定位：电影感暖色调 · 文字叙事冒险 · 治愈系',
], size=14, color=PAPER, line_spacing=1.8, align=PP_ALIGN.CENTER)

txt(slide, Inches(0), Inches(6.3), Inches(W), Inches(0.5),
    '"这家店的价值不在于卖了多少本书，而在于对走进来的每一个人，给出了正确的那一句回答。"',
    size=14, color=GOLDEN, align=PP_ALIGN.CENTER)

# ══ 保存 ══
out = os.path.join(BASE, '最后的书店-作品介绍.pptx')
prs.save(out)
print(f"\n✅ PPT 已生成: {out}")
print(f"   共 {len(prs.slides)} 页")
