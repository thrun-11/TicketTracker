import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'
import { useToast } from '../hooks/useToast'
import { MoreHorizontal } from 'lucide-react'
import type { Issue } from '../types'

interface Column {
  id: string
  name: string
  issues: Issue[]
}

interface KanbanBoardProps {
  projectId: string
}

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [loading, setLoading] = useState(true)
  const [columns, setColumns] = useState<Column[]>([
    { id: 'backlog', name: 'Backlog', issues: [] },
    { id: 'todo', name: 'To Do', issues: [] },
    { id: 'in-progress', name: 'In Progress', issues: [] },
    { id: 'done', name: 'Done', issues: [] },
  ])
  const { error: showError } = useToast()

  const fetchIssues = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get<Issue[]>(`/issues?projectId=${projectId}`)
      const fetchedIssues = response.data

      const backlogIssues = fetchedIssues.filter((i: Issue) => i.status === 'backlog')
      const todoIssues = fetchedIssues.filter((i: Issue) => i.status === 'todo')
      const inProgressIssues = fetchedIssues.filter((i: Issue) => i.status === 'in_progress')
      const doneIssues = fetchedIssues.filter((i: Issue) => i.status === 'done')

      setColumns([
        { id: 'backlog', name: 'Backlog', issues: backlogIssues },
        { id: 'todo', name: 'To Do', issues: todoIssues },
        { id: 'in-progress', name: 'In Progress', issues: inProgressIssues },
        { id: 'done', name: 'Done', issues: doneIssues },
      ])
    } catch {
      showError('Failed to load issues')
    } finally {
      setLoading(false)
    }
  }, [projectId, showError])

  useEffect(() => {
    fetchIssues()
  }, [projectId, fetchIssues])

  return (
    <div className="p-6">
      {loading ? (
        <div className="space-y-6">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-2/4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {columns.map((column) => (
            <div key={column.id} className="bg-muted/20 rounded-lg p-4 min-h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">{column.name}</h3>
                <span className="text-sm text-muted-foreground">
                  {column.issues.length}
                </span>
              </div>

              {column.issues.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No issues in {column.name}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {column.issues.map((issue) => (
                    <div key={issue.id} className="bg-background border border-border rounded-lg p-4 mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-foreground">{issue.title}</h4>
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {issue.assignee?.name || 'Unassigned'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
