import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import { useToast } from '../hooks/useToast'
import { useWorkspaceForm } from '../hooks/useWorkspaceForm'
import { Modal } from '../components/Modal'
import WorkspaceForm, { WorkspaceFormData } from '../components/WorkspaceForm'
import { FormProvider } from 'react-hook-form'
import { FolderOpen, Users, Calendar, ArrowRight, Edit2 } from 'lucide-react'
import type { Workspace, Project } from '../types'

export default function WorkspaceDetail() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const { success, error } = useToast()
  const methods = useWorkspaceForm()

  const fetchWorkspaceData = useCallback(async () => {
    if (!workspaceId) return
    setLoading(true)
    try {
      const [workspaceResponse, projectsResponse] = await Promise.all([
        api.get<Workspace>(`/workspaces/${workspaceId}`),
        api.get<Project[]>(`/workspaces/${workspaceId}/projects`),
      ])
      setWorkspace(workspaceResponse.data)
      setProjects(projectsResponse.data)
    } catch {
      error('Failed to load workspace')
    } finally {
      setLoading(false)
    }
  }, [workspaceId, error])

  const handleUpdateWorkspace = async (data: WorkspaceFormData) => {
    if (!workspaceId) return
    try {
      await api.patch(`/workspaces/${workspaceId}`, data)
      success('Workspace updated successfully')
      setIsEditModalOpen(false)
      methods.reset()
      fetchWorkspaceData()
    } catch {
      error('Failed to update workspace')
    }
  }

  useEffect(() => {
    fetchWorkspaceData()
  }, [fetchWorkspaceData])

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

  if (!workspace) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground">Workspace not found</h3>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/workspaces" className="text-sm text-primary hover:text-primary/80 font-medium inline-block mb-2">
              ← Back to Workspaces
            </Link>
            <h1 className="text-3xl font-bold text-foreground">{workspace.name}</h1>
            <p className="text-muted-foreground mt-1">{workspace.description || 'No description'}</p>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-border rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Members</p>
                <p className="text-2xl font-bold text-foreground">{workspace.members.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FolderOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold text-foreground">{projects.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-2xl font-bold text-foreground">
                  {new Date(workspace.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Members</h2>
          {workspace.members.length === 0 ? (
            <div className="bg-white border border-border rounded-lg p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No members yet</p>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-lg divide-y divide-border">
              {workspace.members.map((member) => (
                <div key={member.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary-700 font-medium">
                      {member.user?.name?.charAt(0).toUpperCase() || member.userId.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{member.user?.name || member.userId}</p>
                      <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                    </div>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    member.role === 'admin' || member.role === 'owner' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Projects</h2>
          {projects.length === 0 ? (
            <div className="bg-white border border-border rounded-lg p-8 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No projects in this workspace yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}/board`}
                  className="bg-white border border-border rounded-lg p-6 hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary-700 font-semibold">
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{project.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description || 'No description'}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="capitalize">{project.type}</span>
                    <span>•</span>
                    <span className="capitalize">{project.visibility}</span>
                    {project._count && (
                      <>
                        <span>•</span>
                        <span>{project._count.issues} issues</span>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Workspace"
        size="lg"
      >
        <FormProvider {...methods}>
          <WorkspaceForm
            onSubmit={handleUpdateWorkspace}
            isSubmitting={methods.formState.isSubmitting}
            submitLabel="Update Workspace"
          />
        </FormProvider>
      </Modal>
    </>
  )
}
