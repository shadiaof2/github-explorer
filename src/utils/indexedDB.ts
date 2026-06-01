import { openDB } from 'idb'

export interface FavoriteUser {
  id: string
  login: string
  avatar_url: string
  name?: string
  savedAt: number
}

let dbInstance: any = null

async function getDB() {
  if (dbInstance) return dbInstance
  
  dbInstance = await openDB('github-explorer', 1, {
    upgrade(db) {
      const store = db.createObjectStore('favorites', { keyPath: 'id' })
      store.createIndex('by-savedAt', 'savedAt')
    }
  })
  
  return dbInstance
}

export const favoriteDB = {
  async getAll(): Promise<FavoriteUser[]> {
    const db = await getDB()
    return db.getAll('favorites')
  },
  
  async get(id: string): Promise<FavoriteUser | undefined> {
    const db = await getDB()
    return db.get('favorites', id)
  },
  
  async add(user: Omit<FavoriteUser, 'savedAt'>): Promise<string> {
    const db = await getDB()
    const doc: FavoriteUser = {
      ...user,
      savedAt: Date.now()
    }
    return db.put('favorites', doc)
  },
  
  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('favorites', id)
  },
  
  async exists(id: string): Promise<boolean> {
    const db = await getDB()
    const result = await db.get('favorites', id)
    return result !== undefined
  },
  
  async clear(): Promise<void> {
    const db = await getDB()
    await db.clear('favorites')
  }
}