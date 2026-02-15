import { useCallback } from 'react'
import toast from 'react-hot-toast'

interface ToastOptions {
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

type ToastFunction = (message: string, options?: ToastOptions) => void

interface UseToastReturn {
  success: ToastFunction
  error: ToastFunction
  info: ToastFunction
  dismiss: (toastId: string) => void
  dismissAll: () => void
}

export const useToast = (): UseToastReturn => {
  return {
    success: useCallback((message: string, options?: ToastOptions) => {
      toast.success(message, {
        duration: 3000,
        position: 'top-right',
        ...options,
      })
    }, []),

    error: useCallback((message: string, options?: ToastOptions) => {
      toast.error(message, {
        duration: 4000,
        position: 'top-right',
        ...options,
      })
    }, []),

    info: useCallback((message: string, options?: ToastOptions) => {
      toast(message, {
        duration: 3000,
        position: 'top-right',
        ...options,
      })
    }, []),

    dismiss: useCallback((toastId: string) => {
      toast.dismiss(toastId)
    }, []),

    dismissAll: useCallback(() => {
      toast.dismiss()
    }, []),
  }
}

export default useToast
