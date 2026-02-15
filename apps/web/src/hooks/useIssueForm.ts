import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { IssueFormData } from '../types'

const issueSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters'),
  description: z.string()
    .max(5000, 'Description must not exceed 5000 characters')
    .optional()
    .or(z.literal('')),
  type: z.enum(['epic', 'story', 'task', 'bug', 'subtask'], {
    required_error: 'Type is required',
  }),
  priority: z.enum(['critical', 'high', 'medium', 'low'], {
    required_error: 'Priority is required',
  }),
  assigneeId: z.string().optional(),
  projectId: z.string().optional(),
})

export function useIssueForm(defaultValues?: Partial<IssueFormData>) {
  return useForm<IssueFormData>({
    resolver: async (data) => {
      const result = await issueSchema.parseAsync(data)
      return {
        values: result,
        errors: {},
      }
    },
    mode: 'onTouched',
    defaultValues: defaultValues || {
      title: '',
      description: '',
      type: 'task',
      priority: 'medium',
    },
  })
}
