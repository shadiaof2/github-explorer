import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { favoriteDB, type FavoriteUser } from '@/utils/indexedDB'

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref<FavoriteUser[]>([])
  const loading = ref(false)

  const favoriteCount = computed(() => favorites.value.length)
  
  const isFavorite = computed(() => (username: string) => {
    return favorites.value.some(fav => fav.login === username)
  })

  const getFavorite = computed(() => (username: string) => {
    return favorites.value.find(fav => fav.login === username)
  })

  const init = async () => {
    loading.value = true
    try {
      favorites.value = await favoriteDB.getAll()
    } catch (error) {
      console.error('加载收藏失败:', error)
    } finally {
      loading.value = false
    }
  }

  const addFavorite = async (user: { login: string; avatar_url: string; name?: string }) => {
    if (isFavorite.value(user.login)) return false
    
    try {
      await favoriteDB.add({
        id: user.login,
        login: user.login,
        avatar_url: user.avatar_url,
        name: user.name
      })
      
      const newFavorite = await favoriteDB.get(user.login)
      if (newFavorite) {
        favorites.value.push(newFavorite)
      }
      return true
    } catch (error) {
      console.error('添加收藏失败:', error)
      return false
    }
  }

  const removeFavorite = async (username: string) => {
    if (!isFavorite.value(username)) return false
    
    try {
      await favoriteDB.delete(username)
      favorites.value = favorites.value.filter(fav => fav.login !== username)
      return true
    } catch (error) {
      console.error('移除收藏失败:', error)
      return false
    }
  }

  const toggleFavorite = async (user: { login: string; avatar_url: string; name?: string }) => {
    if (isFavorite.value(user.login)) {
      await removeFavorite(user.login)
      return false
    } else {
      await addFavorite(user)
      return true
    }
  }

  return {
    favorites,
    loading,
    favoriteCount,
    isFavorite,
    getFavorite,
    init,
    addFavorite,
    removeFavorite,
    toggleFavorite
  }
})