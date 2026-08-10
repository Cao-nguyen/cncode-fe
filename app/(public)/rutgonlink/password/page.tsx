'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowRight, Sparkles, Star } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { Separator } from '@/components/ui/separator';

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Link được bảo vệ
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Link này được bảo vệ bởi mật khẩu. Hãy nhập mật khẩu để tiếp tục đến link đích.
                    </p>
                </div>

                {/* Password Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                    <div className="flex items-center justify-center mb-6 relative">
                        {/* Decorative stars */}
                        <div className="absolute top-0 left-1/4">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
                        </div>
                        <div className="absolute top-2 right-1/4">
                            <Star className="w-3 h-3 text-yellow-300 fill-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
                        </div>
                        <div className="absolute bottom-2 left-1/3">
                            <Sparkles className="w-3 h-3 text-yellow-400 fill-yellow-400 animate-pulse" style={{ animationDelay: '1s' }} />
                        </div>
                        <div className="absolute bottom-0 right-1/3">
                            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-pulse" style={{ animationDelay: '1.5s' }} />
                        </div>
                        
                        {/* Lock icon */}
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-full flex items-center justify-center shadow-lg relative z-10">
                            <Lock className="w-10 h-10 text-blue-600 dark:text-blue-300" />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <CustomInput
                            type="password"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={<Lock className="w-4 h-4" />}
                            error={error}
                            disabled={loading}
                        />

                        <CustomButton
                            type="submit"
                            variant="primary"
                            className="w-full"
                            size="large"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : (
                                <>
                                    <Lock className="w-4 h-4" />
                                    Tiếp tục truy cập
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </CustomButton>
                    </form>

                    <div className="mt-6">
                        <div className="flex items-center gap-4">
                            <Separator className="flex-1" />
                            <button
                                onClick={() => router.back()}
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap"
                            >
                                Hoặc quay lại
                            </button>
                            <Separator className="flex-1" />
                        </div>
                    </div>

                    <div className="mt-4">
                        <CustomButton
                            onClick={() => router.push('/')}
                            variant="secondary"
                            className="w-full"
                            size="large"
                        >
                            ← Về trang chủ
                        </CustomButton>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
                        <p>© 2026 CNcode. Tất cả quyền được bảo lưu.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
