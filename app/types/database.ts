import type { Order } from './order'

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: Order
      }
    }
  }
}