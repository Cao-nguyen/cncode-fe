export interface Product {
  _id: string
  id: string
  name: string
  slug: string
  description: string
  longDescription: string
  price: number
  priceInXu: number
  category: 'powerpoint' | 'code' | 'design' | 'document'
  thumbnail: string
  previewImages: string[]
  downloadCount: number
  rating: number
  reviewCount: number
  features: string[]
  requirements: string[]
  tags: string[]
  downloadUrl: string
  previewUrl?: string
  status: 'draft' | 'published'
  author: {
    _id: string
    fullName: string
    avatar: string
  }
  createdAt: string
  updatedAt: string
}

export interface Review {
  id: string
  userName: string
  userAvatar: string
  rating: number
  comment: string
  createdAt: string
}

export type Category = 'powerpoint' | 'code' | 'design' | 'document'
export type PaymentMethod = 'money' | 'xu'
export type ProductStatus = 'draft' | 'published'