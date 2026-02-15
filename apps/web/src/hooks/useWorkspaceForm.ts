import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { WorkspaceFormData } from '../components/WorkspaceForm'

const workspaceSchema = z.object({
  name: z.string()
    .min(3, 'Workspace name must be at least 3 characters')
    .max(100, 'Workspace name must not exceed 100 characters'),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional()
    .or(z.literal('')),
})

export function useWorkspaceForm(defaultValues?: Partial<WorkspaceFormData>) {
  return useForm<WorkspaceFormData>({
    resolver: async (data) => {
      const result = await workspaceSchema.parseAsync(data)
      return {
        values: result,
        errors: {},
      }
    },
    mode: 'onTouched',
    defaultValues: defaultValues || {
      name: '',
      description: '',
    },
  })
}
