'use client'

import { useState, useEffect } from 'react'
import { Search, Star, Download, Filter, LayoutGrid, List, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { digitalProductApi } from '@/lib/api/digital-product.api'
import { IDigitalProduct } from '@/types/digital-product.type'

const CATEGORIES = [
  { id: 'all', name: 'Tất cả' },
  { id: 'powerpoint', name: 'PowerPoint' },
  { id: 'code', name: 'Code' },
  { id: 'design', name: 'Design' },
  { id: 'document', name: 'Tài liệu' }
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'price-asc', label: 'Giá thấp đến cao' },
  { value: 'price-desc', label: 'Giá cao đến thấp' },
  { value: 'rating', label: 'Đánh giá cao nhất' }
]

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'powerpoint': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
    case 'code': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
    case 'design': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
    case 'document': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
    default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
  }
}

const getCategoryName = (category: string) => {
  switch (category) {
    case 'powerpoint': return 'PowerPoint'
    case 'code': return 'Code'
    case 'design': return 'Design'
    case 'document': return 'Tài liệu'
    default: return ''
  }
}

export default function CuaHangSoPage() {
  const [products, setProducts] = useState<IDigitalProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showMobileFilter, setShowMobileFilter] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, sortBy])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params: any = { sort: sortBy }
      if (selectedCategory !== 'all') params.category = selectedCategory
      if (searchTerm) params.search = searchTerm

      const result = await digitalProductApi.getProducts(params)
      if (result.success) {
        setProducts(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchProducts()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-5 lg:px-10 py-5 md:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Cửa hàng số</h1>
          <p className="text-gray-600 dark:text-gray-400">Khám phá hàng ngàn template, code, design và tài liệu chất lượng cao</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-20">
              <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4 lg:hidden">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Bộ lọc</h3>
                  <button onClick={() => setShowMobileFilter(!showMobileFilter)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <Filter size={20} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <div className={`space-y-6 ${showMobileFilter ? 'block' : 'hidden lg:block'}`}>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Danh mục</h3>
                    <div className="space-y-2">
                      {CATEGORIES.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === category.id
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm p-5 mb-6 border border-gray-200 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none px-4 py-2 pr-8 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white cursor-pointer focus:ring-2 focus:ring-blue-500"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                  <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-[#171717] text-blue-600 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
                    >
                      <LayoutGrid size={20} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-[#171717] text-blue-600 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
                    >
                      <List size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400">{products.length} sản phẩm</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white dark:bg-[#171717] rounded-xl shadow-sm animate-pulse border border-gray-200 dark:border-gray-800">
                    <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-t-xl"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link
                    key={product._id}
                    href={`/cuahangso/${product.slug}`}
                    className="group bg-white dark:bg-[#171717] rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-200 dark:border-gray-800"
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <Image width={300} height={200} src={product.thumbnail} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-semibold ${getCategoryColor(product.category)}`}>
                        {getCategoryName(product.category)}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star data-filled={true} size={16} className="text-yellow-400 fill-current" />
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
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <Link
                    key={product._id}
                    href={`/cuahangso/${product.slug}`}
                    className="block bg-white dark:bg-[#171717] rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex gap-4">
                      <div className="w-24 h-24 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        <Image width={100} height={100} src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{product.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{product.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatPrice(product.price)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Star data-filled={true} size={14} className="text-yellow-400 fill-current" />
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
                ))}
              </div>
            )}

            {!loading && products.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-600 dark:text-gray-400">Hãy thử tìm kiếm với từ khóa khác nhé!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}