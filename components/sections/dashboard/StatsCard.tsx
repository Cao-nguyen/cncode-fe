import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    trend?: number;
    color?: "blue" | "green" | "purple" | "orange";
}

const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400",
    purple: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400",
};

export default function StatsCard({ title, value, icon: Icon, trend, color = "blue" }: StatsCardProps) {
    return (
        <div className="rounded-xl bg-white dark:bg-[#1c1c1c] p-5 shadow-sm border border-black/5 dark:border-white/10">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
                    {trend !== undefined && (
                        <p className={`text-xs mt-2 ${trend >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% so với tuần trước
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );
}