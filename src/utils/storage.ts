import type { Task, TimeEntry } from '../types/Task'

const STORAGE_KEYS = {
  TASKS: 'note-me-app-tasks',
  TIME_HISTORY: 'note-me-app-time-history',
  LAST_SAVE: 'note-me-app-last-save'
}

const EXPIRY_DAYS = 7 // 1 semana

export const storageUtils = {
  // Guardar datos en localStorage con timestamp
  saveTasks: (tasks: Task[]) => {
    try {
      const data = {
        tasks,
        timestamp: Date.now()
      }
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving tasks:', error)
    }
  },

  saveTimeHistory: (timeHistory: TimeEntry[]) => {
    try {
      const data = {
        timeHistory,
        timestamp: Date.now()
      }
      localStorage.setItem(STORAGE_KEYS.TIME_HISTORY, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving time history:', error)
    }
  },

  // Cargar datos del localStorage
  loadTasks: (): Task[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS)
      if (!data) return []

      const parsed = JSON.parse(data)
      
      // Verificar si los datos han expirado (1 semana)
      const isExpired = Date.now() - parsed.timestamp > EXPIRY_DAYS * 24 * 60 * 60 * 1000
      
      if (isExpired) {
        localStorage.removeItem(STORAGE_KEYS.TASKS)
        return []
      }

      // Convertir strings de fechas de vuelta a objetos Date
      return parsed.tasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        startedAt: task.startedAt ? new Date(task.startedAt) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined
      }))
    } catch (error) {
      console.error('Error loading tasks:', error)
      return []
    }
  },

  loadTimeHistory: (): TimeEntry[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TIME_HISTORY)
      if (!data) return []

      const parsed = JSON.parse(data)
      
      // Verificar si los datos han expirado (1 semana)
      const isExpired = Date.now() - parsed.timestamp > EXPIRY_DAYS * 24 * 60 * 60 * 1000
      
      if (isExpired) {
        localStorage.removeItem(STORAGE_KEYS.TIME_HISTORY)
        return []
      }

      // Convertir strings de fechas de vuelta a objetos Date
      return parsed.timeHistory.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }))
    } catch (error) {
      console.error('Error loading time history:', error)
      return []
    }
  },

  // Limpiar datos expirados
  cleanExpiredData: () => {
    try {
      const tasksData = localStorage.getItem(STORAGE_KEYS.TASKS)
      const historyData = localStorage.getItem(STORAGE_KEYS.TIME_HISTORY)
      
      if (tasksData) {
        const parsed = JSON.parse(tasksData)
        const isExpired = Date.now() - parsed.timestamp > EXPIRY_DAYS * 24 * 60 * 60 * 1000
        if (isExpired) {
          localStorage.removeItem(STORAGE_KEYS.TASKS)
        }
      }

      if (historyData) {
        const parsed = JSON.parse(historyData)
        const isExpired = Date.now() - parsed.timestamp > EXPIRY_DAYS * 24 * 60 * 60 * 1000
        if (isExpired) {
          localStorage.removeItem(STORAGE_KEYS.TIME_HISTORY)
        }
      }
    } catch (error) {
      console.error('Error cleaning expired data:', error)
    }
  },

  // Obtener información de almacenamiento
  getStorageInfo: () => {
    try {
      const tasksData = localStorage.getItem(STORAGE_KEYS.TASKS)
      const historyData = localStorage.getItem(STORAGE_KEYS.TIME_HISTORY)
      
      let tasksCount = 0
      let historyCount = 0
      let lastSave = null

      if (tasksData) {
        const parsed = JSON.parse(tasksData)
        tasksCount = parsed.tasks.length
        lastSave = new Date(parsed.timestamp)
      }

      if (historyData) {
        const parsed = JSON.parse(historyData)
        historyCount = parsed.timeHistory.length
      }

      return {
        tasksCount,
        historyCount,
        lastSave,
        expiryDate: lastSave ? new Date(lastSave.getTime() + EXPIRY_DAYS * 24 * 60 * 60 * 1000) : null
      }
    } catch (error) {
      console.error('Error getting storage info:', error)
      return { tasksCount: 0, historyCount: 0, lastSave: null, expiryDate: null }
    }
  }
}
