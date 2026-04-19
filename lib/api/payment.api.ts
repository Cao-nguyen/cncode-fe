const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiResponse<T = undefined> {
  success: boolean;
  message?: string;
  data: T;
}

interface XuPurchaseResult {
  downloadUrl: string;
}

interface PayOSPurchaseResult {
  checkoutUrl: string;
  qrCode: string;
  orderCode: number;
}

interface PaymentStatusResult {
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  productName: string;
  downloadUrl: string | null;
}

interface UserPurchase {
  _id: string;
  product: { _id: string; name: string; thumbnail: string; downloadUrl: string };
  paymentMethod: 'xu' | 'banking';
  amount: number;
  status: string;
  createdAt: string;
}

interface CheckPurchasedResult {
  purchased: boolean;
  downloadUrl?: string;
  productName?: string;
}

const authHeader = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const paymentApi = {
  purchaseWithXu: async (productId: string, token: string): Promise<ApiResponse<XuPurchaseResult>> => {
    const res = await fetch(`${API_URL}/api/payments/xu`, {
      method: 'POST',
      headers: authHeader(token),
      body: JSON.stringify({ productId }),
    });
    return res.json();
  },

  purchaseWithPayOS: async (productId: string, token: string): Promise<ApiResponse<PayOSPurchaseResult>> => {
    const res = await fetch(`${API_URL}/api/payments/payos`, {
      method: 'POST',
      headers: authHeader(token),
      body: JSON.stringify({ productId }),
    });
    return res.json();
  },

  checkPaymentStatus: async (orderCode: string, token: string): Promise<ApiResponse<PaymentStatusResult>> => {
    const res = await fetch(`${API_URL}/api/payments/status/${orderCode}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  getUserPurchases: async (token: string): Promise<ApiResponse<UserPurchase[]>> => {
    const res = await fetch(`${API_URL}/api/payments/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  checkPurchased: async (productId: string, token: string): Promise<ApiResponse<CheckPurchasedResult>> => {
    const res = await fetch(`${API_URL}/api/payments/check/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};