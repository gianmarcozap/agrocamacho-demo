export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatKg(kg: number): string {
  return `${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 }).format(kg)} KG`
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-CL').format(num)
}

export function formatPercent(val: number): string {
  return `${(val * 100).toFixed(1)}%`
}
