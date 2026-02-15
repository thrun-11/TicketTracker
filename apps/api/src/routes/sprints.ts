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
    const { projectId } = req.query

    const sprints = await prisma.sprint.findMany({
      where: projectId ? { projectId: projectId as string } : undefined,
      include: {
        _count: {
          select: { issues: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(sprints)
  })
)

router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const sprint = await prisma.sprint.findUnique({
      where: { id: req.params.id },
      include: {
        issues: {
          include: {
            assignee: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    })

    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' })
    }

    res.json(sprint)
  })
)

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('projectId').notEmpty().withMessage('Project ID is required'),
  ],
  asyncHandler(async (req: AuthRequest, res) => {
    const { name, goal, startDate, endDate, projectId } = req.body

    const sprint = await prisma.sprint.create({
      data: {
        name,
        goal,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        projectId,
        status: 'planning',
      },
    })

    res.status(201).json(sprint)
  })
)

router.put(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const { name, goal, startDate, endDate, status } = req.body

    const sprint = await prisma.sprint.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(goal !== undefined && { goal: goal || null }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(status && { status }),
      },
    })

    res.json(sprint)
  })
)

router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    await prisma.sprint.delete({
      where: { id: req.params.id },
    })

    res.status(204).send()
  })
)

export default router
