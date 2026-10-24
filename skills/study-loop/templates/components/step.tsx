import { useEffect, useState, type ReactNode } from 'react'

type StepProps = {
  title: string
  children?: ReactNode
}

export default function Step({ title, children }: StepProps) {
  const [done, setDone] = useState(false)
  const [key, setKey] = useState('')

  // 服务端没有 localStorage：首屏固定渲染为未勾选，挂载后再读，避免水合不一致。
  useEffect(() => {
    const storageKey = `study-loop:step:${window.location.pathname}:${title}`
    setKey(storageKey)
    try {
      setDone(window.localStorage.getItem(storageKey) === '1')
    } catch {
      // 隐私模式下不可用就退回内存状态
    }
  }, [title])

  useEffect(() => {
    if (!key) return
    try {
      window.localStorage.setItem(key, done ? '1' : '0')
    } catch {
      // 同上
    }
  }, [done, key])

  return (
    <li className={`sl-step${done ? ' is-done' : ''}`}>
      <label>
        <input type="checkbox" checked={done} onChange={(event) => setDone(event.target.checked)} />
        <span className="sl-step__title">{title}</span>
      </label>
      <div className="sl-step__body">{children}</div>
    </li>
  )
}
