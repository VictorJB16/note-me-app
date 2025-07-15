import { motion } from 'framer-motion'
import { Clock, Activity, Timer, FileX } from 'lucide-react'
import type { Task, TimeEntry } from '../types/Task'
import { formatDate, formatDuration } from '../utils/taskUtils'

interface TaskHistoryProps {
  timeHistory: TimeEntry[]
  tasks: Task[]
}

export default function TaskHistory({ timeHistory, tasks }: TaskHistoryProps) {
  if (timeHistory.length === 0) {
    return (
      <motion.div 
        className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Clock className="text-purple-400" size={20} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Historial de Actividades</h2>
          </div>
        </div>
        <div className="p-6 sm:p-8 lg:p-12">
          <div className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="p-3 sm:p-4 bg-gray-800/50 rounded-2xl">
                <FileX size={40} className="text-gray-400 sm:w-12 sm:h-12" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2">No hay actividades registradas</h3>
                <p className="text-sm sm:text-base text-gray-400 text-center">Las actividades aparecerán aquí cuando comiences a trabajar en las tareas</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-700/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Clock className="text-purple-400" size={20} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Historial de Actividades</h2>
        </div>
      </div>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-4 sm:space-y-6">
          {timeHistory
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .map((entry, index) => {
              const task = tasks.find(t => t.id === entry.taskId)
              return (
                <motion.div 
                  key={index} 
                  className="border-l-4 border-purple-500/50 pl-4 sm:pl-6 py-3 sm:py-4 bg-gray-700/30 rounded-r-xl backdrop-blur-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <Activity size={14} className="text-purple-400 flex-shrink-0" />
                        <p className="font-semibold text-white text-sm sm:text-lg truncate">
                          {task?.title || 'Tarea eliminada'}
                        </p>
                      </div>
                      
                      <p className="text-gray-300 ml-6 text-xs sm:text-base">{entry.action}</p>
                      
                      {entry.duration && (
                        <div className="flex items-center space-x-2 ml-6">
                          <Timer size={12} className="text-blue-400" />
                          <p className="text-blue-400 font-medium text-xs sm:text-sm">
                            Duración: {formatDuration(entry.duration)}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-gray-400 ml-6 sm:ml-0">
                      <Clock size={12} />
                      <span className="text-xs sm:text-sm">
                        {formatDate(entry.timestamp)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
        </div>
      </div>
    </motion.div>
  )
}
