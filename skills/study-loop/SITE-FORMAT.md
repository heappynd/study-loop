# 工作区格式（Rspress）

教学工作区**就是**一个 Rspress 2 站点。这份文件是契约：哪些内容会发布、文件放哪、frontmatter 有哪些必填项、导航与侧边栏怎么来、共享组件怎么用。

## 目录结构

```
.
├── rspress.config.ts          # 站点配置：标题、语言、全局样式、全局组件、导航与侧边栏
├── tsconfig.json
├── package.json
├── docs/                      # Rspress 的文档根，只有这里会被发布
│   ├── index.mdx              # 首页（pageType: home）
│   ├── MISSION.mdx            # 发布于 /MISSION
│   ├── GLOSSARY.mdx           # 发布于 /GLOSSARY
│   ├── lessons/
│   │   ├── 0001-<slug>.mdx
│   │   └── 0002-<slug>.mdx
│   └── reference/
│       └── <slug>.mdx
├── components/                # 全局 MDX 组件（React）
│   ├── quiz.tsx               # → <Quiz>
│   ├── retrieval.tsx          # → <Retrieval>
│   ├── steps.tsx              # → <Steps>
│   ├── step.tsx               # → <Step>
│   └── source.tsx             # → <Source>
├── scripts/
│   ├── sidebar.mjs            # 扫描 docs/ 生成导航与侧边栏
│   └── check.mjs              # course:check 自检脚本
├── styles/course.css          # 共享排版、组件样式、打印规则
├── learning-records/          # 状态，不是内容
│   └── 0001-<slug>.md
├── RESOURCES.md               # 不进站点
└── NOTES.md                   # 不进站点
```

`docs/` 里**只有内容**：页面和页面组。没有任何 `_nav.json`、`_meta.json` 这类结构文件——站点的信息架构在根目录的 `scripts/sidebar.mjs` 里，原因见下文。

### 发布什么，不发布什么

**`docs/` 是唯一的发布边界。** Rspress 只扫描 `root`（默认 `docs`），所以根目录的 `RESOURCES.md`、`NOTES.md`、`learning-records/` 天然不会出现在侧边栏、搜索或构建产物里——不需要额外的排除配置。

不要为了方便把状态文件挪进 `docs/`：一旦进去，它就会被发布、被搜索索引，还会出现在页脚导航里。课程要引用来源时，引原文那一句 + 来源 URL，而不是链到 `RESOURCES.md`。

## Frontmatter

课程页必填：

```yaml
---
title: "读懂一行日志"
description: "一句话：这页讲什么。会被用作页面 meta description。"
reviewAfter: "3d"
---
```

| 键 | 出现在 | 用途 |
| --- | --- | --- |
| `title` | 所有页面 | 页面标题，也是**侧边栏文字**。必填。 |
| `description` | 所有页面 | 一句话摘要。Rspress 会用它生成 `<meta name="description">`，搜索与分享都靠它。必填。 |
| `reviewAfter` | 课程 | 可选，默认 `3d`。多久之后该复习这一课，供 [SKILL.md](./SKILL.md) 的「复习轮」判断到期。 |

首页用 `pageType: home` + `hero` / `features`；课程与速查页保持默认的 `doc` 类型，不用写 `pageType`。

其他可用字段（都有默认值，不需要就别写）：`sidebar: false`、`outline: false`、`footer: false`、`search: false`。

**没有 `lesson`、`order` 字段。** Rspress 的侧边栏按**文件名排序**，顺序由 `0001-`、`0002-` 前缀决定；`title` 自动成为侧边栏文字。所以「编号与文件名一致」不是靠 frontmatter 对照，而是靠文件名本身——`course:check` 会检查编号是否从 1 开始连续递增。

## 导航与侧边栏

**两者都由 `scripts/sidebar.mjs` 扫描 `docs/` 生成**，在 `rspress.config.ts` 的 `themeConfig` 里注册。加课不需要改任何配置：新建 `docs/lessons/0003-xxx.mdx`，它自动出现在侧边栏「课程」组里，文字取该页 frontmatter 的 `title`。

默认形状：

- **顶部导航**：课程 / 速查 / 目标 / 术语表。「课程」永远指向第一课，不随课程数量变化。
- **左侧侧边栏**：三组——「课程」列 `docs/lessons/` 全部，「速查」列 `docs/reference/` 全部，「关于这门课」放学习目标与术语表。
- **全站共用同一份侧边栏**，包括 `/MISSION`、`/GLOSSARY`。从任何一页都能直接跳到任何一课。

`title` 是侧边栏文字的唯一来源，所以它是必填项，不能靠文件名凑。

### 为什么不用 Rspress 自带的 `_nav.json` / `_meta.json`

下面三条都是实测结论，不是推测：

1. **根级 `_meta.json` 在 Rspress 2 里会直接 panic。** 它被当成 v1 遗留的导航配置，源码里叫 `hintNavJsonChangeThenPanic`，命中就 `process.exit(1)`。
2. **只有 `_nav.json` 时，侧边栏按目录切分。** Rspress 给每个子目录生成各自的侧边栏；`docs` 根下的 `MISSION.mdx`、`GLOSSARY.mdx` 不属于任何子目录，点进去左侧一片空白。课程站最不能接受的就是这个——学到第 5 课时看不到速查页，也回不到学习目标。
3. **config 里一旦定义了 `nav` 或 `sidebar`，`_nav.json` 的自动导航就整体失效。** 所以两者不能混用，只能二选一。

结论：**`docs/` 只放内容，信息架构放 `scripts/sidebar.mjs`。** 不要在 `docs/` 下新建 `_nav.json` 或 `_meta.json`，`course:check` 会拦下来。

### 想改结构时

只动 `scripts/sidebar.mjs` 里的两处：

- `buildSidebar()`：三组的顺序与标题。
- `buildNav()`：顶部导航项。

改完 `npm run build` 确认。排序规则是**文件名**，所以课程必须用 `0001-` 这种零填充编号（`10-` 会排在 `2-` 前面）。

## 脚手架

### 先探测

1. 有 `rspress.config.ts` → 站点已存在。
2. `package.json` 的依赖里有 `@rspress/core` 或 `rspress` → 站点已存在。
3. 只有 `.vitepress/` → **这是旧版工作区**，问用户要不要迁移到 Rspress，别直接覆盖。
4. 三者都没有 → 搭脚手架。

### 搭脚手架

从本 skill 的 `templates/` **整份**复制到工作区根目录：

- `package.json`（若工作区没有；有就合并 scripts，不要覆盖已有依赖）
- `tsconfig.json`
- `rspress.config.ts`
- `.gitignore`（工作区已有则不要覆盖）
- `components/*.tsx`
- `styles/course.css`
- `docs/index.mdx`
- `scripts/sidebar.mjs`、`scripts/check.mjs`

`LESSON-TEMPLATE.md` 是写课的参考，放在 skill 根目录而不是 `templates/` 里：`templates/` 会被整份复制进工作区，模板若在里面就会变成一个全是占位符的页面。它也不能被复制进 `docs/lessons/`。

复制完**立刻**替换 `rspress.config.ts` 的 `SITE_TITLE`/`SITE_DESCRIPTION` 和 `docs/index.mdx` 里的占位符，再装依赖：

```bash
npm install
```

依赖版本用 `@rspress/core ^2.0.23`。Rspress 2 要求 Node.js **20.19+ 或 22.12+**，低于这个版本会直接起不来；先 `node -v` 看一眼。

工作区已有 `@rspress/core` 版本范围就沿用，只有完全没有时才用模板里的。没装依赖时用检测到的包管理器：有 `pnpm-lock.yaml` 或 `packageManager` 字段就用 pnpm，否则 npm。安装失败要原样把错误抛给用户，绝不悄悄换包管理器或换大版本。

### 采纳已有站点

先读 `rspress.config.ts` 和 `docs/index.mdx`，再动笔。然后：

- 合并配置：保留用户的 `title`、`description`、`themeConfig` 里的其他字段与插件，只补 `globalStyles`、`markdown.globalComponents`、`themeConfig.nav`、`themeConfig.sidebar`。
- `markdown.globalComponents` 是**数组**：往里追加我们的 5 个组件路径，不要替换掉他们已有的。
- **别覆盖对方已有的 `themeConfig.nav` / `sidebar`。** 如果他们有，先问：是并入我们的课程分组，还是课程另开一个站点。两边都写会打架。
- 如果用户已经有 `theme/` 自定义主题，不要动；我们的组件放在项目根的 `components/`，不冲突。
- 如果站点在别的目录（`root: 'somewhere'`），按他们的 `root` 走：课程页放 `<root>/lessons/`，`rspress.config.ts` 里传给 `buildNav`/`buildSidebar` 的是那个目录，`check.mjs` 里的 `docsDir` 也要指向同一个位置。
- 其他页面别动。`docs/index.mdx` 是唯一可能破坏性的改动（把首页改成课程首页），改之前先问用户。
- **采纳的站点也要能自检**：复制 `templates/scripts/check.mjs` 到 `scripts/check.mjs`，并在 `package.json` 的 `scripts` 里补 `"course:check": "node scripts/check.mjs"`。

合并会丢用户内容时，停下来问。不要假设有版本控制兜底。

## 自检脚本（course:check）

`npm run course:check` 运行 `scripts/check.mjs`，无第三方依赖。它检查：

1. `rspress.config.ts` 与 `docs/index.mdx` 是否残留 `{占位符}`；配置里登记的组件文件是否真的存在。
2. 是否还留着 `.vitepress/` 或 `vitepress` 依赖（旧工作区没迁干净）。
3. 站点结构：`scripts/sidebar.mjs` 是否存在；`rspress.config.ts` 里的 `themeConfig.nav` / `themeConfig.sidebar` 是否还在；`docs/` 下是否误留了 `_meta.json`（会让 Rspress 2 直接退出）或 `_nav.json`（已有 config nav 时它不会生效）。
4. 每个 `docs/lessons/NNNN-*.mdx`：编号是否从 1 连续、`title`/`description` 是否齐全、是否有 `Quiz`/`Retrieval`/`Steps` 之一、是否有 `<Source>`。
5. 课程里的 `<Source url>` 是否登记在 `RESOURCES.md`。
6. 课程里 `/GLOSSARY#anchor` 引用的锚点是否存在。
7. 从 VitePress 带过来的写法：`:options="..."`、属性里的 `\"`、带 `.md`/`.mdx` 扩展名的链接、`.md` 文件——全是错误。

任何一条不过就退出码 1，并逐条打印文件与原因。**这比让用户在构建时报错便宜。**

`check` 不能替代构建：站内死链、MDX 语法错误、组件 props 类型问题只有 `npm run build` 能发现，构建失败时 Rspress 会直接指到文件。

## 组件（Components）

5 个组件在 `rspress.config.ts` 的 `markdown.globalComponents` 里全局注册，课程页里直接写标签，**不用 import**。

**组件名 = 文件名首字母大写**：`quiz.tsx` → `<Quiz>`。这条规则决定了两件事：一个文件只能有一个默认导出；新增组件必须同时改 `rspress.config.ts`，否则标签会被当成普通文本渲染。

界面文案跟随站点 `lang`：`zh-*` 显示中文，其余显示英文。不要在课程里手写这些文案。

### `<Quiz>`

单选或多选，即时判分，可重试。

```mdx
<Quiz
  question="哪个次数区间最匹配增肌？"
  options={['1-3 次', '6-12 次', '15-20 次']}
  answer={1}
  explanation="增肌最依赖中等负荷下接近力竭的训练。"
/>
```

```mdx
<Quiz
  multiple
  question="下面哪两个是容量地标？"
  options={['MEV', 'RPE', 'MRV', '1RM']}
  answer={[0, 2]}
  explanation="MEV 与 MRV 界定了有效容量区间。"
/>
```

Props：`question`（字符串）、`options`（字符串数组，用 `{}` 包住）、`answer`（数字或数字数组）、`multiple`（布尔，默认 false）、`explanation`（字符串，可选）。

注意 `options` 和 `answer` 用的是 JSX 表达式 `{}`，不是 Vue 的 `:options`。写成 `:options="[...]"` 不会报错，只会把整段当成文本渲染出来——`course:check` 会拦下来。

写题规则：选项措辞与长度要平行；正确项的位置在不同课之间要变化；不要「以上都对」；题干里不能出现答案。

**属性值里不要出现未转义的 `"`。** JSX 的双引号字符串到第一个 `"` 就结束了，`question="他喊了 \"hello\""` 会让编译直接失败。题干要引用 JSON 或带引号的代码时，把那段放进前面的代码块、题干里指代它；或者用单引号包属性：`question='他喊了 "hello"'`。

行为约定：单选点击即判分；判分后按钮保留可聚焦性（`aria-disabled`，不是 `disabled`），焦点自动移到反馈区，键盘与读屏用户不会丢失上下文。

### `<Retrieval>`

先凭记忆自由回想，需要时才展开答案。

```mdx
<Retrieval prompt="凭记忆说：三个容量地标分别界定什么？">

MEV 是能增肌的最小量，MAV 是有效的中间区间，MRV 是可恢复的最大量。

</Retrieval>
```

Props：`prompt`（字符串）。子内容是答案，按 markdown 写。**标签与内容之间要留空行**，否则 markdown 不会被解析（MDX 的通则，见下）。

答案在 DOM 里（`display:none`），打印时展开。不要拿它做评判——它是自我核对工具。

### `<Steps>` / `<Step>`

现实世界的引导式序列，每步可勾选。勾选状态存在浏览器里，刷新不丢。

```mdx
<Steps>
<Step title="调整杠铃位置">

小腿中段高度，压在脚掌中部上方。

</Step>
<Step title="建立腹压">

深吸一口气，360 度撑开。

</Step>
</Steps>
```

`<Step>` props：`title`（字符串）。子内容是 markdown 正文。`<Steps>` 不接收 props。

Rspress 自带一个基于标题切分的 `Steps` 组件，**不要在课程里 import 它**——我们注册的同名组件会冲突。用全局注册的这个。

### `<Source>`

每课恰好一个主要来源，放在靠前位置。

```mdx
<Source
  title="The Twelve-Factor App"
  url="https://12factor.net/logs"
  author="Adam Wiggins"
  note="开课前先读 Logs 一节。"
/>
```

Props：`title`、`url`（必填），`author`、`note`（可选）。`url` 必须已登记在 `RESOURCES.md`。

### MDX 的两条硬规则

1. **JSX 里的 markdown 要留空行。** `<Step title="…">` 后面空一行，正文才按 markdown 解析；紧贴着写会变成纯文本。
2. **不要在 JSX 里嵌 HTML 标签写样式。** 需要视觉差异就改 `course.css`。

### 新增组件

1. 在 `components/` 下写一个 `.tsx`，默认导出，文件名即组件名（`callout.tsx` → `<Callout>`）。
2. 在 `rspress.config.ts` 的 `markdown.globalComponents` 数组里追加 `path.join(here, 'components/callout.tsx')`。
3. 在 `course.css` 里用 `sl-` 前缀配样式，颜色走 Rspress CSS 变量（`--rp-c-bg-soft`、`--rp-c-divider`、`--rp-c-brand`、`--rp-c-text-2`），保证明暗主题都对。
4. 加打印规则：隐藏控件，展开答案内容。
5. 在本文件里记录 props。
6. 保持 SSR 安全——规则见 `SKILL.md`。

## 样式

`course.css` 通过 `globalStyles` 注入，给全站设了衬线阅读字体，因为这个站点是课程，不是产品官网。课程正文里不要写内联样式和 `<style>` 块；可复用的东西属于样式表。

打印是速查页的一等目标，`course.css` 里已经写好：

- 隐藏导航、侧边栏、右栏目录、页脚。
- 展开 `<Retrieval>` 的答案。
- `<Quiz>` 标出正确项，而不是显示按钮。
- 外链在链接文字后面打印 URL。

改过样式表之后，用浏览器的打印预览检查一页速查。

## 起服务

```bash
npm run dev                 # 或 pnpm dev
npm run dev -- --port 5180  # 端口被占时显式指定，别杀别人的进程
```

起服务前先看这个工作区是不是已经在跑了（dev server 会打印 `Local: http://localhost:<port>`，默认 3000）。已经在跑就复用，把课程路由给用户；不要另开一个端口。

dev 下路由不带扩展名：`/lessons/0007-reading-a-log-line`、`/GLOSSARY`、`/reference/volume-landmarks`。带 `.html` 也能打开，但**对外给链接一律用不带扩展名的形式**。

## 构建与部署

```bash
npm run build      # 产物在 doc_build/
npm run preview    # 本地预览构建产物
```

构建和 dev server 可以同时跑，不需要先停服务。

Rspress 会在构建时检查站内链接：指向**不存在页面**的链接会让构建**失败**，报错里直接给出文件。所以「构建过」基本等于「站内没有断链」。

但**锚点不在检查范围里**：`[术语](/GLOSSARY#typo)` 这种页面存在、锚点写错的链接能构建通过，只有 `course:check` 会拦下来。别把构建当成万能校验。

发布到子路径（GitHub Pages 这类）：

```bash
DOCS_BASE=/learn-rust/ npm run build
```

PowerShell：

```powershell
$env:DOCS_BASE="/learn-rust/"; npm run build
```

`rspress.config.ts` 里已经写成 `base: process.env.DOCS_BASE || '/'`。**要用配置里的 `base`，不要用 CLI 的 `--base`**：命令行参数只改静态资源前缀，页面之间的链接仍然是根路径，部署到子路径会 404——这一点实测过，别被它骗了。

**Git Bash 的坑**：MSYS 会把以 `/` 开头的环境变量值当作路径转换（`/learn-rust/` 会变成 `C:/Program Files/Git/learn-rust/`）。在 Git Bash 里要加 `MSYS_NO_PATHCONV=1`，或者直接用 PowerShell 构建。
