import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { body } from 'express-validator'
import { asyncHandler } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

router.get(
  '/:issueId',
  asyncHandler(async (req: AuthRequest, res) => {
    const timeLogs = await prisma.timeEntry.findMany({
      where: {
        issueId: req.params.issueId,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(timeLogs)
  })
)

router.post(
  '/:issueId',
  [
    body('timeSpent').trim().notEmpty().withMessage('Time spent is required'),
  ],
  asyncHandler(async (req: AuthRequest, res) => {
    const { timeSpent, description, spentDate } = req.body

    const timeLog = await prisma.timeEntry.create({
      data: {
        issueId: req.params.issueId,
        userId: req.user!.id,
        duration: parseInt(timeSpent),
        description: description || null,
        startedAt: spentDate ? new Date(spentDate) : new Date(),
        endedAt: spentDate ? new Date(spentDate) : new Date(),
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })

    res.status(201).json(timeLog)
  })
)

router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    await prisma.timeEntry.delete({
      where: { id: req.params.id },
    })

    res.status(204).send()
  })
)

export default router
