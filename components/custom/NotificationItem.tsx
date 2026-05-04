import React from 'react';
import { Bell, Check, Clock } from 'lucide-react';

interface NotificationProps {
    title: string;
    description: string;
    time: string;
    isRead?: boolean;
    onMarkAsRead?: () => void;
}

export const NotificationItem: React.FC<NotificationProps> = ({
    title,
    description,
    time,
    isRead = false,
    onMarkAsRead,
}) => {
    return (
        <div className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!isRead ? 'bg-blue-50' : ''}`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <div className={`p-2 rounded-full ${!isRead ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Bell className={`w-4 h-4 ${!isRead ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium ${!isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400 whitespace-nowrap">
                            <Clock className="w-3 h-3" />
                            <span>{time}</span>
                        </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{description}</p>
                    {!isRead && onMarkAsRead && (
                        <button
                            onClick={onMarkAsRead}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            <Check className="w-3 h-3" />
                            Đánh dấu đã đọc
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};