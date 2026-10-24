import { useEffect, useRef, useState } from 'react'
import { useLang } from '@rspress/core/runtime'

type QuizProps = {
  question: string
  options: string[]
  answer: number | number[]
  multiple?: boolean
  explanation?: string
}

const letter = (i: number) => String.fromCharCode(65 + i)

export default function Quiz({ question, options, answer, multiple = false, explanation = '' }: QuizProps) {
  const lang = useLang()
  const zh = String(lang || '').toLowerCase().startsWith('zh')
  const [picked, setPicked] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)
  const feedback = useRef<HTMLDivElement>(null)

  const expected = Array.isArray(answer) ? [...answer] : [answer]
  const sortedExpected = [...expected].sort((a, b) => a - b)
  const isCorrect =
    submitted &&
    picked.length === expected.length &&
    [...picked].sort((a, b) => a - b).every((value, i) => value === sortedExpected[i])

  const t = zh
    ? { multiple: '（可多选）', check: '核对答案', correct: '答对了。', wrong: '还不对。', answer: '正确答案：', retry: '再试一次' }
    : { multiple: '(select all that apply)', check: 'Check answer', correct: 'Correct.', wrong: 'Not quite.', answer: 'Correct answer: ', retry: 'Try again' }

  // 判分后把焦点移到反馈区：按钮保留可聚焦性（aria-disabled），键盘与读屏用户不会丢上下文。
  useEffect(() => {
    if (submitted) feedback.current?.focus()
  }, [submitted])

  function choose(i: number) {
    if (submitted) return
    if (multiple) {
      setPicked((prev) => (prev.includes(i) ? prev.filter((value) => value !== i) : [...prev, i]))
      return
    }
    setPicked([i])
    setSubmitted(true)
  }

  return (
    <div className="sl-quiz">
      <p className="sl-quiz__question">
        {question}
        {multiple ? <span className="sl-quiz__note">{t.multiple}</span> : null}
      </p>

      <ul className="sl-quiz__options">
        {options.map((option, i) => {
          const pickedNow = picked.includes(i)
          const isAnswer = submitted && expected.includes(i)
          const isWrong = submitted && pickedNow && !expected.includes(i)
          const className = [pickedNow && 'picked', isAnswer && 'answer', isWrong && 'wrong'].filter(Boolean).join(' ')
          return (
            <li key={i}>
              <button
                type="button"
                aria-disabled={submitted ? 'true' : 'false'}
                aria-pressed={pickedNow}
                className={className || undefined}
                onClick={() => choose(i)}
              >
                <span className="mark" aria-hidden="true">{letter(i)}</span>
                <span>{option}</span>
              </button>
            </li>
          )
        })}
      </ul>

      {multiple && !submitted ? (
        <div className="sl-quiz__actions">
          <button type="button" disabled={!picked.length} onClick={() => picked.length && setSubmitted(true)}>
            {t.check}
          </button>
        </div>
      ) : null}

      {submitted ? (
        <div ref={feedback} className="sl-quiz__feedback" role="status" tabIndex={-1}>
          <p><strong>{isCorrect ? t.correct : t.wrong}</strong></p>
          {explanation ? <p>{explanation}</p> : null}
          {!isCorrect ? (
            <p className="sl-quiz__note">
              {t.answer}
              {expected.map(letter).join(', ')}
            </p>
          ) : null}
          <button type="button" className="sl-quiz__reset" onClick={() => { setPicked([]); setSubmitted(false) }}>
            {t.retry}
          </button>
        </div>
      ) : null}
    </div>
  )
}
