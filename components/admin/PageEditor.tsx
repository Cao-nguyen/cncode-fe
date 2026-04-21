// components/admin/PageEditor.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Save, Eye, History, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { systemSettingsApi, IHistoryItem, ISystemSettings, IApiResponse } from '@/lib/api/system-settings.api';
import TinyMCEEditor from '@/components/common/TinyMCEEditor';

// Cập nhật type cho field - THÊM 2 FIELD MỚI
type SystemSettingField =
    | 'chinhSachBaoHanh'
    | 'huongDanThanhToan'
    | 'quyTrinhSuDung'
    | 'gioiThieu'
    | 'anToanBaoMat'      // ✅ Thêm
    | 'dieuKhoanSuDung';   // ✅ Thêm

interface PageEditorProps {
    title: string;
    field: SystemSettingField;  // Sử dụng type mới
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
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Quản lý nội dung trang</p>
                </div>
                <div className="flex gap-3">
                    <a
                        href={previewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                        <Eye size={18} />
                        Xem trước
                    </a>
                    <button
                        onClick={() => setShowHistory(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                        <History size={18} />
                        Lịch sử
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>

            {/* Editor */}
            <div className="bg-white dark:bg-[#1c1c1c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nội dung</h2>
                    <p className="text-sm text-gray-500 mt-1">Sử dụng trình soạn thảo để cập nhật nội dung</p>
                </div>
                <div className="p-5">
                    <TinyMCEEditor
                        value={content}
                        onChange={setContent}
                        height={500}
                        placeholder={`Nhập nội dung cho ${title.toLowerCase()}...`}
                    />
                </div>
            </div>

            {/* History Modal */}
            {showHistory && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    onClick={() => setShowHistory(false)}
                >
                    <div
                        className="bg-white dark:bg-[#1c1c1c] rounded-xl w-full max-w-3xl max-h-[80vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white dark:bg-[#1c1c1c] p-5 border-b flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Lịch sử cập nhật</h2>
                            <button
                                onClick={() => setShowHistory(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-5 max-h-[calc(80vh-80px)]">
                            {history.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    Chưa có lịch sử cập nhật
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {history.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {item.updatedBy?.fullName || 'Unknown'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(item.updatedAt).toLocaleString('vi-VN')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-sm">
                                                <p className="text-gray-600 dark:text-gray-400 mb-1">Nội dung cũ:</p>
                                                <div
                                                    className="p-2 bg-white dark:bg-gray-900 rounded border max-h-32 overflow-y-auto text-xs prose prose-sm dark:prose-invert max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: item.oldValue || '<em>Trống</em>' }}
                                                />
                                            </div>
                                            <div className="mt-3 text-sm">
                                                <p className="text-gray-600 dark:text-gray-400 mb-1">Nội dung mới:</p>
                                                <div
                                                    className="p-2 bg-white dark:bg-gray-900 rounded border max-h-32 overflow-y-auto text-xs prose prose-sm dark:prose-invert max-w-none"
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