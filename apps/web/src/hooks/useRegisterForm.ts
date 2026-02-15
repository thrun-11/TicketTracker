import { useForm } from 'react-hook-form'
import { z } from 'zod'

interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export function useRegisterForm() {
  return useForm<RegisterFormData>({
    resolver: async (data) => {
      const result = await registerSchema.parseAsync(data)
      return {
        values: result,
        errors: {},
      }
    },
    mode: 'onTouched',
  })
}
