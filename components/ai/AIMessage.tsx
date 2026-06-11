import type { ReactNode } from 'react'

interface AIMessageProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

function parseInline(text: string, keyPrefix: string): ReactNode {
  const segments: ReactNode[] = []
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/g
  let last = 0
  let m: RegExpExecArray | null

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) segments.push(text.slice(last, m.index))
    if (m[1]) {
      segments.push(<strong key={`${keyPrefix}-b${m.index}`} className="font-semibold">{m[1]}</strong>)
    } else if (m[2]) {
      segments.push(<em key={`${keyPrefix}-i${m.index}`}>{m[2]}</em>)
    } else if (m[3]) {
      segments.push(
        <code key={`${keyPrefix}-c${m.index}`} className="rounded bg-black/10 px-1 py-0.5 font-mono text-[0.8em]">
          {m[3]}
        </code>
      )
    }
    last = m.index + m[0].length
  }
  if (last < text.length) segments.push(text.slice(last))
  if (segments.length === 0) return text
  if (segments.length === 1 && typeof segments[0] === 'string') return segments[0]
  return <>{segments}</>
}

export function renderMarkdownBlocks(content: string): ReactNode {
  const lines = content.split('\n')
  const blocks: ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Fenced code block
    if (line.startsWith('```')) {
      const startI = i
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      blocks.push(
        <pre key={startI} className="my-2 overflow-x-auto rounded-md bg-zinc-800 px-3 py-2.5 text-xs text-zinc-100 font-mono leading-relaxed">
          <code>{codeLines.join('\n')}</code>
        </pre>
      )
      i++
      continue
    }

    // Headings
    if (/^#{1,3} /.test(line)) {
      const level = (line.match(/^(#+)/)?.[1] ?? '').length
      const text = line.replace(/^#+\s/, '')
      const cls =
        level === 1
          ? 'text-base font-bold text-zinc-900 mt-3 mb-1'
          : level === 2
          ? 'text-sm font-bold text-zinc-900 mt-2.5 mb-1'
          : 'text-sm font-semibold text-zinc-800 mt-2 mb-0.5'
      blocks.push(
        <p key={i} className={cls}>
          {parseInline(text, `h${i}`)}
        </p>
      )
      i++
      continue
    }

    // Horizontal rule
    if (/^-{3,}$/.test(line.trim())) {
      blocks.push(<hr key={i} className="my-2 border-zinc-200" />)
      i++
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      blocks.push(
        <blockquote key={i} className="my-1 border-l-2 border-brand/40 pl-3 text-sm italic text-zinc-600">
          {parseInline(line.slice(2), `bq${i}`)}
        </blockquote>
      )
      i++
      continue
    }

    // Unordered list
    if (/^[-*•] /.test(line)) {
      const startI = i
      const items: string[] = []
      while (i < lines.length && /^[-*•] /.test(lines[i])) {
        items.push(lines[i].replace(/^[-*•] /, ''))
        i++
      }
      blocks.push(
        <ul key={startI} className="my-1.5 space-y-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-2 text-sm text-zinc-700 leading-relaxed">
              <span className="mt-0.5 shrink-0 text-brand font-bold">•</span>
              <span>{parseInline(item, `ul${startI}-${idx}`)}</span>
            </li>
          ))}
        </ul>
      )
      continue
    }

    // Ordered list
    if (/^\d+\. /.test(line)) {
      const startI = i
      const items: string[] = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ''))
        i++
      }
      blocks.push(
        <ol key={startI} className="my-1.5 space-y-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-2 text-sm text-zinc-700 leading-relaxed">
              <span className="shrink-0 font-semibold text-brand">{idx + 1}.</span>
              <span>{parseInline(item, `ol${startI}-${idx}`)}</span>
            </li>
          ))}
        </ol>
      )
      continue
    }

    // Empty line — skip
    if (line.trim() === '') {
      i++
      continue
    }

    // Regular paragraph
    blocks.push(
      <p key={i} className="text-sm leading-relaxed text-zinc-700">
        {parseInline(line, `p${i}`)}
      </p>
    )
    i++
  }

  return <>{blocks}</>
}

export function AIMessage({ role, content, isStreaming }: AIMessageProps) {
  const isUser = role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg bg-brand px-4 py-2.5 text-sm text-white leading-relaxed">
          {content}
          {isStreaming && (
            <span className="ml-1 inline-block h-3.5 w-0.5 animate-pulse bg-current opacity-70" />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-sm">
        <div className="space-y-0.5">
          {renderMarkdownBlocks(content)}
          {isStreaming && (
            <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-zinc-500 opacity-70" />
          )}
        </div>
      </div>
    </div>
  )
}
