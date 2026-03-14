<template>
  <div ref="containerRef" class="absolute inset-2"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { sendData, resize, onOutput, offOutput, onExit, offExit } from '@/services/socket'

const props = defineProps<{
  sessionId: string
}>()

const emit = defineEmits<{
  exit: [sessionId: string, exitCode: number]
}>()

const containerRef = ref<HTMLElement>()
let terminal: Terminal | null = null
let fitAddon: FitAddon | null = null

function handleOutput(payload: { sessionId: string; data: string }) {
  if (payload.sessionId === props.sessionId) {
    terminal?.write(payload.data)
  }
}

function handleExit(payload: { sessionId: string; exitCode: number }) {
  if (payload.sessionId === props.sessionId) {
    emit('exit', payload.sessionId, payload.exitCode)
  }
}

onMounted(() => {
  if (!containerRef.value) return

  terminal = new Terminal({
    cursorBlink: true,
    cursorStyle: 'bar',
    fontSize: 16,
    fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
    theme: {
      background: '#1e1e1e',
      foreground: '#cccccc',
      cursor: '#ffffff',
      selectionBackground: '#264f78',
    },
  })

  fitAddon = new FitAddon()
  terminal.loadAddon(fitAddon)
  terminal.loadAddon(new WebLinksAddon())

  terminal.onData((data) => {
    sendData(props.sessionId, data)
  })

  terminal.onResize(({ cols, rows }) => {
    resize(props.sessionId, cols, rows)
  })

  onOutput(handleOutput)
  onExit(handleExit)

  terminal.open(containerRef.value)
  fitAddon.fit()
})

onBeforeUnmount(() => {
  offOutput(handleOutput)
  offExit(handleExit)
  terminal?.dispose()
  terminal = null
  fitAddon = null
})

function fit() {
  fitAddon?.fit()
}

function focus() {
  terminal?.focus()
}

defineExpose({ fit, focus })
</script>
