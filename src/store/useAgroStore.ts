import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ActiveModule,
  Batch,
  BodegaView,
  CaliberStock,
  Expense,
  FruitReceptionItem,
  LogisticsTruck,
  PackagingReconciliation,
  SalesOrder,
} from '../types'
import {
  INITIAL_BATCHES,
  INITIAL_CALIBER_STOCKS,
  INITIAL_EXPENSES,
  INITIAL_LOGISTICS,
  INITIAL_PACKAGING_RECONCILIATION,
  INITIAL_RECEPTIONS,
  INITIAL_SALES_ORDERS,
} from '../data/seedData'

interface AgroStoreState {
  // Navigation & active contexts
  activeModule: ActiveModule
  activeBodegaView: BodegaView
  activeBatchId: string
  sidebarCollapsed: boolean

  // Filters for Resumen / Gastos
  filterMonth: string
  filterYear: number
  filterSupplier: string

  // Notification Toast
  toastMessage: string | null

  // Core Data
  batches: Batch[]
  logistics: LogisticsTruck[]
  receptions: FruitReceptionItem[]
  packaging: PackagingReconciliation[]
  expenses: Expense[]
  caliberStocks: CaliberStock[]
  salesOrders: SalesOrder[]

  // Navigation Setters
  setActiveModule: (module: ActiveModule) => void
  setActiveBodegaView: (view: BodegaView) => void
  setActiveBatchId: (id: string) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setFilterMonth: (month: string) => void
  setFilterYear: (year: number) => void
  setFilterSupplier: (supplier: string) => void
  showToast: (msg: string) => void
  clearToast: () => void

  // Data Actions
  addLogisticsTruck: (truck: Omit<LogisticsTruck, 'id'>) => void
  removeLogisticsTruck: (id: string) => void

  addReceptionItem: (item: Omit<FruitReceptionItem, 'id'>) => void
  removeReceptionItem: (id: string) => void

  returnPackaging: (packagingId: string, count: number) => void

  addExpense: (expense: Omit<Expense, 'id'>) => void
  removeExpense: (id: string) => void

  revertCalibration: (batchId: string) => void
  updateCaliberStock: (id: string, updates: Partial<CaliberStock>) => void

  addSalesOrder: (order: Omit<SalesOrder, 'id'>) => void
  removeSalesOrder: (id: string) => void

  // Reset Everything to Authentic Chilean Seed Data
  resetAllData: () => void
}

export const useAgroStore = create<AgroStoreState>()(
  persist(
    (set, get) => ({
      activeModule: 'bodega',
      activeBodegaView: 'ingreso',
      activeBatchId: 'LOT-00038',
      sidebarCollapsed: false,

      filterMonth: 'Marzo',
      filterYear: 2025,
      filterSupplier: 'Todos los Productores',

      toastMessage: null,

      batches: INITIAL_BATCHES,
      logistics: INITIAL_LOGISTICS,
      receptions: INITIAL_RECEPTIONS,
      packaging: INITIAL_PACKAGING_RECONCILIATION,
      expenses: INITIAL_EXPENSES,
      caliberStocks: INITIAL_CALIBER_STOCKS,
      salesOrders: INITIAL_SALES_ORDERS,

      setActiveModule: (activeModule) => set({ activeModule }),
      setActiveBodegaView: (activeBodegaView) => set({ activeBodegaView }),
      setActiveBatchId: (activeBatchId) => set({ activeBatchId }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

      setFilterMonth: (filterMonth) => set({ filterMonth }),
      setFilterYear: (filterYear) => set({ filterYear }),
      setFilterSupplier: (filterSupplier) => set({ filterSupplier }),

      showToast: (msg) => {
        set({ toastMessage: msg })
        setTimeout(() => {
          if (get().toastMessage === msg) {
            set({ toastMessage: null })
          }
        }, 3500)
      },
      clearToast: () => set({ toastMessage: null }),

      addLogisticsTruck: (truckData) =>
        set((state) => {
          const newTruck: LogisticsTruck = {
            ...truckData,
            id: `LOG-${Date.now().toString().slice(-4)}`,
          }
          // Recalculate batch freight
          const updatedLogistics = [...state.logistics, newTruck]
          const batchTrucks = updatedLogistics.filter((l) => l.batchId === truckData.batchId)
          const totalFreight = batchTrucks.reduce((acc, curr) => acc + curr.freightCostCLP, 0)

          const updatedBatches = state.batches.map((b) =>
            b.id === truckData.batchId
              ? {
                  ...b,
                  totalFreightCLP: totalFreight,
                  totalFreightUSD: Math.round(totalFreight / 900),
                }
              : b
          )

          return {
            logistics: updatedLogistics,
            batches: updatedBatches,
          }
        }),

      removeLogisticsTruck: (id) =>
        set((state) => {
          const target = state.logistics.find((l) => l.id === id)
          if (!target) return state

          const updatedLogistics = state.logistics.filter((l) => l.id !== id)
          const batchTrucks = updatedLogistics.filter((l) => l.batchId === target.batchId)
          const totalFreight = batchTrucks.reduce((acc, curr) => acc + curr.freightCostCLP, 0)

          const updatedBatches = state.batches.map((b) =>
            b.id === target.batchId
              ? {
                  ...b,
                  totalFreightCLP: totalFreight,
                  totalFreightUSD: Math.round(totalFreight / 900),
                }
              : b
          )

          return {
            logistics: updatedLogistics,
            batches: updatedBatches,
          }
        }),

      addReceptionItem: (itemData) =>
        set((state) => {
          const newItem: FruitReceptionItem = {
            ...itemData,
            id: `REC-${Date.now().toString().slice(-4)}`,
          }

          // Check if packaging reconciliation exists for this batch and packaging type
          const existingPkg = state.packaging.find(
            (p) => p.batchId === itemData.batchId && p.packagingType === itemData.packagingType
          )

          let updatedPackaging = [...state.packaging]
          if (existingPkg) {
            updatedPackaging = updatedPackaging.map((p) =>
              p.id === existingPkg.id
                ? {
                    ...p,
                    enteredCount: p.enteredCount + itemData.cratesCount,
                    pendingCount: p.pendingCount + itemData.cratesCount,
                    lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
                  }
                : p
            )
          } else {
            const batch = state.batches.find((b) => b.id === itemData.batchId)
            updatedPackaging.push({
              id: `PKG-${Date.now().toString().slice(-4)}`,
              batchId: itemData.batchId,
              packagingType: itemData.packagingType,
              enteredCount: itemData.cratesCount,
              returnedCount: 0,
              pendingCount: itemData.cratesCount,
              producer: batch?.producer || 'Productor',
              lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
            })
          }

          return {
            receptions: [newItem, ...state.receptions],
            packaging: updatedPackaging,
          }
        }),

      removeReceptionItem: (id) =>
        set((state) => ({
          receptions: state.receptions.filter((r) => r.id !== id),
        })),

      returnPackaging: (packagingId, count) =>
        set((state) => ({
          packaging: state.packaging.map((pkg) => {
            if (pkg.id !== packagingId) return pkg
            const newReturned = Math.min(pkg.enteredCount, pkg.returnedCount + count)
            return {
              ...pkg,
              returnedCount: newReturned,
              pendingCount: Math.max(0, pkg.enteredCount - newReturned),
              lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
            }
          }),
        })),

      addExpense: (expenseData) =>
        set((state) => ({
          expenses: [
            {
              ...expenseData,
              id: `EXP-${Date.now().toString().slice(-4)}`,
            },
            ...state.expenses,
          ],
        })),

      removeExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      revertCalibration: (batchId) =>
        set((state) => {
          // Revert calibration brings stock back into a single uncalibrated pool or resets to unallocated
          const batch = state.batches.find((b) => b.id === batchId)
          if (!batch) return state

          // Reset stockKg equal to purchasedKg and clear sales allocation or mark uncalibrated
          const updatedStocks = state.caliberStocks.map((c) =>
            c.batchId === batchId
              ? {
                  ...c,
                  stockKg: c.purchasedKg,
                  soldKg: 0,
                }
              : c
          )

          const updatedBatches = state.batches.map((b) =>
            b.id === batchId ? { ...b, status: 'Recepcionado' as const } : b
          )

          return {
            caliberStocks: updatedStocks,
            batches: updatedBatches,
          }
        }),

      updateCaliberStock: (id, updates) =>
        set((state) => ({
          caliberStocks: state.caliberStocks.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      addSalesOrder: (orderData) =>
        set((state) => {
          const newOrder: SalesOrder = {
            ...orderData,
            id: `SO-${Date.now().toString().slice(-4)}`,
          }

          // Deduct from matching caliber stock
          const updatedStocks = state.caliberStocks.map((c) => {
            if (c.batchId === orderData.batchId && c.caliberGrade === orderData.caliberGrade) {
              const newSold = c.soldKg + orderData.kilosSold
              const newStock = Math.max(0, c.purchasedKg - newSold)
              return { ...c, soldKg: newSold, stockKg: newStock }
            }
            return c
          })

          return {
            salesOrders: [newOrder, ...state.salesOrders],
            caliberStocks: updatedStocks,
          }
        }),

      removeSalesOrder: (id) =>
        set((state) => {
          const order = state.salesOrders.find((s) => s.id === id)
          if (!order) return state

          // Restore stock to caliber
          const updatedStocks = state.caliberStocks.map((c) => {
            if (c.batchId === order.batchId && c.caliberGrade === order.caliberGrade) {
              const newSold = Math.max(0, c.soldKg - order.kilosSold)
              const newStock = c.purchasedKg - newSold
              return { ...c, soldKg: newSold, stockKg: newStock }
            }
            return c
          })

          return {
            salesOrders: state.salesOrders.filter((s) => s.id !== id),
            caliberStocks: updatedStocks,
          }
        }),

      resetAllData: () => {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('agrocamacho_store_v1')
        }
        set({
          activeModule: 'bodega',
          activeBodegaView: 'ingreso',
          activeBatchId: 'LOT-00038',
          sidebarCollapsed: false,
          filterMonth: 'Marzo',
          filterYear: 2025,
          filterSupplier: 'Todos los Productores',
          toastMessage: 'Datos del sistema reiniciados al estado inicial de bodega.',
          batches: INITIAL_BATCHES,
          logistics: INITIAL_LOGISTICS,
          receptions: INITIAL_RECEPTIONS,
          packaging: INITIAL_PACKAGING_RECONCILIATION,
          expenses: INITIAL_EXPENSES,
          caliberStocks: INITIAL_CALIBER_STOCKS,
          salesOrders: INITIAL_SALES_ORDERS,
        })
      },
    }),
    {
      name: 'agrocamacho_store_v1',
    }
  )
)
