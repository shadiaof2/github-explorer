import { ref, onMounted } from 'vue'
import type { HistoryItem } from '@/types'
const STORAGE_KEY = 'github_search_history'
const MAX_HISTORY = 10
export function useSearchHistory() {
  const history = ref<HistoryItem[]>([])
  const loadHistory = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        history.value = JSON.parse(stored)
      } catch {
        history.value = []
      }
    }
  }
  const saveHistory = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
  }
  const addHistory = (keyword: string) => {
    if (!keyword.trim()) return
    const trimmedKeyword = keyword.trim()
    // 去重
    const existingIndex = history.value.findIndex((h) => h.keyword === trimmedKeyword)
    if (existingIndex !== -1) {
      history.value.splice(existingIndex, 1)
    }
    // 添加到头部
    history.value.unshift({
      keyword: trimmedKeyword,
      timestamp: Date.now(),
    })
    // 限制数量
    if (history.value.length > MAX_HISTORY) {
      history.value = history.value.slice(0, MAX_HISTORY)
    }
    saveHistory()
  }
  const removeHistory = (index: number) => {
    history.value.splice(index, 1)
    saveHistory()
  }
  const clearHistory = () => {
    history.value = []
    saveHistory()
  }
  onMounted(() => {
    loadHistory()
  })
  return {
    history,
    addHistory,
    removeHistory,
    clearHistory,
    loadHistory,
  }
}
