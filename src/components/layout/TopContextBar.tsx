import React, { useState } from 'react'
import {
  ChevronDown,
  Sparkles,
  RotateCcw,
  MapPin,
  Scale,
  Check,
  AlertTriangle,
} from 'lucide-react'
import { useAgroStore } from '../../store/useAgroStore'
import { formatKg } from '../../utils/formatters'

export const TopContextBar: React.FC = () => {
  const {
    batches,
    activeBatchId,
    setActiveBatchId,
    receptions,
    resetAllData,
    showToast,
  } = useAgroStore()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showConfirmReset, setShowConfirmReset] = useState(false)

  const currentBatch = batches.find((b) => b.id === activeBatchId) || batches[0]
  const batchReceptions = receptions.filter((r) => r.batchId === currentBatch.id)
  const totalKilos = batchReceptions.reduce((acc, curr) => acc + curr.netWeightKg, 0)

  const handleSelectBatch = (id: string) => {
    setActiveBatchId(id)
    setDropdownOpen(false)
    const selected = batches.find((b) => b.id === id)
    showToast(`Lote activo cambiado a: ${selected?.code} (${selected?.produce})`)
  }

  const handleConfirmReset = () => {
    resetAllData()
    setShowConfirmReset(false)
    showToast('Datos del sistema reiniciados al estado original de bodega.')
  }

  return (
    <>
      <div className="h-12 border-b border-slate-200/90 bg-white/95 backdrop-blur-xs px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-10 shadow-2xs">
        {/* Left: Active Batch Selector Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Lote Activo:
          </span>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-xs font-bold text-slate-800 transition-colors shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>
                {currentBatch.code} · {currentBatch.produce} · {currentBatch.producer}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-1.5 w-80 rounded-xl bg-white border border-slate-200 shadow-xl z-40 py-1 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Seleccionar Partida de Fruta
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {batches.map((batch) => {
                      const isSelected = batch.id === currentBatch.id
                      const bKilos = receptions
                        .filter((r) => r.batchId === batch.id)
                        .reduce((acc, curr) => acc + curr.netWeightKg, 0)

                      return (
                        <button
                          key={batch.id}
                          onClick={() => handleSelectBatch(batch.id)}
                          className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-emerald-50/80 text-emerald-900 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold">{batch.code}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                                {batch.produce}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block truncate">
                              {batch.producer} · {batch.origin.split('/')[1] || batch.origin}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-semibold text-slate-700 block">
                              {formatKg(bKilos)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {batch.status}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Context Chips */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 pl-2 border-l border-slate-200">
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
              <MapPin className="w-3 h-3 text-slate-400" />
              {currentBatch.origin}
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700">
              <Scale className="w-3 h-3 text-emerald-600" />
              {formatKg(totalKilos)} en Bodega
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {currentBatch.status}
            </span>
          </div>
        </div>

        {/* Right: Sandbox Badge & Reiniciar Datos */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50/80 border border-amber-200 text-amber-800 text-[11px] font-semibold">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span className="hidden sm:inline">Demo Sandbox</span>
          </div>

          <button
            onClick={() => setShowConfirmReset(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-transparent hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            title="Reiniciar datos del lote y bodega al estado inicial"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">↻ Reiniciar datos</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  ¿Reiniciar todos los datos?
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Se restablecerán los lotes chilenos, recepciones, gastos por lote y calibraciones al valor inicial de demostración.
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
                Confirmar reinicio
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
