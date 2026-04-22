// components/admin/PageEditor.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Save, Eye, History, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { systemSettingsApi, IHistoryItem, ISystemSettings, IApiResponse } from '@/lib/api/system-settings.api';
import TinyMCEEditor from '@/components/common/TinyMCEEditor';

type SystemSettingField =
    | 'chinhSachBaoHanh'
    | 'huongDanThanhToan'
    | 'quyTrinhSuDung'
    | 'gioiThieu'
    | 'anToanBaoMat'
    | 'dieuKhoanSuDung';

interface PageEditorProps {
    title: string;
    field: SystemSettingField;
    apiUpdate: (content: string, token: string) => Promise<IApiResponse<ISystemSettings>>;
    previewLink: string;
}

export default function PageEditor({ title, field, apiUpdate, previewLink }: PageEditorProps) {
    const { token } = useAuthStore();
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [showHistory, setShowHistory] = useState<boolean>(false);
    const [history, setHistory] = useState<IHistoryItem[]>([]);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const fetchContent = useCallback(async () => {
        if (!token) return;
        try {
            const result = await systemSettingsApi.getSettings(token);
            if (result.success) {
                setContent(result.data[field] || '');
            }
        } catch (error) {
            console.error('Failed to fetch content:', error);
        } finally {
            setLoading(false);
        }
    }, [token, field]);

    const fetchHistory = useCallback(async () => {
        if (!token) return;
        try {
            const result = await systemSettingsApi.getHistory(token, field);
            if (result.success) {
                setHistory(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        }
    }, [token, field]);

    useEffect(() => {
        fetchContent();
        fetchHistory();
    }, [fetchContent, fetchHistory]);

    const handleSave = async () => {
        if (!token) return;
        setSaving(true);
        try {
            const result = await apiUpdate(content, token);
            if (result.success) {
                toast.success('Cập nhật thành công');
                fetchHistory();
            } else {
                toast.error(result.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header - Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">Quản lý nội dung trang</p>
                </div>
                <div className="flex gap-2 sm:gap-3">
                    <a
                        href={previewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                        <Eye size={isMobile ? 16 : 18} />
                        <span className="hidden sm:inline">Xem trước</span>
                    </a>
                    <button
                        onClick={() => setShowHistory(true)}
                        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                        <History size={isMobile ? 16 : 18} />
                        <span className="hidden sm:inline">Lịch sử</span>
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                        {saving ? <Loader2 size={isMobile ? 16 : 18} className="animate-spin" /> : <Save size={isMobile ? 16 : 18} />}
                        <span>{saving ? 'Đang lưu...' : 'Lưu'}</span>
                    </button>
                </div>
            </div>

            {/* Editor - Responsive */}
            <div className="bg-white dark:bg-[#1c1c1c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-3 sm:p-5 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Nội dung</h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Sử dụng trình soạn thảo để cập nhật nội dung</p>
                </div>
                <div className="p-3 sm:p-5">
                    <TinyMCEEditor
                        value={content}
                        onChange={setContent}
                        height={isMobile ? 400 : 500}
                        placeholder={`Nhập nội dung cho ${title.toLowerCase()}...`}
                    />
                </div>
            </div>

            {/* History Modal - Responsive */}
            {showHistory && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setShowHistory(false)}
                >
                    <div
                        className="bg-white dark:bg-[#1c1c1c] rounded-xl w-full max-w-[95%] sm:max-w-3xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white dark:bg-[#1c1c1c] p-3 sm:p-5 border-b flex justify-between items-center">
                            <h2 className="text-base sm:text-xl font-semibold">Lịch sử cập nhật</h2>
                            <button
                                onClick={() => setShowHistory(false)}
                                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                            >
                                <X size={isMobile ? 18 : 20} />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-3 sm:p-5 max-h-[calc(85vh-60px)] sm:max-h-[calc(80vh-80px)]">
                            {history.length === 0 ? (
                                <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
                                    Chưa có lịch sử cập nhật
                                </div>
                            ) : (
                                <div className="space-y-3 sm:space-y-4">
                                    {history.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2 mb-2">
                                                <div>
                                                    <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">
                                                        {item.updatedBy?.fullName || 'Unknown'}
                                                    </p>
                                                    <p className="text-[10px] sm:text-xs text-gray-500">
                                                        {new Date(item.updatedAt).toLocaleString('vi-VN')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-sm">
                                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Nội dung cũ:</p>
                                                <div
                                                    className="p-2 bg-white dark:bg-gray-900 rounded border max-h-32 overflow-y-auto text-[10px] sm:text-xs prose prose-sm dark:prose-invert max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: item.oldValue || '<em>Trống</em>' }}
                                                />
                                            </div>
                                            <div className="mt-2 sm:mt-3 text-sm">
                                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Nội dung mới:</p>
                                                <div
                                                    className="p-2 bg-white dark:bg-gray-900 rounded border max-h-32 overflow-y-auto text-[10px] sm:text-xs prose prose-sm dark:prose-invert max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: item.newValue || '<em>Trống</em>' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}