import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, RotateCcw, Timer, Coffee, Zap } from 'lucide-react';
import { usePomodoro } from '../hooks/usePomodoro';
import type { Task } from '../types/Task';

interface PomodoroProps {
  tasks: Task[];
  updateTaskPomodoroCount?: (taskId: string, increment: number) => Promise<void>;
}

export default function Pomodoro({ tasks, updateTaskPomodoroCount }: PomodoroProps) {
  const {
    pomodoroState,
    startPomodoro,
    startBreak,
    pausePomodoro,
    resumePomodoro,
    stopPomodoro,
    resetPomodoro,
    formatTime,
    getSessionProgress
  } = usePomodoro(updateTaskPomodoroCount);

  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  // Auto-seleccionar la primera tarea "en-proceso" o "nueva"
  useEffect(() => {
    if (!selectedTaskId && tasks.length > 0) {
      const activeTask = tasks.find(task => task.status === 'en-proceso') || 
                         tasks.find(task => task.status === 'nueva');
      if (activeTask) {
        setSelectedTaskId(activeTask.id);
      }
    }
  }, [tasks, selectedTaskId]);

  const activeTasks = tasks.filter(task => task.status !== 'completada');
  const selectedTask = tasks.find(task => task.id === selectedTaskId);

  const getSessionTypeColor = () => {
    if (!pomodoroState.currentSession) return 'from-blue-500 to-purple-600';
    
    switch (pomodoroState.currentSession.type) {
      case 'focus':
        return 'from-red-500 to-orange-600';
      case 'short-break':
        return 'from-green-500 to-emerald-600';
      case 'long-break':
        return 'from-blue-500 to-indigo-600';
      default:
        return 'from-blue-500 to-purple-600';
    }
  };

  const getSessionIcon = () => {
    if (!pomodoroState.currentSession) return <Timer className="w-8 h-8" />;
    
    switch (pomodoroState.currentSession.type) {
      case 'focus':
        return <Zap className="w-8 h-8" />;
      case 'short-break':
      case 'long-break':
        return <Coffee className="w-8 h-8" />;
      default:
        return <Timer className="w-8 h-8" />;
    }
  };

  const getSessionTitle = () => {
    if (!pomodoroState.currentSession) return 'Pomodoro';
    
    switch (pomodoroState.currentSession.type) {
      case 'focus':
        return 'Sesión de Concentración';
      case 'short-break':
        return 'Descanso Corto';
      case 'long-break':
        return 'Descanso Largo';
      default:
        return 'Pomodoro';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Timer className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Técnica Pomodoro</h2>
              <p className="text-gray-400 text-sm">25 min concentración • 5 min descanso • 15 min descanso largo</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{pomodoroState.focusCount}</p>
            <p className="text-gray-400 text-sm">Pomodoros completados</p>
          </div>
        </div>

        {/* Selector de tarea */}
        {!pomodoroState.isActive && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Selecciona una tarea para trabajar:
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-red-500/50 focus:border-transparent"
            >
              <option value="">Seleccionar tarea...</option>
              {activeTasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.title} {task.pomodoroSessions > 0 && `(🍅 ${task.pomodoroSessions})`}
                </option>
              ))}
            </select>
          </div>
        )}
      </motion.div>

      {/* Timer principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative bg-gradient-to-br ${getSessionTypeColor()} rounded-3xl p-8 text-white overflow-hidden`}
      >
        {/* Fondo animado */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
        
        {/* Contenido */}
        <div className="relative z-10 text-center">
          {/* Icono y título de sesión */}
          <motion.div 
            className="flex items-center justify-center space-x-3 mb-6"
            animate={{ scale: pomodoroState.isActive ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 2, repeat: pomodoroState.isActive ? Infinity : 0 }}
          >
            {getSessionIcon()}
            <h3 className="text-xl font-semibold">{getSessionTitle()}</h3>
          </motion.div>

          {/* Timer display */}
          <motion.div 
            className="text-8xl sm:text-9xl font-mono font-bold mb-6"
            animate={{ 
              scale: pomodoroState.timeRemaining <= 10 && pomodoroState.isActive ? [1, 1.1, 1] : 1,
              color: pomodoroState.timeRemaining <= 60 && pomodoroState.isActive ? '#ef4444' : '#ffffff'
            }}
            transition={{ duration: 1, repeat: pomodoroState.timeRemaining <= 10 ? Infinity : 0 }}
          >
            {formatTime(pomodoroState.timeRemaining)}
          </motion.div>

          {/* Tarea actual */}
          {selectedTask && (
            <div className="mb-6">
              <p className="text-lg opacity-90">Trabajando en:</p>
              <p className="text-xl font-semibold">{selectedTask.title}</p>
              {selectedTask.pomodoroSessions > 0 && (
                <p className="text-sm opacity-75">🍅 {selectedTask.pomodoroSessions} pomodoros completados</p>
              )}
            </div>
          )}

          {/* Barra de progreso */}
          <div className="w-full max-w-md mx-auto mb-6">
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                className="bg-white h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${getSessionProgress()}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center justify-center space-x-4">
            {!pomodoroState.isActive ? (
              <>
                <motion.button
                  onClick={() => selectedTaskId && startPomodoro(selectedTaskId)}
                  disabled={!selectedTaskId}
                  className="flex items-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed rounded-xl font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play size={20} />
                  <span>Iniciar</span>
                </motion.button>
                
                {pomodoroState.currentSession && (
                  <motion.button
                    onClick={resumePomodoro}
                    className="flex items-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play size={20} />
                    <span>Reanudar</span>
                  </motion.button>
                )}
              </>
            ) : (
              <motion.button
                onClick={pausePomodoro}
                className="flex items-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Pause size={20} />
                <span>Pausar</span>
              </motion.button>
            )}

            {pomodoroState.currentSession && (
              <>
                <motion.button
                  onClick={stopPomodoro}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-500/30 hover:bg-red-500/40 rounded-xl font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Square size={20} />
                  <span>Detener</span>
                </motion.button>

                <motion.button
                  onClick={resetPomodoro}
                  className="flex items-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw size={20} />
                  <span>Reset</span>
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* Indicador de pulsación */}
        <AnimatePresence>
          {pomodoroState.isActive && (
            <motion.div
              className="absolute inset-0 border-4 border-white/30 rounded-3xl"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ 
                scale: [1, 1.02, 1],
                opacity: [0.5, 0.2, 0.5]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Acciones rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <motion.button
          onClick={() => startBreak('short-break')}
          disabled={pomodoroState.isActive}
          className="flex items-center justify-center space-x-3 p-6 bg-green-600/20 hover:bg-green-600/30 disabled:bg-gray-600/20 disabled:cursor-not-allowed border border-green-500/30 rounded-2xl transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Coffee className="w-6 h-6 text-green-400" />
          <div className="text-left">
            <p className="font-semibold text-white">Descanso Corto</p>
            <p className="text-sm text-gray-300">5 minutos</p>
          </div>
        </motion.button>

        <motion.button
          onClick={() => startBreak('long-break')}
          disabled={pomodoroState.isActive}
          className="flex items-center justify-center space-x-3 p-6 bg-blue-600/20 hover:bg-blue-600/30 disabled:bg-gray-600/20 disabled:cursor-not-allowed border border-blue-500/30 rounded-2xl transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Coffee className="w-6 h-6 text-blue-400" />
          <div className="text-left">
            <p className="font-semibold text-white">Descanso Largo</p>
            <p className="text-sm text-gray-300">15 minutos</p>
          </div>
        </motion.button>
      </motion.div>

      {/* Información adicional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">¿Cómo funciona?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-red-400" />
            </div>
            <p className="font-medium text-white mb-1">1. Concentración</p>
            <p>Trabaja durante 25 minutos sin distracciones</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Coffee className="w-6 h-6 text-green-400" />
            </div>
            <p className="font-medium text-white mb-1">2. Descanso Corto</p>
            <p>Relájate 5 minutos después de cada pomodoro</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Coffee className="w-6 h-6 text-blue-400" />
            </div>
            <p className="font-medium text-white mb-1">3. Descanso Largo</p>
            <p>Toma 15 minutos cada 4 pomodoros</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
