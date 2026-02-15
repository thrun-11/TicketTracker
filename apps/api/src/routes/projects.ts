import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { body } from 'express-validator'
import { asyncHandler } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const projects = await prisma.project.findMany({
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

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('workspaceId').notEmpty().withMessage('Workspace ID is required'),
  ],
  asyncHandler(async (req: AuthRequest, res) => {
    const { name, description, visibility, workspaceId } = req.body

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        visibility: visibility || 'public',
        workspaceId,
        leadId: req.user!.id,
      },
    })

    res.status(201).json(project)
  })
)

router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const project = await prisma.project.findFirst({
      where: { id: req.params.id },
      include: {
        _count: {
          select: { issues: true },
        },
        lead: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    res.json(project)
  })
)

router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    await prisma.project.delete({
      where: { id: req.params.id },
    })

    res.status(204).send()
  })
)

export default router
