#!/usr/bin/env node
// Study Loop 课程自检（Rspress 版）。无第三方依赖，直接 node 运行。
// 用法：npm run course:check

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const docsDir = path.join(root, 'docs')
const errors = []
const warnings = []

const read = (rel) => {
  const abs = path.join(root, rel)
  return fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8').replace(/^\uFEFF/, '') : null
}

const fail = (file, message) => errors.push(`${file}: ${message}`)
const warn = (file, message) => warnings.push(`${file}: ${message}`)

function frontmatter(source) {
  const block = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!block) return null
  const body = block[1]
  const get = (key) => {
    const line = body.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))
    return line ? line[1].trim().replace(/^['"]|['"]$/g, '') : ''
  }
  const urls = [...body.matchAll(/^\s*url:\s*['"]?([^'"\s]+)['"]?\s*$/gm)].map((m) => m[1])
  return { body, get, urls }
}

const listDocs = (dir, ext) =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => f.endsWith(ext) && !f.startsWith('_')).sort()
    : []

// 1. 站点配置
const config = read('rspress.config.ts')
if (!config) {
  fail('rspress.config.ts', '不存在，站点还没搭起来')
} else {
  if (/SITE_TITLE\s*=\s*'\{/.test(config)) fail('rspress.config.ts', 'SITE_TITLE 还是占位符')
  if (/SITE_DESCRIPTION\s*=\s*'\{/.test(config)) fail('rspress.config.ts', 'SITE_DESCRIPTION 还是占位符')
  for (const m of config.matchAll(/'components\/([\w-]+\.tsx)'/g)) {
    if (!fs.existsSync(path.join(root, 'components', m[1]))) {
      fail('rspress.config.ts', `注册的全局组件不存在：components/${m[1]}`)
    }
  }
}
if (fs.existsSync(path.join(root, '.vitepress'))) {
  fail('.vitepress/', 'VitePress 残留：这个工作区用的是 Rspress，配置文件在根目录的 rspress.config.ts')
}
if (/vitepress/i.test(config || '') || /vitepress/i.test(read('package.json') || '')) {
  fail('package.json', '还在依赖 vitepress：Rspress 工作区只装 @rspress/core')
}

// 2. 首页
const index = read('docs/index.mdx')
if (!index) {
  fail('docs/index.mdx', '不存在，课程首页缺失')
} else {
  for (const token of ['{主题}', '{Topic}', '{slug}', '{title}', '{标题}', '{一句话']) {
    if (index.includes(token)) fail('docs/index.mdx', `残留占位符 ${token}`)
  }
}

// 3. 导航
const navRaw = read('docs/_nav.json')
if (!navRaw) {
  fail('docs/_nav.json', '不存在，导航栏是空的')
} else {
  let nav = null
  try {
    nav = JSON.parse(navRaw)
  } catch (error) {
    fail('docs/_nav.json', `不是合法 JSON：${error.message}`)
  }
  if (Array.isArray(nav)) {
    const resolves = (link) => {
      if (/^https?:/i.test(link)) return true
      const clean = link.split('#')[0].split('?')[0].replace(/\.html$/, '').replace(/\/$/, '')
      if (!clean) return true
      const base = path.join(docsDir, clean)
      return ['mdx', 'md'].some((ext) => fs.existsSync(`${base}.${ext}`)) || fs.existsSync(path.join(base, 'index.mdx'))
    }
    let hasLessons = false
    for (const item of nav) {
      if (!item || typeof item.link !== 'string') continue
      if (!resolves(item.link)) fail('docs/_nav.json', `链接指向不存在的页面：${item.link}`)
      if (item.link.startsWith('/lessons/')) hasLessons = true
    }
    if (!hasLessons) warn('docs/_nav.json', '导航里没有「课程」入口，建议加一项指向第 1 课')
  }
}

// 4. 会发布的固定页面
for (const rel of ['docs/MISSION.mdx', 'docs/GLOSSARY.mdx']) {
  if (!read(rel)) fail(rel, '不存在')
}

// 5. 不发布的状态文件
for (const rel of ['RESOURCES.md', 'NOTES.md']) {
  if (!read(rel)) fail(rel, '不存在')
}

// 6. 来源清单
const resources = read('RESOURCES.md')
const resourcesUrls = resources
  ? new Set([...resources.matchAll(/\]\((https?:\/\/[^\s)]+)\)/g)].map((m) => m[1]))
  : new Set()

// 7. 术语表锚点
const glossary = read('docs/GLOSSARY.mdx')
const anchors = new Set()
let termCount = 0
if (glossary) {
  for (const m of glossary.matchAll(/\{#([\w-]+)\}/g)) {
    anchors.add(m[1])
    termCount += 1
  }
  for (const m of glossary.matchAll(/^#{2,6}\s+(.+)$/gm)) {
    const slug = m[1]
      .trim()
      .toLowerCase()
      .replace(/[（）()【】\[\]:：，,。.、！!？?／/"'`]/g, '')
      .replace(/\s+/g, '-')
    if (slug) anchors.add(slug)
  }
}

// 8. 课程
const lessonsDir = path.join(docsDir, 'lessons')
const lessons = []
if (!fs.existsSync(lessonsDir)) {
  fail('docs/lessons/', '目录不存在')
} else {
  for (const stray of listDocs(lessonsDir, '.md')) {
    fail(`docs/lessons/${stray}`, '是 .md：Rspress 里要用 .mdx 才能写组件')
  }

  const files = listDocs(lessonsDir, '.mdx')
  if (!files.length) fail('docs/lessons/', '还没有任何课程')

  let previous = 0
  for (const file of files) {
    const rel = `docs/lessons/${file}`
    const source = fs.readFileSync(path.join(lessonsDir, file), 'utf8').replace(/^\uFEFF/, '')
    const numberMatch = file.match(/^(\d{4})-([\w-]+)\.mdx$/)
    if (!numberMatch) {
      fail(rel, '文件名必须是 0001-<slug>.mdx（四位编号 + 小写连字符串）')
      continue
    }
    const number = Number(numberMatch[1])
    if (number <= previous) fail(rel, `编号没有递增，上一课是 ${previous}`)
    previous = number

    const fm = frontmatter(source)
    if (!fm) {
      fail(rel, '缺少 frontmatter')
      continue
    }

    const title = fm.get('title')
    const description = fm.get('description')

    if (!title) fail(rel, 'frontmatter 缺少 title')
    if (!description) fail(rel, 'frontmatter 缺少 description')
    if (!fm.get('reviewAfter')) warn(rel, '未设 reviewAfter，复习轮将按默认 3d 计算')

    if (!/<(Quiz|Retrieval|Steps)\b/.test(source)) {
      fail(rel, '没有任何费力互动（Quiz / Retrieval / Steps）')
    }
    if (!/<Source\b/.test(source)) fail(rel, '缺少 <Source>，每课必须有一个主要来源')

    // 代码块里的内容是合法的，先剥掉再判断。
    const prose = source.replace(/```[\s\S]*?```/g, '')

    // Vue 写法在 Rspress 里是普通文本，会静默失效（不会被渲染成组件属性）。
    if (/\s:(options|answer|question|prompt|title|url)=/.test(prose)) {
      fail(rel, '检测到 Vue 的 :prop 写法，Rspress 用 JSX：options={[...]}、answer={1}')
    }
    // JSX 属性里出现转义双引号会截断属性，直接编译失败。
    if (/\\"/.test(prose)) {
      fail(rel, '属性里出现转义双引号 \\"：把 JSON 放进代码块再在题干里指代，或改用单引号')
    }
    // .md 链接会 404：Rspress 的路由不带扩展名。
    if (/\]\([^)\s]+\.mdx?[)#]?/.test(prose)) {
      fail(rel, '链接里带了 .md/.mdx 扩展名，改用不带扩展名的路由')
    }

    const inlineUrls = [...source.matchAll(/<Source[\s\S]*?url=["']([^"']+)["']/g)].map((m) => m[1])
    if (!inlineUrls.length && /<Source\b/.test(source)) fail(rel, '<Source> 缺少 url')
    for (const url of [...inlineUrls, ...fm.urls]) {
      if (!resourcesUrls.has(url)) fail(rel, `来源未登记在 RESOURCES.md：${url}`)
    }

    for (const m of source.matchAll(/\(\/GLOSSARY#([\w-]+)\)/g)) {
      if (!anchors.has(m[1])) fail(rel, `术语锚点不存在：/GLOSSARY#${m[1]}`)
    }

    lessons.push({ rel, number, title })
  }
}

// 9. 速查页
const referenceDir = path.join(docsDir, 'reference')
for (const stray of listDocs(referenceDir, '.md')) {
  fail(`docs/reference/${stray}`, '是 .md：需要 .mdx')
}
for (const file of listDocs(referenceDir, '.mdx')) {
  const rel = `docs/reference/${file}`
  const fm = frontmatter(fs.readFileSync(path.join(referenceDir, file), 'utf8').replace(/^\uFEFF/, ''))
  if (!fm) fail(rel, '缺少 frontmatter')
  else {
    if (!fm.get('title')) fail(rel, 'frontmatter 缺少 title')
    if (!fm.get('description')) warn(rel, 'frontmatter 缺少 description')
  }
}

// 输出
const line = '─'.repeat(52)
console.log(line)
if (warnings.length) {
  console.log(`警告 ${warnings.length} 条`)
  for (const w of warnings) console.log(`  [警告] ${w}`)
}
if (errors.length) {
  console.log(`错误 ${errors.length} 条`)
  for (const e of errors) console.log(`  [错误] ${e}`)
  console.log(line)
  console.log('自检未通过，先修上面的错误再构建。')
  process.exit(1)
}
console.log(`课程 ${lessons.length} 节，术语 ${termCount} 条，错误 0 条。`)
console.log('自检通过。可以构建了：npm run build')
console.log(line)
