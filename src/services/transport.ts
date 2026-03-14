import type { ShellConfig, TerminalSession } from '@/types/terminal'

export interface TerminalTransport {
  getShells(): Promise<ShellConfig[]>
  createSession(opts?: {
    shellType?: string
    cols?: number
    rows?: number
  }): Promise<TerminalSession>
  sendData(sessionId: string, data: string): void
  resize(sessionId: string, cols: number, rows: number): void
  closeSession(sessionId: string): void
  onOutput(callback: (payload: { sessionId: string; data: string }) => void): void
  offOutput(callback: (payload: { sessionId: string; data: string }) => void): void
  onExit(callback: (payload: { sessionId: string; exitCode: number }) => void): void
  offExit(callback: (payload: { sessionId: string; exitCode: number }) => void): void
  disconnect(): void
}
