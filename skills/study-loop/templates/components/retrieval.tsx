import { useState, type ReactNode } from 'react'
import { useLang } from '@rspress/core/runtime'

type RetrievalProps = {
  prompt: string
  children?: ReactNode
}

export default function Retrieval({ prompt, children }: RetrievalProps) {
  const lang = useLang()
  const zh = String(lang || '').toLowerCase().startsWith('zh')
  const [open, setOpen] = useState(false)

  return (
    <div className={`sl-retrieval${open ? ' is-open' : ''}`}>
      <p className="sl-retrieval__prompt">{prompt}</p>
      <button type="button" className="sl-retrieval__toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? (zh ? '收起答案' : 'Hide answer') : zh ? '显示答案' : 'Reveal answer'}
      </button>
      <div className="sl-retrieval__answer">{children}</div>
    </div>
  )
}
