import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useToast } from '../hooks/useToast'
import { useWorkspaceForm } from '../hooks/useWorkspaceForm'
import { Modal } from '../components/Modal'
import WorkspaceForm, { WorkspaceFormData } from '../components/WorkspaceForm'
import { FormProvider } from 'react-hook-form'
import { Plus, Users, FolderOpen, Trash2, X, Mail } from 'lucide-react'
import type { Workspace } from '../types'

export default function Workspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null)
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
  const [memberEmail, setMemberEmail] = useState('')

  const { success, error } = useToast()
  const methods = useWorkspaceForm()

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get<Workspace[]>('/workspaces')
      setWorkspaces(response.data)
    } catch {
      error('Failed to load workspaces')
    } finally {
      setLoading(false)
    }
  }, [error])

  const handleCreateWorkspace = async (data: WorkspaceFormData) => {
    try {
      await api.post('/workspaces', data)
      success('Workspace created successfully')
      setIsCreateModalOpen(false)
      methods.reset()
      fetchWorkspaces()
    } catch {
      error('Failed to create workspace')
    }
  }

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (!confirm('Are you sure you want to delete this workspace?')) return

    try {
      await api.delete(`/workspaces/${workspaceId}`)
      success('Workspace deleted successfully')
      fetchWorkspaces()
    } catch {
      error('Failed to delete workspace')
    }
  }

  const handleOpenMembersModal = (workspace: Workspace) => {
    setSelectedWorkspace(workspace)
    setIsMembersModalOpen(true)
  }

  const handleCloseMembersModal = () => {
    setSelectedWorkspace(null)
    setIsMembersModalOpen(false)
    setMemberEmail('')
  }

  const handleAddMember = async () => {
    if (!selectedWorkspace || !memberEmail) return

    try {
      await api.post(`/workspaces/${selectedWorkspace.id}/members`, { email: memberEmail })
      success('Member added successfully')
      setMemberEmail('')
      fetchWorkspaces()
    } catch {
      error('Failed to add member')
    }
  }

  const handleRemoveMember = async (workspaceId: string, memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      await api.delete(`/workspaces/${workspaceId}/members/${memberId}`)
      success('Member removed successfully')
      fetchWorkspaces()
    } catch {
      error('Failed to remove member')
    }
  }

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

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
            <h1 className="text-3xl font-bold text-foreground">Workspaces</h1>
            <p className="text-muted-foreground mt-1">Manage your workspaces and teams</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Workspace
          </button>
        </div>

        {workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] px-6">
            <div className="text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground">No workspaces yet</h3>
              <p className="text-muted-foreground">Create your first workspace to get started</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((workspace) => (
              <Link
                key={workspace.id}
                to={`/workspaces/${workspace.id}`}
                className="bg-white border border-border rounded-lg p-6 hover:border-primary/50 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary-700 font-bold text-lg">
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleOpenMembersModal(workspace)
                      }}
                      className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                      title="Manage Members"
                    >
                      <Users className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleDeleteWorkspace(workspace.id)
                      }}
                      className="p-1.5 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">{workspace.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {workspace.description || 'No description'}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>{workspace._count?.members || workspace.members?.length || 0} members</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Workspace"
        size="lg"
      >
        <FormProvider {...methods}>
          <WorkspaceForm
            onSubmit={handleCreateWorkspace}
            isSubmitting={methods.formState.isSubmitting}
            submitLabel="Create Workspace"
          />
        </FormProvider>
      </Modal>

      <Modal
        isOpen={isMembersModalOpen}
        onClose={handleCloseMembersModal}
        title="Manage Members"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Add Member</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full pl-9 pr-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
              <button
                onClick={handleAddMember}
                disabled={!memberEmail}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-medium text-foreground mb-3">Members</h4>
            {selectedWorkspace?.members && selectedWorkspace.members.length > 0 ? (
              <div className="space-y-2">
                {selectedWorkspace.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary-700 font-medium text-sm">
                        {member.user?.name?.charAt(0).toUpperCase() || member.userId.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{member.user?.name || member.userId}</p>
                        <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                      </div>
                    </div>
                    {member.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(selectedWorkspace.id, member.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive rounded hover:bg-destructive/10"
                        title="Remove member"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No members yet</p>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}
