export interface Task {
  id: string
  title: string
  description: string
  status: 'nueva' | 'en-proceso' | 'completada'
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  timeSpent: number // en minutos
}

export interface TimeEntry {
  taskId: string
  action: string
  timestamp: Date
  duration?: number
}

export interface NewTaskForm {
  title: string
  description: string
}
