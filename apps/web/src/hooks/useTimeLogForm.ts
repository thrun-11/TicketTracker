import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { TimeLogFormData } from '../components/TimeLogForm'

const timeLogSchema = z.object({
  timeSpent: z.string()
    .min(1, 'Time spent is required')
    .refine((val) => !isNaN(parseInt(val, 10)), 'Must be a valid number')
    .refine((val) => parseInt(val, 10) > 0, 'Time must be at least 1 minute'),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  spentDate: z.string().min(1, 'Date is required'),
})

export function useTimeLogForm(defaultValues?: Partial<TimeLogFormData>) {
  return useForm<TimeLogFormData>({
    resolver: async (data) => {
      const result = await timeLogSchema.parseAsync(data)
      return {
        values: result,
        errors: {},
      }
    },
    mode: 'onTouched',
    defaultValues: defaultValues || {
      timeSpent: '',
      description: '',
      spentDate: new Date().toISOString().split('T')[0],
    },
  })
}
