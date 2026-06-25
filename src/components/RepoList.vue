<template>
  <div class="repo-list">
    <h3 class="section-title">📚 最近仓库</h3>
    <div v-if="repos.length === 0" class="empty-repos">暂无仓库</div>
    <div v-for="repo in repos" :key="repo.id" class="repo-item">
      <a :href="repo.html_url" target="_blank" rel="noopener noreferrer" class="repo-name">
        {{ repo.name }}
      </a>
      <p v-if="repo.description" class="repo-desc">{{ repo.description }}</p>
      <div class="repo-stats">
        <span class="repo-lang" v-if="repo.language">
          <span class="lang-dot"></span>
          {{ repo.language }}
        </span>
        <span class="repo-stars">⭐ {{ formatNumber(repo.stargazers_count) }}</span>
        <span class="repo-forks">🍴 {{ formatNumber(repo.forks_count) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Repository } from '@/types'

defineProps<{
  repos: Repository[]
}>()

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}
</script>

<style scoped>
.repo-list {
  margin-top: 1.5rem;
}

.section-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.repo-item {
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  margin-bottom: 0.75rem;
  transition: all 0.2s;
}

.repo-item:hover {
  background: var(--bg-secondary);
  box-shadow: var(--shadow-sm);
}

.repo-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-color);
  text-decoration: none;
}

.repo-name:hover {
  text-decoration: underline;
}

.repo-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  line-height: 1.4;
}

.repo-stats {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.repo-lang {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.lang-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: currentColor;
}

.empty-repos {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}
</style>
