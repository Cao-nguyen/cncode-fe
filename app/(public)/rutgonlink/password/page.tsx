'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';

export default function PasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const shortCode = searchParams.get('code');
    const urlError = searchParams.get('error');

    useEffect(() => {
        if (urlError === 'invalid') {
            setError('Mật khẩu không đúng, vui lòng thử lại');
        }
    }, [urlError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!password.trim()) {
            setError('Vui lòng nhập mật khẩu');
            return;
        }

        if (!shortCode) {
            setError('Link không hợp lệ');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Redirect to backend with password
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const redirectUrl = `${backendUrl}/s/${shortCode}?password=${encodeURIComponent(password)}`;
            window.location.href = redirectUrl;
        } catch (err) {
            setError('Có lỗi xảy ra, vui lòng thử lại');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            CNcode
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Nền tảng học tập & chia sẻ kiến thức
                        </p>
                    </div>

                    {/* Password Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <Lock className="w-10 h-10 text-blue-600 dark:text-blue-300" />
                            </div>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                            Link được bảo vệ
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                            Link này yêu cầu mật khẩu để truy cập. Vui lòng nhập mật khẩu để tiếp tục.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Mật khẩu
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu"
                                    className="w-full px-4 py-3 bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-lg text-[var(--cn-text-main)] placeholder:text-[var(--cn-text-muted)] focus:outline-none focus:border-[var(--cn-primary)] focus:ring-2 focus:ring-[var(--cn-primary)]/20 transition-all"
                                    disabled={loading}
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <CustomButton
                                type="submit"
                                variant="primary"
                                className="w-full"
                                size="large"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : (
                                    <>
                                        Tiếp tục
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </CustomButton>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => router.push('/')}
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                Về trang chủ
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
                        <p>© 2024 CNcode. Tất cả quyền được bảo lưu.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
