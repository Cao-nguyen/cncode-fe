// components/comment/CommentItem.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
    MoreHorizontal,
    Flag,
    Edit2,
    Trash2,
    X,
    Check,
    MessageCircle,
    Heart,
    AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';
import { CustomTextarea } from '@/components/custom/CustomTextarea';

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
        const escapedName = parentUserName.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
        );

        const regex = new RegExp(`(@${escapedName})(?=\\s|$)`, 'g');

        const parts = text.split(regex);

        return (
            <span className="text-sm text-gray-700 break-words leading-relaxed">
                {parts.map((part, index) => {
                    if (part === `@${parentUserName}`) {
                        return (
                            <span
                                key={index}
                                className="font-semibold text-blue-600"
                            >
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
                        <span
                            key={index}
                            className="font-semibold text-blue-600"
                        >
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
    const [showReactionPicker, setShowReactionPicker] =
        useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showAllReplies, setShowAllReplies] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showReportModal, setShowReportModal] =
        useState(false);
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');

    const reactionPickerRef = useRef<HTMLDivElement>(null);
    const moreMenuRef = useRef<HTMLDivElement>(null);
    const moreButtonRef = useRef<HTMLButtonElement>(null);

    const isOwner = user?._id === comment.userId?._id;

    const reactionCount = Object.values(
        comment.reactions || {}
    ).reduce((a, b) => a + b, 0);

    const activeReactions = Object.entries(
        comment.reactions || {}
    )
        .filter(([, count]) => count > 0)
        .map(([type]) => ({
            type,
            icon:
                REACTION_TYPES.find(
                    (rt) => rt.type === type
                )?.icon || '',
            label:
                REACTION_TYPES.find(
                    (rt) => rt.type === type
                )?.label || type
        }));

    const replies = comment.replies || [];

    const visibleReplies = showAllReplies
        ? replies
        : replies.slice(0, 3);

    const hiddenRepliesCount = replies.length - 3;

    const getDisplayContent = () => {
        if (comment.parentId && parentUserName) {
            if (
                !comment.content.startsWith(
                    `@${parentUserName}`
                )
            ) {
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
        const handleClickOutside = (
            event: MouseEvent
        ) => {
            if (
                reactionPickerRef.current &&
                !reactionPickerRef.current.contains(
                    event.target as Node
                )
            ) {
                setShowReactionPicker(false);
            }

            if (
                moreMenuRef.current &&
                !moreMenuRef.current.contains(
                    event.target as Node
                ) &&
                moreButtonRef.current &&
                !moreButtonRef.current.contains(
                    event.target as Node
                )
            ) {
                setShowMoreMenu(false);
            }
        };

        document.addEventListener(
            'mousedown',
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );
        };
    }, []);

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

        if (parentUserName) {
            content = `@${parentUserName} ${replyContent}`;
        }

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

        const description =
            selectedReason === 'other'
                ? customReason
                : undefined;

        onReport(
            comment._id,
            selectedReason,
            description
        );

        setShowReportModal(false);
        setSelectedReason('');
        setCustomReason('');
    };

    const getUserAvatar = () => comment.userId?.avatar;

    const getUserInitial = () =>
        comment.userId?.fullName
            ?.charAt(0)
            .toUpperCase() || 'U';

    const getUserName = () =>
        comment.userId?.fullName || 'Người dùng';

    const currentReaction = comment.userReaction
        ? REACTION_TYPES.find(
            (rt) => rt.type === comment.userReaction
        )
        : null;

    return (
        <>
            <div
                className={`flex gap-2 mb-3 w-full`}
            >
                <div className="flex-shrink-0">
                    <div
                        className="
                            w-8 h-8
                            rounded-full
                            bg-gradient-to-br
                            from-blue-500
                            to-blue-600
                            flex
                            items-center
                            justify-center
                            overflow-hidden
                        "
                    >
                        {getUserAvatar() ? (
                            <Image
                                src={getUserAvatar()!}
                                alt={getUserName()}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-white font-bold text-sm">
                                {getUserInitial()}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div
                        className="
                            bg-gray-50
                            rounded-2xl
                            px-3 py-2.5
                            w-full
                        "
                    >
                        <div
                            className="
                                flex
                                items-start
                                justify-between
                                gap-2
                                mb-1
                            "
                        >
                            <div className="min-w-0 flex-1">
                                <div
                                    className="
                                        flex
                                        flex-wrap
                                        items-center
                                        gap-x-2
                                        gap-y-1
                                    "
                                >
                                    <span
                                        className="
                                            font-semibold
                                            text-sm
                                            text-gray-800
                                            break-words
                                        "
                                    >
                                        {getUserName()}
                                    </span>

                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {formatTime(
                                            comment.createdAt
                                        )}
                                    </span>

                                    {comment.isEdited && (
                                        <span className="text-xs text-gray-400">
                                            (đã sửa)
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="relative flex-shrink-0">
                                <button
                                    ref={moreButtonRef}
                                    onClick={() =>
                                        setShowMoreMenu(
                                            !showMoreMenu
                                        )
                                    }
                                    className="
                                        p-1.5
                                        rounded-lg
                                        hover:bg-gray-200
                                        transition
                                    "
                                >
                                    <MoreHorizontal
                                        size={14}
                                        className="text-gray-400"
                                    />
                                </button>
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
                                        onClick={
                                            handleSubmitEdit
                                        }
                                        disabled={isSubmitting}
                                        className="
                                            px-3 py-1.5
                                            bg-blue-500
                                            text-white
                                            rounded-lg
                                            text-sm
                                        "
                                    >
                                        {isSubmitting
                                            ? 'Đang lưu...'
                                            : 'Lưu'}
                                    </button>

                                    <button
                                        onClick={() =>
                                            setIsEditing(false)
                                        }
                                        className="
                                            px-3 py-1.5
                                            border
                                            border-gray-200
                                            rounded-lg
                                            text-sm
                                        "
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-1 break-words">
                                <HighlightedText
                                    text={getDisplayContent()}
                                    parentUserName={
                                        parentUserName
                                    }
                                />
                            </div>
                        )}
                    </div>

                    {!comment.isDeleted && (
                        <div
                            className="
                                flex
                                flex-wrap
                                items-center
                                gap-2
                                mt-1.5
                                ml-1
                            "
                        >
                            <button
                                onClick={() =>
                                    setShowReactionPicker(
                                        !showReactionPicker
                                    )
                                }
                                className="
                                    flex
                                    items-center
                                    gap-1
                                    px-2 py-1
                                    rounded-lg
                                    text-xs
                                    hover:bg-gray-100
                                "
                            >
                                <Heart
                                    size={14}
                                    className="text-gray-500"
                                />

                                <span className="text-gray-500">
                                    Thích
                                </span>
                            </button>

                            <button
                                onClick={() =>
                                    setShowReplyInput(
                                        !showReplyInput
                                    )
                                }
                                className="
                                    flex
                                    items-center
                                    gap-1
                                    px-2 py-1
                                    rounded-lg
                                    text-xs
                                    text-gray-500
                                    hover:bg-gray-100
                                "
                            >
                                <MessageCircle size={12} />

                                <span>Phản hồi</span>
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
                                    onClick={
                                        handleSubmitReply
                                    }
                                    disabled={isSubmitting}
                                    className="
                                        p-2
                                        bg-blue-500
                                        text-white
                                        rounded-lg
                                    "
                                >
                                    {isSubmitting ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Check size={16} />
                                    )}
                                </button>

                                <button
                                    onClick={() =>
                                        setShowReplyInput(
                                            false
                                        )
                                    }
                                    className="
                                        p-2
                                        border
                                        border-gray-200
                                        rounded-lg
                                    "
                                >
                                    <X
                                        size={16}
                                        className="text-gray-500"
                                    />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* REPLIES */}
                    {replies.length > 0 && (
                        <div className="mt-3 space-y-3">
                            {visibleReplies.map(
                                (reply) => (
                                    <CommentItem
                                        key={reply._id}
                                        comment={reply}
                                        onLike={
                                            onLike
                                        }
                                        onReply={
                                            onReply
                                        }
                                        onEdit={
                                            onEdit
                                        }
                                        onDelete={
                                            onDelete
                                        }
                                        onReport={
                                            onReport
                                        }
                                        onLoadMoreReplies={
                                            onLoadMoreReplies
                                        }
                                        parentUserName={getUserName()}
                                        isReply={true}
                                    />
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}