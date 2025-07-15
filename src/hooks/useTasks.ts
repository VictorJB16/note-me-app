import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import type { Task, TimeEntry, NewTaskForm } from '../types/Task'
import { firestoreService } from '../services/firestoreService'

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [timeHistory, setTimeHistory] = useState<TimeEntry[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Cargar datos de Firestore al inicializar
  useEffect(() => {
    let unsubscribeTasks: (() => void) | null = null;
    let unsubscribeHistory: (() => void) | null = null;

    const loadData = async () => {
      try {
        if (isOnline) {
          // Usar listeners en tiempo real cuando esté online
          unsubscribeTasks = firestoreService.onTasksChange((tasks) => {
            setTasks(tasks);
            if (!isLoaded) {
              toast.success(`Se cargaron ${tasks.length} tareas desde la nube`);
            }
          });

          unsubscribeHistory = firestoreService.onTimeHistoryChange((history) => {
            setTimeHistory(history);
          });
        } else {
          // Cargar desde cache cuando esté offline
          const loadedTasks = await firestoreService.getTasks();
          const loadedHistory = await firestoreService.getTimeHistory();
          
          setTasks(loadedTasks);
          setTimeHistory(loadedHistory);
          
          toast('📱 Modo offline - Datos cargados desde cache');
        }
        
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Error al cargar los datos');
        setIsLoaded(true);
      }
    };

    loadData();    return () => {
      if (unsubscribeTasks) unsubscribeTasks();
      if (unsubscribeHistory) unsubscribeHistory();
    };
  }, [isOnline, isLoaded]);

  // Detectar cambios en conectividad
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('🌐 Conectado - Sincronizando datos...');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast('📱 Modo offline - Los cambios se sincronizarán cuando te conectes');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addTask = async (newTaskData: NewTaskForm) => {
    try {
      const task: Omit<Task, 'id'> = {
        title: newTaskData.title,
        description: newTaskData.description,
        status: 'nueva',
        createdAt: new Date(),
        timeSpent: 0,
        pomodoroSessions: 0
      }

      const taskId = await firestoreService.addTask(task);
      
      await firestoreService.addTimeEntry({
        taskId,
        action: 'Tarea creada',
        timestamp: new Date()
      });

      toast.success('Tarea creada exitosamente');
    } catch (error) {
      console.error('Error adding task:', error);      toast.error('Error al crear la tarea');
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const now = new Date();
      const updates: Partial<Task> = { status: newStatus };
      let duration = 0;

      if (newStatus === 'en-proceso' && task.status === 'nueva') {
        updates.startedAt = now;
      } else if (newStatus === 'completada') {
        updates.completedAt = now;
        if (task.startedAt) {
          duration = Math.round((now.getTime() - task.startedAt.getTime()) / (1000 * 60));
          updates.timeSpent = duration;
        }
      }

      await firestoreService.updateTask(taskId, updates);

      await firestoreService.addTimeEntry({
        taskId,
        action: `Estado cambiado a ${newStatus}`,
        timestamp: now,
        duration: duration > 0 ? duration : undefined
      });

      // Toast notifications para cambios de estado
      const statusMessages = {
        'nueva': 'Tarea reiniciada',
        'en-proceso': 'Tarea iniciada - ¡Tiempo corriendo!',
        'completada': `Tarea completada${duration > 0 ? ` en ${duration} minutos` : ''}`
      };
      toast.success(statusMessages[newStatus]);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Error al actualizar el estado de la tarea');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const taskToDelete = tasks.find(task => task.id === taskId);
      
      await firestoreService.deleteTask(taskId);
      
      if (taskToDelete) {
        toast.success(`Tarea "${taskToDelete.title}" eliminada`);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Error al eliminar la tarea');
    }
  };

  const updateTaskPomodoroCount = async (taskId: string, increment: number = 1) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const newCount = (task.pomodoroSessions || 0) + increment;
      await firestoreService.updateTask(taskId, { 
        pomodoroSessions: newCount 
      });

      await firestoreService.addTimeEntry({
        taskId,
        action: `Pomodoro completado (Total: ${newCount})`,
        timestamp: new Date(),
        pomodoroType: 'focus'
      });
    } catch (error) {
      console.error('Error updating pomodoro count:', error);
    }
  };

  // Función para limpiar datos manualmente
  const clearAllData = async () => {
    try {
      // Eliminar todas las tareas (esto también eliminará historial y sesiones relacionadas)
      const deletePromises = tasks.map(task => firestoreService.deleteTask(task.id));
      await Promise.all(deletePromises);
      
      toast.success('Todos los datos han sido eliminados');
    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error('Error al eliminar los datos');
    }
  };

  // Función para obtener estadísticas
  const getStorageInfo = () => {
    return {
      tasksCount: tasks.length,
      historyCount: timeHistory.length,
      lastSave: isOnline ? new Date() : null,
      expiryDate: null, // No hay expiración con Firestore
      isOnline
    };
  };  return {
    tasks,
    timeHistory,
    isLoaded,
    isOnline,
    addTask,
    updateTaskStatus,
    deleteTask,
    updateTaskPomodoroCount,
    clearAllData,
    getStorageInfo
  }
}
