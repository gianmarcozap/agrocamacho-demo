import React, { useState } from 'react'
import {
  RotateCcw,
  Sparkles,
  Sprout,
  Check,
  AlertTriangle,
} from 'lucide-react'
import { useAgroStore } from '../../store/useAgroStore'

interface HeaderProps {
  showModuleBreadcrumb?: boolean
}

export const Header: React.FC<HeaderProps> = ({ showModuleBreadcrumb = false }) => {
  const { activeModule, resetAllData, showToast } = useAgroStore()
  const [showConfirmReset, setShowConfirmReset] = useState(false)

  const handleConfirmReset = () => {
    resetAllData()
    setShowConfirmReset(false)
    showToast('Datos del sistema reiniciados al estado inicial con éxito.')
  }

  return (
    <>
      <header className="h-14 border-b border-slate-200/90 bg-white px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-30 select-none">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-700 text-white shadow-xs">
            <Sprout className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-base leading-none">
                AgroCamacho
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80 leading-none">
                Export v2.4
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Gestión Integral de Frutas & Logística
            </span>
          </div>

          {showModuleBreadcrumb && (
            <div className="hidden md:flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-200 text-xs text-slate-500 font-medium">
              <span>Módulos</span>
              <span>/</span>
              <span className="font-semibold text-emerald-800 capitalize">
                {activeModule === 'bodega' ? 'Bodega (Recepción & Almacenamiento)' : activeModule}
              </span>
            </div>
          )}
        </div>

        {/* Center / Right Control Cluster */}
        <div className="flex items-center gap-3">
          {/* System status */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">En Línea</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">Planta Quillota</span>
          </div>

          {/* Discrete Demo Sandbox Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/90 text-amber-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Demo Sandbox</span>
          </div>

          {/* Ghost button: Reiniciar datos */}
          <button
            onClick={() => setShowConfirmReset(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-transparent hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            title="Reiniciar todos los lotes, gastos y calibraciones a su estado original de demostración"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">↻ Reiniciar datos</span>
          </button>

          {/* User Profile Chip */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
              G
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-tight">
                Gian
              </span>
              <span className="text-[10px] text-slate-500 font-medium leading-tight">
                Ingeniero de Planta
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Confirmation Modal for Reset Data */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  ¿Reiniciar datos del sistema?
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Esta acción restaurará los lotes originales de exportación chilena (Lote 00038, Lote 00001, etc.), fletes, notas de venta y gastos al estado inicial de fábrica.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Sí, reiniciar datos
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
