import React from 'react';
import { Star, Shield, Truck, RefreshCw, Eye } from 'lucide-react';

interface ProductCardProps {
    name: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviews: number;
    specs: string[];
    warranty: string;
    shipping: string;
    returnPolicy: string;
    discount?: number;
    image?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    name,
    price,
    originalPrice,
    rating,
    reviews,
    specs,
    warranty,
    shipping,
    returnPolicy,
    discount,
}) => {
    const discountPercent = discount || (originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="relative p-4 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="h-48 flex items-center justify-center">
                    <div className="w-40 h-40 bg-gray-200 rounded-full"></div>
                </div>
                {discountPercent > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                        -{discountPercent}%
                    </div>
                )}
            </div>

            <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{name}</h3>

                <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium ml-1">{rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({reviews.toLocaleString()} đánh giá)</span>
                </div>

                <div className="mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                            {price.toLocaleString()}đ
                        </span>
                        {originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                                {originalPrice.toLocaleString()}đ
                            </span>
                        )}
                    </div>
                </div>

                <div className="space-y-2 mb-4">
                    {specs.map((spec, index) => (
                        <div key={index} className="text-sm text-gray-600">{spec}</div>
                    ))}
                </div>

                <div className="space-y-2 mb-5 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span>Bảo hành {warranty}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span>{shipping}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <RefreshCw className="w-4 h-4 text-orange-600" />
                        <span>Đổi trả {returnPolicy}</span>
                    </div>
                </div>

                <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium">
                    <Eye className="w-4 h-4" />
                    Xem ngay
                </button>
            </div>
        </div>
    );
};