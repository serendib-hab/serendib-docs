<template>
  <div class="mermaid-card" :class="{ 'is-fullscreen': isFullscreen }">
    <!-- Action Toolbar -->
    <div class="mermaid-toolbar">
      <div class="toolbar-left">
        <span class="diagram-tag">Architecture Diagram</span>
      </div>
      <div class="toolbar-right">
        <button class="tool-btn" @click="zoomIn" title="Zoom In (+)" aria-label="Zoom In">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <button class="tool-btn" @click="zoomOut" title="Zoom Out (-)" aria-label="Zoom Out">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <button class="tool-btn" @click="resetZoom" title="Reset Zoom" aria-label="Reset Zoom">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
        </button>
        <button class="tool-btn" @click="toggleFullscreen" :title="isFullscreen ? 'Exit Fullscreen (Esc)' : 'Full Screen'" aria-label="Toggle Fullscreen">
          <svg v-if="!isFullscreen" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
          </svg>
          <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- Diagram Display Area -->
    <div
      ref="viewportRef"
      class="mermaid-viewport"
      @wheel="handleWheel"
      @mousedown="startPan"
    >
      <div v-if="loading" class="mermaid-loading">Rendering architecture diagram...</div>
      <div v-if="error" class="mermaid-error">
        <span class="error-title">Diagram Render Error:</span>
        <code>{{ error }}</code>
      </div>
      <div
        v-show="!loading && !error"
        ref="contentRef"
        class="mermaid-svg-container"
        :style="{
          transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
          transformOrigin: 'center center'
        }"
        v-html="svg"
      ></div>
    </div>

    <!-- Fullscreen Backdrop Hint -->
    <div v-if="isFullscreen" class="fullscreen-hint">
      Press <kbd>Esc</kbd> to exit full screen &bull; Scroll to zoom &bull; Drag to pan
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  graph: string
}>()

const viewportRef = ref<HTMLElement>()
const contentRef = ref<HTMLElement>()
const svg = ref('')
const loading = ref(true)
const error = ref('')

const zoomLevel = ref(1)
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const startX = ref(0)
const startY = ref(0)
const isFullscreen = ref(false)

const renderDiagram = async () => {
  if (typeof window === 'undefined') return

  try {
    loading.value = true
    error.value = ''

    // Wait for web fonts to load so SVG bounding boxes calculate accurately
    if (document.fonts) {
      await document.fonts.ready
    }

    const mermaid = (await import('mermaid')).default
    const isDark = document.documentElement.classList.contains('dark')

    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        padding: 18,
        nodeSpacing: 45,
        rankSpacing: 45,
        curve: 'basis'
      },
      sequence: {
        useMaxWidth: true,
        showSequenceNumbers: false,
        actorMargin: 55,
        messageMargin: 38,
        boxMargin: 12,
        wrap: true
      },
      themeVariables: {
        fontSize: '13.5px',
        nodePadding: '18px'
      }
    })

    const rawCode = decodeURIComponent(props.graph).trim()
    const id = 'mermaid-' + Math.random().toString(36).substring(2, 9)
    const { svg: renderedSvg } = await mermaid.render(id, rawCode)

    svg.value = renderedSvg
    loading.value = false
    resetZoom()
  } catch (err: any) {
    console.error('Mermaid render error:', err)
    error.value = err?.message || String(err)
    loading.value = false
  }
}

// Zoom controls
const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value + 0.2, 3.5)
}

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value - 0.2, 0.4)
}

const resetZoom = () => {
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
}

// Mouse Wheel Zoom
const handleWheel = (e: WheelEvent) => {
  if (e.ctrlKey || isFullscreen.value) {
    e.preventDefault()
    if (e.deltaY < 0) {
      zoomIn()
    } else {
      zoomOut()
    }
  }
}

// Pan / Dragging
const startPan = (e: MouseEvent) => {
  if (e.button !== 0) return // Left click only
  isPanning.value = true
  startX.value = e.clientX - panX.value
  startY.value = e.clientY - panY.value

  const onMouseMove = (moveEvent: MouseEvent) => {
    if (!isPanning.value) return
    panX.value = moveEvent.clientX - startX.value
    panY.value = moveEvent.clientY - startY.value
  }

  const onMouseUp = () => {
    isPanning.value = false
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

// Fullscreen toggle
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  resetZoom()
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// Keydown for Escape key
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isFullscreen.value) {
    toggleFullscreen()
  }
}

onMounted(() => {
  renderDiagram()
  window.addEventListener('keydown', handleKeyDown)

  const observer = new MutationObserver(() => {
    renderDiagram()
  })
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})

watch(() => props.graph, () => {
  renderDiagram()
})
</script>

<style scoped>
.mermaid-card {
  position: relative;
  margin: 24px 0;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.mermaid-card:hover {
  border-color: var(--vp-c-brand-1);
}

/* Toolbar */
.mermaid-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background-color: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  user-select: none;
}

.diagram-tag {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-text-2);
}

.toolbar-right {
  display: flex;
  gap: 6px;
  align-items: center;
}

.tool-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.15s ease;
}

.tool-btn:hover {
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-divider);
}

.tool-btn:active {
  transform: scale(0.95);
}

/* Viewport */
.mermaid-viewport {
  position: relative;
  min-height: 180px;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  cursor: grab;
}

.mermaid-viewport:active {
  cursor: grabbing;
}

.mermaid-svg-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 100%;
  overflow: visible;
  transition: transform 0.1s ease-out;
}

.mermaid-svg-container :deep(svg) {
  overflow: visible !important;
  max-width: 100%;
  height: auto !important;
  max-height: 520px;
  user-select: none;
}

/* Ensure text inside SVG and foreignObject never clips */
.mermaid-svg-container :deep(foreignObject),
.mermaid-svg-container :deep(foreignObject > div),
.mermaid-svg-container :deep(.nodeLabel),
.mermaid-svg-container :deep(.edgeLabel),
.mermaid-svg-container :deep(text) {
  overflow: visible !important;
  white-space: normal !important;
  line-height: 1.35 !important;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  font-size: 13.5px !important;
}

.mermaid-loading {
  font-size: 0.88rem;
  color: var(--vp-c-text-3);
}

.mermaid-error {
  color: var(--vp-c-danger-1);
  background: var(--vp-c-danger-soft);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
}

/* Fullscreen Modal View */
.mermaid-card.is-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  margin: 0;
  border-radius: 0;
  border: none;
  background-color: var(--vp-c-bg);
  display: flex;
  flex-direction: column;
}

.mermaid-card.is-fullscreen .mermaid-viewport {
  flex: 1;
  height: calc(100vh - 80px);
  padding: 32px;
}

.mermaid-card.is-fullscreen .mermaid-svg-container :deep(svg) {
  max-width: 90vw;
  max-height: 80vh;
}

.fullscreen-hint {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
  padding: 6px 14px;
  border-radius: 20px;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.fullscreen-hint kbd {
  background-color: var(--vp-c-bg-soft);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  font-size: 0.75rem;
}
</style>
