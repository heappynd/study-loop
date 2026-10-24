// 站点结构（顶部导航 + 左侧侧边栏）在这里生成，供 rspress.config.ts 使用。
//
// 为什么不用 Rspress 自带的 _nav.json / _meta.json：
// 1. Rspress 2 把根级 _meta.json 当成 v1 遗留的导航配置，会直接 panic 退出；
// 2. 只用 _nav.json 时，Rspress 给每个子目录生成各自的侧边栏，docs 根下的
//    MISSION / GLOSSARY 就成了孤儿页，点进去左侧一片空白；
// 3. 只要在 config 里定义了 nav 或 sidebar，_nav.json 的自动导航就整体失效。
// 所以「全站一套目录」只能自己生成。代价是这几行代码，好处是加课不用改任何配置。
import fs from 'node:fs';
import path from 'node:path';

const FM_END = '---';

// 从 frontmatter 取 title。这是侧边栏文字的唯一来源。
// 不用正则是因为 rspress.config.ts 由 rsbuild 的 TS loader 加载，内联复杂正则
// 会让解析器提前截断（实测报 ParseError），所以逻辑挪到这个普通模块里。
function pageTitle(file) {
  let src = '';
  try {
    src = fs.readFileSync(file, 'utf8');
  } catch {
    return path.basename(file, '.mdx');
  }
  const lines = src.split('\n');
  if (lines.length === 0 || lines[0].trim() !== FM_END) {
    return path.basename(file, '.mdx');
  }
  for (let i = 1; i < lines.length && i < 30; i += 1) {
    const line = lines[i].trim();
    if (line === FM_END) break;
    if (line.indexOf('title:') === 0) {
      let v = line.slice('title:'.length).trim();
      const a = v.charAt(0);
      const b = v.charAt(v.length - 1);
      if ((a === '"' && b === '"') || (a === "'" && b === "'")) v = v.slice(1, -1);
      if (v) return v;
    }
  }
  return path.basename(file, '.mdx');
}

function listPages(docsDir, sub) {
  const dir = path.join(docsDir, sub);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') && !f.startsWith('_'))
    .sort()
    .map((f) => ({
      text: pageTitle(path.join(dir, f)),
      link: '/' + sub + '/' + f.slice(0, -'.mdx'.length),
    }));
}

function hasPage(docsDir, name) {
  return fs.existsSync(path.join(docsDir, name + '.mdx'));
}

// 空分组整组丢掉：第一课还没写时，不要出现一个空标题。
function group(text, items) {
  return items.length > 0 ? [{ text, collapsible: false, items }] : [];
}

export function buildSidebar(docsDir) {
  const about = [];
  if (hasPage(docsDir, 'MISSION')) about.push({ text: '学习目标', link: '/MISSION' });
  if (hasPage(docsDir, 'GLOSSARY')) about.push({ text: '术语表', link: '/GLOSSARY' });

  return {
    // key '/' 是兜底规则：所有页面共用这一份侧边栏。
    // 没有它，MISSION / GLOSSARY 这类 docs 根下的页面左侧就是空的。
    '/': [
      ...group('课程', listPages(docsDir, 'lessons')),
      ...group('速查', listPages(docsDir, 'reference')),
      ...group('关于这门课', about),
    ],
  };
}

export function buildNav(docsDir) {
  const lessons = listPages(docsDir, 'lessons');
  const refs = listPages(docsDir, 'reference');
  const nav = [];

  // 导航是站点的固定信息架构，不随课程变化：
  // 「课程」永远指向第一课，加课时不需要回来改这里。
  nav.push(
    lessons.length > 0
      ? { text: '课程', link: lessons[0].link, activeMatch: '^/lessons/' }
      : { text: '课程', link: '/' },
  );
  if (refs.length > 0) {
    nav.push({ text: '速查', link: refs[0].link, activeMatch: '^/reference/' });
  }
  if (hasPage(docsDir, 'MISSION')) nav.push({ text: '目标', link: '/MISSION' });
  if (hasPage(docsDir, 'GLOSSARY')) nav.push({ text: '术语表', link: '/GLOSSARY' });
  return nav;
}
