import { motion } from 'framer-motion'
import { CheckCircle, Clock, Activity, TrendingUp, Timer } from 'lucide-react'
import type { Task } from '../types/Task'
import { formatDuration } from '../utils/taskUtils'

interface StatsWidgetProps {
  tasks: Task[]
}

export default function StatsWidget({ tasks }: StatsWidgetProps) {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === 'completada').length
  const inProgressTasks = tasks.filter(task => task.status === 'en-proceso').length
  const totalTimeSpent = tasks.reduce((acc, task) => acc + task.timeSpent, 0)
  const totalPomodoros = tasks.reduce((acc, task) => acc + (task.pomodoroSessions || 0), 0)
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const stats = [
    {
      icon: Activity,
      label: 'Total de Tareas',
      value: totalTasks,
      color: 'text-blue-400',
      bg: 'bg-blue-500/20'
    },
    {
      icon: CheckCircle,
      label: 'Completadas',
      value: completedTasks,
      color: 'text-green-400',
      bg: 'bg-green-500/20'
    },
    {
      icon: Clock,
      label: 'En Progreso',
      value: inProgressTasks,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20'    },
    {
      icon: Timer,
      label: 'Pomodoros',
      value: `🍅 ${totalPomodoros}`,
      color: 'text-red-400',
      bg: 'bg-red-500/20'
    },
    {
      icon: TrendingUp,
      label: 'Tasa de Completación',
      value: `${completionRate}%`,
      color: 'text-purple-400',
      bg: 'bg-purple-500/20'
    }
  ]

  return (
    <motion.div
      className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-700 rounded-xl p-3 sm:p-4 border border-gray-600/50 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={stat.color} size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-400 truncate">{stat.label}</p>
              <p className="text-lg sm:text-xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        </motion.div>
      ))}      {totalTimeSpent > 0 && (
        <motion.div
          className="col-span-2 lg:col-span-5 bg-gradient-to-r from-gray-800 via-gray-800 to-gray-700 rounded-xl p-3 sm:p-4 border border-gray-600/50 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-indigo-500/20 rounded-lg">
              <Clock className="text-indigo-400" size={16} />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Tiempo Total Invertido</p>
              <p className="text-lg sm:text-xl font-bold text-white">{formatDuration(totalTimeSpent)}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
