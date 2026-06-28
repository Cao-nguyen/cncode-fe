'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { ChevronDown, ChevronUp, Heart, Search, HelpCircle, User, CreditCard, GraduationCap, Wrench, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { helpCenterApi } from '@/lib/api/helpcenter.api';
import type { HelpCenterFAQ } from '@/types/helpcenter.type';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomButton } from '@/components/custom/CustomButton';
import { ImagePreviewModal } from '@/components/custom/ImagePreviewModal';

const CATEGORIES = [
    { value: 'all', label: 'Tất cả', icon: <HelpCircle size={16} /> },
    { value: 'account', label: 'Tài khoản', icon: <User size={16} /> },
    { value: 'payment', label: 'Thanh toán', icon: <CreditCard size={16} /> },
    { value: 'course', label: 'Khóa học', icon: <GraduationCap size={16} /> },
    { value: 'technical', label: 'Kỹ thuật', icon: <Wrench size={16} /> },
    { value: 'other', label: 'Khác', icon: <MessageSquare size={16} /> }
];

export default function HelpCenterPage() {
    const { token } = useAuthStore();
    const [faqs, setFaqs] = useState<HelpCenterFAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false); 
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [liking, setLiking] = useState<string | null>(null);

    const [previewSrc, setPreviewSrc] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchFAQs = useCallback(async () => {
        
        if (faqs.length === 0) setLoading(true);

        try {
            const result = await helpCenterApi.getFAQs(selectedCategory, searchTerm, 1, 50, token);
            if (result.success) {
                setFaqs(result.data);
            }
        } catch (error) {
            console.error('Fetch FAQs error:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, searchTerm, token, faqs.length]); 

    useEffect(() => {
        if (isMounted) fetchFAQs();
    }, [fetchFAQs, isMounted]);

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
        try {
            const result = await helpCenterApi.toggleHelpful(id);
            if (result.success) {
                setFaqs(prev => prev.map(faq =>
                    faq._id === id
                        ? { ...faq, helpfulCount: result.data.helpfulCount, userLiked: result.data.userLiked }
                        : faq
                ));
                toast.success(result.data.userLiked ? 'Cảm ơn bạn đã đánh giá!' : 'Đã bỏ đánh giá');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        } finally {
            setLiking(null);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
                        <HelpCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">Trung tâm hỗ trợ</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">Chúng tôi có thể giúp gì cho bạn?</h1>
                    <div className="max-w-md mx-auto mt-6">
                        <CustomInput
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm câu hỏi..."
                            icon={<Search size={16} />}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8 justify-center">
                    {CATEGORIES.map(cat => (
                        <CustomButton
                            key={cat.value}
                            variant={selectedCategory === cat.value ? 'primary' : 'secondary'}
                            onClick={() => setSelectedCategory(cat.value)}
                            className="flex items-center gap-1.5"
                        >
                            {cat.icon} {cat.label}
                        </CustomButton>
                    ))}
                </div>

                <div className="space-y-3 min-h-[300px] relative">
                    {loading && faqs.length === 0 ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : faqs.length === 0 ? (
                        <div className="text-center py-12">
                            <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Không tìm thấy câu hỏi nào</p>
                        </div>
                    ) : (
                        faqs.map((faq) => (
                            <motion.div
                                key={faq._id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
                            >
                                <button
                                    onClick={() => setExpandedId(expandedId === faq._id ? null : faq._id)}
                                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50"
                                >
                                    <span className="font-medium text-gray-800">{faq.question}</span>
                                    {expandedId === faq._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>

                                <AnimatePresence>
                                    {expandedId === faq._id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                        >
                                            <div className="px-5 pb-5 pt-2 border-t border-gray-100">
                                                <div
                                                    onClick={handleContentClick}
                                                    className="prose prose-sm max-w-none text-gray-600 prose-img:rounded-xl prose-img:cursor-zoom-in"
                                                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                                                />

                                                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                                                    <button
                                                        onClick={() => handleHelpful(faq._id)}
                                                        disabled={liking === faq._id}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${faq.userLiked ? 'text-red-500 bg-red-50' : 'text-gray-500'
                                                            }`}
                                                    >
                                                        {liking === faq._id ? (
                                                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <Heart
                                                                size={14}
                                                                data-filled={faq.userLiked ? "true" : "false"}
                                                                fill={faq.userLiked ? "currentColor" : "none"}
                                                            />
                                                        )}
                                                        <span>Hữu ích</span>
                                                        {faq.helpfulCount > 0 && <span className="text-xs">({faq.helpfulCount})</span>}
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    )}
                </div>

                <imgPreviewModal
                    src={previewSrc}
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                />
            </div>
        </div>
    );
}
