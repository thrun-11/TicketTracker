import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { asyncHandler } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// Get current user
router.get(
  '/me',
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        timezone: true,
        createdAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  })
)

// Update current user
router.put(
  '/me',
  asyncHandler(async (req: AuthRequest, res) => {
    const { name, avatar, timezone } = req.body

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        name,
        avatar,
        timezone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        timezone: true,
        updatedAt: true,
      },
    })

    res.json(user)
  })
)

// Get all users (admin only)
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(users)
  })
)

export default router
