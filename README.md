# study-loop

把「我想学会 X」变成一门只属于你的课。

不是给你一篇教程，而是给你一个**有状态的学习站点**：先问清你为什么学，再拆成 15 分钟一节的课程，每节带测验和检索练习，隔几天回来还会先考你旧课。学到的东西留在一个能随时回看、能打印、能分享的网站上。

> Teach any topic as a stateful course workspace: mission-driven, 15-minute lessons, retrieval practice, spaced review, and a VitePress site you keep.

## 安装

```bash
# 安装到当前项目（推荐，课程文件和站点都留在项目里）
npx skills add heappynd/study-loop

# 全局安装，所有项目可用
npx skills add heappynd/study-loop -g

# 指定 agent，非交互
npx skills add heappynd/study-loop -a claude-code -y

# 只看仓库里有什么，不安装
npx skills add heappynd/study-loop --list
```

需要 Node.js 22.20+（`npx skills` 的要求）。安装后在你的 agent 里说「我想学 Rust」，或显式调用 `study-loop`。

## 它怎么教

**1. 先审问目标，再动笔。** 说「我想了解一下 Kubernetes」会被拒绝，因为这种目标无法检验，课程也没有落点。它要的是「下个月能独立把服务部署上 K8s」。

**2. 一节课一个胜利。** 每节 15 分钟内能做完，只比当前水平高一点点（最近发展区）。没有「本章小结」，每节课结束时你手上会多一个能跑、能看、能用的东西。

**3. 只读不算学会。** 每节课必须含一次**费力回忆**：先合上答案自己写，再对答案。区分 fluency（当场想得起来，会带来虚假的掌握感）和 storage（长期记得住），课程为后者设计。

**4. 隔几天回来先考旧课。** 每节课带 `reviewAfter`（默认 3 天），下次开课前按到期日先跑一遍旧课的测验，再教新的。这是原版教学法里最容易被忽略、也最有效的一环。

**5. 事实必须来自可信来源。** 开课前先在 `RESOURCES.md` 里列好官方文档与社区，课程里逐条标注引用。**不信任模型的记忆**——版本号、默认值、破坏性变更一律现查。

## 它会在你的工作区里建什么

```
my-topic/
├── MISSION.md                  # 为什么学，以及可检验的成功标准（发布在 /MISSION）
├── lessons/
│   └── 0001-first-step.md      # 一节一个目标（发布在 /lessons/0001-first-step）
├── reference/                  # 速查表，为快速查阅而生，可打印
├── learning-records/           # 你已掌握什么、证据是什么（不发布）
├── GLOSSARY.md                 # 本课程统一术语（发布在 /GLOSSARY）
├── RESOURCES.md                # 可信来源清单（不发布）
├── NOTES.md                    # 你的偏好与教学笔记（不发布）
└── .vitepress/                 # 站点配置与 5 个交互组件
```

课程是**网站**，不是一堆 markdown 文件。永远不需要你去打开 `.md` 源文件——agent 会起 dev server 把页面打开给你。

## 交互组件

| 组件 | 作用 |
| --- | --- |
| `<Quiz>` | 单选测验，选项等长、正确项位置分散；判分后焦点移到反馈区，键盘和读屏可用 |
| `<Retrieval>` | 空白回忆：先写，再展开对照 |
| `<Steps>` / `<Step>` | 动手步骤，带失败排查；勾选状态刷新后保留 |
| `<Source>` | 标注权威来源，附链接 |

## 自检

工作区自带零依赖检查脚本，把「文档里写了但没人执行」的规则变成硬错误：

```bash
npm run course:check
```

会拦下这些：站点标题还是占位符、课程编号与文件名不一致、缺必需 frontmatter、整节课没有任何费力互动、缺来源、来源没登记在 `RESOURCES.md`、术语锚点不存在、新课程没加进首页索引、Quiz 属性里写了会截断解析的转义引号。

## 环境要求

- Node.js 22.20+（`npx skills` 要求）；课程工作区本身只需 Node 18+（VitePress 1.6）
- 首次搭建需要联网安装 `vitepress`
- 站点构建通过后才算交付：`npm run docs:build`

> 构建前必须先停掉 dev server，否则 VitePress 清理 `dist` 会失败。这条已经写进 skill 的完成标准。

## 仓库结构

```
study-loop/
├── README.md
├── LICENSE
└── skills/
    └── study-loop/
        ├── SKILL.md                  # 入口：教学哲学与执行流程
        ├── SITE-FORMAT.md            # 目录结构、frontmatter 契约、组件 API
        ├── MISSION-FORMAT.md         # 目标怎么写才算可检验
        ├── RESOURCES-FORMAT.md       # 来源清单规范
        ├── GLOSSARY-FORMAT.md        # 术语表规范
        ├── LEARNING-RECORD-FORMAT.md # 学习记录与证据规范
        ├── LESSON-TEMPLATE.md        # 写课起手模板
        ├── templates/                # 站点脚手架（配置、主题、组件、自检脚本）
        └── agents/openai.yaml
```

`skills/study-loop/` 是完整可移植的技能目录，也可以直接 `cp -r` 到 `~/.claude/skills/` 或 `.agents/skills/`。

## 设计取向

- **一个工作区一个 mission。** 两个不相关的主题是两个工作区；混在一起，课程就没有落点。
- **不覆盖已有内容。** 目录里已经有应用或另一门课时，先停下来问，而不是合并或替换。
- **覆盖率不等于学会。** `learning-records/` 只在有证据（答对了哪道题、做出了哪个东西）时才写。
- **站点属于用户。** 课程文件是普通的 markdown + Vue 组件，随时可以改、可以带走、可以发到自己的域名。

## License

[MIT](./LICENSE)
