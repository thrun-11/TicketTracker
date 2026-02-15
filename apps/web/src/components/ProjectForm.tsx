import { useFormContext } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import type { ProjectFormData } from '../hooks/useProjectForm'

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => Promise<void>
  isSubmitting: boolean
  submitLabel: string
}

export function ProjectForm({ onSubmit, isSubmitting, submitLabel, workspaces, selectedWorkspace, onWorkspaceChange }: ProjectFormProps & { workspaces?: any[]; selectedWorkspace?: string; onWorkspaceChange?: (id: string) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useFormContext<ProjectFormData>()

  const handleFormSubmit = async (data: ProjectFormData) => {
    await onSubmit(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
          Project Name <span className="text-destructive">*</span>
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 placeholder:text-muted-foreground"
          placeholder="Enter project name..."
        />
        {errors.name && (
          <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          {...register('description')}
          className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none placeholder:text-muted-foreground"
          placeholder="Add a project description..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {workspaces && workspaces.length > 0 && (
        <div>
          <label htmlFor="workspace" className="block text-sm font-medium text-foreground mb-2">
            Workspace
          </label>
          <select
            id="workspace"
            value={selectedWorkspace || ''}
            onChange={(e) => onWorkspaceChange?.(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            {workspaces.map((ws: any) => (
              <option key={ws.id} value={ws.id}>{ws.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
            Type
          </label>
          <select
            id="type"
            {...register('type')}
            defaultValue="kanban"
            className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="kanban">Kanban</option>
            <option value="scrum">Scrum</option>
            <option value="bug_tracking">Bug Tracking</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label htmlFor="visibility" className="block text-sm font-medium text-foreground mb-2">
            Visibility
          </label>
          <select
            id="visibility"
            {...register('visibility')}
            defaultValue="private"
            className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => reset()}
          disabled={!isDirty || isSubmitting}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  )
}
