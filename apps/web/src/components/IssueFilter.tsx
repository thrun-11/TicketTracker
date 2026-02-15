import { Search, X } from 'lucide-react'
import type { IssueStatus, IssuePriority, IssueType, User } from '../types'

interface IssueFilterProps {
  search: string
  onSearchChange: (value: string) => void
  status: IssueStatus | 'all'
  onStatusChange: (value: IssueStatus | 'all') => void
  priority: IssuePriority | 'all'
  onPriorityChange: (value: IssuePriority | 'all') => void
  assigneeId: string | 'all'
  onAssigneeChange: (value: string | 'all') => void
  type: IssueType | 'all'
  onTypeChange: (value: IssueType | 'all') => void
  onReset: () => void
  assignees: User[]
}

export default function IssueFilter({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  assigneeId,
  onAssigneeChange,
  type,
  onTypeChange,
  onReset,
  assignees,
}: IssueFilterProps) {
  const statuses: (IssueStatus | 'all')[] = ['all', 'backlog', 'todo', 'in_progress', 'review', 'done']
  const priorities: (IssuePriority | 'all')[] = ['all', 'critical', 'high', 'medium', 'low']
  const types: (IssueType | 'all')[] = ['all', 'epic', 'story', 'task', 'bug', 'subtask']

  const hasActiveFilters = search || status !== 'all' || priority !== 'all' || assigneeId !== 'all' || type !== 'all'

  return (
    <div className="bg-white border border-border rounded-lg p-4 mb-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-foreground mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full pl-9 pr-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>

        <div className="min-w-[150px]">
          <label className="block text-sm font-medium text-foreground mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as IssueStatus | 'all')}
            className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Statuses' : s.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[150px]">
          <label className="block text-sm font-medium text-foreground mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value as IssuePriority | 'all')}
            className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>
                {p === 'all' ? 'All Priorities' : p.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[150px]">
          <label className="block text-sm font-medium text-foreground mb-1">Assignee</label>
          <select
            value={assigneeId}
            onChange={(e) => onAssigneeChange(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          >
            <option value="all">All Assignees</option>
            <option value="">Unassigned</option>
            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.name}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[150px]">
          <label className="block text-sm font-medium text-foreground mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value as IssueType | 'all')}
            className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t === 'all' ? 'All Types' : t.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
