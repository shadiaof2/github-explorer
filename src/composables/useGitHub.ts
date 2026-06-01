import { ref } from 'vue'
import { searchUsers, getUserDetail, getUserRepos } from '@/api/github'
import type { GitHubUser, UserDetail, Repository } from '@/types'

export function useGitHub() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 搜索用户
  const search = async (keyword: string, page: number = 1, perPage: number = 20) => {
    if (!keyword.trim()) {
      error.value = '请输入搜索关键词'
      return null
    }
    
    loading.value = true
    error.value = null
    
    try {
      const result = await searchUsers(keyword, page, perPage)
      return result
    } catch (err: any) {
      error.value = err.message || '搜索失败，请稍后再试'
      return null
    } finally {
      loading.value = false
    }
  }

  // 获取用户详情
  const getUser = async (username: string): Promise<UserDetail | null> => {
    loading.value = true
    error.value = null
    
    try {
      const user = await getUserDetail(username)
      return user
    } catch (err: any) {
      error.value = err.message || '获取用户信息失败'
      return null
    } finally {
      loading.value = false
    }
  }

  // 获取用户仓库
  const getRepos = async (username: string, limit: number = 5): Promise<Repository[]> => {
    loading.value = true
    error.value = null
    
    try {
      const repos = await getUserRepos(username, limit)
      return repos
    } catch (err: any) {
      error.value = err.message || '获取仓库信息失败'
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    search,
    getUser,
    getRepos
  }
}