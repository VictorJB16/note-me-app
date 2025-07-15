import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Task, TimeEntry, PomodoroSession } from '../types/Task';

// Colecciones de Firestore
const COLLECTIONS = {
  TASKS: 'tasks',
  TIME_HISTORY: 'timeHistory',
  POMODORO_SESSIONS: 'pomodoroSessions'
} as const;

// Convertir Timestamp de Firebase a Date
const timestampToDate = (timestamp: Timestamp | Date | {seconds: number} | null | undefined): Date => {
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    return (timestamp as Timestamp).toDate();
  }
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    return new Date((timestamp as {seconds: number}).seconds * 1000);
  }
  return timestamp instanceof Date ? timestamp : new Date();
};

// Convertir Date a formato compatible con Firestore
const dateToFirestore = (date: Date) => {
  return Timestamp.fromDate(date);
};

export const firestoreService = {
  // ========== TASKS ==========
  async getTasks(): Promise<Task[]> {
    try {
      const tasksQuery = query(
        collection(db, COLLECTIONS.TASKS),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(tasksQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToDate(data.createdAt),
          startedAt: data.startedAt ? timestampToDate(data.startedAt) : undefined,
          completedAt: data.completedAt ? timestampToDate(data.completedAt) : undefined,
        } as Task;
      });
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  },

  async addTask(task: Omit<Task, 'id'>): Promise<string> {
    try {
      const taskData = {
        ...task,
        createdAt: dateToFirestore(task.createdAt),
        startedAt: task.startedAt ? dateToFirestore(task.startedAt) : null,
        completedAt: task.completedAt ? dateToFirestore(task.completedAt) : null,
        pomodoroSessions: task.pomodoroSessions || 0
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.TASKS), taskData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },
  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    try {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      const updateData: Record<string, any> = { ...updates };
      
      // Convertir fechas a Timestamp
      if (updateData.createdAt) {
        updateData.createdAt = dateToFirestore(updateData.createdAt);
      }
      if (updateData.startedAt) {
        updateData.startedAt = dateToFirestore(updateData.startedAt);
      }
      if (updateData.completedAt) {
        updateData.completedAt = dateToFirestore(updateData.completedAt);
      }
      
      await updateDoc(taskRef, updateData);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    try {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId);
      await deleteDoc(taskRef);
      
      // También eliminar el historial relacionado
      await this.deleteTimeHistoryForTask(taskId);
      await this.deletePomodoroSessionsForTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // ========== TIME HISTORY ==========
  async getTimeHistory(): Promise<TimeEntry[]> {
    try {
      const historyQuery = query(
        collection(db, COLLECTIONS.TIME_HISTORY),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(historyQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          timestamp: timestampToDate(data.timestamp),
        } as TimeEntry;
      });
    } catch (error) {
      console.error('Error getting time history:', error);
      throw error;
    }
  },

  async addTimeEntry(entry: TimeEntry): Promise<void> {
    try {
      const entryData = {
        ...entry,
        timestamp: dateToFirestore(entry.timestamp)
      };
      
      await addDoc(collection(db, COLLECTIONS.TIME_HISTORY), entryData);
    } catch (error) {
      console.error('Error adding time entry:', error);
      throw error;
    }
  },

  async deleteTimeHistoryForTask(taskId: string): Promise<void> {
    try {
      const historyQuery = query(
        collection(db, COLLECTIONS.TIME_HISTORY),
        where('taskId', '==', taskId)
      );
      const snapshot = await getDocs(historyQuery);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting time history for task:', error);
      throw error;
    }
  },

  // ========== POMODORO SESSIONS ==========
  async getPomodoroSessions(taskId?: string): Promise<PomodoroSession[]> {
    try {
      let sessionsQuery = query(
        collection(db, COLLECTIONS.POMODORO_SESSIONS),
        orderBy('startTime', 'desc')
      );
      
      if (taskId) {
        sessionsQuery = query(
          collection(db, COLLECTIONS.POMODORO_SESSIONS),
          where('taskId', '==', taskId),
          orderBy('startTime', 'desc')
        );
      }
      
      const snapshot = await getDocs(sessionsQuery);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startTime: timestampToDate(data.startTime),
          endTime: data.endTime ? timestampToDate(data.endTime) : undefined,
        } as PomodoroSession;
      });
    } catch (error) {
      console.error('Error getting pomodoro sessions:', error);
      throw error;
    }
  },

  async addPomodoroSession(session: Omit<PomodoroSession, 'id'>): Promise<string> {
    try {
      const sessionData = {
        ...session,
        startTime: dateToFirestore(session.startTime),
        endTime: session.endTime ? dateToFirestore(session.endTime) : null
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.POMODORO_SESSIONS), sessionData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding pomodoro session:', error);
      throw error;
    }
  },
  async updatePomodoroSession(sessionId: string, updates: Partial<PomodoroSession>): Promise<void> {
    try {
      const sessionRef = doc(db, COLLECTIONS.POMODORO_SESSIONS, sessionId);
      const updateData: Record<string, any> = { ...updates };
      
      if (updateData.startTime) {
        updateData.startTime = dateToFirestore(updateData.startTime);
      }
      if (updateData.endTime) {
        updateData.endTime = dateToFirestore(updateData.endTime);
      }
      
      await updateDoc(sessionRef, updateData);
    } catch (error) {
      console.error('Error updating pomodoro session:', error);
      throw error;
    }
  },

  async deletePomodoroSessionsForTask(taskId: string): Promise<void> {
    try {
      const sessionsQuery = query(
        collection(db, COLLECTIONS.POMODORO_SESSIONS),
        where('taskId', '==', taskId)
      );
      const snapshot = await getDocs(sessionsQuery);
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting pomodoro sessions for task:', error);
      throw error;
    }
  },

  // ========== REAL-TIME LISTENERS ==========
  onTasksChange(callback: (tasks: Task[]) => void): () => void {
    const tasksQuery = query(
      collection(db, COLLECTIONS.TASKS),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(tasksQuery, (snapshot) => {
      const tasks = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToDate(data.createdAt),
          startedAt: data.startedAt ? timestampToDate(data.startedAt) : undefined,
          completedAt: data.completedAt ? timestampToDate(data.completedAt) : undefined,
        } as Task;
      });
      callback(tasks);
    });
  },

  onTimeHistoryChange(callback: (history: TimeEntry[]) => void): () => void {
    const historyQuery = query(
      collection(db, COLLECTIONS.TIME_HISTORY),
      orderBy('timestamp', 'desc')
    );
    
    return onSnapshot(historyQuery, (snapshot) => {
      const history = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          timestamp: timestampToDate(data.timestamp),
        } as TimeEntry;
      });
      callback(history);
    });
  }
};
