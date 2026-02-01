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
    body('slug').trim().notEmpty().withMessage('Slug is required'),
  ],
  asyncHandler(async (req: AuthRequest, res) => {
    const { name, slug, description } = req.body

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        description,
        ownerId: req.user!.id,
        members: {
          create: {
            userId: req.user!.id,
            role: 'admin',
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
          select: { id: true, name: true, key: true, type: true },
        },
      },
    })

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' })
    }

    res.json(workspace)
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
        avatar,
      },
    })

    res.json(workspace)
  })
)

export default router
