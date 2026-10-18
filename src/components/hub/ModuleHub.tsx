import React, { useState } from 'react'
import {
  Warehouse,
  ThermometerSnowflake,
  Truck,
  ArrowRight,
  Activity,
  Ship,
  Plane,
} from 'lucide-react'
import { useAgroStore } from '../../store/useAgroStore'
import { formatKg } from '../../utils/formatters'

export const ModuleHub: React.FC = () => {
  const { setActiveModule, setActiveBodegaView, batches, receptions, packaging } = useAgroStore()
  const [showFrioModal, setShowFrioModal] = useState(false)
  const [showTransporteModal, setShowTransporteModal] = useState(false)

  // Calculations for quick snapshot
  const totalKilos = receptions.reduce((acc, curr) => acc + curr.netWeightKg, 0)
  const totalBins = packaging.reduce((acc, curr) => acc + curr.enteredCount, 0)
  const pendingBins = packaging.reduce((acc, curr) => acc + curr.pendingCount, 0)

  const handleEnterBodega = (view: 'ingreso' | 'gastos' | 'calibracion' | 'resumen' = 'ingreso') => {
    setActiveBodegaView(view)
    setActiveModule('bodega')
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col p-6 lg:p-10 max-w-7xl mx-auto w-full">
      {/* Welcome Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
            <span>Centro de Control Operativo</span>
            <span>·</span>
            <span>Planta Exportadora Quillota</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Plataforma AgroCamacho Export
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Gestione la trazabilidad física y financiera de partidas de exportación: pesaje en báscula, cuadrillas, control de envases, calibración en cámara y liquidación neta de productores.
          </p>
        </div>

        {/* Global summary pill row */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="px-3 py-1 border-r border-slate-200 text-center">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Lotes Activos
            </span>
            <span className="text-lg font-bold text-slate-900 leading-tight">
              {batches.length}
            </span>
          </div>
          <div className="px-3 py-1 border-r border-slate-200 text-center">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Fruta Recepcionada
            </span>
            <span className="text-lg font-bold text-emerald-700 leading-tight">
              {formatKg(totalKilos)}
            </span>
          </div>
          <div className="px-3 py-1 text-center">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Bins en Circulación
            </span>
            <span className="text-lg font-bold text-amber-600 leading-tight">
              {pendingBins} de {totalBins}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Main Module Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module 1: Bodega (Recepción & Almacenamiento) - Green theme, active */}
        <div
          onClick={() => handleEnterBodega('ingreso')}
          className="group relative bg-white rounded-2xl border-2 border-emerald-600/40 hover:border-emerald-600 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer p-6 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 opacity-80 group-hover:scale-105 transition-transform" />

          <div className="relative z-10">
            {/* Header / Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                <Warehouse className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Módulo Activo
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
              Bodega
            </h2>
            <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider mt-0.5">
              Recepción & Almacenamiento
            </p>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Control de pesaje de báscula, asignación de choferes y camiones, conciliación de bins retornables y notas de cobro.
            </p>

            {/* Micro Stats inside Card */}
            <div className="mt-5 grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-100">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[11px] text-slate-500 font-medium block">
                  Lotes en Planta
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {batches.length} Lotes Registrados
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-[11px] text-slate-500 font-medium block">
                  Control Envases
                </span>
                <span className="text-sm font-bold text-emerald-800">
                  {totalBins} Bins Ingresados
                </span>
              </div>
            </div>

            {/* Quick access sub-links */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleEnterBodega('ingreso')
                }}
                className="text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2 py-1 rounded border border-emerald-200/80"
              >
                Lotes & Recepción
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleEnterBodega('gastos')
                }}
                className="text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2 py-1 rounded border border-emerald-200/80"
              >
                Gastos
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleEnterBodega('calibracion')
                }}
                className="text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2 py-1 rounded border border-emerald-200/80"
              >
                Calibración
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleEnterBodega('resumen')
                }}
                className="text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2 py-1 rounded border border-emerald-200/80"
              >
                P&L Lote
              </button>
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-emerald-700 font-semibold text-sm group-hover:translate-x-0.5 transition-transform">
            <span>Ingresar al Módulo Operativo</span>
            <ArrowRight className="w-4 h-4 text-emerald-700" />
          </div>
        </div>

        {/* Module 2: Cámara de Frío (Control de Inventario & Sensores) - Blue theme, active */}
        <div
          onClick={() => setShowFrioModal(true)}
          className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer p-6 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0 opacity-80 group-hover:scale-105 transition-transform" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <ThermometerSnowflake className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <Activity className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                Sensores en Vivo
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
              Cámara de Frío
            </h2>
            <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mt-0.5">
              Control de Inventario & Sensores
            </p>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Monitoreo continuo de temperatura de pulpa, humedad relativa y concentraciones de etileno en tiempo real para conservación de fruta.
            </p>

            {/* Live Telemetry preview */}
            <div className="mt-5 space-y-2 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded border border-slate-200">
                <span className="font-semibold text-slate-700">Cámara 01 (Palta Hass)</span>
                <span className="font-mono font-bold text-blue-600">4.2°C · 90% HR</span>
              </div>
              <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded border border-slate-200">
                <span className="font-semibold text-slate-700">Cámara 02 (Cítricos Limón)</span>
                <span className="font-mono font-bold text-blue-600">8.0°C · 85% HR</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-blue-600 font-semibold text-sm group-hover:translate-x-0.5 transition-transform">
            <span>Ver Telemetría & Racks</span>
            <ArrowRight className="w-4 h-4 text-blue-600" />
          </div>
        </div>

        {/* Module 3: Transporte & Despacho (Logística Marítima/Aérea) - Badge "Disponible en Demo" */}
        <div
          onClick={() => setShowTransporteModal(true)}
          className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer p-6 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-0 opacity-80 group-hover:scale-105 transition-transform" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-xs">
                <Truck className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                Disponible en Demo
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
              Transporte & Despacho
            </h2>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">
              Logística Marítima / Aérea
            </p>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Consolidación de contenedores refrigerados para puertos de San Antonio y Valparaíso. Rutas hacia Rotterdam, Shenzhen y Filadelfia.
            </p>

            <div className="mt-5 space-y-2 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <Ship className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-semibold text-slate-700">Ruta Marítima San Antonio</span>
                </div>
                <span className="font-semibold text-emerald-700">Reefer 40HC</span>
              </div>
              <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-slate-600" />
                  <span className="font-semibold text-slate-700">SCL Cargo Express</span>
                </div>
                <span className="font-semibold text-slate-600">Pallet Aéreo</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-slate-700 font-semibold text-sm group-hover:translate-x-0.5 transition-transform">
            <span>Explorar Manifiesto de Despacho</span>
            <ArrowRight className="w-4 h-4 text-slate-700" />
          </div>
        </div>
      </div>

      {/* Quick operational workflow guide */}
      <div className="mt-10 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-700" />
          Flujo de Trabajo Operacional Integrado en Bodega
        </h3>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-emerald-700 block mb-1">1. Lotes & Recepción</span>
            <p className="text-slate-600">Pesaje bruto en báscula, asignación de chofer y registro de envases retornables.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-emerald-700 block mb-1">2. Gastos por Lote</span>
            <p className="text-slate-600">Imputación directa de fletes, cuadrillas de carga y certificación SAG.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-emerald-700 block mb-1">3. Calibración & Stock</span>
            <p className="text-slate-600">Clasificación por calibre comercial y trazabilidad de notas de venta asociadas.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-emerald-700 block mb-1">4. Resumen & P&L</span>
            <p className="text-slate-600">Liquidación neta al productor con cálculo de comisiones, fletes e impuestos.</p>
          </div>
        </div>
      </div>

      {/* Modal: Cámara de Frío Telemetry Details */}
      {showFrioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <ThermometerSnowflake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Cámaras de Frío · Telemetría en Tiempo Real
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sensores calibrados bajo norma de exportación SAG / FDA
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFrioModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Cámara 01 - Palta Hass Pre-Enfriado</h4>
                  <p className="text-xs text-slate-600">Capacidad: 120 Bins · Lotes asignados: LOT-00038, LOT-00001</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-mono font-extrabold text-blue-700">4.2 °C</div>
                  <div className="text-xs text-slate-500 font-medium">90% HR · 0.04 ppm C₂H₄</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Cámara 02 - Cítricos Limón Eureka</h4>
                  <p className="text-xs text-slate-600">Capacidad: 80 Bins · Lote asignado: LOT-00014</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-mono font-extrabold text-emerald-700">8.0 °C</div>
                  <div className="text-xs text-slate-500 font-medium">85% HR · 0.01 ppm C₂H₄</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Cámara 03 - Pomelo Cara Cara</h4>
                  <p className="text-xs text-slate-600">Capacidad: 60 Bins · Lote asignado: LOT-00022</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-mono font-extrabold text-amber-700">6.5 °C</div>
                  <div className="text-xs text-slate-500 font-medium">88% HR · 0.02 ppm C₂H₄</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowFrioModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                Cerrar Monitor
              </button>
              <button
                onClick={() => {
                  setShowFrioModal(false)
                  handleEnterBodega('calibracion')
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                Ir a Calibración de Stock
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Transporte & Despacho Preview */}
      {showTransporteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Despacho & Rutas de Exportación
                  </h3>
                  <p className="text-xs text-slate-500">
                    Planificación Logística de Salida Intermodal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTransporteModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Ship className="w-4 h-4 text-blue-600" />
                    Valparaíso → Rotterdam (Países Bajos)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    Programado
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-600 flex justify-between">
                  <span>Naviera: Hapag-Lloyd · Reefer 40' HC</span>
                  <span>ETD: 22 Marzo 2025</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Ship className="w-4 h-4 text-blue-600" />
                    San Antonio → Shenzhen (China)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                    Reserva Confirmada
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-600 flex justify-between">
                  <span>Naviera: Maersk Line · Control Atmósfera CA</span>
                  <span>ETD: 26 Marzo 2025</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Plane className="w-4 h-4 text-slate-700" />
                    Aeropuerto SCL Cargo → Miami International (EE.UU.)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                    Aéreo Express
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-600 flex justify-between">
                  <span>Vuelo Cargo LATAM · 4 Pallets Primarios</span>
                  <span>ETD: 18 Marzo 2025</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowTransporteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setShowTransporteModal(false)
                  handleEnterBodega('ingreso')
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                Ir a Recepción de Lotes
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
