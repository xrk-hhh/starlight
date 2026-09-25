# Starlight · 星港

> ✦ the stars remember every commit —— 一个深空主题的个人网站：算法竞赛题解库、项目展示与一点点浪漫。

**在线访问**：<https://xrk-hhh.github.io/starlight/>

## 这是什么

用 **Vue 3 + TypeScript + Vite + Three.js + GSAP + Tailwind CSS v4** 搭建的 SPA 个人站点，部署在 GitHub Pages。从设计文档到任务拆解、实现、视觉验收、部署，全程由 AI Agent 工作流（deepseek-v4-pro + Claude Code，近期 deepseek harness × deepseek-v4-flash）驱动开发。

## 功能地图

**内容**
- 📚 博客知识库：37 篇文章（31 篇算法题解，含难度星级 1~5、来源均为本人真实提交）+ 两级标签（分类 → 知识点）+ 搜索 + 归档时间线 + 随机漫游
- 📖 阅读体验：文章 TOC scroll-spy、代码高亮（One Dark Pro，shiki）、复制按钮、图片 Lightbox、←/→ 翻篇、相关文章推荐
- 🎯 今日一题：按日期确定性轮换的算法题推荐
- 🛠 项目星轨：原生横向滚动轨道（拖拽/方向键/按钮），真实运行截图封面
- 📊 算法星域：洛谷 / 牛客竞赛真实数据（CI 自动拉取）
- ✨ 贡献星图：近一年 GitHub 提交热力图（星星版）
- ☁️ 技能星云：SVG 雷达图（刻度环渐入 / 四芒星顶点 / hover 轴联动）

**设计**
- 🎨 五套主题（v2.11 场景化）：深空星港 / 落日熔金 / 极光冰川 / 月白纸笺 / 樱庭薄暮——粒子·星云·流星随主题换色，每主题独立氛围层（落日日轮余晖 / 极光帘幕漂移 / 纸笺衬线字体 / 樱瓣飘落）；全站 SVG/着色硬编码冷色已清零（glitch/hero 渐变/星云/唱片/启动 spinner 随主题换色，落日代码块暖化），浅色主题全量适配
- 🐉 桌宠奶龙 / 奶蛙：原版表情包精灵表动画（erich207 & timerring 素材）——拖拽甩出惯性滑行、边缘反弹、散步跟随光标（悬停暂停）、投喂粒子、时段问候、点击 Q 弹
- 🎵 星港电台（v2.15.3 三铁律）：①`play()` 只在点击手势内发起（await 网络会被 autoplay 策略拒绝）②播放中永不换源（未出声元素换源续播会被拒绝且静默死掉）③不双下载（渐进流播放时中止后台 fetch——同一文件两条连接会互相抢带宽）——悬停预取 blob 秒播（实测 <0.5s）、慢网首播显示「信号缓冲中」、暂停后空闲重挂预取；WebAudio 真频谱均衡器 + 播放/暂停音量渐变，切页不断播（Ethereal Relaxation — Kevin MacLeod, CC BY 4.0；音源 1.6MB/160kbps，若需进一步提速可用 ffmpeg 重编码 112kbps 至 ~1.1MB）
- 🌌 GPU 粒子星海：三层视差 + 流星 + 排斥场 + 主星导航（可见性暂停 / reduced 静帧）
- 🗺 版本星座：发版历史排成一条星轨，点击星定位日志
- 🖥 星港终端：Now 页飞行日志逐行打出
- 🎇 细节：命令面板（`?`）/ 全局快捷键（`g` 前缀跳页 · `r` 随机漫游 · `c` 复制邮箱，中文输入法兼容）/ Konami 彩蛋 / 打字流星 / 失焦标题 / 星港边缘 toast / hero 视差

**互动**
- 💬 双通道留言：公开评论走 giscus（GitHub Discussions，滚动预载 + 主题跟随 + 慢网降级出口）；私密信件走「联络信使」表单（姓名/邮箱/主题/消息，**Web3Forms 在线直投**——无需邮件客户端，服务不可达时自动降级 mailto，草稿自动留存）
- 🎊 电报彩蛋「传输仪式」（v2.14）：发送成功后三段式传输状态（电波发射 → 深空中继 → 星港签收），签收瞬间流星护航，你的电波化作「回执卡」挂进深空讯号区（仅本次会话可见）

**基础设施**
- RSS（atom.xml，37 篇）+ sitemap.xml + robots.txt：postbuild 构建期生成
- CI：GitHub Actions 定时+推送部署；构建前拉取 GitHub/OJ 统计；Node 24
- 性能：首屏 JS 按需加载（粒子/语法包/音频全部 idle 或路由级）、**博客数据构建期分层（v2.18）**——列表/统计走构建期 frontmatter 元数据（blog chunk 225KB→19KB，gzip -92%），37 篇全文按篇懒加载（单篇 2-6KB）、运行时零 js-yaml、wasm 零依赖（shiki JS 引擎）、CLS 0、axe 清零

## 快速开始

```bash
npm install
npm run dev        # 开发（base 为 /）
npm test           # vitest
npm run lint       # eslint
npm run typecheck  # 全量类型检查（构建内的检查走增量缓存，验收用这条）
npm run build      # 构建到 dist/（含 atom.xml / sitemap 生成）

# 本地预览生产构建（注意 base）：
npm run preview:local   # 本地预览 dist/（替代 vite preview，原因见「本地验收」一节）
```

> 若坚持用 `vite preview`：留意它可能只监听 IPv6，且会把未命中的资源请求回退成 HTML（白屏假象），详见「本地验收」一节。

## 目录结构

```
src/
├── views/          # 路由页面（Home/About/Projects/Blog*/Now/Friends/Guestbook/Versions/404）
├── components/
│   ├── ui/         # 星云/星图/统计/电台/主题切换/今日一题 等
│   ├── overlay/    # 桌宠/命令面板/流星光标/流星转场
│   ├── particles/  # WebGL 粒子背景
│   └── blog/       # Giscus 评论
├── composables/    # 主题/视差/reveal/惯性倾斜/打字机/计数 等
├── blog/           # 37 篇 Markdown 文章（frontmatter: title/date/tags/category/difficulty）
├── data/           # profile / projects / friends / oj / site（版本单一源）
├── lib/            # markdown 渲染（shiki One Dark Pro）/ 博客解析（CRLF 兼容）
└── three/          # ParticleScene（三层星海）
scripts/            # fetch-github-stats / fetch-oj-stats / postbuild(RSS+sitemap)
public/images/blog/ # 30 张自绘 One Dark 风格 SVG 讲解图（过三重布局检查）
```

## 写作约定

博客是本站的主要内容资产，写作标准与代码标准同级。以下为全站文章的强制约定。

### 内容标准：有用、通用、实在

| 维度 | 要求 | 反例（不合格） |
|---|---|---|
| 有用 | 读者读完能带走一条可复用的判断或做法，能直接用在自己的项目里 | 只复述「这次踩了个坑」 |
| 通用 | 结论脱离本站具体场景仍成立；本站细节只作例证，不作结论本身 | 通篇讲某次提交的某个字段 |
| 实在 | 概念落地为可验证的现象、命令、数字或前后对比 | 只给形容词，不给证据 |
| 精炼 | 单篇净正文 1200–2000 字；一段只讲一件事，超过 200 净字的段落必须拆 | 把三件事塞进一段 |
| 易懂 | 先给结论再给理由；术语首次出现即用一句话解释 | 上来先铺五行背景 |

结构上采用「问题 → 现象 → 归因 → 处置 → 可复用纪律」：开头一段把问题说清并给出结论，中间按现象分层展开，结尾收敛成一条**脱离本场景也成立**的通用主张。

### 表达标准：图文并茂、清晰准确

- **一图一事**：每张示意图只承载一个机制；图内文字沿用站点配色（One Dark 系背景 + 语义色分层），深浅色主题下都要能读
- **图随文走**：图放在它所解释的段落之后，正文必须有一段话读图（不是「如下图」了事），图与文互为解释
- **信息密度**：能画成对照表 / 流程 / 分层的，就不铺成长段落；关键结论加粗收口，代码块只留可运行片段
- **准确优先于好看**：图里出现的每条路径、状态码、MIME 类型、命令都要与实际一致；宁少画，不画错
- **可核验**：涉及结论的断言给出可复现命令或可观察现象，读者能自己验一遍

### 语气标准：冷静、客观、无修订痕迹

- **禁止对话痕迹**：不出现「你说过」「按你的要求」「之前我们讨论过」「上一版」这类面向会话的表述——文章面向的是一年后的陌生读者
- **禁止面向修改**：不写「已改为」「本次修改」「原方案是 X」「现在改成 Y」；只呈现最终结论与它成立的依据，演进史留在提交记录里
- **禁止辩解性表述**：不写「其实并不是」「严格来说」「遗憾的是」「当然这也有道理」这类找补；判断直接给，边界直接在句子里划清
- **非人称叙述**：用「现象是」「做法是」，不用「我发现」「我故意」「笔者认为」；第一人称仅在确属个人经历的场合（如站务公告）少量使用
- **逻辑通顺**：段与段之间要有可追溯的推进关系（因果 / 递进 / 对照），不靠小标题跳跃；定稿通读一遍，删掉不承载信息的句子

### 交付前自检（四道门）

| 门 | 检查什么 | 怎么判定 |
|---|---|---|
| 事实门 | 文中每个路径、命令、数字与实际一致 | 真实执行一遍并比对输出 |
| 图效门 | 图片能加载、主题下可读、布局无相交越界 | 浏览器打开文章页核对 `naturalWidth > 0` |
| 语气门 | 无对话痕迹 / 无面向修改 / 无辩解性表述 / 无非必要第一人称 | 全文检索词表，命中即改 |
| 结构门 | 段落不超 200 净字、总字数在区间内、结尾收敛为通用主张 | 通读 + 字数统计 |

### 落地约定（文件与脚本）

- 文章放 `src/blog/`，文件名 `YYYY-MM-DD-slug.md`；frontmatter 需含 `title/date/tags/desc`，算法题解加 `category: 算法竞赛` 与 `difficulty: 1-5`
- 正文渲染前由 `src/lib/markdown.ts` 的 `stripFrontmatter` 统一剥离元数据块，渲染入口不接收含 frontmatter 的文本；该契约由 `src/blog/blog-content.test.ts` 断言（标题不得出现 `title:`、正文不得出现 `category:`）
- 示意图放 `public/images/blog/`，正文按 `/starlight/images/blog/xxx.svg` 引用；引用前过布局检查（文本相交 / 越界 / 遮挡）
- 新增主题：在 `src/composables/useTheme.ts` 的 `THEMES` 加一项（swatch + scene 场景色板 + light 标志 + giscus 主题），再在 `src/styles/main.css` 补 `html[data-theme='…']` 变量与氛围层、`index.html` 首帧脚本加 key
## 本地验收（为什么不用 `vite preview`）

```bash
npm run build && npm run preview:local   # → http://127.0.0.1:4173/starlight/
```

`vite preview` 在本机踩过两个坑，做真实浏览器验收时会制造「站点坏了」的假象（v2.20 体检时排查了一整轮，详见博客《预览环境也会说谎》）：

1. **IPv6-only 监听**：预览进程可能只监听 `[::1]`，而浏览器先解析 IPv4 的 `localhost`——表现为连接被拒/页面不加载；
2. **SPA 回退把资源顶替成 HTML**：未命中的请求一律返回 `index.html`，于是 `assets/*.js` 请求得到 200 + `text/html`，浏览器按 JS 解析 HTML 后**静默失败**，页面只剩写死在壳里的导航与页脚（白屏假象）。

`scripts/preview-server.mjs` 因此只做一件事：**老实地服务 dist/ 构建产物**——静态扩展名命中给正确 MIME、不命中给真 404（不回退 index.html），无扩展名的路由才交给应用外壳。验收时可直接核对响应头：

```bash
curl -sI "http://127.0.0.1:4173/starlight/assets/$(ls dist/assets | grep '^index-.*\.js$')" | findstr /i content-type
# 必须出现 text/javascript；若是 text/html，先修环境，再去看业务代码
```

## 常用改动速查表

| 想改什么 | 去哪里改 | 注意 |
|---|---|---|
| 发新版本 | `node scripts/release.mjs "vX.Y.Z" "note"` 一条命令（改 site.ts/footer/插入版本星图并自校验） | 条目必须**字面量**（禁 SITE_VERSION 引用，测试源码级断言）；CRLF 曾致七条记录丢失，脚本按行处理免疫 |
| 加/换友链 | `src/data/friends.ts`（前 3 位进内圈轨道，其余进外圈） | 同步核对下方卡片描述 |
| 写新文章 | `src/blog/` 新建 `YYYY-MM-DD-slug.md` | atom.xml / sitemap 由 postbuild 自动收 |
| 换背景音乐 | `public/audio/starlight-theme.mp3` + `MusicPlayer.vue` 曲目名文案 | 音乐需可自由使用（当前 CC BY 4.0） |
| 换 Web3Forms key | `gh secret set VITE_WEB3FORMS_ACCESS_KEY` + 本地 `.env` | 重新部署后生效 |
| 调粒子/星空 | **不要动**——粒子栈与 v2.11 逐字节一致（用户认证行为） | 改前先在真实浏览器多主题验证 |
| 评论区 | `src/config/giscus.ts` | 主题跟随站点（light/dark 自动） |

## 联络信使（Web3Forms 直投）

留言板的「联络信使」表单已配置 **Web3Forms 在线直投**：访客填写姓名/邮箱/主题/消息后点击「发送电报」，邮件直接送达站长邮箱，全程不离开站点、不唤起邮件客户端。服务不可达时自动降级 mailto（预填邮件），访客永远有出路；草稿自动留存本机。

密钥管理（已配置，供换 key 时参考）：

- **生产构建**：密钥存于仓库 Actions secret `VITE_WEB3FORMS_ACCESS_KEY`，`deploy.yml` 构建时注入（见 Build 步骤的 env）
- **本地开发**：项目根目录 `.env`（已被 .gitignore 忽略）写入 `VITE_WEB3FORMS_ACCESS_KEY=…`
- 换 key：[web3forms.com](https://web3forms.com) 重新生成 → `gh secret set VITE_WEB3FORMS_ACCESS_KEY` 更新 → 本地 `.env` 同步 → 重新部署

## 致谢与许可

- 奶龙桌宠精灵表：[erich207/nailong-codex-pet](https://github.com/erich207/nailong-codex-pet)（原版奶龙）
- 奶蛙精灵表：[timerring/codex-pet-naiwa](https://github.com/timerring/codex-pet-naiwa)
- 背景音乐：Ethereal Relaxation — [Kevin MacLeod](https://incompetech.com)（[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)）
- 题解中的代码均为本人在洛谷 / 牛客 / AtCoder / Codeforces 的真实提交

## License

代码 MIT；文章与原创插图版权归作者所有。
