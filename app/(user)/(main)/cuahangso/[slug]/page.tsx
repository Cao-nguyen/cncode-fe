'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Download, ChevronLeft, Eye, Calendar, User, X } from 'lucide-react'
import { digitalProductApi } from '@/lib/api/digital-product.api'
import { paymentApi } from '@/lib/api/payment.api'
import { IDigitalProduct } from '@/types/digital-product.type'
import { useAuthStore } from '@/store/auth.store'
import { toast } from 'sonner'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import CoinsIcon from '@/components/common/CoinsIcon'
import ImagePreview from '@/components/common/ImagePreview'
import { IReview } from '@/types/digital-product.type'

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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
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

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { user, token, checkAndSync, setUser } = useAuthStore();

  const [product, setProduct] = useState<IDigitalProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchased, setPurchased] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [isOwnProduct, setIsOwnProduct] = useState(false)

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingPurchaseType, setPendingPurchaseType] = useState<'money' | 'xu' | null>(null)

  // Review states
  const [reviews, setReviews] = useState<IReview[]>([])
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)

  const allImages = product
    ? [product.thumbnail, ...(product.previewImages || [])]
    : []

  useEffect(() => {
    if (slug) {
      fetchProduct()
    }
  }, [slug])

  useEffect(() => {
    if (product && token && user) {
      checkPurchaseStatus()
      checkReviewStatus()
      fetchReviews()
      setIsOwnProduct(product.author._id === user.id)
    }
  }, [product, token, user])

  const fetchProduct = async () => {
    setLoading(true)
    try {
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
    } finally {
      setLoading(false)
    }
  }

  const checkPurchaseStatus = async () => {
    if (!token || !product) return
    try {
      const result = await paymentApi.checkPurchased(product._id, token)
      if (result.success && result.data.purchased) {
        setPurchased(true)
      }
    } catch (error) {
      console.error('Failed to check purchase status:', error)
    }
  }

  const checkReviewStatus = async () => {
    if (!token || !product) return
    try {
      const result = await digitalProductApi.getReviews(product._id)
      if (result.success) {
        const userReview = result.data.find((r: IReview) => r.user._id === user?.id)
        setHasReviewed(!!userReview)
      }
    } catch (error) {
      console.error('Failed to check review status:', error)
    }
  }

  const fetchReviews = async () => {
    if (!product) return
    try {
      const result = await digitalProductApi.getReviews(product._id)
      if (result.success) {
        setReviews(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    }
  }

  const handlePurchaseWithMoney = async () => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để mua sản phẩm')
      router.push('/login')
      return
    }

    if (isOwnProduct) {
      toast.error('Bạn không thể mua sản phẩm của chính mình')
      return
    }

    setPendingPurchaseType('money')
    setShowConfirmModal(true)
  }

  const handlePurchaseWithXu = async () => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để mua sản phẩm')
      router.push('/login')
      return
    }

    if (isOwnProduct) {
      toast.error('Bạn không thể mua sản phẩm của chính mình')
      return
    }

    if (!product?.enableXuPayment) {
      toast.error('Sản phẩm này không hỗ trợ thanh toán bằng Xu')
      return
    }

    // Kiểm tra đủ xu không
    const xuPrice = Math.floor(product.price / 10)
    if ((user?.coins || 0) < xuPrice) {
      toast.error(`Không đủ xu! Bạn cần ${xuPrice.toLocaleString()} xu để mua sản phẩm này.`)
      return
    }

    setPendingPurchaseType('xu')
    setShowConfirmModal(true)
  }

  const confirmPurchase = async () => {
    if (!product) return

    setPurchasing(true)
    setShowConfirmModal(false)

    try {
      if (pendingPurchaseType === 'money') {
        const result = await paymentApi.purchaseWithPayOS(product._id, token!)
        if (result.success && result.data.checkoutUrl) {
          window.location.href = result.data.checkoutUrl
        } else {
          toast.error(result.message || 'Không thể tạo thanh toán')
          setPurchasing(false)
        }
      } else if (pendingPurchaseType === 'xu') {
        const result = await paymentApi.purchaseWithXu(product._id, token!)
        if (result.success) {
          toast.success('Mua sản phẩm thành công! Xu đã được trừ')
          setPurchased(true)

          // Chỉ hiển thị thông báo, KHÔNG tự động mở link tải
          // Hiển thị nút tải xuống để người dùng chủ động click

          // Refresh user data để cập nhật số xu
          await checkAndSync()

          // Refresh lại trang để cập nhật UI
          router.refresh()
        } else {
          toast.error(result.message || 'Không thể mua bằng Xu')
        }
        setPurchasing(false)
      }
    } catch (error) {
      console.error('Purchase failed:', error)
      toast.error('Có lỗi xảy ra')
      setPurchasing(false)
    }
  }

  const handleDownload = () => {
    if (product?.downloadUrl) {
      window.open(product.downloadUrl, '_blank')
    }
  }

  const openPreview = (index: number) => {
    setPreviewIndex(index)
    setPreviewOpen(true)
  }

  const handleSubmitReview = async () => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để đánh giá')
      router.push('/login')
      return
    }

    if (!reviewComment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá')
      return
    }

    setSubmittingReview(true)
    try {
      const result = await digitalProductApi.submitReview(product!._id, {
        rating: reviewRating,
        comment: reviewComment
      }, token)

      if (result.success) {
        toast.success('Đánh giá thành công!')
        setShowReviewModal(false)
        setReviewRating(5)
        setReviewComment('')
        fetchReviews()
        checkReviewStatus()
        // Refresh product để cập nhật rating
        fetchProduct()
      } else {
        toast.error(result.message || 'Không thể gửi đánh giá')
      }
    } catch (error) {
      console.error('Submit review failed:', error)
      toast.error('Có lỗi xảy ra')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black py-10">
        <div className="container mx-auto px-5 lg:px-10">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black py-10">
        <div className="container mx-auto px-5 lg:px-10 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Không tìm thấy sản phẩm</h1>
          <Link href="/cuahangso" className="mt-4 inline-block text-blue-600 hover:underline">
            Quay lại cửa hàng
          </Link>
        </div>
      </div>
    )
  }

  const xuPrice = product.enableXuPayment ? Math.floor(product.price / 10) : 0
  const description = product.longDescription || ''
  const isLongDescription = description.length > 300
  const hasEnoughXu = (user?.coins || 0) >= xuPrice

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-5 md:py-10">
      <div className="container mx-auto px-4 sm:px-5 lg:px-10">

        <Link href="/cuahangso" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6">
          <ChevronLeft size={20} />
          Quay lại cửa hàng
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          <div className="space-y-4">
            <div
              className="relative aspect-video bg-white dark:bg-[#171717] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 cursor-zoom-in group"
              onClick={() => openPreview(selectedImage)}
            >
              <Image
                src={allImages[selectedImage]}
                alt={product.name}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Eye size={32} className="text-white drop-shadow-lg" />
              </div>
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${selectedImage === idx
                      ? 'border-blue-500'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                      }`}
                  >
                    <Image src={img} alt={`Ảnh ${idx + 1}`} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400`}>
                  {getCategoryName(product.category)}
                </span>
                {product.status !== 'published' && (
                  <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-yellow-100 text-yellow-700">
                    Bản nháp
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-400 fill-current" data-filled={true} />
                  <span>{product.rating.toFixed(1)}</span>
                  <span>({formatNumber(product.reviewCount)} đánh giá)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download size={16} className="text-gray-400" />
                  <span>{formatNumber(product.downloadCount)} lượt tải</span>
                </div>
              </div>
            </div>

            <div className="border-t border-b border-gray-200 dark:border-gray-800 py-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tác giả:</span>
                </div>
                <div className="flex items-center gap-2">
                  {product.author?.avatar && (
                    <Image src={product.author.avatar} alt={product.author.fullName} width={24} height={24} className="rounded-full" />
                  )}
                  <span className="font-medium text-gray-900 dark:text-white">{product.author?.fullName}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Ngày đăng:</span>
                </div>
                <span className="text-sm text-gray-900 dark:text-white">{formatDate(product.createdAt)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {formatPrice(product.price)}
                  </span>
                  {product.enableXuPayment && (
                    <div className={`flex items-center gap-1 ${hasEnoughXu ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>
                      <CoinsIcon size={20} />
                      <span className="font-semibold">{xuPrice.toLocaleString()} xu</span>
                      {!hasEnoughXu && user && (
                        <span className="text-xs ml-1">(Không đủ)</span>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">Đã bao gồm VAT</p>
                {user && product.enableXuPayment && !hasEnoughXu && (
                  <p className="text-xs text-red-500 mt-1">
                    Bạn có {user.coins?.toLocaleString() || 0} xu, cần thêm {(xuPrice - (user?.coins || 0)).toLocaleString()} xu
                  </p>
                )}
              </div>

              {!isOwnProduct && !purchased ? (
                <div className="space-y-3">
                  <button
                    onClick={handlePurchaseWithMoney}
                    disabled={purchasing}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50"
                  >
                    {purchasing ? 'Đang xử lý...' : 'Thanh toán'}
                  </button>

                  {product.enableXuPayment && (
                    <button
                      onClick={handlePurchaseWithXu}
                      disabled={purchasing || !hasEnoughXu}
                      className={`w-full py-3 border-2 font-semibold rounded-xl transition disabled:opacity-50 ${hasEnoughXu
                        ? 'border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20'
                        : 'border-gray-300 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      {purchasing ? 'Đang xử lý...' : `Thanh toán Xu (${xuPrice.toLocaleString()} xu)`}
                    </button>
                  )}
                </div>
              ) : purchased && (
                <button
                  onClick={handleDownload}
                  className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Tải xuống ngay
                </button>
              )}

              {isOwnProduct && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl text-center">
                  <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                    Đây là sản phẩm của bạn. Bạn không thể mua sản phẩm của chính mình.
                  </p>
                  <Link
                    href={`/me/cuahangso/edit/${product._id}`}
                    className="inline-block mt-2 text-blue-600 hover:underline text-sm"
                  >
                    Chỉnh sửa sản phẩm
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mô tả chi tiết */}
        {description && (
          <div className="mt-10 lg:mt-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Mô tả chi tiết</h2>
            <div className="bg-white dark:bg-[#171717] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
              <div
                className="prose prose-sm dark:prose-invert max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: showFullDescription ? description : (isLongDescription ? description.slice(0, 300) + '...' : description)
                }}
              />
              {isLongDescription && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  {showFullDescription ? 'Thu gọn' : 'Xem thêm'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Phần đánh giá */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Đánh giá sản phẩm</h2>
            {!isOwnProduct && purchased && !hasReviewed && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Viết đánh giá
              </button>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white dark:bg-[#171717] rounded-xl p-8 text-center border border-gray-200 dark:border-gray-800">
              <p className="text-gray-500">Chưa có đánh giá nào.</p>
              {purchased && !hasReviewed && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="mt-3 text-blue-600 hover:underline"
                >
                  Hãy là người đầu tiên đánh giá sản phẩm này!
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white dark:bg-[#171717] rounded-xl p-5 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={review.user?.avatar || '/images/avatar.png'} />
                      <AvatarFallback>{review.user?.fullName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {review.user?.fullName || 'Người dùng'}
                      </p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            data-filled={star <= review.rating ? true : false}
                            className={star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="ml-auto text-xs text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mt-2">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tính năng nổi bật */}
        {product.features && product.features.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tính năng nổi bật</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {product.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-white dark:bg-[#171717] rounded-lg border border-gray-200 dark:border-gray-800">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Yêu cầu hệ thống */}
        {product.requirements && product.requirements.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Yêu cầu hệ thống</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {product.requirements.map((req, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-white dark:bg-[#171717] rounded-lg border border-gray-200 dark:border-gray-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-gray-700 dark:text-gray-300">{req}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal xác nhận mua hàng */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-[#171717] rounded-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Xác nhận mua hàng
              </h3>
              <button onClick={() => setShowConfirmModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <p className="text-gray-700 dark:text-gray-300">
                Bạn có chắc chắn muốn mua sản phẩm <strong>{product?.name}</strong>?
              </p>
              {pendingPurchaseType === 'xu' && (
                <p className="mt-2 text-blue-600">
                  Số xu sẽ trừ: <strong>{xuPrice.toLocaleString()} xu</strong>
                </p>
              )}
            </div>
            <div className="flex gap-3 p-5 pt-0">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={confirmPurchase}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal đánh giá */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-[#171717] rounded-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Đánh giá sản phẩm
              </h3>
              <button onClick={() => setShowReviewModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Đánh giá của bạn</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        data-filled={true}
                        size={28}
                        className={star <= reviewRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nội dung đánh giá</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                  className="w-full px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 pt-0">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview || !reviewComment.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal preview ảnh */}
      {previewOpen && (
        <ImagePreview
          images={allImages}
          initialIndex={previewIndex}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  )
}