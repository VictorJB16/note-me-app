import type { TaskStatus } from '../types'

export const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case 'nueva': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
    case 'en-proceso': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/25'
    case 'completada': return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25'
  }
}

export const getStatusNextAction = (status: TaskStatus): TaskStatus | null => {
  switch (status) {
    case 'nueva': return 'en-proceso'
    case 'en-proceso': return 'completada'
    case 'completada': return null
  }
}

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

export const formatDate = (date: Date): string => {
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
