'use client';

import { useState } from 'react';
import { Wallet, MonitorPlay, Users, DollarSign, FileCheck } from 'lucide-react';

const reasons = [
    {
        icon: Wallet,
        color: '#3BA4E8',
        gradient: 'from-[#3BA4E8]/12 via-[#3BA4E8]/5 to-transparent',
        title: 'Khoá học giá rẻ',
        description: 'Tiết kiệm chi phí với khoá học giá rẻ và tiết kiệm chi phí di chuyển ra trung tâm',
        tag: 'Tiết kiệm',
    },
    {
        icon: MonitorPlay,
        color: '#10b981',
        gradient: 'from-[#10b981]/12 via-[#10b981]/5 to-transparent',
        title: 'Học qua video nhưng có tương tác',
        description: 'Bài học có câu hỏi tương tác sau mỗi phần học',
        tag: 'Tương tác',
    },
    {
        icon: Users,
        color: '#f59e0b',
        gradient: 'from-[#f59e0b]/12 via-[#f59e0b]/5 to-transparent',
        title: 'Cộng đồng & tính năng thú vị',
        description: 'Tham gia diễn đàn để chia sẻ kiến thức, thảo luận cùng người dùng trên cả nước',
        tag: 'Cộng đồng',
    },
    {
        icon: DollarSign,
        color: '#6366f1',
        gradient: 'from-[#6366f1]/12 via-[#6366f1]/5 to-transparent',
        title: 'Vừa học vừa kiếm tiền',
        description: 'Nhận dự án, bán tài liệu và kiếm thu nhập ngay khi còn ngồi trên ghế nhà trường',
        tag: 'Thu nhập',
    },
    {
        icon: FileCheck,
        color: '#ef4444',
        gradient: 'from-[#ef4444]/12 via-[#ef4444]/5 to-transparent',
        title: 'Học xong là có bài tập ngay',
        description: 'Bài tập thực tế gắn với dự án, giúp bạn xây dựng portfolio và sẵn sàng đi làm',
        tag: 'Thực hành',
    },
];

function ReasonCard({
    reason,
    index,
    featured = false,
    isActive,
    onHover,
    onLeave,
}: {
    reason: (typeof reasons)[number];
    index: number;
    featured?: boolean;
    isActive: boolean;
    onHover: () => void;
    onLeave: () => void;
}) {
    const Icon = reason.icon;
    const num = String(index + 1).padStart(2, '0');

    return (
        <article
            className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                featured ? 'p-6 sm:p-8 lg:min-h-[280px]' : 'p-5 sm:p-6'
            } ${isActive ? 'shadow-[var(--cn-shadow-lg)] -translate-y-0.5' : 'shadow-[var(--cn-shadow-sm)] hover:shadow-[var(--cn-shadow-md)] hover:-translate-y-0.5'}`}
            style={{
                backgroundColor: 'var(--cn-bg-card)',
                borderColor: isActive ? `${reason.color}55` : 'var(--cn-border)',
            }}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
        >
            <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80 transition-opacity duration-300 ${reason.gradient} ${isActive ? 'opacity-100' : 'group-hover:opacity-100'}`}
            />

            <div
                className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl transition-opacity duration-300"
                style={{
                    backgroundColor: reason.color,
                    opacity: isActive ? 0.18 : 0.08,
                }}
            />

            <div className="relative flex h-full flex-col">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div
                        className={`flex shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                            featured ? 'h-12 w-12' : 'h-10 w-10'
                        }`}
                        style={{
                            backgroundColor: isActive ? reason.color : `${reason.color}18`,
                            boxShadow: isActive ? `0 8px 24px ${reason.color}40` : 'none',
                        }}
                    >
                        <Icon
                            size={featured ? 22 : 18}
                            strokeWidth={1.75}
                            style={{ color: isActive ? '#fff' : reason.color }}
                        />
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                        <span
                            className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                            style={{
                                color: reason.color,
                                backgroundColor: `${reason.color}14`,
                            }}
                        >
                            {reason.tag}
                        </span>
                        <span
                            className="text-2xl font-black leading-none tracking-tighter opacity-20"
                            style={{ color: reason.color }}
                        >
                            {num}
                        </span>
                    </div>
                </div>

                <h3
                    className={`mb-2 font-bold leading-snug ${featured ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'}`}
                    style={{ color: 'var(--cn-text-main)' }}
                >
                    {reason.title}
                </h3>

                <p
                    className={`leading-relaxed ${featured ? 'text-sm sm:text-[15px]' : 'text-xs sm:text-sm'}`}
                    style={{ color: 'var(--cn-text-sub)' }}
                >
                    {reason.description}
                </p>
            </div>
        </article>
    );
}

export default function WhyCNcode() {
    const [active, setActive] = useState<number | null>(null);

    return (
        <section className="relative py-8">
            <div
                className="relative overflow-hidden rounded-3xl border px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12"
                style={{
                    backgroundColor: 'var(--cn-bg-card)',
                    borderColor: 'var(--cn-border)',
                    boxShadow: 'var(--cn-shadow-sm)',
                }}
            >
                <div
                    className="pointer-events-none absolute -left-20 top-0 h-56 w-56 rounded-full blur-3xl"
                    style={{ backgroundColor: 'var(--cn-primary-light)', opacity: 0.7 }}
                />
                <div
                    className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full blur-3xl"
                    style={{ backgroundColor: '#6366f1', opacity: 0.08 }}
                />

                <div className="relative mb-8 text-center sm:mb-10">
                    <h2
                        className="mb-3 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl"
                        style={{ color: 'var(--cn-text-main)' }}
                    >
                        Vì sao nên chọn{' '}
                        <span
                            className="bg-clip-text text-transparent"
                            style={{
                                backgroundImage: 'linear-gradient(135deg, var(--cn-primary) 0%, #6366f1 100%)',
                            }}
                        >
                            CNcode
                        </span>
                        ?
                    </h2>

                    <p
                        className="mx-auto max-w-2xl text-sm leading-relaxed sm:text-base"
                        style={{ color: 'var(--cn-text-muted)' }}
                    >
                        Chúng tôi mang đến trải nghiệm học tập hiện đại, khác biệt hoàn toàn so với phương pháp truyền thống
                    </p>
                </div>

                <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 lg:grid-rows-3">
                    <div className="lg:row-span-2">
                        <ReasonCard
                            reason={reasons[0]}
                            index={0}
                            featured
                            isActive={active === 0}
                            onHover={() => setActive(0)}
                            onLeave={() => setActive(null)}
                        />
                    </div>

                    {reasons.slice(1, 3).map((reason, i) => (
                        <ReasonCard
                            key={reason.title}
                            reason={reason}
                            index={i + 1}
                            isActive={active === i + 1}
                            onHover={() => setActive(i + 1)}
                            onLeave={() => setActive(null)}
                        />
                    ))}

                    {reasons.slice(3).map((reason, i) => (
                        <ReasonCard
                            key={reason.title}
                            reason={reason}
                            index={i + 3}
                            isActive={active === i + 3}
                            onHover={() => setActive(i + 3)}
                            onLeave={() => setActive(null)}
                        />
                    ))}
                </div>

                <div
                    className="relative mt-6 flex flex-wrap items-center justify-center gap-3 border-t pt-6 sm:mt-8 sm:gap-6 sm:pt-8"
                    style={{ borderColor: 'var(--cn-border)' }}
                >
                    {[
                        { value: 'Video + Quiz', label: 'Học tương tác' },
                        { value: 'Free & Pro', label: 'Linh hoạt chi phí' },
                        { value: '24/7', label: 'Truy cập mọi lúc' },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center px-4">
                            <div
                                className="text-sm font-black tracking-tight sm:text-base"
                                style={{ color: 'var(--cn-primary)' }}
                            >
                                {stat.value}
                            </div>
                            <div className="text-xs sm:text-sm" style={{ color: 'var(--cn-text-muted)' }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
