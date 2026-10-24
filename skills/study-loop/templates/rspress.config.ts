import path from 'node:path';
import { defineConfig } from '@rspress/core';

const SITE_TITLE = '{主题}';
const SITE_DESCRIPTION = '{一句话说明这门课教什么}';

const here = import.meta.dirname;

export default defineConfig({
  // 课程页面放在 docs/，站点的构建产物放在 doc_build/。
  // RESOURCES.md、NOTES.md、learning-records/ 在 docs/ 之外，所以永远不会被发布。
  root: 'docs',
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  lang: 'zh',
  // 发布到 GitHub Pages 这类子路径时，构建前设 DOCS_BASE=/仓库名/。
  base: process.env.DOCS_BASE || '/',
  globalStyles: path.join(here, 'styles/course.css'),
  markdown: {
    // 每个文件一个默认导出，组件名 = 文件名首字母大写（quiz.tsx → <Quiz>）。
    // 注册后所有课程页直接写标签，不必每页 import。
    globalComponents: [
      path.join(here, 'components/quiz.tsx'),
      path.join(here, 'components/retrieval.tsx'),
      path.join(here, 'components/steps.tsx'),
      path.join(here, 'components/step.tsx'),
      path.join(here, 'components/source.tsx'),
    ],
  },
});
