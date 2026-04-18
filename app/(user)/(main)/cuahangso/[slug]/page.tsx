'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, X, Eye, Heart, Share2, ShoppingCart, Download, Star, Shield, Zap, Users, Clock, CheckCircle, AlertCircle, ExternalLink, Coins } from 'lucide-react'
import { toast } from 'sonner'
import { Loader2, XCircle } from 'lucide-react'
import { digitalProductApi } from '@/lib/api/digital-product.api'
import { paymentApi } from '@/lib/api/payment.api'
import { useAuthStore } from '@/store/auth.store'
import { IDigitalProduct } from '@/types/digital-product.type'

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

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getCategoryColor = (category: string) => {
  switch(category) {
    case 'powerpoint': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
    case 'code': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
    case 'design': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
    case 'document': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
    default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
  }
}

const getCategoryName = (category: string) => {
  switch(category) {
    case 'powerpoint': return 'PowerPoint'
    case 'code': return 'Code'
    case 'design': return 'Design'
    case 'document': return 'Tài liệu'
    default: return ''
  }
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { user, token } = useAuthStore()
  
  const [product, setProduct] = useState<IDigitalProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [purchaseMethod, setPurchaseMethod] = useState<'money' | 'xu'>('money')
  const [isPurchasing, setIsPurchasing] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchProduct()
    }
  }, [slug])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const result = await digitalProductApi.getProductBySlug(slug)
      
      if (result.success) {
        setProduct(result.data)
      } else {
        toast.error('Không tìm thấy sản phẩm')
        router.push('/cuahangso')
      }
    } catch (error) {
      console.error('Failed to fetch product:', error)
      toast.error('Có lỗi xảy ra')
      router.push('/cuahangso')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
  if (!token) {
    toast.error('Vui lòng đăng nhập để mua sản phẩm')
    router.push('/login')
    return
  }

  if (!product) return

  setIsPurchasing(true)
  try {
    if (purchaseMethod === 'xu') {
      const result = await paymentApi.purchaseWithXu(product._id, token)
      if (result.success) {
        toast.success('Mua sản phẩm thành công!')
        window.open(result.data.downloadUrl, '_blank')
      } else {
        toast.error(result.message || 'Mua sản phẩm thất bại')
      }
    } else {
      const result = await paymentApi.purchaseWithPayOS(product._id, token)
      if (result.success && result.data.checkoutUrl) {
        // Chuyển hướng thẳng đến trang thanh toán PayOS
        window.location.href = result.data.checkoutUrl
      } else {
        toast.error(result.message || 'Tạo đơn hàng thất bại')
      }
    }
  } catch (error) {
    console.error('Purchase failed:', error)
    toast.error('Có lỗi xảy ra, vui lòng thử lại')
  } finally {
    setIsPurchasing(false)
  }
}

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <XCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Không tìm thấy sản phẩm</h1>
          <Link href="/cuahangso" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <ChevronLeft size={20} /> Quay lại cửa hàng
          </Link>
        </div>
      </div>
    )
  }

  const xuAmount = Math.floor(product.price / 10)
  const isPreviewable = product.category === 'powerpoint' || product.category === 'document'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
      <div className="container mx-auto px-5 lg:px-10">
        <Link href="/cuahangso" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-5">
          <ChevronLeft size={20} /> Quay lại cửa hàng
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Phần hình ảnh */}
          <div>
            <div className="bg-white dark:bg-[#171717] rounded-xl overflow-hidden shadow-sm mb-4 border border-gray-200 dark:border-gray-800">
              <div className="relative aspect-video cursor-pointer" onClick={() => setShowImageModal(true)}>
                <img src={product.previewImages[selectedImage] || product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
                <button className="absolute bottom-4 right-4 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70">
                  <Eye size={20} />
                </button>
              </div>
            </div>
            {product.previewImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.previewImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-video rounded-lg overflow-hidden border-2 ${selectedImage === idx ? 'border-blue-600' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phần thông tin */}
          <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm mb-3 ${getCategoryColor(product.category)}`}>
              {getCategoryName(product.category)}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star size={18} className="text-yellow-400 fill-current" />
                <span className="font-semibold text-gray-900 dark:text-white">{product.rating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({formatNumber(product.reviewCount)} đánh giá)</span>
              </div>
              <div className="flex items-center gap-1">
                <Download size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{formatNumber(product.downloadCount)} lượt tải</span>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{product.description}</p>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mb-4">
              <div className="mb-4">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{formatPrice(product.price)}</div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Coins size={16} />
                  <span>Hoặc {formatNumber(xuAmount)} Xu (10 VNĐ = 1 Xu)</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex gap-2">
                  <button
                    onClick={() => setPurchaseMethod('money')}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      purchaseMethod === 'money'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                        : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-400'
                    }`}
                  >
                    💳 Thanh toán
                  </button>
                  <button
                    onClick={() => setPurchaseMethod('xu')}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      purchaseMethod === 'xu'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                        : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-400'
                    }`}
                  >
                    🪙 Thanh toán Xu
                  </button>
                </div>
                <button
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
                >
                  <ShoppingCart size={20} /> {isPurchasing ? 'Đang xử lý...' : 'Mua ngay'}
                </button>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2">
                  <Heart size={18} /> Yêu thích
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2">
                  <Share2 size={18} /> Chia sẻ
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Shield size={16} /><span>Bảo hành 30 ngày</span></div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Zap size={16} /><span>Tải ngay lập tức</span></div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Users size={16} /><span>Đã bán {formatNumber(product.downloadCount)}</span></div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Clock size={16} /><span>Cập nhật {formatDate(product.createdAt)}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Phần mô tả chi tiết */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Mô tả sản phẩm</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">{product.longDescription}</p>
            </div>

            {isPreviewable && product.previewUrl && (
              <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Xem thử sản phẩm</h2>
                <div className="aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <iframe src={product.previewUrl} className="w-full h-full" allowFullScreen></iframe>
                </div>
              </div>
            )}

            {product.features && product.features.length > 0 && (
              <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tính năng nổi bật</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.requirements && product.requirements.length > 0 && (
              <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Yêu cầu hệ thống</h2>
                <div className="space-y-2">
                  {product.requirements.map((req, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <AlertCircle size={18} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm p-6 sticky top-20 border border-gray-200 dark:border-gray-800 h-fit">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Thông tin tác giả</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                {product.author?.fullName?.charAt(0) || 'A'}
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">{product.author?.fullName || 'CNcode Team'}</div>
                <div className="text-sm text-gray-500">Tác giả</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Link tải</h4>
              <p className="text-xs text-gray-500">Sau khi thanh toán, link tải sẽ hiển thị tại đây</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal hình ảnh */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-5" onClick={() => setShowImageModal(false)}>
          <button className="absolute top-5 right-5 p-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700">
            <X size={24} />
          </button>
          <img src={product.previewImages[selectedImage] || product.thumbnail} alt={product.name} className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}