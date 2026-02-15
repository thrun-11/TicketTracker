import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Clock, User, Calendar, Edit } from 'lucide-react'
import { api } from '../api/client'
import { useToast } from '../hooks/useToast'
import { useSocket } from '../hooks/useSocket'
import { useIssueForm } from '../hooks/useIssueForm'
import { EmptyState } from '../components/EmptyState'
import { CardSkeleton } from '../components/skeletons/CardSkeleton'
import { CommentList } from '../components/CommentList'
import FileAttachments from '../components/FileAttachments'
import { Modal } from '../components/Modal'
import { IssueForm } from '../components/IssueForm'
import { FormProvider } from 'react-hook-form'
import type { Issue, Comment, IssueFormData, Attachment } from '../types'

export default function IssueDetail() {
  const { id: issueId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [issue, setIssue] = useState<Issue | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [uploadingAttachment, setUploadingAttachment] = useState(false)

  const { success: showSuccess, error: showError } = useToast()
  const socket = useSocket()
  const methods = useIssueForm({
    projectId: issue?.projectId,
  })

  const fetchIssue = useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get<Issue>(`/issues/${issueId}`)
      setIssue(response.data)
    } catch {
      showError('Failed to load issue')
    } finally {
      setLoading(false)
    }
  }, [issueId, showError])

  const fetchComments = useCallback(async () => {
    try {
      const response = await api.get<Comment[]>(`/issues/${issueId}/comments`)
      setComments(response.data)
    } catch {
      showError('Failed to load comments')
    }
  }, [issueId, showError])

  const fetchAttachments = useCallback(async () => {
    try {
      const response = await api.get<Attachment[]>(`/issues/${issueId}/attachments`)
      setAttachments(response.data)
    } catch {
    }
  }, [issueId])

  const handleUploadAttachment = async (files: FileList) => {
    setUploadingAttachment(true)
    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        await api.post(`/issues/${issueId}/attachments`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      }
      showSuccess('File(s) uploaded successfully')
      fetchAttachments()
    } catch {
      showError('Failed to upload file(s)')
    } finally {
      setUploadingAttachment(false)
    }
  }

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return
    try {
      await api.delete(`/attachments/${attachmentId}`)
      showSuccess('Attachment deleted')
      fetchAttachments()
    } catch {
      showError('Failed to delete attachment')
    }
  }

  const handleDeleteIssue = async () => {
    if (!confirm('Are you sure you want to delete this issue?')) return

    setDeleteLoading(true)
    try {
      await api.delete(`/issues/${issueId}`)
      showSuccess('Issue deleted successfully')
      navigate('/projects')
    } catch {
      showError('Failed to delete issue')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleEditIssue = async (data: IssueFormData) => {
    try {
      const response = await api.patch(`/issues/${issueId}`, data)
      setIssue(response.data as Issue)
      showSuccess('Issue updated successfully')
      setIsEditModalOpen(false)
    } catch {
      showError('Failed to update issue')
    }
  }

  const openEditModal = () => {
    if (issue) {
      methods.reset({
        title: issue.title,
        description: issue.description || '',
        type: issue.type,
        priority: issue.priority,
        assigneeId: issue.assigneeId || '',
        projectId: issue.projectId,
      })
      setIsEditModalOpen(true)
    }
  }

  const handleAddComment = (comment: Comment) => {
    setComments(prev => [...prev, comment])
  }

  const handleDeleteComment = (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  useEffect(() => {
    fetchIssue()
    fetchComments()
    fetchAttachments()
  }, [issueId, fetchIssue, fetchComments, fetchAttachments])

  useEffect(() => {
    if (!socket) return

    socket.on('comments', (payload) => {
      const { comment, issueId: socketIssueId } = payload
      if (socketIssueId === issueId) {
        setComments(prev => [...prev, comment])
      }
    })

    return () => {
      socket.off('comments')
    }
  }, [socket, issueId])

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Loading issue...</h1>
        <CardSkeleton />
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="p-6">
        <EmptyState
          title="Issue not found"
          description="The issue you're looking for doesn't exist or has been deleted."
          action={{
            label: 'Go to Projects',
            onClick: () => navigate('/projects'),
          }}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Issues
      </button>

      <div className="space-y-6">
        <div className="bg-background border border-border rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-foreground bg-muted">
                {issue.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-primary text-primary-foreground">
                {issue.type.toUpperCase()}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={openEditModal}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={handleDeleteIssue}
                disabled={deleteLoading}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? (
                  <div className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-4">{issue.title}</h1>

          {issue.description && (
            <div className="bg-muted/20 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{issue.description}</p>
            </div>
          )}

          <FileAttachments
            attachments={attachments}
            onUpload={handleUploadAttachment}
            onDelete={handleDeleteAttachment}
            uploading={uploadingAttachment}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Created</div>
                <div className="text-sm font-medium text-foreground">
                  {new Date(issue.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Last Updated</div>
                <div className="text-sm font-medium text-foreground">
                  {new Date(issue.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">Assignee</div>
                <div className="text-sm font-medium text-foreground">
                  {issue.assignee?.name || 'Unassigned'}
                </div>
              </div>
            </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-foreground bg-muted">
                {issue.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-primary text-primary-foreground">
                {issue.type.toUpperCase()}
              </span>
            </div>
            <button
              onClick={openEditModal}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={handleDeleteIssue}
              disabled={deleteLoading}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              {deleteLoading ? (
                <div className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-6">
            <CommentList
              issueId={issueId!}
              comments={comments}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
            />
           </div>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Issue"
        size="lg"
      >
        <FormProvider {...methods}>
          <IssueForm
            onSubmit={handleEditIssue}
            isSubmitting={methods.formState.isSubmitting}
            submitLabel="Save Changes"
          />
        </FormProvider>
      </Modal>
    </div>
   )
}
