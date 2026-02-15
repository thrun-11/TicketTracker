import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'

import { errorHandler } from './middleware/errorHandler'
import { authMiddleware } from './middleware/auth'

// Routes
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import projectRoutes from './routes/projects'
import issueRoutes from './routes/issues'
import workspaceRoutes from './routes/workspaces'
import sprintRoutes from './routes/sprints'
import labelRoutes from './routes/labels'
import attachmentRoutes from './routes/attachments'
import timeLogRoutes from './routes/time-logs'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.WEB_URL || 'http://localhost:5173',
    credentials: true,
  },
})

const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.WEB_URL || 'http://localhost:5173',
  credentials: true,
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})
app.use(limiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Disable caching for API routes
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  next()
})

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', authMiddleware, userRoutes)
app.use('/api/workspaces', authMiddleware, workspaceRoutes)
app.use('/api/projects', authMiddleware, projectRoutes)
app.use('/api/issues', authMiddleware, issueRoutes)
app.use('/api/sprints', authMiddleware, sprintRoutes)
app.use('/api/labels', authMiddleware, labelRoutes)
app.use('/api/attachments', authMiddleware, attachmentRoutes)
app.use('/api/time-logs', authMiddleware, timeLogRoutes)

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('join_project', (projectId: string) => {
    socket.join(`project:${projectId}`)
    console.log(`Socket ${socket.id} joined project ${projectId}`)
  })

  socket.on('leave_project', (projectId: string) => {
    socket.leave(`project:${projectId}`)
    console.log(`Socket ${socket.id} left project ${projectId}`)
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Error handling
app.use(errorHandler)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

export { io }
export default app
