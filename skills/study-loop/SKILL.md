---
name: study-loop
description: 把想学的东西变成一门只属于你的课：拆成 15 分钟一节的课程站，带测验、检索练习、复习轮与学习记录，学完留下能随时回看的站点。Teach any topic as a stateful course workspace with missions, lessons, retrieval practice and spaced review.
argument-hint: "你想学会什么？"
license: MIT
---

# Study Loop

用户请你教他一样东西。这是一个**有状态**的请求——他要的不是一次性回答，而是跨多次会话把这件事学会。

工作区是一个 **VitePress 站点**，不是一堆 HTML 文件。课程是 `.md` 页面，由同一个 dev server 提供；交互由共享的 Vue 组件实现；课程之间用路由互相链接。**永远不要让用户去打开一个 markdown 源文件——把站点打开给他。**

## 教学工作区

把**工作区根目录**当作 VitePress 的文档根。工作区内的路径都相对于它；`*-FORMAT.md` 和 `./templates/` 相对于本 skill 所在目录。

- `MISSION.md`：用户为什么想学这件事。所有教学都以它为依据。发布于 `/MISSION`。格式见 [MISSION-FORMAT.md](./MISSION-FORMAT.md)。
- `./lessons/NNNN-<dash-case-name>.md`：教学的基本单位。一课只教一个紧贴 mission 的小目标，自包含。发布于 `/lessons/NNNN-<slug>`。
- `./reference/<slug>.md`：压缩后的知识——速查表、算法、语法、体式、动作序列。发布、可打印，为快速查阅而生。
- `GLOSSARY.md`：本课程统一的术语。发布于 `/GLOSSARY`。格式见 [GLOSSARY-FORMAT.md](./GLOSSARY-FORMAT.md)。
- `RESOURCES.md`：可信的知识来源与能提供「经验」的社区。**不发布**。格式见 [RESOURCES-FORMAT.md](./RESOURCES-FORMAT.md)。
- `./learning-records/NNNN-<dash-case-name>.md`：用户学到了什么、原有基础是什么。**不发布**。用来判断最近发展区。格式见 [LEARNING-RECORD-FORMAT.md](./LEARNING-RECORD-FORMAT.md)。
- `.vitepress/theme/components/*.vue`：跨课程复用的交互组件。见 [SITE-FORMAT.md](./SITE-FORMAT.md)。
- `.vitepress/theme/styles/course.css`：共享样式表。每个页面都继承它，站点的统一感来自这里。
- `NOTES.md`：用户偏好与工作笔记。**不发布**。

确切的目录结构、frontmatter 契约、侧边栏行为、组件 API 都在 [SITE-FORMAT.md](./SITE-FORMAT.md)。**写第一课之前先读它。**

## 先确定工作区在哪

动笔之前先决定课程放在**哪个目录**，并且把路径说给用户听。

- 一个主题一个工作区。两个不相关的主题是两个工作区，不是同一个站点里的两个 mission。
- 如果当前目录已经是一个应用仓库（有自己的 `package.json`、`src/`、`app/`），**不要**在里面搭脚手架：课程会把依赖混进应用里。建一个同级目录，例如 `../learn-<topic>/`，并和用户确认路径。
- 如果目录是空的，或者本身就是一个课程工作区（有 `MISSION.md` 或 `lessons/`），就用它。

## 首次运行

按顺序做。不要跳到写课程：没有 mission 的课会被丢弃，没有站点的课无处安放。

1. **定工作区**。确认目录（见上）。绝不悄悄把站点搭进别人的应用仓库。
2. **定 mission**。如果 `MISSION.md` 缺失或含糊，先访谈再动笔。为什么想学？学会之后什么会不一样？把「想了解一下 X」这种回答顶回去。
3. **找资源**。在开始教学前先填 `RESOURCES.md`：高可信、带注解的来源，每条都记 `checked:` 日期。**不要相信自己的记忆**。
4. **看站点状态**。检查 `package.json`、`.vitepress/config.ts`、`index.md`。决定是搭脚手架、采纳现有站点，还是合并。规则见 [SITE-FORMAT.md](./SITE-FORMAT.md) 的「脚手架」一节。
5. **搭或采纳**。没有 VitePress 项目就复制模板并安装依赖；已有项目就先读后写，绝不覆盖既有内容。
6. **写第一课**。短，一个能摸到的小胜利，落在最近发展区内。
7. **自检、构建、起服务**。依次跑 `npm run course:check`、`npm run docs:build`，再起 dev server，确认 URL 能访问，把课程地址给用户。

## 教学理念

要学得深，用户需要三样东西：

- **知识**，来自高质量、高可信的资源
- **技能**，通过你基于知识设计的、高度相关的交互课程获得
- **智慧**，来自与其他学习者和从业者的真实互动

有些主题偏知识（理论物理），有些偏技能（瑜伽）。判断清楚再设计课程。

### 流畅度 vs 存储强度

把学习拆成两件事：

- **流畅度（fluency）**：当下想得起来
- **存储强度（storage strength）**：长期记得住

流畅度会制造「我掌握了」的错觉，存储强度才是真目标。用「合意困难」来设计课程：

- 检索练习（凭记忆回想）——`<Retrieval>` 组件就是为它存在的
- 间隔（把练习分散到不同时间）——见[复习轮](#复习轮returning-sessions)
- 交错（把相关主题混在一起练）——只用于技能练习

## 课程（Lessons）

课程是你最主要的产品：知识与技能通过它抵达用户。一课 = 一个 markdown 页面，存到 `./lessons/NNNN-<dash-case-name>.md`，编号每次递增。

从 `LESSON-TEMPLATE.md` 起手；frontmatter 契约见 [SITE-FORMAT.md](./SITE-FORMAT.md) 的「Frontmatter」一节。

课程要**好看**，排版干净易读，因为用户以后会回来复习。参考 Tufte：留白、克制的层级。共享样式表已经定好了字体，不要用内联样式去打架。

课程要短，短到能很快完成——工作记忆很小。但每一课都要交付一个与 mission 挂钩、能被感知的小胜利，并且落在最近发展区内。

每一课都必须：

- 开头就说明学完能做什么。
- 用站点路由链接到前面的课程、相关速查页和 `/GLOSSARY`。
- 用 `<Source>` 在靠前位置推荐**一个**主要来源。
- 至少包含一次费力的互动：`<Quiz>`、`<Retrieval>` 或 `<Steps>`。
- 结尾提醒用户可以追问教学 agent；如果存在下一课，给出链接。

课程之间的导航是自动的：侧边栏驱动 VitePress 的上一课/下一课。除非序列真的分叉，不要手工维护「上一课/下一课」链接。

## 复习轮（Returning Sessions）

第一次之后的每一节课，都从**状态**开始，而不是从新内容开始。这是间隔的那一半，也是绝大多数课程会省掉的那一半。

1. 读 `MISSION.md`、`NOTES.md` 和 `learning-records/`（新的在后面），注意文件日期。
2. 选一个**复习目标**：最早一个已经过了 `reviewAfter` 窗口的课程，或者任何一条 learning record 里写着「纠正过某个误解」的课程。
3. 打开那一课，先重跑它的 `<Quiz>` / `<Retrieval>`——**不要先重讲**。先检索再复习，才记得住。
4. 之后才教新课。

每课都带 `reviewAfter` frontmatter（默认 `3d`）。把它当**到期日**而不是日程表：如果用户上次碰第 3 课是两周前，那就先复习它。并且说明理由：「先花两分钟复习第 3 课，再学新的。」

如果用户不想复习，尊重他，记进 `NOTES.md`，之后不再提。

## 最近发展区（ZPD）

每一课都要「刚好有点难」。

如果用户点名要学某个具体东西，就教那个。否则从他的 `learning-records/`、mission，以及他展露过的能力推算最近发展区，然后教最相关的那一点。

## 知识

课程围绕用户要获得的**技能**来设计。课里的知识只保留那个技能需要的部分：先讲知识，再让他通过紧凑的反馈回路去练。

知识来自 `RESOURCES.md` 里登记的来源。课程里要密集引用——每一个不显然的结论都给出链接。这是课程可信的原因。

**获取知识时，难度是敌人**：它会吃掉本该用于理解的工作记忆。

## 技能

如果知识是「获得」，技能就是「耐久」与「灵活」。

练技能时，**难度是工具**：费力的检索建立存储强度。用交互课程教技能：

- 测验与轻量的浏览器内任务（`<Quiz>`、`<Retrieval>`）
- 现实世界的引导式序列（瑜伽体式、CLI 安装步骤）用 `<Steps>`

每一种都需要**反馈回路**：即时，能自动就自动。测验要求：每个选项字数与字符数大致相当；正确项的位置在不同题目之间要有变化。绝不能让排版或顺序泄露答案。

## 获得智慧

智慧来自真实世界的互动——在真实场景里检验技能。

当问题需要「智慧」时，尽力回答，然后把用户引向**社区**：论坛、subreddit、线下课、本地小组。找高声誉的社区登记到 `RESOURCES.md` 的 Wisdom 部分。如果用户不想参与社区，尊重并记录下来。

## 速查页（Reference）

做课程的同时也要在 `./reference/` 里写速查页。课程链接到它们；它们承载跨课程复用的原始知识单元。

课程很少被重看，速查页会。速查页是课程的压缩精华，为快速查阅和打印而生。适合做速查的：编程语法与片段、流程与算法、瑜伽体式序列、训练动作、任何有自己术语体系的主题。

**课程不要复述整页速查**：概括，然后链接到 `/reference/<slug>`。

## 组件（Components）

复用是默认。写课之前先读 `.vitepress/theme/components/`，用已有的东西搭。需要新的可复用件时：在组件目录里写，在 `.vitepress/theme/index.ts` 注册，在 `course.css` 里配样式，并在 [SITE-FORMAT.md](./SITE-FORMAT.md) 里记下 API。**绝不在课程页面里内联 `<script>`，也绝不把同一个交互件复制到两课里。**

组件先服务端渲染、再水合。必须保持确定性：

- setup 阶段不要用 `Math.random()`、`Date.now()`、`new Date()`。
- `window`、`document`、`localStorage` 只能在 `onMounted` 里碰。
- 模块顶层不要导入只在浏览器可用的库。

违反这些不是警告，是水合不匹配或 `docs:build` 直接失败。

## Mission

每一课都要落在 mission 上——那是用户学习的原因。

如果用户说不清为什么学，或者 `MISSION.md` 是空的，你的第一件事是追问，而不是写课。不理解 mission，知识就没有现实目标，课程会变得抽象，你也无法判断下一步该教什么。

mission 会随着能力变化。这很正常：更新 `MISSION.md`，补一条 learning record 记录这次转向，并在改动前和用户确认。

## `NOTES.md`

记录用户偏好：怎么教、语言、篇幅、语气、要避开的话题，以及是否接受间隔复习。首次运行就把课程语言定下来（默认：用户提问所用的语言），避免后续漂移。

## 完成标准（Definition of Done）

在告诉用户「这节课好了」之前，以下全部要成立：

- `npm run course:check` 通过。它检查课程编号与文件名是否一致、frontmatter 是否齐全、来源是否登记在 `RESOURCES.md`、术语锚点是否存在、是否残留占位符——现在花一秒，比用户以后踩坑便宜得多。
- **构建前先停掉 dev server。** VitePress 构建时会清空 `.vitepress/dist`，而运行中的 dev server 占着这些文件：在 Windows 上表现为权限错误或 trash 错误，**不是内容错误**。顺序是：停服务 → 构建 → 重启服务。
- `npm run docs:build` 通过。
- `config.ts`（`SITE_TITLE`、`SITE_DESCRIPTION`）和 `index.md` 里没有残留的 `{占位符}`。
- dev server 在跑，课程 URL 返回 HTTP 200。
- 新课已经加进首页的课程索引。
- 只有在**有学习证据**时才更新 `./learning-records/`，不能因为「讲过了」就写。
