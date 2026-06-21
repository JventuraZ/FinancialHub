import { AlertCircle } from 'lucide-react'

interface Props {
  message?: string
  className?: string
}

export function ErrorMessage({ message = 'Failed to load data.', className = '' }: Props) {
  return (
    <div className={`flex items-center gap-2 text-neg text-sm ${className}`}>
      <AlertCircle size={16} />
      <span>{message}</span>
    </div>
  )
}
