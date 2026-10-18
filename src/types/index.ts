export type ProduceVariety = 'Palta Hass' | 'Limón Amarillo' | 'Pomelo Cara Cara'

export type PackagingType =
  | 'Bins Madera (55)'
  | 'Bins Plástico Azul (800)'
  | 'Cajas Cosecheras (18kg)'

export type ActiveModule = 'hub' | 'bodega' | 'frio' | 'transporte'

export type BodegaView = 'ingreso' | 'gastos' | 'calibracion' | 'resumen'

export interface Batch {
  id: string
  code: string // e.g. "Lote 00038"
  producer: string
  producerRUT: string
  origin: string
  produce: ProduceVariety
  date: string
  status: 'Recepcionado' | 'En Calibración' | 'Liquidado' | 'En Proceso'
  month: string
  year: number
  totalFreightCLP: number
  totalFreightUSD: number
  notes: string
}

export interface LogisticsTruck {
  id: string
  batchId: string
  driverName: string
  driverRUT: string
  driverPhone: string
  truckPlate: string
  truckModel: string
  transportCompany: string
  freightCostCLP: number
  status: 'Asignado' | 'En Descarga' | 'Completado'
}

export interface FruitReceptionItem {
  id: string
  batchId: string
  packagingType: PackagingType
  origin: string
  produce: ProduceVariety
  category: string
  netWeightKg: number
  basePricePerKg: number
  vatRate: number // 0.19
  invoiceNumber: string
  cratesCount: number
  date: string
}

export interface PackagingReconciliation {
  id: string
  batchId: string
  packagingType: PackagingType
  enteredCount: number
  returnedCount: number
  pendingCount: number
  producer: string
  lastUpdated: string
}

export type ExpenseCategory =
  | 'Flete Compra'
  | 'Cuadrilla Carga'
  | 'Certificación SAG/SENASA'
  | 'Insumos Embalaje'
  | 'Control de Calidad'
  | 'Desaduanaje'

export interface Expense {
  id: string
  batchId: string
  documentNumber: string
  date: string
  code: string // e.g. "A001", "F002"
  category: ExpenseCategory
  remarks: string
  amountCLP: number
  supplier: string
}

export interface CaliberStock {
  id: string
  batchId: string
  caliberGrade: string
  purchasedKg: number
  stockKg: number
  soldKg: number
  wasteKg: number
  referencePricePerKg: number
}

export interface SalesOrder {
  id: string
  batchId: string
  orderNumber: string // e.g. "Nota Venta 00002"
  date: string
  client: string
  caliberGrade: string
  kilosSold: number
  pricePerKgCLP: number
  status: 'Despachado' | 'Reservado' | 'En Facturación'
  destination: string
}
