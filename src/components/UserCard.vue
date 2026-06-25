<template>
  <div class="user-card" @click="$emit('click', user.login)">
    <div class="user-avatar">
      <img :src="user.avatar_url" :alt="user.login" loading="lazy" />
    </div>
    <div class="user-info">
      <h3 class="username">{{ user.login }}</h3>
      <p class="repos-count">📁 {{ user.public_repos }} 个仓库</p>
    </div>
    <button
      class="favorite-btn"
      :class="{ active: isFavorited }"
      @click.stop="handleFavorite"
      :title="isFavorited ? '取消收藏' : '收藏用户'"
    >
      {{ isFavorited ? '⭐' : '☆' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFavoritesStore } from '@/stores/favorites'
import type { GitHubUser } from '@/types'

const props = defineProps<{
  user: GitHubUser
}>()

const emit = defineEmits<{
  (e: 'click', username: string): void
  (e: 'favorite', user: GitHubUser, isFavorited: boolean): void
}>()

const favoritesStore = useFavoritesStore()

const isFavorited = computed(() => favoritesStore.isFavorite(props.user.login))

const handleFavorite = async () => {
  const isNowFavorited = await favoritesStore.toggleFavorite({
    login: props.user.login,
    avatar_url: props.user.avatar_url,
  })
  emit('favorite', props.user, isNowFavorited)
}
</script>

<style scoped>
.user-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  cursor: pointer;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.repos-count {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.favorite-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: transform 0.2s;
  color: var(--text-secondary);
}

.favorite-btn:hover {
  transform: scale(1.1);
}

.favorite-btn.active {
  color: #f5a623;
}

@media (max-width: 768px) {
  .user-card {
    padding: 0.75rem;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
  }

  .username {
    font-size: 0.9rem;
  }
}
</style>
