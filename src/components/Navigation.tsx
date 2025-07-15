import { motion } from 'framer-motion'
import { ListTodo, Clock, Settings, Timer } from 'lucide-react'
import type { ViewType } from '../types'

interface NavigationProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
}

export default function Navigation({ activeView, onViewChange }: NavigationProps) {
  return (
    <nav className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
      <motion.button
        onClick={() => onViewChange('tasks')}
        className={`flex items-center justify-center sm:justify-start space-x-2 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-300 text-sm sm:text-base ${
          activeView === 'tasks'
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white backdrop-blur-sm border border-gray-700/50'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <ListTodo size={18} />
        <span>Tareas</span>
      </motion.button>      <motion.button
        onClick={() => onViewChange('history')}
        className={`flex items-center justify-center sm:justify-start space-x-2 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-300 text-sm sm:text-base ${
          activeView === 'history'
            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25'
            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white backdrop-blur-sm border border-gray-700/50'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Clock size={18} />
        <span>Historial</span>
      </motion.button>
      <motion.button
        onClick={() => onViewChange('pomodoro')}
        className={`flex items-center justify-center sm:justify-start space-x-2 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-300 text-sm sm:text-base ${
          activeView === 'pomodoro'
            ? 'bg-gradient-to-r from-red-600 to-orange-700 text-white shadow-lg shadow-red-500/25'
            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white backdrop-blur-sm border border-gray-700/50'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Timer size={18} />
        <span>Pomodoro</span>
      </motion.button>
      <motion.button
        onClick={() => onViewChange('settings')}
        className={`flex items-center justify-center sm:justify-start space-x-2 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-300 text-sm sm:text-base ${
          activeView === 'settings'
            ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg shadow-gray-500/25'
            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white backdrop-blur-sm border border-gray-700/50'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Settings size={18} />
        <span>Ajustes</span>
      </motion.button>
    </nav>
  )
}
