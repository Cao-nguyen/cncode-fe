import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

export const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const getCategoryIcon = (category: string) => {
  switch(category) {
    case 'powerpoint': return 'FileText'
    case 'code': return 'Code'
    case 'design': return 'Palette'
    case 'document': return 'File'
    default: return 'File'
  }
}

export const getCategoryColor = (category: string): string => {
  switch(category) {
    case 'powerpoint': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
    case 'code': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
    case 'design': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
    case 'document': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
    default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
  }
}

export const getCategoryName = (category: string): string => {
  switch(category) {
    case 'powerpoint': return 'PowerPoint'
    case 'code': return 'Code'
    case 'design': return 'Design'
    case 'document': return 'Tài liệu'
    default: return ''
  }
}

export const calculateXuAmount = (price: number): number => {
  return Math.floor(price / 10)
}