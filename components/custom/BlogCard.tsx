import React from 'react';
import { Clock, User, ArrowRight } from 'lucide-react';

interface BlogCardProps {
    title: string;
    description: string;
    author: string;
    date: string;
    readTime: string;
    category: string;
    image?: string;
    onReadMore?: () => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({
    title,
    description,
    author,
    date,
    readTime,
    category,
    onReadMore,
}) => {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group">
            <div className="relative h-48 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 group-hover:scale-105 transition-transform duration-300"></div>
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                    {category}
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                    {title}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-3">
                    {description}
                </p>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{readTime} phút đọc</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-400">{date}</span>
                    <button
                        onClick={onReadMore}
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
                    >
                        Xem chi tiết
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};