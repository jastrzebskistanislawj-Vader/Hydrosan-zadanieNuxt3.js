export const loadUniqueStatuses = async (client: any): Promise<string[]> => {
  try {
    const { data, error } = await client.from('orders').select('status')
    if (error) throw error
    const statuses: string[] = data?.map((item: any) => String(item.status)) || []
    return Array.from(new Set(statuses))
  } catch (err) {
    console.error('Błąd podczas ładowania statusów:', err)
    return []
  }
}

export const getStatusColor = (status: string): string => {
  const lowerStatus = status?.toLowerCase() || ''

  // Pozytywne statusy (zielony)
  if (lowerStatus.includes('doręczone') || lowerStatus.includes('odebrano')) {
    return 'bg-green-100 text-green-800'
  }

  // Pozytywne pośrednie (niebieski)
  if (lowerStatus.includes('wysłane')) {
    return 'bg-blue-100 text-blue-800'
  }

  // Negatywne statusy (czerwony)
  if (lowerStatus.includes('anulowane')) {
    return 'bg-red-100 text-red-800'
  }

  // W trakcie (żółty)
  if (lowerStatus.includes('czeka') || lowerStatus.includes('realizacja') || lowerStatus.includes('po korekcie')) {
    return 'bg-yellow-100 text-yellow-800'
  }

  // Neutralne (szary)
  return 'bg-gray-100 text-gray-800'
}