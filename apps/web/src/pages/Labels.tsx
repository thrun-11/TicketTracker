import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useToast } from '../hooks/useToast'
import { useLabelForm } from '../hooks/useLabelForm'
import { Modal } from '../components/Modal'
import LabelForm, { LabelFormData } from '../components/LabelForm'
import { FormProvider } from 'react-hook-form'
import { Plus, Tag, Trash2 } from 'lucide-react'
import type { Label } from '../types'

export default function Labels() {
  const { projectId } = useParams<{ projectId: string }>()
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { success, error } = useToast()
  const methods = useLabelForm()

  const fetchLabels = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const response = await api.get<Label[]>(`/projects/${projectId}/labels`)
      setLabels(response.data)
    } catch {
      error('Failed to load labels')
    } finally {
      setLoading(false)
    }
  }, [projectId, error])

  const handleCreateLabel = async (data: LabelFormData) => {
    if (!projectId) return
    try {
      await api.post(`/projects/${projectId}/labels`, data)
      success('Label created successfully')
      setIsCreateModalOpen(false)
      methods.reset()
      fetchLabels()
    } catch {
      error('Failed to create label')
    }
  }

  const handleDeleteLabel = async (labelId: string) => {
    if (!confirm('Are you sure you want to delete this label?')) return
    try {
      await api.delete(`/labels/${labelId}`)
      success('Label deleted')
      fetchLabels()
    } catch {
      error('Failed to delete label')
    }
  }

  useEffect(() => {
    fetchLabels()
  }, [fetchLabels])

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

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Labels</h1>
            <p className="text-muted-foreground mt-1">Manage labels for your project</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Label
          </button>
        </div>

        {labels.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] px-6">
            <div className="text-center">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground">No labels yet</h3>
              <p className="text-muted-foreground">Create labels to organize your issues</p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-lg">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">All Labels</h2>
            </div>
            <div className="divide-y divide-border">
              {labels.map((label) => (
                <div
                  key={label.id}
                  className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="font-medium text-foreground">{label.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteLabel(label.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10"
                      title="Delete label"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Label"
        size="md"
      >
        <FormProvider {...methods}>
          <LabelForm
            onSubmit={handleCreateLabel}
            isSubmitting={methods.formState.isSubmitting}
            submitLabel="Create Label"
          />
        </FormProvider>
      </Modal>
    </>
  )
}
