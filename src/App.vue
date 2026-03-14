<template>
  <div class="flex flex-col h-screen w-screen overflow-hidden">
    <TerminalTabs
      :sessions="sessions"
      :active-session-id="activeSessionId"
      :shells="shells"
      @select="handleSelect"
      @close="handleClose"
      @create="handleCreate"
    />
    <div class="flex-1 min-h-0 relative overflow-hidden bg-panel">
      <TerminalPanel
        v-for="session in sessions"
        :key="session.sessionId"
        v-show="session.sessionId === activeSessionId"
        :session-id="session.sessionId"
        :ref="setPanelRef(session.sessionId)"
        @exit="handleExit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, type ComponentPublicInstance } from 'vue'
import '@xterm/xterm/css/xterm.css'
import TerminalTabs from './components/TerminalTabs.vue'
import TerminalPanel from './components/TerminalPanel.vue'
import type { ShellConfig, TerminalSession } from '@/types/terminal'
import { getShells, createSession, closeSession, disconnect } from '@/services/socket'

const sessions = ref<TerminalSession[]>([])
const activeSessionId = ref<string | null>(null)
const shells = ref<ShellConfig[]>([])
const panelRefs = ref<Record<string, InstanceType<typeof TerminalPanel>>>({})

function setPanelRef(sessionId: string) {
  return (el: Element | ComponentPublicInstance | null) => {
    if (el) panelRefs.value[sessionId] = el as InstanceType<typeof TerminalPanel>
    else delete panelRefs.value[sessionId]
  }
}

async function handleCreate(shellType?: string) {
  const cols = 80
  const rows = 24
  const session = await createSession({ shellType, cols, rows })
  sessions.value.push(session)
  activeSessionId.value = session.sessionId
  await nextTick()
  const panel = panelRefs.value[session.sessionId]
  if (panel) {
    ;(panel as any).fit()
    ;(panel as any).focus()
  }
}

function handleSelect(sessionId: string) {
  activeSessionId.value = sessionId
  nextTick(() => {
    const panel = panelRefs.value[sessionId]
    if (panel) {
      ;(panel as any).fit()
      ;(panel as any).focus()
    }
  })
}

function handleClose(sessionId: string) {
  closeSession(sessionId)
  removeSession(sessionId)
}

function handleExit(sessionId: string) {
  removeSession(sessionId)
}

function removeSession(sessionId: string) {
  const idx = sessions.value.findIndex((s) => s.sessionId === sessionId)
  if (idx === -1) return
  sessions.value.splice(idx, 1)
  if (activeSessionId.value === sessionId) {
    const next = sessions.value[Math.min(idx, sessions.value.length - 1)]
    activeSessionId.value = next?.sessionId ?? null
    if (activeSessionId.value) {
      nextTick(() => {
        const panel = panelRefs.value[activeSessionId.value!]
        if (panel) {
          ;(panel as any).fit()
          ;(panel as any).focus()
        }
      })
    }
  }
}

function handleResize() {
  if (!activeSessionId.value) return
  const panel = panelRefs.value[activeSessionId.value]
  if (panel) {
    ;(panel as any).fit()
  }
}

onMounted(async () => {
  window.addEventListener('resize', handleResize)
  try {
    shells.value = await getShells()
  } catch {
    shells.value = []
  }
  await handleCreate()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  sessions.value.forEach((s) => closeSession(s.sessionId))
  disconnect()
})
</script>
