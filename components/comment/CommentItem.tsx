'use client';
import { useState, useEffect, useRef } from 'react';
import {
    MoreHorizontal,
    Flag,
    Edit2,
    Trash2,
    X,
    Check,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import { CustomTextCmt } from '@/components/custom/CustomTextCmt';
import { commentApi } from '@/lib/api/comment.api';
import { getImageUrl } from '@/lib/utils/imageUrl';

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
    onReport: (
        commentId: string,
        reason: string,
        description?: string
    ) => void;
    onLoadMoreReplies?: (commentId: string) => void;
    parentUserName?: string;
    isReply?: boolean;
}

const REACTION_TYPES = [
    { type: 'like', icon: '/icons/like.svg', label: 'Thích' },
    { type: 'love', icon: '/icons/love.svg', label: 'Yêu thích' },
    { type: 'care', icon: '/icons/care.svg', label: 'Quan tâm' },
    { type: 'haha', icon: '/icons/haha.svg', label: 'Haha' },
    { type: 'wow', icon: '/icons/wow.svg', label: 'Wow' },
    { type: 'sad', icon: '/icons/sad.svg', label: 'Buồn' },
    { type: 'angry', icon: '/icons/angry.svg', label: 'Phẫn nộ' }
];

const REPORT_REASONS = [
    { value: 'spam', label: 'Spam - Quảng cáo, lặp lại nội dung' },
    { value: 'harassment', label: 'Quấy rối - Đe dọa, xúc phạm cá nhân' },
    { value: 'hate_speech', label: 'Ngôn từ thù địch - Kỳ thị, phân biệt' },
    { value: 'violence', label: 'Bạo lực - Cổ vũ bạo lực, nguy hiểm' },
    { value: 'misinformation', label: 'Tin giả - Thông tin sai lệch' },
    { value: 'inappropriate', label: 'Không phù hợp - Nội dung nhạy cảm' },
    { value: 'other', label: 'Khác - Vui lòng nhập lý do cụ thể' }
];

function HighlightedText({
    text,
    parentUserName
}: {
    text: string;
    parentUserName?: string;
}) {
    if (parentUserName) {
        const escapedName = parentUserName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(@${escapedName})(?=\\s|$)`, 'g');
        const parts = text.split(regex);
        return (
            <span className="text-sm text-gray-700 break-words leading-relaxed">
                {parts.map((part, index) => {
                    if (part === `@${parentUserName}`) {
                        return (
                            <span key={index} className="font-semibold text-blue-600">
                                {part}
                            </span>
                        );
                    }
                    return part;
                })}
            </span>
        );
    }

    const parts = text.split(/(@\S+)/g);
    return (
        <span className="text-sm text-gray-700 break-words leading-relaxed">
            {parts.map((part, index) => {
                if (part.startsWith('@')) {
                    return (
                        <span key={index} className="font-semibold text-blue-600">
                            {part}
                        </span>
                    );
                }
                return part;
            })}
        </span>
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
    parentUserName,
    isReply = false
}: CommentItemProps) {
    const { user } = useAuthStore();
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [replyContent, setReplyContent] = useState('');
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showAllReplies, setShowAllReplies] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [showReactionModal, setShowReactionModal] = useState(false);
    const [reactionUsers, setReactionUsers] = useState<Array<{
        userId: CommentUser;
        reactionType: string;
        createdAt: string;
    }>>([]);
    const [loadingReactions, setLoadingReactions] = useState(false);
    const [selectedReactionTab, setSelectedReactionTab] = useState('all');

    const reactionPickerRef = useRef<HTMLDivElement>(null);
    const moreMenuRef = useRef<HTMLDivElement>(null);
    const moreButtonRef = useRef<HTMLButtonElement>(null);

    const isOwner = user?._id === comment.userId?._id;
    const reactionCount = Object.values(comment.reactions || {}).reduce((a, b) => a + b, 0);

    const activeReactions = Object.entries(comment.reactions || {})
        .filter(([, count]) => count > 0)
        .map(([type]) => ({
            type,
            icon: REACTION_TYPES.find((rt) => rt.type === type)?.icon || '',
            label: REACTION_TYPES.find((rt) => rt.type === type)?.label || type
        }));

    const replies = comment.replies || [];
    const visibleReplies = showAllReplies ? replies : replies.slice(0, 3);
    const hiddenRepliesCount = replies.length - 3;

    const getDisplayContent = () => {
        if (comment.parentId && parentUserName) {
            if (!comment.content.startsWith(`@${parentUserName}`)) {
                return `@${parentUserName} ${comment.content}`;
            }
        }
        return comment.content;
    };

    const formatTime = (date: string): string => {
        return formatDistanceToNow(new Date(date), {
            addSuffix: true,
            locale: vi
        });
    };

    // Click outside handlers
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (reactionPickerRef.current && !reactionPickerRef.current.contains(event.target as Node)) {
                setShowReactionPicker(false);
            }
            if (
                moreMenuRef.current &&
                !moreMenuRef.current.contains(event.target as Node) &&
                moreButtonRef.current &&
                !moreButtonRef.current.contains(event.target as Node)
            ) {
                setShowMoreMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Prevent scroll when modal open
    useEffect(() => {
        if (showReportModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showReportModal]);

    const handleLike = (type: string) => {
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
        if (parentUserName) content = `@${parentUserName} ${replyContent}`;
        await onReply(comment._id, content);
        setReplyContent('');
        setShowReplyInput(false);
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

    const handleReportSubmit = () => {
        if (!selectedReason) {
            toast.warning('Vui lòng chọn lý do báo cáo');
            return;
        }
        const description = selectedReason === 'other' ? customReason : undefined;
        onReport(comment._id, selectedReason, description);
        setShowReportModal(false);
        setSelectedReason('');
        setCustomReason('');
    };

    const getUserAvatar = () => comment.userId?.avatar;
    const getUserInitial = () => comment.userId?.fullName?.charAt(0).toUpperCase() || 'U';
    const getUserName = () => comment.userId?.fullName || 'Người dùng';

    const currentReaction = comment.userReaction
        ? REACTION_TYPES.find((rt) => rt.type === comment.userReaction)
        : null;

    const fetchReactionUsers = async (reactionType: string = 'all') => {
        const { token } = useAuthStore.getState();
        if (!token) return;
        setLoadingReactions(true);
        try {
            const result = await commentApi.getReactionUsers(
                token,
                comment._id,
                reactionType === 'all' ? undefined : reactionType
            );
            if (result.success) {
                setReactionUsers(result.data || []);
            }
        } catch (error) {
            console.error('Fetch reaction users error:', error);
        } finally {
            setLoadingReactions(false);
        }
    };

    const handleOpenReactionModal = () => {
        setShowReactionModal(true);
        fetchReactionUsers('all');
    };

    const handleReactionTabChange = (tab: string) => {
        setSelectedReactionTab(tab);
        fetchReactionUsers(tab);
    };

    return (
        <>
            <div className="flex gap-3 mb-3 w-full items-start">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    {getUserAvatar() ? (
                        <img
                            src={getImageUrl(getUserAvatar()!)}
                            alt={getUserName()}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-base"
                        style={{ display: getUserAvatar() ? 'none' : 'flex' }}
                    >
                        {getUserInitial()}
                    </div>
                </div>

                {/* Nội dung */}
                <div className="flex-1 min-w-0 max-w-full overflow-hidden">
                    <div className="relative">
                        <div className="px-1 py-1">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 flex-wrap min-w-0">
                                    <span className="font-semibold text-sm text-gray-900 truncate max-w-[120px]">
                                        {getUserName()}
                                    </span>
                                    <span className="text-gray-300">·</span>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {formatTime(comment.createdAt)}
                                    </span>
                                    {comment.isEdited && (
                                        <span className="text-xs text-gray-400 whitespace-nowrap">(đã sửa)</span>
                                    )}
                                </div>

                                <button
                                    ref={moreButtonRef}
                                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                                    className="p-1.5 rounded-full hover:bg-gray-200 transition text-gray-400 hover:text-gray-600 flex-shrink-0"
                                >
                                    <MoreHorizontal size={14} />
                                </button>

                                {showMoreMenu && (
                                    <div
                                        ref={moreMenuRef}
                                        className="absolute right-0 top-6 z-[100] bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px]"
                                    >
                                        {!isOwner && (
                                            <button
                                                onClick={() => {
                                                    setShowMoreMenu(false);
                                                    setShowReportModal(true);
                                                }}
                                                className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <Flag size={14} />
                                                Báo cáo
                                            </button>
                                        )}
                                        {isOwner && !isEditing && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setIsEditing(true);
                                                        setShowMoreMenu(false);
                                                    }}
                                                    className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <Edit2 size={14} />
                                                    Chỉnh sửa
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        onDelete(comment._id);
                                                        setShowMoreMenu(false);
                                                    }}
                                                    className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <Trash2 size={14} />
                                                    Xóa
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="mt-2 w-full">
                                    <CustomTextCmt
                                        value={editContent}
                                        onChange={setEditContent}
                                        rows={3}
                                        placeholder="Chỉnh sửa bình luận..."
                                        autoFocus
                                        onSubmit={handleSubmitEdit}
                                        onCancel={() => setIsEditing(false)}
                                        submitLabel="Lưu"
                                        cancelLabel="Hủy"
                                        isSubmitting={isSubmitting}
                                    />
                                </div>
                            ) : (
                                <div className="mt-1 break-words w-full overflow-hidden">
                                    <HighlightedText
                                        text={getDisplayContent()}
                                        parentUserName={parentUserName}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {!comment.isDeleted && (
                        <div className="relative mt-2">
                            {showReactionPicker && (
                                <div
                                    ref={reactionPickerRef}
                                    className="absolute bottom-8 left-0 z-20 bg-white rounded-full shadow-lg border border-gray-200 flex p-1 gap-1"
                                >
                                    {REACTION_TYPES.map((rt) => (
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

                            <div className="flex flex-wrap items-center gap-2 px-1">
                                {/* Like, Reply, Reaction count buttons... giữ nguyên như cũ */}
                                <button
                                    onClick={() => setShowReactionPicker(!showReactionPicker)}
                                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs hover:bg-gray-200 transition text-gray-500 hover:text-gray-700"
                                >
                                    {currentReaction ? (
                                        <>
                                            <img src={currentReaction.icon} alt={currentReaction.label} className="w-4 h-4" />
                                            <span className="text-blue-600 font-medium">{currentReaction.label}</span>
                                        </>
                                    ) : (
                                        <>
                                            <img src="/editor/like.png" alt="Like" className="w-3.5 h-3.5" />
                                            <span>Thích</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => setShowReplyInput(!showReplyInput)}
                                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs text-gray-500 hover:bg-gray-200 transition hover:text-gray-700"
                                >
                                    <img src="/editor/chat.png" alt="Reply" className="w-3.5 h-3.5" />
                                    <span>Phản hồi</span>
                                    {comment.replyCount > 0 && (
                                        <span className="text-gray-400">({comment.replyCount})</span>
                                    )}
                                </button>

                                {reactionCount > 0 && (
                                    <button
                                        onClick={handleOpenReactionModal}
                                        className="flex items-center gap-1 px-2 py-0.5 cursor-pointer hover:bg-gray-200 rounded-full transition text-gray-500 hover:text-gray-700"
                                    >
                                        {activeReactions.slice(0, 3).map((reaction, idx) => (
                                            <img
                                                key={`${reaction.type}-${idx}`}
                                                src={reaction.icon}
                                                alt={reaction.label}
                                                className="w-3.5 h-3.5"
                                            />
                                        ))}
                                        <span className="text-xs font-medium">{reactionCount}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {showReplyInput && (
                        <div className="mt-3 w-full">
                            <CustomTextCmt
                                value={replyContent}
                                onChange={setReplyContent}
                                rows={2}
                                placeholder={`Phản hồi ${getUserName()}...`}
                                autoFocus
                                onSubmit={handleSubmitReply}
                                onCancel={() => setShowReplyInput(false)}
                                submitLabel="Phản hồi"
                                cancelLabel="Hủy"
                                isSubmitting={isSubmitting}
                            />
                        </div>
                    )}

                    {replies.length > 0 && (
                        <div className="mt-3 relative">
                            <div className="space-y-0">
                                {visibleReplies.map((reply) => (
                                    <CommentItem
                                        key={reply._id}
                                        comment={reply}
                                        onLike={onLike}
                                        onReply={onReply}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onReport={onReport}
                                        onLoadMoreReplies={onLoadMoreReplies}
                                        parentUserName={getUserName()}
                                        isReply={true}
                                    />
                                ))}

                                {hiddenRepliesCount > 0 && !showAllReplies && (
                                    <button
                                        onClick={() => setShowAllReplies(true)}
                                        className="text-xs text-blue-500 hover:text-blue-600 mt-2"
                                    >
                                        Xem thêm {hiddenRepliesCount} phản hồi
                                    </button>
                                )}
                                {replies.length > 3 && showAllReplies && (
                                    <button
                                        onClick={() => setShowAllReplies(false)}
                                        className="text-xs text-blue-500 hover:text-blue-600 mt-2"
                                    >
                                        Thu gọn
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowReportModal(false)}>
                    <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
                        {/* Modal content giữ nguyên như code cũ của bạn */}
                        {/* ... (bạn có thể copy phần modal từ code cũ) */}
                    </div>
                </div>
            )}

            {/* Reaction Modal - Giữ nguyên như cũ */}
            {showReactionModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowReactionModal(false)}>
                    {/* Modal content giữ nguyên */}
                </div>
            )}
        </>
    );
}