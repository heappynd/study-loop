# 工作区格式（VitePress）

教学工作区**就是**一个 VitePress 站点。这份文件是契约：哪些内容会发布、文件放哪、frontmatter 有哪些必填项、侧边栏怎么自动生成、共享组件怎么用。

下面的路径都相对工作区根目录，它同时也是 VitePress 的文档根。**不要**再引入 `docs/` 或 `srcDir` 层级。

## 目录结构

```
.
├── .vitepress/
│   ├── config.ts              # 站点配置 + 自动生成的侧边栏
│   └── theme/
│       ├── index.ts           # 继承默认主题，全局注册组件
│       ├── styles/course.css  # 共享排版、组件样式、打印规则
│       └── components/
│           ├── Quiz.vue
│           ├── Retrieval.vue
│           ├── Steps.vue
│           ├── Step.vue
│           └── Source.vue
├── scripts/check.mjs          # course:check 自检脚本
├── lessons/
│   ├── 0001-<slug>.md
│   └── 0002-<slug>.md
├── reference/
│   └── <slug>.md
├── learning-records/          # 状态，不是内容
│   └── 0001-<slug>.md
├── MISSION.md                 # 发布于 /MISSION
├── GLOSSARY.md                # 发布于 /GLOSSARY
├── RESOURCES.md               # 不进站点
├── NOTES.md                   # 不进站点
├── index.md                   # 课程首页
└── package.json
```

### 发布什么，不发布什么

发布：`index.md`、`MISSION.md`、`GLOSSARY.md`、`lessons/**`、`reference/**`。

不发布（配置里的 `srcExclude`）：`RESOURCES.md`、`NOTES.md`、`learning-records/**`。这些是给 agent 看的状态，不能出现在侧边栏、搜索或构建产物里。

不要为了方便把状态文件挪进发布区。课程要引用来源时，引原文那一句 + 来源 URL，而不是链到 `RESOURCES.md`。

## Frontmatter

课程页必填：

```yaml
---
title: "读懂一行日志"
lesson: 7
summary: "一句话，首页与侧边栏可复用。"
reviewAfter: "3d"
sources:
  - title: "The Twelve-Factor App"
    url: "https://12factor.net/logs"
    author: "Adam Wiggins"
    note: "开课前先读 Logs 一节。"
---
```

| 键 | 出现在 | 用途 |
| --- | --- | --- |
| `title` | 所有页面 | 侧边栏文字与页面标题。必填。 |
| `lesson` | 课程 | 整数。侧边栏排序依据，必须与文件名开头的数字一致（`index.md` 除外）。 |
| `order` | 速查页 | 可选整数。不写则取文件名开头的数字。 |
| `summary` | 课程、速查页 | 一句话。首页与 agent 判断「下一课学什么」时用。 |
| `reviewAfter` | 课程 | 可选，默认 `3d`。多久之后该复习这一课，供 [SKILL.md](./SKILL.md) 的「复习轮」判断到期。 |
| `sources` | 课程 | 主要来源与引用，必须全部登记在 `RESOURCES.md`。 |

`lesson: 7` 与 `0007-<slug>.md` 必须一致——`course:check` 会把它当成错误拦下来，别指望构建去发现。

其他键（`outline: deep`、`aside: false`、`prev: false`）属于 VitePress，不在这份契约里。

## 侧边栏

侧边栏在配置加载时扫描文件系统生成。没有清单要维护，加课不需要额外步骤。

规则：

- `lessons/` 按 `lesson` 排序，缺省取 `order`，再缺省取文件名开头的数字。
- `reference/` 按 `order` 排序（缺省取文件名数字），再按标题。
- `lessons/` 或 `reference/` 里的 `index.md` 不进列表，它是该分区的落地页。
- 以 `_` 开头的文件跳过：草稿用 `_draft.md`。
- 空分区自动省略，所以一个还没有课程的新工作区也能构建。
- `GLOSSARY.md` 存在时追加到 Reference 分区末尾。
- `MISSION` 常驻导航栏。

要手工分组，就把 `config.ts` 里生成的那一组替换成手写数组。**不要**在生成结果旁边再挂一份手写列表——会重复。

## 脚手架

### 先探测

1. `package.json` 的依赖里有 `vitepress` → 站点已存在。
2. `.vitepress/config.ts`（或 `docs/.vitepress/config.ts`）→ 站点已存在，即使没有 lock 文件。
3. 两者都没有 → 搭脚手架。

### 搭脚手架

从本 skill 的 `templates/` 复制这些：

- `templates/package.json`（若工作区没有 package.json）
- `templates/.gitignore`（若工作区没有 .gitignore）
- `templates/.vitepress/config.ts`
- `templates/.vitepress/theme/index.ts`
- `templates/.vitepress/theme/styles/course.css`
- `templates/.vitepress/theme/components/*.vue`
- `templates/scripts/check.mjs`
- `templates/index.md`（复制后**立刻**替换占位符）

`LESSON-TEMPLATE.md` 是写课的参考，放在 skill 根目录而不是 `templates/` 里：`templates/` 会被整份复制进工作区，模板若在里面就会变成一个全是占位符的页面。它也不能被复制进 `lessons/`。

依赖版本用 `vitepress ^1.6.4`。**不要**写成 `^2.0.0`：2.x 目前只有 `2.0.0-alpha`，`^2.0.0` 在 npm 上解析不到，`npm install` 会直接 404 失败。

没装依赖时用检测到的包管理器装：有 `pnpm-lock.yaml` 或 `packageManager` 字段就用 pnpm，否则 npm。工作区已有 vitepress 版本范围就沿用，只有完全没有时才自己挑。安装失败要原样把错误抛给用户，绝不悄悄换包管理器或换大版本。

`.gitignore` 已经在模板里（`templates/.gitignore`），复制过去即可；工作区已有则不要覆盖。

### 采纳已有站点

先读 `.vitepress/config.ts` 和 `index.md`，再动笔。然后：

- 合并 `themeConfig`（保留用户的导航、标题、描述、社交链接）。
- 合并 `srcExclude`，不是替换数组。
- 加主题与组件注册时不要覆盖已有的 `.vitepress/theme/index.ts`：导入并 re-export 他们的主题，再在 `enhanceApp` 里补组件。
- 其他页面别动。`index.md` 是唯一可能破坏性的改动（把首页改成课程首页），改之前先问用户。
- 如果站点在 `docs/` 子目录下（很常见），不要把它挪到根目录：在那个目录里工作（`course:check` 也必须在文档根执行），或者显式调整 `config.ts` 里的 `root`。
- **采纳的站点也要能自检**：复制 `templates/scripts/check.mjs` 到 `scripts/check.mjs`，并在 `package.json` 的 `scripts` 里补 `"course:check": "node scripts/check.mjs"`。否则完成标准里的 `npm run course:check` 对这站点是不可能满足的。

合并会丢用户内容时，停下来问。不要假设有版本控制兜底。

## 自检脚本（course:check）

`npm run course:check` 运行 `scripts/check.mjs`，无第三方依赖。它检查：

1. `config.ts` 与 `index.md` 中是否残留 `{占位符}`。
2. 每个 `lessons/NNNN-*.md`：`lesson` 是否等于文件名数字、`title`/`summary` 是否齐全、是否至少有 `Quiz`/`Retrieval`/`Steps` 之一、是否有 `<Source`。
3. 课程里 `<Source url="...">` 与 frontmatter `sources[].url` 是否都登记在 `RESOURCES.md`。
4. 课程里 `/GLOSSARY#anchor` 引用的锚点在 `GLOSSARY.md` 里是否存在。
5. 每节课是否已出现在 `index.md` 的链接里。

任何一条不过就退出码 1，并逐条打印文件与原因。**这比让用户在构建时报错便宜。**

## 组件（Components）

所有组件在 `.vitepress/theme/index.ts` 全局注册，课程页里直接写标签，不用 import。

界面文案跟随站点 `lang`：`zh-*` 显示中文，其余显示英文。不要在课程里手写这些文案。

### `<Quiz>`

单选或多选，即时判分，可重试。

```md
<Quiz
  question="哪个次数区间最匹配增肌？"
  :options="['1-3 次', '6-12 次', '15-20 次']"
  :answer="1"
  explanation="增肌最依赖中等负荷下接近力竭的训练。"
/>
```

```md
<Quiz
  multiple
  question="下面哪两个是容量地标？"
  :options="['MEV', 'RPE', 'MRV', '1RM']"
  :answer="[0, 2]"
  explanation="MEV 与 MRV 界定了有效容量区间。"
/>
```

Props：`question`（字符串）、`options`（字符串数组）、`answer`（数字或数字数组）、`multiple`（布尔，默认 false）、`explanation`（字符串，可选）。

写题规则：选项措辞与长度要平行；正确项的位置在不同课之间要变化；不要「以上都对」；题干里不能出现答案。

**属性里不要出现双引号。** `question="…"` 里再写 `\"` 这种转义，Vue 模板解析会直接失败（`Attribute name cannot contain U+0022`）。题干要引用 JSON 时，把 JSON 放进前面的代码块，题干里指代它；或者用单引号包属性：`question='…"…'`。`course:check` 会把裸的 `\"` 当错误拦下来。

行为约定：单选点击即判分；判分后按钮保留可聚焦性（`aria-disabled`，不是 `disabled`），焦点自动移到反馈区，键盘与读屏用户不会丢失上下文。

### `<Retrieval>`

先凭记忆自由回想，需要时才展开答案。

```md
<Retrieval prompt="凭记忆说：三个容量地标分别界定什么？">

MEV 是能增肌的最小量，MAV 是有效的中间区间，MRV 是可恢复的最大量。

</Retrieval>
```

Props：`prompt`（字符串）。默认插槽：答案，按 markdown 写。**标签与内容之间要留空行**，否则 markdown 不会被解析。

答案在 DOM 里（`display:none`），打印时展开。不要拿它做评判——它是自我核对工具。

### `<Steps>` / `<Step>`

现实世界的引导式序列，每步可勾选。勾选状态存在浏览器里，刷新不丢。

```md
<Steps>
  <Step title="调整杠铃位置">

  小腿中段高度，压在脚掌中部上方。

  </Step>
  <Step title="建立腹压">

  深吸一口气，360 度撑开。

  </Step>
</Steps>
```

`<Step>` props：`title`（字符串）。插槽：markdown 正文。`<Steps>` 不接收 props。

### `<Source>`

每课恰好一个主要来源，放在靠前位置。

```md
<Source
  title="The Twelve-Factor App"
  url="https://12factor.net/logs"
  author="Adam Wiggins"
  note="开课前先读 Logs 一节。"
/>
```

Props：`title`、`url`（必填），`author`、`note`（可选）。`url` 必须已登记在 `RESOURCES.md`。

### 新增组件

1. 写到 `.vitepress/theme/components/`。
2. 在 `.vitepress/theme/index.ts` 注册。
3. 在 `course.css` 里用 `tbp-` 前缀配样式，颜色走 VitePress CSS 变量（`--vp-c-bg-soft`、`--vp-c-divider`、`--vp-c-brand-1`），保证明暗主题都对。
4. 加打印规则：隐藏控件，展开答案内容。
5. 在本文件里记录 props。
6. 保持 SSR 安全——规则见 `SKILL.md`。

## 样式

`course.css` 给全站设了衬线阅读字体，因为这个站点是课程，不是产品官网。课程正文里不要写内联样式和 `<style>` 块；可复用的东西属于样式表。

打印是速查页的一等目标：

- 隐藏 Chrome（导航、侧边栏、侧注、页脚、本地导航、「编辑此页」）。
- 展开 `<Retrieval>` 的答案。
- `<Quiz>` 标出正确项，而不是显示按钮。
- 外链在链接文字后面打印 URL。

改过样式表之后，用浏览器的打印预览检查一页速查。

## 起服务

```bash
npm run docs:dev      # 或 pnpm docs:dev
```

起服务前先看这个工作区是不是已经在跑了（dev server 会打印 `localhost:<port>`，默认 5173）。已经在跑就复用它，把课程路由给用户；不要另开一个端口。

VitePress 用干净路由：`/lessons/0007-reading-a-log-line`、`/GLOSSARY`、`/reference/volume-landmarks`。链接一律用路由，不要写 `.md` 文件名，这样换 URL 策略时不会断。

端口被别的项目占了，就显式指定端口（`npm run docs:dev -- --port 5180`），不要杀别人的进程。

## 部署到子路径

要发布到 GitHub Pages 这类子路径站点时，`config.ts` 已经支持用环境变量切换：

```bash
DOCS_BASE=/learn-rust/ npm run docs:build
```

PowerShell：

```powershell
$env:DOCS_BASE="/learn-rust/"; npm run docs:build
```

不设 `base` 就部署到子路径，静态资源会 404。

**Git Bash 的坑**：MSYS 会把以 `/` 开头的环境变量值当作路径转换（`/learn-rust/` 会变成 `C:/Program Files/Git/learn-rust/`）。在 Git Bash 里要加 `MSYS_NO_PATHCONV=1`，或者直接用 PowerShell 构建。
