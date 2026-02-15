interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-6">
      <div className="text-center">
        {icon && (
          <div className="mb-6 inline-flex items-center justify-center">
            <div className="bg-muted/20 rounded-full p-6">
              {icon}
            </div>
          </div>
        )}

        <h3 className="text-2xl font-semibold text-foreground mb-2">
          {title}
        </h3>

        {description && (
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {description}
          </p>
        )}

        {action && (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}
