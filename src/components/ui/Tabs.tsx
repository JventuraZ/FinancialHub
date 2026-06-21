interface Props {
  tabs: string[]
  active: string
  onChange: (tab: string) => void
}

export function Tabs({ tabs, active, onChange }: Props) {
  return (
    <div className="flex border-b border-surface-border">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            active === tab
              ? 'border-brand-400 text-brand-300 [box-shadow:0_2px_10px_-3px_rgba(51,198,220,0.7)]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
