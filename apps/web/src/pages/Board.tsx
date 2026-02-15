import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { api } from '../api/client'
import { useToast } from '../hooks/useToast'
import { useSocket } from '../hooks/useSocket'
import { useIssueForm } from '../hooks/useIssueForm'
import { Modal } from '../components/Modal'
import { IssueForm } from '../components/IssueForm'
import IssueFilter from '../components/IssueFilter'
import BulkActions from '../components/BulkActions'
import { FormProvider } from 'react-hook-form'
import { FolderOpen, GripVertical, Plus, Edit2, Check, X } from 'lucide-react'
import type { Issue, IssueStatus, IssueFormData, IssuePriority, IssueType } from '../types'

interface BoardProps {
  projectId: string
}

function DraggableIssue({ issue, isDragging, onEdit, isSelected, onToggleSelect }: { issue: Issue; isDragging: boolean; onEdit: (id: string, title: string) => void; isSelected: boolean; onToggleSelect: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: issue.id })
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(issue.title)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleSave = () => {
    if (editedTitle.trim()) {
      onEdit(issue.id, editedTitle)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditedTitle(issue.title)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <Link
      to={`/issues/${issue.id}`}
      className="block"
      onClick={(e) => {
        if (isDragging || isEditing) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
    >
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`bg-white border border-border rounded-lg p-4 mb-3 cursor-move shadow-sm hover:border-primary/50 hover:shadow-md transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
      >
        <div className="flex items-start gap-2 mb-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(issue.id)}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/50 cursor-pointer"
          />
          <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-xs">
            {issue.status.replace('_', ' ').toUpperCase()}
          </span>
          <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-100 text-white font-medium text-xs">
            {issue.type.toUpperCase()}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsEditing(true)
            }}
            className="ml-auto p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
          >
            <Edit2 className="h-3 w-3" />
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 text-sm font-semibold border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleSave()
                }}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded-md"
              >
                <Check className="h-3 w-3" />
                Save
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleCancel()
                }}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted rounded-md"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h4 className="text-sm font-semibold text-foreground mb-2">{issue.title}</h4>
            <div className="text-xs text-muted-foreground">
              {issue.assignee?.name || 'Unassigned'}
            </div>
          </>
        )}
      </div>
    </Link>
  )
}

 export default function Board({ projectId }: BoardProps) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [filterSearch, setFilterSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<IssueStatus | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<IssuePriority | 'all'>('all')
  const [filterAssigneeId, setFilterAssigneeId] = useState<string | 'all'>('all')
  const [filterType, setFilterType] = useState<IssueType | 'all'>('all')
  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>([])

  const { success, error } = useToast()
  const socket = useSocket()
  const methods = useIssueForm({ projectId })

  const handleCreateIssue = async (data: IssueFormData) => {
    try {
      await api.post('/issues', data)
      success('Issue created successfully')
      setIsCreateModalOpen(false)
      fetchIssues()
    } catch {
      error('Failed to create issue')
    }
  }

  const handleEditIssue = async (issueId: string, title: string) => {
    try {
      await api.patch(`/issues/${issueId}`, { title })
      success('Issue updated successfully')
      fetchIssues()
    } catch {
      error('Failed to update issue')
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const fetchIssues = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get<Issue[]>(`/issues?projectId=${projectId}`)
      setIssues(response.data)
    } catch {
      error('Failed to load issues')
    } finally {
      setLoading(false)
    }
  }, [projectId, error])

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (filterSearch) {
        const searchLower = filterSearch.toLowerCase()
        const titleMatch = issue.title.toLowerCase().includes(searchLower)
        const descriptionMatch = issue.description?.toLowerCase().includes(searchLower)
        if (!titleMatch && !descriptionMatch) {
          return false
        }
      }
      if (filterStatus !== 'all' && issue.status !== filterStatus) {
        return false
      }
      if (filterPriority !== 'all' && issue.priority !== filterPriority) {
        return false
      }
      if (filterAssigneeId !== 'all') {
        if (filterAssigneeId === '') {
          if (issue.assigneeId) return false
        } else if (issue.assigneeId !== filterAssigneeId) {
          return false
        }
      }
      if (filterType !== 'all' && issue.type !== filterType) {
        return false
      }
      return true
    })
  }, [issues, filterSearch, filterStatus, filterPriority, filterAssigneeId, filterType])

  const assignees = useMemo(() => {
    const uniqueAssignees = new Map<string, typeof issues[0]['assignee']>()
    issues.forEach((issue) => {
      if (issue.assignee) {
        uniqueAssignees.set(issue.assignee.id, issue.assignee)
      }
    })
    return Array.from(uniqueAssignees.values()).filter((a): a is NonNullable<typeof a> => a !== undefined)
  }, [issues])

  const columns = useMemo(() => [
    { id: 'backlog' as IssueStatus, name: 'Backlog', issueIds: issues.filter(i => i.status === 'backlog').map(i => i.id) },
    { id: 'todo' as IssueStatus, name: 'To Do', issueIds: issues.filter(i => i.status === 'todo').map(i => i.id) },
    { id: 'in_progress' as IssueStatus, name: 'In Progress', issueIds: issues.filter(i => i.status === 'in_progress').map(i => i.id) },
    { id: 'done' as IssueStatus, name: 'Done', issueIds: issues.filter(i => i.status === 'done').map(i => i.id) },
  ], [issues])

  const filteredColumns = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      issueIds: filteredIssues.filter((i) => i.status === column.id).map((i) => i.id),
    }))
  }, [columns, filteredIssues])

  const handleResetFilters = () => {
    setFilterSearch('')
    setFilterStatus('all')
    setFilterPriority('all')
    setFilterAssigneeId('all')
    setFilterType('all')
  }

  const handleToggleIssueSelection = (issueId: string) => {
    setSelectedIssueIds((prev) =>
      prev.includes(issueId) ? prev.filter((id) => id !== issueId) : [...prev, issueId],
    )
  }

  const handleSelectAll = () => {
    setSelectedIssueIds(filteredIssues.map((i) => i.id))
  }

  const handleClearSelection = () => {
    setSelectedIssueIds([])
  }

  const handleBulkStatusChange = async (status: IssueStatus) => {
    if (!status) return
    try {
      await Promise.all(
        selectedIssueIds.map((id) => api.patch(`/issues/${id}`, { status })),
      )
      success(`Updated ${selectedIssueIds.length} issues`)
      handleClearSelection()
      fetchIssues()
    } catch {
      error('Failed to update issues')
    }
  }

  const handleBulkAssigneeChange = async (assigneeId: string) => {
    try {
      await Promise.all(
        selectedIssueIds.map((id) =>
          api.patch(`/issues/${id}`, { assigneeId: assigneeId || null }),
        ),
      )
      success(`Updated ${selectedIssueIds.length} issues`)
      handleClearSelection()
      fetchIssues()
    } catch {
      error('Failed to update issues')
    }
  }

  const handleBulkTypeChange = async (type: IssueType) => {
    if (!type) return
    try {
      await Promise.all(
        selectedIssueIds.map((id) => api.patch(`/issues/${id}`, { type })),
      )
      success(`Updated ${selectedIssueIds.length} issues`)
      handleClearSelection()
      fetchIssues()
    } catch {
      error('Failed to update issues')
    }
  }

  const handleBulkPriorityChange = async (priority: IssuePriority) => {
    if (!priority) return
    try {
      await Promise.all(
        selectedIssueIds.map((id) => api.patch(`/issues/${id}`, { priority })),
      )
      success(`Updated ${selectedIssueIds.length} issues`)
      handleClearSelection()
      fetchIssues()
    } catch {
      error('Failed to update issues')
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const sourceColumn = columns.find(col => col.issueIds.includes(activeId))
    const targetColumn = columns.find(col => col.id === overId || col.issueIds.includes(overId))

    if (!sourceColumn || !targetColumn) return
    if (sourceColumn.id === targetColumn.id) return

    const issue = issues.find(i => i.id === activeId)
    if (!issue) return

    try {
      await api.patch(`/issues/${activeId}`, { status: targetColumn.id })

      setIssues(prev => prev.map(i => i.id === activeId ? { ...i, status: targetColumn.id } : i))

      success(`Issue moved to ${targetColumn.name}`)
    } catch {
      error('Failed to update issue status')
    }
  }

  const activeIssue = issues.find(i => i.id === activeId)

  useEffect(() => {
    fetchIssues()
  }, [fetchIssues])

  useEffect(() => {
    if (!socket) return

    socket.on('issues', (payload) => {
      const { issue, projectId: socketProjectId } = payload
      if (socketProjectId === projectId) {
        setIssues(prev => prev.map(i => i.id === issue.id ? issue : i))
        fetchIssues()
      }
    })

    return () => {
      socket.off('issues')
    }
  }, [socket, projectId, fetchIssues])

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted/20 animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted/20 animate-pulse" />
            <div className="h-4 w-48 bg-muted/20 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground">Kanban Board</h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Issue
            </button>
          </div>

          {issues.length > 0 && (
            <IssueFilter
              search={filterSearch}
              onSearchChange={setFilterSearch}
              status={filterStatus}
              onStatusChange={setFilterStatus}
              priority={filterPriority}
              onPriorityChange={setFilterPriority}
              assigneeId={filterAssigneeId}
              onAssigneeChange={setFilterAssigneeId}
              type={filterType}
              onTypeChange={setFilterType}
              onReset={handleResetFilters}
              assignees={assignees}
            />
          )}

          {filteredIssues.length === 0 && issues.length > 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] px-6">
              <div className="text-center">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground">No matching issues</h3>
                <p className="text-muted-foreground">Try adjusting your filters</p>
              </div>
            </div>
          ) : issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] px-6">
              <div className="text-center">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground">No issues yet</h3>
                <p className="text-muted-foreground">Create your first issue to get started</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredColumns.map((column) => (
                <div
                  key={column.id}
                  className="bg-white border border-border rounded-lg p-4 min-h-[500px]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{column.name}</h3>
                    <span className="text-sm text-muted-foreground">{column.issueIds.length}</span>
                  </div>

                  {column.issueIds.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No issues in {column.name}</p>
                    </div>
                  ) : (
                    <SortableContext items={column.issueIds} strategy={verticalListSortingStrategy}>
                      {column.issueIds.map((issueId) => {
                        const issue = issues.find(i => i.id === issueId)
                        if (!issue) return <div key={issueId} />
                        return <DraggableIssue key={issue.id} issue={issue} isDragging={activeId === issue.id} onEdit={handleEditIssue} isSelected={selectedIssueIds.includes(issue.id)} onToggleSelect={handleToggleIssueSelection} />
                      })}
                    </SortableContext>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <DragOverlay>
          {activeIssue ? <DraggableIssue issue={activeIssue} isDragging={true} onEdit={handleEditIssue} isSelected={false} onToggleSelect={() => {}} /> : null}
        </DragOverlay>
      </DndContext>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Issue"
        size="lg"
      >
        <FormProvider {...methods}>
          <IssueForm
            onSubmit={handleCreateIssue}
            isSubmitting={methods.formState.isSubmitting}
            submitLabel="Create Issue"
          />
        </FormProvider>
      </Modal>

      <BulkActions
        selectedIds={selectedIssueIds}
        totalCount={filteredIssues.length}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkAssigneeChange={handleBulkAssigneeChange}
        onBulkTypeChange={handleBulkTypeChange}
        onBulkPriorityChange={handleBulkPriorityChange}
        assignees={assignees}
      />
    </>
  )
}
