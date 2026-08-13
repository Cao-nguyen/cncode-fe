'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    giftApi,
    IGift,
    IGiftCategoryChartItem,
    IGiftRevenueChartItem,
    IGiftStats,
    IGiftTopItem,
} from '@/lib/api/gift.api';
import { toast } from 'sonner';
import {
    Plus,
    Edit2,
    Trash2,
    Loader2,
    Gift,
    Image as ImageIcon,
    X,
    Coins,
    Sparkles,
    Eye,
    EyeOff,
    Package,
    TrendingUp,
    BarChart3,
    LineChart,
    Award,
    Send,
} from 'lucide-react';
import {
    LineChart as RechartsLineChart,
    Line,
    BarChart as RechartsBarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { ConfirmModalDelete } from '@/components/custom/ConfirmationModal';
import { DashboardCard } from '@/components/custom/DashboardCard';
import { CardSkeleton } from '@/components/ui/skeleton';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { AdminChartScroll } from '@/components/admin/AdminChartScroll';
import { uploadApi } from '@/lib/upload';
import { getImageUrl } from '@/lib/utils/imageUrl';
import { cn } from '@/lib/utils';

const CATEGORIES = [
    { value: 'special', label: 'Đặc biệt' },
    { value: 'other', label: 'Khác' },
];

const CATEGORY_LABELS: Record<string, string> = {
    special: 'Đặc biệt',
    other: 'Khác',
};

const CATEGORY_STYLE: Record<
    IGift['category'],
    { badge: string; gradient: string; icon: React.ElementType }
> = {
    special: {
        badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
        gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
        icon: Sparkles,
    },
    other: {
        badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        gradient: 'from-slate-500 via-gray-500 to-zinc-500',
        icon: Gift,
    },
};

const PIE_COLORS = ['#8B5CF6', '#64748B'];

function normalizeCategory(category?: string): IGift['category'] {
    return category === 'special' ? 'special' : 'other';
}

function GiftPreview({
    name,
    image,
    priceInXu,
    category,
    description,
    size = 'md',
}: {
    name: string;
    image: string;
    priceInXu: number;
    category: IGift['category'];
    description?: string;
    size?: 'sm' | 'md' | 'lg';
}) {
    const style = CATEGORY_STYLE[normalizeCategory(category)];
    const Icon = style.icon;
    const heightClass = size === 'lg' ? 'h-48' : size === 'sm' ? 'h-28' : 'h-36';

    return (
        <div className={cn('relative overflow-hidden rounded-2xl bg-gradient-to-br', style.gradient, heightClass)}>
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative flex h-full items-center justify-between gap-4 p-4 sm:p-5">
                <div className="min-w-0 flex-1 text-white">
                    <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm">
                        <Icon className="h-3 w-3" />
                        {CATEGORY_LABELS[normalizeCategory(category)]}
                    </div>
                    <p className="truncate text-base font-bold sm:text-lg">{name || 'Tên quà tặng'}</p>
                    {description && (
                        <p className="mt-1 line-clamp-2 text-xs text-white/85">{description}</p>
                    )}
                    <p className="mt-2 inline-flex items-center gap-1 rounded-lg bg-white/20 px-2.5 py-1 text-sm font-semibold backdrop-blur-sm">
                        <Coins className="h-3.5 w-3.5" />
                        {(priceInXu || 0).toLocaleString()} xu
                    </p>
                </div>
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/20 ring-2 ring-white/30 backdrop-blur-sm sm:h-24 sm:w-24">
                    {image ? (
                        <img
                            src={getImageUrl(image)}
                            alt={name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src = '/images/blog.png';
                            }}
                        />
                    ) : (
                        <Gift className="h-8 w-8 text-white/70" />
                    )}
                </div>
            </div>
        </div>
    );
}

function TopGiftCard({ item, rank }: { item: IGiftTopItem; rank: number }) {
    const category = normalizeCategory(item.category);
    const style = CATEGORY_STYLE[category];

    const rankClass =
        rank === 1
            ? 'bg-amber-500'
            : rank === 2
              ? 'bg-gray-400'
              : rank === 3
                ? 'bg-amber-700'
                : 'bg-gray-500';

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
            <div className="relative bg-gray-50 p-4 dark:bg-gray-900/40">
                <div
                    className={cn(
                        'absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow',
                        rankClass
                    )}
                >
                    #{rank}
                </div>
                <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700">
                    {item.image ? (
                        <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src = '/images/blog.png';
                            }}
                        />
                    ) : (
                        <Gift className="h-10 w-10 text-gray-300" />
                    )}
                </div>
            </div>
            <div className="space-y-2 p-4">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white" title={item.name}>
                    {item.name}
                </p>
                <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium', style.badge)}>
                    {CATEGORY_LABELS[category]}
                </span>
                <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-xs dark:border-gray-700">
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <Send className="h-3 w-3" />
                        {item.count} lượt
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                        <Coins className="h-3 w-3" />
                        {item.revenue.toLocaleString()} xu
                    </span>
                </div>
            </div>
        </div>
    );
}

function ChartEmpty({ icon: Icon }: { icon: React.ElementType }) {
    return (
        <div className="flex h-[250px] items-center justify-center text-gray-400 dark:text-gray-600">
            <div className="text-center">
                <Icon className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p className="text-sm">Chưa có dữ liệu</p>
            </div>
        </div>
    );
}

function AdminShopPageContent() {
    const [gifts, setGifts] = useState<IGift[]>([]);
    const [stats, setStats] = useState<IGiftStats | null>(null);
    const [revenueData, setRevenueData] = useState<IGiftRevenueChartItem[]>([]);
    const [topGifts, setTopGifts] = useState<IGiftTopItem[]>([]);
    const [categoryData, setCategoryData] = useState<IGiftCategoryChartItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editingGift, setEditingGift] = useState<IGift | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<IGift | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [priceInXu, setPriceInXu] = useState('');
    const [category, setCategory] = useState<IGift['category']>('other');
    const [isActive, setIsActive] = useState(true);
    const [order, setOrder] = useState('0');
    const [uploading, setUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const sortedGifts = useMemo(
        () => [...gifts].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
        [gifts]
    );

    const categoryChartData = useMemo(
        () =>
            categoryData.map((item) => ({
                ...item,
                label: CATEGORY_LABELS[normalizeCategory(item.category)] || 'Khác',
            })),
        [categoryData]
    );

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [giftsRes, statsRes, revenueRes, topRes, categoryRes] = await Promise.all([
                giftApi.getAllGifts(),
                giftApi.getStats(),
                giftApi.getRevenueChart(10),
                giftApi.getTopGifts(5),
                giftApi.getCategoryChart(),
            ]);
            setGifts(giftsRes.data || []);
            setStats(statsRes.data);
            setRevenueData(revenueRes.data || []);
            setTopGifts(topRes.data || []);
            setCategoryData(categoryRes.data || []);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Lỗi khi tải dữ liệu';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const refreshAnalytics = async () => {
        const [statsRes, revenueRes, topRes, categoryRes] = await Promise.all([
            giftApi.getStats(),
            giftApi.getRevenueChart(10),
            giftApi.getTopGifts(5),
            giftApi.getCategoryChart(),
        ]);
        setStats(statsRes.data);
        setRevenueData(revenueRes.data || []);
        setTopGifts(topRes.data || []);
        setCategoryData(categoryRes.data || []);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh');
            return;
        }

        try {
            setUploading(true);
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });

            const result = await uploadApi.uploadImage(base64, 'gifts');
            if (result.success) {
                const imageRef =
                    result.messageId != null ? String(result.messageId) : result.url || '';
                setImage(imageRef);
                toast.success('Tải ảnh lên thành công');
            } else {
                toast.error(result.message || 'Lỗi khi tải ảnh lên');
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Lỗi khi tải ảnh lên';
            toast.error(message);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !image || !priceInXu) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        try {
            setSubmitting(true);
            const giftData = {
                name,
                description,
                image,
                priceInXu: parseInt(priceInXu, 10),
                category,
                isActive,
                order: parseInt(order, 10) || 0,
            };

            if (editingGift) {
                await giftApi.updateGift(editingGift._id, giftData);
                setGifts((prev) =>
                    prev.map((g) => (g._id === editingGift._id ? { ...g, ...giftData } : g))
                );
                toast.success('Cập nhật quà tặng thành công');
            } else {
                const newGift = await giftApi.createGift(giftData);
                setGifts((prev) => [...prev, newGift.data]);
                toast.success('Tạo quà tặng thành công');
            }

            setShowModal(false);
            resetForm();
            await refreshAnalytics();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Lỗi khi lưu quà tặng';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (gift: IGift) => {
        setEditingGift(gift);
        setName(gift.name);
        setDescription(gift.description || '');
        setImage(gift.image);
        setPriceInXu(gift.priceInXu.toString());
        setCategory(gift.category);
        setIsActive(gift.isActive);
        setOrder(gift.order.toString());
        setShowModal(true);
    };

    const handleDelete = async (gift: IGift) => {
        try {
            await giftApi.deleteGift(gift._id);
            setGifts((prev) => prev.filter((g) => g._id !== gift._id));
            toast.success('Xóa quà tặng thành công');
            setDeleteConfirm(null);
            await refreshAnalytics();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Lỗi khi xóa quà tặng';
            toast.error(message);
        }
    };

    const handleToggleActive = async (gift: IGift) => {
        try {
            setTogglingId(gift._id);
            const payload = {
                name: gift.name,
                description: gift.description,
                image: gift.image,
                priceInXu: gift.priceInXu,
                category: gift.category,
                isActive: !gift.isActive,
                order: gift.order,
            };
            await giftApi.updateGift(gift._id, payload);
            setGifts((prev) =>
                prev.map((g) => (g._id === gift._id ? { ...g, isActive: !g.isActive } : g))
            );
            toast.success(gift.isActive ? 'Đã ẩn quà tặng' : 'Đã kích hoạt quà tặng');
            await refreshAnalytics();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Lỗi khi cập nhật trạng thái';
            toast.error(message);
        } finally {
            setTogglingId(null);
        }
    };

    const resetForm = () => {
        setEditingGift(null);
        setName('');
        setDescription('');
        setImage('');
        setPriceInXu('');
        setCategory('other');
        setIsActive(true);
        setOrder('0');
    };

    const openModal = () => {
        resetForm();
        setShowModal(true);
    };

    if (loading) {
        return (
            <AdminPageShell
                title="Cửa hàng quà tặng"
                description="Thống kê doanh thu và quản lý quà tặng"
            >
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
                    ))}
                </div>
                <div className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="h-72 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
                    <div className="h-72 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <CardSkeleton count={6} />
                </div>
            </AdminPageShell>
        );
    }

    return (
        <AdminPageShell
            title="Cửa hàng quà tặng"
            description="Thống kê doanh thu và quản lý quà tặng"
            action={
                <CustomButton onClick={openModal} className="w-full sm:w-auto shrink-0">
                    <Plus className="h-4 w-4" />
                    Thêm quà tặng
                </CustomButton>
            }
        >
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <DashboardCard
                    title="Tổng quà"
                    value={stats?.totalGifts ?? 0}
                    icon={<Package size={18} />}
                    iconBgColor="#FDF2F8"
                    iconColor="#DB2777"
                    accentColor="#DB2777"
                />
                <DashboardCard
                    title="Lượt tặng"
                    value={stats?.totalTransactions ?? 0}
                    icon={<Send size={18} />}
                    iconBgColor="#EFF6FF"
                    iconColor="#2563EB"
                    accentColor="#2563EB"
                />
                <DashboardCard
                    title="Doanh thu"
                    value={stats?.totalRevenue ?? 0}
                    suffix=" xu"
                    icon={<TrendingUp size={18} />}
                    iconBgColor="#FFFBEB"
                    iconColor="#D97706"
                    accentColor="#D97706"
                />
                <DashboardCard
                    title="Đã quy đổi"
                    value={stats?.totalConverted ?? 0}
                    icon={<Coins size={18} />}
                    iconBgColor="#ECFDF5"
                    iconColor="#059669"
                    accentColor="#059669"
                />
            </div>

            {/* Revenue chart */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                <div className="mb-4 flex items-center gap-2">
                    <LineChart className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Doanh thu (10 ngày gần nhất)
                    </h3>
                </div>
                {revenueData.some((d) => d.revenue > 0 || d.count > 0) ? (
                    <AdminChartScroll>
                    <ResponsiveContainer width="100%" height={260}>
                        <RechartsLineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                            <XAxis
                                dataKey="date"
                                stroke="#9CA3AF"
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                tickFormatter={(value) =>
                                    new Date(value).toLocaleDateString('vi-VN', {
                                        day: '2-digit',
                                        month: '2-digit',
                                    })
                                }
                            />
                            <YAxis
                                stroke="#9CA3AF"
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '6px',
                                    color: '#111827',
                                }}
                                labelFormatter={(value) =>
                                    new Date(value).toLocaleDateString('vi-VN')
                                }
                                formatter={(value, key) => [
                                    Number(value).toLocaleString(),
                                    key === 'revenue' ? 'Doanh thu (xu)' : 'Lượt tặng',
                                ]}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                name="Doanh thu (xu)"
                                stroke="#DB2777"
                                strokeWidth={2}
                                dot={{ fill: '#DB2777', r: 3 }}
                                activeDot={{ r: 5 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                name="Lượt tặng"
                                stroke="#6366F1"
                                strokeWidth={2}
                                dot={{ fill: '#6366F1', r: 3 }}
                                activeDot={{ r: 5 }}
                            />
                        </RechartsLineChart>
                    </ResponsiveContainer>
                    </AdminChartScroll>
                ) : (
                    <ChartEmpty icon={LineChart} />
                )}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Top 5 bar chart */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                    <div className="mb-4 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Top 5 quà được tặng nhiều nhất
                        </h3>
                    </div>
                    {topGifts.length > 0 ? (
                        <AdminChartScroll>
                        <ResponsiveContainer width="100%" height={280}>
                            <RechartsBarChart data={topGifts} layout="vertical" margin={{ left: 8, right: 16 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={100}
                                    tick={{ fontSize: 11 }}
                                    tickFormatter={(v) => (v.length > 14 ? `${v.slice(0, 14)}…` : v)}
                                />
                                <Tooltip
                                    formatter={(value, key) => [
                                        Number(value).toLocaleString(),
                                        key === 'count' ? 'Lượt tặng' : 'Doanh thu (xu)',
                                    ]}
                                />
                                <Legend />
                                <Bar dataKey="count" name="Lượt tặng" fill="#EC4899" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="revenue" name="Doanh thu (xu)" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                        </AdminChartScroll>
                    ) : (
                        <ChartEmpty icon={BarChart3} />
                    )}
                </div>

                {/* Category pie chart */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
                    <div className="mb-4 flex items-center gap-2">
                        <Award className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Phân bổ theo danh mục
                        </h3>
                    </div>
                    {categoryChartData.length > 0 ? (
                        <AdminChartScroll>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={categoryChartData}
                                    dataKey="count"
                                    nameKey="label"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    label={({ name, percent }) =>
                                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                                    }
                                >
                                    {categoryChartData.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, _name, props) => [
                                        `${Number(value).toLocaleString()} lượt`,
                                        (props.payload as { label?: string })?.label,
                                    ]}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                        </AdminChartScroll>
                    ) : (
                        <ChartEmpty icon={Award} />
                    )}
                </div>
            </div>

            {/* Top 5 featured products */}
            <div>
                <div className="mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-500" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        TOP 5 sản phẩm nổi bật
                    </h2>
                </div>
                {topGifts.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center dark:border-gray-600">
                        <p className="text-sm text-gray-500">Chưa có dữ liệu tặng quà</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        {topGifts.map((item, index) => (
                            <TopGiftCard key={item._id} item={item} rank={index + 1} />
                        ))}
                    </div>
                )}
            </div>

            {/* All gifts management */}
            <div>
                <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                    Tất cả quà tặng ({sortedGifts.length})
                </h2>
                {sortedGifts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-20 dark:border-gray-600">
                        <Gift className="mb-4 h-12 w-12 text-pink-400 opacity-60" />
                        <p className="text-sm text-gray-500">Chưa có quà tặng nào</p>
                        <CustomButton onClick={openModal} className="mt-4">
                            <Plus className="h-4 w-4" />
                            Thêm quà đầu tiên
                        </CustomButton>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {sortedGifts.map((gift) => {
                            const category = normalizeCategory(gift.category);
                            const style = CATEGORY_STYLE[category];
                            return (
                                <div
                                    key={gift._id}
                                    className={cn(
                                        'group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md dark:bg-gray-800/50',
                                        gift.isActive
                                            ? 'border-gray-200 dark:border-gray-700'
                                            : 'border-gray-200 opacity-75 dark:border-gray-700'
                                    )}
                                >
                                    <div className="relative">
                                        <GiftPreview
                                            name={gift.name}
                                            image={gift.image}
                                            priceInXu={gift.priceInXu}
                                            category={category}
                                            description={gift.description}
                                            size="md"
                                        />
                                        {!gift.isActive && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                                                    Đã ẩn
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3 p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <span
                                                    className={cn(
                                                        'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                                                        style.badge
                                                    )}
                                                >
                                                    {CATEGORY_LABELS[category]}
                                                </span>
                                                <p className="mt-1 text-[11px] text-gray-400">
                                                    Thứ tự #{gift.order}
                                                </p>
                                            </div>
                                            <span
                                                className={cn(
                                                    'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                                    gift.isActive
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                )}
                                            >
                                                {gift.isActive ? 'Active' : 'Hidden'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1 border-t border-gray-100 pt-3 dark:border-gray-700">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleActive(gift)}
                                                disabled={togglingId === gift._id}
                                                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"
                                                title={gift.isActive ? 'Ẩn quà' : 'Hiện quà'}
                                            >
                                                {togglingId === gift._id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : gift.isActive ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(gift)}
                                                className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeleteConfirm(gift)}
                                                className="ml-auto rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                                                title="Xóa"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
                >
                    <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
                        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {editingGift ? 'Chỉnh sửa quà tặng' : 'Thêm quà tặng mới'}
                                </h2>
                                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                    Xem trước giao diện quà khi người dùng tặng
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                                <GiftPreview
                                    name={name}
                                    image={image}
                                    priceInXu={parseInt(priceInXu, 10) || 0}
                                    category={category}
                                    description={description}
                                    size="lg"
                                />

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <CustomInput
                                        label="Tên quà tặng *"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="VD: Hộp quà may mắn"
                                        required
                                    />
                                    <CustomInput
                                        label="Giá (xu) *"
                                        type="number"
                                        value={priceInXu}
                                        onChange={(e) => setPriceInXu(String(e.target.value))}
                                        placeholder="1000"
                                        min={0}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Mô tả
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Mô tả ngắn về quà tặng"
                                        rows={3}
                                        className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Hình ảnh *
                                    </label>
                                    <div className="flex flex-wrap items-center gap-3">
                                        {image && (
                                            <img
                                                src={getImageUrl(image)}
                                                alt="Preview"
                                                className="h-20 w-20 rounded-xl object-cover ring-2 ring-gray-100 dark:ring-gray-700"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/images/blog.png';
                                                }}
                                            />
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                                        >
                                            {uploading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <ImageIcon className="h-4 w-4" />
                                            )}
                                            {uploading ? 'Đang tải...' : 'Chọn ảnh'}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <CustomSelect
                                        label="Danh mục"
                                        value={category}
                                        onChange={(value) => setCategory(value as IGift['category'])}
                                        options={CATEGORIES}
                                    />
                                    <CustomInput
                                        label="Thứ tự hiển thị"
                                        type="number"
                                        value={order}
                                        onChange={(e) => setOrder(String(e.target.value))}
                                        placeholder="0"
                                        min={0}
                                    />
                                </div>

                                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            Hiển thị trong cửa hàng
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Quà sẽ xuất hiện khi người dùng chọn tặng quà
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex shrink-0 gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                                <CustomButton
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1"
                                >
                                    Hủy
                                </CustomButton>
                                <CustomButton type="submit" disabled={submitting} className="flex-1">
                                    {submitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Đang lưu...
                                        </span>
                                    ) : editingGift ? (
                                        'Cập nhật'
                                    ) : (
                                        'Tạo quà'
                                    )}
                                </CustomButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModalDelete
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
                title="Xóa quà tặng"
                message={`Bạn có chắc muốn xóa quà tặng "${deleteConfirm?.name}"? Hành động này không thể hoàn tác.`}
            />
        </AdminPageShell>
    );
}

export default AdminShopPageContent;
