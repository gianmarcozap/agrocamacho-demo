import React, { useState } from 'react'
import {
  DollarSign,
  Plus,
  Trash2,
  TrendingDown,
  PieChart,
  Receipt,
  FileCheck,
} from 'lucide-react'
import { useAgroStore } from '../../store/useAgroStore'
import { formatCLP, formatKg, formatUSD } from '../../utils/formatters'
import type { ExpenseCategory } from '../../types'

const CATEGORIES: ExpenseCategory[] = [
  'Flete Compra',
  'Cuadrilla Carga',
  'Certificación SAG/SENASA',
  'Insumos Embalaje',
  'Control de Calidad',
  'Desaduanaje',
]

export const View2Gastos: React.FC = () => {
  const {
    activeBatchId,
    setActiveBatchId,
    batches,
    expenses,
    receptions,
    addExpense,
    removeExpense,
    showToast,
  } = useAgroStore()

  // Filters
  const [selectedMonth, setSelectedMonth] = useState('Marzo')
  const [selectedYear, setSelectedYear] = useState('2025')
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS')
  const [searchTerm, setSearchTerm] = useState('')

  // Modal
  const [showAddModal, setShowAddModal] = useState(false)

  // Current batch
  const currentBatch = batches.find((b) => b.id === activeBatchId) || batches[0]
  const batchReceptions = receptions.filter((r) => r.batchId === currentBatch.id)
  const totalBatchKg = batchReceptions.reduce((acc, curr) => acc + curr.netWeightKg, 0)

  // Filtered expenses
  const batchExpenses = expenses.filter((e) => {
    if (e.batchId !== currentBatch.id) return false
    if (selectedCategory !== 'TODAS' && e.category !== selectedCategory) return false
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase()
      return (
        e.documentNumber.toLowerCase().includes(q) ||
        e.remarks.toLowerCase().includes(q) ||
        e.supplier.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q)
      )
    }
    return true
  })

  // Grand total for current batch
  const totalExpenseCLP = batchExpenses.reduce((acc, curr) => acc + curr.amountCLP, 0)
  const expensePerKg = totalBatchKg > 0 ? totalExpenseCLP / totalBatchKg : 0

  // Category breakdown for KPI
  const categoryTotals = batchExpenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amountCLP
    return acc
  }, {} as Record<string, number>)

  let topCategory = 'Sin gastos'
  let topCategoryAmount = 0
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > topCategoryAmount) {
      topCategoryAmount = amt
      topCategory = cat
    }
  })

  // Form State
  const [form, setForm] = useState({
    documentNumber: `FC-${Math.floor(10000 + Math.random() * 90000)}`,
    date: currentBatch.date,
    code: 'A001',
    category: 'Flete Compra' as ExpenseCategory,
    remarks: `Gasto Flete ${currentBatch.code} tramo directo`,
    amountCLP: 180000,
    supplier: 'Transportes Aconcagua SpA',
  })

  const handleCategoryChange = (cat: ExpenseCategory) => {
    let suggestedCode = 'A001'
    if (cat === 'Cuadrilla Carga') suggestedCode = 'A002'
    if (cat === 'Certificación SAG/SENASA') suggestedCode = 'A003'
    if (cat === 'Insumos Embalaje') suggestedCode = 'A004'
    if (cat === 'Control de Calidad') suggestedCode = 'C005'
    if (cat === 'Desaduanaje') suggestedCode = 'D006'

    setForm({
      ...form,
      category: cat,
      code: suggestedCode,
    })
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addExpense({
      batchId: currentBatch.id,
      documentNumber: form.documentNumber,
      date: form.date,
      code: form.code,
      category: form.category,
      remarks: form.remarks,
      amountCLP: Number(form.amountCLP),
      supplier: form.supplier,
    })
    setShowAddModal(false)
    showToast(`Gasto ${form.documentNumber} (${formatCLP(form.amountCLP)}) registrado exitosamente.`)
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* 1. Header & Context Filter Controls */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                Libro de Gastos Operativos
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-700">
                {currentBatch.code} ({currentBatch.producer})
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Gastos Imputados por Lote de Fruta
            </h2>
            <p className="text-xs text-slate-500">
              Control de fletes, cuadrillas de estiba, certificados SAG y compras de embalaje
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors self-start lg:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>+ Registrar Gasto</span>
          </button>
        </div>

        {/* Filters Bar: Month, Year, Batch, Category */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Batch Selector Filter */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Partida / Lote Seleccionado
            </label>
            <select
              value={activeBatchId}
              onChange={(e) => {
                setActiveBatchId(e.target.value)
                const b = batches.find((item) => item.id === e.target.value)
                showToast(`Filtrando gastos para: ${b?.code} (${b?.producer})`)
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white font-semibold text-slate-800"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} · {b.producer}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Mes Operativo
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white"
            >
              <option value="Marzo">Marzo (Actual)</option>
              <option value="Febrero">Febrero</option>
              <option value="Enero">Enero</option>
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Año Fiscal
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white"
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Categoría de Gasto
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white"
            >
              <option value="TODAS">Todas las Categorías ({batchExpenses.length})</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Row for Expenses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Gastos del Lote
            </span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-800">
            {formatCLP(totalExpenseCLP)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            ≈ {formatUSD(Math.round(totalExpenseCLP / 900))}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Costo Operativo por Kilo
            </span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {formatCLP(expensePerKg)}{' '}
            <span className="text-xs font-semibold text-slate-500">/ KG</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Calculado sobre {formatKg(totalBatchKg)}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Mayor Rubro de Costo
            </span>
            <PieChart className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 truncate">
            {topCategory}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {formatCLP(topCategoryAmount)} (
            {totalExpenseCLP > 0
              ? `${Math.round((topCategoryAmount / totalExpenseCLP) * 100)}%`
              : '0%'}
            )
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Documentos Contables
            </span>
            <Receipt className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {batchExpenses.length} Facturas / Guías
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">
            100% Conciliados con Tesorería
          </span>
        </div>
      </div>

      {/* 3. Expenses Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Libro Diario de Gastos Operativos ({currentBatch.code})
              </h3>
              <p className="text-[11px] text-slate-500">
                Detalle cronológico de gastos imputados con código de imputación presupuestaria
              </p>
            </div>
          </div>

          {/* Quick Search inside ledger */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por factura, glosa o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">N° Documento</th>
                <th className="py-2.5 px-4">Fecha</th>
                <th className="py-2.5 px-4 text-center">Código</th>
                <th className="py-2.5 px-4">Categoría de Gasto</th>
                <th className="py-2.5 px-4">Glosa / Observación</th>
                <th className="py-2.5 px-4">Proveedor / Emisor</th>
                <th className="py-2.5 px-4 text-right">Monto ($ CLP)</th>
                <th className="py-2.5 px-4 text-right">Monto ($ USD)</th>
                <th className="py-2.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {batchExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No se encontraron gastos registrados para el filtro seleccionado.
                  </td>
                </tr>
              ) : (
                batchExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4">
                      <span className="font-mono font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] text-slate-800">
                        {exp.documentNumber}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{exp.date}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded text-[11px]">
                        {exp.code}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 max-w-xs truncate" title={exp.remarks}>
                      {exp.remarks}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 font-semibold">
                      {exp.supplier}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCLP(exp.amountCLP)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-400 text-[11px]">
                      {formatUSD(Math.round(exp.amountCLP / 900))}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => {
                          removeExpense(exp.id)
                          showToast(`Gasto ${exp.documentNumber} eliminado.`)
                        }}
                        className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Eliminar gasto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {batchExpenses.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                  <td colSpan={6} className="py-2.5 px-4 uppercase text-[10px] tracking-wider text-slate-500">
                    Total Gastos Operativos ({batchExpenses.length} documentos)
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-blue-800 text-sm font-extrabold">
                    {formatCLP(totalExpenseCLP)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-500 text-xs">
                    {formatUSD(Math.round(totalExpenseCLP / 900))}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* 4. Quick Action Modal: Registrar Gasto */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Registrar Gasto Operativo
                  </h3>
                  <p className="text-xs text-slate-500">
                    Imputación directa a {currentBatch.code} ({currentBatch.producer})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Categoría de Gasto
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => handleCategoryChange(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Código de Imputación
                  </label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    N° Factura / Documento
                  </label>
                  <input
                    type="text"
                    required
                    value={form.documentNumber}
                    onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Fecha del Comprobante
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Proveedor / Prestador del Servicio
                </label>
                <input
                  type="text"
                  required
                  value={form.supplier}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Glosa / Descripción Detallada
                </label>
                <input
                  type="text"
                  required
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Monto Total ($ CLP)
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={1000}
                  value={form.amountCLP}
                  onChange={(e) => setForm({ ...form, amountCLP: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white font-mono font-bold text-base text-blue-700"
                />
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                >
                  Guardar e Imputar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
