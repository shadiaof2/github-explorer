<template>
  <div class="user-detail">
    <div class="container">
      <!-- 返回按钮 -->
      <button class="back-btn" @click="goBack">← 返回</button>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <LoadingSpinner text="加载用户信息..." />
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <p>⚠️ {{ error }}</p>
        <button class="retry-btn" @click="loadUserData">重试</button>
      </div>

      <!-- 用户信息 -->
      <div v-else-if="user" class="user-content">
        <!-- 用户头部 -->
        <div class="user-header">
          <img :src="user.avatar_url" :alt="user.login" class="user-avatar" />
          <div class="user-header-info">
            <h1 class="user-name">{{ user.name || user.login }}</h1>
            <p class="user-login">@{{ user.login }}</p>
            <div class="user-actions">
              <button class="favorite-btn" :class="{ active: isFavorited }" @click="toggleFavorite">
                {{ isFavorited ? '⭐ 已收藏' : '☆ 收藏用户' }}
              </button>
              <a :href="user.html_url" target="_blank" class="github-link"> 查看 GitHub → </a>
            </div>
          </div>
        </div>

        <!-- 用户统计 -->
        <div class="user-stats">
          <div class="stat-item">
            <span class="stat-value">{{ user.followers }}</span>
            <span class="stat-label">关注者</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ user.following }}</span>
            <span class="stat-label">正在关注</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ user.public_repos }}</span>
            <span class="stat-label">仓库数</span>
          </div>
        </div>

        <!-- 用户简介 -->
        <div v-if="user.bio" class="user-bio">
          <p>{{ user.bio }}</p>
        </div>

        <!-- 用户详细信息 -->
        <div class="user-details">
          <div v-if="user.company" class="detail-item">
            <span class="detail-icon">🏢</span>
            <span>{{ user.company }}</span>
          </div>
          <div v-if="user.location" class="detail-item">
            <span class="detail-icon">📍</span>
            <span>{{ user.location }}</span>
          </div>
          <div v-if="user.blog" class="detail-item">
            <span class="detail-icon">🔗</span>
            <a :href="user.blog" target="_blank" class="detail-link">{{ user.blog }}</a>
          </div>
          <div v-if="user.twitter_username" class="detail-item">
            <span class="detail-icon">🐦</span>
            <span>@{{ user.twitter_username }}</span>
          </div>
        </div>

        <!-- 仓库列表 -->
        <RepoList :repos="repos" />

        <!-- 语言占比图表 -->
        <LanguageChart :repos="repos" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGitHub } from '@/composables/useGitHub'
import { useFavoritesStore } from '@/stores/favorites'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import RepoList from '@/components/RepoList.vue'
import LanguageChart from '@/components/LanguageChart.vue'
import type { UserDetail, Repository } from '@/types'

const route = useRoute()
const router = useRouter()
const { loading: apiLoading, error: apiError, getUser, getRepos } = useGitHub()
const favoritesStore = useFavoritesStore()

const username = computed(() => route.params.username as string)
const user = ref<UserDetail | null>(null)
const repos = ref<Repository[]>([])
const loading = computed(() => apiLoading.value)
const error = computed(() => apiError.value)

const isFavorited = computed(() => favoritesStore.isFavorite(username.value))

const loadUserData = async () => {
  const userData = await getUser(username.value)
  if (userData) {
    user.value = userData
    const reposData = await getRepos(username.value, 5)
    repos.value = reposData
  }
}

const toggleFavorite = async () => {
  if (user.value) {
    await favoritesStore.toggleFavorite({
      login: user.value.login,
      avatar_url: user.value.avatar_url,
      name: user.value.name || undefined,
    })
  }
}

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.user-detail {
  min-height: 100vh;
  background: var(--bg-primary);
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1.5rem;
}

.back-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  transition: all 0.2s;
}

.back-btn:hover {
  background: var(--bg-tertiary);
}

.loading-state,
.error-state {
  text-align: center;
  padding: 4rem;
}

.error-state p {
  color: var(--danger-color);
  margin-bottom: 1rem;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.user-header {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--primary-color);
}

.user-header-info {
  flex: 1;
}

.user-name {
  font-size: 1.8rem;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.user-login {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.user-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.favorite-btn {
  padding: 0.5rem 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s;
}

.favorite-btn.active {
  background: #f5a62320;
  border-color: #f5a623;
  color: #f5a623;
}

.github-link {
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.github-link:hover {
  background: var(--primary-hover);
}

.user-stats {
  display: flex;
  gap: 2rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.user-bio {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  border-left: 3px solid var(--primary-color);
  color: var(--text-primary);
}

.user-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.detail-icon {
  font-size: 1rem;
}

.detail-link {
  color: var(--primary-color);
  text-decoration: none;
}

.detail-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .user-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .user-name {
    font-size: 1.4rem;
  }

  .user-avatar {
    width: 100px;
    height: 100px;
  }

  .user-actions {
    justify-content: center;
  }

  .user-stats {
    justify-content: space-around;
    gap: 0.5rem;
  }

  .stat-value {
    font-size: 1.2rem;
  }
}
</style>
