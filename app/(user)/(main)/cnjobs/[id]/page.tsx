'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import {
    ArrowLeft, Building2, Sparkles, MapPin, DollarSign, Clock, Eye,
    Users, Mail, Phone, MessageCircle, Share2, Bookmark, Flag,
    Calendar, Briefcase, Edit, Trash2
} from 'lucide-react';
import { CNJob } from '@/types/cnjobs.type';
import { cnjobsStorage } from '@/lib/utils/cnjobsStorage';
import { CustomButton } from '@/components/custom/CustomButton';
import { useAuthStore } from '@/store/auth.store';

export default function JobDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuthStore();
    const [job, setJob] = useState<CNJob | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const jobId = params.id as string;
        const foundJob = cnjobsStorage.getJobById(jobId);

        if (foundJob) {
            // Increment view count
            cnjobsStorage.incrementViews(jobId);
            setJob(foundJob);
        }

        setLoading(false);
    }, [params.id]);

    const handleDelete = () => {
        if (!job) return;

        if (confirm('Bạn có chắc muốn xóa bài đăng này?')) {
            cnjobsStorage.deleteJob(job.id);
            router.push('/cnjobs');
        }
    };

    const handleApply = () => {
        if (!job) return;

        if (!user) {
            alert('Vui lòng đăng nhập để ứng tuyển');
            return;
        }

        cnjobsStorage.incrementApplications(job.id);
        alert('Đã ghi nhận! Vui lòng liên hệ trực tiếp theo thông tin bên dưới.');
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: job?.title,
                text: job?.description,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Đã copy link!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Không tìm thấy bài đăng
                    </h2>
                    <CustomButton onClick={() => router.push('/cnjobs')}>
                        Quay lại danh sách
                    </CustomButton>
                </div>
            </div>
        );
    }

    const isRecruitment = job.type === 'recruitment';
    const isOwner = user && user._id === job.postedBy.userId;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Quay lại
                    </button>

                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${isRecruitment
                                ? 'bg-blue-100 dark:bg-blue-900'
                                : 'bg-purple-100 dark:bg-purple-900'
                                }`}>
                                {isRecruitment ? (
                                    <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                                ) : (
                                    <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-300" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${isRecruitment
                                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                        : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                                        }`}>
                                        {isRecruitment ? 'Tuyển dụng' : 'Bán kỹ năng'}
                                    </span>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    {job.title}
                                </h1>
                                <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                                    <span className="flex items-center gap-2">
                                        {isRecruitment ? (
                                            <>
                                                <Building2 className="w-4 h-4" />
                                                {job.company || 'Chưa cập nhật'}
                                            </>
                                        ) : (
                                            <>
                                                <Users className="w-4 h-4" />
                                                {job.sellerName || job.postedBy.username}
                                            </>
                                        )}
                                    </span>
                                    {job.location && (
                                        <span className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            {job.location}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleShare}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                title="Chia sẻ"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                            {isOwner && (
                                <>
                                    <button
                                        onClick={() => router.push(`/cnjobs/${job.id}/edit`)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                        title="Chỉnh sửa"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg"
                                        title="Xóa"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Salary/Price */}
                        {(isRecruitment ? job.salary : job.price) && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="w-6 h-6 text-green-500" />
                                    <div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {isRecruitment ? 'Mức lương' : 'Giá dịch vụ'}
                                        </div>
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {isRecruitment ? job.salary : job.price}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Mô tả chi tiết
                            </h2>
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                    {job.description}
                                </p>
                            </div>
                        </div>

                        {/* Requirements/Skills */}
                        {((isRecruitment && job.requirements && job.requirements.length > 0) ||
                            (!isRecruitment && job.skills && job.skills.length > 0)) && (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        {isRecruitment ? 'Yêu cầu' : 'Kỹ năng'}
                                    </h2>
                                    <ul className="space-y-2">
                                        {(isRecruitment ? job.requirements : job.skills)?.map((item, index) => (
                                            <li key={index} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                        {/* Tags */}
                        {job.tags.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Tags
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {job.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Apply/Contact Button */}
                        {!isOwner && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                                <CustomButton
                                    onClick={handleApply}
                                    className="w-full"
                                >
                                    {isRecruitment ? 'Ứng tuyển ngay' : 'Liên hệ ngay'}
                                </CustomButton>
                            </div>
                        )}

                        {/* Contact Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Thông tin liên hệ
                            </h3>
                            <div className="space-y-3">
                                {job.contactInfo.email && (
                                    <a
                                        href={`mailto:${job.contactInfo.email}`}
                                        className="flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                                    >
                                        <Mail className="w-5 h-5" />
                                        <span className="text-sm">{job.contactInfo.email}</span>
                                    </a>
                                )}
                                {job.contactInfo.phone && (
                                    <a
                                        href={`tel:${job.contactInfo.phone}`}
                                        className="flex items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                                    >
                                        <Phone className="w-5 h-5" />
                                        <span className="text-sm">{job.contactInfo.phone}</span>
                                    </a>
                                )}
                                {job.contactInfo.zalo && (
                                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                        <MessageCircle className="w-5 h-5" />
                                        <span className="text-sm">{job.contactInfo.zalo}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Job Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Thông tin
                            </h3>
                            <div className="space-y-3 text-sm">
                                {job.workType && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Hình thức</span>
                                        <span className="text-gray-900 dark:text-white font-medium">
                                            {job.workType === 'remote' ? 'Remote' : job.workType === 'onsite' ? 'Onsite' : 'Hybrid'}
                                        </span>
                                    </div>
                                )}
                                {job.experience && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Kinh nghiệm</span>
                                        <span className="text-gray-900 dark:text-white font-medium">{job.experience}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Lượt xem</span>
                                    <span className="text-gray-900 dark:text-white font-medium">{job.views}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        {isRecruitment ? 'Ứng viên' : 'Liên hệ'}
                                    </span>
                                    <span className="text-gray-900 dark:text-white font-medium">{job.applications}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Đăng bởi</span>
                                    <span className="text-gray-900 dark:text-white font-medium">
                                        {job.postedBy.username}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Ngày đăng</span>
                                    <span className="text-gray-900 dark:text-white font-medium">
                                        {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}