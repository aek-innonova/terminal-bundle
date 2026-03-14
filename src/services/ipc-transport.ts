import type { TerminalTransport } from './transport'
import type { ShellConfig, TerminalSession } from '@/types/terminal'

interface TerminalAPI {
  listShells(): Promise<ShellConfig[]>
  createSession(options?: {
    shellType?: string
    cols?: number
    rows?: number
  }): Promise<TerminalSession>
  sendData(sessionId: string, data: string): void
  resize(sessionId: string, cols: number, rows: number): void
  closeSession(sessionId: string): void
  onOutput(callback: (event: { sessionId: string; data: string }) => void): void
  onExit(callback: (event: { sessionId: string; exitCode: number }) => void): void
  removeAllListeners(): void
}

declare global {
  interface Window {
    terminalAPI?: TerminalAPI
  }
}

export function createIpcTransport(): TerminalTransport {
  const api = window.terminalAPI!

  const outputCallbacks = new Set<(payload: { sessionId: string; data: string }) => void>()
  const exitCallbacks = new Set<(payload: { sessionId: string; exitCode: number }) => void>()
  let bound = false

  function ensureBound() {
    if (bound) return
    bound = true
    api.onOutput((event) => {
      for (const cb of outputCallbacks) cb(event)
    })
    api.onExit((event) => {
      for (const cb of exitCallbacks) cb(event)
    })
  }

  return {
    getShells: () => api.listShells(),
    createSession: (opts) => api.createSession(opts),
    sendData: (sessionId, data) => api.sendData(sessionId, data),
    resize: (sessionId, cols, rows) => api.resize(sessionId, cols, rows),
    closeSession: (sessionId) => api.closeSession(sessionId),

    onOutput(callback) {
      ensureBound()
      outputCallbacks.add(callback)
    },
    offOutput(callback) {
      outputCallbacks.delete(callback)
    },
    onExit(callback) {
      ensureBound()
      exitCallbacks.add(callback)
    },
    offExit(callback) {
      exitCallbacks.delete(callback)
    },
    disconnect() {
      outputCallbacks.clear()
      exitCallbacks.clear()
      api.removeAllListeners()
      bound = false
    },
  }
}
