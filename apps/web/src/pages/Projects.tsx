import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Search } from 'lucide-react'
import { api } from '../api/client'
import { useToast } from '../hooks/useToast'
import { useProjectForm, type ProjectFormData } from '../hooks/useProjectForm'
import { EmptyState } from '../components/EmptyState'
import { CardSkeleton } from '../components/skeletons/CardSkeleton'
import { Modal } from '../components/Modal'
import { ProjectForm } from '../components/ProjectForm'
import { FormProvider } from 'react-hook-form'
import type { Project, Workspace } from '../types'

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null)

  const { success: showSuccess, error: showError } = useToast()
  const methods = useProjectForm()

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get<Project[]>('/projects')
      setProjects(response.data)
    } catch {
      showError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [showError])

  const fetchWorkspaces = useCallback(async () => {
    try {
      const response = await api.get<Workspace[]>('/workspaces')
      setWorkspaces(response.data)
      if (response.data.length > 0 && !selectedWorkspace) {
        setSelectedWorkspace(response.data[0].id)
      }
    } catch {
      showError('Failed to load workspaces')
    }
  }, [selectedWorkspace, showError])

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateProject = async (data: ProjectFormData) => {
    if (!selectedWorkspace) {
      showError('Please create a workspace first')
      return
    }

    try {
      await api.post('/projects', { ...data, workspaceId: selectedWorkspace })
      showSuccess('Project created successfully')
      setIsCreateModalOpen(false)
      fetchProjects()
    } catch {
      showError('Failed to create project')
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    setIsDeleting(id)
    try {
      await api.delete(`/projects/${id}`)
      setProjects(projects.filter(p => p.id !== id))
      showSuccess('Project deleted successfully')
    } catch {
      showError('Failed to delete project')
    } finally {
      setIsDeleting(null)
    }
  }

  useEffect(() => {
    fetchProjects()
    fetchWorkspaces()
  }, [fetchProjects, fetchWorkspaces])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">Projects</h1>
      
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:pl-10"
          />
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to get started with tracking your issues."
          icon={<Plus className="h-12 w-12 text-muted-foreground" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}/board`}
              className="block border border-border rounded-lg p-6 hover:border-primary/50 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDeleteProject(project.id)
                    }}
                    disabled={isDeleting === project.id}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete project"
                  >
                    {isDeleting === project.id ? (
                      <div className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  <p>Created: {new Date(project.createdAt).toLocaleDateString()}</p>
                  <p>Last updated: {new Date(project.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Project"
        size="lg"
      >
        <FormProvider {...methods}>
          <ProjectForm
            onSubmit={handleCreateProject}
            isSubmitting={methods.formState.isSubmitting}
            submitLabel="Create Project"
            workspaces={workspaces}
            selectedWorkspace={selectedWorkspace || ''}
            onWorkspaceChange={setSelectedWorkspace}
          />
        </FormProvider>
      </Modal>
    </div>
  )
}
