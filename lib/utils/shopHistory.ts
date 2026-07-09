// Utility để lưu trữ lịch sử mua bán trong localStorage

const SHOP_HISTORY_KEY = 'shop_history';

export interface ShopProduct {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: 'Tài liệu' | 'Bài thuyết trình' | 'Code' | 'Thiết kế' | 'Khác';
    sellerId: string;
    sellerName: string;
    images: string[];
    files: { url: string; name: string; size: number; type: string }[];
    tags: string[];
    views: number;
    purchases: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export interface ShopTransaction {
    id: string;
    productId: string;
    productName: string;
    sellerId: string;
    sellerName: string;
    buyerId: string;
    buyerName: string;
    price: number;
    timestamp: string;
}

// Get products from localStorage
export function getProducts(): ShopProduct[] {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(SHOP_HISTORY_KEY + '_products');
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error reading products:', e);
        return [];
    }
}

// Get user's products from localStorage
export function getUserProducts(userId: string): ShopProduct[] {
    const allProducts = getProducts();
    return allProducts.filter(p => p.sellerId === userId);
}

// Save products to localStorage
export function saveProducts(products: ShopProduct[]): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(SHOP_HISTORY_KEY + '_products', JSON.stringify(products));
    } catch (e) {
        console.error('Error saving products:', e);
    }
}

// Add new product to localStorage
export function addProduct(product: ShopProduct): void {
    const products = getProducts();
    products.unshift(product);
    saveProducts(products);
}

// Update product in localStorage
export function updateProduct(updatedProduct: ShopProduct): void {
    const products = getProducts();
    const index = products.findIndex(p => p._id === updatedProduct._id);
    if (index !== -1) {
        products[index] = updatedProduct;
        saveProducts(products);
    }
}

// Delete product from localStorage
export function deleteProduct(productId: string): void {
    const products = getProducts();
    const filtered = products.filter(p => p._id !== productId);
    saveProducts(filtered);
}

// Get product by ID
export function getProductById(productId: string): ShopProduct | undefined {
    const products = getProducts();
    return products.find(p => p._id === productId);
}

// Get transactions from localStorage
export function getTransactions(): ShopTransaction[] {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(SHOP_HISTORY_KEY + '_transactions');
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error reading transactions:', e);
        return [];
    }
}

// Save transactions to localStorage
export function saveTransactions(transactions: ShopTransaction[]): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(SHOP_HISTORY_KEY + '_transactions', JSON.stringify(transactions));
    } catch (e) {
        console.error('Error saving transactions:', e);
    }
}

// Add new transaction to localStorage
export function addTransaction(transaction: ShopTransaction): void {
    const transactions = getTransactions();
    transactions.unshift(transaction);
    saveTransactions(transactions);
}

// Get product by ID from history
export function getHistoryByProductId(productId: string): ShopTransaction[] {
    const transactions = getTransactions();
    return transactions.filter(t => t.productId === productId);
}