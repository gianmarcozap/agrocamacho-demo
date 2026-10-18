import React, { useState } from 'react'
import {
  Truck,
  Plus,
  Scale,
  Calendar,
  Building2,
  Trash2,
  PackageCheck,
  Boxes,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react'
import { useAgroStore } from '../../store/useAgroStore'
import { formatCLP, formatKg, formatUSD } from '../../utils/formatters'
import type { PackagingType, ProduceVariety } from '../../types'

export const View1Recepcion: React.FC = () => {
  const {
    activeBatchId,
    batches,
    logistics,
    receptions,
    packaging,
    addLogisticsTruck,
    removeLogisticsTruck,
    addReceptionItem,
    removeReceptionItem,
    returnPackaging,
    showToast,
  } = useAgroStore()

  // Modals state
  const [showTruckModal, setShowTruckModal] = useState(false)
  const [showFruitModal, setShowFruitModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState<string | null>(null)
  const [returnCountInput, setReturnCountInput] = useState<number>(10)

  // Current batch
  const currentBatch = batches.find((b) => b.id === activeBatchId) || batches[0]
  const currentLogistics = logistics.filter((l) => l.batchId === currentBatch.id)
  const currentReceptions = receptions.filter((r) => r.batchId === currentBatch.id)
  const currentPackaging = packaging.filter((p) => p.batchId === currentBatch.id)

  // Derived metrics
  const totalNetKg = currentReceptions.reduce((acc, curr) => acc + curr.netWeightKg, 0)
  const totalFruitValue = currentReceptions.reduce(
    (acc, curr) => acc + curr.netWeightKg * curr.basePricePerKg * (1 + curr.vatRate),
    0
  )
  const totalCrates = currentReceptions.reduce((acc, curr) => acc + curr.cratesCount, 0)
  const totalPendingBins = currentPackaging.reduce((acc, curr) => acc + curr.pendingCount, 0)

  // Form state for Truck Modal
  const [truckForm, setTruckForm] = useState({
    driverName: 'Carlos Mendoza',
    driverRUT: '14.821.903-2',
    driverPhone: '+56 9 8241 9901',
    truckPlate: 'KL-92-31',
    truckModel: 'Scania R450 Highline',
    transportCompany: 'Transportes Aconcagua SpA',
    freightCostCLP: 180000,
    status: 'Completado' as const,
  })

  // Form state for Fruit Modal
  const [fruitForm, setFruitForm] = useState({
    packagingType: 'Bins Madera (55)' as PackagingType,
    origin: currentBatch.origin,
    produce: currentBatch.produce as ProduceVariety,
    category: 'Primera Exportación',
    netWeightKg: 12500,
    basePricePerKg: 2450,
    vatRate: 0.19,
    invoiceNumber: `GD-${Math.floor(10000 + Math.random() * 90000)}`,
    cratesCount: 30,
    date: currentBatch.date,
  })

  const handleAddTruck = (e: React.FormEvent) => {
    e.preventDefault()
    addLogisticsTruck({
      batchId: currentBatch.id,
      driverName: truckForm.driverName,
      driverRUT: truckForm.driverRUT,
      driverPhone: truckForm.driverPhone,
      truckPlate: truckForm.truckPlate,
      truckModel: truckForm.truckModel,
      transportCompany: truckForm.transportCompany,
      freightCostCLP: Number(truckForm.freightCostCLP),
      status: truckForm.status,
    })
    setShowTruckModal(false)
    showToast(`Chofer ${truckForm.driverName} y camión ${truckForm.truckPlate} asociados al lote.`)
  }

  const handleAddFruit = (e: React.FormEvent) => {
    e.preventDefault()
    addReceptionItem({
      batchId: currentBatch.id,
      packagingType: fruitForm.packagingType,
      origin: fruitForm.origin,
      produce: fruitForm.produce,
      category: fruitForm.category,
      netWeightKg: Number(fruitForm.netWeightKg),
      basePricePerKg: Number(fruitForm.basePricePerKg),
      vatRate: 0.19,
      invoiceNumber: fruitForm.invoiceNumber,
      cratesCount: Number(fruitForm.cratesCount),
      date: fruitForm.date,
    })
    setShowFruitModal(false)
    showToast(`Registrado ingreso de ${fruitForm.netWeightKg} KG de ${fruitForm.produce}.`)
  }

  const handleReturnPackagingSubmit = (pkgId: string) => {
    if (returnCountInput <= 0) return
    returnPackaging(pkgId, Number(returnCountInput))
    setShowReturnModal(null)
    showToast(`Se registraron ${returnCountInput} envases retornados al productor.`)
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* 1. Header Summary Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {currentBatch.code}
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Ingreso & Recepción de Partidas de Fruta
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {currentBatch.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Productor:{' '}
              <strong className="text-slate-800">{currentBatch.producer}</strong>{' '}
              <span className="text-slate-400 font-mono">({currentBatch.producerRUT})</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Fecha Recepción: <span className="font-semibold">{currentBatch.date}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1">
              <Boxes className="w-3.5 h-3.5 text-slate-400" />
              Especie: <strong className="text-emerald-800">{currentBatch.produce}</strong>
            </span>
          </div>
        </div>

        {/* Financial Freight & Total Metrics in Header */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Flete Total del Lote
            </span>
            <div className="flex items-baseline gap-1.5 justify-end">
              <span className="text-base font-extrabold text-blue-700">
                {formatCLP(currentBatch.totalFreightCLP)}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                / {formatUSD(currentBatch.totalFreightUSD)}
              </span>
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl px-3.5 py-2 text-right">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              Total Fruta en Báscula
            </span>
            <div className="flex items-baseline gap-1.5 justify-end">
              <span className="text-base font-extrabold text-emerald-900">
                {formatKg(totalNetKg)}
              </span>
              <span className="text-xs font-semibold text-emerald-700">
                ({totalCrates} envases)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Freight & Logistics Widget (Chofer & Camión) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Logística de Transporte & Asignación de Camiones
              </h3>
              <p className="text-[11px] text-slate-500">
                Choferes asignados, patente del vehículo y costo de flete directo al huerto
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowTruckModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Asociar Chofer/Camión</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Chofer Asignado</th>
                <th className="py-2.5 px-4">RUT Chofer</th>
                <th className="py-2.5 px-4">Patente Camión</th>
                <th className="py-2.5 px-4">Modelo / Empresa</th>
                <th className="py-2.5 px-4 text-right">Costo Flete ($)</th>
                <th className="py-2.5 px-4 text-center">Estado</th>
                <th className="py-2.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {currentLogistics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    No hay choferes ni camiones asociados a este lote actualmente.
                  </td>
                </tr>
              ) : (
                currentLogistics.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-slate-800">
                      {log.driverName}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">{log.driverRUT}</td>
                    <td className="py-2.5 px-4">
                      <span className="font-mono font-bold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] text-slate-800">
                        {log.truckPlate}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      <div>{log.transportCompany}</div>
                      <div className="text-[10px] text-slate-400">{log.truckModel}</div>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-blue-700">
                      {formatCLP(log.freightCostCLP)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => {
                          removeLogisticsTruck(log.id)
                          showToast(`Camión ${log.truckPlate} desvinculado del lote.`)
                        }}
                        className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Eliminar asignación logística"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Produce Reception Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Detalle de Fruta Recepcionada (Pesaje & Báscula)
              </h3>
              <p className="text-[11px] text-slate-500">
                Registro de pesaje neto, tipo de envase, precio base pactado y guía de despacho
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowFruitModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Registrar Ingreso de Fruta</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Tipo Envase</th>
                <th className="py-2.5 px-4">Origen / Predio</th>
                <th className="py-2.5 px-4">Especie & Variedad</th>
                <th className="py-2.5 px-4">Categoría</th>
                <th className="py-2.5 px-4 text-right">Peso Neto (KG)</th>
                <th className="py-2.5 px-4 text-right">Precio Base ($/KG)</th>
                <th className="py-2.5 px-4 text-right">IVA (19%)</th>
                <th className="py-2.5 px-4 text-right">Valor Total</th>
                <th className="py-2.5 px-4 text-center">N° Guía / Factura</th>
                <th className="py-2.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {currentReceptions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-6 text-center text-slate-400">
                    No se han registrado pesajes de fruta para este lote todavía.
                  </td>
                </tr>
              ) : (
                currentReceptions.map((item) => {
                  const subtotal = item.netWeightKg * item.basePricePerKg
                  const iva = subtotal * item.vatRate
                  const total = subtotal + iva

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <PackageCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>{item.packagingType}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {item.cratesCount} Unidades
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">{item.origin}</td>
                      <td className="py-2.5 px-4 font-bold text-emerald-900">
                        {item.produce}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatKg(item.netWeightKg)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                        {formatCLP(item.basePricePerKg)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-500 text-[11px]">
                        {formatCLP(iva)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-800">
                        {formatCLP(total)}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="font-mono bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-[11px] text-slate-700">
                          {item.invoiceNumber}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={() => {
                            removeReceptionItem(item.id)
                            showToast(`Partida ${item.invoiceNumber} eliminada.`)
                          }}
                          className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Eliminar partida de fruta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
            {currentReceptions.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800">
                  <td colSpan={4} className="py-2.5 px-4 uppercase text-[10px] tracking-wider text-slate-500">
                    Totales del Lote ({currentReceptions.length} partidas)
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-emerald-800 font-extrabold">
                    {formatKg(totalNetKg)}
                  </td>
                  <td colSpan={2} className="py-2.5 px-4 text-right text-slate-400 text-[11px]">
                    Subtotal + IVA:
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-emerald-900 font-extrabold">
                    {formatCLP(totalFruitValue)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* 4. Packaging Reconciliation (Control de Envases/Bins Retornables) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Conciliación de Envases & Bins Retornables
              </h3>
              <p className="text-[11px] text-slate-500">
                Control de saldo con el productor ({currentBatch.producer}) para evitar pérdidas de inventario
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
              {totalPendingBins} Bins Pendientes de Devolución
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentPackaging.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-slate-50 rounded-xl p-4 border border-slate-200/90 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900">{pkg.packagingType}</span>
                  <span className="text-[10px] text-slate-400">{pkg.lastUpdated}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center my-3">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Ingresados
                    </span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {pkg.enteredCount}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Devueltos
                    </span>
                    <span className="text-sm font-extrabold text-emerald-700">
                      {pkg.returnedCount}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-amber-200 bg-amber-50/50">
                    <span className="text-[10px] text-amber-700 uppercase font-semibold block">
                      Saldo
                    </span>
                    <span className="text-sm font-extrabold text-amber-900">
                      {pkg.pendingCount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                  Productor: {pkg.producer}
                </span>
                <button
                  onClick={() => {
                    setShowReturnModal(pkg.id)
                    setReturnCountInput(pkg.pendingCount > 0 ? pkg.pendingCount : 5)
                  }}
                  disabled={pkg.pendingCount === 0}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    pkg.pendingCount > 0
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Devolver Envases
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal 1: Asociar Chofer & Camión */}
      {showTruckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Asociar Chofer / Camión al {currentBatch.code}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Imputación del flete de transporte terrestre
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTruckModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTruck} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nombre del Chofer
                  </label>
                  <input
                    type="text"
                    required
                    value={truckForm.driverName}
                    onChange={(e) => setTruckForm({ ...truckForm, driverName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    RUT del Chofer
                  </label>
                  <input
                    type="text"
                    required
                    value={truckForm.driverRUT}
                    onChange={(e) => setTruckForm({ ...truckForm, driverRUT: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Patente del Camión
                  </label>
                  <input
                    type="text"
                    required
                    value={truckForm.truckPlate}
                    onChange={(e) => setTruckForm({ ...truckForm, truckPlate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white uppercase font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Modelo del Vehículo
                  </label>
                  <input
                    type="text"
                    required
                    value={truckForm.truckModel}
                    onChange={(e) => setTruckForm({ ...truckForm, truckModel: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Empresa de Transporte
                  </label>
                  <input
                    type="text"
                    required
                    value={truckForm.transportCompany}
                    onChange={(e) => setTruckForm({ ...truckForm, transportCompany: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Costo Flete Pactado ($ CLP)
                  </label>
                  <input
                    type="number"
                    required
                    value={truckForm.freightCostCLP}
                    onChange={(e) => setTruckForm({ ...truckForm, freightCostCLP: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 bg-white font-mono font-bold text-blue-700"
                  />
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowTruckModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                >
                  Guardar & Asociar Camión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Registrar Ingreso de Fruta */}
      {showFruitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Registrar Ingreso de Fruta en Báscula
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pesaje y emisión de comprobante de recepción para {currentBatch.code}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFruitModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddFruit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Tipo de Envase
                  </label>
                  <select
                    value={fruitForm.packagingType}
                    onChange={(e) => setFruitForm({ ...fruitForm, packagingType: e.target.value as PackagingType })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="Bins Madera (55)">Bins Madera (55)</option>
                    <option value="Bins Plástico Azul (800)">Bins Plástico Azul (800)</option>
                    <option value="Cajas Cosecheras (18kg)">Cajas Cosecheras (18kg)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Cantidad de Envases
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={fruitForm.cratesCount}
                    onChange={(e) => setFruitForm({ ...fruitForm, cratesCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Especie / Produce
                  </label>
                  <input
                    type="text"
                    disabled
                    value={fruitForm.produce}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Categoría de Calidad
                  </label>
                  <input
                    type="text"
                    required
                    value={fruitForm.category}
                    onChange={(e) => setFruitForm({ ...fruitForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Kilos Netos (Báscula)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={fruitForm.netWeightKg}
                    onChange={(e) => setFruitForm({ ...fruitForm, netWeightKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white font-mono font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Precio Base Pactado ($/KG)
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={fruitForm.basePricePerKg}
                    onChange={(e) => setFruitForm({ ...fruitForm, basePricePerKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    N° Guía de Despacho / Factura
                  </label>
                  <input
                    type="text"
                    required
                    value={fruitForm.invoiceNumber}
                    onChange={(e) => setFruitForm({ ...fruitForm, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    IVA Aplicable
                  </label>
                  <div className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 font-mono">
                    19% (Régimen Agrícola Oficial)
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowFruitModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
                >
                  Ingresar a Bodega
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Devolver Envases */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Registrar Devolución de Envases
                </h3>
                <p className="text-[11px] text-slate-500">
                  Retorno de bins vacíos al productor
                </p>
              </div>
            </div>

            <div className="my-4">
              <label className="font-semibold text-xs text-slate-700 block mb-1">
                Cantidad a devolver:
              </label>
              <input
                type="number"
                min={1}
                value={returnCountInput}
                onChange={(e) => setReturnCountInput(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-600 bg-white font-mono font-bold text-base"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowReturnModal(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleReturnPackagingSubmit(showReturnModal)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
              >
                Confirmar Devolución
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
