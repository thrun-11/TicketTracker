import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { store } from '../store'

export function useSocket(): Socket | null {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3001', {
        auth: { token },
        transports: ['websocket', 'polling'],
      })

      socket.on('connect', () => {
        console.log('Connected to WebSocket server')
        socket.emit('subscribe', {
          userId: store.getState().auth.user?.id,
          channels: ['projects', 'issues', 'notifications'],
        })
      })

      socket.on('projects', (payload) => {
        console.log('Received projects update:', payload)
      })

      socket.on('issues', (payload) => {
        console.log('Received issues update:', payload)
      })

      socket.on('notifications', (payload) => {
        console.log('Received notification:', payload)
      })

      socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server')
      })

      socketRef.current = socket

      return () => {
        socket.disconnect()
      }
    }

    return () => {}
  }, [])

  return socketRef.current
}