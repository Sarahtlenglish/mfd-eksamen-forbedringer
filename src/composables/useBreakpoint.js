import { ref, onMounted, onUnmounted } from 'vue'

export function useBreakpoint(tabletWidth = 1024) {
  const isTablet = ref(window.innerWidth <= tabletWidth)
  const update = () => {
    isTablet.value = window.innerWidth <= tabletWidth
  }
  onMounted(() => window.addEventListener('resize', update))
  onUnmounted(() => window.removeEventListener('resize', update))
  return { isTablet }
}
