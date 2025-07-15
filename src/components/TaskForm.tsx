import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, FileText, Type } from 'lucide-react'
import toast from 'react-hot-toast'
import type { NewTaskForm } from '../types/Task'

interface TaskFormProps {
  onAddTask: (task: NewTaskForm) => void
}

export default function TaskForm({ onAddTask }: TaskFormProps) {
  const [newTask, setNewTask] = useState<NewTaskForm>({ title: '', description: '' })

  const handleSubmit = () => {
    if (!newTask.title.trim()) {
      toast.error('El título es requerido')
      return
    }
    
    onAddTask(newTask)
    setNewTask({ title: '', description: '' })
    toast.success('¡Tarea creada exitosamente!')
  }
  return (
    <motion.div 
      className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-700 rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-600/50 backdrop-blur-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-3 mb-4 sm:mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Plus className="text-blue-400" size={20} />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">Nueva Tarea</h2>
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
            <Type size={14} />
            <span>Título</span>
          </label>
          <input
            type="text"
            placeholder="¿Qué necesitas hacer?"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-400 transition-all duration-300 backdrop-blur-sm text-sm sm:text-base"
          />
        </motion.div>
        
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
            <FileText size={14} />
            <span>Descripción</span>
          </label>
          <textarea
            placeholder="Agrega detalles adicionales (opcional)"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 h-20 sm:h-24 text-white placeholder-gray-400 transition-all duration-300 backdrop-blur-sm resize-none text-sm sm:text-base"
          />
        </motion.div>
        
        <motion.button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium transition-all duration-300 shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 text-sm sm:text-base"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Plus size={18} />
          <span>Crear Tarea</span>
        </motion.button>
      </div>
    </motion.div>
  )
}
