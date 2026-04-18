const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const paymentApi = {
  purchaseWithXu: async (productId: string, token: string) => {
    const response = await fetch(`${API_URL}/api/payments/xu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId })
    });
    return response.json();
  },

  purchaseWithPayOS: async (productId: string, token: string) => {
    const response = await fetch(`${API_URL}/api/payments/payos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId })
    });
    return response.json();
  },

  getPaymentStatus: async (paymentId: string, token: string) => {
    const response = await fetch(`${API_URL}/api/payments/status/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  verifyPayment: async (orderCode: string, token: string) => {
    const response = await fetch(`${API_URL}/api/payments/verify/${orderCode}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  getUserPurchases: async (token: string) => {
    const response = await fetch(`${API_URL}/api/payments/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};