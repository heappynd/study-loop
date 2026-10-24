import path from 'node:path';
import { defineConfig } from '@rspress/core';
import { buildNav, buildSidebar } from './scripts/sidebar.mjs';

// 搭好脚手架后第一件事：把这两个占位符换成这门课的真实标题与一句话说明。
const SITE_TITLE = '{主题}';
const SITE_DESCRIPTION = '{一句话说明这门课教什么}';

const here = import.meta.dirname;
const docsDir = path.join(here, 'docs');

export default defineConfig({
  // 内容放在 docs/，产物在 doc_build/。
  // RESOURCES.md、NOTES.md、learning-records/ 在 docs/ 之外，所以永远不会被发布。
  root: 'docs',
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  lang: 'zh',
  // 发布到 GitHub Pages 这类子路径时，构建前设 DOCS_BASE=/仓库名/。
  // 不要用 CLI 的 --base：它只改静态资源前缀，页面之间的链接仍是根路径。
  base: process.env.DOCS_BASE || '/',
  globalStyles: path.join(here, 'styles/course.css'),
  markdown: {
    // 一个文件一个默认导出，组件名 = 文件名首字母大写（quiz.tsx → <Quiz>）。
    // 登记之后所有课程页直接写标签，不必每页 import。新增组件必须在这里追加。
    globalComponents: [
      path.join(here, 'components/quiz.tsx'),
      path.join(here, 'components/retrieval.tsx'),
      path.join(here, 'components/steps.tsx'),
      path.join(here, 'components/step.tsx'),
      path.join(here, 'components/source.tsx'),
    ],
  },
  themeConfig: {
    // 导航与侧边栏都由 scripts/sidebar.mjs 从 docs/ 扫描生成，加课零配置。
    // 注意：一旦这里写了 nav 或 sidebar，Rspress 内置的 _nav.json 自动导航就失效——
    // 这正是我们不用 _nav.json 的原因，不要把它们混在一起。
    nav: buildNav(docsDir),
    sidebar: buildSidebar(docsDir),
  },
});
