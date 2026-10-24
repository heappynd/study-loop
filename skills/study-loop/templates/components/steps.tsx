import type { ReactNode } from 'react'

export default function Steps({ children }: { children?: ReactNode }) {
  return <ol className="sl-steps">{children}</ol>
}
