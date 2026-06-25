// GitHub 用户（搜索结果）
export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  html_url: string
  public_repos: number
  followers?: number
  following?: number
  score?: number
}
// 用户详细信息
export interface UserDetail extends GitHubUser {
  name: string | null
  bio: string | null
  company: string | null
  location: string | null
  blog: string | null
  twitter_username: string | null
  email: string | null
  created_at: string
  updated_at: string
  public_gists: number
  hireable: boolean | null
}
// GitHub 仓库
export interface Repository {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  stargazers_count: number
  language: string | null
  forks_count: number
  updated_at: string
}
// 搜索响应
export interface SearchResponse<T> {
  total_count: number
  incomplete_results: boolean
  items: T[]
}
// 搜索历史项
export interface HistoryItem {
  keyword: string
  timestamp: number
}
