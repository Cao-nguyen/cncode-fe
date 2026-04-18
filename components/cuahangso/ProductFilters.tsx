'use client'

import { Search, Filter, LayoutGrid, List, ChevronDown } from 'lucide-react'

interface ProductFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  showFilters: boolean
  onToggleFilters: () => void
  selectedCategory: string
  onCategoryChange: (category: string) => void
  categories: { id: string; name: string }[]
  sortOptions: { value: string; label: string }[]
}

export function ProductFilters({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  showFilters,
  onToggleFilters,
  selectedCategory,
  onCategoryChange,
  categories,
  sortOptions
}: ProductFiltersProps) {
  return (
    <>
      <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm p-5 mb-6 border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white cursor-pointer focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-[#171717] text-blue-600 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-[#171717] text-blue-600 shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden mb-4">
        <button onClick={onToggleFilters} className="w-full px-4 py-2 bg-white dark:bg-[#171717] border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center gap-2">
          <Filter size={18} /> Bộ lọc
        </button>
      </div>

      <div className={`lg:block ${showFilters ? 'block' : 'hidden'} mb-6`}>
        <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Danh mục</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.id
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
    </>
  )
}