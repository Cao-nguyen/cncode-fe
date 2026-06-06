'use client';

import { useState } from 'react';
import { Code, Braces, Globe, Palette, FileSpreadsheet, Brain, Shield, PenTool, LayoutGrid } from 'lucide-react';

const topics = [
    { icon: Code, title: 'Lập trình Python', color: '#2563eb' },
    { icon: Braces, title: 'Lập trình C/C++', color: '#6366f1' },
    { icon: Globe, title: 'Lập trình website', color: '#ea580c' },
    { icon: Palette, title: 'Thiết kế website', color: '#db2777' },
    { icon: FileSpreadsheet, title: 'Tin học văn phòng', color: '#16a34a' },
    { icon: Brain, title: 'Trí tuệ nhân tạo', color: '#dc2626' },
    { icon: Shield, title: 'An toàn thông tin', color: '#7c3aed' },
    { icon: PenTool, title: 'Thiết kế với Canva', color: '#0891b2' },
    { icon: LayoutGrid, title: 'khác', color: '#64748b' },
];

export default function TrainingTopics() {
    const [active, setActive] = useState<number | null>(null);

    return (
        <div className="py-8">
            <div className="mb-8 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--cn-text-main)' }}>
                    CNcode đào tạo những gì?
                </h2>
                <p className="text-sm" style={{ color: 'var(--cn-text-muted)' }}>
                    Hệ thống kiến thức toàn diện cho chuyển đổi số
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
                {topics.map((topic, index) => {
                    const Icon = topic.icon;
                    const isActive = active === index;

                    return (
                        <div
                            key={index}
                            className="relative rounded-xl p-5 text-center cursor-pointer transition-all duration-200 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(20%-13px)]"
                            style={{
                                backgroundColor: 'var(--cn-bg-card)',
                                border: `1.5px solid ${isActive ? topic.color : 'var(--cn-border)'}`,
                            }}
                            onMouseEnter={() => setActive(index)}
                            onMouseLeave={() => setActive(null)}
                        >
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3"
                                style={{
                                    backgroundColor: isActive ? topic.color : `${topic.color}15`
                                }}
                            >
                                <Icon
                                    size={18}
                                    strokeWidth={1.5}
                                    style={{
                                        color: isActive ? '#fff' : topic.color
                                    }}
                                />
                            </div>
                            <h3 className="text-sm font-bold" style={{ color: 'var(--cn-text-main)' }}>
                                {topic.title}
                            </h3>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}