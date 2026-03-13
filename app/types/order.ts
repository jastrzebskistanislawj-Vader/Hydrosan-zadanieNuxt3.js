export interface OrderProduct {
  ean: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  tax_rate: number;
  image_url: string | null;
  product_id: string;
}

export interface OrderPayment {
  id: string;
  name: string;
  paid: string;
  status: string;
  currency: string;
}

export interface OrderShipment {
  id: string;
  name: string;
  total: string;
}

export interface Order {
  id: number;
  created_at: string;
  total_price: number;
  status: string;
  email_adress: string;
  bill_name: string;
  bill_surname: string;
  bill_street: string;
  bill_postcode: string;
  bill_city: string;
  bill_phone: string;

  payment: OrderPayment;
  shipment: OrderShipment;
  products: OrderProduct[];
}