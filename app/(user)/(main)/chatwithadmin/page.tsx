'use client';

import React from 'react';
import {
    AlertTriangle,
    Shield,
    Lock,
    MessageCircle,
    Phone,
    Mail,
    ExternalLink,
    Clock,
    Users,
    Database,
    Key
} from 'lucide-react';
import Link from 'next/link';

export default function ContactAdminPage() {
    const zaloNumber = "0394217863";
    const zaloLink = `https://zalo.me/${zaloNumber}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-12 px-6">
            <div className="max-w-4xl mx-auto">
                {}
                <div className="bg-red-600 text-white rounded-2xl p-6 mb-8 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="w-8 h-8" />
                        <h1 className="text-2xl font-black">THÔNG BÁO BẢO MẬT</h1>
                    </div>
                    <p className="text-red-100 text-sm">
                        Hệ thống chat đang được nâng cấp để đảm bảo an toàn dữ liệu người dùng
                    </p>
                </div>

                {}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                    {}
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-white">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                <Shield className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black">Liên hệ với Admin</h2>
                                <p className="text-white/80 text-sm mt-1">
                                    Để được hỗ trợ nhanh nhất
                                </p>
                            </div>
                        </div>
                    </div>

                    {}
                    <div className="p-8">
                        {}
                        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                            <div className="flex items-start gap-3">
                                <Lock className="w-5 h-5 text-yellow-600 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-yellow-800 mb-1">Lý do tạm ngưng chat trực tiếp</h3>
                                    <p className="text-sm text-yellow-700">
                                        Để đảm bảo an toàn dữ liệu người dùng và bảo mật thông tin cá nhân,
                                        chúng tôi đang nâng cấp hệ thống chat. Rất mong nhận được sự thông cảm từ quý khách hàng.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <Key className="w-5 h-5 text-blue-600" />
                                <div>
                                    <p className="text-xs text-gray-500">Mã hóa đầu cuối</p>
                                    <p className="text-sm font-medium text-gray-700">Đang được triển khai</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <Database className="w-5 h-5 text-green-600" />
                                <div>
                                    <p className="text-xs text-gray-500">Bảo mật dữ liệu</p>
                                    <p className="text-sm font-medium text-gray-700">Nâng cấp lên chuẩn mới</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <Users className="w-5 h-5 text-purple-600" />
                                <div>
                                    <p className="text-xs text-gray-500">Xác thực 2 lớp</p>
                                    <p className="text-sm font-medium text-gray-700">Sắp ra mắt</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <Clock className="w-5 h-5 text-orange-600" />
                                <div>
                                    <p className="text-xs text-gray-500">Thời gian bảo trì</p>
                                    <p className="text-sm font-medium text-gray-700">Dự kiến 7-10 ngày</p>
                                </div>
                            </div>
                        </div>

                        {}
                        <div className="text-center mb-8">
                            <div className="inline-block p-1 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl shadow-lg">
                                <a
                                    href={zaloLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 px-8 py-4 bg-white rounded-xl hover:bg-gray-50 transition-all group"
                                >
                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                        <MessageCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs text-gray-500">Liên hệ qua</p>
                                        <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            Zalo Official
                                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                        </p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {}
                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-blue-600" />
                                Thông tin liên hệ khác
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <span className="text-sm text-gray-600">Hotline hỗ trợ:</span>
                                    <a href={`tel:${zaloNumber}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                        {zaloNumber}
                                    </a>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <span className="text-sm text-gray-600">Email:</span>
                                    <a href="mailto:support@cncode.com" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                        cao343451@gmail.com
                                    </a>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <span className="text-sm text-gray-600">Thời gian hỗ trợ:</span>
                                    <span className="text-sm font-medium text-gray-700">8:00 - 22:00 (T2 - CN)</span>
                                </div>
                            </div>
                        </div>

                        {}
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                            <p className="text-xs text-blue-800 text-center">
                                <strong>Lưu ý:</strong> Khi liên hệ qua Zalo, vui lòng cung cấp email đăng ký và nội dung cần hỗ trợ
                                để admin có thể xử lý nhanh chóng nhất.
                            </p>
                        </div>

                        {}
                        <div className="mt-8 text-center">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                ← Quay lại trang chủ
                            </Link>
                        </div>
                    </div>
                </div>

                {}
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-gray-600">Bảo mật tuyệt đối</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full">
                        <Lock className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-gray-600">Mã hóa dữ liệu</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full">
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-gray-600">Hỗ trợ 24/7</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
