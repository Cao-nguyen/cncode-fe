import React from 'react';
import { Clock, Users, Eye } from 'lucide-react';

interface CourseCardProps {
    title: string;
    description: string;
    duration: string;
    students: number;
    price?: number;
    originalPrice?: number;
    discount?: number;
    instructor: string;
    date: string;
    isFree?: boolean;
    isVip?: boolean;
    image?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({
    title,
    description,
    duration,
    students,
    price,
    originalPrice,
    discount,
    instructor,
    date,
    isFree = false,
    isVip = false,
}) => {
    const discountPercent = discount || (originalPrice && price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="relative">
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                {discountPercent > 0 && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                        -{discountPercent}%
                    </div>
                )}
                {isFree && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                        MIỄN PHÍ
                    </div>
                )}
                {isVip && !isFree && (
                    <div className="absolute top-4 left-4 bg-yellow-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                        VIP
                    </div>
                )}
            </div>

            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{students.toLocaleString()} học viên</span>
                    </div>
                </div>

                <div className="mb-4">
                    {price !== undefined && (
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-900">
                                {price.toLocaleString()}₫
                            </span>
                            {originalPrice && (
                                <span className="text-sm text-gray-400 line-through">
                                    {originalPrice.toLocaleString()}₫
                                </span>
                            )}
                        </div>
                    )}
                    {isFree && <span className="text-2xl font-bold text-green-600">MIỄN PHÍ</span>}
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600 mb-1">{instructor}</p>
                    <p className="text-xs text-gray-400">Đăng ngày {date}</p>
                </div>

                <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    Xem chi tiết
                </button>
            </div>
        </div>
    );
};