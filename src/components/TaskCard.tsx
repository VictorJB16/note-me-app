import { motion } from 'framer-motion'
import { Play, CheckCircle, Trash2, Calendar, Timer } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Task } from '../types/Task'
import { getStatusColor, getStatusNextAction, formatDate, formatDuration } from '../utils/taskUtils'

interface TaskCardProps {
  task: Task
  onUpdateStatus: (taskId: string, newStatus: Task['status']) => void
  onDeleteTask: (taskId: string) => void
}

export default function TaskCard({ task, onUpdateStatus, onDeleteTask }: TaskCardProps) {
  const nextAction = getStatusNextAction(task.status)

  const handleStatusUpdate = () => {
    if (nextAction) {
      onUpdateStatus(task.id, nextAction)
      if (nextAction === 'en-proceso') {
        toast.success('¡Tarea iniciada!')
      } else if (nextAction === 'completada') {
        toast.success('¡Tarea completada! 🎉')
      }
    }
  }

  const handleDelete = () => {
    onDeleteTask(task.id)
    toast.success('Tarea eliminada')
  }

  const getStatusIcon = () => {
    switch (task.status) {
      case 'nueva': return <Calendar size={16} className="text-blue-400" />
      case 'en-proceso': return <Play size={16} className="text-yellow-400" />
      case 'completada': return <CheckCircle size={16} className="text-green-400" />
    }
  }
  return (
    <motion.div 
      className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-700 rounded-2xl shadow-2xl p-4 sm:p-6 border border-gray-600/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      layout
    >
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-3">
            {getStatusIcon()}
            <h3 className="text-lg sm:text-xl font-bold text-white truncate">{task.title}</h3>
          </div>
          
          {task.description && (
            <p className="text-gray-300 mb-4 leading-relaxed text-sm sm:text-base">{task.description}</p>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400">
              <Calendar size={12} />
              <span className="truncate">Creada: {formatDate(task.createdAt)}</span>
            </div>
            
            {task.startedAt && (
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400">
                <Play size={12} />
                <span className="truncate">Iniciada: {formatDate(task.startedAt)}</span>
              </div>
            )}
            
            {task.completedAt && (
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400">
                <CheckCircle size={12} />
                <span className="truncate">Completada: {formatDate(task.completedAt)}</span>
              </div>
            )}
            
            {task.timeSpent > 0 && (
              <div className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-blue-400">
                <Timer size={12} />
                <span>Tiempo total: {formatDuration(task.timeSpent)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 sm:ml-4">
          <motion.span 
            className={`flex items-center justify-center space-x-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium ${getStatusColor(task.status)}`}
            whileHover={{ scale: 1.05 }}
          >
            {getStatusIcon()}
            <span className="hidden sm:inline">{task.status.replace('-', ' ')}</span>
          </motion.span>
          
          <div className="flex space-x-2">
            {nextAction && (
              <motion.button
                onClick={handleStatusUpdate}
                className="flex-1 sm:flex-none bg-gradient-to-r from-green-600 to-green-700 text-white px-3 sm:px-4 py-2 rounded-xl hover:from-green-700 hover:to-green-800 text-xs sm:text-sm font-medium transition-all duration-300 shadow-lg shadow-green-500/25 flex items-center justify-center space-x-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {nextAction === 'en-proceso' ? <Play size={12} /> : <CheckCircle size={12} />}
                <span className="hidden sm:inline">{nextAction === 'en-proceso' ? 'Iniciar' : 'Completar'}</span>
                <span className="sm:hidden">{nextAction === 'en-proceso' ? '▶️' : '✅'}</span>
              </motion.button>
            )}
            
            <motion.button
              onClick={handleDelete}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-2 rounded-xl hover:from-red-700 hover:to-red-800 font-medium text-xs sm:text-sm transition-all duration-300 shadow-lg shadow-red-500/25"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 size={12} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
