'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { shortlinkApi, IShortLink } from '@/lib/api/shortlink.api';
import { toast } from 'sonner';
import { Copy, Link2, Loader2, Calendar, Trash2, ExternalLink, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function ShortLinkPage() {
    const { token } = useAuthStore();
    const { theme } = useTheme();
    const [longUrl, setLongUrl] = useState('');
    const [customSlug, setCustomSlug] = useState('');
    const [isCustom, setIsCustom] = useState(false);
    const [expiresInDays, setExpiresInDays] = useState(0);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ shortUrl: string; slug: string } | null>(null);
    const [myLinks, setMyLinks] = useState<IShortLink[]>([]);
    const [showMyLinks, setShowMyLinks] = useState(false);
    const [baseUrl, setBaseUrl] = useState('');
    const [mounted, setMounted] = useState(false);

    // State kiểm tra slug
    const [checkingSlug, setCheckingSlug] = useState(false);
    const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
    const [slugMessage, setSlugMessage] = useState('');

    useEffect(() => {
        setMounted(true);
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

    // Kiểm tra slug trùng lặp
    const checkSlugAvailability = useCallback(async (slug: string) => {
        if (!slug || slug.length < 3) {
            setSlugAvailable(null);
            setSlugMessage('');
            return;
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
            setSlugAvailable(false);
            setSlugMessage('Chỉ được chứa chữ cái, số, dấu gạch dưới và gạch ngang');
            return;
        }

        setCheckingSlug(true);
        setSlugAvailable(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shortlink/check/${slug}`);
            const data = await res.json();

            if (data.available) {
                setSlugAvailable(true);
                setSlugMessage('Có thể sử dụng');
            } else {
                setSlugAvailable(false);
                setSlugMessage('Slug này đã được sử dụng');
            }
        } catch (error) {
            console.error('Check slug error:', error);
            setSlugAvailable(null);
            setSlugMessage('');
        } finally {
            setCheckingSlug(false);
        }
    }, []);

    // Debounce check slug
    useEffect(() => {
        if (!isCustom || !customSlug) {
            setSlugAvailable(null);
            setSlugMessage('');
            setCheckingSlug(false);
            return;
        }

        const timer = setTimeout(() => {
            checkSlugAvailability(customSlug);
        }, 500);

        return () => clearTimeout(timer);
    }, [customSlug, isCustom, checkSlugAvailability]);

    // Xác định button có bị disabled không
    const isSubmitDisabled = () => {
        if (loading) return true;
        if (!longUrl.trim()) return true;
        if (isCustom) {
            if (!customSlug) return true;
            if (checkingSlug) return true;
            if (slugAvailable !== true) return true;
        }
        return false;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isCustom && checkingSlug) {
            toast.error('Đang kiểm tra slug, vui lòng đợi');
            return;
        }

        if (isCustom && slugAvailable !== true) {
            toast.error('Vui lòng chọn slug khác');
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
                setIsCustom(false);
                setExpiresInDays(0);
                setSlugAvailable(null);
                setSlugMessage('');
                if (token) fetchMyLinks();
            } else {
                toast.error(res.message || 'Có lỗi xảy ra');
                if (res.message?.includes('slug')) {
                    setSlugAvailable(false);
                    setSlugMessage('Slug này đã được sử dụng');
                }
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

    if (!mounted || !baseUrl) {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-black dark:text-white" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-5xl">

                {/* Header */}
                <div className="text-center mb-8 sm:mb-10 lg:mb-12">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black dark:text-white mb-2">
                        Rút gọn liên kết
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-zinc-400">
                        Tạo link ngắn gọn, dễ chia sẻ trong vài giây
                    </p>
                </div>

                {/* Form tạo link */}
                <div className="bg-white dark:bg-[#171717] rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                                Link gốc
                            </label>
                            <input
                                type="text"
                                value={longUrl}
                                onChange={(e) => setLongUrl(e.target.value)}
                                placeholder="https://example.com/very-long-url..."
                                className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-black border border-gray-300 dark:border-zinc-700 rounded-xl text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm sm:text-base"
                            />
                        </div>

                        {/* Options */}
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
                                <input
                                    type="checkbox"
                                    checked={isCustom}
                                    onChange={(e) => {
                                        setIsCustom(e.target.checked);
                                        if (!e.target.checked) {
                                            setCustomSlug('');
                                            setSlugAvailable(null);
                                            setSlugMessage('');
                                            setCheckingSlug(false);
                                        }
                                    }}
                                    className="w-4 h-4 rounded bg-white dark:bg-black border-gray-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500"
                                />
                                Tùy chỉnh
                            </label>

                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
                                <input
                                    type="checkbox"
                                    checked={expiresInDays > 0}
                                    onChange={(e) => setExpiresInDays(e.target.checked ? 7 : 0)}
                                    className="w-4 h-4 rounded bg-white dark:bg-black border-gray-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500"
                                />
                                <Calendar size={14} />
                                Hết hạn sau
                            </label>

                            {expiresInDays > 0 && (
                                <select
                                    value={expiresInDays}
                                    onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
                                    className="px-3 py-1.5 text-sm bg-white dark:bg-black border border-gray-300 dark:border-zinc-700 rounded-lg text-black dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={1}>1 ngày</option>
                                    <option value={7}>7 ngày</option>
                                    <option value={30}>30 ngày</option>
                                    <option value={90}>90 ngày</option>
                                </select>
                            )}
                        </div>

                        {/* Custom slug với kiểm tra */}
                        {isCustom && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                                    Đường dẫn tùy chỉnh
                                </label>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <span className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-900 px-3 py-2 sm:py-2.5 rounded-lg text-center sm:text-left border border-gray-200 dark:border-zinc-800">
                                        {baseUrl}/lk/
                                    </span>
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={customSlug}
                                            onChange={(e) => setCustomSlug(e.target.value.toLowerCase())}
                                            placeholder="ten-cua-ban"
                                            className={`w-full px-3 py-2 sm:py-2.5 bg-white dark:bg-black border rounded-lg text-black dark:text-white text-sm focus:ring-2 focus:ring-blue-500 transition ${slugAvailable === true
                                                ? 'border-green-500 pr-10'
                                                : slugAvailable === false
                                                    ? 'border-red-500 pr-10'
                                                    : 'border-gray-300 dark:border-zinc-700'
                                                }`}
                                        />
                                        {/* Icon kiểm tra */}
                                        {checkingSlug && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <Loader2 size={16} className="animate-spin text-gray-400 dark:text-zinc-500" />
                                            </div>
                                        )}
                                        {!checkingSlug && slugAvailable === true && customSlug && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <CheckCircle size={16} className="text-green-500" />
                                            </div>
                                        )}
                                        {!checkingSlug && slugAvailable === false && customSlug && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <XCircle size={16} className="text-red-500" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Message */}
                                {slugMessage && (
                                    <p className={`text-xs mt-1 ${slugAvailable ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                                        {slugMessage}
                                    </p>
                                )}
                                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                                    Chỉ được chứa chữ cái, số, dấu gạch dưới và gạch ngang (tối thiểu 3 ký tự)
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitDisabled()}
                            className={`w-full py-2.5 sm:py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl transition text-sm sm:text-base ${isSubmitDisabled()
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-gray-800 dark:hover:bg-gray-100'
                                }`}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto text-white dark:text-black" />
                            ) : (
                                'Tạo link rút gọn'
                            )}
                        </button>
                    </form>

                    {/* Kết quả */}
                    {result && (
                        <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-gray-200 dark:border-zinc-800">
                            <div className="bg-gray-50 dark:bg-black rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-zinc-800">
                                <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 mb-2">Link của bạn</p>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <code className="flex-1 p-2.5 bg-white dark:bg-[#171717] rounded-lg text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-mono truncate border border-gray-200 dark:border-zinc-700 overflow-x-auto">
                                        {result.shortUrl}
                                    </code>
                                    <button
                                        onClick={() => copyToClipboard(result.shortUrl)}
                                        className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition flex items-center justify-center gap-2 text-sm font-medium"
                                    >
                                        <Copy size={16} />
                                        <span className="hidden sm:inline">Sao chép</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Link của tôi */}
                {token && (
                    <div className="bg-white dark:bg-[#171717] rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                        <button
                            onClick={() => setShowMyLinks(!showMyLinks)}
                            className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                        >
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-black dark:bg-white rounded-xl flex items-center justify-center">
                                    <Link2 size={14} className="sm:w-4 sm:h-4 text-white dark:text-black" />
                                </div>
                                <span className="font-medium text-sm sm:text-base text-black dark:text-white">Link của tôi</span>
                                <span className="text-xs text-gray-400 dark:text-zinc-500">({myLinks.length})</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-zinc-500 transition-transform ${showMyLinks ? 'rotate-180' : ''}`} />
                        </button>

                        {showMyLinks && (
                            <div className="border-t border-gray-200 dark:border-zinc-800">
                                {myLinks.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 dark:text-zinc-500 text-sm">
                                        Bạn chưa có link rút gọn nào
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-200 dark:divide-zinc-800">
                                        {myLinks.map((link) => {
                                            const expired = isExpired(link.expiresAt);
                                            return (
                                                <div key={link._id} className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition group">
                                                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                <a
                                                                    href={`${baseUrl}/lk/${link.slug}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline font-mono break-all"
                                                                >
                                                                    {baseUrl}/lk/{link.slug}
                                                                </a>
                                                                {expired && (
                                                                    <span className="text-xs px-1.5 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded whitespace-nowrap">
                                                                        Hết hạn
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 dark:text-zinc-500 truncate">{link.originalUrl}</p>
                                                            <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400 dark:text-zinc-500">
                                                                <span>{link.clicks} lượt click</span>
                                                                <span>{formatDate(link.createdAt)}</span>
                                                                {link.expiresAt && !expired && (
                                                                    <span>Hết hạn: {formatDate(link.expiresAt)}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition">
                                                            <button
                                                                onClick={() => copyToClipboard(`${baseUrl}/lk/${link.slug}`)}
                                                                className="p-1.5 text-gray-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
                                                                title="Sao chép"
                                                            >
                                                                <Copy size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteLink(link.slug)}
                                                                className="p-1.5 text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
                                                                title="Xóa"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                            <a
                                                                href={`${baseUrl}/lk/${link.slug}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1.5 text-gray-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
                                                                title="Mở"
                                                            >
                                                                <ExternalLink size={16} />
                                                            </a>
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