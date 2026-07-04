import { X, Shield, UserCheck, Activity, Monitor, Smartphone, Laptop } from 'lucide-react';
import { getDeviceType } from '@/lib/utils/device';
import { getUserInitial } from '@/lib/utils/format';
import { getImageUrl } from '@/lib/utils/imageUrl';

interface OnlineUser {
    userId?: string;
    fullName: string;
    avatar?: string;
    role?: string;
    device?: string;
}

interface UsersPopupProps {
    isOpen: boolean;
    onClose: () => void;
    users: OnlineUser[];
    isConnected: boolean;
}

export default function UsersPopup({ isOpen, onClose, users, isConnected }: UsersPopupProps) {
    if (!isOpen) return null;

    const roleConfig: Record<string, { bg: string; text: string; label: string }> = {
        ADMIN: { bg: '#FEF2F2', text: '#EF4444', label: 'ADMIN' },
        TEACHER: { bg: '#E6F4FB', text: '#3BA4E8', label: 'TEACHER' },
        USER: { bg: '#F1F5F9', text: '#64748B', label: 'USER' }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col shadow-xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                            <Shield size={16} className="text-blue-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm">
                                Người dùng trực tuyến
                            </h3>
                            <p className="text-xs text-gray-400">
                                {users.length} người đang hoạt động
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={18} className="text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {users.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <UserCheck size={24} className="text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-400">Không có người dùng trực tuyến</p>
                            {!isConnected && (
                                <p className="text-xs text-red-400 mt-2">Đang kết nối lại...</p>
                            )}
                        </div>
                    ) : (
                        users.map((userItem, idx) => {
                            const roleName = (userItem.role || 'USER').toUpperCase();
                            const config = roleConfig[roleName] || roleConfig.USER;

                            return (
                                <div
                                    key={userItem.userId || idx}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all"
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                                            {userItem.avatar ? (
                                                <img
                                                    src={getImageUrl(userItem.avatar)}
                                                    alt={userItem.fullName}
                                                    width={40}
                                                    height={40}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <span className="text-base font-bold text-blue-500">
                                                    {getUserInitial(userItem.fullName)}
                                                </span>
                                            )}
                                        </div>
                                        <span
                                            className="absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white"
                                            style={{ backgroundColor: '#22C55E' }}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-semibold text-gray-800 truncate">
                                                {userItem.fullName}
                                            </p>
                                            <span
                                                className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                                                style={{ backgroundColor: config.bg, color: config.text }}
                                            >
                                                {config.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1 text-gray-400">
                                            {(() => {
                                                const deviceType = getDeviceType(userItem.device);
                                                if (deviceType === 'mobile') return <Smartphone size={12} />;
                                                if (deviceType === 'desktop') return <Monitor size={12} />;
                                                return <Laptop size={12} />;
                                            })()}
                                            <span className="text-[11px]">{userItem.device || 'Unknown'}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">
                        CNCODE ANALYTICS · DỮ LIỆU THỜI GIAN THỰC
                    </p>
                </div>
            </div>
        </div>
    );
}
