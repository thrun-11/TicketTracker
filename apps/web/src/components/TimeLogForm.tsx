import { useFormContext } from 'react-hook-form'

interface TimeLogFormProps {
  onSubmit: (data: TimeLogFormData) => void
  isSubmitting: boolean
  submitLabel?: string
}

export interface TimeLogFormData {
  timeSpent: string
  description?: string
  spentDate: string
}

export default function TimeLogForm({ onSubmit, isSubmitting, submitLabel = 'Log Time' }: TimeLogFormProps) {
  const { register, handleSubmit, formState: { errors } } = useFormContext<TimeLogFormData>()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="timeSpent" className="block text-sm font-medium text-foreground mb-1">
          Time Spent (minutes) *
        </label>
        <input
          id="timeSpent"
          type="number"
          {...register('timeSpent', {
            required: 'Time spent is required',
            min: { value: 1, message: 'Time must be at least 1 minute' },
          })}
          placeholder="60"
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
        {errors.timeSpent && (
          <p className="mt-1 text-sm text-destructive">{errors.timeSpent.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="spentDate" className="block text-sm font-medium text-foreground mb-1">
          Date *
        </label>
        <input
          id="spentDate"
          type="date"
          {...register('spentDate', { required: 'Date is required' })}
          defaultValue={new Date().toISOString().split('T')[0]}
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
        {errors.spentDate && (
          <p className="mt-1 text-sm text-destructive">{errors.spentDate.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
          Description
        </label>
        <textarea
          id="description"
          {...register('description')}
          placeholder="What did you work on?"
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
        )}
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
