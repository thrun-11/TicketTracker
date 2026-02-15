import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { SprintFormData } from '../components/SprintForm'

const sprintSchema = z.object({
  name: z.string()
    .min(3, 'Sprint name must be at least 3 characters')
    .max(100, 'Sprint name must not exceed 100 characters'),
  goal: z.string()
    .max(500, 'Goal must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export function useSprintForm(defaultValues?: Partial<SprintFormData>) {
  return useForm<SprintFormData>({
    resolver: async (data) => {
      const result = await sprintSchema.parseAsync(data)
      return {
        values: result,
        errors: {},
      }
    },
    mode: 'onTouched',
    defaultValues: defaultValues || {
      name: '',
      goal: '',
      startDate: '',
      endDate: '',
    },
  })
}
