"use client";

import React, { useState, useEffect } from 'react';
import { motion, animate } from 'framer-motion';

import Link from 'next/link';
import { Heart, ArrowRight, ShieldCheck, Gift, Sparkles, ArrowLeft, Users } from 'lucide-react';

interface StatsData {
    totalUsers: number;
    targetUsers: number;
    percentage: number;
}

const Counter = ({ value }: { value: number }) => {
    const [displayValue, setDisplayValue] = useState(0);
    useEffect(() => {
        const controls = animate(0, value, {
            duration: 2,
            onUpdate: (latest) => setDisplayValue(Math.round(latest)),
        });
        return () => controls.stop();
    }, [value]);
    return <span>{new Intl.NumberFormat('vi-VN').format(displayValue)}</span>;
};

const JourneyPage = () => {
    const [stats, setStats] = useState<StatsData>({
        totalUsers: 0,
        targetUsers: 5000,
        percentage: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/loveuser`);
                const result = await response.json();
                if (result.success && result.data) {
                    setStats({
                        totalUsers: result.data.totalUsers || 0,
                        targetUsers: result.data.targetUsers || 5000,
                        percentage: result.data.percentage || 0
                    });
                }
            } catch (error) {
                setStats({ totalUsers: 0, targetUsers: 5000, percentage: 0 });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-text-main relative overflow-x-hidden">

            {}
            <Link href="/" className="fixed top-4 left-4 md:top-6 md:left-6 z-50 group">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-border px-3 py-2 md:px-4 md:py-2.5 rounded-full shadow-md transition-all"
                >
                    <ArrowLeft size={16} className="text-primary" />
                    <span className="text-xs md:text-sm font-bold">Trang chủ</span>
                </motion.div>
            </Link>

            {}
            <section className="relative overflow-hidden pt-28 pb-16 md:pt-40 md:pb-32 px-4">
                <div className="absolute top-[-5%] left-[-10%] w-[70%] h-[40%] bg-primary-light rounded-full blur-[100px] opacity-50 -z-10" />

                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-[10px] md:text-xs font-bold text-primary bg-primary-light rounded-full border border-primary/20">
                            <Sparkles size={14} /> DỰ ÁN VÌ CỘNG ĐỒNG
                        </span>
                        <h1 className="text-4xl md:text-7xl font-extrabold mb-6 tracking-tight leading-[1.2]">
                            Hành Trình <br className="md:hidden" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Yêu Thương</span>
                        </h1>
                        <p className="text-base md:text-xl text-text-sub max-w-2xl mx-auto mb-10 px-2">
                            Mỗi người dùng đăng ký tài khoản trên nền tảng và sở hữu khóa học tính phí là bạn đã đóng góp một phần ngân sách vào quỹ hỗ trợ trẻ em nghèo và người có hoàn cảnh khó khăn.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
                            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-full font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-primary-hover transition-all">
                                Đăng ký ngay <ArrowRight size={18} />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {}
            <section className="py-12 md:py-20 px-4 bg-bg-main/40">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-border relative">
                        <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-8">
                            <div className="text-center md:text-left w-full">
                                <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-2">Hiện có</p>
                                <div className="text-4xl md:text-5xl font-black text-primary flex items-center justify-center md:justify-start gap-2">
                                    {loading ? <div className="w-20 h-10 bg-gray-100 animate-pulse rounded-lg" /> : <Counter value={stats.totalUsers} />}
                                    <span className="text-sm md:text-lg text-text-sub font-medium uppercase">Bạn đồng hành</span>
                                </div>
                            </div>
                            <div className="text-center md:text-right w-full border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0">
                                <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-2">Mục tiêu khởi động</p>
                                <div className="text-3xl md:text-5xl font-black text-text-main opacity-20">
                                    {new Intl.NumberFormat('vi-VN').format(stats.targetUsers)}
                                </div>
                            </div>
                        </div>

                        {}
                        <div className="relative h-8 md:h-10 bg-bg-section rounded-xl md:rounded-2xl p-1 shadow-inner border border-border overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(stats.percentage, 100)}%` }}
                                transition={{ duration: 2, ease: "circOut" }}
                                className="h-full bg-gradient-to-r from-primary to-blue-600 rounded-lg md:rounded-xl relative shadow-md"
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] w-full h-full animate-[shimmer_2s_infinite]" />
                            </motion.div>
                        </div>

                        {}
                        <div className="mt-4 flex justify-between text-[8px] md:text-[10px] font-bold text-text-muted px-1 uppercase tracking-tighter md:tracking-widest">
                            <span className="text-primary font-black">Bắt đầu</span>
                            <span className="hidden sm:block">1,250</span>
                            <span className={stats.percentage >= 50 ? "text-primary" : ""}>2,500</span>
                            <span className="hidden sm:block">3,750</span>
                            <span className="flex items-center gap-1 text-primary">Ra mắt <Sparkles size={10} /></span>
                        </div>

                        <p className="mt-10 text-text-sub italic font-medium text-xs md:text-sm px-4">
                            {stats.percentage >= 100
                                ? "🎉 Mục tiêu đã hoàn thành! Dự án đang chuẩn bị khởi động."
                                : '"Chúng ta không thể làm tất cả mọi thứ, nhưng mỗi người có thể làm điều gì đó."'}
                        </p>
                    </div>
                </div>
            </section>

            {}
            <section className="py-16 md:py-24 px-4 bg-white">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="relative px-4"
                    >
                        <div className="aspect-square rounded-[2rem] md:rounded-[3rem] overflow-hidden relative shadow-2xl border-[8px] md:border-[12px] border-bg-section">
                            <img
                                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80"
                                alt="Trẻ em"
                                fill
                                className="object-cover"
                            />
                        </div>
                        {}
                        <div className="absolute -bottom-4 -right-2 md:-bottom-6 md:-right-6 bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-xl border border-border flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                                <Heart fill="currentColor" size={20} />
                            </div>
                            <div>
                                <p className="text-xl md:text-2xl font-black text-text-main leading-none">20%</p>
                                <p className="text-[8px] md:text-[10px] text-text-sub font-bold uppercase">Trích quỹ</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="space-y-6 md:space-y-8 text-center lg:text-left">
                        <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                            Tri thức cho bạn, <br />
                            <span className="text-primary italic">Tương lai cho các em</span>
                        </h2>
                        <div className="grid gap-4">
                            {[
                                { icon: <ShieldCheck className="text-green-500" />, title: "Minh bạch", desc: "Công khai sao kê định kỳ." },
                                { icon: <Users className="text-blue-500" />, title: "Cộng đồng", desc: "Kết nối những trái tim tử tế." },
                                { icon: <Gift className="text-orange-500" />, title: "Thiết thực", desc: "Trao tận tay các hoàn cảnh khó khăn." }
                            ].map((item, index) => (
                                <div key={index} className="flex flex-col md:flex-row items-center md:items-start gap-4 p-5 rounded-2xl border border-border bg-white shadow-sm">
                                    <div className="shrink-0">{item.icon}</div>
                                    <div>
                                        <h4 className="font-bold text-sm md:text-base">{item.title}</h4>
                                        <p className="text-xs md:text-sm text-text-sub">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <style jsx global>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};

export default JourneyPage;
