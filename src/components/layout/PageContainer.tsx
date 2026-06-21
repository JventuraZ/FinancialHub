interface Props {
  children: React.ReactNode
  fullWidth?: boolean
  className?: string
}

export function PageContainer({ children, fullWidth = false, className = '' }: Props) {
  return (
    <div className={`${fullWidth ? 'w-full' : 'max-w-7xl mx-auto'} px-4 py-6 ${className}`}>
      {children}
    </div>
  )
}
