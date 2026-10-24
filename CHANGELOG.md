# 变更记录

## 2.0.0 — 2026-10-24

站点层从 VitePress 换成 **Rspress 2**。技能 API（mission、课程、复习轮、learning record）不变，工作区布局变了。

**破坏性变更**

- 文档根从「工作区根目录」变成 **`docs/`**：`MISSION.mdx`、`GLOSSARY.mdx`、`lessons/`、`reference/`、`index.mdx` 全部移进 `docs/`。
- 课程文件从 `.md` 变成 **`.mdx`**（要写 JSX 组件），frontmatter 里去掉 `lesson`、`summary`、`sources`，改用 `title` + `description`。顺序只由文件名编号决定。
- 组件从 Vue 换成 **React/TSX**，props 语法从 `:options="[...]"` 变成 `options={[...]}`。
- 命令改名：`docs:dev` / `docs:build` → `dev` / `build`，产物目录 `.vitepress/dist` → `doc_build`。

**去掉的复杂度**

- 不再需要自动扫描生成侧边栏：Rspress 按目录和文件名自动生成，加课零配置。
- 不再需要 `theme/index.ts` 注册组件：改用 `markdown.globalComponents`，组件名由文件名决定。
- 不再需要「先停 dev server 再构建」：两者可以并行。
- 不再需要 `.vitepress` 目录。

**自检脚本新增的拦截**

- `.vitepress/` 残留、`vitepress` 依赖残留。
- 导航 `_nav.json` 的链接指向不存在的页面、缺少「课程」入口。
- 课程编号不连续（不只是「与 frontmatter 不一致」）。
- VitePress 写法残留：`:options="..."`、带 `.md`/`.mdx` 扩展名的链接、`.md` 文件。

## 1.0.0 — 2026-10-23

从 `teach-by-vitepress` 改名并中文化。

- 修复脚手架 `vitepress: ^2.0.0` 装不上（npm 上只有 alpha）：改为 `^1.6.4`。
- 修复侧边栏没有按 `lesson` 字段排序（实现只读 `order`）。
- 修复术语表「粗体自动生成锚点」的错误说法，改为手写 `{#slug}` 并由脚本校验。
- 新增 `scripts/check.mjs`（`course:check`），把文档里的约定变成硬错误。
- 组件文案跟随 `lang` 中英切换；Quiz 判分后保留焦点；Step 勾选持久化。
- 补上「复习轮」流程与 `reviewAfter` 约定——原版只说理念，没有机制。
