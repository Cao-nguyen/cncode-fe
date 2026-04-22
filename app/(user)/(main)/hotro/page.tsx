// app/(user)/(none)/trungtamhotro/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, HelpCircle, Loader2 } from 'lucide-react';
import { faqApi, IFAQ } from '@/lib/api/faq.api';
import { FAQ_CATEGORIES } from '@/types/faq.type';
import { toast } from 'sonner';

export default function TrungTamHotroPage() {
    const [faqs, setFaqs] = useState<IFAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());
    const [ratingLoading, setRatingLoading] = useState<string | null>(null);
    const [ratedItems, setRatedItems] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchFAQs();
    }, [selectedCategory, searchTerm]);

    const fetchFAQs = async () => {
        setLoading(true);
        try {
            const result = await faqApi.getFAQs({
                category: selectedCategory === 'all' ? undefined : selectedCategory,
                search: searchTerm || undefined,
                limit: 100
            });
            if (result.success) {
                setFaqs(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch FAQs:', error);
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const toggleItem = (id: string) => {
        const newOpen = new Set(openItems);
        if (newOpen.has(id)) {
            newOpen.delete(id);
        } else {
            newOpen.add(id);
        }
        setOpenItems(newOpen);
    };

    const handleRate = async (id: string, helpful: boolean) => {
        const rateKey = `${id}_${helpful}`;

        // Kiểm tra đã rate chưa
        if (ratedItems.has(rateKey)) {
            toast.warning(helpful ? 'Bạn đã đánh giá hữu ích cho câu hỏi này rồi!' : 'Bạn đã đánh giá không hữu ích cho câu hỏi này rồi!');
            return;
        }

        // Nếu đã rate ngược lại, xóa rate cũ
        const oppositeKey = `${id}_${!helpful}`;
        const hadOpposite = ratedItems.has(oppositeKey);

        setRatingLoading(id);
        try {
            const result = await faqApi.rateHelpful(id, helpful);
            if (result.success) {
                setFaqs(prev => prev.map(faq =>
                    faq._id === id
                        ? { ...faq, helpful: result.data.helpful, notHelpful: result.data.notHelpful }
                        : faq
                ));

                // Cập nhật ratedItems
                const newRated = new Set(ratedItems);
                if (hadOpposite) {
                    newRated.delete(oppositeKey);
                }
                newRated.add(rateKey);
                setRatedItems(newRated);

                toast.success(helpful ? 'Cảm ơn bạn đã đánh giá!' : 'Cảm ơn bạn đã góp ý!');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setRatingLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black py-8 sm:py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8 sm:mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-950/30 rounded-full mb-4">
                        <HelpCircle size={32} className="text-blue-600" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Trung tâm hỗ trợ
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Những câu hỏi thường gặp về CNcode
                    </p>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm câu hỏi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-[#171717] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategory === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        Tất cả
                    </button>
                    {FAQ_CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategory === cat.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* FAQ List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : faqs.length === 0 ? (
                    <div className="text-center py-12">
                        <HelpCircle size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">Không tìm thấy câu hỏi nào</p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-4 text-blue-600 hover:underline"
                            >
                                Xóa tìm kiếm
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {faqs.map((faq) => (
                            <div
                                key={faq._id}
                                className="bg-white dark:bg-[#171717] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleItem(faq._id)}
                                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                                >
                                    <span className="font-medium text-gray-900 dark:text-white pr-4">
                                        {faq.question}
                                    </span>
                                    {openItems.has(faq._id) ? (
                                        <ChevronUp size={20} className="text-gray-400 flex-shrink-0" />
                                    ) : (
                                        <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
                                    )}
                                </button>

                                {openItems.has(faq._id) && (
                                    <div className="px-5 pb-5 pt-2 border-t border-gray-100 dark:border-gray-800">
                                        <div
                                            className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400"
                                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                                        />

                                        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                                            <span className="text-xs text-gray-400">Bài viết có hữu ích không?</span>
                                            <button
                                                onClick={() => handleRate(faq._id, true)}
                                                disabled={ratingLoading === faq._id}
                                                className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition disabled:opacity-50"
                                            >
                                                {ratingLoading === faq._id ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <ThumbsUp size={14} />
                                                )}
                                                <span>{faq.helpful}</span>
                                            </button>
                                            <button
                                                onClick={() => handleRate(faq._id, false)}
                                                disabled={ratingLoading === faq._id}
                                                className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition disabled:opacity-50"
                                            >
                                                {ratingLoading === faq._id ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <ThumbsDown size={14} />
                                                )}
                                                <span>{faq.notHelpful}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}