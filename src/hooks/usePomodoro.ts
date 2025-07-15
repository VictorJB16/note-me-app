import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import type { PomodoroState, PomodoroSession } from '../types/Task';
import { firestoreService } from '../services/firestoreService';

const POMODORO_TIMES = {
  FOCUS: 25 * 60,      // 25 minutos en segundos
  SHORT_BREAK: 5 * 60,  // 5 minutos en segundos
  LONG_BREAK: 15 * 60   // 15 minutos en segundos
} as const;

const LONG_BREAK_INTERVAL = 4; // Cada 4 pomodoros, descanso largo

export const usePomodoro = (updateTaskPomodoroCount?: (taskId: string, increment: number) => Promise<void>) => {
  const [pomodoroState, setPomodoroState] = useState<PomodoroState>({
    isActive: false,
    currentSession: null,
    timeRemaining: POMODORO_TIMES.FOCUS,
    currentTaskId: null,
    focusCount: 0,
    isBreak: false
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializar audio para notificaciones
  useEffect(() => {
    // Crear un audio simple usando Web Audio API
    const createBeep = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };
    
    audioRef.current = { play: createBeep } as any;
  }, []);

  // Limpiar intervalo al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Manejar el countdown
  useEffect(() => {
    if (pomodoroState.isActive && pomodoroState.timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setPomodoroState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
    } else if (pomodoroState.timeRemaining === 0 && pomodoroState.currentSession) {
      // Sesión completada
      handleSessionComplete();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pomodoroState.isActive, pomodoroState.timeRemaining]);

  const startPomodoro = async (taskId: string) => {
    try {
      const session: Omit<PomodoroSession, 'id'> = {
        taskId,
        type: 'focus',
        duration: POMODORO_TIMES.FOCUS,
        startTime: new Date(),
        completed: false
      };

      const sessionId = await firestoreService.addPomodoroSession(session);

      setPomodoroState({
        isActive: true,
        currentSession: { ...session, id: sessionId },
        timeRemaining: POMODORO_TIMES.FOCUS,
        currentTaskId: taskId,
        focusCount: pomodoroState.focusCount,
        isBreak: false
      });

      toast.success('🍅 Pomodoro iniciado - ¡Hora de concentrarse!');
    } catch (error) {
      console.error('Error starting pomodoro:', error);
      toast.error('Error al iniciar el Pomodoro');
    }
  };

  const startBreak = async (type: 'short-break' | 'long-break') => {
    try {
      const duration = type === 'short-break' ? POMODORO_TIMES.SHORT_BREAK : POMODORO_TIMES.LONG_BREAK;
      
      const session: Omit<PomodoroSession, 'id'> = {
        taskId: pomodoroState.currentTaskId || '',
        type,
        duration,
        startTime: new Date(),
        completed: false
      };

      const sessionId = await firestoreService.addPomodoroSession(session);

      setPomodoroState(prev => ({
        ...prev,
        isActive: true,
        currentSession: { ...session, id: sessionId },
        timeRemaining: duration,
        isBreak: true
      }));

      const breakMessage = type === 'short-break' ? 
        '☕ Descanso corto - ¡5 minutos para relajarte!' : 
        '🌟 Descanso largo - ¡15 minutos para recargar energías!';
      
      toast.success(breakMessage);
    } catch (error) {
      console.error('Error starting break:', error);
      toast.error('Error al iniciar el descanso');
    }
  };

  const pausePomodoro = () => {
    setPomodoroState(prev => ({
      ...prev,
      isActive: false
    }));
    toast('⏸️ Pomodoro pausado');
  };

  const resumePomodoro = () => {
    setPomodoroState(prev => ({
      ...prev,
      isActive: true
    }));
    toast('▶️ Pomodoro reanudado');
  };

  const stopPomodoro = async () => {
    try {
      if (pomodoroState.currentSession) {
        // Marcar sesión como no completada
        await firestoreService.updatePomodoroSession(pomodoroState.currentSession.id, {
          completed: false,
          endTime: new Date()
        });
      }

      setPomodoroState({
        isActive: false,
        currentSession: null,
        timeRemaining: POMODORO_TIMES.FOCUS,
        currentTaskId: null,
        focusCount: pomodoroState.focusCount,
        isBreak: false
      });

      toast('🛑 Pomodoro detenido');
    } catch (error) {
      console.error('Error stopping pomodoro:', error);
      toast.error('Error al detener el Pomodoro');
    }
  };

  const handleSessionComplete = async () => {
    try {
      if (!pomodoroState.currentSession) return;

      // Reproducir sonido de notificación
      if (audioRef.current?.play) {
        audioRef.current.play();
      }

      // Marcar sesión como completada
      await firestoreService.updatePomodoroSession(pomodoroState.currentSession.id, {
        completed: true,
        endTime: new Date()
      });

      // Agregar entrada al historial
      const action = pomodoroState.currentSession.type === 'focus' ? 
        'Pomodoro completado' : 
        `Descanso ${pomodoroState.currentSession.type === 'short-break' ? 'corto' : 'largo'} completado`;

      await firestoreService.addTimeEntry({
        taskId: pomodoroState.currentTaskId || '',
        action,
        timestamp: new Date(),
        duration: Math.round(pomodoroState.currentSession.duration / 60),
        pomodoroType: pomodoroState.currentSession.type
      });

      if (pomodoroState.currentSession.type === 'focus') {        // Incrementar contador de pomodoros completados
        const newFocusCount = pomodoroState.focusCount + 1;
        
        // Actualizar contador de pomodoros en la tarea
        if (pomodoroState.currentTaskId && updateTaskPomodoroCount) {
          await updateTaskPomodoroCount(pomodoroState.currentTaskId, 1);
        }

        // Determinar tipo de descanso
        const shouldLongBreak = newFocusCount % LONG_BREAK_INTERVAL === 0;
        const breakType = shouldLongBreak ? 'long-break' : 'short-break';

        setPomodoroState(prev => ({
          ...prev,
          isActive: false,
          focusCount: newFocusCount
        }));

        toast.success(`🎉 ¡Pomodoro #${newFocusCount} completado!`);
        
        // Preguntar si quiere iniciar descanso
        setTimeout(() => {
          const breakMessage = shouldLongBreak ? 
            '¿Quieres tomar un descanso largo de 15 minutos?' : 
            '¿Quieres tomar un descanso corto de 5 minutos?';
          
          if (window.confirm(breakMessage)) {
            startBreak(breakType);
          } else {
            resetPomodoro();
          }
        }, 1000);

      } else {
        // Descanso completado
        setPomodoroState(prev => ({
          ...prev,
          isActive: false,
          isBreak: false
        }));

        toast.success('✅ ¡Descanso completado!');
        
        // Preguntar si quiere iniciar otro pomodoro
        setTimeout(() => {
          if (window.confirm('¿Quieres iniciar otro Pomodoro?')) {
            if (pomodoroState.currentTaskId) {
              startPomodoro(pomodoroState.currentTaskId);
            }
          } else {
            resetPomodoro();
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error completing session:', error);
      toast.error('Error al completar la sesión');
    }
  };

  const resetPomodoro = () => {
    setPomodoroState({
      isActive: false,
      currentSession: null,
      timeRemaining: POMODORO_TIMES.FOCUS,
      currentTaskId: null,
      focusCount: pomodoroState.focusCount,
      isBreak: false
    });
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSessionProgress = (): number => {
    if (!pomodoroState.currentSession) return 0;
    const totalTime = pomodoroState.currentSession.duration;
    const elapsedTime = totalTime - pomodoroState.timeRemaining;
    return (elapsedTime / totalTime) * 100;
  };

  return {
    pomodoroState,
    startPomodoro,
    startBreak,
    pausePomodoro,
    resumePomodoro,
    stopPomodoro,
    resetPomodoro,
    formatTime,
    getSessionProgress,
    POMODORO_TIMES
  };
};
