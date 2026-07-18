import React from 'react';
import Link from 'next/link';
import { ExternalLink, ImageIcon } from 'lucide-react';
import { LinkedProduct } from '@/types/linkedProduct.type';
import { getImageUrl } from '@/lib/utils/imageUrl';

interface ProductCardProps {
    product: LinkedProduct;
    imgError?: boolean;
    onImgError?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, imgError, onImgError }) => {
    return (
        <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] overflow-hidden border border-[var(--cn-border)] hover:shadow-[var(--cn-shadow-md)] transition-all duration-300">
            <div className="relative aspect-[3/2] bg-[var(--cn-bg-section)]">
                {product.thumbnailUrl && !imgError ? (
                    <img
                        src={getImageUrl(product.thumbnailUrl)}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={onImgError}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-[var(--cn-text-muted)]" />
                    </div>
                )}
            </div>

            <div className="p-3">
                <h3 className="text-sm font-semibold text-[var(--cn-text-main)] text-center line-clamp-2 mb-3 min-h-[40px]">
                    {product.name}
                </h3>

                <Link
                    href={product.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[var(--cn-primary)] text-white rounded-[var(--cn-radius-sm)] text-xs font-medium hover:bg-[var(--cn-primary-hover)] transition-colors"
                >
                    <span>Truy cập</span>
                    <ExternalLink className="w-3 h-3" />
                </Link>
            </div>
        </div>
    );
};
