/* ============================================================
   最后的书店 - 数据层 v3.0
   25本完整书籍(含ISBN/简介/封面URL) + NPC + 对话树
   ============================================================ */

const GameData = {

  books: [
    { id:'b01', title:'小王子', author:'[法] 圣埃克苏佩里', isbn:'9787020042494',
      category:'literature', categoryName:'文学小说',
      tags:['孤独','纯真','爱','责任','成长'], coverColor:'#FFB347',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787020042494-L.jpg',
      blurb:'飞行员迫降在撒哈拉沙漠遇到了来自B612星球的小王子。小王子离开自己的星球游历宇宙见过国王爱虚荣的人酒鬼商人点灯人和地理学家。他谈起他的玫瑰——那是他星球上独一无一的花他用玻璃罩保护她为她浇水因为她而懂得了"驯养"的含义。\n\n这是一部写给大人的童话用孩子的眼睛看成人世界的荒诞。"真正重要的东西是用眼睛看不见的只有用心才能看清。"',
      bestMatch:['xiaoMing','linYue'],
      recommendReason:'对感到不被理解的孩子或成年人这本书提供了一个温柔的视角每个人都是独一无二的星星。',
      coreMessage:'爱不是占有，而是因为你为某个存在付出时间，它才在宇宙里变得独一无二。',
      bookWorld:{
        sceneTitle:'B612 星球',
        sceneSubtitle:'一颗小小的星球，一朵有刺的玫瑰，一只等待被驯养的狐狸。',
        sceneImage:'assets/theater/b612-generated.png',
        sceneMood:'星球微光',
        spoilerPolicy:'不复述长篇原文，不直接代替阅读，只聊孤独、爱、责任和“看见”的方式。',
        entryNarration:'你翻开书页，星星像细小的灯一样亮起来。小王子站在火山旁，认真地看着你。',
        sceneHotspots:[
          { id:'rose-dome', label:'玫瑰罩', x:22, y:52, prompt:'这朵玫瑰为什么会让小王子舍不得？' },
          { id:'volcano', label:'火山口', x:48, y:76, prompt:'每天清理火山，和照顾关系有什么关系？' },
          { id:'stars', label:'远处星群', x:76, y:28, prompt:'为什么星星会让孤独的人觉得被陪伴？' }
        ],
        globalPromptCards:['什么是真正重要的东西？','怎么读这本写给大人的童话？','这本书为什么会让人想哭？'],
        characters:[
          {
            id:'prince',
            name:'小王子',
            role:'来自 B612 的旅人',
            avatar:'⭐',
            image:'assets/theater/prince-character.png',
            tone:'天真、认真、直接，用孩子的问题刺穿成人世界',
            goal:'让玩家重新理解孤独、爱和责任',
            opening:'你也有一朵需要每天照看的花吗？如果有，你就会明白为什么星星会发光。',
            promptCards:['你为什么离开自己的星球？','你觉得大人最奇怪的地方是什么？','如果我很孤独，该怎么读这本书？'],
            closing:'真正重要的东西，用眼睛是看不见的。但只要你曾经用心看过，星星就永远不会熄灭。',
            storyline:[
              { id:'prince_n1', type:'narration', text:'你以小王子的视角站在 B612 星球上。三座火山在远处冒着轻烟，四十三次日落的余晖正缓缓退去。', next:'prince_d1' },
              { id:'prince_d1', type:'dialogue', speaker:'prince', text:'你也有一朵需要每天照看的花吗？如果有，你就会明白为什么星星会发光。', next:'prince_n2' },
              { id:'prince_n2', type:'narration', text:'他认真地望着你，眼神里没有大人的计算，只有一种纯粹的疑问。', next:'prince_d2' },
              { id:'prince_d2', type:'dialogue', speaker:'prince', text:'我离开自己的星球，是因为那朵玫瑰。她骄傲，她说自己是全宇宙唯一的花。可我知道她怕风，怕毛毛虫，怕被人看见她在颤抖。', next:'prince_n3' },
              { id:'prince_n3', type:'narration', text:'星球上的某个角落，有些东西正在等待被注意。', next:'prince_e1' },
              { id:'prince_e1', type:'explore', text:'B612 星球上有些东西引起了你的注意。点击场景中的线索，和小王子一起探索。', next:'prince_d3' },
              { id:'prince_d3', type:'dialogue', speaker:'prince', text:'大人总说数字才重要。可我问你——你的那朵花，值多少？这个问题本身就是错的，对不对？', next:'prince_d4' },
              { id:'prince_d4', type:'dialogue', speaker:'prince', text:'现在，你可以问我任何问题了。关于星球、关于玫瑰、关于为什么大人总是那么奇怪。', next:'prince_chat' },
              { id:'prince_chat', type:'chat', text:'小王子正在等待你的问题...', next:'prince_end' },
              { id:'prince_end', type:'narration', text:'星星像细小的灯一样亮起来。小王子坐在火山旁，安静地望着远方。你知道他会继续旅行，但这一刻，他属于这个星球。', next:null }
            ]
          },
          {
            id:'fox',
            name:'狐狸',
            role:'等待被驯养的朋友',
            avatar:'🦊',
            image:'assets/theater/fox-character.png',
            tone:'温柔、聪明、像低声提醒朋友',
            goal:'解释关系、陪伴和时间的意义',
            opening:'如果你每天四点来，那么从三点起，我就开始感到幸福。',
            promptCards:['什么叫驯养？','为什么花时间会让一个人变特别？','我该怎样珍惜一段关系？'],
            closing:'真正重要的东西常常很安静。它不会喊你，只会在你每天准时到来时，悄悄变得不可替代。',
            storyline:[
              { id:'fox_n1', type:'narration', text:'你以狐狸的视角坐在麦田边。金黄色的麦浪在风中起伏，远处有脚步声。', next:'fox_d1' },
              { id:'fox_d1', type:'dialogue', speaker:'fox', text:'如果你每天四点来，那么从三点起，我就开始感到幸福。', next:'fox_n2' },
              { id:'fox_n2', type:'narration', text:'狐狸的声音很轻，像风吹过麦穗。它在等一个愿意花时间的人。', next:'fox_d2' },
              { id:'fox_d2', type:'dialogue', speaker:'fox', text:'驯养就是建立关系。你为一个人花掉的时间，会让他从人群里慢慢亮起来。', next:'fox_n3' },
              { id:'fox_n3', type:'narration', text:'麦田里有几个地方藏着秘密，狐狸的目光正看向它们。', next:'fox_e1' },
              { id:'fox_e1', type:'explore', text:'麦田边有些东西吸引了狐狸的注意。点击线索，和它一起发现。', next:'fox_d3' },
              { id:'fox_d3', type:'dialogue', speaker:'fox', text:'你看这些麦子——它们以前只是普通的麦子。但因为你的头发是金色的，风吹麦浪时，我就会想起你。', next:'fox_d4' },
              { id:'fox_d4', type:'dialogue', speaker:'fox', text:'现在，你可以问我任何关于驯养、时间和等待的问题。', next:'fox_chat' },
              { id:'fox_chat', type:'chat', text:'狐狸正在安静地等待你的问题...', next:'fox_end' },
              { id:'fox_end', type:'narration', text:'夕阳把麦田染成金色。狐狸闭上眼睛，嘴角有一丝微笑。它知道，从这一刻起，风吹麦浪都有了意义。', next:null }
            ]
          },
          {
            id:'rose',
            name:'玫瑰',
            role:'骄傲又脆弱的花',
            avatar:'🌹',
            image:'assets/theater/rose-character.png',
            tone:'骄傲、敏感、带一点任性，但内心柔软',
            goal:'呈现爱里的脆弱、表达和误解',
            opening:'我当然有刺。可刺有时只是为了让自己看起来不那么害怕。',
            promptCards:['你为什么总是说反话？','爱一个人为什么会害怕？','小王子真的懂你吗？'],
            closing:'爱不是占有，而是在她任性、敏感、带刺的时候，仍然愿意替她罩上玻璃罩。',
            storyline:[
              { id:'rose_n1', type:'narration', text:'你以玫瑰的视角站在玻璃罩下。风从星球表面掠过，你挺直了茎秆，努力让自己看起来更骄傲一些。', next:'rose_d1' },
              { id:'rose_d1', type:'dialogue', speaker:'rose', text:'我当然有刺。可刺有时只是为了让自己看起来不那么害怕。', next:'rose_n2' },
              { id:'rose_n2', type:'narration', text:'她的花瓣微微颤抖，不是因为风，是因为孤独。', next:'rose_d2' },
              { id:'rose_d2', type:'dialogue', speaker:'rose', text:'他说我是全宇宙唯一的花。我知道这不是真的，但当他给我浇水的时候，我愿意假装相信。', next:'rose_n3' },
              { id:'rose_n3', type:'narration', text:'玻璃罩外有些东西在移动，玫瑰的目光不自觉地追了过去。', next:'rose_e1' },
              { id:'rose_e1', type:'explore', text:'玫瑰注意到星球上有些不寻常的东西。点击线索，了解她的世界。', next:'rose_d3' },
              { id:'rose_d3', type:'dialogue', speaker:'rose', text:'骄傲有时候只是另一种害怕。我有刺，可我还是希望有人看见我在风里发抖。', next:'rose_d4' },
              { id:'rose_d4', type:'dialogue', speaker:'rose', text:'现在，你可以问我任何问题了。关于爱、关于害怕、关于为什么我总是说反话。', next:'rose_chat' },
              { id:'rose_chat', type:'chat', text:'玫瑰在玻璃罩下等待你的问题...', next:'rose_end' },
              { id:'rose_end', type:'narration', text:'风停了。玫瑰低下头，露珠从花瓣上滑落。她知道明天太阳升起时，她还是会骄傲地昂起头——但今晚，有人听懂了她。', next:null }
            ]
          }
        ]
      } },
    { id:'b02', title:'挪威的森林', author:'[日] 村上春树', isbn:'9787532744897',
      category:'literature', categoryName:'文学小说',
      tags:['迷茫','青春','丧失','孤独'], coverColor:'#2E6B8A',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787532744897-L.jpg',
      blurb:'1960年代末日本大学生渡边彻沉浸在两个女人之间——直子（死去好友的女友安静脆弱住进疗养院）和绿子（充满生命力的同班女孩）。村上春树用冷静克制的笔触描写青春期的迷茫和丧失感。"死并非生的对立面而作为生的一部分永存。"这不是爱情故事而是关于如何在失去之后继续活下去。',
      bestMatch:['fangMiss','xiaoMing'],
      recommendReason:'处于人生十字路口者的共鸣——迷茫是正常重要的是走下去。' },
    { id:'b03', title:'月亮与六便士', author:'[英] 毛姆', isbn:'9787511374399',
      category:'literature', categoryName:'文学小说',
      tags:['理想与现实','艺术','自由'], coverColor:'#C9A227',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787511374399-L.jpg',
      blurb:'证券经纪人斯特里克兰德40岁时抛弃家庭去巴黎学画。"我必须画画就像溺水的人必须挣扎。"原型是法国画家高更。月亮代表崇高理想六便士代表世俗现实。',
      bestMatch:['chenBo','fangMiss'],
      recommendReason:'面临传承vs变迁或理想vs现实者思考取舍的极端案例。' },
    { id:'b04', title:'百年孤独', author:'[哥] 马尔克斯', isbn:'9787544253994',
      category:'literature', categoryName:'文学小说',
      tags:['家族','命运','时间','记忆'], coverColor:'#8B4513',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787544253994-L.jpg',
      blurb:'魔幻现实主义巅峰之作。布恩迪亚家族七代人的故事从马孔多镇的建立到毁灭。冰块飞毯黄蝴蝶下了四年的雨——奇幻元素与拉丁美洲历史现实无缝交织。',
      bestMatch:['chenBo','traveler'],
      recommendReason:'为思考传承和时间的人提供宏大视角。' },
    { id:'b05', title:'活出生命的意义', author:'[奥] 弗兰克尔', isbn:'9787515811483',
      category:'philosophy', categoryName:'哲学思辨',
      tags:['绝境','意义','韧性','希望'], coverColor:'#5D4E8A',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787515811483-L.jpg',
      blurb:'犹太裔精神病学家弗兰克尔全家被关进奥斯维辛集中营只有他和妹妹幸存。发现存活下来的人不一定最强壮而是找到了生存"意义"的人。战后创立"意义疗法"。人类拥有最后的自由——在任何环境中选择自己态度的自由。',
      bestMatch:['linYue','liDoctor','fangMiss'],
      recommendReason:'处于困境中的人最能获得力量——痛苦本身也可以有意义。' },
    { id:'b06', title:'悉达多', author:'[德] 黑塞', isbn:'9787532743812',
      category:'philosophy', categoryName:'哲学思辨',
      tags:['寻道','觉醒','智慧'], coverColor:'#228B22',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787532743812-L.jpg',
      blurb:'古印度婆罗门之子悉达多离家寻道做过苦行僧向佛陀求教后离开沉沦于情欲财富最终在河边当摆渡人从流水中领悟一切。"知识可以传达智慧不能。"',
      bestMatch:['liDoctor','fangMiss','traveler'],
      recommendReason:'职业倦怠或人生迷途者——答案不在外面而在自身体验中。' },
    { id:'b07', title:'苏菲的世界', author:'[挪] 贾德', isbn:'9787506397544',
      category:'philosophy', categoryName:'哲学思辨',
      tags:['哲学史启蒙','好奇心'], coverColor:'#4169E1',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787506397544-L.jpg',
      blurb:'14岁少女苏菲收到神秘信件："你是谁？"哲学导师艾伯特从苏格拉底讲到存在主义发现她和艾伯特只是书中的人物。全球三千万人通过此书第一次接触哲学思考。',
      bestMatch:['xiaoMing'],
      recommendReason:'好奇心强的青少年最好的哲学启蒙书。' },
    { id:'b08', title:'瓦尔登湖', author:'[美] 梭罗', isbn:'9787511336845',
      category:'philosophy', categoryName:'哲学思辨',
      tags:['简朴生活','自然','独立'], coverColor:'#4682B4',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787511336845-L.jpg',
      blurb:'1845年28岁的梭罗带斧头走进瓦尔登湖边的森林建小屋独居两年两个月。"我去森林是因为我希望有意识地生活只面对生活中最基本的事实。"文字像湖水一样清澈。',
      bestMatch:['fangMiss','chenBo'],
      recommendReason:'逃离还是回归纠结者的第三种答案——按自己的方式生活。' },
    { id:'b09', title:'当呼吸化为空气', author:'[美] 卡拉尼什', isbn:'9787208139567',
      category:'psychology', categoryName:'心理成长',
      tags:['生死','医生','勇气'], coverColor:'#708090',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787208139567-L.jpg',
      blurb:'36岁神经外科医生保罗即将完成七年培训时确诊第四期肺癌以医生和病人双重视角审视死亡诚实面对死亡的记录不是励志鸡汤。',
      bestMatch:['liDoctor'],
      recommendReason:'职业倦怠医生的最深层共鸣。' },
    { id:'b10', title:'给青年的十二封信', author:'朱光潜', isbn:'9787510825618',
      category:'psychology', categoryName:'心理成长',
      tags:['青年指导','修养','处世'], coverColor:'#CD853F',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787510825618-L.jpg',
      blurb:'朱光潜旅欧期间写给国内青年的十二封信写于1920年代近百年前智慧和温暖丝毫不减不像说教更像温厚长辈在灯下聊天。',
      bestMatch:['linYue','xiaoMing'],
      recommendReason:'最温柔的手——不催不逼只是陪着。' },
    { id:'b11', title:'自卑与超越', author:'[奥] 阿德勒', isbn:'9787511384971',
      category:'psychology', categoryName:'心理成长',
      tags:['自卑','人格','童年'], coverColor:'#DC143C',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787511384971-L.jpg',
      blurb:'与弗洛伊德荣格齐名的心理学奠基人认为自卑感是人类进步原动力过度发展则成自卑情结人的价值在于对社会和他人的贡献。',
      bestMatch:['xiaoMing','linYue','fangMiss'],
      recommendReason:'自我价值感低者看到行为根源。' },
    { id:'b12', title:'被讨厌的勇气', author:'[日] 岸见一郎', isbn:'9787111497146',
      category:'psychology', categoryName:'心理成长',
      tags:['阿德勒心理学','自由','人际'], coverColor:'#FF4500',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787111497146-L.jpg',
      blurb:'青年与哲学家对话体一切烦恼来自人际关系自由就是被人讨厌课题分离全球千万册销量。',
      bestMatch:['xiaoMing','fangMiss'],
      recommendReason:'在意他人评价者的观念革命。' },
    { id:'b13', title:'匠人', author:'[英] 桑内特', isbn:'9787508624746',
      category:'humanities', categoryName:'人文社科',
      tags:['手艺','工匠精神'], coverColor:'#8B4513',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787508624746-L.jpg',
      blurb:'追溯匠人概念从古至今演变任何人专注于把事情做好都可称匠人所需素质动手能力耐心从失败中学习。',
      bestMatch:['chenBo'],
      recommendReason:'为面临手艺失传的老人赋予工匠精神新意义。' },
    { id:'b14', title:'乡土中国', author:'费孝通', isbn:'9787108025486',
      category:'humanities', categoryName:'人文社科',
      tags:['中国农村','社会结构'], coverColor:'#556B2F',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787108025486-L.jpg',
      blurb:'1940年代经典社会学著作差序格局礼治秩序长老统治许多现象七十年后依然存在文字清晰有力。',
      bestMatch:['chenBo','fangMiss'],
      recommendReason:'帮助扎根小镇者理解脚下土地和人际网络。' },
    { id:'b15', title:'人类简史', author:'[以色列] 赫拉利', isbn:'9787508647357',
      category:'humanities', categoryName:'人文社科',
      tags:['人类历史','认知革命'], coverColor:'#2F4F4F',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787508647357-L.jpg',
      blurb:'智人如何登上食物链顶端认知革命学会谈论不存在的事物从而大规模协作改变你看世界的方式。',
      bestMatch:['traveler','xiaoMing','fangMiss'],
      recommendReason:'打开全新时空视野。' },
    { id:'b16', title:'乌合之众', author:'[法] 勒庞', isbn:'9787511350416',
      category:'humanities', categoryName:'人文社科',
      tags:['群体心理','盲从'], coverColor:'#4A4A4A',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787511350416-L.jpg',
      blurb:'1895年群体行为基础文本个人融入群体后丧失理性互联网时代格外应验。',
      bestMatch:['xiaoMing','traveler'],
      recommendReason:'教会独立思考者不随波逐流。' },
    { id:'b17', title:'三体', author:'刘慈欣', isbn:'9787536692930',
      category:'science', categoryName:'科学探索',
      tags:['科幻','黑暗森林'], coverColor:'#0D1117',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787536692930-L.jpg',
      blurb:'文革中叶文洁向宇宙发地球坐标三体文明发现地球舰队450年后到达硬核物理学想象力黑暗森林法则中国科幻里程碑2015雨果奖。',
      bestMatch:['xiaoMing','traveler'],
      recommendReason:'想象力丰富少年的超越日常宏大舞台。' },
    { id:'b18', title:'时间简史', author:'[英] 霍金', isbn:'9787535732309',
      category:'science', categoryName:'科学探索',
      tags:['时间','宇宙','黑洞'], coverColor:'#191970',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787535732309-L.jpg',
      blurb:'用通俗语言讲宇宙最根本问题从牛顿力学到广义相对论全球2500万册畅销书。',
      bestMatch:['xiaoMing','chenBo'],
      recommendReason:'满足对终极问题的好奇。' },
    { id:'b19', title:'自私的基因', author:'[英] 道金斯', isbn:'9787535764984',
      category:'science', categoryName:'科学探索',
      tags:['进化论','基因','模因'], coverColor:'#006400',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787535764984-L.jpg',
      blurb:'进化基本单位不是物种也不是个体而是基因发明模因描述文化传播改变看待自身的方式。',
      bestMatch:['traveler','xiaoMing'],
      recommendReason:'全新底层代码视角看生命和社会。' },
    { id:'b20', title:'万物简史', author:'[美] 比尔·布莱森', isbn:'9787563376317',
      category:'science', categoryName:'科学探索',
      tags:['科普','幽默'], coverColor:'#DEB887',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787563376317-L.jpg',
      blurb:'极度好奇普通人花三年写成几乎涵盖所有科学的简史英式幽默让复杂科学有趣易懂。',
      bestMatch:['xiaoMing','linYue'],
      recommendReason:'任何年龄段最好的科普入门。' },
    { id:'b21', title:'艺术的故事', author:'[英] 贡布里希', isbn:'9787544744439',
      category:'art', categoryName:'艺术美学',
      tags:['艺术史','审美'], coverColor:'#8B0000',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787544744439-L.jpg',
      blurb:'全球最受欢迎艺术入门书销量超800万册从史前洞穴壁画到现代艺术语言平易近人不需要预备知识。',
      bestMatch:['fangMiss','xiaoMing'],
      recommendReason:'想要培养审美者最好的向导。' },
    { id:'b22', title:'美的历程', author:'李泽厚', isbn:'9787539632988',
      category:'art', categoryName:'艺术美学',
      tags:['中国美学','传统文化'], coverColor:'#800020',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787539632988-L.jpg',
      blurb:'从远古图腾到明清文艺梳理中国美学精神演变脉络文字优美如散文阅读本身就是审美体验。',
      bestMatch:['chenBo','fangMiss'],
      recommendReason:'根植传统文化者看到美学层面的文化自信。' },
    { id:'b23', title:'设计中的设计', author:'[日] 原研哉', isbn:'9787508680439',
      category:'art', categoryName:'艺术美学',
      tags:['设计','简约'], coverColor:'#F5F5DC',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787508680439-L.jpg',
      blurb:'日本设计大师的设计哲学设计不是制造美观的东西而是发现生活的本质无印良品艺术总监。',
      bestMatch:['fangMiss','xiaoMing'],
      recommendReason:'好的生活不在于物质丰富在于用心设计。' },
    { id:'b24', title:'音乐的故事', author:'[英] 约翰·埃利斯', isbn:'9787544766520',
      category:'art', categoryName:'艺术美学',
      tags:['音乐史','古典音乐'], coverColor:'#4B0082',
      coverUrl:'https://covers.openlibrary.org/b/isbn/9787544766520-L.jpg',
      blurb:'从古希腊音乐理论到披头士摇滚革命每位作曲家故事与其时代背景紧密相连不需要懂乐谱也能感受音乐的力量。',
      bestMatch:['chenBo','traveler'],
      recommendReason:'展示另一种工匠精神——音乐同样需要毕生打磨。' },
    { id:'b25', title:'福尔摩斯探案集', author:'[英] 柯南·道尔', isbn:'9787020000000',
      category:'detective', categoryName:'侦探推理',
      tags:['推理','观察','证据','逻辑','案件'], coverColor:'#2F3136',
      coverUrl:'',
      blurb:'伦敦贝克街 221B，侦探夏洛克·福尔摩斯与医生华生一起调查离奇案件。故事的魅力不只在谜底，而在观察细节、建立假设、排除错误路径的过程。读者会跟随福尔摩斯学习如何从一枚泥点、一顶帽子、一段沉默中看到事实。',
      bestMatch:['xiaoMing','traveler'],
      recommendReason:'适合想训练观察力、逻辑感和独立判断的人。',
      coreMessage:'真正的推理不是猜谜，而是尊重证据、观察细节、排除看似诱人的错误答案。',
      bookWorld:{
        sceneTitle:'圣巴塞洛缪医院实验室',
        sceneSubtitle:'窗外伦敦雾气翻涌，试管里有微光，一桩案子正从化学反应中显影。',
        sceneImage:'assets/theater/holmes-lab-generated.png',
        sceneMood:'伦敦案发现场',
        spoilerPolicy:'不直接揭示原作谜底，只讨论观察方法、人物动机和阅读线索。',
        entryNarration:'你翻开书页，纸面上的伦敦雾气慢慢涌出。实验台前，福尔摩斯举起试管，像在等待一个能证明真相的颜色。',
        sceneHotspots:[
          { id:'window', label:'雾窗', x:18, y:24, prompt:'窗边的光和雾能告诉侦探什么？' },
          { id:'reagent', label:'试管', x:54, y:38, prompt:'这支试管里的颜色变化可能是什么线索？' },
          { id:'case-file', label:'案卷', x:34, y:78, prompt:'如果案卷只留下三条线索，你会先看哪一条？' },
          { id:'shelf', label:'药剂架', x:78, y:56, prompt:'为什么福尔摩斯会把科学实验带进破案？' }
        ],
        globalPromptCards:['给我一个不剧透的案件开场','训练我像侦探一样观察','这本书为什么到今天还好看？'],
        characters:[
          {
            id:'holmes',
            name:'夏洛克·福尔摩斯',
            role:'咨询侦探',
            avatar:'🕵',
            image:'assets/theater/holmes-character.png',
            tone:'冷静、敏锐、略带锋芒，喜欢从细节推理',
            goal:'引导玩家理解观察与证据的重要性',
            opening:'你进门时鞋底有一点湿泥。伦敦今晚下过雨，还是你刚从河边来？',
            promptCards:['你从我身上观察到了什么？','一个好侦探和普通人最大的区别是什么？','如果我想读这本书，应该注意哪些线索？'],
            closing:'思维不是天赋，是习惯。记住今天看到的，忘记今天猜的。',
            storyline:[
              { id:'holmes_n1', type:'narration', text:'你以福尔摩斯的视角走进实验室。窗外的伦敦雾气翻涌，试管里有微光。一桩案子正从化学反应中显影。', next:'holmes_d1' },
              { id:'holmes_d1', type:'dialogue', speaker:'holmes', text:'你来得正好。看看这支试管——颜色变化说明什么？', next:'holmes_n2' },
              { id:'holmes_n2', type:'narration', text:'福尔摩斯没有抬头，但他的余光已经把你从头到脚扫描了一遍。', next:'holmes_d2' },
              { id:'holmes_d2', type:'dialogue', speaker:'holmes', text:'你进门时鞋底有一点湿泥。伦敦今晚下过雨，还是你刚从河边来？别急着回答——先观察，再下结论。', next:'holmes_n3' },
              { id:'holmes_n3', type:'narration', text:'实验室的角落藏着一些线索，福尔摩斯的手指正无意识地敲打着桌面。', next:'holmes_e1' },
              { id:'holmes_e1', type:'explore', text:'实验室里有些东西引起了你的注意。点击场景中的线索，用侦探的眼光观察。', next:'holmes_d3' },
              { id:'holmes_d3', type:'dialogue', speaker:'holmes', text:'很好。普通人和侦探的区别不在聪明，而在是否愿意让证据先说话。', next:'holmes_d4' },
              { id:'holmes_d4', type:'dialogue', speaker:'holmes', text:'现在，你可以问我任何问题了。别急着要答案——先告诉我，你观察到了什么？', next:'holmes_chat' },
              { id:'holmes_chat', type:'chat', text:'福尔摩斯正在等待你的推理...', next:'holmes_end' },
              { id:'holmes_end', type:'narration', text:'试管里的颜色渐渐稳定。福尔摩斯把记录本合上，看向窗外的雾气。今天的推理到此为止。', next:null }
            ]
          },
          {
            id:'watson',
            name:'华生医生',
            role:'记录者',
            avatar:'📓',
            image:'assets/theater/watson-character.png',
            tone:'温和、可靠、带一点惊叹，像朋友一样解释福尔摩斯',
            goal:'帮助玩家降低阅读门槛，理解故事情绪',
            opening:'别被他的语气吓到。福尔摩斯只是习惯先看见别人忽略的东西。',
            promptCards:['你为什么愿意跟随福尔摩斯？','这本书最适合什么样的读者？','推理故事除了谜底，还有什么值得读？'],
            closing:'再混乱的现实里也有线索。我的工作，是记录那束光，让别人也能看见。',
            storyline:[
              { id:'watson_n1', type:'narration', text:'你以华生的视角坐在壁炉旁。火光在墙上跳动，福尔摩斯在对面拉小提琴，调子有些忧伤。', next:'watson_d1' },
              { id:'watson_d1', type:'dialogue', speaker:'watson', text:'别被他的语气吓到。福尔摩斯只是习惯先看见别人忽略的东西。', next:'watson_n2' },
              { id:'watson_n2', type:'narration', text:'华生放下手中的报纸，目光温和而坚定。他跟随福尔摩斯，不是因为崇拜，而是因为相信。', next:'watson_d2' },
              { id:'watson_d2', type:'dialogue', speaker:'watson', text:'它适合那些愿意慢一点的人。你不必马上破案，只要跟着福尔摩斯学会重新看见世界。', next:'watson_n3' },
              { id:'watson_n3', type:'narration', text:'壁炉旁边的架子上放着一些旧物，华生的目光不时落在它们上面。', next:'watson_e1' },
              { id:'watson_e1', type:'explore', text:'房间里有些东西引起了华生的回忆。点击线索，听他讲述。', next:'watson_d3' },
              { id:'watson_d3', type:'dialogue', speaker:'watson', text:'推理故事的好处，不只是谜底。它让你在不安里保持耐心，在复杂里练习清醒。', next:'watson_d4' },
              { id:'watson_d4', type:'dialogue', speaker:'watson', text:'现在，你可以问我任何问题。关于福尔摩斯、关于这本书、关于为什么一个医生会选择记录案件。', next:'watson_chat' },
              { id:'watson_chat', type:'chat', text:'华生温和地等待你的问题...', next:'watson_end' },
              { id:'watson_end', type:'narration', text:'小提琴声停了。华生拿起记录本，开始写下今天的故事。他知道，有人需要看到这些。', next:null }
            ]
          },
          {
            id:'lestrade',
            name:'雷斯垂德探长',
            role:'苏格兰场探长',
            avatar:'🚓',
            image:'assets/theater/lestrade-character.png',
            tone:'务实、急切、重视证据但常被表象困住',
            goal:'制造案件张力，推动玩家提问',
            opening:'我们需要的是能站得住脚的证据，不是烟斗旁边的漂亮猜想。',
            promptCards:['你现在掌握了哪些证据？','为什么警方会误判？','我该怎么避免被表象骗住？'],
            closing:'证据必须能被反复检查，不能只让人觉得合理。记住这一点，你就不会走偏。',
            storyline:[
              { id:'lestrade_n1', type:'narration', text:'你以雷斯垂德的视角站在苏格兰场的走廊里。文件在手中卷成筒，脚步急促。一个案子正等着被解决。', next:'lestrade_d1' },
              { id:'lestrade_d1', type:'dialogue', speaker:'lestrade', text:'我们需要的是能站得住脚的证据，不是烟斗旁边的漂亮猜想。', next:'lestrade_n2' },
              { id:'lestrade_n2', type:'narration', text:'他的眉头紧锁，手指无意识地把文件卷得更紧了。时间在流逝，压力在增加。', next:'lestrade_d2' },
              { id:'lestrade_d2', type:'dialogue', speaker:'lestrade', text:'警方常犯的错误，是先相信最响亮的解释。证据必须能被反复检查，不能只让人觉得合理。', next:'lestrade_n3' },
              { id:'lestrade_n3', type:'narration', text:'走廊尽头的布告板上贴着几张照片，雷斯垂德的目光在它们之间来回扫视。', next:'lestrade_e1' },
              { id:'lestrade_e1', type:'explore', text:'走廊里有些线索可能改变整个案件。点击线索，和雷斯垂德一起分析。', next:'lestrade_d3' },
              { id:'lestrade_d3', type:'dialogue', speaker:'lestrade', text:'我不喜欢漂亮猜想。给我时间、地点、证人和物证，然后我们再来谈谁最可疑。', next:'lestrade_d4' },
              { id:'lestrade_d4', type:'dialogue', speaker:'lestrade', text:'现在，你可以问我任何问题。关于证据、关于误判、关于怎么避免被表象骗住。', next:'lestrade_chat' },
              { id:'lestrade_chat', type:'chat', text:'雷斯垂德探长正在等待你的问题...', next:'lestrade_end' },
              { id:'lestrade_end', type:'narration', text:'雷斯垂德把文件揣进口袋，转身走向会议室。他的背影疲惫但坚定——明天还有新的案子，而他会继续寻找站得住脚的证据。', next:null }
            ]
          }
        ]
      } }
  ],

  // ========================
  //  NPC 对话数据
  //  ========================
  npcs: {
    linYue: {
      id:'linYue', name:'林月', tag:'年轻母亲',
      colors:{ hair:'#4A3728', skin:'#F5DEB3', clothes:'#7B68EE', accent:'#DDA0DD' },
      dialogue:[
        { text:'门上的铃铛响了一声。一个穿着素色衣服的女人推开了门犹豫了一下才走进来。', isNarrator:true, nextDelay:500 },
        { text:'她看起来很疲惫眼圈有些发黑。怀里没有抱着孩子但她的手一直在搓着衣角。', isNarrator:true, nextDelay:400 },
        { text:'"请问……这里可以随便看看吗？"', speaker:'linYue', nextDelay:300,
          options:[
            { text:'"当然请进。想找什么类型的书？"', effect:{hopeChange:1,repChange:0}, response:'她松了口气小声说："其实我也不太清楚……"' },
            { text:'"你看起来好像有心事要不要喝杯水？"', effect:{hopeChange:2,repChange:1}, response:'她愣了一下眼眶突然红了："您怎么知道……"' },
            { text:'"打烊前随便看吧。"', effect:{hopeChange:-1,repChange:-1}, response:'她点了点头沉默地走向书架背影有些佝偻。' }
          ]
        },
        { text:'她在文学区停了下来手指划过一排书脊却什么都没拿起来。', isNarrator:true, nextDelay:400,
          options:[
            { text:'"那边的心理成长类书籍也许适合你。"', effect:{hopeChange:1,repChange:0}, response:'"心理……"她苦笑了"可能我真的需要吧。"' },
            { text:'"你愿意说说发生了什么吗？"', effect:{hopeChange:3,repChange:1}, response:'她沉默了很久然后开始说话声音很轻像是在自言自语。' },
            { text:'(静静地等待她)', effect:{hopeChange:2,repChange:1}, response:'她似乎被这种沉默安慰过了一会儿主动开口："我女儿……"' }
          ]
        },
        { text:'"小芸发烧三天了。镇上的李医生说需要去县医院检查……但我……"她的声音越来越小。', speaker:'linYue', nextDelay:300,
          options:[
            { text:'"钱的问题总会有办法的。"', effect:{hopeChange:2,repChange:1}, response:'她抬起头看着您："您真的这么觉得吗？"' },
            { text:'"你已经做得够好了。"', effect:{hopeChange:4,repChange:2}, response:'这句话像一根针扎进了她心里她捂住了嘴肩膀开始颤抖。' },
            { text:'"县医院很远需要帮忙吗？"', effect:{hopeChange:3,repChange:2}, response:'她摇头："不用……我只是不知道该怎么办。"' }
          ]
        },
        { text:'"我丈夫在外地工作已经三个月没寄钱回来了我不敢告诉他小芸的事怕他担心也怕……"她没说完。', speaker:'linYue', nextDelay:300,
          options:[
            { text:'"独自扛着一切一定很辛苦。"', effect:{hopeChange:4,repChange:2}, response:'她的眼泪终于掉了下来："没有人问过我辛不辛苦。"' },
            { text:'"也许一本书能给你一些力量。"', effect:{hopeChange:2,repChange:1}, response:'她擦了擦眼睛："书……能有什么用呢？"然后又自嘲地笑了笑"不过试试也好。"' },
            { text:'"你比你想象的要坚强得多。"', effect:{hopeChange:3,repChange:2}, response:'她深深吸了一口气："谢谢您我会试着相信这一点。"' }
          ],
          nextDelay: 300
        },
        { text:'她平静了一些看着你："你说什么样的书……能让人在撑不住的时候继续撑下去呢？"', speaker:'linYue', nextDelay:200,
          action:'recommend' }
      ],
      returnDialogue: [
        { text:'门上的铃铛又响了。林月走了进来——这次她的步伐比上次轻快了些，手里还牵着一个扎羊角辫的小女孩。', isNarrator:true, nextDelay:500 },
        { text:'"小芸，跟叔叔/阿姨打招呼。"小女孩怯生生地躲在妈妈身后，只露出半张脸。', speaker:'linYue', nextDelay:400,
          options:[
            { text:'"小芸看起来好多了！"', effect:{hopeChange:3,repChange:2}, response:'"是啊，去县医院检查了，没什么大事。"她笑了——这是我第一次看到她笑。' },
            { text:'"欢迎回来，上次那本书看了吗？"', effect:{hopeChange:2,repChange:1}, response:'"看了。每天晚上给小芸念一段，她听着听着就睡着了。"' },
            { text:'"今天想要什么类型的书？"', effect:{hopeChange:1,repChange:1}, response:'"其实……是想给小芸挑一本。她现在愿意听故事了。"' }
          ]
        },
        { text:'"你知道吗，"她坐下来，把女儿抱到膝盖上，"上次从你这里回去以后，我给丈夫打了电话。我说了实话——说小芸生病了，说我一个人撑不住了。"', speaker:'linYue', nextDelay:400,
          options:[
            { text:'"然后呢？"', effect:{hopeChange:2,repChange:1}, response:'"然后他就哭了。说对不起，说他下周就回来。"她擦了擦眼角，这次不是因为难过。' },
            { text:'"这需要很大的勇气。"', effect:{hopeChange:4,repChange:2}, response:'"是你说的——独自扛着一切很辛苦。所以我决定不再一个人扛了。"' },
            { text:'"丈夫回来就太好了。"', effect:{hopeChange:3,repChange:1}, response:'"是啊……其实他也一直在担心我们，只是我没给他说实话的机会。"' }
          ]
        },
        { text:'"所以今天，"她把小芸轻轻推到前面，"想给她挑一本。让她知道世界上有很多种可能——不只是柴米油盐和发烧。"', speaker:'linYue', nextDelay:300,
          options:[
            { text:'"给孩子选书是最幸福的事。"', effect:{hopeChange:3,repChange:2}, response:'"是啊。上次来的时候我觉得天要塌了，今天——我觉得天很蓝。"' },
            { text:'"让孩子爱上阅读，是给她的最好的礼物。"', effect:{hopeChange:3,repChange:1}, response:'她用力地点了点头："我也是这么想的。"' }
          ]
        },
        { text:'小芸突然指着书架方向："妈妈，那本书有星星！"林月顺着她的手指看过去，然后转过头来看着你："老板，给这个小家伙推荐一本吧——让她知道这个世界有多大。"', speaker:'linYue', nextDelay:200,
          action:'recommend' }
      ]
    },

    chenBo: {
      id:'chenBo', name:'陈伯', tag:'钟表匠',
      colors:{ hair:'#C0C0C0', skin:'#DDB89A', clothes:'#8B4513', accent:'#DAA520' },
      dialogue:[
        { text:'门被推开的时候发出吱呀一声一个老人走了进来步子很慢。', isNarrator:true, nextDelay:400 },
        { text:'他的手上满是老茧指甲缝里嵌着洗不掉的机油痕迹——那是修了一辈子表的手。', isNarrator:true, nextDelay:300 },
        { text:'"老板……是你祖父把这店交给你的吧？"', speaker:'chenBo', nextDelay:300,
          options:[
            { text:'"是的您认识我祖父？"', effect:{hopeChange:1,repChange:1}, response:'"认识他修过我的第一块表那时候我才十岁。"' },
            { text:'"您是陈师傅吧听爷爷提过您。"', effect:{hopeChange:2,repChange:2}, response:'老人的眼睛亮了一下："哦老墨还提起过我？"' },
            { text:'"想买点什么？"', effect:{hopeChange:0,repChange:0}, response:'"不买就是路过看看。"' }
          ]
        },
        { text:'他在店里慢慢地转了一圈手指拂过书架像是在抚摸老朋友。', isNarrator:true, nextDelay:400,
          options:[
            { text:'"您的钟表铺还在开着吗？"', effect:{hopeChange:1,repChange:1}, response:'"开着没什么人来修就是了现在的表都是电子的坏了就换新的。"' },
            { text:'"您看起来不太开心。"', effect:{hopeChange:2,repChange:1}, response:'他顿了一下："不开心老头子哪那么多不开心就是……"' },
            { text:'"您孙子最近怎么样？"', effect:{hopeChange:2,repChange:2}, response:'提到孙子他的表情复杂了："那小子啊……"' }
          ]
        },
        { text:'"他说他想学编程。"陈伯的声音很平但你能听到里面的重量。"不想学修表了说这个没用。"', speaker:'chenBo', nextDelay:300,
          options:[
            { text:'"时代变了孩子有孩子的选择。"', effect:{hopeChange:1,repChange:1}, response:'"我知道我就是……觉得空落落的。"' },
            { text:'"但您教他的东西不会白费。"', effect:{hopeChange:3,repChange:2}, response:'他看了你很久："你说的是真的吗？"' },
            { text:'"编程也是一种手艺。"', effect:{hopeChange:4,repChange:2}, response:'陈伯愣住了他从没想过这个问题。"手艺……吗？"' }
          ]
        },
        { text:'"我修了四十五年的表镇上每一块表都经过我的手现在我连自己孙子的手都不想握我的工具。"', speaker:'chenBo', nextDelay:300,
          options:[
            { text:'"价值不只是手艺的传承您的一生本身就有价值。"', effect:{hopeChange:5,repChange:2}, response:'老人的眼角湿了他没有说话只是用力地点了点头。' },
            { text:'"也许您可以试着了解他在做什么。"', effect:{hopeChange:3,repChange:1}, response:'"了解……嗯也许你说的对我确实从来没问过他编程是什么。"' },
            { text:'"四十五年不是白费的。"', effect:{hopeChange:3,repChange:1}, response:'"不是白费的……谢谢你年轻人。"' }
          ]
        },
        { text:'他叹了口气嘴角却有了一点弧度。"有没有什么书……能让我这种老古董想明白一些事情？"', speaker:'chenBo', nextDelay:200,
          action:'recommend' }
      ],
      returnDialogue: [
        { text:'门被推开，陈伯走了进来。有意思——今天他没穿工装，换了一件洗得干干净净的格子衬衫。', isNarrator:true, nextDelay:400 },
        { text:'"老板，上次那本书我看完了。"他把书从怀里掏出来，封面被小心地包了一层牛皮纸。"然后我去找了我孙子。"', speaker:'chenBo', nextDelay:400,
          options:[
            { text:'"怎么样？聊了什么？"', effect:{hopeChange:3,repChange:2}, response:'"我让他教我编程。那小子眼睛都亮了。"陈伯笑得胡子都在抖。' },
            { text:'"您真的去找他了？了不起。"', effect:{hopeChange:4,repChange:2}, response:'"是啊，一辈子没求过人。但求自己孙子不丢人。"' },
            { text:'"他说什么了？"', effect:{hopeChange:2,repChange:1}, response:'"他说——爷爷你怎么不早来。唉，说得我都想哭了。"' }
          ]
        },
        { text:'"你知道吗，"他坐下来，把手摊在膝盖上——那双修了四十五年表的手，"他说编程也是一种手艺。就像修表一样，一个点一个点地抠。"', speaker:'chenBo', nextDelay:400,
          options:[
            { text:'"您上次说过的——编程也是手艺。"', effect:{hopeChange:3,repChange:2}, response:'"是你说的。我记得。那句话让我想了一晚上。"' },
            { text:'"您现在理解他了。"', effect:{hopeChange:3,repChange:1}, response:'"不只是理解。我开始佩服他了。那小子在做一些我完全不懂的东西，但他的手和我的一样稳。"' }
          ]
        },
        { text:'他从口袋里掏出一个东西放在柜台上——是一块旧怀表，擦得锃亮。"送你的。修了一辈子表，总得有一块留在值得的地方。"', speaker:'chenBo', nextDelay:300,
          options:[
            { text:'"这太重了，我不能收。"', effect:{hopeChange:2,repChange:1}, response:'"收下吧。书店和钟表铺一样，都是快要消失的东西。但我不希望你消失。"' },
            { text:'"谢谢您，陈伯。我会好好保存。"', effect:{hopeChange:4,repChange:2}, response:'他点了点头，眼睛里有光："再给我推荐一本吧。这次——给一个老家伙看的，让他知道这世界虽然变了，但手艺没死。"' }
          ]
        },
        { text:'他把怀表轻轻推向你："帮我选一本。一本能让一个老钟表匠在新时代也找到位置的书。"', speaker:'chenBo', nextDelay:200,
          action:'recommend' }
      ]
    },

    xiaoMing: {
      id:'xiaoMing', name:'小明', tag:'初二学生',
      colors:{ hair:'#1A1A2E', skin:'#F5DEB3', clothes:'#2E86AB', accent:'#FFD700' },
      dialogue:[
        { text:'门被猛地推开了一个背着书包的少年闯了进来校服有点脏。', isNarrator:true, nextDelay:300 },
        { text:'他看了看四周表情介于好奇和不耐烦之间像是被迫来的但又忍不住想知道这里有什么。', isNarrator:true, nextDelay:400,
          options:[
            { text:'"欢迎想找什么书？"', effect:{hopeChange:0,repChange:0}, response:'"随便看看我妈让我来的。"' },
            { text:'"嘿你书包上有个洞。"', effect:{hopeChange:1,repChange:1}, response:'他下意识地捂住了书包破的地方："关你什么事。"' },
            { text:'(什么都没说等着)', effect:{hopeChange:1,repChange:1}, response:'他四处张望了一会儿终于开口："这里有漫画吗？"' }
          ]
        },
        { text:'"没有漫画只有正经书。"但你注意到了他书包侧面露出的半张画——是用铅笔画的线条很好。', isNarrator:true, nextDelay:400,
          options:[
            { text:'"你画的？"', effect:{hopeChange:2,repChange:1}, response:'他愣了一下把书包往身后藏了藏："不是……借的。"' },
            { text:'"正经书也可以很有趣的比如这本讲一个小王子的。"', effect:{hopeChange:1,repChange:0}, response:'"小王子？那不是小孩看的吗。"' },
            { text:'"不想看书也没关系你可以在这里待一会儿。"', effect:{hopeChange:2,repChange:1}, response:'他看了看周围拉过一把椅子坐下但没有立刻说话。' }
          ]
        },
        { text:'过了一会儿他主动开口了："我爸妈每天都说你要考出去不要像我们一样。"' , speaker:'xiaoMing', nextDelay:300,
          options:[
            { text:'"听起来压力很大。"', effect:{hopeChange:2,repChange:1}, response:'"压力大？他们才不知道什么叫大。"' },
            { text:'"你有没有想过自己想做什么？"', effect:{hopeChange:3,repChange:2}, response:'他想了很久然后从书包里抽出了一张皱巴巴的纸——是一幅画。' },
            { text:'"考试确实重要但不是唯一的事。"', effect:{hopeChange:2,repChange:1}, response:'他抬头看了你一眼眼神里有些意外。' }
          ]
        },
        { text:'画上是一只龙在云端飞行线条虽然稚嫩但充满力量。"这是我画的。被我撕了半张。"', speaker:'xiaoMing', nextDelay:300,
          options:[
            { text:'"画得很好。真的。"', effect:{hopeChange:4,repChange:2}, response:'他的眼眶红了第一次有人这么认真地说这句话。' },
            { text:'"你喜欢画画就应该继续画。"', effect:{hopeChange:3,repChange:2}, response:'"可是他们说画画没用……"' },
            { text:'"你知道吗有一本书讲的就是一个来自小星球的人他也很特别。"', effect:{hopeChange:3,repChange:1}, response:'"小星球的人？"他似乎有了点兴趣。' }
          ]
        },
        { text:'他沉默了一会儿然后把画重新折好放回书包里。"有没有一本书……是写给那些觉得自己不一样的人看的？"', speaker:'xiaoMing', nextDelay:200,
          action:'recommend' }
      ],
      returnDialogue: [
        { text:'门被撞开了——准确地说，是被一个兴冲冲的少年用肩膀顶开的。小明气喘吁吁地站在门口，手里攥着一卷纸。', isNarrator:true, nextDelay:400 },
        { text:'"老板！我画了新东西！"他还没喘匀气就把画抖开了——一条龙，比上次那条大了两倍，鳞片一片一片地闪着光。', speaker:'xiaoMing', nextDelay:400,
          options:[
            { text:'"这进步太大了！"', effect:{hopeChange:3,repChange:2}, response:'"嘿嘿，我天天画。上次那本书我看了三遍——小王子那个，你推荐的。"' },
            { text:'"你每天都在练习？"', effect:{hopeChange:2,repChange:1}, response:'"嗯！我妈说我像着了魔。但还是不让我报美术班。"他的笑容淡了一点。' },
            { text:'"那条龙活了。"', effect:{hopeChange:3,repChange:1}, response:'"对吧！我在它眼睛里加了一点点光——你看，是不是像在飞？"' }
          ]
        },
        { text:'"但是，"他把画卷起来，声音低了些，"我爸说期末考进前十才让我学画画。还有两个月。"他把额头抵在书包上:"我怕我考不到。"', speaker:'xiaoMing', nextDelay:400,
          options:[
            { text:'"你画得这么好，说明你做事能坚持。考试也一样。"', effect:{hopeChange:3,repChange:2}, response:'他抬起头："你真的觉得一样吗？"' },
            { text:'"不是只有画画才有价值。考试是帮你走得更远的工具。"', effect:{hopeChange:2,repChange:1}, response:'"工具……"他想了想，"就像铅笔？"' },
            { text:'"两个月够了。我相信你。"', effect:{hopeChange:4,repChange:2}, response:'他用力擦了擦眼睛："你是第一个说相信我的人。"' }
          ]
        },
        { text:'他把画小心地折好，然后抬起头，眼睛亮亮的："再给我推荐一本吧。一本能让我撑过这两个月的——不只是画画，还有考试。"', speaker:'xiaoMing', nextDelay:200,
          action:'recommend' }
      ]
    },

    liDoctor: {
      id:'liDoctor', name:'李医生', tag:'镇诊所医生',
      colors:{ hair:'#333333', skin:'#E8D0B8', clothes:'#FFFFFF', accent:'#2E7D32' },
      dialogue:[
        { text:'门开了走进来一个穿白大褂的男人。他把听诊器从脖子上摘下来塞进口袋动作很熟练。', isNarrator:true, nextDelay:400 },
        { text:'他的眼底有明显的青黑色白大褂的领口有点皱——像是已经连续穿了好几天。', isNarrator:true, nextDelay:300,
          options:[
            { text:'"李医生下班了？"', effect:{hopeChange:1,repChange:1}, response:'"算是吧刚看完最后一个病人。"' },
            { text:'"您看起来很累要坐会儿吗？"', effect:{hopeChange:2,repChange:1}, response:'他愣了一下然后苦笑："看得出来吗？"' },
            { text:'"(点头示意)"', effect:{hopeChange:1,repChange:0}, response:'他在店里站了一会儿目光停留在医学书架上。' }
          ]
        },
        { text:'"王婶的高血压药我调整了剂量老张的腰疼给他开了膏药……"他像是在自言自语地复盘今天的工作。', speaker:'liDoctor', nextDelay:300,
          options:[
            { text:'"您一个人照顾全镇人的健康一定不容易。"', effect:{hopeChange:2,repChange:1}, response:'"不容易……习惯了。"' },
            { text:'"有没有哪个病人让您印象特别深？"', effect:{hopeChange:3,repChange:2}, response:'他的表情暗了下来："有一个……"' },
            { text:'"要不要看看新到的书换换脑子？"', effect:{hopeChange:1,repChange:0}, response:'"书……我已经很久没好好看过书了。"' }
          ]
        },
        { text:'"上周赵大爷走了。延误了至少两天才送来我……"他没有说下去。', speaker:'liDoctor', nextDelay:400,
          options:[
            { text:'"那不是您的错。"', effect:{hopeChange:3,repChange:2}, response:'"我知道理性上我知道。但……"' },
            { text:'"您能做的就是尽最大努力。"', effect:{hopeChange:2,repChange:1}, response:'"最大努力……有时候觉得不够。"' },
            { text:'"也许您需要停下来想一想为什么当初选择做医生。"', effect:{hopeChange:4,repChange:2}, response:'这个问题让他沉默了很久眼睛看向窗外。' }
          ]
        },
        { text:'"十八年了。"他轻声说"有时候我觉得自己不是在救人而是在……发药机器。"', speaker:'liDoctor', nextDelay:300,
          options:[
            { text:'"每一个被您治好的人都不会忘记您。"', effect:{hopeChange:3,repChange:2}, response:'他深深吸了一口气谢谢你。"' },
            { text:'"倦怠是正常的但请别忘了最初的理由。"', effect:{hopeChange:4,repChange:2}, response:'"最初的理由……是啊都快忘了。"' },
            { text:'"有一本书写了一个医生面对生死的故事也许您会有共鸣。"', effect:{hopeChange:3,repChange:1}, response:'"一个医生写的？"' }
          ]
        },
        { text:'他整理了一下衣领恢复了职业性的平静。"有什么书能帮我想清楚一些事情吗？"', speaker:'liDoctor', nextDelay:200,
          action:'recommend' }
      ],
      returnDialogue: [
        { text:'今天的李医生和上次不太一样。白大褂洗过了，熨得笔挺。眼底的青黑还在，但走路有了节奏。', isNarrator:true, nextDelay:400 },
        { text:'"老板，"他直接走到柜台前，"上次你推荐的书我读完了。读完以后我做了一个决定。"', speaker:'liDoctor', nextDelay:300,
          options:[
            { text:'"什么决定？"', effect:{hopeChange:2,repChange:1}, response:'"我向镇里申请了一个公共卫生项目。免费给老年人做基础体检。"' },
            { text:'"那本书起作用了？"', effect:{hopeChange:3,repChange:2}, response:'"不是书——是书让我想起来的。当初为什么选择做医生。"' },
            { text:'"看来是好事。"', effect:{hopeChange:2,repChange:1}, response:'"不止。镇政府批准了。下个月开始。"他说这句话的时候站得笔直。' }
          ]
        },
        { text:'"十八年，"他轻声说，"我以为自己只是在重复。但重复本身也是一种积累。赵大爷的事让我难受了很久——但这次的项目，就是因为不想再有人延误。"', speaker:'liDoctor', nextDelay:400,
          options:[
            { text:'"你用痛苦变成了力量。"', effect:{hopeChange:4,repChange:2}, response:'他沉默了几秒："是的。我没有白痛。"' },
            { text:'"赵大爷在天上会看到的。"', effect:{hopeChange:3,repChange:2}, response:'他低下头然后又抬起来："你说得对。"' },
            { text:'"恭喜你，李医生。这是很大的进步。"', effect:{hopeChange:3,repChange:1}, response:'"谢谢你。真的。你这家书店——比你以为的有用。"' }
          ]
        },
        { text:'他看了看手表——不是在看时间，而是在看那块表。"这是我第一天当医生时父亲送的。今天好像特别亮。"他转向书架："有什么书，能帮一个重新找到方向的医生，继续保持热情？"', speaker:'liDoctor', nextDelay:200,
          action:'recommend' }
      ]
    },

    fangMiss: {
      id:'fangMiss', name:'方小姐', tag:'归乡者',
      colors:{ hair:'#1C1C1C', skin:'#FAF0E6', clothes:'#2C3E50', accent:'#E74C3C' },
      dialogue:[
        { text:'风铃响了一声。一个穿着深色大衣的女人走了进来她的打扮和这个小镇格格不入却又带着一种刻意的朴素。', isNarrator:true, nextDelay:400 },
        { text:'她环顾四周目光挑剔又好奇最后落在你身上。', isNarrator:true, nextDelay:300,
          options:[
            { text:'"欢迎光临。"', effect:{hopeChange:0,repChange:0}, response:'"这家店……是你祖父开的吧？"' },
            { text:'"您是从外地来的吧？"', effect:{hopeChange:1,repChange:1}, response:'"看得出来吗？"她笑了笑笑容没有到达眼睛。' },
            { text:'"外面冷进来暖和一下。"', effect:{hopeChange:2,repChange:1}, response:'"谢谢。"她脱下大衣露出里面质感很好的针织衫。' }
          ]
        },
        { text:'"我在上海待了八年。"她自己开口了"做金融分析。看起来不错对吧？"', speaker:'fangMiss', nextDelay:300,
          options:[
            { text:'"听起来是很不错的工作。"', effect:{hopeChange:1,repChange:0}, response:'"不错。但也仅此而已。"' },
            { text:'"那为什么要回来呢？"', effect:{hopeChange:2,repChange:1}, response:'"这个问题我问了自己三个月还没答案。"' },
            { text:'"八年不短是什么让你决定离开的？"', effect:{hopeChange:3,repChange:2}, response:'她认真地看了你一眼似乎在评估你是否值得对话。' }
          ]
        },
        { text:'"在那里我有体面的工作不错的收入一群表面上的朋友。但我感觉自己在假装活着。"她顿了顿"回来后发现这里也不属于我了。"', speaker:'fangMiss', nextDelay:400,
          options:[
            { text:'"也许归属感不是某个地方而是某种状态。"', effect:{hopeChange:3,repChange:2}, response:'"某种状态……有意思的说法。"' },
            { text:'"很多人都有这种感觉不只是你。"', effect:{hopeChange:2,repChange:1}, response:'"是吗？那我还不算太奇怪。"' },
            { text:'"也许你需要的不是找到答案而是允许自己暂时没有答案。"', effect:{hopeChange:4,repChange:2}, response:'她重复了一遍这句话嘴角终于有了一点真实的笑意。' }
          ]
        },
        { text:'"听说这是镇上唯一还有精神气息的地方所以来看看。"她指了指书架"有什么推荐吗？能给一个找不到方向的人看的。"', speaker:'fangMiss', nextDelay:200,
          action:'recommend' }
      ],
      returnDialogue: [
        { text:'方小姐今天没穿大衣。她穿着一件舒服的针织衫，头发随意地绑了起来——和上次那个精致但紧绷的女人判若两人。', isNarrator:true, nextDelay:400 },
        { text:'"我决定不走了。"她开口第一句就是这个，像是怕自己反悔。"上次你那句话——「允许自己暂时没有答案」——我贴在床头了。"', speaker:'fangMiss', nextDelay:400,
          options:[
            { text:'"不走了？真的？"', effect:{hopeChange:3,repChange:2}, response:'"真的。我已经在看铺面了——就在街对面。想开一家咖啡馆。"' },
            { text:'"是什么让你下定决心的？"', effect:{hopeChange:2,repChange:1}, response:'"不只是你。但你是最后一根稻草。"她笑了，这次笑容到了眼睛。' },
            { text:'"欢迎回来——真正的回来。"', effect:{hopeChange:4,repChange:2}, response:'她愣了一下然后眼眶红了但这次是开心的那种。' }
          ]
        },
        { text:'"上海那个项目我推了。年薪六十万的项目。"她耸耸肩，"打电话拒绝的时候，手在抖。但挂了电话以后，从来没有这么轻松过。"', speaker:'fangMiss', nextDelay:400,
          options:[
            { text:'"你不后悔？"', effect:{hopeChange:2,repChange:1}, response:'"后不后悔不知道。但这是我第一次为自己做的决定——不是为简历、不是为爸妈、不是为「看起来不错」。"' },
            { text:'"咖啡馆是个好主意。镇上正缺这样的地方。"', effect:{hopeChange:3,repChange:2}, response:'"对吧！而且你的书店就在对面，我们可以一起——一家书店一家咖啡馆，这画面想想就觉得对。"' }
          ]
        },
        { text:'她从包里掏出一张纸——是一份手写的商业计划书，旁边画着咖啡馆的草图。"帮我推荐一本书吧。一本能让一个刚做出人生最大决定的人，坚定地走下去的书。"', speaker:'fangMiss', nextDelay:200,
          action:'recommend' }
      ]
    },

    traveler: {
      id:'traveler', name:'???', tag:'神秘旅人',
      colors:{ hair:'#444444', skin:'#DCDCC8', clothes:'#36454F', accent:'#FFD700' },
      dialogue:[
        { text:'门被推开的时候没有铃声——它好像是自己开的。', isNarrator:true, nextDelay:400 },
        { text:'一个背着旅行包的人站在门口。风尘仆仆看不清来历年龄也不好判断。他的眼神很平静像一口深井。', isNarrator:true, nextDelay:400,
          options:[
            { text:'"欢迎。想找什么书？"', effect:{hopeChange:1,repChange:1}, response:'他没有立刻回答只是看着你。"也许吧。"' },
            { text:'"您从哪里来？"', effect:{hopeChange:1,repChange:1}, response:'"很远的地方。"他说"也很近。"' },
            { text:'(安静地等着)', effect:{hopeChange:2,repChange:1}, response:'他点了点头似乎欣赏你的沉默。' }
          ]
        },
        { text:'"我在找一本书。"他的声音平稳而低沉"一本很重要的书。"', speaker:'traveler', nextDelay:300,
          options:[
            { text:'"什么书？我帮您找。"', effect:{hopeChange:1,repChange:0}, response:'"我还不能确定名字。但如果在这里我应该能感觉到。"' },
            { text:'"这里有两千多本。"', effect:{hopeChange:0,repChange:0}, response:'"两千多本。比我想象的多。也比我想象的少。"' },
            { text:'"您是怎么知道这家店的？"', effect:{hopeChange:2,repChange:1}, response:'"有人告诉过我如果这世界上还有什么地方能找到那本书就是这里。"' }
          ]
        },
        { text:'他在店里慢慢地走手指轻轻拂过一排排书脊不像是在找书更像是在和老朋友打招呼。', isNarrator:true, nextDelay:400,
          options:[
            { text:'"您认识我祖父吗？"', effect:{hopeChange:2,repChange:1}, response:'他停了一下"认识。他很特别。"' },
            { text:'"您找了多久了？"', effect:{hopeChange:1,repChange:1}, response:'"很久。也可能只是一瞬间。时间这种东西很狡猾。"' },
            { text:'"要喝杯茶吗？"', effect:{hopeChange:2,repChange:1}, response:'"茶好。好久没喝过别人泡的茶了。"' }
          ]
        },
        { text:'"你知道最有趣的事情是什么吗？"他突然说"一家书店存在的意义不在于卖了多少书而在于某个人在某一天拿到了对他而言正确的那一本。"', speaker:'traveler', nextDelay:400,
          options:[
            { text:'"我祖父也说过类似的话。"', effect:{hopeChange:3,repChange:2}, response:'"是的他知道。"他微笑了那是第一个真实的笑容。' },
            { text:'"您找到了吗？您要找的那本。"', effect:{hopeChange:2,repChange:1}, response:'"也许找到了也许还没有。但这段路本身就有意义。"' },
            { text:'"您愿意告诉我您是谁吗？"', effect:{hopeChange:2,repChange:1}, response:'"我是谁……不重要。重要的是你在做什么。"' }
          ]
        },
        { text:'"给我推荐一本书吧。"他说"不是为我为你自己选一本你觉得这家店最值得被读出去的书。"', speaker:'traveler', nextDelay:200,
          action:'recommend' }
      ]
    }
  },

  // ========================
  //  结局定义
  // ========================
  endings: {
    trueEnding: {
      type:'true', title:'点燃希望', icon:'🌟',
      condition: (s) => s.hope >= 85 && s.daysCompleted >= 6 && s.totalPerfect >= 4 && s.metTraveler,
      summary:'书店成了小镇的精神灯塔。人们开始从周边的村庄赶来有人甚至骑了三个小时自行车。你祖父的名字被人反复提及但更多人说起的是"那个年轻的店主"。\n\n林月的女儿康复了她在门口留了一束野花。陈伯带来了孙子两人一起挑了一本编程入门书。小明的一幅画被贴在了店门口画的是一只在云端的龙。李医生换了工作时间表开始每周休息一天。方小姐决定留在小镇开了一家咖啡馆就在街对面。\n\n至于那个神秘的旅人——他在离开前留下了一句话："你会做得比我好。"\n\n橡木镇的希望值达到了前所未有的高度。',
      hopeEnd:95
    },
    goodEnding: {
      type:'good', title:'守望者', icon:'🏠',
      condition: (s) => s.hope >= 60 && s.daysCompleted >= 5,
      summary:'日子平平淡淡地过着。书店开门关门的每一天都差不多但又不太一样。有些人会再来有些人不会再来了但每一个走进来的人都带走了一些东西。\n\n你不确定自己是否是一个好的店主但你确信这家店应该继续开着。\n\n这就够了。',
      hopeEnd:72
    },
    normalEnding: {
      type:'normal', title:'平凡日子', icon:'📖',
      condition: (s) => s.hope >= 40 && s.daysCompleted >= 3,
      summary:'你还在学习如何做一个店主。有时候推荐的书好像起了作用有时候不确定。有人在门口犹豫了一下还是走了。\n\n但这没关系。罗马不是一天建成的。\n\n明天又是新的一天。',
      hopeEnd:50
    },
    hiddenEnding: {
      type:'hidden', title:'最后的读者', icon:'🌙',
      condition: (s) => s.metTraveler && s.hope >= 70 && s.totalPerfect >= 5,
      summary:'旅人在黄昏时分离开了。桌上放着一本旧书封面已经磨损看不清标题。翻开第一页上面写着一行字：\n\n"给未来的你——如果有一天你也开了一家书店记得每一本书都在等它的读者。"\n\n笔迹你认得出来——那是你祖父的字。\n\n你不知道旅人是谁也不知道他是怎么得到这本书的。但此刻窗外的夕阳把整个书店染成了金色你觉得一切都对了。',
      hopeEnd:88
    }
  },

  // ========================
  //  每日清晨叙事——7 天故事弧线
  //  ========================
  dayNarratives: [
    {
      day: 1,
      title: '第一天 · 断联后的灯',
      mood: '忐忑',
      sceneBg: '#F5E6D3',
      text: '大断联后的第七年，橡木镇已经很少有人提起互联网。服务器、云盘、搜索引擎和电子书库在那个周二下午一起沉默，像一座城市突然忘记了自己的语言。\n\n祖父走了以后，镇上的人都说这家店撑不过这个月。可方圆百里，只有这里还保存着纸质地图、医书、小说、手艺笔记，还有那些能让人撑下去的句子。\n\n我摸到口袋里祖父留下的铜钥匙，冰凉的。\n\n"如果知识只剩纸页，那就把灯点亮。"',
      goal: '今天会有两位客人走进最后一间书店。听懂他们的困境，为他们找到一本能带走的答案。',
      hopeHint: 50
    },
    {
      day: 2,
      title: '第二天 · 试探',
      mood: '不安',
      sceneBg: '#E8DCC8',
      text: '第一天的两个人离开后，店里安静得能听见灰尘落在书脊上的声音。我不知道我推荐的书记住了没有——林月会不会翻开它？陈伯会不会重新看见自己的手艺？\n\n从前人们遇到问题会搜索。现在他们只能走很远的路，推开一扇木门，问一个守着书架的人。\n\n我擦着柜台的时候发现祖父刻在木纹上的字："书是钥匙，不是答案。"\n\n今天会有新的面孔。希望和昨天不一样。',
      goal: '新的客人要来了，他们的困境也许更复杂。认真听，认真选。',
      hopeHint: 52
    },
    {
      day: 3,
      title: '第三天 · 暗流',
      mood: '紧张',
      sceneBg: '#DDD0BE',
      text: '昨晚镇上下了雨。屋顶漏了两处，我用祖父的旧茶缸接水。水滴砸在搪瓷上的声音让我睡不着。\n\n我开始怀疑——我真的能做这件事吗？每个人都在找答案，而我只是一个守着旧书店的年轻人。可断联之后，答案不再从屏幕里刷新出来，它们藏在纸页、记忆和人与人的谈话里。\n\n今天门还是要开。因为关上门就真的什么都没有了。',
      goal: '今天会有熟悉的面孔回来。听听他们这几天发生了什么。',
      hopeHint: 55
    },
    {
      day: 4,
      title: '第四天 · 裂缝',
      mood: '低落',
      sceneBg: '#D5C8B2',
      text: '今天早上我发现书架上有几本书被借走后再没还回来。祖父的书店从来没有借书不还的规矩——但那些人可能不会再来了。\n\n风从门缝里灌进来，把门口的传单吹得满地都是。我捡起一张，上面写着"橡木镇最后的书店？"。问号很刺眼。\n\n但我还没打算放弃。',
      goal: '风雨中更要站得稳。今天不管谁来，都用心对待。',
      hopeHint: 50
    },
    {
      day: 5,
      title: '第五天 · 转折',
      mood: '疲惫',
      sceneBg: '#CDC0A8',
      text: '我已经连续五天没有好好睡过觉了。镇上的王婶路过时说："小伙子，要不就算了吧。"\n\n但就在我快要动摇的时候，我看到了门口的信箱里有一张字条——是林月的笔迹："谢谢您，小芸好多了。"\n\n我把字条贴在柜台上。今天，还要开门。',
      goal: '坚持到今天的人已经不多。但有人在等你——也许是一位不同寻常的客人。',
      hopeHint: 58
    },
    {
      day: 6,
      title: '第六天 · 曙光',
      mood: '希望',
      sceneBg: '#E5D9C5',
      text: '祖父的铜钥匙这几天被我磨得锃亮。我不再把它当遗物，而是一把真正的钥匙——开的不只是书店的门。\n\n昨天有人说："这家书店存在的意义不在于卖了多少书，而在于某个人拿到了对的那一本。"我突然觉得，也许这就是我一直想听的话。\n\n还有两天。',
      goal: '光芒开始从裂缝里透进来了。今天，用心推荐每一本。',
      hopeHint: 65
    },
    {
      day: 7,
      title: '第七天 · 终章',
      mood: '坚定',
      sceneBg: '#F0E4D0',
      text: '第七天了。不管结局如何，我已经做了我能做的。书架上的灰被翻动过，每一天都有人来。也许不多，但够了。\n\n祖父说过："书店是一座灯塔，不是因为它亮，而是因为它一直在。"\n\n今天可能是最后一天。也可能是新的第一天。取决于我今天怎么做。',
      goal: '这是最后的考验。用你的方式，为每一个需要书的人找到答案。',
      hopeHint: 70
    }
  ],

  // ========================
  //  分类配置
  //  ========================
  categories: {
    literature: { name:'文学小说', color:'#E07A5F', icon:'📚' },
    philosophy: { name:'哲学思辨', color:'#6B5B95', icon:'🔮' },
    psychology: { name:'心理成长', color:'#3D9970', icon:'💚' },
    humanities: { name:'人文社科', color:'#BC6C25', icon:'🏛️' },
    science: { name:'科学探索', color:'#0077BB', icon:'🔭' },
    art: { name:'艺术美学', color:'#A23B72', icon:'🎨' },
    detective: { name:'侦探推理', color:'#4B5563', icon:'🕵' }
  }
};
