import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { body } from 'express-validator'
import { asyncHandler } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { io } from '../server'

const router = Router()
const prisma = new PrismaClient()

// Get issue by ID
router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const issue = await prisma.issue.findUnique({
      where: { id: req.params.id },
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true },
        },
        reporter: {
          select: { id: true, name: true, avatar: true },
        },
        labels: true,
        sprint: true,
        comments: {
          include: {
            author: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        attachments: true,
        watchers: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    })

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' })
    }

    res.json(issue)
  })
)

// Create issue
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('projectId').notEmpty().withMessage('Project ID is required'),
    body('type').isIn(['epic', 'story', 'task', 'bug', 'subtask']).withMessage('Invalid type'),
  ],
  asyncHandler(async (req: AuthRequest, res) => {
    const {
      title,
      description,
      type,
      priority = 'medium',
      projectId,
      assigneeId,
      sprintId,
      parentId,
      storyPoints,
      dueDate,
      labelIds,
    } = req.body

    // Get project to find default status
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        workflowId: true,
        key: true,
        _count: { select: { issues: true } },
      },
    })

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Get default status (To Do)
    const workflowState = await prisma.workflowState.findFirst({
      where: {
        workflowId: project.workflowId,
        category: 'todo',
      },
      orderBy: { order: 'asc' },
    })

    const issueNumber = project._count.issues + 1

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        type,
        priority,
        projectId,
        reporterId: req.user!.id,
        assigneeId,
        sprintId,
        parentId,
        storyPoints,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status: workflowState?.name || 'To Do',
        key: `${project.key}-${issueNumber}`,
        labels: labelIds ? { connect: labelIds.map((id: string) => ({ id })) } : undefined,
        watchers: {
          create: {
            userId: req.user!.id,
          },
        },
      },
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true },
        },
        reporter: {
          select: { id: true, name: true, avatar: true },
        },
        labels: true,
      },
    })

    // Emit real-time update
    io.to(`project:${projectId}`).emit('issue_created', issue)

    res.status(201).json(issue)
  })
)

// Update issue
router.put(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const {
      title,
      description,
      status,
      priority,
      assigneeId,
      sprintId,
      storyPoints,
      dueDate,
      labelIds,
    } = req.body

    const issue = await prisma.issue.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        status,
        priority,
        assigneeId,
        sprintId,
        storyPoints,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        labels: labelIds ? { set: labelIds.map((id: string) => ({ id })) } : undefined,
      },
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true },
        },
        reporter: {
          select: { id: true, name: true, avatar: true },
        },
        labels: true,
      },
    })

    // Emit real-time update
    io.to(`project:${issue.projectId}`).emit('issue_updated', issue)

    res.json(issue)
  })
)

// Add comment to issue
router.post(
  '/:id/comments',
  [body('content').trim().notEmpty().withMessage('Content is required')],
  asyncHandler(async (req: AuthRequest, res) => {
    const { content } = req.body

    const issue = await prisma.issue.findUnique({
      where: { id: req.params.id },
      select: { projectId: true },
    })

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' })
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        issueId: req.params.id,
        authorId: req.user!.id,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })

    // Emit real-time update
    io.to(`project:${issue.projectId}`).emit('comment_added', { issueId: req.params.id, comment })

    res.status(201).json(comment)
  })
)

export default router
