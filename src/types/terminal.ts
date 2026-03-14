export interface ShellConfig {
  name: string
  command: string
  args?: string[]
  icon?: string
}

export interface TerminalSession {
  sessionId: string
  shell: ShellConfig
}
