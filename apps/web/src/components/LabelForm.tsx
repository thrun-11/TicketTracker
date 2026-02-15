import { useFormContext } from 'react-hook-form'

interface LabelFormProps {
  onSubmit: (data: LabelFormData) => void
  isSubmitting: boolean
  submitLabel?: string
}

export interface LabelFormData {
  name: string
  color: string
}

export default function LabelForm({ onSubmit, isSubmitting, submitLabel = 'Create Label' }: LabelFormProps) {
  const { register, handleSubmit, formState: { errors } } = useFormContext<LabelFormData>()

  const colors = [
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Gray', value: '#6b7280' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
          Name *
        </label>
        <input
          id="name"
          type="text"
          {...register('name', { required: 'Label name is required' })}
          placeholder="Bug, Feature, etc."
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Color *</label>
        <div className="grid grid-cols-4 gap-2">
          {colors.map((color) => (
            <label key={color.value} className="relative">
              <input
                type="radio"
                value={color.value}
                {...register('color', { required: 'Color is required' })}
                className="sr-only peer"
              />
              <div
                className="h-10 rounded-md cursor-pointer border-2 transition-all peer-checked:ring-2 peer-checked:ring-offset-2"
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            </label>
          ))}
        </div>
        {errors.color && (
          <p className="mt-2 text-sm text-destructive">{errors.color.message}</p>
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
