
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import { Loader2, Save, FileText, Shield, Wallet, Settings, Lock, Info } from 'lucide-react';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';

interface TabConfig {
    id: string;
    label: string;
    key: string;
    icon: React.ReactNode;
    description: string;
}

const TABS: TabConfig[] = [
    { id: 'about', label: 'Giới thiệu', key: 'gioiThieu', icon: <Info size={18} />, description: 'Giới thiệu về CNcode, sứ mệnh và tầm nhìn' },
    { id: 'warranty', label: 'Chính sách bảo hành', key: 'chinhSachBaoHanh', icon: <Shield size={18} />, description: 'Quy định và điều kiện bảo hành' },
    { id: 'payment', label: 'Hướng dẫn thanh toán', key: 'huongDanThanhToan', icon: <Wallet size={18} />, description: 'Các phương thức thanh toán và hướng dẫn' },
    { id: 'usage', label: 'Quy trình sử dụng', key: 'quyTrinhSuDung', icon: <Settings size={18} />, description: 'Hướng dẫn sử dụng các tính năng' },
    { id: 'security', label: 'An toàn bảo mật', key: 'anToanBaoMat', icon: <Lock size={18} />, description: 'Chính sách bảo mật thông tin' },
    { id: 'terms', label: 'Điều khoản sử dụng', key: 'dieuKhoanSuDung', icon: <FileText size={18} />, description: 'Điều khoản và điều kiện sử dụng dịch vụ' }
];

const settingApi = {
    getAll: async (token: string): Promise<{ success: boolean; data?: Record<string, string>; message?: string }> => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/system-settings/settings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.json();
    },
    update: async (token: string, key: string, value: string): Promise<{ success: boolean; message?: string }> => {
        const keyToEndpoint = {
            'gioiThieu': 'gioi-thieu',
            'dieuKhoanSuDung': 'dieu-khoan-su-dung',
            'anToanBaoMat': 'an-toan-bao-mat',
            'chinhSachBaoHanh': 'chinh-sach-bao-hanh',
            'huongDanThanhToan': 'huong-dan-thanh-toan',
            'quyTrinhSuDung': 'quy-trinh-su-dung'
        };
        const endpoint = keyToEndpoint[key as keyof typeof keyToEndpoint] || key;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/system-settings/settings/${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: value })
        });
        return response.json();
    }
};

export default function AdminAllSettingsPage() {
    const { token } = useAuthStore();
    const [activeTab, setActiveTab] = useState<string>('about');
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [savedTab, setSavedTab] = useState<string | null>(null);
    const editorRefs = useRef<Record<string, CustomEditorRef | null>>({});

    const activeTabRef = useRef<string>(activeTab);

    useEffect(() => {
        activeTabRef.current = activeTab;
    }, [activeTab]);

    const fetchSettings = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const result = await settingApi.getAll(token);
            if (result.success && result.data) {
                setSettings(result.data);
            }
        } catch (error) {
            console.error('Fetch settings error:', error);
            toast.error('Không thể tải cài đặt');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const currentTab = TABS.find(tab => tab.id === activeTab);
    const currentKey = currentTab?.key || '';
    const currentValue = settings[currentKey] || '';

    console.log('Debug:', { activeTab, currentKey, currentValue, settings });

    const handleSave = async () => {
        if (!token) return;

        const editor = editorRefs.current[activeTab];
        if (!editor) return;

        const content = editor.getContent();

        setSaving(true);
        try {
            const result = await settingApi.update(token, currentKey, content);
            if (result.success) {
                setSettings(prev => ({ ...prev, [currentKey]: content }));
                setSavedTab(activeTab);
                toast.success(`Đã lưu ${currentTab?.label}`);
                setTimeout(() => setSavedTab(null), 2000);
            } else {
                toast.error(result.message || 'Lưu thất bại');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
    };

    const handleEditorRef = (el: CustomEditorRef | null) => {
        if (el) {
            editorRefs.current[activeTabRef.current] = el;
            // Set content immediately when ref is set
            setTimeout(() => {
                const currentTab = TABS.find(tab => tab.id === activeTabRef.current);
                const currentKey = currentTab?.key || '';
                const currentValue = settings[currentKey] || '';
                console.log('handleEditorRef setting content:', { activeTab: activeTabRef.current, currentValue });
                el.setContent(currentValue);
            }, 100);
        }
    };

    useEffect(() => {
        const editor = editorRefs.current[activeTab];
        console.log('setContent useEffect:', { activeTab, editor, currentValue });
        if (editor) {
            setTimeout(() => {
                console.log('Calling setContent with:', currentValue);
                editor.setContent(currentValue);
            }, 200);
        }
    }, [activeTab, currentValue]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8 px-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Cài đặt chung</h1>
                <p className="text-sm text-gray-500 mt-1">Quản lý nội dung tĩnh của website</p>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-gray-200">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition border-b-2 ${activeTab === tab.id
                            ? 'text-blue-600 border-blue-600'
                            : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            {currentTab?.label}
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {currentTab?.description}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {savedTab === activeTab && (
                            <span className="text-sm text-green-600 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Đã lưu
                            </span>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition disabled:opacity-50"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    <CustomEditor
                        key={`editor-${activeTab}`}
                        ref={handleEditorRef}
                        uploading={false}
                    />
                </div>
            </div>
        </div>
    );
}
