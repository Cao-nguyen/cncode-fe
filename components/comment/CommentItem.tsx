'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
import { getImageUrl, getVideoUrl } from '@/lib/utils/imageUrl';
import StaticContent from '@/components/common/StaticContent';
import { isHtmlContent, isCommentContentEmpty, sanitizeCommentHtml } from '@/lib/comment-content';

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
    onReply: (commentId: string, content: string, attachments?: string[]) => void;
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

function isVideoUrl(url: string) {
    return url.startsWith('video::')
        || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)
        || url.includes('/video/');
}

function stripMediaPrefix(url: string) {
    if (url.startsWith('video::')) return url.slice('video::'.length);
    return url;
}

function commentMarkdownToHtml(text: string): string {
    if (!text.trim() || text.trim() === ' ') return '';
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
    html = html.replace(/<u>(.+?)<\/u>/g, '<u>$1</u>');
    html = html.replace(/<sup>(.+?)<\/sup>/g, '<sup>$1</sup>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
    html = html.replace(/(@[\wÀ-ỹ]+(?:\s[\wÀ-ỹ]+)*)/g, '<span class="font-semibold text-blue-600">$1</span>');
    html = html.replace(/\n/g, '<br/>');
    return html;
}

function resolveAttachmentSrc(url: string) {
    const normalized = stripMediaPrefix(url);
    if (isVideoUrl(url)) {
        if (normalized.includes('/proxy/video/') || normalized.startsWith('http')) return getImageUrl(normalized);
        return getVideoUrl(normalized);
    }
    return getImageUrl(normalized);
}

function CommentAttachments({ attachments }: { attachments: string[] }) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<'image' | 'video'>('image');

    if (!attachments?.length) return null;

    const openPreview = (url: string) => {
        setPreviewType(isVideoUrl(url) ? 'video' : 'image');
        setPreviewUrl(url);
    };

    return (
        <>
            <div className="flex flex-wrap gap-2 mt-2">
                {attachments.map((url, index) => (
                    <button
                        key={`${url}-${index}`}
                        type="button"
                        onClick={() => openPreview(url)}
                        className="max-w-full rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity"
                        title="Xem media"
                    >
                        {isVideoUrl(url) ? (
                            <video
                                src={resolveAttachmentSrc(url)}
                                className="max-h-56 max-w-full bg-black pointer-events-none"
                                muted
                                playsInline
                            />
                        ) : (
                            <img
                                src={resolveAttachmentSrc(url)}
                                alt=""
                                className="max-h-56 max-w-full object-contain"
                            />
                        )}
                    </button>
                ))}
            </div>

            {previewUrl && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setPreviewUrl(null)}
                >
                    <button
                        type="button"
                        onClick={() => setPreviewUrl(null)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                        <X size={20} />
                    </button>
                    <div className="max-w-[min(960px,95vw)] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        {previewType === 'video' ? (
                            <video
                                src={resolveAttachmentSrc(previewUrl)}
                                controls
                                autoPlay
                                className="max-h-[90vh] max-w-full rounded-lg bg-black"
                            />
                        ) : (
                            <img
                                src={resolveAttachmentSrc(previewUrl)}
                                alt=""
                                className="max-h-[90vh] max-w-full rounded-lg object-contain"
                            />
                        )}
                    </div>
                </div>
            )}
        </>
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
    const [replyAttachments, setReplyAttachments] = useState<string[]>([]);
    const [showReactionPicker, setShowReactionPicker] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showAllReplies, setShowAllReplies] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [isReporting, setIsReporting] = useState(false);
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
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

    const openMoreMenu = useCallback(() => {
        if (moreButtonRef.current) {
            const rect = moreButtonRef.current.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + 4,
                left: Math.max(8, rect.right - 140),
            });
        }
        setShowMoreMenu(true);
    }, []);

    const closeMoreMenu = useCallback(() => {
        setShowMoreMenu(false);
        setMenuPosition(null);
    }, []);

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

    useEffect(() => {
        if (!isEditing) {
            setEditContent(comment.content);
        }
    }, [comment.content, isEditing]);

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
                closeMoreMenu();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [closeMoreMenu]);

    useEffect(() => {
        if (!showMoreMenu) return;

        const handleDismiss = () => closeMoreMenu();
        window.addEventListener('scroll', handleDismiss, true);
        window.addEventListener('resize', handleDismiss);

        return () => {
            window.removeEventListener('scroll', handleDismiss, true);
            window.removeEventListener('resize', handleDismiss);
        };
    }, [showMoreMenu, closeMoreMenu]);

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
        if (isCommentContentEmpty(replyContent) && replyAttachments.length === 0) {
            toast.warning('Vui lòng nhập nội dung hoặc đính kèm media');
            return;
        }
        setIsSubmitting(true);
        let content = replyContent;
        if (parentUserName && !content.includes(`@${parentUserName}`)) {
            if (isHtmlContent(content)) {
                content = `<p><strong class="text-blue-600">@${parentUserName}</strong> </p>${content}`;
            } else {
                content = `@${parentUserName} ${content.trim()}`;
            }
        }
        await onReply(comment._id, content, replyAttachments);
        setReplyContent('');
        setReplyAttachments([]);
        setShowReplyInput(false);
        setIsSubmitting(false);
    };

    const handleSubmitEdit = async () => {
        if (isCommentContentEmpty(editContent)) {
            toast.warning('Vui lòng nhập nội dung');
            return;
        }
        setIsSubmitting(true);
        await onEdit(comment._id, editContent);
        setIsEditing(false);
        setIsSubmitting(false);
    };

    const handleReportSubmit = async () => {
        if (!selectedReason) {
            toast.warning('Vui lòng chọn lý do báo cáo');
            return;
        }
        if (selectedReason === 'other' && !customReason.trim()) {
            toast.warning('Vui lòng nhập lý do cụ thể');
            return;
        }
        setIsReporting(true);
        try {
            const description = selectedReason === 'other' ? customReason.trim() : undefined;
            await onReport(comment._id, selectedReason, description);
            setShowReportModal(false);
            setSelectedReason('');
            setCustomReason('');
        } finally {
            setIsReporting(false);
        }
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
                <div className="flex-1 min-w-0 max-w-full">
                    <div className="px-1">
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

                            <div className="relative shrink-0">
                                <button
                                    ref={moreButtonRef}
                                    onClick={() => (showMoreMenu ? closeMoreMenu() : openMoreMenu())}
                                    className="p-1.5 rounded-full hover:bg-gray-200 transition text-gray-400 hover:text-gray-600"
                                    aria-expanded={showMoreMenu}
                                    aria-haspopup="menu"
                                >
                                    <MoreHorizontal size={14} />
                                </button>
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="mt-1 w-full">
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
                            <div className="break-words w-full leading-snug">
                                {(() => {
                                    const display = getDisplayContent();
                                    if (isCommentContentEmpty(display)) return null;
                                    if (isHtmlContent(display)) {
                                        return (
                                            <StaticContent
                                                content={sanitizeCommentHtml(display)}
                                                compact
                                                className="text-gray-800 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_th]:border [&_th]:border-gray-300 [&_th]:bg-slate-100 [&_th]:px-2 [&_th]:py-1.5 [&_td]:border [&_td]:border-gray-200 [&_td]:px-2 [&_td]:py-1.5"
                                            />
                                        );
                                    }
                                    return (
                                        <div
                                            className="text-sm text-gray-700 [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded [&_a]:text-blue-600"
                                            dangerouslySetInnerHTML={{ __html: commentMarkdownToHtml(display) }}
                                        />
                                    );
                                })()}
                                <CommentAttachments attachments={comment.attachments || []} />
                            </div>
                        )}

                        {!comment.isDeleted && !isEditing && (
                            <div className="relative mt-1.5">
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

                                <div className="flex flex-wrap items-center gap-1 -ml-1">
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
                                attachments={replyAttachments}
                                onAttachmentsChange={setReplyAttachments}
                                rows={2}
                                placeholder={`Phản hồi ${getUserName()}...`}
                                autoFocus
                                onSubmit={handleSubmitReply}
                                onCancel={() => {
                                    setShowReplyInput(false);
                                    setReplyAttachments([]);
                                }}
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
                                {comment.replyCount > replies.length && onLoadMoreReplies && (
                                    <button
                                        type="button"
                                        onClick={() => onLoadMoreReplies(comment._id)}
                                        className="text-xs text-blue-500 hover:text-blue-600 mt-2 block"
                                    >
                                        Tải thêm phản hồi ({comment.replyCount - replies.length} còn lại)
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
            </div>

            {showMoreMenu && menuPosition && typeof document !== 'undefined' && createPortal(
                <div
                    ref={moreMenuRef}
                    role="menu"
                    className="fixed z-[9998] bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[140px]"
                    style={{ top: menuPosition.top, left: menuPosition.left }}
                >
                    {!isOwner && (
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                closeMoreMenu();
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
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                    setIsEditing(true);
                                    closeMoreMenu();
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Edit2 size={14} />
                                Chỉnh sửa
                            </button>
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                    onDelete(comment._id);
                                    closeMoreMenu();
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Trash2 size={14} />
                                Xóa
                            </button>
                        </>
                    )}
                </div>,
                document.body
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
                    onClick={() => !isReporting && setShowReportModal(false)}
                >
                    <div
                        className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                <h3 className="text-base font-semibold text-gray-900">Báo cáo bình luận</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => !isReporting && setShowReportModal(false)}
                                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
                            <p className="text-sm text-gray-500 mb-3">Chọn lý do báo cáo:</p>
                            {REPORT_REASONS.map((reason) => (
                                <label
                                    key={reason.value}
                                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                                        selectedReason === reason.value
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="report-reason"
                                        value={reason.value}
                                        checked={selectedReason === reason.value}
                                        onChange={() => setSelectedReason(reason.value)}
                                        className="mt-0.5"
                                    />
                                    <span className="text-sm text-gray-700">{reason.label}</span>
                                </label>
                            ))}

                            {selectedReason === 'other' && (
                                <textarea
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    placeholder="Mô tả lý do báo cáo..."
                                    rows={3}
                                    className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50">
                            <button
                                type="button"
                                onClick={() => setShowReportModal(false)}
                                disabled={isReporting}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleReportSubmit}
                                disabled={isReporting || !selectedReason}
                                className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {isReporting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Gửi báo cáo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reaction Modal */}
            {showReactionModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setShowReactionModal(false)}
                >
                    <div
                        className="bg-white rounded-xl w-full max-w-sm max-h-[80vh] overflow-hidden shadow-xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h3 className="text-base font-semibold text-gray-900">
                                Cảm xúc ({reactionCount})
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowReactionModal(false)}
                                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 overflow-x-auto">
                            <button
                                type="button"
                                onClick={() => handleReactionTabChange('all')}
                                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                                    selectedReactionTab === 'all'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                Tất cả {reactionCount}
                            </button>
                            {REACTION_TYPES.filter((rt) => (comment.reactions?.[rt.type] || 0) > 0).map((rt) => (
                                <button
                                    key={rt.type}
                                    type="button"
                                    onClick={() => handleReactionTabChange(rt.type)}
                                    className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                                        selectedReactionTab === rt.type
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                                >
                                    <img src={rt.icon} alt={rt.label} className="w-4 h-4" />
                                    {comment.reactions?.[rt.type] || 0}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {loadingReactions ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                </div>
                            ) : reactionUsers.length === 0 ? (
                                <p className="text-center text-sm text-gray-400 py-10">Chưa có cảm xúc</p>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {reactionUsers.map((item, idx) => {
                                        const rt = REACTION_TYPES.find((r) => r.type === item.reactionType);
                                        return (
                                            <li key={`${item.userId?._id}-${idx}`} className="flex items-center gap-3 px-5 py-3">
                                                {item.userId?.avatar ? (
                                                    <img
                                                        src={getImageUrl(item.userId.avatar)}
                                                        alt={item.userId.fullName}
                                                        className="w-9 h-9 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                                                        {item.userId?.fullName?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {item.userId?.fullName || 'Người dùng'}
                                                    </p>
                                                    <p className="text-xs text-gray-400">{rt?.label || item.reactionType}</p>
                                                </div>
                                                {rt && <img src={rt.icon} alt={rt.label} className="w-6 h-6 shrink-0" />}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}