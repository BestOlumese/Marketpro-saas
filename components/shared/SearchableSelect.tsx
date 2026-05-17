'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

interface SearchableSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  emptyLabel?: string
  id?: string
  disabled?: boolean
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  emptyLabel = 'None',
  id,
  disabled,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = options.find((o) => o.value === value)

  const filtered = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  function handleOpen() {
    if (disabled) return
    setOpen(true)
    setSearch('')
  }

  function handleSelect(optValue: string) {
    onChange(optValue)
    setOpen(false)
    setSearch('')
  }

  function handleClear() {
    onChange('')
    setOpen(false)
    setSearch('')
  }

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  // Close on Escape
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false)
      setSearch('')
    }
  }

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      {/* Trigger button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex h-8 w-full items-center justify-between rounded-lg border border-zinc-200 bg-white px-2.5 text-sm transition-colors',
          'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-zinc-300',
          selected ? 'text-zinc-900' : 'text-zinc-400'
        )}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform', open && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-zinc-200 bg-white shadow-lg">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-zinc-100 px-2.5 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
            />
          </div>

          {/* Options list */}
          <ul role="listbox" className="max-h-52 overflow-y-auto py-1">
            {/* Clear / empty option */}
            <li
              role="option"
              aria-selected={value === ''}
              onClick={handleClear}
              className={cn(
                'flex cursor-pointer items-center gap-2 px-2.5 py-1.5 text-sm transition-colors',
                value === '' ? 'text-brand bg-brand-light' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              )}
            >
              <Check className={cn('h-3.5 w-3.5 shrink-0', value === '' ? 'opacity-100' : 'opacity-0')} />
              {emptyLabel}
            </li>

            {filtered.length === 0 ? (
              <li className="px-2.5 py-3 text-center text-xs text-zinc-400">No results</li>
            ) : (
              filtered.map((option) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={value === option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 px-2.5 py-1.5 text-sm transition-colors',
                    value === option.value
                      ? 'text-brand bg-brand-light font-medium'
                      : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900'
                  )}
                >
                  <Check className={cn('h-3.5 w-3.5 shrink-0', value === option.value ? 'opacity-100' : 'opacity-0')} />
                  {option.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
