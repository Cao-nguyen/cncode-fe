import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    label: string;
    value: number;
    icon: LucideIcon;
    color: string;
    bg: string;
    onClick?: (() => void) | null;
}

export default function StatsCard({
    label,
    value,
    icon: Icon,
    color,
    bg,
    onClick,
}: StatsCardProps) {
    const isClickable = onClick !== null && onClick !== undefined;

    return (
        <div
            onClick={onClick || undefined}
            className={`p-4 bg-white border border-gray-200 rounded-lg transition-all hover:shadow-md
            ${isClickable ? 'cursor-pointer hover:border-blue-400' : ''}`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                        {label}
                    </p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                        {new Intl.NumberFormat('vi-VN').format(value)}
                    </p>
                </div>
                <div className="p-2.5 rounded-lg" style={{ backgroundColor: bg }}>
                    <Icon size={18} style={{ color }} />
                </div>
            </div>
            {isClickable && (
                <div className="mt-2 flex items-center gap-1 text-xs text-blue-500">
                    <span>Click để xem danh sách</span>
                </div>
            )}
        </div>
    );
}
