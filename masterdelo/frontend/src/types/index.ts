export interface User {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  company_name: string | null
  inn: string | null
  created_at: string
}

export interface Client {
  id: string
  user_id: string
  name: string
  phone: string | null
  notes: string | null
  created_at: string
  orders_count?: number
  total_amount?: number
}

export type OrderStatus = 'new' | 'in_progress' | 'done' | 'paid' | 'cancelled'

export interface OrderItem {
  id: string
  order_id: string
  name: string
  quantity: number
  unit: string | null
  cost: number
}

export interface Photo {
  id: string
  order_id: string
  file_path: string
  stage: 'before' | 'process' | 'after'
  created_at: string
}

export interface ClientBrief {
  id: string
  name: string
  phone: string | null
}

export interface Order {
  id: string
  user_id: string
  client_id: string | null
  title: string
  description: string | null
  status: OrderStatus
  price: number
  prepayment: number
  start_date: string | null
  deadline: string | null
  address: string | null
  notes: string | null
  is_overdue: boolean
  created_at: string
  updated_at: string
  client: ClientBrief | null
}

export interface OrderDetail extends Order {
  items: OrderItem[]
  photos: Photo[]
  balance_due: number
  total_cost: number
  margin: number
}

export interface OrderCreateData {
  title: string
  client_id?: string | null
  price: number
  prepayment?: number
  start_date?: string | null
  deadline?: string | null
  address?: string | null
  description?: string | null
  notes?: string | null
}

export interface OrderUpdateData {
  title?: string
  client_id?: string | null
  description?: string | null
  status?: OrderStatus
  price?: number
  prepayment?: number
  start_date?: string | null
  deadline?: string | null
  address?: string | null
  notes?: string | null
}
