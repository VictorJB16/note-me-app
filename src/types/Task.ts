export interface Task {
  id: string
  title: string
  description: string
  status: 'nueva' | 'en-proceso' | 'completada'
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  timeSpent: number // en minutos
  pomodoroSessions: number // número de pomodoros completados
  currentPomodoroTime?: number // tiempo actual del pomodoro en segundos
}

export interface TimeEntry {
  taskId: string
  action: string
  timestamp: Date
  duration?: number
  pomodoroType?: 'focus' | 'short-break' | 'long-break'
}

export interface NewTaskForm {
  title: string
  description: string
}

export interface PomodoroSession {
  id: string
  taskId: string
  type: 'focus' | 'short-break' | 'long-break'
  duration: number // en segundos
  startTime: Date
  endTime?: Date
  completed: boolean
}

export interface PomodoroState {
  isActive: boolean
  currentSession: PomodoroSession | null
  timeRemaining: number // en segundos
  currentTaskId: string | null
  focusCount: number // número de sesiones de focus completadas
  isBreak: boolean
}
