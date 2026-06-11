'use client'

import { useState, useRef, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AIMessage } from '@/components/ai/AIMessage'
import { AI } from '@/lib/constants/copy'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'What were my best-selling products this week?',
  'How does this week compare to last week?',
  'Which products are running low on stock?',
  'What is my average sale amount?',
]

export function AIChatPanel() {
  const queryClient = useQueryClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  async function sendMessage(question: string) {
    if (!question.trim() || isLoading) return
    setInput('')
    const userMsg: Message = { role: 'user', content: question }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)
    setStreamingContent('')

    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })

      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        throw new Error(json.error ?? AI.QUERY_ERROR)
      }

      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value)
        setStreamingContent(fullText)
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: fullText }])
      setStreamingContent('')
      void queryClient.invalidateQueries({ queryKey: ['me', 'shop'] })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : AI.QUERY_ERROR)
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.length === 0 && !isLoading && (
          <div className="space-y-4 pt-4">
            <p className="text-center text-sm text-zinc-500">{AI.CHAT_EMPTY}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-md border border-brand/20 bg-brand-light px-3 py-2 text-left text-xs text-brand hover:bg-brand/10 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <AIMessage key={i} role={msg.role} content={msg.content} />
        ))}

        {isLoading && streamingContent && (
          <AIMessage role="assistant" content={streamingContent} isStreaming />
        )}

        {isLoading && !streamingContent && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-4 py-2.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
              <span className="text-xs text-zinc-400">{AI.THINKING}</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-zinc-200 p-3">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={AI.CHAT_PLACEHOLDER}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-brand hover:bg-brand-dark text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
