'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Briefcase, Search, Filter, Plus, MapPin, Clock, Eye,
    Building2, User, Sparkles, X, Tag, Calendar, DollarSign,
    Users, Send, Phone, Mail, MessageCircle
} from 'lucide-react';
import { CNJob, CNJobFormData, JobType } from '@/types/cnjobs.type';
import { cnjobsStorage } from '@/lib/utils/cnjobsStorage';
import { CustomButton } from '@/components/custom/CustomButton';
import { useAuthStore } from '@/store/auth.store';

export default function CNJobsPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [jobs, setJobs] = useState<CNJob[]>(() => cnjobsStorage.getAllJobs());
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | JobType>('all');
    const [showPostModal, setShowPostModal] = useState(false);
    const [postType, setPostType] = useState<JobType>('recruitment');

    // Filter jobs with useMemo
    const filteredJobs = React.useMemo(() => {
        let filtered = jobs;

        if (activeFilter !== 'all') {
            filtered = filtered.filter(job => job.type === activeFilter);
        }

        if (searchQuery.trim()) {
            filtered = cnjobsStorage.searchJobs(searchQuery);
            if (activeFilter !== 'all') {
                filtered = filtered.filter(job => job.type === activeFilter);
            }
        }

        return filtered;
    }, [jobs, searchQuery, activeFilter]);

    const handlePostJob = () => {
        if (!user) {
            alert('Vui lòng đăng nhập để đăng bài');
            return;
        }
        setShowPostModal(true);
    };

    const refreshJobs = () => {
        const loadedJobs = cnjobsStorage.getAllJobs();
        setJobs(loadedJobs);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Hôm nay';
        if (days === 1) return 'Hôm qua';
        if (days < 7) return `${days} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Briefcase className="w-7 h-7 text-blue-500" />
                                CNJobs
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Nền tảng kết nối nhân tài và kỹ năng
                            </p>
                        </div>
                        <CustomButton
                            onClick={handlePostJob}
                            className="flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Đăng bài
                        </CustomButton>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm công việc, kỹ năng..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveFilter('all')}
                                className={`px-4 py-2.5 rounded-xl font-medium transition-colors ${activeFilter === 'all'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                Tất cả ({jobs.length})
                            </button>
                            <button
                                onClick={() => setActiveFilter('recruitment')}
                                className={`px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 ${activeFilter === 'recruitment'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <Building2 className="w-4 h-4" />
                                Tuyển dụng ({jobs.filter(j => j.type === 'recruitment').length})
                            </button>
                            <button
                                onClick={() => setActiveFilter('skill-sale')}
                                className={`px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 ${activeFilter === 'skill-sale'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <Sparkles className="w-4 h-4" />
                                Bán kỹ năng ({jobs.filter(j => j.type === 'skill-sale').length})
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Jobs List */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {filteredJobs.length === 0 ? (
                    <div className="text-center py-16">
                        <Briefcase className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Chưa có bài đăng nào
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            Hãy là người đầu tiên đăng bài!
                        </p>
                        <CustomButton onClick={handlePostJob}>
                            Đăng bài ngay
                        </CustomButton>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredJobs.map((job) => (
                            <JobCard key={job.id} job={job} onClick={() => router.push(`/cnjobs/${job.id}`)} />
                        ))}
                    </div>
                )}
            </div>

            {/* Post Job Modal */}
            {showPostModal && (
                <PostJobModal
                    onClose={() => setShowPostModal(false)}
                    onSuccess={refreshJobs}
                    initialType={postType}
                />
            )}
        </div>
    );
}

// Job Card Component
function JobCard({ job, onClick }: { job: CNJob; onClick: () => void }) {
    const isRecruitment = job.type === 'recruitment';

    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 dark:border-gray-700"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isRecruitment
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : 'bg-purple-100 dark:bg-purple-900'
                        }`}>
                        {isRecruitment ? (
                            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                        ) : (
                            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                            {job.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isRecruitment ? job.company : job.sellerName}
                        </p>
                    </div>
                </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                {job.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
                {job.tags.slice(0, 3).map((tag, index) => (
                    <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-lg"
                    >
                        {tag}
                    </span>
                ))}
                {job.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-lg">
                        +{job.tags.length - 3}
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                    {job.location && (
                        <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                        </span>
                    )}
                    {(isRecruitment ? job.salary : job.price) && (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                            <DollarSign className="w-4 h-4" />
                            {isRecruitment ? job.salary : job.price}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {job.views}
                </span>
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                </span>
            </div>
        </div>
    );
}

// Post Job Modal Component
function PostJobModal({
    onClose,
    onSuccess,
    initialType
}: {
    onClose: () => void;
    onSuccess: () => void;
    initialType: JobType;
}) {
    const { user } = useAuthStore();
    const [jobType, setJobType] = useState<JobType>(initialType);
    const [formData, setFormData] = useState<CNJobFormData>({
        type: initialType,
        title: '',
        company: '',
        sellerName: '',
        description: '',
        requirements: [],
        skills: [],
        salary: '',
        price: '',
        location: '',
        workType: undefined,
        experience: '',
        deadline: '',
        contactInfo: {
            email: '',
            phone: '',
            zalo: '',
            other: ''
        },
        tags: []
    });
    const [tagInput, setTagInput] = useState('');

    const isRecruitment = jobType === 'recruitment';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert('Vui lòng đăng nhập');
            return;
        }

        if (!formData.title || !formData.description) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        const jobData: CNJobFormData = {
            ...formData,
            type: jobType
        };

        cnjobsStorage.addJob(jobData, user._id, user.username || user.email);
        onSuccess();
        onClose();
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, tagInput.trim()]
            });
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(t => t !== tag)
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full my-8">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Đăng bài mới
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {/* Job Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Loại bài đăng *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setJobType('recruitment')}
                                className={`p-4 rounded-xl border-2 transition-colors ${jobType === 'recruitment'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                <Building2 className={`w-6 h-6 mx-auto mb-2 ${jobType === 'recruitment' ? 'text-blue-500' : 'text-gray-400'
                                    }`} />
                                <div className="font-medium text-gray-900 dark:text-white">Tuyển dụng</div>
                                <div className="text-xs text-gray-500">Tìm nhân sự</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setJobType('skill-sale')}
                                className={`p-4 rounded-xl border-2 transition-colors ${jobType === 'skill-sale'
                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                <Sparkles className={`w-6 h-6 mx-auto mb-2 ${jobType === 'skill-sale' ? 'text-purple-500' : 'text-gray-400'
                                    }`} />
                                <div className="font-medium text-gray-900 dark:text-white">Bán kỹ năng</div>
                                <div className="text-xs text-gray-500">Cung cấp dịch vụ</div>
                            </button>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tiêu đề *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder={isRecruitment ? 'VD: Tuyển Frontend Developer' : 'VD: Thiết kế website theo yêu cầu'}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Company/Seller Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {isRecruitment ? 'Tên công ty' : 'Tên người bán'}
                        </label>
                        <input
                            type="text"
                            value={isRecruitment ? formData.company : formData.sellerName}
                            onChange={(e) => setFormData({
                                ...formData,
                                [isRecruitment ? 'company' : 'sellerName']: e.target.value
                            })}
                            placeholder={isRecruitment ? 'Tên công ty' : 'Tên của bạn'}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Mô tả *
                        </label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            placeholder="Mô tả chi tiết về công việc hoặc dịch vụ..."
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                        />
                    </div>

                    {/* Salary/Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {isRecruitment ? 'Mức lương' : 'Giá dịch vụ'}
                        </label>
                        <input
                            type="text"
                            value={isRecruitment ? formData.salary : formData.price}
                            onChange={(e) => setFormData({
                                ...formData,
                                [isRecruitment ? 'salary' : 'price']: e.target.value
                            })}
                            placeholder={isRecruitment ? 'VD: 10-15 triệu' : 'VD: 500k - 1 triệu'}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Địa điểm
                        </label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="VD: Hà Nội, Hồ Chí Minh..."
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tags
                        </label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                placeholder="Nhập tag và nhấn Enter"
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                            >
                                Thêm
                            </button>
                        </div>
                        {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-sm flex items-center gap-2"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="hover:text-blue-900 dark:hover:text-blue-100"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Thông tin liên hệ
                        </label>
                        <input
                            type="email"
                            value={formData.contactInfo.email}
                            onChange={(e) => setFormData({
                                ...formData,
                                contactInfo: { ...formData.contactInfo, email: e.target.value }
                            })}
                            placeholder="Email"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                        <input
                            type="tel"
                            value={formData.contactInfo.phone}
                            onChange={(e) => setFormData({
                                ...formData,
                                contactInfo: { ...formData.contactInfo, phone: e.target.value }
                            })}
                            placeholder="Số điện thoại"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                        <input
                            type="text"
                            value={formData.contactInfo.zalo}
                            onChange={(e) => setFormData({
                                ...formData,
                                contactInfo: { ...formData.contactInfo, zalo: e.target.value }
                            })}
                            placeholder="Zalo"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                        >
                            Đăng bài
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}