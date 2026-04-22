import { IDigitalProduct, ICreateProduct } from '@/types/digital-product.type'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const digitalProductApi = {
  getProducts: async (params?: { category?: string; search?: string; sort?: string }) => {
    const query = new URLSearchParams(params).toString()
    const response = await fetch(`${API_URL}/api/digital-products?${query}`)
    return response.json()
  },

  getProductBySlug: async (slug: string) => {
    const response = await fetch(`${API_URL}/api/digital-products/${slug}`)
    return response.json()
  },


  getProductById: async (id: string, token: string) => {
    const response = await fetch(`${API_URL}/api/digital-products/product/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  },

  createProduct: async (data: ICreateProduct, token: string) => {
    const response = await fetch(`${API_URL}/api/digital-products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  getUserProducts: async (token: string) => {
    const response = await fetch(`${API_URL}/api/digital-products/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.json()
  },


  updateProduct: async (id: string, data: Partial<ICreateProduct>, token: string) => {
    const response = await fetch(`${API_URL}/api/digital-products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  deleteProduct: async (id: string, token: string) => {
    const response = await fetch(`${API_URL}/api/digital-products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  getReviews: async (productId: string) => {
    const res = await fetch(`${API_URL}/api/digital-products/${productId}/reviews`);
    return res.json();
  },

  submitReview: async (productId: string, data: { rating: number; comment: string }, token: string) => {
    const res = await fetch(`${API_URL}/api/digital-products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  uploadImage: async (file: File, token: string): Promise<{ success: boolean; url: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return response.json();
  },
}