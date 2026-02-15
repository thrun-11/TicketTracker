import { useState } from 'react'
import { api } from '../api/client'
import { useToast } from '../hooks/useToast'
import { Send, Trash2, ChevronUp, ChevronDown, MessageSquare } from 'lucide-react'
import type { Comment } from '../types'

interface CommentListProps {
  issueId: string
  comments: Comment[]
  onAddComment: (comment: Comment) => void
  onDeleteComment?: (commentId: string) => void
}

export function CommentList({ issueId, comments, onAddComment, onDeleteComment }: CommentListProps) {
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())

  const { success, error } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await api.post<Comment>(`/issues/${issueId}/comments`, {
        content: newComment,
      })
      onAddComment(response.data)
      setNewComment('')
      success('Comment added successfully')
    } catch {
      error('Failed to add comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return

    try {
      await api.delete(`/issues/${issueId}/comments/${commentId}`)
      if (onDeleteComment) {
        onDeleteComment(commentId)
      }
      success('Comment deleted')
    } catch {
      error('Failed to delete comment')
    }
  }

  const toggleExpand = (commentId: string) => {
    const newExpanded = new Set(expandedComments)
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId)
    } else {
      newExpanded.add(commentId)
    }
    setExpandedComments(newExpanded)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Comments ({comments.length})</h2>
      </div>

      {comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-lg">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No comments yet</h3>
            <p className="text-muted-foreground">Be the first to share your thoughts</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows={3}
                    className="w-full rounded-lg border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none placeholder:text-muted-foreground"
                    disabled={isSubmitting}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-t-2 border-primary-foreground rounded-full animate-spin"></div>
                      <span className="text-xs">Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm flex-shrink-0">
                    {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm">
                        {comment.user?.name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex gap-2 ml-auto">
                      <button
                        onClick={() => toggleExpand(comment.id)}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                        title={expandedComments.has(comment.id) ? 'Collapse' : 'Expand'}
                      >
                        {expandedComments.has(comment.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {expandedComments.has(comment.id) && (
                    <p className="text-sm text-foreground mt-3">{comment.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
