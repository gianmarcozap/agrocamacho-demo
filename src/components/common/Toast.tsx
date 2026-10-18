import React from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { useAgroStore } from '../../store/useAgroStore'

export const Toast: React.FC = () => {
  const { toastMessage, clearToast } = useAgroStore()

  if (!toastMessage) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2">
      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
      <span className="text-sm font-medium text-slate-800">{toastMessage}</span>
      <button
        onClick={clearToast}
        className="ml-2 text-slate-400 hover:text-slate-600 transition-colors"
        aria-label="Cerrar notificación"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
