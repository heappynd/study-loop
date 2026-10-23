#!/usr/bin/env node
// Study Loop 课程自检。无第三方依赖，直接 node 运行。
// 用法：npm run course:check

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
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

// 1. 占位符
const config = read('.vitepress/config.ts')
if (!config) {
  fail('.vitepress/config.ts', '不存在，站点还没搭起来')
} else {
  if (/SITE_TITLE\s*=\s*'\{/.test(config)) fail('.vitepress/config.ts', 'SITE_TITLE 还是占位符')
  if (/SITE_DESCRIPTION\s*=\s*'\{/.test(config)) fail('.vitepress/config.ts', 'SITE_DESCRIPTION 还是占位符')
}

const index = read('index.md')
if (!index) {
  fail('index.md', '不存在，课程首页缺失')
} else {
  for (const token of ['{主题}', '{Topic}', '{slug}', '{title}', '{标题}', '{Reference page title}']) {
    if (index.includes(token)) fail('index.md', `残留占位符 ${token}`)
  }
}

// 2. 来源清单
const resources = read('RESOURCES.md')
const resourcesUrls = resources ? new Set([...resources.matchAll(/\]\((https?:\/\/[^\s)]+)\)/g)].map((m) => m[1])) : new Set()

// 3. 术语表锚点
const glossary = read('GLOSSARY.md')
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

// 4. 课程
const lessonsDir = path.join(root, 'lessons')
const lessons = []
if (!fs.existsSync(lessonsDir)) {
  fail('lessons/', '目录不存在')
} else {
  const files = fs
    .readdirSync(lessonsDir)
    .filter((f) => f.endsWith('.md') && f !== 'index.md' && !f.startsWith('_'))
    .sort()

  if (!files.length) fail('lessons/', '还没有任何课程')

  for (const file of files) {
    const rel = `lessons/${file}`
    const source = fs.readFileSync(path.join(lessonsDir, file), 'utf8').replace(/^\uFEFF/, '')
    const numberMatch = file.match(/^(\d{4})-/)
    if (!numberMatch) {
      fail(rel, '文件名必须以四位编号开头，例如 0001-first-lesson.md')
      continue
    }
    const number = Number(numberMatch[1])

    const fm = frontmatter(source)
    if (!fm) {
      fail(rel, '缺少 frontmatter')
      continue
    }

    const title = fm.get('title')
    const lesson = Number(fm.get('lesson'))
    const summary = fm.get('summary')

    if (!title) fail(rel, 'frontmatter 缺少 title')
    if (!summary) fail(rel, 'frontmatter 缺少 summary')
    if (!lesson) fail(rel, 'frontmatter 缺少 lesson')
    else if (lesson !== number) fail(rel, `lesson: ${lesson} 与文件名编号 ${number} 不一致`)
    if (!fm.get('reviewAfter')) warn(rel, '未设 reviewAfter，复习轮将按默认 3d 计算')

    if (!/<(Quiz|Retrieval|Steps)\b/.test(source)) {
      fail(rel, '没有任何费力互动（Quiz / Retrieval / Steps）')
    }
    if (!/<Source\b/.test(source)) fail(rel, '缺少 <Source>，每课必须有一个主要来源')

    // 组件属性里出现转义双引号会让 Vue 模板解析直接失败（构建报 Attribute name cannot contain…）。
    // 代码块里的 \" 是合法的 shell/JSON 写法，先剥掉再判断。
    const prose = source.replace(/```[\s\S]*?```/g, '').replace(/<Source[\s\S]*?\/>/g, '')
    if (/\\"/.test(prose)) {
      fail(
        rel,
        '组件属性里出现转义双引号 \\"，Vue 会解析失败：JSON 放进代码块再在题干里指代，或改用单引号包属性',
      )
    }

    const inlineUrls = [...source.matchAll(/<Source[\s\S]*?url="([^"]+)"/g)].map((m) => m[1])
    if (!inlineUrls.length && /<Source\b/.test(source)) fail(rel, '<Source> 缺少 url')
    for (const url of [...inlineUrls, ...fm.urls]) {
      if (!resourcesUrls.has(url)) fail(rel, `来源未登记在 RESOURCES.md：${url}`)
    }

    for (const m of source.matchAll(/\(\/GLOSSARY#([\w-]+)\)/g)) {
      if (!anchors.has(m[1])) fail(rel, `术语锚点不存在：/GLOSSARY#${m[1]}`)
    }

    if (index && !index.includes(`/lessons/${file.replace(/\.md$/, '')}`)) {
      fail(rel, '没有出现在 index.md 的课程索引里')
    }

    lessons.push({ rel, number, title })
  }
}

// 5. 速查页
const refDir = path.join(root, 'reference')
if (fs.existsSync(refDir)) {
  for (const file of fs.readdirSync(refDir).filter((f) => f.endsWith('.md') && f !== 'index.md' && !f.startsWith('_'))) {
    const rel = `reference/${file}`
    const fm = frontmatter(fs.readFileSync(path.join(refDir, file), 'utf8').replace(/^\uFEFF/, ''))
    if (!fm) fail(rel, '缺少 frontmatter')
    else if (!fm.get('title')) fail(rel, 'frontmatter 缺少 title')
  }
}

// 6. 状态文件
for (const rel of ['MISSION.md', 'NOTES.md', 'RESOURCES.md']) {
  if (!read(rel)) fail(rel, '不存在')
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
console.log('自检通过。可以构建了（构建前先停 dev server）。')
console.log(line)
