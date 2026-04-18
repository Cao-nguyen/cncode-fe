'use client'

import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12">
      <div className="container mx-auto px-5 lg:px-10 max-w-2xl">
        <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 text-center">
            <XCircle size={64} className="text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Đã hủy thanh toán
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Bạn đã hủy thanh toán. Bạn có thể thử lại hoặc chọn phương thức thanh toán khác.
            </p>

            <Link
              href="/cuahangso"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}