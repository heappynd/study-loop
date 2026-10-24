import { useLang } from '@rspress/core/runtime'

type SourceProps = {
  title: string
  url: string
  author?: string
  note?: string
}

export default function Source({ title, url, author = '', note = '' }: SourceProps) {
  const lang = useLang()
  const zh = String(lang || '').toLowerCase().startsWith('zh')

  return (
    <aside className="sl-source">
      <p className="sl-source__label">{zh ? '主要来源' : 'Primary source'}</p>
      <p className="sl-source__title">
        <a href={url} target="_blank" rel="noreferrer">{title}</a>
      </p>
      {author ? <p className="sl-source__author">{author}</p> : null}
      {note ? <p className="sl-source__note">{note}</p> : null}
    </aside>
  )
}
