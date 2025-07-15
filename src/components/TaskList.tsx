import { motion, AnimatePresence } from 'framer-motion'
import { FileX } from 'lucide-react'
import type { Task } from '../types/Task'
import TaskCard from './TaskCard'

interface TaskListProps {
  tasks: Task[]
  onUpdateStatus: (taskId: string, newStatus: Task['status']) => void
  onDeleteTask: (taskId: string) => void
}

export default function TaskList({ tasks, onUpdateStatus, onDeleteTask }: TaskListProps) {  if (tasks.length === 0) {
    return (
      <motion.div 
        className="text-center py-12 sm:py-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 sm:p-4 bg-gray-800/50 rounded-2xl">
            <FileX size={40} className="text-gray-400 sm:w-12 sm:h-12" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2">No hay tareas aún</h3>
            <p className="text-sm sm:text-base text-gray-400">¡Crea tu primera tarea para comenzar!</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <AnimatePresence>
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <TaskCard
              task={task}
              onUpdateStatus={onUpdateStatus}
              onDeleteTask={onDeleteTask}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
