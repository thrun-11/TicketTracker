import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { asyncHandler } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

router.get(
  '/:issueId',
  asyncHandler(async (req: AuthRequest, res) => {
    const attachments = await prisma.attachment.findMany({
      where: {
        issueId: req.params.issueId,
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(attachments)
  })
)

router.post(
  '/:issueId',
  asyncHandler(async (req: AuthRequest, res) => {
    const { filename, originalName, mimeType, size, url } = req.body

    const attachment = await prisma.attachment.create({
      data: {
        filename,
        originalName,
        mimeType,
        size: BigInt(size),
        url,
        issueId: req.params.issueId,
        uploadedById: req.user!.id,
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })

    res.status(201).json(attachment)
  })
)

router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    await prisma.attachment.delete({
      where: { id: req.params.id },
    })

    res.status(204).send()
  })
)

export default router
