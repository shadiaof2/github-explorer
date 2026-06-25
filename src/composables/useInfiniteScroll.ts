import { ref, onMounted, onUnmounted } from 'vue'
export function useInfiniteScroll(
  loadMore: () => Promise<void>,
  options: { threshold?: number; enabled?: boolean } = {},
) {
  const { threshold = 100, enabled = true } = options
  const isLoading = ref(false)
  const hasMore = ref(true)
  let scrollElement: HTMLElement | Window | null = null
  let scrollHandler: (() => void) | null = null
  const checkScroll = async () => {
    if (!enabled || isLoading.value || !hasMore.value) return
    const element =
      scrollElement === window ? document.documentElement : (scrollElement as HTMLElement)
    let scrollTop: number
    let scrollHeight: number
    let clientHeight: number
    if (scrollElement === window) {
      scrollTop = window.scrollY
      scrollHeight = document.documentElement.scrollHeight
      clientHeight = window.innerHeight
    } else {
      const el = element as HTMLElement
      scrollTop = el.scrollTop
      scrollHeight = el.scrollHeight
      clientHeight = el.clientHeight
    }
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      isLoading.value = true
      await loadMore()
      isLoading.value = false
    }
  }
  const setScrollElement = (el: HTMLElement | Window | null) => {
    if (scrollHandler) {
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', scrollHandler)
      }
    }
    scrollElement = el || window

    scrollHandler = () => checkScroll()
    scrollElement.addEventListener('scroll', scrollHandler)
  }
  const reset = () => {
    hasMore.value = true
    isLoading.value = false
  }
  const setHasMore = (value: boolean) => {
    hasMore.value = value
  }
  onMounted(() => {
    setScrollElement(window)
  })
  onUnmounted(() => {
    if (scrollHandler && scrollElement) {
      scrollElement.removeEventListener('scroll', scrollHandler)
    }
  })
  return {
    isLoading,
    hasMore,
    setHasMore,
    setScrollElement,
    reset,
    checkScroll,
  }
}
