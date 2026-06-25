import axios from 'axios'
import type { SearchResponse, GitHubUser, UserDetail, Repository } from '@/types'
const BASE_URL = 'https://api.github.com'
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN
// 创建 axios 实例
const githubApi = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/vnd.github.v3+json',
    ...(TOKEN && { Authorization: `token ${TOKEN}` }),
  },
})
// 响应拦截器：统一错误处理
githubApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      const resetTime = error.response.headers['x-ratelimit-reset']
      const remaining = error.response.headers['x-ratelimit-remaining']

      if (remaining === '0' && resetTime) {
        const resetDate = new Date(parseInt(resetTime) * 1000)
        const message = `API 限流！请在 ${resetDate.toLocaleTimeString()} 后重试`
        return Promise.reject(new Error(message))
      }
      return Promise.reject(new Error('API 请求受限，请稍后再试'))
    }
    if (error.response?.status === 404) {
      return Promise.reject(new Error('用户不存在'))
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('请求超时，请检查网络'))
    }
    return Promise.reject(error)
  },
)
// 搜索用户（分页）
export async function searchUsers(
  keyword: string,
  page: number = 1,
  perPage: number = 20,
): Promise<SearchResponse<GitHubUser>> {
  const response = await githubApi.get('/search/users', {
    params: { q: keyword, page, per_page: perPage },
  })
  return response.data
}
// 获取用户详细信息
export async function getUserDetail(username: string): Promise<UserDetail> {
  const response = await githubApi.get(`/users/${username}`)
  return response.data
}
// 获取用户仓库（按更新时间排序）
export async function getUserRepos(username: string, limit: number = 5): Promise<Repository[]> {
  const response = await githubApi.get(`/users/${username}/repos`, {
    params: {
      sort: 'updated',
      direction: 'desc',
      per_page: limit,
    },
  })
  return response.data
}
export default githubApi
