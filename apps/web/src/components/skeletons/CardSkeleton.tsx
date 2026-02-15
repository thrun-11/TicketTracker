export function CardSkeleton() {
  return (
    <div className="border border-border rounded-lg p-6 space-y-4">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-2/3 bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-3 w-1/2 bg-muted rounded" />
      </div>
      <div className="flex items-center justify-between pt-4">
        <div className="h-3 w-1/2 bg-muted rounded" />
        <div className="h-3 w-24 bg-muted rounded" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="h-3 w-16 bg-muted rounded" />
        <div className="h-3 w-1/3 bg-muted rounded" />
      </div>
    </div>
  )
}
