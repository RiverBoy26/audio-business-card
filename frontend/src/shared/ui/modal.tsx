import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

type ModalProps = {
  children: ReactNode
  className?: string
  onClose: () => void
  open: boolean
  title: string
}

export function Modal({ children, className, onClose, open, title }: ModalProps) {
  useEffect(() => {
    if (!open) return

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = ''
    }
  }, [onClose, open])

  if (!open) return null

  return (
    <div
      aria-label={title}
      aria-modal="true"
      className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-[#0d0a33]/35 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose()
      }}
      role="dialog"
    >
      <div className={cn('relative my-auto w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl sm:p-8', className)}>
        <button
          aria-label="Закрыть окно"
          className="absolute right-4 top-4 rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
        {children}
      </div>
    </div>
  )
}
