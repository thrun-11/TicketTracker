import { useForm } from 'react-hook-form'
import { z } from 'zod'

export interface ProjectFormData {
  name: string
  description?: string
  type?: string
  visibility?: string
}

const projectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(100, 'Project name must not exceed 100 characters'),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
  type: z.enum(['kanban', 'scrum', 'bug_tracking', 'custom']).optional(),
  visibility: z.enum(['private', 'public']).optional(),
})

export function useProjectForm() {
  return useForm<ProjectFormData>({
    resolver: async (data) => {
      const result = await projectSchema.parseAsync(data)
      return {
        values: result,
        errors: {},
      }
    },
    mode: 'onTouched',
    defaultValues: {
      name: '',
      description: '',
      type: 'kanban',
      visibility: 'private',
    },
  })
}
