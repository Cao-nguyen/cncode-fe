import { X, User, Globe, MapPin, Activity, Monitor, Smartphone, Laptop } from 'lucide-react';
import { getDeviceType } from '@/lib/utils/device';
import { formatTime } from '@/lib/utils/format';

interface GuestInfo {
    sessionId: string;
    device: string;
    ip: string;
    location: string;
    firstSeen: number;
    lastActive: number;
}

interface GuestsPopupProps {
    isOpen: boolean;
    onClose: () => void;
    guests: GuestInfo[];
}

export default function GuestsPopup({ isOpen, onClose, guests }: GuestsPopupProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-50 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center">
                            <User size={16} className="text-orange-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 text-sm">
                                Khách viếng thăm
                            </h3>
                            <p className="text-xs text-gray-400">
                                {guests.length} khách đang trực tuyến
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
                    {guests.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <User size={24} className="text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-400">Không có khách trực tuyến</p>
                        </div>
                    ) : (
                        guests.map((guest, idx) => (
                            <div
                                key={guest.sessionId || idx}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all border border-gray-100"
                            >
                                <div className="relative flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                                        <User size={18} className="text-orange-500" />
                                    </div>
                                    <span
                                        className="absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white bg-green-500"
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <p className="text-sm font-semibold text-gray-800">
                                            Khách #{idx + 1}
                                        </p>
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-orange-50 text-orange-600">
                                            GUEST
                                        </span>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                            {(() => {
                                                const deviceType = getDeviceType(guest.device);
                                                if (deviceType === 'mobile') return <Smartphone size={12} />;
                                                if (deviceType === 'desktop') return <Monitor size={12} />;
                                                return <Laptop size={12} />;
                                            })()}
                                            <span className="font-medium">Thiết bị:</span>
                                            <span className="text-gray-500">{guest.device}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                            <Globe size={12} />
                                            <span className="font-medium">IP:</span>
                                            <span className="text-gray-500 font-mono">{guest.ip}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                            <MapPin size={12} />
                                            <span className="font-medium">Vị trí:</span>
                                            <span className="text-gray-500">{guest.location}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
                                            <Activity size={10} />
                                            <span>Hoạt động: {formatTime(guest.lastActive)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">
                        CNCODE ANALYTICS · THÔNG TIN CHI TIẾT KHÁCH TRUY CẬP
                    </p>
                </div>
            </div>
        </div>
    );
}
