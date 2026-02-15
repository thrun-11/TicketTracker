import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useToast } from '../hooks/useToast'
import { useSprintForm } from '../hooks/useSprintForm'
import { Modal } from '../components/Modal'
import SprintForm, { SprintFormData } from '../components/SprintForm'
import { FormProvider } from 'react-hook-form'
import { Plus, Calendar, Target, Play, CheckCircle, XCircle, Settings } from 'lucide-react'
import type { Sprint } from '../types'

export default function Sprints() {
  const { projectId } = useParams<{ projectId: string }>()
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { success, error } = useToast()
  const methods = useSprintForm()

  const fetchSprints = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const response = await api.get<Sprint[]>(`/projects/${projectId}/sprints`)
      setSprints(response.data)
    } catch {
      error('Failed to load sprints')
    } finally {
      setLoading(false)
    }
  }, [projectId, error])

  const handleCreateSprint = async (data: SprintFormData) => {
    if (!projectId) return
    try {
      await api.post(`/projects/${projectId}/sprints`, data)
      success('Sprint created successfully')
      setIsCreateModalOpen(false)
      methods.reset()
      fetchSprints()
    } catch {
      error('Failed to create sprint')
    }
  }

  const handleStartSprint = async (sprintId: string) => {
    try {
      await api.patch(`/sprints/${sprintId}`, { status: 'active' })
      success('Sprint started')
      fetchSprints()
    } catch {
      error('Failed to start sprint')
    }
  }

  const handleCompleteSprint = async (sprintId: string) => {
    if (!confirm('Are you sure you want to complete this sprint?')) return
    try {
      await api.patch(`/sprints/${sprintId}`, { status: 'completed' })
      success('Sprint completed')
      fetchSprints()
    } catch {
      error('Failed to complete sprint')
    }
  }

  const handleDeleteSprint = async (sprintId: string) => {
    if (!confirm('Are you sure you want to delete this sprint?')) return
    try {
      await api.delete(`/sprints/${sprintId}`)
      success('Sprint deleted')
      fetchSprints()
    } catch {
      error('Failed to delete sprint')
    }
  }

  useEffect(() => {
    fetchSprints()
  }, [fetchSprints])

  const activeSprint = sprints.find(s => s.status === 'active')
  const completedSprints = sprints.filter(s => s.status === 'completed')
  const plannedSprints = sprints.filter(s => s.status === 'planning')

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted/20 animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted/20 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  const renderSprintCard = (sprint: Sprint) => (
    <div
      key={sprint.id}
      className="bg-white border border-border rounded-lg p-6 hover:border-primary/50 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-foreground">{sprint.name}</h3>
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
              sprint.status === 'active' ? 'bg-green-100 text-green-700' :
              sprint.status === 'completed' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {sprint.status}
            </span>
          </div>
          {sprint.goal && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
              <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{sprint.goal}</p>
            </div>
          )}
          {(sprint.startDate || sprint.endDate) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {sprint.startDate && new Date(sprint.startDate).toLocaleDateString()}
              {sprint.startDate && sprint.endDate && ' - '}
              {sprint.endDate && new Date(sprint.endDate).toLocaleDateString()}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {sprint.status === 'planning' && (
            <button
              onClick={() => handleStartSprint(sprint.id)}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded-md"
              title="Start Sprint"
            >
              <Play className="h-4 w-4" />
            </button>
          )}
          {sprint.status === 'active' && (
            <button
              onClick={() => handleCompleteSprint(sprint.id)}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
              title="Complete Sprint"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
          <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted">
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteSprint(sprint.id)}
            className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10"
            title="Delete Sprint"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Progress</span>
          <span className="text-sm font-medium text-foreground">
            {sprint.completedPoints} / {sprint.totalPoints} points
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${sprint.totalPoints > 0 ? (sprint.completedPoints / sprint.totalPoints) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sprints</h1>
            <p className="text-muted-foreground mt-1">Manage project sprints and iterations</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Sprint
          </button>
        </div>

        {sprints.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] px-6">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground">No sprints yet</h3>
              <p className="text-muted-foreground">Create your first sprint to get started</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {activeSprint && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Active Sprint</h2>
                <div className="max-w-2xl">
                  {renderSprintCard(activeSprint)}
                </div>
              </div>
            )}

            {plannedSprints.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Planned Sprints</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plannedSprints.map(renderSprintCard)}
                </div>
              </div>
            )}

            {completedSprints.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Completed Sprints</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedSprints.map(renderSprintCard)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Sprint"
        size="lg"
      >
        <FormProvider {...methods}>
          <SprintForm
            onSubmit={handleCreateSprint}
            isSubmitting={methods.formState.isSubmitting}
            submitLabel="Create Sprint"
          />
        </FormProvider>
      </Modal>
    </>
  )
}
