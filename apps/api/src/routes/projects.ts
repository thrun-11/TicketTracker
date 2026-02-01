import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { body } from 'express-validator'
import { asyncHandler } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// Get all projects
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { visibility: 'public' },
          {
            AND: [
              { visibility: 'private' },
              {
                members: {
                  some: {
                    userId: req.user!.id,
                  },
                },
              },
            ],
          },
        ],
      },
      include: {
        lead: {
          select: { id: true, name: true, avatar: true },
        },
        _count: {
          select: { issues: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(projects)
  })
)

// Create project
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('key').trim().isLength({ min: 2, max: 10 }).withMessage('Key must be 2-10 characters'),
    body('workspaceId').notEmpty().withMessage('Workspace ID is required'),
  ],
  asyncHandler(async (req: AuthRequest, res) => {
    const { name, key, description, type, visibility, workspaceId } = req.body

    // Check if user is member of workspace
    const workspaceMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: req.user!.id,
      },
    })

    if (!workspaceMember) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Create default workflow
    const workflow = await prisma.workflow.create({
      data: {
        name: 'Default Workflow',
        states: {
          create: [
            { name: 'To Do', category: 'todo', order: 0 },
            { name: 'In Progress', category: 'in_progress', order: 1 },
            { name: 'Review', category: 'in_progress', order: 2 },
            { name: 'Done', category: 'done', order: 3 },
          ],
        },
      },
    })

    const project = await prisma.project.create({
      data: {
        name,
        key: key.toUpperCase(),
        description,
        type: type || 'kanban',
        visibility: visibility || 'public',
        workspaceId,
        workflowId: workflow.id,
        leadId: req.user!.id,
        members: {
          create: {
            userId: req.user!.id,
            role: 'lead',
          },
        },
      },
      include: {
        workflow: {
          include: { states: true },
        },
      },
    })

    res.status(201).json(project)
  })
)

// Get project by ID
router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { visibility: 'public' },
          {
            members: {
              some: {
                userId: req.user!.id,
              },
            },
          },
        ],
      },
      include: {
        lead: {
          select: { id: true, name: true, avatar: true },
        },
        workflow: {
          include: { states: { orderBy: { order: 'asc' } } },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
      },
    })

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    res.json(project)
  })
)

// Get project issues
router.get(
  '/:id/issues',
  asyncHandler(async (req: AuthRequest, res) => {
    const { status, assignee, type, priority } = req.query

    const issues = await prisma.issue.findMany({
      where: {
        projectId: req.params.id,
        ...(status && { status: String(status) }),
        ...(assignee && { assigneeId: String(assignee) }),
        ...(type && { type: String(type) }),
        ...(priority && { priority: String(priority) }),
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
      orderBy: { createdAt: 'desc' },
    })

    res.json(issues)
  })
)

export default router
