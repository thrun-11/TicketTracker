import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { LabelFormData } from '../components/LabelForm'

const labelSchema = z.object({
  name: z.string()
    .min(1, 'Label name is required')
    .max(50, 'Label name must not exceed 50 characters'),
  color: z.string()
    .min(1, 'Color is required')
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
})

export function useLabelForm(defaultValues?: Partial<LabelFormData>) {
  return useForm<LabelFormData>({
    resolver: async (data) => {
      const result = await labelSchema.parseAsync(data)
      return {
        values: result,
        errors: {},
      }
    },
    mode: 'onTouched',
    defaultValues: defaultValues || {
      name: '',
      color: '#3b82f6',
    },
  })
}
