import { useState } from 'react'
import { motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { Navigation, TaskForm, TaskList, TaskHistory, StatsWidget, Settings } from './components'
import { useTasks } from './hooks/useTasks'
import type { ViewType } from './types'

function App() {
  const [activeView, setActiveView] = useState<ViewType>('tasks')
  const { 
    tasks, 
    timeHistory, 
    isLoaded,
    addTask, 
    updateTaskStatus, 
    deleteTask,
    clearAllData,
    getStorageInfo
  } = useTasks()

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  }

  const pageTransition = {
    type: "tween" as const,
    ease: "anticipate" as const,
    duration: 0.5
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10"></div>
      <div className="absolute top-1/4 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'linear-gradient(135deg, #374151 0%, #4B5563 100%)',
            color: '#f3f4f6',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            borderRadius: '12px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            fontSize: '14px',
            maxWidth: '90vw'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff'
            }
          }
        }}
      />
      
      {/* Loading indicator */}
      {!isLoaded && (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-300 text-lg">Cargando tareas...</p>
          </div>
        </div>
      )}
      
      <div className="relative z-10 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
        <motion.header 
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent text-center sm:text-left"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            📝 Note Me App
          </motion.h1>
          <Navigation 
            activeView={activeView} 
            onViewChange={setActiveView}
          />
        </motion.header>

        <motion.div
          key={activeView}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {activeView === 'tasks' && (
            <div className="space-y-6">
              <StatsWidget tasks={tasks} />
              <TaskForm onAddTask={addTask} />
              <TaskList 
                tasks={tasks}
                onUpdateStatus={updateTaskStatus}
                onDeleteTask={deleteTask}
              />
            </div>
          )}

          {activeView === 'history' && (
            <TaskHistory 
              timeHistory={timeHistory}
              tasks={tasks}
            />
          )}

          {activeView === 'settings' && (
            <Settings 
              onClearData={clearAllData}
              getStorageInfo={getStorageInfo}
            />
          )}
        </motion.div>
        </div>
      </div>
    </div>
  )
}

export default App
