'use client';

import { Clock, Calendar, Bell, CheckCircle2 } from 'lucide-react';

interface ReminderDisplayProps {
    title: string;
    scheduledTime: string;
    isTriggered: boolean;
    triggeredAt?: string;
}

export function ReminderDisplay({ title, scheduledTime, isTriggered, triggeredAt }: ReminderDisplayProps) {
    const scheduledDate = new Date(scheduledTime);
    const now = new Date();
    const isPast = scheduledDate < now;

    return (
        <div className={`max-w-[400px] p-4 rounded-lg border-2 ${isTriggered
            ? 'bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-700'
            : isPast
                ? 'bg-orange-50 border-orange-300 dark:bg-orange-950 dark:border-orange-700'
                : 'bg-blue-50 border-blue-300 dark:bg-blue-950 dark:border-blue-700'
            }`}>
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${isTriggered
                    ? 'bg-green-200 dark:bg-green-800'
                    : isPast
                        ? 'bg-orange-200 dark:bg-orange-800'
                        : 'bg-blue-200 dark:bg-blue-800'
                    }`}>
                    {isTriggered ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                        <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-[var(--cn-text-sub)]" />
                        <span className="text-xs font-medium text-[var(--cn-text-sub)] uppercase">
                            {isTriggered ? 'Đã diễn ra' : isPast ? 'Đã qua' : 'Sự kiện sắp diễn ra'}
                        </span>
                    </div>

                    <h4 className="font-bold text-[var(--cn-text-main)] mb-2 text-lg">
                        {title}
                    </h4>

                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-[var(--cn-text-sub)]">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>
                                {scheduledDate.toLocaleString('vi-VN', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>

                        {isTriggered && triggeredAt && (
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                <span>
                                    Đã nhắc lúc {new Date(triggeredAt).toLocaleString('vi-VN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                        )}

                        {!isTriggered && !isPast && (
                            <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                                <p className="text-xs text-[var(--cn-text-sub)]">
                                    ⏰ Sẽ nhắc trong {getTimeUntil(scheduledDate)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function getTimeUntil(date: Date): string {
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff < 0) return 'đã qua';

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days} ngày ${hours % 24} giờ`;
    } else if (hours > 0) {
        return `${hours} giờ ${minutes % 60} phút`;
    } else {
        return `${minutes} phút`;
    }
}