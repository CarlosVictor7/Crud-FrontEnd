import type { UserRole } from '@/types/domain'

export const canManageClients = (role?: UserRole) => role === 'super_admin' || role === 'admin'

export const canManageProducts = (role?: UserRole) => role === 'super_admin' || role === 'admin'

export const canDeleteDefinitive = (role?: UserRole) => role === 'super_admin'

export const isClientRole = (role?: UserRole) => role === 'client'
