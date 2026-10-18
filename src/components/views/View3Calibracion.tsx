import React, { useState } from 'react'
import {
  Scale,
  RotateCcw,
  Download,
  Plus,
  Boxes,
  ShoppingCart,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Trash2,
} from 'lucide-react'
import { useAgroStore } from '../../store/useAgroStore'
import { formatCLP, formatKg } from '../../utils/formatters'

export const View3Calibracion: React.FC = () => {
  const {
    activeBatchId,
    batches,
    caliberStocks,
    salesOrders,
    revertCalibration,
    addSalesOrder,
    removeSalesOrder,
    showToast,
  } = useAgroStore()

  // Current batch
  const currentBatch = batches.find((b) => b.id === activeBatchId) || batches[0]
  const batchCalibers = caliberStocks.filter((c) => c.batchId === currentBatch.id)
  const batchSales = salesOrders.filter((s) => s.batchId === currentBatch.id)

  // Derived metrics
  const totalPurchasedKg = batchCalibers.reduce((acc, curr) => acc + curr.purchasedKg, 0)
  const totalStockKg = batchCalibers.reduce((acc, curr) => acc + curr.stockKg, 0)
  const totalSoldKg = batchCalibers.reduce((acc, curr) => acc + curr.soldKg, 0)
  const percentSold = totalPurchasedKg > 0 ? (totalSoldKg / totalPurchasedKg) * 100 : 0
  const percentStock = totalPurchasedKg > 0 ? (totalStockKg / totalPurchasedKg) * 100 : 0

  // Modals state
  const [showConfirmRevert, setShowConfirmRevert] = useState(false)
  const [showNewSaleModal, setShowNewSaleModal] = useState(false)

  // Sale form state
  const [saleForm, setSaleForm] = useState({
    orderNumber: `Nota Venta ${Math.floor(10000 + Math.random() * 90000).toString().slice(-5)}`,
    date: new Date().toISOString().slice(0, 10),
    client: 'Agrícola San Telmo SpA',
    caliberGrade: batchCalibers[0]?.caliberGrade || 'Palta Hass Calibre 09',
    kilosSold: 10,
    pricePerKgCLP: 3400,
    status: 'Despachado' as const,
    destination: 'Puerto Valparaíso (Contenedor Reefer #402)',
  })

  // Selected caliber remaining stock for validation
  const selectedCaliberObj = batchCalibers.find((c) => c.caliberGrade === saleForm.caliberGrade)
  const maxAvailableForSale = selectedCaliberObj?.stockKg || 0

  const handleRevert = () => {
    revertCalibration(currentBatch.id)
    setShowConfirmRevert(false)
    showToast(`Calibración del ${currentBatch.code} deshecha con éxito. Stock restablecido.`)
  }

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault()
    if (saleForm.kilosSold > maxAvailableForSale) {
      alert(`No es posible vender ${saleForm.kilosSold} KG. Stock disponible en calibre: ${maxAvailableForSale} KG.`)
      return
    }

    addSalesOrder({
      batchId: currentBatch.id,
      orderNumber: saleForm.orderNumber,
      date: saleForm.date,
      client: saleForm.client,
      caliberGrade: saleForm.caliberGrade,
      kilosSold: Number(saleForm.kilosSold),
      pricePerKgCLP: Number(saleForm.pricePerKgCLP),
      status: saleForm.status,
      destination: saleForm.destination,
    })

    setShowNewSaleModal(false)
    showToast(`Nota de venta ${saleForm.orderNumber} por ${saleForm.kilosSold} KG registrada con éxito.`)
  }

  const handleExportCSV = () => {
    // Generate authentic CSV string
    let csv = `TRAZABILIDAD DE CALIBRACION Y VENTAS - AGROCAMACHO EXPORT\n`
    csv += `Lote:;${currentBatch.code};Productor:;${currentBatch.producer};Especie:;${currentBatch.produce}\n`
    csv += `Fecha Emisión:;${new Date().toLocaleString('es-CL')}\n\n`

    csv += `DESGLOSE POR CALIBRE (EN CAMARA)\n`
    csv += `Calibre/Grado;Kilos Comprados;Kilos en Stock;Kilos Vendidos;% Saldo Stock\n`
    batchCalibers.forEach((c) => {
      const pct = c.purchasedKg > 0 ? ((c.stockKg / c.purchasedKg) * 100).toFixed(1) : '0'
      csv += `${c.caliberGrade};${c.purchasedKg};${c.stockKg};${c.soldKg};${pct}%\n`
    })

    csv += `\nTRAZABILIDAD DE NOTAS DE VENTA ASOCIADAS\n`
    csv += `N° Nota Venta;Fecha;Cliente;Calibre;Kilos Despachados;Precio $/KG;Total CLP;Destino\n`
    batchSales.forEach((s) => {
      csv += `${s.orderNumber};${s.date};${s.client};${s.caliberGrade};${s.kilosSold};${s.pricePerKgCLP};${s.kilosSold * s.pricePerKgCLP};${s.destination}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `trazabilidad_${currentBatch.code.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast(`Archivo CSV de trazabilidad generado y descargado para ${currentBatch.code}.`)
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* 1. View Header with Action Buttons */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {currentBatch.code}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-semibold text-slate-700">
              {currentBatch.produce} · {currentBatch.producer}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Detalle de Lote & Calibración de Fruta
          </h2>
          <p className="text-xs text-slate-500">
            Clasificación dimensional de calibres, balance de inventario en cámara de frío y despacho de notas de venta
          </p>
        </div>

        {/* Action Buttons: Deshacer Calibración & Exportar Trazabilidad */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowConfirmRevert(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            title="Revertir asignación de fruta calibrada a granel"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Deshacer Calibración</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar Trazabilidad (CSV)</span>
          </button>

          <button
            onClick={() => setShowNewSaleModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Crear Nota de Venta</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Comprados */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Kilos Comprados
            </span>
            <Boxes className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {formatKg(totalPurchasedKg)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            100% Volumen Ingresado a Planta
          </div>
        </div>

        {/* En Stock */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Total Kilos en Stock
            </span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-800">
            {formatKg(totalStockKg)}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            {percentStock.toFixed(1)}% Disponible en Cámara
          </div>
        </div>

        {/* Vendidos */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Total Kilos Vendidos
            </span>
            <ShoppingCart className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-800">
            {formatKg(totalSoldKg)}
          </div>
          <div className="text-[11px] text-blue-700 font-medium mt-0.5">
            {percentSold.toFixed(1)}% Despachado a Clientes
          </div>
        </div>

        {/* Ratio Calibración */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Control de Merma Técnica
            </span>
            <Scale className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            0.0 KG{' '}
            <span className="text-xs font-semibold text-emerald-700">
              (0.0% Merma)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            Balance Físico Cuadrado 100%
          </div>
        </div>
      </div>

      {/* 3. Two-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Calibración & Stock en Cámara */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Calibración & Stock en Cámara de Frío
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Desglose por calibre, capacidad asignada y kilos remanentes en guarda
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {batchCalibers.length} Calibres Clasificados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-4">Calibre / Grado</th>
                    <th className="py-2.5 px-4 text-right">Comprados</th>
                    <th className="py-2.5 px-4 text-right">Vendidos</th>
                    <th className="py-2.5 px-4 text-right">Stock Actual</th>
                    <th className="py-2.5 px-4 text-center w-36">Capacidad / Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {batchCalibers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No hay registros de calibración activos para este lote.
                      </td>
                    </tr>
                  ) : (
                    batchCalibers.map((c) => {
                      const stockPct = c.purchasedKg > 0 ? (c.stockKg / c.purchasedKg) * 100 : 0

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <div>{c.caliberGrade}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              Ref: {formatCLP(c.referencePricePerKg)} / KG
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-600">
                            {formatKg(c.purchasedKg)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-blue-700 font-semibold">
                            {formatKg(c.soldKg)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                            {formatKg(c.stockKg)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="space-y-1">
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                                <div
                                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(100, Math.max(0, stockPct))}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono text-slate-500 block">
                                {stockPct.toFixed(0)}% restante
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
                {batchCalibers.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                      <td className="py-2.5 px-4 uppercase text-[10px] tracking-wider text-slate-500">
                        Totales
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono">
                        {formatKg(totalPurchasedKg)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-blue-700">
                        {formatKg(totalSoldKg)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-emerald-800 font-extrabold">
                        {formatKg(totalStockKg)}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono text-xs text-slate-600">
                        {percentStock.toFixed(0)}% en cámara
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Stock protegido en Cámara 01 a 4.2°C con atmósfera controlada.
            </span>
          </div>
        </div>

        {/* Right Column (5 cols): Trazabilidad de Ventas - Notas de Venta Asociadas */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Trazabilidad de Ventas
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Notas de venta que rebajan el stock de este lote
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {batchSales.length} Ventas
              </span>
            </div>

            <div className="p-4 space-y-3 max-h-[380px] overflow-y-auto">
              {batchSales.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No se han emitido notas de venta para este lote todavía.
                </div>
              ) : (
                batchSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                          {sale.orderNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {sale.date}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          sale.status === 'Despachado'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : sale.status === 'Reservado'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {sale.status}
                      </span>
                    </div>

                    <div className="font-bold text-slate-800 mb-0.5">{sale.client}</div>
                    <div className="text-[11px] text-slate-500 mb-2 truncate">
                      {sale.caliberGrade} · Destino: {sale.destination}
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-emerald-800 text-sm">
                          {formatKg(sale.kilosSold)}
                        </span>{' '}
                        <span className="text-slate-500 text-[11px]">
                          @ {formatCLP(sale.pricePerKgCLP)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          {formatCLP(sale.kilosSold * sale.pricePerKgCLP)}
                        </span>
                        <button
                          onClick={() => {
                            removeSalesOrder(sale.id)
                            showToast(`Nota de venta ${sale.orderNumber} cancelada. Stock restituido.`)
                          }}
                          className="text-slate-400 hover:text-red-600 p-0.5 rounded transition-colors"
                          title="Anular venta y reincorporar stock"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Total Facturación Bruta:</span>
            <span className="font-mono font-extrabold text-blue-800 text-sm">
              {formatCLP(
                batchSales.reduce((acc, curr) => acc + curr.kilosSold * curr.pricePerKgCLP, 0)
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Confirmation Modal: Deshacer Calibración */}
      {showConfirmRevert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  ¿Deshacer Calibración del {currentBatch.code}?
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Esta acción revertirá la asignación por calibres, devolviendo todos los kilos ({formatKg(totalPurchasedKg)}) a stock a granel no clasificado en bodega.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setShowConfirmRevert(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleRevert}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Sí, deshacer calibración
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Crear Nota de Venta */}
      {showNewSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Emitir Nota de Venta
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rebaja directa de stock desde el {currentBatch.code}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNewSaleModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSale} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    N° Nota de Venta
                  </label>
                  <input
                    type="text"
                    required
                    value={saleForm.orderNumber}
                    onChange={(e) => setSaleForm({ ...saleForm, orderNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Fecha de Operación
                  </label>
                  <input
                    type="date"
                    required
                    value={saleForm.date}
                    onChange={(e) => setSaleForm({ ...saleForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Cliente Comprador
                </label>
                <input
                  type="text"
                  required
                  value={saleForm.client}
                  onChange={(e) => setSaleForm({ ...saleForm, client: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Calibre a Rebajar
                  </label>
                  <select
                    value={saleForm.caliberGrade}
                    onChange={(e) => setSaleForm({ ...saleForm, caliberGrade: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    {batchCalibers.map((c) => (
                      <option key={c.id} value={c.caliberGrade}>
                        {c.caliberGrade} (Disp: {formatKg(c.stockKg)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Kilos a Vender (Máx {formatKg(maxAvailableForSale)})
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={maxAvailableForSale}
                    value={saleForm.kilosSold}
                    onChange={(e) => setSaleForm({ ...saleForm, kilosSold: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white font-mono font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Precio Venta ($/KG CLP)
                  </label>
                  <input
                    type="number"
                    required
                    min={500}
                    value={saleForm.pricePerKgCLP}
                    onChange={(e) => setSaleForm({ ...saleForm, pricePerKgCLP: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Estado del Despacho
                  </label>
                  <select
                    value={saleForm.status}
                    onChange={(e) => setSaleForm({ ...saleForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="Despachado">Despachado</option>
                    <option value="Reservado">Reservado</option>
                    <option value="En Facturación">En Facturación</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Destino / Terminal de Embarque
                </label>
                <input
                  type="text"
                  required
                  value={saleForm.destination}
                  onChange={(e) => setSaleForm({ ...saleForm, destination: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowNewSaleModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
                >
                  Confirmar Venta & Rebajar Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
