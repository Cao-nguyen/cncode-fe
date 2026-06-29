'use client';

import React, { useState, useEffect, useRef } from 'react';
import { blogApi, Blog } from '@/lib/api/blog.api';
import { commentApi } from '@/lib/api/comment.api';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, FileText, TrendingUp, X, BarChart3, LineChart, Heart, MessageSquare, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { CustomSelect } from '@/components/custom/CustomSelect';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { DashboardCard } from '@/components/custom/DashboardCard';
import StaticContent from '@/components/common/StaticContent';
import CommentSection from '@/components/comment/CommentSection';
import { TableSkeleton } from '@/components/ui/skeleton';

const CATEGORIES = [
    { value: 'technology', label: 'Công nghệ' },
    { value: 'education', label: 'Giáo dục' },
    { value: 'news', label: 'Tin tức' },
    { value: 'contest', label: 'Cuộc thi' },
    { value: 'other', label: 'Khác' }
];

const FILTER_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'true', label: 'Đã xuất bản' },
    { value: 'false', label: 'Bản nháp' }
];

const STATUS_OPTIONS = [
    { value: 'published', label: 'Xuất bản' },
    { value: 'draft', label: 'Bản nháp' }
];

// Helper function - normalize text for search
const normalizeText = (text: string) => {
    if (!text) return '';
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove diacritics
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();
};

function AdminBlogPageContent() {
    const editorRef = useRef<CustomEditorRef>(null);

    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [filterPublished, setFilterPublished] = useState('all');

    const [showModal, setShowModal] = useState(false);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('other');
    const [tags, setTags] = useState('');
    const [isPublished, setIsPublished] = useState(false);

    const [deleteConfirm, setDeleteConfirm] = useState<Blog | null>(null);
    const [viewBlog, setViewBlog] = useState<Blog | null>(null);
    const [statusModal, setStatusModal] = useState<Blog | null>(null);
    const [newStatus, setNewStatus] = useState('published');
    const [spellCheckResults, setSpellCheckResults] = useState<Array<{ text: string; suggestion: string; type: 'spelling' | 'semantic' }>>([]);
    const [highlightedContent, setHighlightedContent] = useState('');
    const [approveConfirm, setApproveConfirm] = useState<Blog | null>(null);
    const [rejectConfirm, setRejectConfirm] = useState<Blog | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectModal, setRejectModal] = useState<Blog | null>(null);

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        draft: 0,
        totalViews: 0
    });

    // Charts
    const [growthData, setGrowthData] = useState<Array<{ date: string; count: number }>>([]);
    const [topViewedData, setTopViewedData] = useState<Array<{ _id: string; title: string; viewCount?: number }>>([]);
    const [topLikedData, setTopLikedData] = useState<Array<{ _id: string; title: string; likeCount?: number }>>([]);
    const [publishedAt, setPublishedAt] = useState('');

    useEffect(() => {
        fetchBlogs();
    }, [page]);

    useEffect(() => {
        fetchStats();
        fetchCharts();
    }, []);

    // Client-side filtering with normalized search
    useEffect(() => {
        let filtered = [...blogs];

        // Filter by search - normalize both search and data
        if (searchInput.trim()) {
            const search = normalizeText(searchInput);
            filtered = filtered.filter(blog =>
                normalizeText(blog.title).includes(search) ||
                normalizeText(blog.author.fullName).includes(search)
            );
        }

        // Filter by published status
        if (filterPublished !== 'all') {
            const isPublished = filterPublished === 'true';
            filtered = filtered.filter(blog => blog.isPublished === isPublished);
        }

        setFilteredBlogs(filtered);
    }, [blogs, searchInput, filterPublished]);

    // Helper functions to update state without full reload
    const updateBlogInList = (updatedBlog: Blog) => {
        setBlogs(prev => prev.map(b => b._id === updatedBlog._id ? updatedBlog : b));
    };

    const removeBlogFromList = (blogId: string) => {
        setBlogs(prev => prev.filter(b => b._id !== blogId));
    };

    const addBlogToList = (newBlog: Blog) => {
        setBlogs(prev => [newBlog, ...prev]);
    };

    const fetchStats = async () => {
        try {
            const res = await blogApi.getBlogStats();
            if (res.success) {
                setStats(res.data);
            }
        } catch (error) {
            console.error('Fetch stats error:', error);
        }
    };

    const fetchCharts = async () => {
        try {
            const [growthRes, topViewedRes, topLikedRes] = await Promise.all([
                blogApi.getBlogGrowthChart(),
                blogApi.getTopViewedBlogs(5),
                blogApi.getTopLikedBlogs(5)
            ]);
            if (growthRes.success) setGrowthData(growthRes.data);
            if (topViewedRes.success) setTopViewedData(topViewedRes.data);
            if (topLikedRes.success) setTopLikedData(topLikedRes.data);
        } catch (error) {
            console.error('Fetch charts error:', error);
        }
    };

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await blogApi.getAllBlogsAdmin({
                page,
                limit: 20,
                search: searchInput || undefined,
                isPublished: filterPublished
            });
            if (res.success) {
                setBlogs(res.data);
                setTotalPages(res.pagination.totalPages);
            } else {
                toast.error(res.message || 'Không thể tải danh sách');
            }
        } catch (error) {
            console.error('Fetch blogs error:', error);
            const err = error as { response?: { status?: number } };
            if (err.response?.status === 403) {
                toast.error('Bạn không có quyền truy cập. Vui lòng đăng nhập với tài khoản admin.');
            } else if (err.response?.status === 401) {
                toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            } else {
                toast.error('Không thể tải danh sách blog');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearchInput(value);
        setPage(1);
    };

    const handleOpenModal = (blog?: Blog) => {
        if (blog) {
            setEditingBlog(blog);
            setTitle(blog.title);
            setCategory(blog.category);
            setTags(blog.tags.join(', '));
            setIsPublished(blog.isPublished);
            // Only set publishedAt if it exists, otherwise leave empty
            if (blog.publishedAt) {
                const date = new Date(blog.publishedAt);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                setPublishedAt(`${year}-${month}-${day}`);
            } else {
                setPublishedAt('');
            }
            setTimeout(() => editorRef.current?.setContent(blog.content), 100);
        } else {
            setEditingBlog(null);
            setTitle('');
            setCategory('other');
            setTags('');
            setIsPublished(false);
            setPublishedAt('');
            setTimeout(() => editorRef.current?.setContent(''), 100);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingBlog(null);
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error('Vui lòng nhập tiêu đề');
            return;
        }
        const content = editorRef.current?.getContent() || '';
        if (!content.trim() || content === '<p><br></p>') {
            toast.error('Vui lòng nhập nội dung');
            return;
        }

        setSubmitting(true);
        try {
            const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
            const thumbnail = imgMatch ? imgMatch[1] : '/images/blog.png';

            const data: {
                title: string;
                thumbnail: string;
                content: string;
                category: string;
                tags: string[];
                isPublished: boolean;
                publishedAt?: string;
            } = {
                title: title.trim(),
                thumbnail,
                content,
                category,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                isPublished
            };

            if (publishedAt) {
                data.publishedAt = new Date(publishedAt).toISOString();
            }

            const res = editingBlog
                ? await blogApi.updateBlog(editingBlog._id, data)
                : await blogApi.createBlog(data);

            if (res.success) {
                toast.success(editingBlog ? 'Cập nhật thành công' : 'Tạo bài viết thành công');

                if (editingBlog) {
                    updateBlogInList(res.data);
                } else {
                    addBlogToList(res.data);
                }

                fetchStats();
                handleCloseModal();
            } else {
                toast.error(res.message || 'Có lỗi xảy ra');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleApprove = async (blog: Blog) => {
        try {
            const res = await blogApi.updateBlog(blog._id, {
                isPublished: true,
                needsReview: false,
                rejectionReason: ''
            });
            if (res.success) {
                toast.success('Đã duyệt bài viết');
                updateBlogInList(res.data);
                fetchStats();
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleReject = async (blog: Blog) => {
        // Mở modal nhập lý do từ chối thay vì xóa ngay
        setRejectModal(blog);
        setRejectReason('');
    };

    const handleConfirmReject = async () => {
        if (!rejectModal) return;
        try {
            const res = await blogApi.updateBlog(rejectModal._id, {
                isPublished: false,
                rejectionReason: rejectReason.trim(),
                needsReview: true
            });
            if (res.success) {
                toast.success('Đã từ chối bài viết và lưu lý do');
                updateBlogInList(res.data);
                setRejectModal(null);
                setRejectReason('');
                fetchStats();
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleChangeStatus = async () => {
        if (!statusModal) return;
        try {
            const isPublished = newStatus === 'published';
            const res = await blogApi.updateBlog(statusModal._id, { isPublished });
            if (res.success) {
                toast.success('Đã thay đổi trạng thái');
                updateBlogInList(res.data);
                setStatusModal(null);
                fetchStats();
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            const res = await blogApi.deleteBlog(deleteConfirm._id);
            if (res.success) {
                toast.success('Xóa thành công');
                removeBlogFromList(deleteConfirm._id);
                setDeleteConfirm(null);
                fetchStats();
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        }
    };

    const checkSpelling = (text: string) => {
        // Danh sách từ ngoại lệ - những từ hợp lệ chứa pattern có thể bị nhầm
        const exceptions = [
            'cuộc thi', 'thi đấu', 'thi công', 'thi hành', 'thi ca', 'thi sĩ',
            'kỉ niệm', 'kỉ lục', 'kỉ nguyên', 'kỉ yếu', 'thế kỉ',
            'vitamin', 'marketing', 'parking'
        ];

        const spellingErrors = [
            { wrong: 'khong', correct: 'không', type: 'spelling' as const },
            { wrong: 'duoc', correct: 'được', type: 'spelling' as const },
            { wrong: 'nhu', correct: 'như', type: 'spelling' as const },
            { wrong: 'ma', correct: 'mà', type: 'spelling' as const },
            { wrong: 'cua', correct: 'của', type: 'spelling' as const },
            { wrong: 'voi', correct: 'với', type: 'spelling' as const },
            { wrong: 'tren', correct: 'trên', type: 'spelling' as const },
            { wrong: 'duoi', correct: 'dưới', type: 'spelling' as const },
            { wrong: 'giua', correct: 'giữa', type: 'spelling' as const }
        ];

        const semanticErrors = [
            { wrong: 'họt', correct: 'học', type: 'semantic' as const },
            { wrong: 'hok', correct: 'học', type: 'semantic' as const },
            { wrong: 'dc', correct: 'được', type: 'semantic' as const },
            { wrong: 'ko', correct: 'không', type: 'semantic' as const },
            { wrong: 'cx', correct: 'cũng', type: 'semantic' as const },
            { wrong: 'vs', correct: 'với', type: 'semantic' as const },
            { wrong: 'ms', correct: 'mới', type: 'semantic' as const }
        ];

        const errors: Array<{ text: string; suggestion: string; type: 'spelling' | 'semantic' }> = [];
        const lowerText = text.toLowerCase();

        // Kiểm tra xem text có chứa từ ngoại lệ không
        const hasException = (word: string) => {
            return exceptions.some(exception =>
                lowerText.includes(exception.toLowerCase()) &&
                exception.toLowerCase().includes(word.toLowerCase())
            );
        };

        [...spellingErrors, ...semanticErrors].forEach(({ wrong, correct, type }) => {
            // Bỏ qua nếu từ nằm trong ngoại lệ
            if (hasException(wrong)) return;

            const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
            if (regex.test(lowerText)) {
                errors.push({ text: wrong, suggestion: correct, type });
            }
        });

        return errors;
    };

    const handleSpellCheck = () => {
        if (!viewBlog) return;
        const stripHtml = (html: string) => {
            const tmp = document.createElement('div');
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || '';
        };
        const text = stripHtml(viewBlog.content);
        const errors = checkSpelling(text);

        // Highlight errors in content
        let highlighted = viewBlog.content;
        errors.forEach(({ text }) => {
            const regex = new RegExp(`\\b${text}\\b`, 'gi');
            highlighted = highlighted.replace(regex, `<mark style="background-color: #FCA5A5; padding: 2px 4px; border-radius: 2px;">$&</mark>`);
        });

        setHighlightedContent(highlighted);
        setSpellCheckResults(errors);

        if (errors.length === 0) {
            toast.success('Không phát hiện lỗi chính tả');
        } else {
            const spellingCount = errors.filter(e => e.type === 'spelling').length;
            const semanticCount = errors.filter(e => e.type === 'semantic').length;
            toast.warning(`Phát hiện ${spellingCount} lỗi chính tả và ${semanticCount} lỗi ngữ nghĩa`);
        }
    };

    const cardConfigs = [
        {
            key: 'total',
            title: 'Tổng bài viết',
            value: stats.total,
            icon: <FileText className="w-4 h-4" />,
            iconBgColor: '#EFF6FF',
            iconColor: '#3B82F6',
        },
        {
            key: 'published',
            title: 'Đã xuất bản',
            value: stats.published,
            icon: <Eye className="w-4 h-4" />,
            iconBgColor: '#DCFCE7',
            iconColor: '#16A34A',
        },
        {
            key: 'draft',
            title: 'Bản nháp',
            value: stats.draft,
            icon: <Edit2 className="w-4 h-4" />,
            iconBgColor: '#FEF3C7',
            iconColor: '#D97706',
        },
        {
            key: 'views',
            title: 'Tổng lượt xem',
            value: stats.totalViews,
            icon: <TrendingUp className="w-4 h-4" />,
            iconBgColor: '#FCE7F3',
            iconColor: '#DB2777',
        },
    ];

    return (
        <div className="space-y-6 pb-8 px-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Quản lý Blog</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quản lý bài viết blog</p>
                </div>
                <CustomButton onClick={() => handleOpenModal()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo bài viết
                </CustomButton>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cardConfigs.map((card) => (
                    <DashboardCard
                        key={card.key}
                        title={card.title}
                        value={card.value}
                        icon={card.icon}
                        iconBgColor={card.iconBgColor}
                        iconColor={card.iconColor}
                    />
                ))}
            </div>

            {/* Charts */}
            <div className="space-y-4 sm:space-y-6">
                {/* Growth Chart - Line Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 w-full">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <LineChart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">
                            Bài viết mới (10 ngày gần nhất)
                        </h3>
                    </div>
                    {growthData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <RechartsLineChart data={growthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#9CA3AF"
                                    tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                    tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                />
                                <YAxis
                                    stroke="#9CA3AF"
                                    tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#F9FAFB'
                                    }}
                                    labelFormatter={(value) => new Date(value).toLocaleDateString('vi-VN')}
                                    formatter={(value) => [value, 'Số bài viết']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    dot={{ fill: '#3B82F6', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </RechartsLineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[250px] text-gray-400 dark:text-gray-500">
                            <div className="text-center">
                                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Chưa có dữ liệu</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Top Viewed Chart - Vertical Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 w-full">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">Top 5 lượt xem</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={topViewedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <XAxis
                                dataKey="title"
                                stroke="#9CA3AF"
                                tick={{ fill: '#9CA3AF', fontSize: 10 }}
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                interval={0}
                            />
                            <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#F9FAFB'
                                }}
                                formatter={(value) => [value, 'Lượt xem']}
                            />
                            <Bar dataKey="viewCount" fill="#10B981" radius={[8, 8, 0, 0]} />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Liked Chart - Vertical Bar */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 w-full">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <Heart data-filled={true} fill="#EC4899" className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 flex-shrink-0" />
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100">Top 5 yêu thích</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={topLikedData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <XAxis
                                dataKey="title"
                                stroke="#9CA3AF"
                                tick={{ fill: '#9CA3AF', fontSize: 10 }}
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                interval={0}
                            />
                            <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#F9FAFB'
                                }}
                                formatter={(value) => [value, 'Lượt thích']}
                            />
                            <Bar dataKey="likeCount" fill="#EC4899" radius={[8, 8, 0, 0]} />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 min-w-[280px]">
                        <CustomInputSearch
                            placeholder="Tìm kiếm bài viết..."
                            value={searchInput}
                            onChange={handleSearch}
                            size="medium"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <CustomSelect
                            value={filterPublished}
                            onChange={(value) => setFilterPublished(value)}
                            options={FILTER_OPTIONS}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <TableSkeleton rows={10} cols={6} />
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ảnh</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tiêu đề</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Trạng thái</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Lượt xem</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tim</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredBlogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                            Không tìm thấy bài viết nào
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBlogs.map((blog) => (
                                        <tr key={blog._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                            <td className="px-4 py-3">
                                                <div className="relative">
                                                    {blog.thumbnail && (
                                                        <img
                                                            src={(() => {
                                                                if (!blog.thumbnail) return '';
                                                                // Extract messageId from URL if it's a proxy URL
                                                                const messageIdMatch = blog.thumbnail.match(/\/proxy\/file\/(\d+)/);
                                                                if (messageIdMatch) {
                                                                    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload/proxy/file/${messageIdMatch[1]}`;
                                                                }
                                                                // If it's already a full URL, replace backend URL with NEXT_PUBLIC_API_URL
                                                                if (blog.thumbnail.startsWith('http')) {
                                                                    return blog.thumbnail.replace(/https?:\/\/[^\/]+/, process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
                                                                }
                                                                // Otherwise, assume it's a messageId
                                                                return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload/proxy/file/${blog.thumbnail}`;
                                                            })()}
                                                            alt=""
                                                            className="w-16 h-16 rounded object-cover"
                                                        />
                                                    )}
                                                    {blog.needsReview && (
                                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white dark:border-gray-800" title="Cần duyệt lại" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-800 dark:text-gray-200 text-sm">{blog.title}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{blog.author.fullName}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => {
                                                            setStatusModal(blog);
                                                            setNewStatus(blog.isPublished ? 'published' : 'draft');
                                                        }}
                                                        className="inline-flex items-center"
                                                    >
                                                        {blog.isPublished ? (
                                                            <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium whitespace-nowrap">
                                                                Đã xuất bản
                                                            </span>
                                                        ) : (
                                                            <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium whitespace-nowrap">
                                                                Bản nháp
                                                            </span>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300">{blog.viewCount}</td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Heart className="w-4 h-4 text-red-500" data-filled={true} />
                                                    <span className="text-sm text-gray-600 dark:text-gray-300">{blog.likeCount}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => setViewBlog(blog)}
                                                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenModal(blog)}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(blog)}
                                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={handleCloseModal}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{editingBlog ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h2>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <CustomInput
                                label="Tiêu đề"
                                placeholder="Nhập tiêu đề bài viết..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                            <CustomSelect
                                label="Danh mục"
                                value={category}
                                onChange={(value) => setCategory(value)}
                                options={CATEGORIES}
                            />
                            <CustomInput
                                label="Tags (phân cách bằng dấu phẩy)"
                                placeholder="react, javascript, tutorial"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nội dung <span className="text-red-500">*</span>
                                </label>
                                <CustomEditor ref={editorRef} initialValue="" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Ngày đăng bài (tùy chọn)
                                </label>
                                <input
                                    type="date"
                                    value={publishedAt}
                                    onChange={(e) => setPublishedAt(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isPublished"
                                    checked={isPublished}
                                    onChange={(e) => setIsPublished(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <label htmlFor="isPublished" className="text-sm text-gray-700 dark:text-gray-300">
                                    Xuất bản ngay
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
                            <CustomButton onClick={handleSubmit} loading={submitting} className="flex-1">
                                {editingBlog ? 'Cập nhật' : 'Tạo bài viết'}
                            </CustomButton>
                            <CustomButton variant="secondary" onClick={handleCloseModal}>
                                Hủy
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {/* View Detail Modal */}
            {viewBlog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setViewBlog(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Chi tiết bài viết</h2>
                            <div className="flex items-center gap-2">
                                <CustomButton onClick={handleSpellCheck} variant="secondary" size="small">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Kiểm tra chính tả
                                </CustomButton>
                                <button onClick={() => setViewBlog(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            {spellCheckResults.length > 0 && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Lỗi phát hiện:</h3>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                                        {spellCheckResults.map((error, idx) => (
                                            <li key={idx}>
                                                <span className="font-medium">{error.text}</span> → {error.suggestion}
                                                <span className="ml-2 text-xs">({error.type === 'spelling' ? 'Chính tả' : 'Ngữ nghĩa'})</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{viewBlog.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    <span>Tác giả: {viewBlog.author.fullName}</span>
                                    <span>•</span>
                                    <span>{viewBlog.viewCount} lượt xem</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Heart className="w-4 h-4 text-red-500" data-filled={true} />
                                        {viewBlog.likeCount}
                                    </span>
                                </div>
                            </div>
                            <div className="prose dark:prose-invert max-w-none">
                                <StaticContent content={highlightedContent || viewBlog.content} />
                            </div>
                            {!viewBlog.isPublished && (
                                <div className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <CustomButton
                                        onClick={() => {
                                            setApproveConfirm(viewBlog);
                                            setViewBlog(null);
                                        }}
                                        className="flex-1"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Duyệt bài viết
                                    </CustomButton>
                                    <CustomButton
                                        variant="secondary"
                                        onClick={() => {
                                            setRejectConfirm(viewBlog);
                                            setViewBlog(null);
                                        }}
                                        className="flex-1"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Từ chối
                                    </CustomButton>
                                </div>
                            )}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5" />
                                    Bình luận
                                </h3>
                                <CommentSection targetType="blog" targetId={viewBlog._id} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Change Modal */}
            {statusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setStatusModal(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Thay đổi trạng thái</h2>
                        </div>
                        <div className="p-5 space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Bài viết: <span className="font-medium text-gray-800 dark:text-gray-200">{statusModal.title}</span>
                            </p>
                            <CustomSelect
                                label="Trạng thái mới"
                                value={newStatus}
                                onChange={(value) => setNewStatus(value)}
                                options={STATUS_OPTIONS}
                            />
                        </div>
                        <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
                            <CustomButton onClick={handleChangeStatus} className="flex-1">
                                Xác nhận
                            </CustomButton>
                            <CustomButton variant="secondary" onClick={() => setStatusModal(null)}>
                                Hủy
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <ConfirmModalDelete
                    isOpen={!!deleteConfirm}
                    onClose={() => setDeleteConfirm(null)}
                    onConfirm={handleDelete}
                    title="Xác nhận xóa"
                    message={`Bạn có chắc chắn muốn xóa bài viết "${deleteConfirm.title}"?`}
                />
            )}

            {/* Approve Confirmation */}
            {approveConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setApproveConfirm(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Xác nhận duyệt bài viết</h2>
                        </div>
                        <div className="p-5">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Bạn có chắc chắn muốn duyệt bài viết <span className="font-medium text-gray-800 dark:text-gray-200">&ldquo;{approveConfirm.title}&rdquo;</span>?
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Bài viết sẽ được xuất bản và hiển thị công khai.
                            </p>
                        </div>
                        <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
                            <CustomButton
                                onClick={() => {
                                    handleApprove(approveConfirm);
                                    setApproveConfirm(null);
                                    setViewBlog(null);
                                }}
                                className="flex-1"
                            >
                                Xác nhận duyệt
                            </CustomButton>
                            <CustomButton variant="secondary" onClick={() => setApproveConfirm(null)}>
                                Hủy
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Confirmation */}
            {rejectConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setRejectConfirm(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Xác nhận từ chối bài viết</h2>
                        </div>
                        <div className="p-5">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Bạn có chắc chắn muốn từ chối bài viết <span className="font-medium text-gray-800 dark:text-gray-200">&ldquo;{rejectConfirm.title}&rdquo;</span>?
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-400 mt-2 font-medium">
                                ⚠️ Bài viết sẽ bị xóa vĩnh viễn và không thể khôi phục!
                            </p>
                        </div>
                        <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
                            <CustomButton
                                onClick={() => {
                                    handleReject(rejectConfirm);
                                    setRejectConfirm(null);
                                    setViewBlog(null);
                                }}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                            >
                                Xác nhận từ chối
                            </CustomButton>
                            <CustomButton variant="secondary" onClick={() => setRejectConfirm(null)}>
                                Hủy
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal - Input Reason */}
            {rejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setRejectModal(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Từ chối bài viết</h2>
                        </div>
                        <div className="p-5 space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Bài viết: <span className="font-medium text-gray-800 dark:text-gray-200">&ldquo;{rejectModal.title}&rdquo;</span>
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Lý do từ chối <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                    rows={4}
                                    placeholder="Nhập lý do từ chối bài viết..."
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Tác giả sẽ nhận được lý do này và có thể chỉnh sửa bài viết để gửi duyệt lại.
                            </p>
                        </div>
                        <div className="flex gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
                            <CustomButton
                                onClick={handleConfirmReject}
                                disabled={!rejectReason.trim()}
                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Xác nhận từ chối
                            </CustomButton>
                            <CustomButton variant="secondary" onClick={() => setRejectModal(null)}>
                                Hủy
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminBlogPage() {
    return <AdminBlogPageContent />;
}
