'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { shortlinkApi, IShortLink } from '@/lib/api/shortlink.api';
import { toast } from 'sonner';
import { Copy, Link2, Loader2, Calendar, Trash2 } from 'lucide-react';

export default function ShortLinkPage() {
    const { token } = useAuthStore();
    const [longUrl, setLongUrl] = useState('');
    const [customSlug, setCustomSlug] = useState('');
    const [isCustom, setIsCustom] = useState(false);
    const [expiresInDays, setExpiresInDays] = useState(0);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ shortUrl: string; slug: string } | null>(null);
    const [myLinks, setMyLinks] = useState<IShortLink[]>([]);
    const [showMyLinks, setShowMyLinks] = useState(false);
    const [baseUrl, setBaseUrl] = useState('');

    useEffect(() => {
        setBaseUrl(window.location.origin);
    }, []);

    const fetchMyLinks = async () => {
        if (!token) return;
        try {
            const res = await shortlinkApi.getUserLinks(token);
            if (res.success) setMyLinks(res.data);
        } catch (error) {
            console.error('Failed to fetch links:', error);
        }
    };

    useEffect(() => {
        if (token && showMyLinks) fetchMyLinks();
    }, [token, showMyLinks]);

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

        setLoading(true);
        try {
            const res = await shortlinkApi.createShortLink(
                url,
                isCustom ? customSlug : undefined,
                expiresInDays || undefined,
                token || undefined
            );

            if (res.success) {
                setResult({
                    shortUrl: `${baseUrl}/lk/${res.data.shortCode}`,
                    slug: res.data.shortCode,
                });
                toast.success('Tạo link thành công!');
                setLongUrl('');
                setCustomSlug('');
                setExpiresInDays(0);
                if (token) fetchMyLinks();
            } else {
                toast.error(res.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            toast.error('Không thể tạo link');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        toast.success('Đã sao chép link');
    };

    const handleDeleteLink = async (slug: string) => {
        if (!token) return;
        try {
            const res = await shortlinkApi.deleteLink(slug, token);
            if (res.success) {
                toast.success('Xóa link thành công');
                fetchMyLinks();
            } else {
                toast.error(res.message || 'Xóa thất bại');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const isExpired = (expiresAt?: string) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    if (!baseUrl) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="max-w-4xl mx-auto px-5 py-12 lg:py-16">

                <div className="text-center mb-10">
                    <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        Rút gọn liên kết
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Tạo link ngắn gọn, dễ chia sẻ trong vài giây
                    </p>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 lg:p-8 mb-8">
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

                        <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={isCustom}
                                    onChange={(e) => setIsCustom(e.target.checked)}
                                    className="w-4 h-4 rounded"
                                />
                                Tùy chỉnh
                            </label>

                            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={expiresInDays > 0}
                                    onChange={(e) => setExpiresInDays(e.target.checked ? 7 : 0)}
                                    className="w-4 h-4 rounded"
                                />
                                <Calendar size={14} />
                                Hết hạn sau
                            </label>

                            {expiresInDays > 0 && (
                                <select
                                    value={expiresInDays}
                                    onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
                                    className="px-2 py-1 text-sm bg-white dark:bg-slate-800 border rounded-lg"
                                >
                                    <option value={1}>1 ngày</option>
                                    <option value={7}>7 ngày</option>
                                    <option value={30}>30 ngày</option>
                                    <option value={90}>90 ngày</option>
                                </select>
                            )}
                        </div>

                        {isCustom && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Đường dẫn tùy chỉnh
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-2.5 rounded-lg">
                                        {baseUrl}/lk/
                                    </span>
                                    <input
                                        type="text"
                                        value={customSlug}
                                        onChange={(e) => setCustomSlug(e.target.value)}
                                        placeholder="ten-cua-ban"
                                        className="flex-1 px-3 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Tạo link rút gọn'}
                        </button>
                    </form>

                    {result && (
                        <div className="mt-6 pt-6 border-t">
                            <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4">
                                <p className="text-xs font-medium text-slate-400 mb-2">Link của bạn</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 p-2.5 bg-white dark:bg-slate-900 rounded-lg text-sm text-blue-600 dark:text-blue-400 font-mono truncate border">
                                        {result.shortUrl}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(result.shortUrl)}
                                        className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition"
                                    >
                                        <Copy size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {token && (
                    <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow-xl border overflow-hidden">
                        <button
                            onClick={() => setShowMyLinks(!showMyLinks)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <Link2 size={16} className="text-white" />
                                </div>
                                <span className="font-medium">Link của tôi</span>
                                <span className="text-xs text-slate-400">({myLinks.length})</span>
                            </div>
                            <svg className={`w-4 h-4 transition-transform ${showMyLinks ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {showMyLinks && (
                            <div className="border-t">
                                {myLinks.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 text-sm">
                                        Bạn chưa có link rút gọn nào
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {myLinks.map((link) => {
                                            const expired = isExpired(link.expiresAt);
                                            return (
                                                <div key={link._id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition group">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                <a
                                                                    href={`${baseUrl}/lk/${link.slug}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline font-mono"
                                                                >
                                                                    {baseUrl}/lk/{link.slug}
                                                                </a>
                                                                {expired && (
                                                                    <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded">Hết hạn</span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-500 truncate">{link.originalUrl}</p>
                                                            <div className="flex gap-3 mt-1 text-xs text-slate-400">
                                                                <span>{link.clicks} lượt click</span>
                                                                <span>{formatDate(link.createdAt)}</span>
                                                                {link.expiresAt && !expired && (
                                                                    <span>Hết hạn: {formatDate(link.expiresAt)}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                                            <button
                                                                onClick={() => copyToClipboard(`${baseUrl}/lk/${link.slug}`)}
                                                                className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                                                            >
                                                                <Copy size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteLink(link.slug)}
                                                                className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-100"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}