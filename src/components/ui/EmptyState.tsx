import { Search } from 'lucide-react'

interface Props {
  title?: string
  description?: string
  icon?: React.ReactNode
}

export function EmptyState({ title = 'No data', description, icon }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
      <div className="text-slate-600">{icon ?? <Search size={40} />}</div>
      <p className="text-lg font-medium text-slate-400">{title}</p>
      {description && <p className="text-sm text-center max-w-sm">{description}</p>}
    </div>
  )
}
