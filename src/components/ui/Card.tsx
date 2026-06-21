interface Props {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: Props) {
  return (
    <div className={`bg-gradient-to-b from-surface-card to-[#131a28] border border-surface-border rounded-xl p-4 shadow-card ${className}`}>
      {children}
    </div>
  )
}
