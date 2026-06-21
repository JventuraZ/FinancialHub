type Variant = 'green' | 'red' | 'gray' | 'blue'

interface Props {
  children: React.ReactNode
  variant?: Variant
  className?: string
}

const styles: Record<Variant, string> = {
  green: 'bg-pos-soft text-pos border border-pos/30',
  red: 'bg-neg-soft text-neg border border-neg/30',
  gray: 'bg-surface-elevated text-slate-400 border border-surface-border',
  blue: 'bg-brand-900 text-brand-300 border border-brand-700/60',
}

export function Badge({ children, variant = 'gray', className = '' }: Props) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[variant]} ${className}`}>
      {children}
    </span>
  )
}
