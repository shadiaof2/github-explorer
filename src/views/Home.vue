<template>
  <div class="home">
    <div class="container">
      <!-- 头部 -->
      <header class="header">
        <h1 class="logo">🔍 GitHub Explorer</h1>
        <button class="theme-toggle" @click="toggleTheme">
          {{ isDark ? '☀️' : '🌙' }}
        </button>
      </header>

      <!-- 搜索框 -->
      <div class="search-section">
        <input
          v-model="searchKeyword"
          type="text"
          class="search-input"
          placeholder="搜索 GitHub 用户..."
          @keyup.enter="handleSearch"
        />
        <button class="search-btn" @click="handleSearch" :disabled="loading">
          {{ loading ? '搜索中...' : '搜索' }}
        </button>
      </div>

      <!-- 搜索历史 -->
      <div v-if="history.length > 0 && !searchPerformed" class="history-section">
        <div class="history-header">
          <span>📜 最近搜索</span>
          <button class="clear-history" @click="clearHistory">清空</button>
        </div>
        <div class="history-list">
          <span
            v-for="(item, idx) in history"
            :key="item.timestamp"
            class="history-tag"
            @click="searchFromHistory(item.keyword)"
          >
            {{ item.keyword }}
            <button class="history-remove" @click.stop="removeHistory(idx)">×</button>
          </span>
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-message">⚠️ {{ error }}</div>

      <!-- 用户列表 -->
      <div class="users-grid">
        <UserCard v-for="user in users" :key="user.id" :user="user" @click="goToDetail" />

        <!-- 骨架屏 -->
        <template v-if="loading && users.length === 0">
          <SkeletonCard v-for="i in 6" :key="i" />
        </template>
      </div>

      <!-- 加载更多指示器 -->
      <div v-if="loading && users.length > 0" class="loading-more">
        <LoadingSpinner text="加载更多..." />
      </div>

      <!-- 没有更多数据 -->
      <div v-if="!hasMore && users.length > 0" class="no-more">没有更多用户了</div>

      <!-- 空状态 -->
      <div v-if="!loading && users.length === 0 && searchPerformed" class="empty-state">
        <p>😢 没有找到相关用户</p>
        <p class="empty-hint">试试其他关键词吧~</p>
      </div>

      <!-- 底部哨兵元素 - 用于触发无限滚动 -->
      <div ref="sentinel" style="height: 20px"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGitHub } from '@/composables/useGitHub'
import { useSearchHistory } from '@/composables/useSearchHistory'
import { useFavoritesStore } from '@/stores/favorites'
import UserCard from '@/components/UserCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import type { GitHubUser } from '@/types'

const router = useRouter()
const { loading: apiLoading, error: apiError, search } = useGitHub()
const { history, addHistory, removeHistory, clearHistory } = useSearchHistory()
const favoritesStore = useFavoritesStore()

const searchKeyword = ref('')
const users = ref<GitHubUser[]>([])
const currentPage = ref(1)
const hasMoreData = ref(true)
const searchPerformed = ref(false)
const isLoadingMore = ref(false)
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const loading = computed(() => apiLoading.value || isLoadingMore.value)
const error = computed(() => apiError.value)
const hasMore = computed(() => hasMoreData.value)

// 主题切换
const isDark = ref(false)
const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// 加载用户数据 - 每页加载50个用户以确保有滚动条
const loadUsers = async (reset: boolean = false) => {
  if (!searchKeyword.value.trim()) return

  if (reset) {
    currentPage.value = 1
    hasMoreData.value = true
    users.value = []
  }

  if (!hasMoreData.value) return

  isLoadingMore.value = true
  const result = await search(searchKeyword.value, currentPage.value, 50)
  isLoadingMore.value = false

  if (result) {
    if (reset) {
      users.value = result.items
    } else {
      users.value = [...users.value, ...result.items]
    }

    hasMoreData.value = users.value.length < result.total_count && result.items.length > 0
    currentPage.value++
  } else {
    hasMoreData.value = false
  }
}

// 搜索
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) return

  searchPerformed.value = true
  addHistory(searchKeyword.value)
  await loadUsers(true)
}

// 从历史记录搜索
const searchFromHistory = async (keyword: string) => {
  searchKeyword.value = keyword
  searchPerformed.value = true
  addHistory(keyword)
  await loadUsers(true)
}

// 跳转详情页
const goToDetail = (username: string) => {
  router.push(`/user/${username}`)
}

// 初始化主题
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.setAttribute('data-theme', 'dark')
  }
}

// 设置 Intersection Observer - 实现无限滚动
const setupObserver = () => {
  if (observer) observer.disconnect()

  observer = new IntersectionObserver(
    (entries) => {
      const firstEntry = entries[0]
      if (firstEntry?.isIntersecting) {
        if (!loading.value && hasMore.value && searchPerformed.value) {
          console.log('📥 触发无限滚动，自动加载更多')
          loadUsers(false)
        }
      }
    },
    { threshold: 0.1, rootMargin: '100px' },
  )

  if (sentinel.value) {
    observer.observe(sentinel.value)
    console.log('✅ 无限滚动监听已启动')
  }
}

onMounted(() => {
  initTheme()
  favoritesStore.init()
  setupObserver()
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: var(--bg-primary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
}

.logo {
  font-size: 1.5rem;
  color: var(--text-primary);
}

.theme-toggle {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-toggle:hover {
  transform: scale(1.05);
}

.search-section {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 1;
  padding: 0.875rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(3, 102, 214, 0.1);
}

.search-btn {
  padding: 0.875rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.search-btn:hover:not(:disabled) {
  background: var(--primary-hover);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.history-section {
  margin-bottom: 1.5rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.clear-history {
  background: none;
  border: none;
  color: var(--danger-color);
  cursor: pointer;
  font-size: 0.75rem;
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.history-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 16px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.history-tag:hover {
  background: var(--primary-color);
  color: white;
}

.history-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: inherit;
}

.error-message {
  padding: 0.875rem;
  background: rgba(215, 58, 73, 0.1);
  border: 1px solid var(--danger-color);
  border-radius: var(--radius-md);
  color: var(--danger-color);
  margin-bottom: 1rem;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.loading-more {
  text-align: center;
  padding: 1rem;
}

.no-more {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.empty-hint {
  font-size: 0.875rem;
  margin-top: 0.5rem;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .users-grid {
    grid-template-columns: 1fr;
  }

  .search-section {
    flex-direction: column;
  }

  .search-btn {
    padding: 0.75rem;
  }
}
</style>
