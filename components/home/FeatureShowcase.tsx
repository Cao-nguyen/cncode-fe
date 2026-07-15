'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Briefcase, Bot, MessageSquare, HelpCircle, Share2, Users, Link2, Heart } from 'lucide-react';

const topics = [
    { icon: BookOpen, title: 'CNbooks', description: 'Thư viện số phong phú', color: '#ef4444', href: '/cnbooks' },
    { icon: Briefcase, title: 'CNjobs', description: 'Cơ hội nghề nghiệp', color: '#3b82f6', href: '/cnjobs' },
    { icon: Bot, title: 'Gia sư AI', description: 'Hỗ trợ học tập thông minh', color: '#8b5cf6', href: '/giasuai' },
    { icon: MessageSquare, title: 'Góp ý', description: 'Gửi phản hồi của bạn', color: '#f59e0b', href: '/gopy' },
    { icon: HelpCircle, title: 'Hỏi đáp', description: 'Giải đáp thắc mắc', color: '#06b6d4', href: '/faq' },
    { icon: Share2, title: 'Truyền thông chéo', description: 'Chia sẻ nội dung', color: '#a855f7', href: '/truyenthongcheo' },
    { icon: Users, title: 'Tiếp thị liên kết', description: 'Kiếm tiền online', color: '#f97316', href: '/me/affiliate' },
    { icon: Users, title: 'Mạng xã hội', description: 'Kết nối cộng đồng', color: '#ef4444', href: '/cnsocial' },
    { icon: Link2, title: 'Rút gọn link', description: 'Quản lý link hiệu quả', color: '#ec4899', href: '/rutgonlink' },
    { icon: Briefcase, title: 'Hướng nghiệp', description: 'Lộ trình phát triển', color: '#f43f5e', href: '/huongnghiep' },
    { icon: Heart, title: 'Hỗ trợ dự án', description: 'Ủng hộ sáng tạo', color: '#e11d48', href: '/hotroduan' },
];

export default function FeatureShowcase() {
    const router = useRouter();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div className="py-6 lg:py-8">
            <div className="mb-6 text-center">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2" style={{ color: 'var(--cn-text-main)' }}>
                    Tính năng nổi bật
                </h2>
                <p className="text-sm sm:text-base" style={{ color: 'var(--cn-text-muted)' }}>
                    Khám phá các tính năng đa dạng của CNcode
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 px-4">
                {topics.map((topic, index) => {
                    const Icon = topic.icon;
                    const isHovered = hoveredIndex === index;

                    return (
                        <button
                            key={`${topic.title}-${index}`}
                            className="group relative flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                            style={{
                                backgroundColor: isHovered ? topic.color : 'var(--cn-bg-card)',
                                border: `1.5px solid ${isHovered ? topic.color : 'var(--cn-border)'}`,
                            }}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onClick={() => router.push(topic.href)}
                        >
                            <Icon
                                size={18}
                                strokeWidth={2}
                                className="transition-colors duration-300"
                                style={{ color: isHovered ? '#fff' : topic.color }}
                            />
                            <span
                                className="text-sm font-medium transition-colors duration-300"
                                style={{ color: isHovered ? '#fff' : 'var(--cn-text-main)' }}
                            >
                                {topic.title}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
