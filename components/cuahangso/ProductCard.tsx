'use client'

import Link from 'next/link'
import { Star, Download } from 'lucide-react'
import { Product } from '@/types/cuahangso'
import { formatPrice, formatNumber, getCategoryColor, getCategoryName } from '@/lib/utils/cuahangso'

interface ProductCardProps {
  product: Product
  variant?: 'grid' | 'list'
}

export function ProductCard({ product, variant = 'grid' }: ProductCardProps) {
  if (variant === 'list') {
    return (
      <Link
        href={`/cuahangso/${product.slug}`}
        className="block bg-white dark:bg-[#171717] rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-200 dark:border-gray-800"
      >
        <div className="flex gap-4">
          <div className="w-24 h-24 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{product.description}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatPrice(product.price)}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-400 fill-current" />
                <span className="text-gray-700 dark:text-gray-300">{product.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download size={14} className="text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{formatNumber(product.downloadCount)} lượt tải</span>
              </div>
              <div className={`px-2 py-0.5 rounded text-xs ${getCategoryColor(product.category)}`}>
                {getCategoryName(product.category)}
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/cuahangso/${product.slug}`}
      className="group bg-white dark:bg-[#171717] rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-200 dark:border-gray-800"
    >
      <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-semibold ${getCategoryColor(product.category)}`}>
          {getCategoryName(product.category)}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star size={16} className="text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">{product.rating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-500">({formatNumber(product.reviewCount)} đánh giá)</span>
          <div className="flex items-center gap-1 ml-auto">
            <Download size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-500">{formatNumber(product.downloadCount)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatPrice(product.price)}</span>
          <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Mua ngay
          </button>
        </div>
      </div>
    </Link>
  )
}