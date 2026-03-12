export interface Order {
  id: string | number
  created_at: string
  bill_name: string | null
  bill_surname: string | null
  status: string | null
  total_price: number
}