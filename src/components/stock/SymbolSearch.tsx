import { useState, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useSymbols } from '../../hooks/finnhub/useSymbols'
import { useDebounce } from '../../hooks/ui/useDebounce'

interface Props {
  onSelect: (symbol: string) => void
  placeholder?: string
}

export function SymbolSearch({ onSelect, placeholder = 'Search stocks… (e.g. AAPL, TSLA)' }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const { data: symbols } = useSymbols('US')
  const ref = useRef<HTMLDivElement>(null)

  const results = debouncedQuery.length > 0 && symbols
    ? symbols
        .filter(
          (s) =>
            s.symbol.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            s.description.toLowerCase().includes(debouncedQuery.toLowerCase())
        )
        .slice(0, 10)
    : []

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          placeholder={placeholder}
          className="w-full bg-surface-card border border-surface-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-400 focus:shadow-glow transition-all"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-surface-elevated border border-surface-border rounded-xl shadow-card z-50 overflow-hidden">
          {results.map((s) => (
            <button
              key={s.symbol}
              onClick={() => { onSelect(s.symbol); setQuery(s.symbol); setOpen(false) }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-surface-hover transition-colors text-left"
            >
              <span className="font-semibold text-slate-100">{s.symbol}</span>
              <span className="text-slate-400 truncate ml-3 text-xs">{s.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
