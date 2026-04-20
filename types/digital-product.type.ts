export interface IDigitalProduct {
  _id: string
  name: string
  slug: string
  description: string
  longDescription: string
  category: 'powerpoint' | 'code' | 'design' | 'document'
  price: number
  priceInXu: number
  enableXuPayment: boolean  // 👈 THÊM DÒNG NÀY
  thumbnail: string
  previewImages: string[]
  downloadUrl: string
  previewUrl?: string
  features: string[]
  requirements: string[]
  tags: string[]
  downloadCount: number
  rating: number
  reviewCount: number
  status: 'draft' | 'published'
  author: {
    _id: string
    fullName: string
    avatar: string
  }
  createdAt: string
  updatedAt: string
}

export interface ICreateProduct {
  name: string
  description: string
  longDescription: string
  category: 'powerpoint' | 'code' | 'design' | 'document'
  price: number
  priceInXu: number
  enableXuPayment: boolean  // 👈 THÊM DÒNG NÀY
  thumbnail: string
  previewImages: string[]
  downloadUrl: string
  previewUrl?: string
  features: string[]
  requirements: string[]
  tags: string[]
  status?: 'draft' | 'published'
}

export interface IPaymentResponse {
  success: boolean
  data: {
    downloadUrl?: string
    paymentUrl?: string
    paymentId?: string
  }
  message: string
}