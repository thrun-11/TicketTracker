import { useForm } from 'react-hook-form'
import { z } from 'zod'

interface LoginFormData {
  email: string
  password: string
}

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export function useLoginForm() {
  return useForm<LoginFormData>({
    resolver: async (data) => {
      const result = await loginSchema.parseAsync(data)
      return {
        values: result,
        errors: {},
      }
    },
    mode: 'onTouched',
  })
}
