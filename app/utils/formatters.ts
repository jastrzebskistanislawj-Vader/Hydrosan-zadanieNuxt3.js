
// Formatuje wartość na walutę PLN
export const formatCurrency = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return '0,00 zł'
  
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  // Jeśli parseFloat zwróci NaN (not a number)
  if (isNaN(num)) return '0,00 zł'

  return new Intl.NumberFormat('pl-PL', { 
    style: 'currency', 
    currency: 'PLN' 
  }).format(num)
}

//Formatuje datę do formatu DD.MM.YYYY HH:mm
export const formatFullDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'
  
  const date = new Date(dateString)
  
  // Sprawdzenie czy data jest poprawna
  if (isNaN(date.getTime())) return '-'

  return date.toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}