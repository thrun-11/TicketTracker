import { useFormContext } from 'react-hook-form'

interface SprintFormProps {
  onSubmit: (data: SprintFormData) => void
  isSubmitting: boolean
  submitLabel?: string
}

export interface SprintFormData {
  name: string
  goal?: string
  startDate?: string
  endDate?: string
}

export default function SprintForm({ onSubmit, isSubmitting, submitLabel = 'Create Sprint' }: SprintFormProps) {
  const { register, handleSubmit, formState: { errors } } = useFormContext<SprintFormData>()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
          Name *
        </label>
        <input
          id="name"
          type="text"
          {...register('name', { required: 'Sprint name is required' })}
          placeholder="Sprint 1"
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="goal" className="block text-sm font-medium text-foreground mb-1">
          Goal
        </label>
        <textarea
          id="goal"
          {...register('goal')}
          placeholder="Sprint goal..."
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
        />
        {errors.goal && (
          <p className="mt-1 text-sm text-destructive">{errors.goal.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-foreground mb-1">
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            {...register('startDate')}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-destructive">{errors.startDate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-foreground mb-1">
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            {...register('endDate')}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-destructive">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  )
}
