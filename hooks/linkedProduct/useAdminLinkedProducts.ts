import { useState, useEffect } from 'react';
import { LinkedProduct, CreateLinkedProductDto, UpdateLinkedProductDto } from '@/types/linkedProduct.type';
import { linkedProductApi } from '@/lib/api/linkedProduct.api';

export const useAdminLinkedProducts = () => {
    const [products, setProducts] = useState<LinkedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await linkedProductApi.getUserProducts({ limit: 100 });
            if (res.success) {
                setProducts(res.products || []);
            } else {
                setProducts([]);
            }
        } catch (err) {
            setError('Failed to fetch products');
            console.error('Error:', err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const createProduct = async (data: CreateLinkedProductDto) => {
        setSubmitting(true);
        setError(null);
        try {
            await linkedProductApi.createProduct(data);
            await fetchProducts();
            return true;
        } catch (err) {
            setError('Failed to create product');
            console.error('Error:', err);
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const updateProduct = async (id: string, data: UpdateLinkedProductDto) => {
        setSubmitting(true);
        setError(null);
        try {
            await linkedProductApi.updateProduct(id, data);
            await fetchProducts();
            return true;
        } catch (err) {
            setError('Failed to update product');
            console.error('Error:', err);
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const deleteProduct = async (id: string) => {
        setSubmitting(true);
        setError(null);
        try {
            await linkedProductApi.deleteProduct(id);
            await fetchProducts();
            return true;
        } catch (err) {
            setError('Failed to delete product');
            console.error('Error:', err);
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return {
        products,
        loading,
        submitting,
        error,
        createProduct,
        updateProduct,
        deleteProduct,
        refetch: fetchProducts,
    };
};
