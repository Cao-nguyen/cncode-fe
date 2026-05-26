'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link'; // Thêm Link để điều hướng
import {
    Share2,
    Search,
    Target,
    BrainCircuit,
    TrendingUp,
    Layers,
    Lightbulb,
    MessageCircle,
    Clock,
    ArrowLeft // Thêm icon mũi tên trở về
} from 'lucide-react';

export default function CNsocialIntro() {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans selection:bg-blue-100">

            {/* HEADER */}
            <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    {/* Nút trở về nhỏ ở Header */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold text-sm group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        {`Trang chủ`}
                    </Link>

                    <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <Share2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">CNsocial</span>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        {`TÍNH NĂNG ĐANG PHÁT TRIỂN`}
                    </span>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
                <motion.div {...fadeIn}>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-tight mb-8">
                        {`Không chỉ phân tích.`} <br />
                        <span className="text-blue-600">{`Chúng tôi giải mã thành công.`}</span>
                    </h1>
                    <p className="max-w-4xl mx-auto text-lg md:text-xl text-slate-500 leading-relaxed font-medium">
                        {`CNsocial cho phép bạn dán link từ Fanpage Facebook, TikTok, Instagram hoặc YouTube của đối thủ để không chỉ phân tích dữ liệu mà còn bóc tách chiến lược nội dung thực tế.`}
                    </p>
                </motion.div>
            </section>

            {/* CHI TIẾT DỰ ÁN */}
            <section className="max-w-7xl mx-auto px-6 pb-32">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8">
                            <BrainCircuit className="w-16 h-16 text-blue-100 animate-pulse" />
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900 mb-8 leading-snug">
                            {`Giải mã chiến lược nội dung`}
                        </h2>

                        <div className="space-y-6">
                            <div className="flex gap-4 p-5 bg-blue-50 rounded-2xl border border-blue-100">
                                <div className="mt-1"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
                                <p className="text-sm leading-relaxed text-slate-700">
                                    {`Hệ thống tự động bóc tách Hook, cấu trúc bài viết, CTA và lý do hiệu quả của từng nội dung cụ thể.`}
                                </p>
                            </div>

                            <div className="flex gap-4 p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <div className="mt-1"><Layers className="w-5 h-5 text-emerald-600" /></div>
                                <p className="text-sm leading-relaxed text-slate-700">
                                    {`Phát hiện khoảng trống nội dung chưa ai khai thác, phân tích tâm lý người xem qua các lượt thảo luận.`}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div {...fadeIn} className="space-y-8">
                        <h3 className="text-2xl font-bold text-slate-900">
                            {`Xây dựng chiến lược riêng biệt`}
                        </h3>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            {`Dựa trên dữ liệu từ đối thủ, CNsocial đưa ra đề xuất hành động cụ thể như lịch đăng bài, ý tưởng video, caption và hashtag phù hợp nhất với thương hiệu của bạn.`}
                        </p>
                        <div className="h-px w-full bg-linear-to-r from-blue-600 to-transparent opacity-20" />
                        <p className="text-slate-500 italic">
                            {`Giúp bạn không chỉ hiểu đối thủ mà còn có thể áp dụng ngay để tạo ra kết quả thực tế nhanh chóng.`}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* GRID TÍNH NĂNG */}
            <section className="bg-white py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Box 1 */}
                        <motion.div {...fadeIn} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:shadow-lg transition-all">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg">
                                <Search className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-xl mb-4">{`Bóc tách chiến lược`}</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                {`Hiểu rõ Hook, cấu trúc và lý do vì sao một nội dung lại đạt được hiệu quả cao.`}
                            </p>
                        </motion.div>

                        {/* Box 2 */}
                        <motion.div {...fadeIn} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:shadow-lg transition-all">
                            <div className="w-12 h-12 bg-yellow-500 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg">
                                <Lightbulb className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-xl mb-4">{`Đề xuất hành động`}</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                {`Ý tưởng video, caption và hashtag được cá nhân hóa dựa trên dữ liệu thực chiến.`}
                            </p>
                        </motion.div>

                        {/* Box 3 */}
                        <motion.div {...fadeIn} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:shadow-lg transition-all">
                            <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg">
                                <Target className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-xl mb-4">{`Tìm kiếm khoảng trống`}</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                {`Phát hiện những ngách nội dung chưa ai khai thác để tạo ra hướng đi tối ưu.`}
                            </p>
                        </motion.div>

                        {/* Box 4 */}
                        <motion.div {...fadeIn} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:shadow-lg transition-all">
                            <div className="w-12 h-12 bg-pink-600 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <h4 className="font-bold text-xl mb-4">{`Phân tích tâm lý`}</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                {`Thấu hiểu người xem thông qua bình luận để bóc tách nhu cầu thực sự.`}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* QUOTE SECTION */}
            <section className="max-w-5xl mx-auto px-6 py-32 text-center">
                <motion.div {...fadeIn} className="bg-blue-600 rounded-[3rem] p-12 md:p-20 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <Layers className="w-64 h-64 -ml-20 -mt-20 rotate-12" />
                    </div>
                    <h2 className="text-2xl md:text-4xl font-bold leading-relaxed mb-8 italic relative z-10">
                        {`"Giúp người dùng không chỉ hiểu đối thủ mà còn có thể áp dụng ngay, xây dựng chiến lược riêng và nhanh chóng tạo ra kết quả thực tế."`}
                    </h2>
                    <p className="text-blue-200 font-bold uppercase tracking-[0.3em] text-xs relative z-10 mb-10">
                        {`Tầm nhìn CNsocial`}
                    </p>

                    {/* Nút quay lại trang chủ lớn ở cuối trang */}
                    <div className="relative z-10">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-50 transition-all active:scale-95"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            {`QUAY LẠI TRANG CHỦ`}
                        </Link>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}