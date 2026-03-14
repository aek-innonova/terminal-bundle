import type { TerminalTransport } from './transport'
import { createIpcTransport } from './ipc-transport'
import { createSocketTransport } from './socket-transport'

function createTransport(): TerminalTransport {
  if (window.terminalAPI) {
    return createIpcTransport()
  }
  return createSocketTransport()
}

const transport = createTransport()

export const getShells = transport.getShells.bind(transport)
export const createSession = transport.createSession.bind(transport)
export const sendData = transport.sendData.bind(transport)
export const resize = transport.resize.bind(transport)
export const closeSession = transport.closeSession.bind(transport)
export const onOutput = transport.onOutput.bind(transport)
export const offOutput = transport.offOutput.bind(transport)
export const onExit = transport.onExit.bind(transport)
export const offExit = transport.offExit.bind(transport)
export const disconnect = transport.disconnect.bind(transport)
