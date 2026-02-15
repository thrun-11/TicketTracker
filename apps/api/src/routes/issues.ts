import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { body } from 'express-validator'
import { asyncHandler } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import { io } from '../server'

const router = Router()
const prisma = new PrismaClient()

router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const { projectId } = req.query

    const issues = await prisma.issue.findMany({
      where: projectId ? { projectId: projectId as string } : undefined,
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true },
        },
        creator: {
          select: { id: true, name: true, avatar: true },
        },
        comments: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(issues)
  })
)

router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const issue = await prisma.issue.findUnique({
      where: { id: req.params.id },
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true },
        },
        creator: {
          select: { id: true, name: true, avatar: true },
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        parent: true,
        subIssues: true,
      },
    })

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' })
    }

    res.json(issue)
  })
)

router.get(
  '/:id/comments',
  asyncHandler(async (req: AuthRequest, res) => {
    const comments = await prisma.comment.findMany({
      where: { issueId: req.params.id },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    res.json(comments)
  })
)

router.post(
  '/:id/comments',
  [
    body('content').trim().notEmpty().withMessage('Comment content is required'),
  ],
  asyncHandler(async (req: AuthRequest, res) => {
    const { content } = req.body

    const comment = await prisma.comment.create({
      data: {
        content,
        issueId: req.params.id,
        userId: req.user!.id,
      },
    })

    io.to(req.params.id).emit('comment:created', comment)
    res.status(201).json(comment)
  })
)

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('projectId').notEmpty().withMessage('Project ID is required'),
    body('description').optional(),
    body('type').optional(),
    body('priority').optional(),
    body('assigneeId').optional(),
    body('parentId').optional(),
  ],
  asyncHandler(async (req: AuthRequest, res) => {
    const { title, description, type, priority, assigneeId, parentId, projectId } = req.body

    const issue = await prisma.issue.create({
      data: {
        title,
        description: description || null,
        type: type || 'task',
        priority: priority || 'medium',
        projectId,
        creatorId: req.user!.id,
        assigneeId: assigneeId || null,
        parentId: parentId || null,
      },
    })

    io.to(projectId).emit('issue:created', issue)
    res.status(201).json(issue)
  })
)

router.put(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const { title, description, type, priority, status, assigneeId } = req.body

    const issue = await prisma.issue.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description: description || null }),
        ...(type && { type }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(assigneeId && { assigneeId }),
      },
    })

    io.to(req.params.id).emit('issue:updated', issue)
    res.json(issue)
  })
)

router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    await prisma.issue.delete({
      where: { id: req.params.id },
    })

    io.to(req.params.id).emit('issue:deleted', { id: req.params.id })
    res.status(204).send()
  })
)

export default router
