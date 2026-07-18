import { useState, useEffect } from 'react';
import { LinkedProduct } from '@/types/linkedProduct.type';
import { linkedProductApi } from '@/lib/api/linkedProduct.api';

export const useLinkedProducts = () => {
    const [products, setProducts] = useState<LinkedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await linkedProductApi.getPublicProducts();
            setProducts(res.products);
        } catch (err) {
            setError('Failed to fetch products');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return { products, loading, error, refetch: fetchProducts };
};
