import React from 'react'
import {
  Boxes,
  DollarSign,
  Scale,
  FileSpreadsheet,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Warehouse,
} from 'lucide-react'
import { useAgroStore } from '../../store/useAgroStore'
import type { BodegaView } from '../../types'

interface NavItem {
  id: BodegaView
  label: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'ingreso',
    label: 'Lotes & Recepción',
    subtitle: 'Ingreso, pesaje y flete',
    icon: Boxes,
  },
  {
    id: 'gastos',
    label: 'Gastos por Lote',
    subtitle: 'Fletes, cuadrillas, SAG',
    icon: DollarSign,
  },
  {
    id: 'calibracion',
    label: 'Calibración & Stock',
    subtitle: 'Desglose calibre y ventas',
    icon: Scale,
  },
  {
    id: 'resumen',
    label: 'Resumen & P&L',
    subtitle: 'Liquidación y margen neto',
    icon: FileSpreadsheet,
  },
]

export const Sidebar: React.FC = () => {
  const {
    activeBodegaView,
    setActiveBodegaView,
    setActiveModule,
    sidebarCollapsed,
    toggleSidebar,
    receptions,
    expenses,
    activeBatchId,
  } = useAgroStore()

  // Badge indicators
  const batchReceptionsCount = receptions.filter((r) => r.batchId === activeBatchId).length
  const batchExpensesCount = expenses.filter((e) => e.batchId === activeBatchId).length

  return (
    <aside
      className={`bg-white border-r border-slate-200/90 flex flex-col justify-between transition-all duration-200 ease-in-out flex-shrink-0 z-20 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div>
        <div className="h-14 px-4 border-b border-slate-100 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                <Warehouse className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 block leading-none">
                  Bodega Central
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold leading-none">
                  Operaciones Planta
                </span>
              </div>
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ${
              sidebarCollapsed ? 'mx-auto' : ''
            }`}
            title={sidebarCollapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeBodegaView === item.id

            return (
              <button
                key={item.id}
                onClick={() => setActiveBodegaView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all relative ${
                  isActive
                    ? 'bg-emerald-50/90 text-emerald-800 font-bold border border-emerald-200/80 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                title={sidebarCollapsed ? `${item.label} (${item.subtitle})` : undefined}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors ${
                    isActive ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                />

                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs truncate">{item.label}</span>
                      {item.id === 'ingreso' && batchReceptionsCount > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {batchReceptionsCount}
                        </span>
                      )}
                      {item.id === 'gastos' && batchExpensesCount > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {batchExpensesCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal block truncate">
                      {item.subtitle}
                    </span>
                  </div>
                )}

                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-700 rounded-r-md" />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom Footer: Back to Hub button */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={() => setActiveModule('hub')}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-colors ${
            sidebarCollapsed ? 'justify-center px-0' : ''
          }`}
          title="← Volver al Hub de Módulos"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 flex-shrink-0" />
          {!sidebarCollapsed && <span>← Volver al Hub</span>}
        </button>
      </div>
    </aside>
  )
}
