import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type DefaultTheme } from 'vitepress'

// ---------------------------------------------------------------------------
// 建工作区时替换这两个值。course:check 会检查占位符是否还在。
// ---------------------------------------------------------------------------
const SITE_TITLE = '{主题}'
const SITE_DESCRIPTION = '{一句话说明这门课教什么}'

// 文档根就是运行 vitepress 的目录。不引入 docs/ 或 srcDir 层级。
const root = process.cwd()

type Scanned = DefaultTheme.SidebarItem & { order: number }

function frontmatter(file: string): { title: string; lesson: number; order: number } {
  // 去掉 UTF-8 BOM：Windows 编辑器会加，加了 `---` 就匹配不上。
  const source = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')
  const block = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!block) return { title: '', lesson: 0, order: 0 }

  const read = (key: string) => {
    const line = block[1].match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))
    return line ? line[1].trim().replace(/^['"]|['"]$/g, '') : ''
  }

  return {
    title: read('title'),
    lesson: Number(read('lesson')) || 0,
    order: Number(read('order')) || 0,
  }
}

function scan(dir: string, route: string): DefaultTheme.SidebarItem[] {
  const abs = path.join(root, dir)
  if (!fs.existsSync(abs)) return []

  return fs
    .readdirSync(abs)
    .filter((file) => file.endsWith('.md') && file !== 'index.md' && !file.startsWith('_'))
    .map((file): Scanned => {
      const slug = file.replace(/\.md$/, '')
      const fm = frontmatter(path.join(abs, file))
      return {
        text: fm.title || slug.replace(/^\d+-/, '').replace(/[-_]/g, ' '),
        link: `${route}/${slug}`,
        // 课程按 lesson，速查页按 order，两者都缺省时退回文件名开头的数字。
        order: fm.lesson || fm.order || parseInt(slug, 10) || 0,
      }
    })
    .sort((a, b) => a.order - b.order || a.text.localeCompare(b.text))
    .map(({ order, ...item }) => item)
}

const lessons = scan('lessons', '/lessons')
const reference = scan('reference', '/reference')

if (fs.existsSync(path.join(root, 'GLOSSARY.md'))) {
  reference.push({ text: '术语表', link: '/GLOSSARY' })
}

const hasMission = fs.existsSync(path.join(root, 'MISSION.md'))

const sidebar: DefaultTheme.SidebarItem[] = []
if (hasMission) {
  sidebar.push({ text: '目标', items: [{ text: '为什么学', link: '/MISSION' }] })
}
if (lessons.length) {
  sidebar.push({ text: '课程', items: lessons })
}
if (reference.length) {
  sidebar.push({ text: '速查', items: reference })
}

export default defineConfig({
  lang: 'zh-CN', // 改成课程实际使用的语言
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  lastUpdated: true,

  // 部署到子路径（如 GitHub Pages）时：DOCS_BASE=/repo-name/ npm run docs:build
  base: process.env.DOCS_BASE || '/',

  // 只属于 agent 的状态文件，绝不能变成页面、侧边栏项或搜索结果。
  srcExclude: ['RESOURCES.md', 'NOTES.md', 'learning-records/**'],

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      ...(lessons.length ? [{ text: '课程', link: lessons[0].link! }] : []),
      ...(reference.length ? [{ text: '速查', link: reference[0].link! }] : []),
      ...(hasMission ? [{ text: '目标', link: '/MISSION' }] : []),
    ],
    sidebar,

    outline: { level: [2, 3], label: '本页目录' },
    search: { provider: 'local' },

    // VitePress 的上一页/下一页跟随侧边栏顺序，所以只要 lesson 正确，序列就是免费的。
    docFooter: { prev: '上一课', next: '下一课' },
  },
})
