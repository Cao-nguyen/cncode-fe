// components/comment/CommentItem.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { MoreHorizontal, Flag, Edit2, Trash2, X, Check, MessageCircle, Heart, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { commentApi } from '@/lib/api/comment.api';

interface CommentUser {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
    username?: string;
}

interface CommentType {
    _id: string;
    userId: CommentUser;
    content: string;
    attachments: string[];
    reactions: Record<string, number>;
    replyCount: number;
    isEdited: boolean;
    editedAt: string | null;
    isDeleted: boolean;
    createdAt: string;
    parentId?: string;
    userReaction?: string | null;
    replies?: CommentType[];
}

interface CommentItemProps {
    comment: CommentType;
    onLike: (commentId: string, type: string) => void;
    onReply: (commentId: string, content: string) => void;
    onEdit: (commentId: string, content: string) => void;
    onDelete: (commentId: string) => void;
    onReport: (commentId: string, reason: string, description?: string) => void;
    onLoadMoreReplies?: (commentId: string) => void;
    isReply?: boolean;
    depth?: number;
    parentUserName?: string;
}

const REACTION_TYPES: { type: string; icon: string; label: string }[] = [
    { type: 'like', icon: '/icons/like.svg', label: 'Thích' },
    { type: 'love', icon: '/icons/love.svg', label: 'Yêu thích' },
    { type: 'care', icon: '/icons/care.svg', label: 'Quan tâm' },
    { type: 'haha', icon: '/icons/haha.svg', label: 'Haha' },
    { type: 'wow', icon: '/icons/wow.svg', label: 'Wow' },
    { type: 'sad', icon: '/icons/sad.svg', label: 'Buồn' },
    { type: 'angry', icon: '/icons/angry.svg', label: 'Phẫn nộ' }
];

const REPORT_REASONS: { value: string; label: string }[] = [
    { value: 'spam', label: 'Spam - Quảng cáo, lặp lại nội dung' },
    { value: 'harassment', label: 'Quấy rối - Đe dọa, xúc phạm cá nhân' },
    { value: 'hate_speech', label: 'Ngôn từ thù địch - Kỳ thị, phân biệt' },
    { value: 'violence', label: 'Bạo lực - Cổ vũ bạo lực, nguy hiểm' },
    { value: 'misinformation', label: 'Tin giả - Thông tin sai lệch' },
    { value: 'inappropriate', label: 'Không phù hợp - Nội dung nhạy cảm' },
    { value: 'other', label: 'Khác - Vui lòng nhập lý do cụ thể' }
];

interface ReactionUser {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
    username?: string;
}

interface ReactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    commentId: string;
    reactionsCount: Record<string, number>;
}

function ReactionModal({ isOpen, onClose, commentId, reactionsCount }: ReactionModalProps) {
    const { token } = useAuthStore();
    const [activeTab, setActiveTab] = useState<string>('all');
    const [users, setUsers] = useState<ReactionUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(false);

    const totalCount = Object.values(reactionsCount).reduce((a, b) => a + b, 0);

    const tabs: { type: string; label: string; icon: string | null; count: number }[] = [
        { type: 'all', label: 'Tất cả', icon: null, count: totalCount },
        ...REACTION_TYPES.map(rt => ({
            type: rt.type,
            label: rt.label,
            icon: rt.icon,
            count: reactionsCount[rt.type] || 0
        })).filter(tab => tab.count > 0)
    ];

    useEffect(() => {
        if (isOpen && token) {
            setActiveTab('all');
            setPage(1);
            setUsers([]);
            fetchUsers(1, 'all');
        }
    }, [isOpen, token, commentId]);

    useEffect(() => {
        if (isOpen && token) {
            setPage(1);
            setUsers([]);
            fetchUsers(1, activeTab);
        }
    }, [activeTab]);

    const fetchUsers = async (pageNum: number, tabType: string) => {
        if (!token) return;
        setLoading(true);
        try {
            const reactionType = tabType === 'all' ? undefined : tabType;
            const result = await commentApi.getReactionUsers(token, commentId, reactionType, pageNum);
            if (result.success) {
                if (pageNum === 1) {
                    setUsers(result.data);
                } else {
                    setUsers(prev => [...prev, ...result.data]);
                }
                setTotalPages(result.totalPages);
                setHasMore(pageNum < result.totalPages);
            }
        } catch (error) {
            console.error('Fetch reaction users error:', error);
            toast.error('Không thể tải danh sách');
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (hasMore && !loading) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchUsers(nextPage, activeTab);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Cảm xúc</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                    >
                        <X size={16} className="text-gray-500" />
                    </button>
                </div>

                <div className="sticky top-[57px] bg-white border-b border-gray-100 px-3">
                    <div className="flex gap-1 overflow-x-auto no-scrollbar">
                        {tabs.map(tab => (
                            <button
                                key={tab.type}
                                onClick={() => setActiveTab(tab.type)}
                                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition border-b-2 flex-shrink-0 ${activeTab === tab.type
                                    ? 'text-blue-500 border-blue-500'
                                    : 'text-gray-500 border-transparent hover:text-gray-700'
                                    }`}
                            >
                                {tab.icon && <img src={tab.icon} alt={tab.label} className="w-4 h-4" />}
                                <span>{tab.label}</span>
                                <span className="text-xs text-gray-400">({tab.count})</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-y-auto max-h-[calc(80vh-110px)] p-3">
                    {loading && users.length === 0 ? (
                        <div className="flex justify-center py-8">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <p>Chưa có ai</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {users.map((user) => (
                                <div key={user._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden">
                                        {user.avatar ? (
                                            <Image src={user.avatar} alt={user.fullName} width={40} height={40} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white font-bold text-sm">{user.fullName?.charAt(0).toUpperCase() || 'U'}</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{user.fullName}</p>
                                        <p className="text-xs text-gray-400">@{user.username || user.fullName}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {hasMore && (
                        <div className="text-center py-3">
                            <button
                                onClick={loadMore}
                                disabled={loading}
                                className="text-sm text-blue-500 hover:text-blue-600 transition"
                            >
                                {loading ? 'Đang tải...' : 'Xem thêm'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string, description?: string) => void;
    userName: string;
    commentContent: string;
}

function ReportModal({ isOpen, onClose, onSubmit, userName, commentContent }: ReportModalProps) {
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [customReason, setCustomReason] = useState<string>('');

    const handleClose = () => {
        setSelectedReason('');
        setCustomReason('');
        onClose();
    };

    const handleSubmit = () => {
        if (!selectedReason) {
            toast.warning('Vui lòng chọn lý do báo cáo');
            return;
        }
        const description = selectedReason === 'other' ? customReason : undefined;
        onSubmit(selectedReason, description);
        setSelectedReason('');
        setCustomReason('');
    };

    if (!isOpen) return null;

    const truncatedContent = commentContent.length > 100 ? `${commentContent.substring(0, 100)}...` : commentContent;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4" onClick={handleClose}>
            <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl relative" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white px-5 py-4 border-b border-gray-100 flex justify-between items-center z-10">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={20} className="text-red-500" />
                        <h3 className="text-lg font-semibold text-gray-800">Báo cáo bình luận</h3>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                    >
                        <X size={16} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    <p className="text-sm text-gray-600">
                        Bình luận từ <span className="font-semibold">{userName}</span>
                    </p>
                    <div className="p-3 bg-gray-50 rounded-lg italic text-sm text-gray-500">
                        {`"${truncatedContent}"`}
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                            Lý do báo cáo <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                            {REPORT_REASONS.map(reason => (
                                <label key={reason.value} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition">
                                    <input
                                        type="radio"
                                        name="reportReason"
                                        value={reason.value}
                                        checked={selectedReason === reason.value}
                                        onChange={(e) => setSelectedReason(e.target.value)}
                                        className="mt-0.5 w-4 h-4 text-red-500 focus:ring-red-500"
                                    />
                                    <span className="text-sm text-gray-700 flex-1">{reason.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {selectedReason === 'other' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Nhập lý do cụ thể
                            </label>
                            <CustomTextarea
                                value={customReason}
                                onChange={setCustomReason}
                                rows={3}
                                placeholder="Vui lòng mô tả chi tiết lý do báo cáo..."
                            />
                        </div>
                    )}
                </div>

                <div className="flex gap-3 p-5 pt-0">
                    <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition flex items-center justify-center gap-2"
                    >
                        <Flag size={16} />
                        Gửi báo cáo
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CommentItem({
    comment,
    onLike,
    onReply,
    onEdit,
    onDelete,
    onReport,
    onLoadMoreReplies,
    isReply = false,
    depth = 0,
    parentUserName
}: CommentItemProps) {
    const { user, token } = useAuthStore();
    const [showReplyInput, setShowReplyInput] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editContent, setEditContent] = useState<string>(comment.content);
    const [replyContent, setReplyContent] = useState<string>('');
    const [showReactionPicker, setShowReactionPicker] = useState<boolean>(false);
    const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
    const [showAllReplies, setShowAllReplies] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showReportModal, setShowReportModal] = useState<boolean>(false);
    const [showReactionModal, setShowReactionModal] = useState<boolean>(false);
    const [replies, setReplies] = useState<CommentType[]>(comment.replies || []);
    const [repliesPage, setRepliesPage] = useState<number>(1);
    const [repliesTotalPages, setRepliesTotalPages] = useState<number>(1);
    const [repliesLoading, setRepliesLoading] = useState<boolean>(false);
    const [hasMoreReplies, setHasMoreReplies] = useState<boolean>(false);

    const reactionPickerRef = useRef<HTMLDivElement>(null);
    const moreMenuRef = useRef<HTMLDivElement>(null);
    const moreButtonRef = useRef<HTMLButtonElement>(null);

    const isOwner = user?._id === comment.userId?._id;
    const reactionCount = Object.values(comment.reactions || {}).reduce((a, b) => a + b, 0);

    const activeReactions = Object.entries(comment.reactions || {})
        .filter(([, count]) => count > 0)
        .map(([type]) => ({
            type,
            icon: REACTION_TYPES.find(rt => rt.type === type)?.icon || '',
            label: REACTION_TYPES.find(rt => rt.type === type)?.label || type
        }));

    const displayContent = comment.parentId && parentUserName
        ? `@${parentUserName} ${comment.content}`
        : comment.content;

    const visibleReplies = showAllReplies ? replies : replies.slice(0, 3);
    const hiddenRepliesCount = replies.length - 3;

    const formatTime = (date: string): string => {
        return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
    };

    const fetchReplies = async (pageNum: number, append: boolean = false) => {
        if (!token && pageNum > 1) return;
        setRepliesLoading(true);
        try {
            const result = await commentApi.getReplies(comment._id, pageNum, 10);
            if (result.success) {
                if (append) {
                    setReplies(prev => [...prev, ...result.data]);
                } else {
                    setReplies(result.data);
                }
                if (result.pagination) {
                    setRepliesTotalPages(result.pagination.totalPages);
                    setHasMoreReplies(pageNum < result.pagination.totalPages);
                }
            }
        } catch (error) {
            console.error('Fetch replies error:', error);
        } finally {
            setRepliesLoading(false);
        }
    };

    useEffect(() => {
        if (comment.replyCount > 0) {
            fetchReplies(1);
        }
    }, [comment._id, comment.replyCount]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (reactionPickerRef.current && !reactionPickerRef.current.contains(event.target as Node)) {
                setShowReactionPicker(false);
            }
        };
        if (showReactionPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showReactionPicker]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                moreMenuRef.current &&
                !moreMenuRef.current.contains(event.target as Node) &&
                moreButtonRef.current &&
                !moreButtonRef.current.contains(event.target as Node)
            ) {
                setShowMoreMenu(false);
            }
        };
        if (showMoreMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMoreMenu]);

    useEffect(() => {
        if (showReportModal || showReactionModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [showReportModal, showReactionModal]);

    const handleLike = (type: string): void => {
        onLike(comment._id, type);
        setShowReactionPicker(false);
    };

    const handleSubmitReply = async () => {
        if (!replyContent.trim()) {
            toast.warning('Vui lòng nhập nội dung');
            return;
        }
        setIsSubmitting(true);
        let content = replyContent;
        if (parentUserName) {
            content = `@${parentUserName} ${replyContent}`;
        }
        await onReply(comment._id, content);
        setReplyContent('');
        setShowReplyInput(false);
        await fetchReplies(1);
        setIsSubmitting(false);
    };

    const handleSubmitEdit = async () => {
        if (!editContent.trim()) {
            toast.warning('Vui lòng nhập nội dung');
            return;
        }
        setIsSubmitting(true);
        await onEdit(comment._id, editContent);
        setIsEditing(false);
        setIsSubmitting(false);
    };

    const handleOpenReportModal = () => {
        setShowMoreMenu(false);
        setShowReportModal(true);
    };

    const handleSubmitReport = (reason: string, description?: string) => {
        onReport(comment._id, reason, description);
        setShowReportModal(false);
    };

    const loadMoreReplies = () => {
        if (hasMoreReplies && !repliesLoading) {
            const nextPage = repliesPage + 1;
            setRepliesPage(nextPage);
            fetchReplies(nextPage, true);
        }
    };

    const getUserAvatar = () => comment.userId?.avatar;
    const getUserInitial = () => comment.userId?.fullName?.charAt(0).toUpperCase() || 'U';
    const getUserName = () => comment.userId?.fullName || 'Người dùng';

    const currentReaction = comment.userReaction ? REACTION_TYPES.find(rt => rt.type === comment.userReaction) : null;

    return (
        <>
            <div className={`flex gap-3 ${!isReply ? 'mb-4' : 'mb-3'}`} style={{ marginLeft: isReply ? `${Math.min(depth * 24, 48)}px` : 0 }}>
                <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden">
                        {getUserAvatar() ? (
                            <Image src={getUserAvatar()!} alt={getUserName()} width={32} height={32} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-white font-bold text-sm">{getUserInitial()}</span>
                        )}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                            <div className="flex items-center flex-wrap gap-1">
                                <span className="font-semibold text-sm text-gray-800">{getUserName()}</span>
                                <span className="text-xs text-gray-400">{formatTime(comment.createdAt)}</span>
                                {comment.isEdited && (
                                    <span className="text-xs text-gray-400">(đã sửa)</span>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    ref={moreButtonRef}
                                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                                    className="p-1 rounded-lg hover:bg-gray-200 transition"
                                >
                                    <MoreHorizontal size={14} className="text-gray-400" />
                                </button>

                                {showMoreMenu && (
                                    <div
                                        ref={moreMenuRef}
                                        className="absolute right-0 top-6 z-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px]"
                                    >
                                        {!isOwner && (
                                            <button
                                                onClick={handleOpenReportModal}
                                                className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                            >
                                                <Flag size={14} />
                                                Báo cáo bình luận
                                            </button>
                                        )}

                                        {isOwner && !isEditing && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setIsEditing(true);
                                                        setShowMoreMenu(false);
                                                    }}
                                                    className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                >
                                                    <Edit2 size={14} />
                                                    Chỉnh sửa
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        onDelete(comment._id);
                                                        setShowMoreMenu(false);
                                                    }}
                                                    className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                    Xóa bình luận
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="space-y-2 mt-2">
                                <CustomTextarea
                                    value={editContent}
                                    onChange={setEditContent}
                                    rows={3}
                                    placeholder="Chỉnh sửa bình luận..."
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSubmitEdit}
                                        disabled={isSubmitting}
                                        className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                                    >
                                        {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-3 py-1 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className={`text-sm text-gray-700 break-words mt-1 ${comment.isDeleted ? 'italic text-gray-400' : ''}`}>
                                {displayContent}
                            </p>
                        )}
                    </div>

                    {!comment.isDeleted && (
                        <div className="flex items-center gap-3 mt-1 ml-1 relative">
                            {showReactionPicker && (
                                <div ref={reactionPickerRef} className="absolute bottom-8 left-0 z-10 bg-white rounded-full shadow-lg border border-gray-200 flex p-1 gap-0.5">
                                    {REACTION_TYPES.map(rt => (
                                        <button
                                            key={rt.type}
                                            onClick={() => handleLike(rt.type)}
                                            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-transform hover:scale-110"
                                        >
                                            <img src={rt.icon} alt={rt.label} className="w-5 h-5" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div>
                                <button
                                    onClick={() => setShowReactionPicker(!showReactionPicker)}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition ${comment.userReaction ? 'bg-blue-50' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    {currentReaction ? (
                                        <>
                                            <img src={currentReaction.icon} alt={currentReaction.label} className="w-4 h-4" />
                                            <span className="text-blue-600">{currentReaction.label}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Heart size={14} className="text-gray-500" />
                                            <span className="text-gray-500">Thích</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            <button
                                onClick={() => setShowReplyInput(!showReplyInput)}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-gray-500 hover:bg-gray-100 transition"
                            >
                                <MessageCircle size={12} />
                                <span>Phản hồi</span>
                                {comment.replyCount > 0 && <span>({comment.replyCount})</span>}
                            </button>
                        </div>
                    )}

                    {reactionCount > 0 && (
                        <div className="mt-1 ml-1">
                            <button
                                onClick={() => setShowReactionModal(true)}
                                className="text-xs text-gray-500 hover:text-blue-600 hover:underline transition flex items-center gap-0.5"
                            >
                                {activeReactions.slice(0, 3).map((reaction, idx) => (
                                    <img key={`${reaction.type}-${idx}`} src={reaction.icon} alt={reaction.label} className="w-3.5 h-3.5" />
                                ))}
                                <span className="ml-0.5">{reactionCount}</span>
                            </button>
                        </div>
                    )}

                    {showReplyInput && (
                        <div className="mt-3 flex gap-2">
                            <CustomTextarea
                                value={replyContent}
                                onChange={setReplyContent}
                                rows={2}
                                placeholder={`Phản hồi ${getUserName()}...`}
                                className="flex-1"
                            />
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={handleSubmitReply}
                                    disabled={isSubmitting}
                                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                                >
                                    {isSubmitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={16} />}
                                </button>
                                <button
                                    onClick={() => setShowReplyInput(false)}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                                >
                                    <X size={16} className="text-gray-500" />
                                </button>
                            </div>
                        </div>
                    )}

                    {replies.length > 0 && (
                        <div className="mt-3 space-y-3">
                            {visibleReplies.map(reply => (
                                <CommentItem
                                    key={reply._id}
                                    comment={reply}
                                    onLike={onLike}
                                    onReply={onReply}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onReport={onReport}
                                    onLoadMoreReplies={onLoadMoreReplies}
                                    isReply={true}
                                    depth={depth + 1}
                                    parentUserName={getUserName()}
                                />
                            ))}

                            {hiddenRepliesCount > 0 && !showAllReplies && (
                                <button
                                    onClick={() => setShowAllReplies(true)}
                                    className="text-xs text-blue-500 hover:text-blue-600 mt-1 ml-1"
                                >
                                    {`Xem thêm ${hiddenRepliesCount} phản hồi`}
                                </button>
                            )}

                            {replies.length > 3 && showAllReplies && (
                                <button
                                    onClick={() => setShowAllReplies(false)}
                                    className="text-xs text-blue-500 hover:text-blue-600 mt-1 ml-1"
                                >
                                    Thu gọn
                                </button>
                            )}

                            {hasMoreReplies && showAllReplies && (
                                <button
                                    onClick={loadMoreReplies}
                                    disabled={repliesLoading}
                                    className="text-xs text-blue-500 hover:text-blue-600 mt-1 ml-1"
                                >
                                    {repliesLoading ? 'Đang tải...' : 'Xem thêm phản hồi'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                onSubmit={handleSubmitReport}
                userName={getUserName()}
                commentContent={comment.content}
            />

            <ReactionModal
                isOpen={showReactionModal}
                onClose={() => setShowReactionModal(false)}
                commentId={comment._id}
                reactionsCount={comment.reactions || {}}
            />
        </>
    );
}