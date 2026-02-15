export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="border border-border animate-pulse">
          <div className="flex items-center p-4 space-x-4">
            <div className="h-10 w-10 rounded bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-3/4 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
            </div>
            <div className="h-10 w-10 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}
