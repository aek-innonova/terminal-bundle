<template>
  <div class="flex items-stretch bg-tab-bar h-10 shrink-0 select-none drag">
    <div class="flex overflow-x-auto min-w-0 pt-2 pl-2 shrink scrollbar-none">
      <button
        v-for="session in sessions"
        :key="session.sessionId"
        class="flex items-center gap-1.5 px-3 ml-px rounded-t-lg text-tab-text text-[13px] cursor-pointer whitespace-nowrap min-w-0 font-inherit bg-tab-bg hover:bg-tab-hover hover:text-tab-text-hover group no-drag"
        :class="{ '!bg-panel !text-tab-text-active': session.sessionId === activeSessionId }"
        @click="emit('select', session.sessionId)"
      >
        <span class="overflow-hidden text-ellipsis">{{ session.shell.name }}</span>
        <span
          class="text-base leading-none opacity-0 transition-opacity duration-100 group-hover:opacity-100 hover:!text-tab-text-active"
          :class="{ '!opacity-100': session.sessionId === activeSessionId }"
          @click.stop="emit('close', session.sessionId)"
          >×</span
        >
      </button>
    </div>
    <div v-if="shells.length > 1" ref="dropdownRef" class="relative flex items-center no-drag">
      <button
        class="bg-transparent border-none text-tab-text-hover text-xl leading-none cursor-pointer py-1 px-2 rounded font-inherit hover:bg-btn-hover"
        @click="toggleDropdown()"
      >
        +
      </button>
      <div
        v-show="dropdownOpen"
        class="absolute top-full left-0 bg-tab-bar border border-dropdown-border rounded py-1 z-50 min-w-[150px]"
      >
        <button
          v-for="shell in shells"
          :key="shell.command"
          class="block w-full py-1.5 px-3 bg-transparent border-none text-tab-text-hover text-[13px] text-left cursor-pointer font-inherit hover:bg-dropdown-item-hover"
          @click="handleCreate(shell)"
        >
          {{ shell.name }}
        </button>
      </div>
    </div>
    <button
      v-else
      class="bg-transparent border-none text-tab-text-hover text-xl leading-none cursor-pointer py-1 px-2 rounded font-inherit hover:bg-btn-hover no-drag"
      @click="handleCreate()"
    >
      +
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { ShellConfig, TerminalSession } from '@/types/terminal'

defineProps<{
  sessions: TerminalSession[]
  activeSessionId: string | null
  shells: ShellConfig[]
}>()

const emit = defineEmits<{
  select: [sessionId: string]
  close: [sessionId: string]
  create: [shellType?: string]
}>()

const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement>()

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function handleCreate(shell?: ShellConfig) {
  dropdownOpen.value = false
  emit('create', shell?.name)
}

function onClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    dropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  height: 0;
}
</style>
