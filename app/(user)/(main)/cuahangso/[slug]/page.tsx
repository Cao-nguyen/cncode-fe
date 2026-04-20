'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, X, Eye, ShoppingCart, Download, Star, Shield, Zap, Users, Clock, CheckCircle, AlertCircle, Coins, Lock, Send } from 'lucide-react'
import { Loader2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { digitalProductApi } from '@/lib/api/digital-product.api'
import { paymentApi } from '@/lib/api/payment.api'
import { useAuthStore } from '@/store/auth.store'
import { IDigitalProduct } from '@/types/digital-product.type'

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })

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

interface PurchaseInfo {
  purchased: boolean
  downloadUrl?: string
  productName?: string
}

interface Review {
  _id: string
  user: { fullName: string; _id: string }
  rating: number
  comment: string
  createdAt: string
}

const StarRating = ({ value, onChange }: { value: number; onChange?: (v: number) => void }) => {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          disabled={!onChange}
          className="disabled:cursor-default"
        >
          <Star
            data-filled={star ? "" : undefined}
            size={20}
            className={`transition-colors ${star <= (hovered || value)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300 dark:text-gray-600'
              }`}
          />
        </button>
      ))}
    </div>
  )
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
  const [purchaseInfo, setPurchaseInfo] = useState<PurchaseInfo>({ purchased: false })
  const [checkingPurchase, setCheckingPurchase] = useState(false)

  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [userReview, setUserReview] = useState<Review | null>(null)

  useEffect(() => {
    if (slug) fetchProduct()
  }, [slug])

  useEffect(() => {
    if (product && token) {
      checkPurchaseStatus()
    }
  }, [product, token])

  useEffect(() => {
    if (product) {
      fetchReviews()
    }
  }, [product])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const paymentStatus = urlParams.get('payment_status')
    const orderCode = urlParams.get('orderCode')

    if (paymentStatus === 'success' && orderCode && token && product) {
      toast.success('Thanh toán thành công!')
      checkPurchaseStatus()
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [token, product])

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
      console.error('Fetch product error:', error)
      toast.error('Có lỗi xảy ra')
      router.push('/cuahangso')
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    if (!product) return
    try {
      const result = await digitalProductApi.getReviews(product._id)
      if (result.success && Array.isArray(result.data)) {
        setReviews(result.data)
        if (user && result.data.length > 0) {
          const existingReview = result.data.find((r: Review) => r.user?._id === user.id)
          if (existingReview) setUserReview(existingReview)
        }
      } else {
        setReviews([])
      }
    } catch (error) {
      console.error('Fetch reviews error:', error)
      setReviews([])
    }
  }

  const checkPurchaseStatus = async () => {
    if (!product || !token) return
    try {
      setCheckingPurchase(true)
      const result = await paymentApi.checkPurchased(product._id, token)
      if (result.success) {
        setPurchaseInfo(result.data)
      } else {
        setPurchaseInfo({ purchased: false })
      }
    } catch (error) {
      console.error('Check purchase status error:', error)
      setPurchaseInfo({ purchased: false })
    } finally {
      setCheckingPurchase(false)
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
          await checkPurchaseStatus()
        } else {
          toast.error(result.message || 'Mua sản phẩm thất bại')
        }
      } else {
        const result = await paymentApi.purchaseWithPayOS(product._id, token)
        if (result.success && result.data.checkoutUrl) {
          window.location.href = result.data.checkoutUrl
        } else {
          toast.error(result.message || 'Tạo đơn hàng thất bại')
        }
      }
    } catch (error) {
      console.error('Purchase error:', error)
      toast.error('Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleSubmitReview = async () => {

    if (!token) {
      toast.error('Vui lòng đăng nhập để đánh giá')
      router.push('/login')
      return
    }


    if (!product) {
      toast.error('Không tìm thấy sản phẩm')
      return
    }


    if (!purchaseInfo.purchased) {
      toast.error('Bạn cần mua sản phẩm để đánh giá')
      return
    }


    if (userReview) {
      toast.error('Bạn đã đánh giá sản phẩm này rồi')
      return
    }


    if (!reviewComment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá')
      return
    }

    setIsSubmittingReview(true)
    try {
      const result = await digitalProductApi.submitReview(
        product._id,
        { rating: reviewRating, comment: reviewComment },
        token
      )

      if (result.success) {
        toast.success('Đánh giá thành công!')
        setReviewComment('')
        setReviewRating(5)
        await fetchReviews()
      } else {
        toast.error(result.message || 'Gửi đánh giá thất bại')
      }
    } catch (error) {
      console.error('Submit review error:', error)
      toast.error('Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black">
        <div className="text-center">
          <Loader2 size={40} className="mx-auto animate-spin text-blue-600" />
          <p className="mt-4 text-gray-500">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black">
        <div className="text-center">
          <XCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Không tìm thấy sản phẩm</h1>
          <Link href="/cuahangso" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
            <ChevronLeft size={20} /> Quay lại cửa hàng
          </Link>
        </div>
      </div>
    )
  }

  const xuAmount = Math.floor(product.price / 10)
  const isPreviewable = product.category === 'powerpoint' || product.category === 'document'
  const canReview = purchaseInfo.purchased && !userReview && !checkingPurchase
  const alreadyReviewed = purchaseInfo.purchased && userReview

  return (
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-black">
      <div className="container mx-auto px-5 lg:px-10">
        <Link href="/cuahangso" className="mb-5 inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 dark:text-gray-400">
          <ChevronLeft size={20} /> Quay lại cửa hàng
        </Link>

        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">

          <div>
            <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#171717]">
              <div className="relative aspect-video cursor-pointer" onClick={() => setShowImageModal(true)}>
                <Image
                  width={800}
                  height={600}
                  src={product.previewImages[selectedImage] || product.thumbnail}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                <button className="absolute bottom-4 right-4 rounded-lg bg-black/50 p-2 text-white hover:bg-black/70">
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
                    className={`aspect-video overflow-hidden rounded-lg border-2 ${selectedImage === idx ? 'border-blue-600' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                    <Image width={100} height={100} src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>


          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#171717]">
            <div className={`mb-3 inline-flex items-center gap-2 rounded-lg px-3 py-1 text-sm ${getCategoryColor(product.category)}`}>
              {getCategoryName(product.category)}
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
            <div className="mb-4 flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star data-filled={true} size={18} className="fill-current text-yellow-400" />
                <span className="font-semibold text-gray-900 dark:text-white">{product.rating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({formatNumber(product.reviewCount)} đánh giá)</span>
              </div>
              <div className="flex items-center gap-1">
                <Download size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{formatNumber(product.downloadCount)} lượt tải</span>
              </div>
            </div>
            <p className="mb-6 text-gray-600 dark:text-gray-400">{product.description}</p>

            <div className="mb-4 border-t border-gray-200 pt-4 dark:border-gray-800">
              <div className="mb-4">
                <div className="mb-2 text-3xl font-bold text-blue-600 dark:text-blue-400">{formatPrice(product.price)}</div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Coins size={16} />
                  <span>Hoặc {formatNumber(xuAmount)} Xu (10 VNĐ = 1 Xu)</span>
                </div>
              </div>

              {purchaseInfo.purchased ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    <CheckCircle size={18} />
                    <span className="font-medium">Bạn đã sở hữu sản phẩm này</span>
                  </div>
                  {purchaseInfo.downloadUrl && (
                    <a
                      href={purchaseInfo.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                    >
                      <Download size={20} /> Tải xuống
                    </a>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPurchaseMethod('money')}
                      className={`flex-1 rounded-lg border px-4 py-2 ${purchaseMethod === 'money' ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-400'}`}
                    >
                      💳 Thanh toán
                    </button>
                    <button
                      onClick={() => setPurchaseMethod('xu')}
                      className={`flex-1 rounded-lg border px-4 py-2 ${purchaseMethod === 'xu' ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-400'}`}
                    >
                      🪙 Thanh toán Xu
                    </button>
                  </div>
                  <button
                    onClick={handlePurchase}
                    disabled={isPurchasing || checkingPurchase}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isPurchasing ? <><Loader2 size={20} className="animate-spin" /> Đang xử lý...</> : <><ShoppingCart size={20} /> Mua ngay</>}
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Shield size={16} /><span>Bảo hành 30 ngày</span></div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Zap size={16} /><span>Tải ngay lập tức</span></div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Users size={16} /><span>Đã bán {formatNumber(product.downloadCount)}</span></div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><Clock size={16} /><span>Cập nhật {formatDate(product.createdAt)}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#171717]">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Mô tả sản phẩm</h2>
              <p className="whitespace-pre-wrap leading-relaxed text-gray-600 dark:text-gray-400">{product.longDescription}</p>
            </div>


            {isPreviewable && product.previewUrl && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#171717]">
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Xem thử sản phẩm</h2>
                <div className="aspect-video overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  <iframe src={product.previewUrl} className="h-full w-full" allowFullScreen />
                </div>
              </div>
            )}


            {product.features && product.features.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#171717]">
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Tính năng nổi bật</h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {product.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle size={18} className="mt-0.5 flex-shrink-0 text-green-500" />
                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {product.requirements && product.requirements.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#171717]">
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Yêu cầu hệ thống</h2>
                <div className="space-y-2">
                  {product.requirements.map((req, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-yellow-500" />
                      <span className="text-gray-600 dark:text-gray-400">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}


            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#171717]">
              <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
                Đánh giá ({reviews.length})
              </h2>


              {canReview && (
                <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/30 dark:bg-blue-900/10">
                  <p className="mb-4 font-medium text-gray-900 dark:text-white">Chia sẻ đánh giá của bạn</p>
                  <div className="mb-3">
                    <StarRating value={reviewRating} onChange={setReviewRating} />
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Nhận xét về sản phẩm..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-[#111] dark:text-white"
                  />
                  <button
                    onClick={handleSubmitReview}
                    disabled={isSubmittingReview}
                    className="mt-3 flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmittingReview ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Gửi đánh giá
                  </button>
                </div>
              )}


              {alreadyReviewed && (
                <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  <CheckCircle size={16} />
                  <span className="text-sm">Bạn đã đánh giá sản phẩm này</span>
                </div>
              )}


              {!purchaseInfo.purchased && !checkingPurchase && (
                <div className="mb-6 flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-3 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  <Lock size={16} />
                  <span className="text-sm">Mua sản phẩm để có thể đánh giá</span>
                </div>
              )}


              {checkingPurchase && (
                <div className="mb-6 flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-3 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Đang kiểm tra...</span>
                </div>
              )}


              {reviews.length === 0 ? (
                <p className="text-center text-sm text-gray-400">Chưa có đánh giá nào</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="flex gap-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-semibold text-white">
                        {review.user?.fullName?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-white">{review.user?.fullName || 'Người dùng'}</span>
                          <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                        </div>
                        <StarRating value={review.rating} />
                        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>


          <div className="sticky top-20 h-fit space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#171717]">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Thông tin tác giả</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-lg font-semibold text-white">
                  {product.author?.fullName?.charAt(0) || 'A'}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{product.author?.fullName || 'CNcode Team'}</div>
                  <div className="text-sm text-gray-500">Tác giả</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#171717]">
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Link tải</h3>
              {checkingPurchase ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Đang kiểm tra...</span>
                </div>
              ) : purchaseInfo.purchased && purchaseInfo.downloadUrl ? (
                <a
                  href={purchaseInfo.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  <Download size={18} /> Tải xuống ngay
                </a>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-3 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  <Lock size={16} />
                  <span className="text-sm">Mua sản phẩm để nhận link tải</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-5" onClick={() => setShowImageModal(false)}>
          <button className="absolute right-5 top-5 rounded-lg bg-gray-800 p-2 text-white hover:bg-gray-700">
            <X size={24} />
          </button>
          <Image
            width={800}
            height={600}
            src={product.previewImages[selectedImage] || product.thumbnail}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}