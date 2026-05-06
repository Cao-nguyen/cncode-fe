// components/custom/ProductCard.tsx
'use client';

import React from 'react';
import { Star, Shield, Truck, RefreshCw, Eye, Heart, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { CustomButton } from './CustomButton';

interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    rating?: number;
    reviews?: number;
    specs?: string[];
    warranty?: string;
    shipping?: string;
    returnPolicy?: string;
    image?: string;
    discount?: number;
    isHot?: boolean;
    isNew?: boolean;
    href?: string;
    onAddToCart?: () => void;
    onWishlist?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    id,
    name,
    price,
    originalPrice,
    rating = 0,
    reviews = 0,
    specs = [],
    warranty,
    shipping,
    returnPolicy,
    image,
    discount,
    isHot = false,
    isNew = false,
    href,
    onAddToCart,
    onWishlist,
}) => {
    const discountPercent = discount || (originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

    return (
        <div className="group bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] overflow-hidden border border-[var(--cn-border)] shadow-[var(--cn-shadow-sm)] hover:shadow-[var(--cn-shadow-md)] transition-all duration-300">
            {/* Image */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                {image ? (
                    <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-700" />
                    </div>
                )}

                {/* Badges */}
                {isHot && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-orange-500 text-white text-[11px] lg:text-[13px] font-medium rounded-[var(--cn-radius-sm)]">
                        🔥 Hot
                    </span>
                )}
                {isNew && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-[11px] lg:text-[13px] font-medium rounded-[var(--cn-radius-sm)]">
                        Mới
                    </span>
                )}
                {discountPercent > 0 && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-red-500 text-white text-[11px] lg:text-[13px] font-medium rounded-[var(--cn-radius-sm)]">
                        -{discountPercent}%
                    </span>
                )}

                {/* Wishlist Button */}
                {onWishlist && (
                    <button
                        onClick={onWishlist}
                        className="absolute bottom-2 right-2 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Heart className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Rating */}
                {rating > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-[12px] lg:text-[14px] font-medium text-[var(--cn-text-main)]">{rating.toFixed(1)}</span>
                        {reviews > 0 && (
                            <span className="text-[11px] lg:text-[13px] text-[var(--cn-text-muted)]">
                                ({reviews.toLocaleString()} đánh giá)
                            </span>
                        )}
                    </div>
                )}

                {/* Title */}
                <h3 className="text-sm lg:text-base font-semibold text-[var(--cn-text-main)] mb-2 line-clamp-2 group-hover:text-[var(--cn-primary)] transition-colors">
                    {name}
                </h3>

                {/* Specs */}
                {specs.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {specs.slice(0, 2).map((spec, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 bg-[var(--cn-bg-section)] rounded text-[10px] lg:text-[12px] text-[var(--cn-text-muted)]">
                                {spec}
                            </span>
                        ))}
                        {specs.length > 2 && (
                            <span className="text-[10px] lg:text-[12px] text-[var(--cn-text-muted)]">
                                +{specs.length - 2}
                            </span>
                        )}
                    </div>
                )}

                {/* Features */}
                {(warranty || shipping || returnPolicy) && (
                    <div className="space-y-1 mb-3">
                        {warranty && (
                            <div className="flex items-center gap-1.5 text-[11px] lg:text-[13px] text-[var(--cn-text-muted)]">
                                <Shield className="w-3 h-3 text-green-600" />
                                <span>Bảo hành {warranty}</span>
                            </div>
                        )}
                        {shipping && (
                            <div className="flex items-center gap-1.5 text-[11px] lg:text-[13px] text-[var(--cn-text-muted)]">
                                <Truck className="w-3 h-3 text-blue-500" />
                                <span>{shipping}</span>
                            </div>
                        )}
                        {returnPolicy && (
                            <div className="flex items-center gap-1.5 text-[11px] lg:text-[13px] text-[var(--cn-text-muted)]">
                                <RefreshCw className="w-3 h-3 text-orange-500" />
                                <span>Đổi trả {returnPolicy}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--cn-border)]">
                    <div>
                        {originalPrice ? (
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm lg:text-base font-bold text-[var(--cn-primary)]">
                                    {price.toLocaleString()}đ
                                </span>
                                <span className="text-[12px] lg:text-[14px] text-[var(--cn-text-muted)] line-through">
                                    {originalPrice.toLocaleString()}đ
                                </span>
                            </div>
                        ) : (
                            <span className="text-sm lg:text-base font-bold text-[var(--cn-primary)]">
                                {price.toLocaleString()}đ
                            </span>
                        )}
                    </div>

                    {href ? (
                        <Link
                            href={href}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-[var(--cn-primary)] text-white rounded-[var(--cn-radius-sm)] text-[11px] lg:text-[13px] font-medium hover:bg-[var(--cn-primary-hover)] transition-colors"
                        >
                            <Eye className="w-3 h-3" />
                            <span>Xem ngay</span>
                        </Link>
                    ) : (
                        <CustomButton
                            size="small"
                            onClick={onAddToCart}
                            className="!px-2.5 !py-1.5"
                        >
                            <ShoppingCart className="w-3 h-3" />
                            <span>Mua ngay</span>
                        </CustomButton>
                    )}
                </div>
            </div>
        </div>
    );
};