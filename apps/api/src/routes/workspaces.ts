import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { body } from 'express-validator'
import { asyncHandler } from '../middleware/errorHandler'
import { AuthRequest, requireRole } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// Get all workspaces for user
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: req.user!.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        _count: {
          select: { members: true, projects: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(workspaces)
  })
)

// Create workspace
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
  ],
  asyncHandler(async (req: AuthRequest, res) => {
    const { name, description } = req.body

    const slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 8)

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        description,
        members: {
          create: {
            userId: req.user!.id,
            role: 'owner',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
      },
    })

    res.status(201).json(workspace)
  })
)

// Get workspace by ID
router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: req.params.id,
        members: {
          some: {
            userId: req.user!.id,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        projects: {
          select: { id: true, name: true },
        },
      },
    })

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' })
    }

    res.json(workspace)
  })
)

// Get workspace projects
router.get(
  '/:id/projects',
  asyncHandler(async (req: AuthRequest, res) => {
    const projects = await prisma.project.findMany({
      where: {
        workspaceId: req.params.id,
      },
      include: {
        _count: {
          select: { issues: true },
        },
        lead: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(projects)
  })
)

// Update workspace
router.put(
  '/:id',
  requireRole('admin', 'owner'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { name, description, avatar } = req.body

    const workspace = await prisma.workspace.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
      },
    })

    res.json(workspace)
  })
)

// Delete workspace
router.delete(
  '/:id',
  requireRole('admin', 'owner'),
  asyncHandler(async (req: AuthRequest, res) => {
    await prisma.workspace.delete({
      where: { id: req.params.id },
    })

    res.status(204).send()
  })
)

// Add member to workspace
router.post(
  '/:id/members',
  requireRole('admin', 'owner'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { email, role = 'member' } = req.body

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId: req.params.id,
        userId: user.id,
        role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
    })

    res.status(201).json(member)
  })
)

// Remove member from workspace
router.delete(
  '/:id/members/:userId',
  requireRole('admin', 'owner'),
  asyncHandler(async (req: AuthRequest, res) => {
    await prisma.workspaceMember.deleteMany({
      where: {
        workspaceId: req.params.id,
        userId: req.params.userId,
      },
    })

    res.status(204).send()
  })
)

export default router
