'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader2, Download } from 'lucide-react'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [productName, setProductName] = useState<string | null>(null)

  useEffect(() => {
    const url = searchParams.get('downloadUrl')
    const name = searchParams.get('productName')
    
    if (url && name) {
      setDownloadUrl(decodeURIComponent(url))
      setProductName(decodeURIComponent(name))
    } else {
      router.push('/cuahangso')
    }
  }, [searchParams, router])

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank')
      setTimeout(() => {
        router.push('/me/cuahangso')
      }, 1000)
    }
  }

  if (!downloadUrl) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12">
      <div className="container mx-auto px-5 lg:px-10 max-w-2xl">
        <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 text-center">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Thanh toán thành công!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Cảm ơn bạn đã mua hàng.
            </p>
            {productName && (
              <p className="text-gray-500 mb-6">
                Sản phẩm: <span className="font-medium">{productName}</span>
              </p>
            )}

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={20} />
              Tải sản phẩm ngay
            </button>

            <div className="mt-6 flex gap-4 justify-center">
              <Link
                href="/me/cuahangso"
                className="text-blue-600 hover:text-blue-700"
              >
                Xem sản phẩm đã mua
              </Link>
              <Link
                href="/cuahangso"
                className="text-blue-600 hover:text-blue-700"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}