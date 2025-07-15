// Test script for localStorage functionality
import { storageUtils } from '../utils/storage'
import type { Task, TimeEntry } from '../types/Task'

// Create test data
const testTasks: Task[] = [
  {
    id: '1',
    title: 'Tarea de prueba 1',
    description: 'Esta es una tarea de prueba',
    status: 'nueva',
    createdAt: new Date(),
    timeSpent: 0
  },
  {
    id: '2',
    title: 'Tarea de prueba 2',
    description: 'Esta es otra tarea de prueba',
    status: 'en-proceso',
    createdAt: new Date(Date.now() - 60000), // 1 minute ago
    startedAt: new Date(Date.now() - 30000), // 30 seconds ago
    timeSpent: 0
  }
]

const testHistory: TimeEntry[] = [
  {
    taskId: '1',
    action: 'Tarea creada',
    timestamp: new Date()
  },
  {
    taskId: '2',
    action: 'Tarea creada',
    timestamp: new Date(Date.now() - 60000)
  },
  {
    taskId: '2',
    action: 'Estado cambiado a en-proceso',
    timestamp: new Date(Date.now() - 30000)
  }
]

// Test storage functions
export const testStorage = () => {
  console.log('🧪 Testing storage functionality...')
  
  try {
    // Test saving
    console.log('💾 Saving test data...')
    storageUtils.saveTasks(testTasks)
    storageUtils.saveTimeHistory(testHistory)
    
    // Test loading
    console.log('📥 Loading test data...')
    const loadedTasks = storageUtils.loadTasks()
    const loadedHistory = storageUtils.loadTimeHistory()
    
    console.log('✅ Loaded tasks:', loadedTasks)
    console.log('✅ Loaded history:', loadedHistory)
    
    // Test storage info
    console.log('📊 Storage info:', storageUtils.getStorageInfo())
    
    console.log('✅ All storage tests passed!')
    return true
  } catch (error) {
    console.error('❌ Storage test failed:', error)
    return false
  }
}

// Test expiry functionality
export const testExpiry = () => {
  console.log('⏰ Testing expiry functionality...')
  
  try {
    // Save data with old timestamp (simulate expired data)
    const expiredData = {
      tasks: testTasks,
      timestamp: Date.now() - (8 * 24 * 60 * 60 * 1000) // 8 days ago
    }
    
    localStorage.setItem('note-me-app-tasks', JSON.stringify(expiredData))
    
    // Try to load expired data
    const loadedTasks = storageUtils.loadTasks()
    
    if (loadedTasks.length === 0) {
      console.log('✅ Expired data was correctly removed')
      return true
    } else {
      console.log('❌ Expired data was not removed')
      return false
    }
  } catch (error) {
    console.error('❌ Expiry test failed:', error)
    return false
  }
}

// Run tests if in development
if (import.meta.env.DEV) {
  // Uncomment to run tests
  // testStorage()
  // testExpiry()
}
