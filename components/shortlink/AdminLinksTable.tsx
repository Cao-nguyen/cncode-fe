// components/shortlink/AdminLinksTable.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { SearchNormal1, ExportSquare, Trash, Mouse, Calendar, Profile2User } from 'iconsax-react';
import { shortlinkApi } from '@/lib/api/shortlink.api';
import { CopyButton } from '@/components/common/CopyButton';
import { toast } from 'sonner';
import type { ShortLinkWithUser } from '@/types/shortlink.type';

export function AdminLinksTable() {
    const [links, setLinks] = useState<ShortLinkWithUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchLinks = async (p: number, s: string) => {
        setIsLoading(true);
        try {
            const data = await shortlinkApi.getAllLinks(p, 50, s);
            setLinks(data.links || []);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);
        } catch (err) {
            console.error('Fetch links error:', err);
            toast.error('Không thể tải danh sách link');
            setLinks([]);
            setTotalPages(1);
            setTotal(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLinks(page, search);
    }, [page, search]);

    const handleSearchChange = (value: string) => {
        setSearchInput(value);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            setSearch(value.trim());
            setPage(1);
        }, 400);
    };

    const handleDelete = async (shortCode: string) => {
        if (!confirm('Bạn có chắc muốn xóa link này?')) return;
        try {
            await shortlinkApi.delete(shortCode);
            toast.success('Đã xóa link');
            fetchLinks(page, search);
        } catch (err) {
            toast.error('Xóa thất bại');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <SearchNormal1 size={16} variant="Outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Tìm theo short code hoặc URL..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-main focus:ring-2 focus:ring-main/20 outline-none text-sm transition-all"
                    />
                </div>
                <span className="text-sm text-gray-500 shrink-0">{total.toLocaleString('vi-VN')} link</span>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
                    ))}
                </div>
            ) : links.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 border-2 border-dashed border-gray-200 rounded-xl">
                    <SearchNormal1 size={32} variant="Outline" className="text-gray-300" />
                    <p className="text-sm text-gray-500">
                        {search ? `Không tìm thấy kết quả cho "${search}"` : 'Chưa có link nào'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {links.map((link) => (
                            <AdminLinkCard key={link.shortCode} link={link} onDelete={handleDelete} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            >
                                Trước
                            </button>
                            <span className="px-3 py-1.5 text-sm font-medium text-gray-600">{page} / {totalPages}</span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                            >
                                Sau
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function AdminLinkCard({ link, onDelete }: { link: ShortLinkWithUser; onDelete: (shortCode: string) => void }) {
    const isExpired = link.expiresAt ? new Date(link.expiresAt) < new Date() : false;

    return (
        <div className="group p-4 rounded-xl border border-gray-200 hover:border-main/30 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <a href={link.shortUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-main hover:underline truncate">
                            {link.shortUrl}
                        </a>
                        {link.isCustom && <span className="text-xs px-2 py-0.5 rounded-full bg-main/10 text-main font-medium">Tùy chỉnh</span>}
                        {isExpired && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-500 font-medium">Hết hạn</span>}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{link.originalUrl}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Mouse size={12} variant='Outline' />{link.clicks.toLocaleString('vi-VN')} lượt click</span>
                        {link.expiresAt && <span className={`flex items-center gap-1 ${isExpired ? 'text-red-400' : ''}`}><Calendar size={12} variant='Outline' />{new Date(link.expiresAt).toLocaleDateString('vi-VN')}</span>}
                        {link.user && <span className="flex items-center gap-1"><Profile2User size={12} />{link.user.name || link.user.email}</span>}
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <CopyButton text={link.shortUrl} />
                    <a href={link.originalUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Mở link gốc">
                        <ExportSquare size={16} variant="Outline" className="text-gray-500" />
                    </a>
                    <button onClick={() => onDelete(link.shortCode)} className="p-2 rounded-lg hover:bg-red-50 transition-colors" title="Xóa link">
                        <Trash size={16} variant="Outline" className="text-red-500" />
                    </button>
                </div>
            </div>
        </div>
    );
}