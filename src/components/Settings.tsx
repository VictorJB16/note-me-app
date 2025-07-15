import { motion } from 'framer-motion'
import { Database, Trash2, Info, Calendar, Clock } from 'lucide-react'

interface StorageInfo {
  tasksCount: number
  historyCount: number
  lastSave: Date | null
  expiryDate: Date | null
}

interface SettingsProps {
  onClearData: () => void
  getStorageInfo: () => StorageInfo
}

export default function Settings({ onClearData, getStorageInfo }: SettingsProps) {
  const storageInfo = getStorageInfo()

  const handleClearData = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
      onClearData()
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A'
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDaysUntilExpiry = () => {
    if (!storageInfo.expiryDate) return null
    const now = new Date()
    const diffTime = storageInfo.expiryDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilExpiry = getDaysUntilExpiry()

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Database className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Información de Almacenamiento</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">Tareas Guardadas</span>
            </div>
            <p className="text-2xl font-bold text-white">{storageInfo.tasksCount}</p>
          </div>

          <div className="bg-gray-700/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-gray-300">Entradas de Historial</span>
            </div>
            <p className="text-2xl font-bold text-white">{storageInfo.historyCount}</p>
          </div>

          <div className="bg-gray-700/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-gray-300">Último Guardado</span>
            </div>
            <p className="text-sm text-white">{formatDate(storageInfo.lastSave)}</p>
          </div>

          <div className="bg-gray-700/30 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-gray-300">Expira en</span>
            </div>
            <p className="text-sm text-white">
              {daysUntilExpiry !== null ? `${daysUntilExpiry} días` : 'N/A'}
            </p>
          </div>
        </div>

        {storageInfo.expiryDate && (
          <div className={`p-4 rounded-xl border ${
            daysUntilExpiry && daysUntilExpiry <= 2 
              ? 'bg-red-500/10 border-red-500/30 text-red-400' 
              : daysUntilExpiry && daysUntilExpiry <= 5
                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                : 'bg-green-500/10 border-green-500/30 text-green-400'
          }`}>
            <p className="text-sm">
              <strong>Fecha de expiración:</strong> {formatDate(storageInfo.expiryDate)}
            </p>
            <p className="text-xs mt-1 opacity-80">
              Los datos se eliminan automáticamente después de 7 días para mantener el almacenamiento limpio.
            </p>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Gestión de Datos</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <h3 className="font-medium text-red-400 mb-2">Zona Peligrosa</h3>
            <p className="text-sm text-gray-300 mb-4">
              Eliminar todos los datos borrará permanentemente todas las tareas y el historial. 
              Esta acción no se puede deshacer.
            </p>
            <motion.button
              onClick={handleClearData}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trash2 size={16} />
              <span>Eliminar Todos los Datos</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Acerca de Note Me App</h2>
        <div className="space-y-3 text-sm text-gray-300">
          <p>
            <strong className="text-white">Versión:</strong> 1.0.0
          </p>
          <p>
            <strong className="text-white">Características:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Gestión de tareas con estados (nueva, en proceso, completada)</li>
            <li>Seguimiento automático de tiempo</li>
            <li>Historial detallado de actividades</li>
            <li>Almacenamiento persistente (7 días)</li>
            <li>Tema oscuro y diseño responsivo</li>
            <li>Optimizado para dispositivos móviles</li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}
