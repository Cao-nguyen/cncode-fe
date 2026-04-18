'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, Plus, Trash2, Save, Eye, DollarSign, Coins, Check, AlertCircle, Image as ImageIcon, Link as LinkIcon, Tag, Package, FileText, Code, Palette, File, Sparkles, Shield, Zap, Cloud, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth.store'
import { digitalProductApi } from '@/lib/api/digital-product.api'

interface ProductForm {
  name: string
  description: string
  longDescription: string
  category: 'powerpoint' | 'code' | 'design' | 'document'
  price: number
  enableXuPayment: boolean
  thumbnail: File | null
  previewImages: File[]
  downloadUrl: string
  previewUrl: string
  features: string[]
  requirements: string[]
  tags: string[]
}

const CATEGORIES = [
  { id: 'powerpoint', name: 'PowerPoint', icon: FileText, color: 'orange', desc: 'Template PowerPoint, bài thuyết trình' },
  { id: 'code', name: 'Code', icon: Code, color: 'blue', desc: 'Source code, script, ứng dụng' },
  { id: 'design', name: 'Design', icon: Palette, color: 'purple', desc: 'Figma, Photoshop, Illustrator' },
  { id: 'document', name: 'Tài liệu', icon: File, color: 'green', desc: 'Ebook, PDF, tài liệu học tập' }
]

export default function CreateProductPage() {
  const router = useRouter()
  const { token, user } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [featureInput, setFeatureInput] = useState('')
  const [requirementInput, setRequirementInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const previewInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    description: '',
    longDescription: '',
    category: 'powerpoint',
    price: 0,
    enableXuPayment: true,
    thumbnail: null,
    previewImages: [],
    downloadUrl: '',
    previewUrl: '',
    features: [],
    requirements: [],
    tags: []
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
  }

  const handleToggleXuPayment = () => {
    setFormData(prev => ({ ...prev, enableXuPayment: !prev.enableXuPayment }))
  }

  const uploadFileToCloudinary = async (file: File, folder: string): Promise<string> => {
    const formDataUpload = new FormData()
    formDataUpload.append('image', file)
    formDataUpload.append('folder', folder)

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/single`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formDataUpload
    })

    const result = await response.json()
    if (!result.success) {
      throw new Error(result.message || 'Upload failed')
    }
    return result.data.url
  }

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB')
      return
    }

    setIsUploading(true)
    try {
      const url = await uploadFileToCloudinary(file, 'thumbnails')
      setFormData(prev => ({ ...prev, thumbnail: file }))
      toast.success('Tải ảnh lên thành công')
    } catch (err) {
      console.error('Upload failed:', err)
      toast.error('Tải ảnh lên thất bại')
    } finally {
      setIsUploading(false)
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = ''
    }
  }

  const handlePreviewUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const validFiles = files.filter(f => {
      if (!f.type.startsWith('image/')) {
        toast.error(`${f.name} không phải file ảnh`)
        return false
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} vượt quá 5MB`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setIsUploading(true)
    try {
      const uploadPromises = validFiles.map(file => uploadFileToCloudinary(file, 'previews'))
      const urls = await Promise.all(uploadPromises)
      
      setFormData(prev => ({ 
        ...prev, 
        previewImages: [...prev.previewImages, ...validFiles] 
      }))
      toast.success(`Tải lên ${urls.length} ảnh thành công`)
    } catch (err) {
      console.error('Upload failed:', err)
      toast.error('Tải ảnh lên thất bại')
    } finally {
      setIsUploading(false)
      if (previewInputRef.current) previewInputRef.current.value = ''
    }
  }

  const removePreviewImage = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      previewImages: prev.previewImages.filter((_, i) => i !== index) 
    }))
  }

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({ ...prev, features: [...prev.features, featureInput.trim()] }))
      setFeatureInput('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }))
  }

  const addRequirement = () => {
    if (requirementInput.trim()) {
      setFormData(prev => ({ ...prev, requirements: [...prev.requirements, requirementInput.trim()] }))
      setRequirementInput('')
    }
  }

  const removeRequirement = (index: number) => {
    setFormData(prev => ({ ...prev, requirements: prev.requirements.filter((_, i) => i !== index) }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  const validateForm = async (): Promise<boolean> => {
    if (!formData.name.trim()) { setError('Vui lòng nhập tên sản phẩm'); return false }
    if (!formData.description.trim()) { setError('Vui lòng nhập mô tả ngắn'); return false }
    if (!formData.longDescription.trim()) { setError('Vui lòng nhập mô tả chi tiết'); return false }
    if (formData.price <= 0) { setError('Vui lòng nhập giá tiền hợp lệ'); return false }
    if (!formData.thumbnail) { setError('Vui lòng chọn ảnh thumbnail'); return false }
    if (!formData.downloadUrl.trim()) { setError('Vui lòng nhập URL tải sản phẩm'); return false }
    
    if (formData.previewImages.length === 0) {
      setError('Vui lòng chọn ít nhất 1 ảnh preview')
      return false
    }
    
    return true
  }

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để đăng sản phẩm')
      router.push('/login')
      return
    }

    const isValid = await validateForm()
    if (!isValid) return

    setIsSubmitting(true)
    setError(null)

    try {
      setIsUploading(true)
      
      let thumbnailUrl = ''
      if (formData.thumbnail) {
        thumbnailUrl = await uploadFileToCloudinary(formData.thumbnail, 'thumbnails')
      }

      const previewUrls: string[] = []
      for (const file of formData.previewImages) {
        const url = await uploadFileToCloudinary(file, 'previews')
        previewUrls.push(url)
      }
      
      setIsUploading(false)

      const productData = {
        name: formData.name,
        description: formData.description,
        longDescription: formData.longDescription,
        category: formData.category,
        price: formData.price,
        enableXuPayment: formData.enableXuPayment,
        thumbnail: thumbnailUrl,
        previewImages: previewUrls,
        downloadUrl: formData.downloadUrl,
        previewUrl: formData.previewUrl,
        features: formData.features,
        requirements: formData.requirements,
        tags: formData.tags,
        status
      }

      const result = await digitalProductApi.createProduct(productData, token)

      if (result.success) {
        toast.success(status === 'draft' ? 'Đã lưu sản phẩm vào bản nháp' : 'Đăng sản phẩm thành công')
        router.push('/me/cuahangso')
      } else {
        setError(result.message || 'Có lỗi xảy ra')
        toast.error(result.message || 'Có lỗi xảy ra')
      }
    } catch (err) {
      console.error('Create product failed:', err)
      setError('Không thể kết nối đến server')
      toast.error('Không thể kết nối đến server')
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  const xuAmount = formData.enableXuPayment ? Math.floor(formData.price / 10) : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-5 lg:px-10 py-5 md:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Đăng sản phẩm mới</h1>
          <p className="text-gray-600 dark:text-gray-400">Chia sẻ tài liệu, PowerPoint, code hoặc design của bạn đến cộng đồng</p>
        </div>

        <div className="max-w-5xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)}><X size={18} /></button>
            </div>
          )}

          <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Package size={20} className="text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Thông tin cơ bản</h2>
              </div>
            </div>
            <div className="p-8 space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Danh mục sản phẩm</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon
                    const isSelected = formData.category === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, category: cat.id as ProductForm['category'] }))}
                        className={`p-5 rounded-xl border-2 transition-all ${
                          isSelected
                            ? `bg-${cat.color}-50 dark:bg-${cat.color}-950/20 border-${cat.color}-500`
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-black'
                        }`}
                      >
                        <Icon size={32} className={`mx-auto mb-3 ${isSelected ? `text-${cat.color}-600` : 'text-gray-400'}`} />
                        <div className={`font-medium text-center ${isSelected ? `text-${cat.color}-600` : 'text-gray-700 dark:text-gray-300'}`}>
                          {cat.name}
                        </div>
                        <div className="text-xs text-gray-500 text-center mt-1">{cat.desc}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tên sản phẩm</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="VD: Premium PowerPoint Template - Tech Bundle"
                  className="w-full px-5 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mô tả ngắn</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Mô tả ngắn gọn về sản phẩm"
                  className="w-full px-5 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mô tả chi tiết</label>
                <textarea
                  name="longDescription"
                  value={formData.longDescription}
                  onChange={handleChange}
                  rows={8}
                  placeholder="Mô tả chi tiết về sản phẩm, tính năng, công dụng..."
                  className="w-full px-5 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden mt-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <ImageIcon size={20} className="text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Hình ảnh sản phẩm</h2>
              </div>
            </div>
            <div className="p-8 space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ảnh thumbnail</label>
                <div className="flex gap-4 items-center">
                  <button
                    onClick={() => thumbnailInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-5 py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-600 hover:border-blue-500 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                    {isUploading ? 'Đang tải...' : 'Tải ảnh lên'}
                  </button>
                  <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                  {formData.thumbnail && (
                    <div className="relative">
                      <img src={URL.createObjectURL(formData.thumbnail)} alt="Thumbnail" className="w-20 h-20 rounded-xl object-cover border" />
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, thumbnail: null }))}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ảnh preview (tối thiểu 1 ảnh)</label>
                <button
                  onClick={() => previewInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-5 py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-600 hover:border-blue-500 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                  {isUploading ? 'Đang tải...' : 'Thêm ảnh preview'}
                </button>
                <input ref={previewInputRef} type="file" accept="image/*" multiple onChange={handlePreviewUpload} className="hidden" />
                {formData.previewImages.length > 0 && (
                  <div className="grid grid-cols-5 gap-3 mt-4">
                    {formData.previewImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={URL.createObjectURL(img)} alt="" className="w-full h-24 object-cover rounded-lg border" />
                        <button
                          onClick={() => removePreviewImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden mt-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <DollarSign size={20} className="text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Giá bán</h2>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giá tiền (VNĐ)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price || ''}
                  onChange={handleNumberChange}
                  placeholder="299000"
                  className="w-full px-5 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <Coins size={18} className="text-yellow-500" />
                    <span className="font-medium text-gray-900 dark:text-white">Thanh toán bằng Xu</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Cho phép người dùng thanh toán bằng Xu (10 VNĐ = 1 Xu)</p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleXuPayment}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.enableXuPayment ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.enableXuPayment ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {formData.enableXuPayment && formData.price > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Coins size={18} className="text-blue-600" />
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      Quy đổi: {xuAmount.toLocaleString()} Xu
                    </span>
                  </div>
                  <p className="text-sm text-blue-500 mt-1">Người dùng có thể thanh toán bằng {xuAmount.toLocaleString()} Xu thay vì {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(formData.price)}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden mt-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <LinkIcon size={20} className="text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tải sản phẩm</h2>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL tải sản phẩm</label>
                <input
                  type="url"
                  name="downloadUrl"
                  value={formData.downloadUrl}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/... hoặc https://github.com/..."
                  className="w-full px-5 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Link Google Drive, GitHub, Dropbox, hoặc link trực tiếp</p>
              </div>

              {(formData.category === 'powerpoint' || formData.category === 'document') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL xem thử (Google Docs Preview)</label>
                  <input
                    type="url"
                    name="previewUrl"
                    value={formData.previewUrl}
                    onChange={handleChange}
                    placeholder="https://docs.google.com/presentation/d/xxx/preview"
                    className="w-full px-5 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden mt-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tính năng & Yêu cầu</h2>
              </div>
            </div>
            <div className="p-8 space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tính năng nổi bật</label>
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                    placeholder="VD: Giao diện đẹp mắt"
                    className="flex-1 px-5 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-black"
                  />
                  <button onClick={addFeature} className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                    <Plus size={20} />
                  </button>
                </div>
                {formData.features.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl mb-2">
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-blue-500" />
                      <span className="text-gray-700 dark:text-gray-300">{f}</span>
                    </div>
                    <button onClick={() => removeFeature(i)} className="text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Yêu cầu hệ thống</label>
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={requirementInput}
                    onChange={(e) => setRequirementInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                    placeholder="VD: Có kết nối Internet"
                    className="flex-1 px-5 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-black"
                  />
                  <button onClick={addRequirement} className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                    <Plus size={20} />
                  </button>
                </div>
                {formData.requirements.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-xl mb-2">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-green-500" />
                      <span className="text-gray-700 dark:text-gray-300">{r}</span>
                    </div>
                    <button onClick={() => removeRequirement(i)} className="text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#171717] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden mt-6">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Tag size={20} className="text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Thẻ tags</h2>
              </div>
            </div>
            <div className="p-8">
              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                  <Tag size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Nhập tag và nhấn Enter"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-black"
                  />
                </div>
                <button onClick={addTag} className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                  <Plus size={20} />
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm flex items-center gap-2">
                      <Tag size={12} />#{tag}
                      <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting || isUploading}
              className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
            >
              {(isSubmitting || isUploading) && <Loader2 size={20} className="animate-spin" />}
              <Save size={20} />
              {(isSubmitting || isUploading) ? 'Đang xử lý...' : 'Lưu nháp'}
            </button>
            <button
              onClick={() => handleSubmit('published')}
              disabled={isSubmitting || isUploading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
            >
              {(isSubmitting || isUploading) && <Loader2 size={20} className="animate-spin" />}
              <Eye size={20} />
              {(isSubmitting || isUploading) ? 'Đang xử lý...' : 'Đăng sản phẩm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}