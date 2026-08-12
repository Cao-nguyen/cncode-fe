'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import {
    ChevronRight, Heart, Search, HelpCircle,
    User, CreditCard, GraduationCap, Wrench, MessageSquare,
    Flame, Eye, Headphones, Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useHelpCenter } from '@/hooks/helpcenter/useHelpCenter';
import type { HelpCenterFAQ } from '@/types/helpcenter.type';
import { ImagePreviewModal } from '@/components/custom/ImagePreviewModal';
import Link from 'next/link';

const CATEGORIES = [
    { value: 'all', label: 'Tất cả', icon: Bookmark, description: 'Tất cả chủ đề' },
    { value: 'account', label: 'Tài khoản', icon: User, description: 'Quản lý tài khoản' },
    { value: 'payment', label: 'Thanh toán', icon: CreditCard, description: 'Hóa đơn, nạp tiền' },
    { value: 'course', label: 'Khóa học', icon: GraduationCap, description: 'Học tập, chứng chỉ' },
    { value: 'technical', label: 'Kỹ thuật', icon: Wrench, description: 'Lỗi & khắc phục' },
    { value: 'other', label: 'Khác', icon: MessageSquare, description: 'Các vấn đề khác' },
] as const;

const CATEGORY_BADGE: Record<string, string> = {
    account: 'bg-blue-50 text-blue-600',
    payment: 'bg-green-50 text-green-600',
    course: 'bg-orange-50 text-orange-600',
    technical: 'bg-purple-50 text-purple-600',
    other: 'bg-gray-100 text-gray-600',
};

const CATEGORY_ICON: Record<string, { bg: string; icon: typeof User }> = {
    account: { bg: 'bg-blue-500', icon: User },
    payment: { bg: 'bg-green-500', icon: CreditCard },
    course: { bg: 'bg-orange-500', icon: GraduationCap },
    technical: { bg: 'bg-purple-500', icon: Wrench },
    other: { bg: 'bg-gray-500', icon: MessageSquare },
};

type HelpCategory = (typeof CATEGORIES)[number]['value'];

function sortByPopularity(items: HelpCenterFAQ[]) {
    return [...items].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
}

function formatViewCount(count: number): string {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    return count.toLocaleString('vi-VN');
}

export default function HelpCenterPage() {
    const { token } = useAuthStore();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<HelpCategory>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [showAllFaqs, setShowAllFaqs] = useState(false);
    const [liking, setLiking] = useState<string | null>(null);
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const { faqs, loading, error, fetchFAQs, toggleHelpful, incrementView } = useHelpCenter();

    useEffect(() => {
        fetchFAQs(selectedCategory, searchTerm);
    }, [selectedCategory, searchTerm, fetchFAQs]);

    const handleSearchInputChange = (value: string) => {
        setSearchInput(value);
        if (value === '') {
            setSearchTerm('');
            setShowAllFaqs(false);
        }
    };

    const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'IMG') {
            setPreviewSrc((target as HTMLImageElement).src);
            setIsPreviewOpen(true);
        }
    };

    const handleHelpful = async (id: string) => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để đánh giá');
            return;
        }
        setLiking(id);
        const ok = await toggleHelpful(id);
        setLiking(null);
        if (!ok) toast.error('Không thể cập nhật đánh giá');
    };

    const handleSearch = () => {
        setSearchTerm(searchInput.trim());
        setShowAllFaqs(false);
    };
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSearch();
    };

    const sortedFaqs = sortByPopularity(faqs);
    const displayedFaqs = showAllFaqs ? sortedFaqs : sortedFaqs.slice(0, 3);
    const hasMoreFaqs = sortedFaqs.length > 3;

    const getCategoryLabel = (category: string) =>
        CATEGORIES.find(c => c.value === category)?.label || 'Khác';

    const handleToggleFaq = (faqId: string) => {
        const isExpanding = expandedId !== faqId;
        setExpandedId(isExpanding ? faqId : null);
        if (isExpanding) {
            void incrementView(faqId);
        }
    };

    const renderFaqRow = (faq: HelpCenterFAQ, index: number) => {
        const iconConfig = CATEGORY_ICON[faq.category] || CATEGORY_ICON.other;
        const IconComponent = iconConfig.icon;
        const isExpanded = expandedId === faq._id;

        return (
            <div key={faq._id} className={index > 0 ? 'border-t border-gray-100' : ''}>
                <button
                    onClick={() => handleToggleFaq(faq._id)}
                    className="w-full px-5 py-4 md:px-6 md:py-5 flex items-center gap-4 text-left hover:bg-gray-50/80 transition-colors"
                >
                    <div className={`w-10 h-10 rounded-full ${iconConfig.bg} flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-gray-900 text-[15px] leading-snug">
                                {faq.question}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_BADGE[faq.category] || CATEGORY_BADGE.other}`}>
                                {getCategoryLabel(faq.category)}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 whitespace-nowrap">
                            <Eye size={15} />
                            {formatViewCount(faq.views || 0)} lượt xem
                        </span>
                        <ChevronRight className={`w-5 h-5 text-gray-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                </button>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="px-5 md:px-6 pb-5 pt-0">
                                <div className="pl-14">
                                    <div
                                        onClick={handleContentClick}
                                        className="prose prose-sm max-w-none text-gray-600 prose-img:rounded-xl prose-img:cursor-zoom-in prose-headings:text-gray-900"
                                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                                    />
                                    <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => handleHelpful(faq._id)}
                                            disabled={liking === faq._id}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                faq.userLiked
                                                    ? 'text-red-500 bg-red-50 hover:bg-red-100'
                                                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                                            }`}
                                        >
                                            {liking === faq._id ? (
                                                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Heart 
                                                    size={16} 
                                                    fill={faq.userLiked ? 'currentColor' : 'none'}
                                                    data-filled={faq.userLiked}
                                                />
                                            )}
                                            <span>Hữu ích</span>
                                            {((faq.helpfulCount ?? 0) > 0) && (
                                                <span className="text-xs opacity-75">({faq.helpfulCount})</span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white pb-12">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-blue-50/20 to-white pt-10 pb-10 md:pt-14 md:pb-14">
                {/* Decorative backgrounds */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -left-6 top-8 md:left-12 md:top-10 opacity-30 md:opacity-40">
                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-xl flex items-center justify-center rotate-[-12deg]">
                            <span className="text-5xl md:text-6xl font-bold text-white/90">?</span>
                        </div>
                    </div>
                    <div className="absolute -right-4 top-6 md:right-16 md:top-8 opacity-20 md:opacity-30">
                        <Headphones className="w-32 h-32 md:w-44 md:h-44 text-blue-300" strokeWidth={1} />
                    </div>
                </div>

                <div className="relative max-w-4xl mx-auto px-4 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-blue-100 text-sm text-[var(--cn-primary)] font-medium mb-6 shadow-sm">
                        <HelpCircle size={16} />
                        Trung tâm hỗ trợ
                    </div>

                    <h1 className="text-3xl md:text-[42px] font-bold text-gray-900 mb-4 leading-tight">
                        Chúng tôi có thể{' '}
                        <span className="text-[var(--cn-primary)]">giúp gì</span>{' '}
                        cho bạn?
                    </h1>
                    <p className="text-gray-500 text-base md:text-lg mb-8 max-w-xl mx-auto">
                        Tìm câu trả lời, hướng dẫn sử dụng và giải quyết vấn đề nhanh chóng.
                    </p>

                    {/* Search bar with embedded button */}
                    <div className="max-w-2xl mx-auto">
                        <div className="relative flex items-center bg-white rounded-2xl border border-gray-200 shadow-sm focus-within:border-[var(--cn-primary)] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <Search className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => handleSearchInputChange(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Tìm kiếm câu hỏi, hướng dẫn..."
                                className="flex-1 pl-12 pr-36 py-4 bg-transparent outline-none text-base text-gray-800 placeholder:text-gray-400"
                            />
                            <button
                                onClick={handleSearch}
                                className="absolute right-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--cn-primary)] text-white text-sm font-semibold hover:bg-[var(--cn-primary-hover)] transition-colors"
                            >
                                <Search size={16} />
                                Tìm kiếm
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="max-w-6xl mx-auto px-4 mt-2 mb-10">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = selectedCategory === cat.value;
                        return (
                            <button
                                key={cat.value}
                                onClick={() => {
                                    setSelectedCategory(cat.value);
                                    setShowAllFaqs(false);
                                }}
                                className={`p-4 rounded-xl text-left transition-all border ${
                                    isActive
                                        ? 'bg-blue-50 border-[var(--cn-primary)] shadow-sm'
                                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                }`}
                            >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 ${
                                    isActive ? 'bg-[var(--cn-primary)] text-white' : 'bg-gray-100 text-gray-500'
                                }`}>
                                    <Icon size={18} />
                                </div>
                                <div className="text-sm font-semibold text-gray-900">{cat.label}</div>
                                <div className="text-xs text-gray-400 mt-0.5 leading-snug">{cat.description}</div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Popular Questions */}
            <section className="max-w-6xl mx-auto px-4 mb-10">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2.5 px-5 md:px-6 py-5 border-b border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                            <Flame className="w-[18px] h-[18px] text-orange-500" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Câu hỏi được quan tâm</h2>
                    </div>

                    {loading ? (
                        <div className="text-center py-16">
                            <div className="inline-block w-8 h-8 border-4 border-[var(--cn-primary)] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-16 px-6">
                            <HelpCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-500 mb-4">{error}</p>
                            <button
                                type="button"
                                onClick={() => fetchFAQs(selectedCategory, searchTerm)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--cn-primary)] text-white text-sm font-medium hover:bg-[var(--cn-primary-hover)] transition-colors"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : displayedFaqs.length === 0 ? (
                        <div className="text-center py-16">
                            <HelpCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-400">Không tìm thấy câu hỏi nào</p>
                        </div>
                    ) : (
                        <div>
                            {displayedFaqs.map((faq, index) => renderFaqRow(faq, index))}
                        </div>
                    )}

                    {hasMoreFaqs && !showAllFaqs && (
                        <div className="px-5 md:px-6 py-5 border-t border-gray-100 flex justify-center">
                            <button
                                onClick={() => setShowAllFaqs(true)}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-[var(--cn-primary)] hover:text-[var(--cn-primary)] transition-colors"
                            >
                                Xem tất cả câu hỏi
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Contact CTA */}
            <section className="max-w-6xl mx-auto px-4">
                <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                        {/* Illustration */}
                        <div className="flex-shrink-0 hidden sm:block">
                            <div className="relative w-28 h-28">
                                <div className="absolute inset-0 rounded-full bg-blue-100/80 flex items-center justify-center">
                                    <Headphones className="w-14 h-14 text-[var(--cn-primary)]" strokeWidth={1.5} />
                                </div>
                                <div className="absolute -top-1 -right-2 w-10 h-10 rounded-full bg-green-400 flex items-center justify-center shadow-md">
                                    <MessageSquare className="w-5 h-5 text-white" fill="white" />
                                </div>
                            </div>
                        </div>

                        {/* Text */}
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                                Vẫn chưa tìm thấy câu trả lời?
                            </h2>
                            <p className="text-gray-500 text-sm md:text-base">
                                Đội ngũ hỗ trợ của CNCode luôn sẵn sàng giúp bạn.
                            </p>
                        </div>

                        {/* Button */}
                        <div className="flex-shrink-0 text-center">
                            <Link
                                href="/chatwithadmin"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--cn-primary)] text-white font-semibold hover:bg-[var(--cn-primary-hover)] transition-colors shadow-sm"
                            >
                                <MessageSquare size={18} />
                                Liên hệ hỗ trợ
                            </Link>
                            <p className="text-xs text-[var(--cn-primary)] mt-2.5 font-medium">
                                Phản hồi trong vòng 24h
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <ImagePreviewModal
                src={previewSrc}
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
            />
        </div>
    );
}
