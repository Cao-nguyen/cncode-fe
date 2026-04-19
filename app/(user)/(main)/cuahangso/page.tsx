'use client'

import { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react'
import { Search, Star, Download, Filter, LayoutGrid, List, ChevronDown, Plus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { digitalProductApi } from '@/lib/api/digital-product.api'
import { IDigitalProduct } from '@/types/digital-product.type'
import { useAuthStore } from '@/store/auth.store'

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

interface FetchProductsParams {
  category?: string
  search?: string
  sort?: string
}

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
  const { user } = useAuthStore()

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, sortBy])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params: FetchProductsParams = { sort: sortBy }
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

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleSearchKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setShowMobileFilter(false)
  }

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 sm:px-5 lg:px-10 py-5 md:py-10">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
              Cửa hàng số
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Khám phá hàng ngàn template, code, design và tài liệu chất lượng cao
            </p>
          </div>
          {user && (
            <Link
              href="/me/cuahangso/create"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium text-sm sm:text-base"
            >
              <Plus size={18} />
              <span>Đăng sản phẩm</span>
            </Link>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filter - Responsive */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-20">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilter(!showMobileFilter)}
                className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-gray-800 mb-4"
              >
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Bộ lọc</span>
                </div>
                <ChevronDown className={`transform transition-transform ${showMobileFilter ? 'rotate-180' : ''} text-gray-600 dark:text-gray-400`} size={18} />
              </button>

              {/* Filter Content */}
              <div className={`${showMobileFilter ? 'block' : 'hidden'} lg:block`}>
                <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-800">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Danh mục</h3>
                      <div className="space-y-2">
                        {CATEGORIES.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryChange(category.id)}
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
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Sort Bar - Responsive */}
            <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm p-4 sm:p-5 mb-6 border border-gray-200 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyPress={handleSearchKeyPress}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1 sm:flex-none">
                    <select
                      value={sortBy}
                      onChange={handleSortChange}
                      className="w-full appearance-none px-4 py-2.5 pr-8 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white cursor-pointer focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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
                      className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                        ? 'bg-white dark:bg-[#171717] text-blue-600 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                        }`}
                    >
                      <LayoutGrid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                        ? 'bg-white dark:bg-[#171717] text-blue-600 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                        }`}
                    >
                      <List size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Result Count */}
            <div className="mb-4 px-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">{products.length} sản phẩm</p>
            </div>

            {/* Products Grid/List - Responsive */}
            {loading ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white dark:bg-[#171717] rounded-xl shadow-sm animate-pulse border border-gray-200 dark:border-gray-800">
                    <div className="h-40 sm:h-48 bg-gray-200 dark:bg-gray-800 rounded-t-xl"></div>
                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <Link
                    key={product._id}
                    href={`/cuahangso/${product.slug}`}
                    className="group bg-white dark:bg-[#171717] rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-200 dark:border-gray-800"
                  >
                    <div className="relative h-40 sm:h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <Image
                        width={400}
                        height={250}
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-semibold ${getCategoryColor(product.category)}`}>
                        {getCategoryName(product.category)}
                      </div>
                    </div>
                    <div className="p-4 sm:p-5">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1 text-sm sm:text-base">
                        {product.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-400 fill-current" />
                          <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                            {product.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          ({formatNumber(product.reviewCount)} đánh giá)
                        </span>
                        <div className="flex items-center gap-1 ml-auto">
                          <Download size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {formatNumber(product.downloadCount)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                          {formatPrice(product.price)}
                        </span>
                        <button className="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-xs sm:text-sm font-medium">
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
                    className="block bg-white dark:bg-[#171717] rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5 border border-gray-200 dark:border-gray-800"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-24 h-32 sm:h-24 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        <Image
                          width={120}
                          height={120}
                          src={product.thumbnail}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm sm:text-base">
                              {product.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {product.description}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                              {formatPrice(product.price)}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm mt-2">
                          <div className="flex items-center gap-1">
                            <Star size={12} className="text-yellow-400 fill-current" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {product.rating.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Download size={12} className="text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {formatNumber(product.downloadCount)} lượt tải
                            </span>
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

            {/* Empty State */}
            {!loading && products.length === 0 && (
              <div className="text-center py-12">
                <div className="text-5xl sm:text-6xl mb-4">🛒</div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Hãy thử tìm kiếm với từ khóa khác nhé!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}