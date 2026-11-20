export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'user' | 'viewer'
  createdAt: string
}

export interface NavItem {
  label: string
  href: string
  icon: string
  badge?: string
  children?: NavItem[]
}

export interface StatCard {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: string
  trend?: 'up' | 'down' | 'neutral'
}

export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: string | number
}

export interface TableColumn<T> {
  key: keyof T | string
  header: string
  render?: (value: unknown, row: T) => React.ReactNode
  className?: string
}

export interface DashboardStats {
  totalUsers: number
  totalRevenue: number
  activeSessions: number
  conversionRate: number
}

export type Theme = 'light' | 'dark' | 'system'
