import { useState, useCallback } from 'react'

interface ToastItem {
  id: string
  message: string
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message: string, duration = 3000) => {
    const id = `toast-${Date.now()}`

    setToasts(prev => [...prev, { id, message }])
    if (duration > 0) setTimeout(() => dismiss(id), duration)
  }, [dismiss])

  return { toasts, toast, dismiss }
}