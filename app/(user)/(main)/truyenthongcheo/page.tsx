'use client';

import React, { useState, useEffect } from 'react';
import {
    Construction,
    Wrench,
    Clock,
    AlertCircle,
    Home,
    RefreshCw,
    Mail,
    MessageCircle,
    Shield,
    Database,
    Zap,
    Users,
    Lock,
    ChevronRight,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import Link from 'next/link';

interface MaintenanceFeature {
    name: string;
    status: 'maintenance' | 'upcoming' | 'completed';
    description: string;
    eta?: string;
}

export default function MaintenancePage() {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    const features: MaintenanceFeature[] = [
        {
            name: "Chat trực tiếp với Admin",
            status: "maintenance",
            description: "Nâng cấp hệ thống chat, bảo mật đầu cuối và mã hóa dữ liệu",
            eta: "7-10 ngày"
        },
        {
            name: "Thanh toán trực tuyến",
            status: "maintenance",
            description: "Tích hợp cổng thanh toán VNPay, Momo, ZaloPay",
            eta: "5-7 ngày"
        },
        {
            name: "Thông báo realtime",
            status: "maintenance",
            description: "Cập nhật công nghệ WebSocket mới",
            eta: "3-5 ngày"
        },
        {
            name: "Xác thực 2 lớp (2FA)",
            status: "upcoming",
            description: "Tăng cường bảo mật tài khoản người dùng",
            eta: "Sắp ra mắt"
        },
        {
            name: "API cho nhà phát triển",
            status: "upcoming",
            description: "Cung cấp API public cho bên thứ 3",
            eta: "Sắp ra mắt"
        },
        {
            name: "Giao diện mới",
            status: "completed",
            description: "Thiết kế lại giao diện người dùng",
            eta: "Đã hoàn thành"
        }
    ];

    useEffect(() => {
        // Target date for maintenance completion (example: 7 days from now)
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 7);
        targetDate.setHours(20, 0, 0, 0);

        const updateTimer = () => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000)
                });
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'maintenance':
                return <Wrench className="w-5 h-5 text-orange-500" />;
            case 'upcoming':
                return <Clock className="w-5 h-5 text-blue-500" />;
            case 'completed':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'maintenance':
                return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">Đang bảo trì</span>;
            case 'upcoming':
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Sắp ra mắt</span>;
            case 'completed':
                return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Đã hoàn thành</span>;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
                        <Construction className="w-5 h-5 text-yellow-400 animate-pulse" />
                        <span className="text-sm font-bold text-yellow-400 uppercase tracking-wider">Đang bảo trì</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
                        Tính năng đang được
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"> nâng cấp</span>
                    </h1>

                    <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                        Chúng tôi đang nỗ lực cải thiện trải nghiệm người dùng.
                        Rất mong nhận được sự thông cảm từ quý khách hàng.
                    </p>
                </div>

                {/* Countdown Timer */}
                <div className="mb-12">
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Clock className="w-5 h-5 text-blue-400" />
                            <span className="text-gray-300 text-sm font-medium">Thời gian dự kiến hoàn thành</span>
                        </div>
                        <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-black text-white bg-white/10 rounded-xl p-3">
                                    {String(timeLeft.days).padStart(2, '0')}
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Ngày</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-black text-white bg-white/10 rounded-xl p-3">
                                    {String(timeLeft.hours).padStart(2, '0')}
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Giờ</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-black text-white bg-white/10 rounded-xl p-3">
                                    {String(timeLeft.minutes).padStart(2, '0')}
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Phút</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-black text-white bg-white/10 rounded-xl p-3">
                                    {String(timeLeft.seconds).padStart(2, '0')}
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Giây</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="mb-12 bg-yellow-500/10 backdrop-blur-md rounded-xl p-6 border border-yellow-500/20">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Shield className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-yellow-400 mb-1">Lưu ý bảo mật</h3>
                            <p className="text-sm text-gray-300">
                                Trong thời gian bảo trì, chúng tôi khuyến khích người dùng không chia sẻ thông tin
                                đăng nhập với bất kỳ ai. Mọi thắc mắc vui lòng liên hệ qua kênh hỗ trợ chính thức.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                    <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-white mb-2">Cần hỗ trợ ngay?</h3>
                        <p className="text-gray-300 text-sm">
                            Đội ngũ hỗ trợ luôn sẵn sàng giải đáp thắc mắc của bạn
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="https://zalo.me/0394217863"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all group"
                        >
                            <MessageCircle className="w-5 h-5" />
                            <span className="font-medium">Chat qua Zalo</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>

                        <Link
                            href="/"
                            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                        >
                            <Home className="w-5 h-5" />
                            <span className="font-medium">Về trang chủ</span>
                        </Link>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">
                        © 2026 CNcode. Tất cả các quyền được bảo lưu.
                    </p>
                </div>
            </div>

            {/* Custom Animations */}
            <style jsx global>{`
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
}