'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Home, ChevronRight, Loader2, ShoppingBag } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { shopApi, Product, ShopReviewStats } from '@/lib/api/shop.api';
import { useAuthStore } from '@/store/auth.store';
import { CuaHangSoProductDetailView } from '@/components/cuahangso/CuaHangSoProductDetailView';
import { CuaHangSoPurchaseModal } from '@/components/cuahangso/CuaHangSoPurchaseModal';
import { toast } from 'sonner';

const EMPTY_REVIEW_STATS: ShopReviewStats = {
    average: 0,
    total: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

function DetailSkeleton() {
    return (
        <div className="min-h-screen pb-12 pt-16 md:pt-14 lg:pt-8" style={{ backgroundColor: 'var(--cn-bg-main)' }}>
            <div className="mx-auto max-w-7xl px-[60px]">
                <div className="mb-8 h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                <div className="grid gap-10 lg:grid-cols-2">
                    <div className="space-y-4">
                        <div className="h-8 w-3/4 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
                        <div className="h-5 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                        <div className="h-32 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
                    </div>
                    <div className="aspect-square animate-pulse rounded-3xl bg-gray-200 dark:bg-gray-800" />
                </div>
            </div>
        </div>
    );
}

export default function ProductDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const { user, checkAndSync } = useAuthStore();
    const [selectedImage, setSelectedImage] = useState(0);
    const [buying, setBuying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState<Product | null>(null);
    const [owned, setOwned] = useState(false);
    const [reviewStats, setReviewStats] = useState<ShopReviewStats>(EMPTY_REVIEW_STATS);
    const [purchaseOpen, setPurchaseOpen] = useState(false);

    useEffect(() => {
        if (!slug) return;

        const load = async () => {
            setLoading(true);
            try {
                const productRes = await shopApi.getProductBySlug(slug);
                if (productRes.success && productRes.data) {
                    setProduct(productRes.data);
                    setOwned(!!productRes.owned);
                    setSelectedImage(0);

                    const rev = await shopApi.getProductReviews(productRes.data._id, 1, 1);
                    if (rev.success && rev.stats) setReviewStats(rev.stats);
                } else {
                    setProduct(null);
                }
            } catch {
                toast.error('Không thể tải sản phẩm');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [slug]);

    const handleBuy = async () => {
        if (!product) return;
        if (!user) {
            toast.error('Vui lòng đăng nhập để mua sản phẩm');
            router.push('/login');
            return;
        }
        if (user && String(user._id) === String(product.seller?._id)) {
            toast.error('Bạn không thể mua sản phẩm của chính mình');
            return;
        }

        setBuying(true);
        try {
            const res = await shopApi.purchaseProduct(product._id);
            if (res.success && res.data?.product) {
                setProduct(res.data.product);
                setOwned(true);
                toast.success(res.message || 'Mua sản phẩm thành công');
                if (res.data.coins !== undefined) {
                    useAuthStore.setState({ coins: res.data.coins });
                    checkAndSync?.();
                }
            } else {
                toast.error(res.message || 'Không thể mua sản phẩm');
            }
        } catch {
            toast.error('Không thể kết nối máy chủ. Vui lòng thử lại.');
        } finally {
            setBuying(false);
        }
    };

    const handleOpenPurchase = () => {
        if (!product) return;
        if (!user) {
            toast.error('Vui lòng đăng nhập để mua sản phẩm');
            router.push('/login');
            return;
        }
        if (user && String(user._id) === String(product.seller?._id)) {
            toast.error('Bạn không thể mua sản phẩm của chính mình');
            return;
        }
        setPurchaseOpen(true);
    };

    const handlePurchaseSuccess = (updatedProduct: Product) => {
        setProduct(updatedProduct);
        setOwned(true);
        setPurchaseOpen(false);
    };

    if (loading) return <DetailSkeleton />;

    if (!product) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 pt-16" style={{ backgroundColor: 'var(--cn-bg-main)' }}>
                <div
                    className="flex max-w-md flex-col items-center rounded-3xl p-10 text-center"
                    style={{ backgroundColor: 'var(--cn-bg-card)', border: '1px solid var(--cn-border)' }}
                >
                    <ShoppingBag className="mb-4 h-14 w-14" style={{ color: 'var(--cn-text-muted)' }} />
                    <h1 className="text-xl font-bold" style={{ color: 'var(--cn-text-main)' }}>Không tìm thấy sản phẩm</h1>
                    <Link href="/cuahangso" className="mt-6">
                        <CustomButton variant="secondary">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại cửa hàng
                        </CustomButton>
                    </Link>
                </div>
            </div>
        );
    }

    const isSeller = !!(user && String(user._id) === String(product.seller?._id));

    return (
        <div className="min-h-screen pt-14 md:pt-12 lg:pt-6" style={{ backgroundColor: 'var(--cn-bg-main)' }}>
            <div className="mx-auto max-w-7xl px-[60px] pb-2">
                <nav className="flex flex-wrap items-center gap-2 text-xs md:text-sm" style={{ color: 'var(--cn-text-sub)' }}>
                    <Link href="/" className="flex items-center gap-1 transition hover:opacity-80">
                        <Home className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Trang chủ</span>
                    </Link>
                    <ChevronRight className="h-3 w-3 opacity-50" />
                    <Link href="/cuahangso" className="transition hover:opacity-80">
                        Cửa hàng số
                    </Link>
                    <ChevronRight className="h-3 w-3 opacity-50" />
                    <span className="line-clamp-1 font-medium" style={{ color: 'var(--cn-text-main)' }}>
                        {product.title}
                    </span>
                </nav>
            </div>

            <CuaHangSoProductDetailView
                product={product}
                owned={owned}
                isSeller={isSeller}
                buying={buying}
                reviewStats={reviewStats}
                selectedImage={selectedImage}
                onSelectImage={setSelectedImage}
                onBuy={handleBuy}
                onOpenPurchase={handleOpenPurchase}
                onReviewStatsChange={setReviewStats}
                onDownloadsChange={(downloads) =>
                    setProduct((prev) => (prev ? { ...prev, downloads } : prev))
                }
            />

            <CuaHangSoPurchaseModal
                product={product}
                open={purchaseOpen}
                onClose={() => setPurchaseOpen(false)}
                onSuccess={handlePurchaseSuccess}
            />
        </div>
    );
}
