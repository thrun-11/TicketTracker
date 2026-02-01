// User Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  timezone: string
  role: 'admin' | 'owner' | 'developer' | 'reporter' | 'viewer'
  createdAt: string
  updatedAt: string
}

// Workspace Types
export interface Workspace {
  id: string
  name: string
  slug: string
  description?: string
  avatar?: string
  ownerId: string
  members: WorkspaceMember[]
  createdAt: string
  updatedAt: string
}

export interface WorkspaceMember {
  id: string
  userId: string
  workspaceId: string
  role: 'admin' | 'member'
  joinedAt: string
}

// Project Types
export interface Project {
  id: string
  name: string
  key: string
  description?: string
  avatar?: string
  type: 'scrum' | 'kanban' | 'bug_tracking' | 'custom'
  visibility: 'public' | 'private'
  workspaceId: string
  workflowId: string
  leadId?: string
  createdAt: string
  updatedAt: string
}

// Issue Types
export type IssueType = 'epic' | 'story' | 'task' | 'bug' | 'subtask'
export type IssuePriority = 'critical' | 'high' | 'medium' | 'low'
export type IssueStatus = 'todo' | 'in_progress' | 'review' | 'done'

export interface Issue {
  id: string
  title: string
  description?: string
  type: IssueType
  priority: IssuePriority
  status: IssueStatus
  assigneeId?: string
  assignee?: User
  reporterId: string
  reporter?: User
  projectId: string
  sprintId?: string
  parentId?: string
  storyPoints?: number
  dueDate?: string
  labels: Label[]
  createdAt: string
  updatedAt: string
}

// Sprint Types
export interface Sprint {
  id: string
  name: string
  goal?: string
  startDate?: string
  endDate?: string
  status: 'planning' | 'active' | 'completed'
  projectId: string
  totalPoints: number
  completedPoints: number
  createdAt: string
  updatedAt: string
}

// Label Types
export interface Label {
  id: string
  name: string
  color: string
  projectId?: string
}

// Comment Types
export interface Comment {
  id: string
  content: string
  authorId: string
  author?: User
  issueId: string
  parentId?: string
  createdAt: string
  updatedAt: string
}

// Workflow Types
export interface Workflow {
  id: string
  name: string
  projectId?: string
  states: WorkflowState[]
  transitions: WorkflowTransition[]
}

export interface WorkflowState {
  id: string
  name: string
  category: 'todo' | 'in_progress' | 'done'
  order: number
  color?: string
}

export interface WorkflowTransition {
  id: string
  fromStateId: string
  toStateId: string
  conditions?: unknown
  actions?: unknown
}

// Attachment Types
export interface Attachment {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  issueId: string
  uploadedById: string
  createdAt: string
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  type: 'issue_assigned' | 'mention' | 'status_changed' | 'comment' | 'sprint'
  title: string
  message: string
  data?: unknown
  read: boolean
  createdAt: string
}

// Time Log Types
export interface TimeLog {
  id: string
  issueId: string
  userId: string
  timeSpent: number // in minutes
  description?: string
  spentDate: string
  createdAt: string
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
