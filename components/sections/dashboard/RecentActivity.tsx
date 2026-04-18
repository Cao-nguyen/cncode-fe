import { Calendar, UserPlus, FileCheck, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface Activity {
    type: string;
    user: { name: string; email: string };
    exercise?: { title: string };
    score?: number;
    timestamp: string;
    message: string;
}

interface RecentActivityProps {
    activities: Activity[];
    loading?: boolean;
}

const getActivityIcon = (type: string) => {
    switch (type) {
        case "user_joined":
            return <UserPlus className="size-4 text-green-500" />;
        case "submission":
            return <FileCheck className="size-4 text-blue-500" />;
        default:
            return <Clock className="size-4 text-gray-500" />;
    }
};

export default function RecentActivity({ activities, loading = false }: RecentActivityProps) {
    if (loading) {
        return (
            <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-5 border border-black/5 dark:border-white/10">
                <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="size-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#1c1c1c] rounded-xl p-5 border border-black/5 dark:border-white/10">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock size={18} />
                Hoạt động gần đây
            </h3>
            <div className="space-y-4">
                {activities.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">Chưa có hoạt động nào</p>
                ) : (
                    activities.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3 pb-3 border-b border-black/5 dark:border-white/10 last:border-0">
                            <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-700 dark:text-gray-300">{activity.message}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                                    <Calendar size={10} />
                                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: vi })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}