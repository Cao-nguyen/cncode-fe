'use client';

import { useState } from 'react';
import { Wallet, MonitorPlay, Users, DollarSign, FileCheck } from 'lucide-react';

const reasons = [
    {
        icon: Wallet,
        color: 'var(--cn-primary)',
        title: 'Khoá học giá rẻ',
        description: 'Tiết kiệm chi phí với khoá học giá rẻ và tiết kiệm chi phí di chuyển ra trung tâm'
    },
    {
        icon: MonitorPlay,
        color: '#10b981',
        title: 'Học qua video nhưng có tương tác',
        description: 'Bài học có câu hỏi tương tác sau mỗi phần học'
    },
    {
        icon: Users,
        color: '#f59e0b',
        title: 'Có cộng đồng hỗ trợ và nhiều tính năng thú vị',
        description: 'Tham gia cộng đồng ở mục diễn đàn để có thể chia sẻ kiến thức, thảo luận cùng các người dùng trên cả nước'
    },
    {
        icon: DollarSign,
        color: '#3b82f6',
        title: 'Vừa học vừa kiếm tiền trên nền tảng',
        description: 'Nhận dự án, bán tài liệu và kiếm thu nhập ngay khi còn ngồi trên ghế nhà trường'
    },
    {
        icon: FileCheck,
        color: '#ef4444',
        title: 'Học xong là có bài tập làm ngay',
        description: 'Bài tập thực tế gắn với dự án, giúp bạn xây dựng portfolio và sẵn sàng đi làm'
    }
];

export default function WhyCNcode() {
    const [active, setActive] = useState<number | null>(null);

    return (
        <div className="py-8">
            {/* Header */}
            <div className="mb-8 text-center">
                <h2
                    className="text-2xl sm:text-3xl font-bold mb-2"
                    style={{ color: 'var(--cn-text-main)' }}
                >
                    Vì sao nên chọn CNcode?
                </h2>
                <p className="text-sm" style={{ color: 'var(--cn-text-muted)' }}>
                    Chúng tôi mang đến trải nghiệm học tập hiện đại, khác biệt hoàn toàn so với phương pháp truyền thống
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {reasons.map((reason, index) => {
                    const Icon = reason.icon;
                    const isActive = active === index;

                    return (
                        <div
                            key={index}
                            className="relative rounded-xl p-5 cursor-pointer transition-all duration-200"
                            style={{
                                backgroundColor: 'var(--cn-bg-card)',
                                border: `1.5px solid ${isActive ? reason.color : 'var(--cn-border)'}`,
                            }}
                            onMouseEnter={() => setActive(index)}
                            onMouseLeave={() => setActive(null)}
                        >
                            {/* Icon hình tròn */}
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                                style={{
                                    backgroundColor: isActive ? reason.color : `${reason.color}15`
                                }}
                            >
                                <Icon
                                    size={18}
                                    style={{
                                        color: isActive ? '#fff' : reason.color
                                    }}
                                />
                            </div>

                            {/* Text */}
                            <h3
                                className="text-sm font-bold mb-1.5 leading-snug"
                                style={{ color: 'var(--cn-text-main)' }}
                            >
                                {reason.title}
                            </h3>
                            <p
                                className="text-xs leading-relaxed"
                                style={{ color: 'var(--cn-text-sub)' }}
                            >
                                {reason.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}