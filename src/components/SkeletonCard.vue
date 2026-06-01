<template>
  <div class="skeleton-card">
    <div class="skeleton-avatar"></div>
    <div class="skeleton-content">
      <div class="skeleton-line skeleton-title"></div>
      <div class="skeleton-line skeleton-text"></div>
      <div class="skeleton-line skeleton-text short"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.skeleton-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--bg-tertiary);
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-line {
  height: 16px;
  background: var(--bg-tertiary);
  border-radius: 4px;
}

.skeleton-title {
  width: 60%;
  height: 20px;
}

.skeleton-text {
  width: 80%;
}

.skeleton-text.short {
  width: 40%;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>