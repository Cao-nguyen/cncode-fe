'use client';

import { useState, useEffect } from 'react';
import { Bookmark, Copy, Flag, Facebook, MoreHorizontal, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { postApi } from '@/lib/api/post.api';
import { useAuthStore } from '@/store/auth.store';

const REPORT_REASONS = [
    'Nội dung spam hoặc quảng cáo',
    'Nội dung không phù hợp',
    'Thông tin sai lệch',
    'Vi phạm bản quyền',
    'Ngôn ngữ thù địch',
    'Lý do khác',
];

interface BlogActionsProps {
    postId: string;
    isBookmarked?: boolean;
    onBookmarkChange?: (bookmarked: boolean) => void;
}

export default function BlogActions({ postId, isBookmarked = false, onBookmarkChange }: BlogActionsProps) {
    const { token } = useAuthStore();
    const [bookmarked, setBookmarked] = useState(isBookmarked);
    const [reportOpen, setReportOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState('');
    const [reporting, setReporting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        setBookmarked(isBookmarked);
    }, [isBookmarked]);

    const handleBookmark = async () => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để lưu bài viết');
            return;
        }

        if (isProcessing) return;
        setIsProcessing(true);

        const newBookmarked = !bookmarked;
        setBookmarked(newBookmarked);
        onBookmarkChange?.(newBookmarked);

        try {
            const result = await postApi.bookmarkPost(postId, token);
            if (result.success) {
                toast.success(result.data.bookmarked ? 'Đã lưu bài viết' : 'Đã bỏ lưu bài viết');
                if (result.data.bookmarked !== newBookmarked) {
                    setBookmarked(result.data.bookmarked);
                    onBookmarkChange?.(result.data.bookmarked);
                }
            } else {
                setBookmarked(!newBookmarked);
                onBookmarkChange?.(!newBookmarked);
                toast.error('Có lỗi xảy ra');
            }
        } catch (error) {
            setBookmarked(!newBookmarked);
            onBookmarkChange?.(!newBookmarked);
            toast.error('Có lỗi xảy ra');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Đã sao chép liên kết');
        } catch {
            toast.error('Không thể sao chép');
        }
    };

    const shareFacebook = () => {
        const appId = '1660889691575547';
        const postUrl = encodeURIComponent(window.location.href);
        const redirectUri = encodeURIComponent(window.location.href);
        window.open(
            `https://www.facebook.com/dialog/feed?app_id=${appId}&display=popup&link=${postUrl}&redirect_uri=${redirectUri}`,
            '_blank',
            'width=600,height=400,noopener,noreferrer',
        );
    };

    const handleReport = async () => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để báo cáo');
            return;
        }
        if (!selectedReason) {
            toast.error('Vui lòng chọn lý do báo cáo');
            return;
        }
        setReporting(true);
        try {
            const result = await postApi.reportPost(postId, selectedReason, token);
            if (result.success) {
                toast.success('Đã gửi báo cáo, cảm ơn bạn!');
                setReportOpen(false);
                setSelectedReason('');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setReporting(false);
        }
    };

    return (
        <>
            <div className="flex items-center gap-3 md:gap-4">
                <button
                    onClick={handleBookmark}
                    disabled={isProcessing}
                    className="transition cursor-pointer p-1 rounded-full hover:bg-main/10 disabled:opacity-50"
                    aria-label="Lưu bài viết"
                >
                    <Bookmark
                        size={22}
                        fill={bookmarked ? '#eab308' : 'none'}
                        className={bookmarked ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'}
                    />
                </button>

                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="p-1 rounded-full hover:bg-main/10 transition cursor-pointer"
                            aria-label="Thêm tùy chọn"
                        >
                            <MoreHorizontal size={22} className="text-gray-500 dark:text-gray-400" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        side="bottom"
                        sideOffset={8}
                        className="w-56 rounded-xl p-1 flex flex-col gap-1 z-50"
                    >
                        <DropdownMenuItem
                            onClick={shareFacebook}
                            className="py-2 flex items-center gap-2 cursor-pointer hover:bg-main/10 focus:bg-main/10"
                        >
                            <Facebook size={20} className="text-main" />
                            <span>Chia sẻ lên Facebook</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={handleCopy}
                            className="py-2 flex items-center gap-3 cursor-pointer hover:bg-main/10 focus:bg-main/10"
                        >
                            <Copy size={20} className="text-main" />
                            <span>Sao chép liên kết</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setReportOpen(true)}
                            className="py-2 flex items-center gap-3 text-red-500 cursor-pointer hover:bg-red-50 focus:bg-red-50"
                        >
                            <Flag size={20} />
                            <span>Báo cáo bài viết</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-main">Báo cáo bài viết</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <p className="text-sm text-gray-500">Chọn lý do báo cáo:</p>
                        {REPORT_REASONS.map((reason) => (
                            <button
                                key={reason}
                                onClick={() => setSelectedReason(reason)}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition flex items-center justify-between border ${selectedReason === reason
                                    ? 'border-main bg-main/10 text-main font-medium'
                                    : 'border-gray-200 dark:border-gray-800 hover:bg-main/5'
                                    }`}
                            >
                                {reason}
                                {selectedReason === reason && <Check size={15} className="text-main" />}
                            </button>
                        ))}
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setReportOpen(false)}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handleReport}
                            disabled={reporting || !selectedReason}
                            className="bg-main hover:bg-main-dark text-white"
                        >
                            {reporting ? 'Đang gửi...' : 'Gửi báo cáo'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}