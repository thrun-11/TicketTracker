// User Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  timezone?: string
  role: 'admin' | 'owner' | 'developer' | 'reporter' | 'viewer'
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Workspace Types
export interface Workspace {
  id: string
  name: string
  slug: string
  description?: string
  members: WorkspaceMember[]
  _count?: {
    members: number
    projects: number
  }
  createdAt: string
  updatedAt: string
}

export interface WorkspaceMember {
  id: string
  userId: string
  workspaceId: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
  user?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

// Project Types
export interface Project {
  id: string
  name: string
  description?: string
  type: 'scrum' | 'kanban' | 'bug_tracking' | 'custom'
  visibility: 'public' | 'private'
  workspaceId: string
  leadId?: string
  lead?: User
  createdAt: string
  updatedAt: string
  _count?: {
    issues: number
  }
}

// Issue Types
export type IssueType = 'epic' | 'story' | 'task' | 'bug' | 'subtask'
export type IssuePriority = 'critical' | 'high' | 'medium' | 'low'
export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done'

export interface Issue {
  id: string
  title: string
  description?: string
  type: IssueType
  priority: IssuePriority
  status: IssueStatus
  columnId?: string
  assigneeId?: string
  assignee?: User
  creatorId: string
  creator?: User
  projectId: string
  parentId?: string
  storyPoints?: number
  dueDate?: string
  labels: Label[]
  createdAt: string
  updatedAt: string
}

export interface IssueFormData {
  title: string
  description?: string
  type: IssueType
  priority: IssuePriority
  assigneeId?: string
  projectId?: string
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

export interface SprintFormData {
  name: string
  goal?: string
  startDate?: string
  endDate?: string
}

// Label Types
export interface Label {
  id: string
  name: string
  color: string
  projectId?: string
}

export interface LabelFormData {
  name: string
  color: string
}

// Comment Types
export interface Comment {
  id: string
  content: string
  userId: string
  user?: User
  issueId: string
  parentId?: string
  createdAt: string
  updatedAt: string
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

export interface TimeLogFormData {
  timeSpent: string
  description?: string
  spentDate: string
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
