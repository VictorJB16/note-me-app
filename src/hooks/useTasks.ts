import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import type { Task, TimeEntry, NewTaskForm } from '../types/Task'
import { storageUtils } from '../utils/storage'

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [timeHistory, setTimeHistory] = useState<TimeEntry[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Cargar datos del localStorage al inicializar
  useEffect(() => {
    try {
      // Limpiar datos expirados primero
      storageUtils.cleanExpiredData()
      
      // Cargar tareas y historial
      const loadedTasks = storageUtils.loadTasks()
      const loadedHistory = storageUtils.loadTimeHistory()
      
      setTasks(loadedTasks)
      setTimeHistory(loadedHistory)
      setIsLoaded(true)

      if (loadedTasks.length > 0) {
        toast.success(`Se cargaron ${loadedTasks.length} tareas guardadas`)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error al cargar los datos guardados')
      setIsLoaded(true)
    }
  }, [])

  // Guardar tareas cuando cambien (después de cargar)
  useEffect(() => {
    if (isLoaded) {
      storageUtils.saveTasks(tasks)
    }
  }, [tasks, isLoaded])

  // Guardar historial cuando cambie (después de cargar)
  useEffect(() => {
    if (isLoaded) {
      storageUtils.saveTimeHistory(timeHistory)
    }
  }, [timeHistory, isLoaded])

  const addTask = (newTaskData: NewTaskForm) => {
    const task: Task = {
      id: Date.now().toString(),
      title: newTaskData.title,
      description: newTaskData.description,
      status: 'nueva',
      createdAt: new Date(),
      timeSpent: 0
    }

    setTasks(prev => {
      const newTasks = [...prev, task]
      return newTasks
    })
    
    setTimeHistory(prev => {
      const newHistory = [...prev, {
        taskId: task.id,
        action: 'Tarea creada',
        timestamp: new Date()
      }]
      return newHistory
    })

    toast.success('Tarea creada exitosamente')
  }
  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const now = new Date()
        const updatedTask = { ...task, status: newStatus }
        let duration = 0

        if (newStatus === 'en-proceso' && task.status === 'nueva') {
          updatedTask.startedAt = now
        } else if (newStatus === 'completada') {
          updatedTask.completedAt = now
          if (task.startedAt) {
            duration = Math.round((now.getTime() - task.startedAt.getTime()) / (1000 * 60))
            updatedTask.timeSpent = duration
          }
        }

        setTimeHistory(prev => {
          const newHistory = [...prev, {
            taskId,
            action: `Estado cambiado a ${newStatus}`,
            timestamp: now,
            duration: duration > 0 ? duration : undefined
          }]
          return newHistory
        })

        // Toast notifications para cambios de estado
        const statusMessages = {
          'nueva': 'Tarea reiniciada',
          'en-proceso': 'Tarea iniciada - ¡Tiempo corriendo!',
          'completada': `Tarea completada${duration > 0 ? ` en ${duration} minutos` : ''}`
        }
        toast.success(statusMessages[newStatus])

        return updatedTask
      }
      return task
    }))
  }

  const deleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(task => task.id === taskId)
    
    setTasks(prev => prev.filter(task => task.id !== taskId))
    setTimeHistory(prev => prev.filter(entry => entry.taskId !== taskId))
    
    if (taskToDelete) {
      toast.success(`Tarea "${taskToDelete.title}" eliminada`)
    }
  }

  // Función para limpiar datos manualmente
  const clearAllData = () => {
    setTasks([])
    setTimeHistory([])
    localStorage.removeItem('note-me-app-tasks')
    localStorage.removeItem('note-me-app-time-history')
    toast.success('Todos los datos han sido eliminados')
  }

  // Función para obtener estadísticas de almacenamiento
  const getStorageInfo = () => {
    return storageUtils.getStorageInfo()
  }
  return {
    tasks,
    timeHistory,
    isLoaded,
    addTask,
    updateTaskStatus,
    deleteTask,
    clearAllData,
    getStorageInfo
  }
}
