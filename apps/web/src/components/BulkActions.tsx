import { Check, X } from 'lucide-react'
import type { IssueStatus, IssuePriority, IssueType, User } from '../types'

interface BulkActionsProps {
  selectedIds: string[]
  totalCount: number
  onSelectAll: () => void
  onClearSelection: () => void
  onBulkStatusChange: (status: IssueStatus) => void
  onBulkAssigneeChange: (assigneeId: string) => void
  onBulkTypeChange: (type: IssueType) => void
  onBulkPriorityChange: (priority: IssuePriority) => void
  assignees: User[]
}

export default function BulkActions({
  selectedIds,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBulkStatusChange,
  onBulkAssigneeChange,
  onBulkTypeChange,
  onBulkPriorityChange,
  assignees,
}: BulkActionsProps) {
  if (selectedIds.length === 0) return null

  const isAllSelected = selectedIds.length === totalCount

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg border border-border px-6 py-4 flex items-center gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={isAllSelected ? onClearSelection : onSelectAll}
          className="p-1 text-foreground hover:bg-muted rounded"
          title={isAllSelected ? 'Clear selection' : 'Select all'}
        >
          {isAllSelected ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
        </button>
        <span className="text-sm font-medium text-foreground">
          {selectedIds.length} issue{selectedIds.length !== 1 ? 's' : ''} selected
        </span>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Status:</label>
          <select
            onChange={(e) => onBulkStatusChange(e.target.value as IssueStatus)}
            className="px-2 py-1 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">-- Change --</option>
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Assignee:</label>
          <select
            onChange={(e) => onBulkAssigneeChange(e.target.value)}
            className="px-2 py-1 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">-- Change --</option>
            <option value="">Unassigned</option>
            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Type:</label>
          <select
            onChange={(e) => onBulkTypeChange(e.target.value as IssueType)}
            className="px-2 py-1 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">-- Change --</option>
            <option value="epic">Epic</option>
            <option value="story">Story</option>
            <option value="task">Task</option>
            <option value="bug">Bug</option>
            <option value="subtask">Subtask</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Priority:</label>
          <select
            onChange={(e) => onBulkPriorityChange(e.target.value as IssuePriority)}
            className="px-2 py-1 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">-- Change --</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <button
        onClick={onClearSelection}
        className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
      >
        Clear
      </button>
    </div>
  )
}
