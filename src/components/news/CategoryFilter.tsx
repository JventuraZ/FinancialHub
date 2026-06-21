import type { NewsCategory } from '../../types/domain'

const CATEGORIES: { id: NewsCategory; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'forex', label: 'Forex' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'merger', label: 'M&A' },
]

interface Props {
  active: NewsCategory
  onChange: (c: NewsCategory) => void
}

export function CategoryFilter({ active, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {CATEGORIES.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
            active === id
              ? 'bg-brand-600 border-brand-500 text-white shadow-glow-sm'
              : 'bg-surface-card border-surface-border text-slate-400 hover:text-slate-200 hover:border-brand-700'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
