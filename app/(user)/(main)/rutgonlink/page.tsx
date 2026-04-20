'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import { Copy, Sparkles, Link2, Check, Loader2, RefreshCw } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ShortLinkPage() {
    const { token } = useAuthStore();
    const [longUrl, setLongUrl] = useState('');
    const [customSlug, setCustomSlug] = useState('');
    const [isCustom, setIsCustom] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ shortUrl: string; slug: string } | null>(null);
    const [copied, setCopied] = useState(false);

    const generateRandomSlug = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!longUrl.trim()) {
            toast.error('Vui lòng nhập link cần rút gọn');
            return;
        }

        let url = longUrl.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        const slug = isCustom && customSlug.trim() ? customSlug.trim() : generateRandomSlug();

        if (isCustom && !/^[a-zA-Z0-9_-]+$/.test(slug)) {
            toast.error('Slug chỉ được chứa chữ cái, số, dấu gạch dưới và gạch ngang');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/shortlink/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify({ url, customSlug: slug }),
            });

            const data = await res.json();

            if (data.success) {
                setResult({
                    shortUrl: `${window.location.origin}/lk/${data.data.shortCode}`,
                    slug: data.data.shortCode,
                });
                toast.success('Tạo link thành công!');
                setLongUrl('');
                setCustomSlug('');
            } else {
                toast.error(data.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            toast.error('Không thể tạo link');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (!result) return;
        await navigator.clipboard.writeText(result.shortUrl);
        setCopied(true);
        toast.success('Đã sao chép link');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="max-w-3xl mx-auto px-5 py-12 lg:py-20">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-5">
                        <Link2 className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                        Rút gọn liên kết
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base">
                        Tạo link ngắn gọn, dễ chia sẻ trong vài giây
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 lg:p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Link gốc
                            </label>
                            <input
                                type="text"
                                value={longUrl}
                                onChange={(e) => setLongUrl(e.target.value)}
                                placeholder="https://example.com/very-long-url..."
                                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="custom"
                                    checked={isCustom}
                                    onChange={(e) => setIsCustom(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="custom" className="text-sm text-slate-700 dark:text-slate-300">
                                    Tùy chỉnh link
                                </label>
                            </div>
                            {isCustom && (
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg">
                                            {typeof window !== 'undefined' ? window.location.origin : ''}/lk/
                                        </span>
                                        <input
                                            type="text"
                                            value={customSlug}
                                            onChange={(e) => setCustomSlug(e.target.value)}
                                            placeholder="ten-cua-ban"
                                            className="flex-1 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Tạo link rút gọn
                                </>
                            )}
                        </button>
                    </form>

                    {/* Kết quả */}
                    {result && (
                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-5">
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
                                    Link của bạn
                                </p>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <Link2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                            <code className="flex-1 text-sm text-blue-600 dark:text-blue-400 font-mono truncate">
                                                {result.shortUrl}
                                            </code>
                                        </div>
                                    </div>
                                    <button
                                        onClick={copyToClipboard}
                                        className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition flex items-center gap-2 text-sm font-medium"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-4 h-4 text-green-500" />
                                                Đã sao chép
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Sao chép
                                            </>
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 mt-3">
                                    🔗 Bấm vào link sẽ chuyển hướng đến trang gốc
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Hướng dẫn */}
                <div className="mt-8 text-center text-sm text-slate-400">
                    <p>✨ Link rút gọn sẽ không bao giờ hết hạn</p>
                </div>
            </div>
        </div>
    );
}