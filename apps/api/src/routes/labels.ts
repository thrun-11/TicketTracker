import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { body } from 'express-validator'
import { asyncHandler } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

router.get(
  '/:projectId',
  asyncHandler(async (req: AuthRequest, res) => {
    const labels = await prisma.label.findMany({
      where: {
        projectId: req.params.projectId,
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(labels)
  })
)

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('color').trim().notEmpty().withMessage('Color is required'),
  ],
  asyncHandler(async (req: AuthRequest, res) => {
    const { name, color, projectId } = req.body

    const label = await prisma.label.create({
      data: {
        name,
        color,
        projectId: projectId || null,
      },
    })

    res.status(201).json(label)
  })
)

router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    await prisma.label.delete({
      where: { id: req.params.id },
    })

    res.status(204).send()
  })
)

export default router
