import React, { useState } from 'react'
import {
  FileSpreadsheet,
  FileText,
  Printer,
  TrendingUp,
  ShoppingCart,
  Receipt,
  Boxes,
} from 'lucide-react'
import { useAgroStore } from '../../store/useAgroStore'
import { formatCLP, formatKg } from '../../utils/formatters'

export const View4Resumen: React.FC = () => {
  const {
    activeBatchId,
    setActiveBatchId,
    batches,
    receptions,
    expenses,
    salesOrders,
    showToast,
  } = useAgroStore()

  // Selectors
  const [selectedMonth, setSelectedMonth] = useState('Marzo')
  const [selectedYear, setSelectedYear] = useState('2025')
  const [selectedSupplier, setSelectedSupplier] = useState('Todos los Productores')

  // PDF modal state
  const [showPdfModal, setShowPdfModal] = useState(false)

  // Current batch
  const currentBatch = batches.find((b) => b.id === activeBatchId) || batches[0]

  // Data for current batch
  const batchReceptions = receptions.filter((r) => r.batchId === currentBatch.id)
  const batchSales = salesOrders.filter((s) => s.batchId === currentBatch.id)
  const batchExpenses = expenses.filter((e) => e.batchId === currentBatch.id)

  // Financial calculations
  const totalFruitPurchases = batchReceptions.reduce(
    (acc, curr) => acc + curr.netWeightKg * curr.basePricePerKg,
    0
  )
  const totalPurchasesWithVat = batchReceptions.reduce(
    (acc, curr) => acc + curr.netWeightKg * curr.basePricePerKg * (1 + curr.vatRate),
    0
  )
  const totalExpenses = batchExpenses.reduce((acc, curr) => acc + curr.amountCLP, 0)
  const totalSales = batchSales.reduce(
    (acc, curr) => acc + curr.kilosSold * curr.pricePerKgCLP,
    0
  )

  // Margen Neto del Lote = Total Ventas - Total Compras Fruta (Base) - Total Gastos Operativos
  const netMarginCLP = totalSales - totalFruitPurchases - totalExpenses
  const marginPercent =
    totalSales > 0 ? (netMarginCLP / totalSales) * 100 : totalFruitPurchases > 0 ? (netMarginCLP / totalFruitPurchases) * 100 : 0

  const totalKgPurchased = batchReceptions.reduce((acc, curr) => acc + curr.netWeightKg, 0)
  const totalKgSold = batchSales.reduce((acc, curr) => acc + curr.kilosSold, 0)

  // Excel Export Handler
  const handleExportExcel = () => {
    let csv = `RESUMEN MENSUAL Y LIQUIDACION DE LOTE - AGROCAMACHO EXPORT S.A.\n`
    csv += `Lote:;${currentBatch.code};Productor:;${currentBatch.producer};RUT:;${currentBatch.producerRUT}\n`
    csv += `Especie:;${currentBatch.produce};Periodo:;${selectedMonth} ${selectedYear}\n`
    csv += `Fecha Reporte:;${new Date().toLocaleDateString('es-CL')}\n\n`

    csv += `RESUMEN FINANCIERO EJECUTIVO\n`
    csv += `Concepto;Monto CLP\n`
    csv += `Total Compras Fruta (Base);${totalFruitPurchases}\n`
    csv += `Total Gastos Operativos;${totalExpenses}\n`
    csv += `Total Ventas Realizadas;${totalSales}\n`
    csv += `Margen Neto del Lote;${netMarginCLP}\n\n`

    csv += `1. DETALLE DE COMPRAS DE FRUTA\n`
    csv += `N° Guía/Factura;Tipo Envase;Especie;Categoría;Kilos Netos;Precio Base $/KG;IVA (19%);Total Compra CLP\n`
    batchReceptions.forEach((r) => {
      const sub = r.netWeightKg * r.basePricePerKg
      csv += `${r.invoiceNumber};${r.packagingType};${r.produce};${r.category};${r.netWeightKg};${r.basePricePerKg};${sub * r.vatRate};${sub * 1.19}\n`
    })

    csv += `\n2. DETALLE DE VENTAS DE FRUTA\n`
    csv += `N° Nota Venta;Fecha;Cliente;Calibre;Kilos Despachados;Precio $/KG;Total Venta CLP;Estado\n`
    batchSales.forEach((s) => {
      csv += `${s.orderNumber};${s.date};${s.client};${s.caliberGrade};${s.kilosSold};${s.pricePerKgCLP};${s.kilosSold * s.pricePerKgCLP};${s.status}\n`
    })

    csv += `\n3. GASTOS OPERATIVOS DEL LOTE\n`
    csv += `N° Documento;Fecha;Código;Categoría;Glosa;Proveedor;Monto CLP\n`
    batchExpenses.forEach((e) => {
      csv += `${e.documentNumber};${e.date};${e.code};${e.category};${e.remarks};${e.supplier};${e.amountCLP}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `liquidacion_${currentBatch.code.replace(/\s+/g, '_')}_${selectedMonth}_${selectedYear}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast(`Archivo Excel/CSV de liquidación generado para ${currentBatch.code}.`)
  }

  const handlePrintPDF = () => {
    window.print()
  }

  // Suppliers list for selector
  const supplierOptions = ['Todos los Productores', ...Array.from(new Set(batches.map((b) => b.producer)))]

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* 1. Header Selectors & Export Buttons */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                P&L & Liquidación
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-700">
                {currentBatch.code} ({currentBatch.producer})
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Resumen Mensual & Liquidación del Lote
            </h2>
            <p className="text-xs text-slate-500">
              Liquidación integral de compras, deducción de costos operacionales y rendición de ventas
            </p>
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Descargar Resumen a Excel</span>
            </button>

            <button
              onClick={() => setShowPdfModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Generar Liquidación PDF</span>
            </button>
          </div>
        </div>

        {/* 4 Selectors: Mes, Año, Lote, Productor */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Mes</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white"
            >
              <option value="Marzo">Marzo</option>
              <option value="Febrero">Febrero</option>
              <option value="Enero">Enero</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Año</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white"
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Lote</label>
            <select
              value={activeBatchId}
              onChange={(e) => {
                setActiveBatchId(e.target.value)
                const b = batches.find((item) => item.id === e.target.value)
                showToast(`Visualizando liquidación para: ${b?.code}`)
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white font-semibold text-slate-800"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} · {b.produce}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Productor</label>
            <select
              value={selectedSupplier}
              onChange={(e) => {
                setSelectedSupplier(e.target.value)
                const matchedBatch = batches.find((b) => b.producer === e.target.value)
                if (matchedBatch) {
                  setActiveBatchId(matchedBatch.id)
                }
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white"
            >
              {supplierOptions.map((sup) => (
                <option key={sup} value={sup}>
                  {sup}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Interactive Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Compras Fruta */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Compras Fruta
            </span>
            <Boxes className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {formatCLP(totalFruitPurchases)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            {formatKg(totalKgPurchased)} a productores
          </div>
        </div>

        {/* Total Gastos Operativos */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Total Gastos Operativos
            </span>
            <Receipt className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-700">
            {formatCLP(totalExpenses)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
            {batchExpenses.length} documentos imputados
          </div>
        </div>

        {/* Total Ventas Realizadas */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Total Ventas Realizadas
            </span>
            <ShoppingCart className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-800">
            {formatCLP(totalSales)}
          </div>
          <div className="text-[11px] text-blue-700 font-medium mt-0.5">
            {formatKg(totalKgSold)} despachados
          </div>
        </div>

        {/* Margen Neto del Lote */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Margen Neto del Lote
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div
            className={`text-2xl font-extrabold ${
              netMarginCLP >= 0 ? 'text-emerald-800' : 'text-rose-700'
            }`}
          >
            {formatCLP(netMarginCLP)}
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
            {marginPercent >= 0 ? `+${marginPercent.toFixed(1)}%` : `${marginPercent.toFixed(1)}%`} ROI sobre ventas
          </div>
        </div>
      </div>

      {/* 3. Section 1: Detalle de Compras (Fruta recepcionada por envase y calibre) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Detalle de Compras (Fruta Recepcionada)
              </h3>
              <p className="text-[11px] text-slate-500">
                Partidas ingresadas por envase, pesaje de báscula y valor base pactado
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700">
            Subtotal: {formatCLP(totalFruitPurchases)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Guía / Factura</th>
                <th className="py-2.5 px-4">Tipo Envase</th>
                <th className="py-2.5 px-4">Especie & Categoría</th>
                <th className="py-2.5 px-4 text-right">Kilos Netos</th>
                <th className="py-2.5 px-4 text-right">Precio Base ($/KG)</th>
                <th className="py-2.5 px-4 text-right">Subtotal Fruta</th>
                <th className="py-2.5 px-4 text-right">IVA (19%)</th>
                <th className="py-2.5 px-4 text-right">Total Facturado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {batchReceptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    No hay compras registradas para este lote.
                  </td>
                </tr>
              ) : (
                batchReceptions.map((r) => {
                  const sub = r.netWeightKg * r.basePricePerKg
                  const iva = sub * r.vatRate
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-800">
                        {r.invoiceNumber}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700">
                        {r.packagingType} ({r.cratesCount} un.)
                      </td>
                      <td className="py-2.5 px-4 text-slate-900 font-semibold">
                        {r.produce} · <span className="text-slate-500 font-normal">{r.category}</span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatKg(r.netWeightKg)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                        {formatCLP(r.basePricePerKg)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-800 font-semibold">
                        {formatCLP(sub)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-400 text-[11px]">
                        {formatCLP(iva)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-extrabold text-emerald-800">
                        {formatCLP(sub + iva)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Section 2: Detalle de Ventas (Clientes como Agricola San Telmo SpA) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Detalle de Ventas Realizadas & Despachos
              </h3>
              <p className="text-[11px] text-slate-500">
                Notas de venta facturadas a clientes con indicación de precio y destino
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-blue-800">
            Total Facturado: {formatCLP(totalSales)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Nota Venta</th>
                <th className="py-2.5 px-4">Fecha</th>
                <th className="py-2.5 px-4">Cliente Comprador</th>
                <th className="py-2.5 px-4">Calibre Despachado</th>
                <th className="py-2.5 px-4 text-right">Kilos Despachados</th>
                <th className="py-2.5 px-4 text-right">Precio Venta ($/KG)</th>
                <th className="py-2.5 px-4 text-right">Total Venta ($ CLP)</th>
                <th className="py-2.5 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {batchSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    No se registran notas de venta emitidas para este lote.
                  </td>
                </tr>
              ) : (
                batchSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                      {s.orderNumber}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">{s.date}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">
                      {s.client}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{s.caliberGrade}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-blue-700">
                      {formatKg(s.kilosSold)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                      {formatCLP(s.pricePerKgCLP)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-extrabold text-slate-900">
                      {formatCLP(s.kilosSold * s.pricePerKgCLP)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Section 3: Gastos Operativos (Fletes, empaque, insumos) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Gastos Operativos Imputados al Lote
              </h3>
              <p className="text-[11px] text-slate-500">
                Costos de logística, cuadrillas de estiba, materiales de embalaje y permisos sanitarios
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-rose-700">
            Total Gastos: {formatCLP(totalExpenses)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Documento</th>
                <th className="py-2.5 px-4">Fecha</th>
                <th className="py-2.5 px-4 text-center">Código</th>
                <th className="py-2.5 px-4">Categoría</th>
                <th className="py-2.5 px-4">Glosa Detallada</th>
                <th className="py-2.5 px-4">Proveedor</th>
                <th className="py-2.5 px-4 text-right">Monto ($ CLP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {batchExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    No se registran gastos operativos para este lote.
                  </td>
                </tr>
              ) : (
                batchExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-800">
                      {e.documentNumber}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">{e.date}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-700">
                        {e.code}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-700">{e.category}</td>
                    <td className="py-2.5 px-4 text-slate-600 max-w-sm truncate">{e.remarks}</td>
                    <td className="py-2.5 px-4 text-slate-800">{e.supplier}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-700">
                      {formatCLP(e.amountCLP)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF Liquidación Modal (Faithful to Chilean Agricultural Export standards) */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl border border-slate-200 my-8">
            {/* Top Toolbar inside Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-sm text-slate-900">
                  Certificado Oficial de Liquidación de Fruta Exportación
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir / Guardar como PDF
                </button>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
                >
                  Cerrar
                </button>
              </div>
            </div>

            {/* Printable Liquidación Document Body */}
            <div className="mt-6 text-slate-900 font-sans space-y-6">
              {/* Document Header */}
              <div className="flex justify-between items-start pb-4 border-b-2 border-slate-900">
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-emerald-800">
                    AGROCAMACHO EXPORT S.A.
                  </h1>
                  <p className="text-xs text-slate-500">R.U.T.: 76.541.980-4</p>
                  <p className="text-xs text-slate-500">
                    Planta Agroindustrial Quillota · Región de Valparaíso, Chile
                  </p>
                  <p className="text-xs text-slate-500">
                    Giro: Exportación, Embalaje y Conservación de Frutas
                  </p>
                </div>
                <div className="text-right">
                  <div className="border border-slate-900 px-4 py-2 text-center rounded">
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-600">
                      LIQUIDACIÓN DE COMPRA
                    </span>
                    <span className="text-base font-extrabold font-mono text-slate-900">
                      N° LQ-2025-{currentBatch.code.replace(/\D/g, '')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">
                    Fecha de Emisión: {new Date().toLocaleDateString('es-CL')}
                  </div>
                </div>
              </div>

              {/* Producer & Batch Info */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <span className="font-bold text-slate-500 block uppercase text-[10px]">
                    Identificación del Productor
                  </span>
                  <div className="font-extrabold text-sm text-slate-900 mt-0.5">
                    {currentBatch.producer}
                  </div>
                  <div className="text-slate-600">R.U.T.: {currentBatch.producerRUT}</div>
                  <div className="text-slate-600">Predio de Origen: {currentBatch.origin}</div>
                </div>

                <div>
                  <span className="font-bold text-slate-500 block uppercase text-[10px]">
                    Identificación de la Partida
                  </span>
                  <div className="font-extrabold text-sm text-emerald-800 mt-0.5">
                    {currentBatch.code} · {currentBatch.produce}
                  </div>
                  <div className="text-slate-600">Periodo Liquidado: {selectedMonth} {selectedYear}</div>
                  <div className="text-slate-600">Total Kilos Recepcionados: {formatKg(totalKgPurchased)}</div>
                </div>
              </div>

              {/* Financial Summary Table */}
              <div className="text-xs">
                <h4 className="font-bold uppercase text-[11px] tracking-wider text-slate-800 mb-2">
                  Resumen de Liquidación Económica
                </h4>
                <table className="w-full border-collapse border border-slate-300">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-medium text-slate-700">
                        (+) Valor Bruto Fruta Recepcionada ({formatKg(totalKgPurchased)})
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-900">
                        {formatCLP(totalFruitPurchases)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-medium text-slate-700">
                        (+) Impuesto al Valor Agregado (IVA Crédito 19%)
                      </td>
                      <td className="p-2 text-right font-mono text-slate-600">
                        {formatCLP(totalFruitPurchases * 0.19)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <td className="p-2 font-bold text-slate-800">
                        Subtotal Compra con IVA:
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-slate-900">
                        {formatCLP(totalPurchasesWithVat)}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 text-rose-700">
                      <td className="p-2 font-medium">
                        (-) Gastos Operacionales Imputados (Fletes, SAG, Cuadrillas)
                      </td>
                      <td className="p-2 text-right font-mono font-bold">
                        - {formatCLP(totalExpenses)}
                      </td>
                    </tr>
                    <tr className="bg-emerald-50 border-t-2 border-emerald-800">
                      <td className="p-3 font-extrabold text-sm text-emerald-950">
                        LÍQUIDO A PAGAR AL PRODUCTOR:
                      </td>
                      <td className="p-3 text-right font-mono text-lg font-extrabold text-emerald-900">
                        {formatCLP(Math.max(0, totalPurchasesWithVat - totalExpenses))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Legal Signatures */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="border-t border-slate-400 w-48 mx-auto mb-1 pt-1" />
                  <span className="font-bold text-slate-800 block">
                    Gian · Ingeniero de Planta
                  </span>
                  <span className="text-slate-500">AgroCamacho Export S.A.</span>
                </div>
                <div>
                  <div className="border-t border-slate-400 w-48 mx-auto mb-1 pt-1" />
                  <span className="font-bold text-slate-800 block">
                    {currentBatch.producer}
                  </span>
                  <span className="text-slate-500">Firma Conforme Productor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
