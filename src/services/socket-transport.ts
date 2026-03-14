import { io, type Socket } from 'socket.io-client'
import type { TerminalTransport } from './transport'
import type { ShellConfig, TerminalSession } from '@/types/terminal'

const SERVER_URL = 'ws://localhost:3000'

export function createSocketTransport(): TerminalTransport {
  let socket: Socket | null = null

  function getSocket(): Socket {
    if (!socket) {
      socket = io(SERVER_URL)
    }
    return socket
  }

  return {
    getShells(): Promise<ShellConfig[]> {
      return new Promise((resolve) => {
        getSocket().emit('terminal:shells', resolve)
      })
    },

    createSession(opts?: {
      shellType?: string
      cols?: number
      rows?: number
    }): Promise<TerminalSession> {
      return new Promise((resolve) => {
        getSocket().emit('terminal:create', opts ?? {}, resolve)
      })
    },

    sendData(sessionId: string, data: string): void {
      getSocket().emit('terminal:data', { sessionId, data })
    },

    resize(sessionId: string, cols: number, rows: number): void {
      getSocket().emit('terminal:resize', { sessionId, cols, rows })
    },

    closeSession(sessionId: string): void {
      getSocket().emit('terminal:close', { sessionId })
    },

    onOutput(callback: (payload: { sessionId: string; data: string }) => void): void {
      getSocket().on('terminal:output', callback)
    },

    offOutput(callback: (payload: { sessionId: string; data: string }) => void): void {
      getSocket().off('terminal:output', callback)
    },

    onExit(callback: (payload: { sessionId: string; exitCode: number }) => void): void {
      getSocket().on('terminal:exit', callback)
    },

    offExit(callback: (payload: { sessionId: string; exitCode: number }) => void): void {
      getSocket().off('terminal:exit', callback)
    },

    disconnect(): void {
      socket?.disconnect()
      socket = null
    },
  }
}
