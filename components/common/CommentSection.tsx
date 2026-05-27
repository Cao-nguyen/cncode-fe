"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    ThumbsUp,
    MessageCircle,
    Send,
    Smile,
    Image,
    Sticker,
    MoreHorizontal,
    Pencil,
    Trash2,
    Link2,
    Flag,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

export type ReactionType = "like" | "love" | "haha" | "wow" | "care" | "sad" | "angry";

export interface CommentUser {
    id: string;
    name: string;
    avatar: string;
}

export interface CommentReaction {
    type: ReactionType;
    count: number;
}

export interface Comment {
    id: string;
    author: CommentUser;
    content: string;
    createdAt: number; 
    myReaction: ReactionType | null;
    reactions: CommentReaction[];
    replies: Comment[];
    isEdited?: boolean;
}

export interface CommentSectionProps {
    
    comments: Comment[];
    
    currentUser: CommentUser;
    
    onAddComment: (content: string) => void;
    
    onAddReply: (parentId: string, content: string) => void;
    
    onReact: (commentId: string, type: ReactionType, parentId?: string) => void;
    
    onDelete: (commentId: string, parentId?: string) => void;
    
    placeholder?: string;
    
    showReactions?: boolean;
}

const REACTION_LABEL: Record<ReactionType, string> = {
    like: "Thích",
    love: "Yêu thích",
    haha: "Haha",
    wow: "Wow",
    care: "Thương thương",
    sad: "Buồn",
    angry: "Phẫn nộ",
};

const REACTION_COLOR: Record<ReactionType, string> = {
    like: "#1877F2",
    love: "#F33E58",
    haha: "#F7B928",
    wow: "#F7B928",
    care: "#F7B928",
    sad: "#F7B928",
    angry: "#E9710F",
};

function timeAgo(ts: number): string {
    const d = Math.floor((Date.now() - ts) / 1000);
    if (d < 60) return "Vừa xong";
    if (d < 3600) return `${Math.floor(d / 60)} phút`;
    if (d < 86400) return `${Math.floor(d / 3600)} giờ`;
    return `${Math.floor(d / 86400)} ngày`;
}

interface AutoTextareaProps {
    value: string;
    onChange: (v: string) => void;
    onSubmit: () => void;
    placeholder?: string;
    autoFocus?: boolean;
}

function AutoTextarea({ value, onChange, onSubmit, placeholder, autoFocus }: AutoTextareaProps) {
    const ref = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        ref.current.style.height = "auto";
        ref.current.style.height = `${ref.current.scrollHeight}px`;
    }, [value]);

    useEffect(() => {
        if (autoFocus) ref.current?.focus();
    }, [autoFocus]);

    return (
        <textarea
            ref={ref}
            rows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit();
                }
            }}
            placeholder={placeholder ?? "Viết bình luận…"}
            className="flex-1 bg-transparent outline-none resize-none text-[14px] leading-[1.45] text-[#050505] placeholder-[#bcc0c4] max-h-[160px] overflow-y-auto py-[3px]"
            style={{ scrollbarWidth: "none" }}
        />
    );
}

interface CommentInputProps {
    currentUser: CommentUser;
    onSubmit: (content: string) => void;
    placeholder?: string;
    autoFocus?: boolean;
    compact?: boolean;
}

function CommentInput({ currentUser, onSubmit, placeholder, autoFocus, compact }: CommentInputProps) {
    const [value, setValue] = useState("");

    const submit = () => {
        const v = value.trim();
        if (!v) return;
        onSubmit(v);
        setValue("");
    };

    return (
        <div className="flex items-start gap-2">
            <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className={`rounded-full object-cover flex-shrink-0 ${compact ? "w-8 h-8 mt-[3px]" : "w-9 h-9 mt-[2px]"}`}
            />
            <div className="flex-1 bg-[#f0f2f5] rounded-[20px] px-3 py-[7px] flex items-end gap-1.5 min-w-0">
                <AutoTextarea
                    value={value}
                    onChange={setValue}
                    onSubmit={submit}
                    placeholder={placeholder ?? "Viết bình luận…"}
                    autoFocus={autoFocus}
                />
                <div className="flex items-center gap-0.5 flex-shrink-0 pb-[2px]">
                    {!compact && (
                        <>
                            <button
                                className="p-1 text-[#65676b] hover:text-[#1877F2] rounded-full hover:bg-black/5 transition-colors"
                                title="Biểu cảm"
                            >
                                <Smile size={17} strokeWidth={1.8} />
                            </button>
                            <button
                                className="p-1 text-[#65676b] hover:text-[#1877F2] rounded-full hover:bg-black/5 transition-colors"
                                title="Ảnh/Video"
                            >
                                <Image size={17} strokeWidth={1.8} />
                            </button>
                            <button
                                className="p-1 text-[#65676b] hover:text-[#1877F2] rounded-full hover:bg-black/5 transition-colors"
                                title="Nhãn dán"
                            >
                                <Sticker size={17} strokeWidth={1.8} />
                            </button>
                        </>
                    )}
                    {value.trim() && (
                        <button
                            onClick={submit}
                            className="p-1 text-[#1877F2] hover:text-blue-700 rounded-full hover:bg-black/5 transition-colors"
                            title="Gửi (Enter)"
                        >
                            <Send size={16} strokeWidth={1.8} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

interface ReactionButtonProps {
    myReaction: ReactionType | null;
    totalCount: number;
    onToggle: () => void; 
}

function ReactionButton({ myReaction, totalCount, onToggle }: ReactionButtonProps) {
    const active = !!myReaction;
    const label = myReaction ? REACTION_LABEL[myReaction] : "Thích";
    const color = myReaction ? REACTION_COLOR[myReaction] : "#65676b";

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={onToggle}
                className="flex items-center gap-[5px] px-2 py-[5px] rounded-md font-bold text-[12px] transition-colors hover:bg-black/[0.06]"
                style={{ color }}
            >
                <ThumbsUp
                    size={13}
                    strokeWidth={2.2}
                    fill={active ? color : "none"}
                    color={color}
                    className={active ? "scale-110 transition-transform" : "transition-transform"}
                />
                {label}
            </button>
            {totalCount > 0 && (
                <span className="text-[12px] text-[#65676b] font-medium">{totalCount}</span>
            )}
        </div>
    );
}

interface ContextMenuProps {
    isOwn: boolean;
    onDelete: () => void;
    onClose: () => void;
}

function ContextMenu({ isOwn, onDelete, onClose }: ContextMenuProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    return (
        <div
            ref={ref}
            className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.14)] border border-black/[0.08] py-1 z-50 min-w-[196px]"
        >
            {isOwn ? (
                <>
                    <button
                        className="flex items-center gap-2.5 w-full px-3 py-[9px] text-[13px] font-semibold hover:bg-[#f0f2f5] text-[#050505] transition-colors rounded-lg mx-0"
                        onClick={onClose}
                    >
                        <Pencil size={15} strokeWidth={2} />
                        Chỉnh sửa bình luận
                    </button>
                    <button
                        className="flex items-center gap-2.5 w-full px-3 py-[9px] text-[13px] font-semibold hover:bg-[#f0f2f5] text-[#e41e3f] transition-colors"
                        onClick={() => { onDelete(); onClose(); }}
                    >
                        <Trash2 size={15} strokeWidth={2} />
                        Xóa bình luận
                    </button>
                    <div className="h-px bg-black/[0.08] my-1" />
                </>
            ) : null}
            <button
                className="flex items-center gap-2.5 w-full px-3 py-[9px] text-[13px] font-semibold hover:bg-[#f0f2f5] text-[#050505] transition-colors"
                onClick={onClose}
            >
                <Link2 size={15} strokeWidth={2} />
                Sao chép liên kết
            </button>
            {!isOwn && (
                <button
                    className="flex items-center gap-2.5 w-full px-3 py-[9px] text-[13px] font-semibold hover:bg-[#f0f2f5] text-[#050505] transition-colors"
                    onClick={onClose}
                >
                    <Flag size={15} strokeWidth={2} />
                    Báo cáo bình luận
                </button>
            )}
        </div>
    );
}

interface CommentItemProps {
    comment: Comment;
    currentUser: CommentUser;
    depth?: number;
    parentId?: string;
    onReact: (commentId: string, type: ReactionType, parentId?: string) => void;
    onAddReply: (parentId: string, content: string) => void;
    onDelete: (commentId: string, parentId?: string) => void;
}

function CommentItem({
    comment,
    currentUser,
    depth = 0,
    parentId,
    onReact,
    onAddReply,
    onDelete,
}: CommentItemProps) {
    const [showReplies, setShowReplies] = useState(true);
    const [replyOpen, setReplyOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const isOwn = comment.author.id === currentUser.id;
    const isReply = depth > 0;
    const totalReactions = comment.reactions.reduce((s, r) => s + r.count, 0);

    const handleToggleLike = () => {
        onReact(comment.id, "like", parentId);
    };

    return (
        <div className={`flex gap-2 items-start ${isReply ? "pl-10" : ""}`}>
            {}
            <img
                src={comment.author.avatar}
                alt={comment.author.name}
                className={`rounded-full object-cover flex-shrink-0 mt-0.5 ${isReply ? "w-7 h-7" : "w-9 h-9"}`}
            />

            <div className="flex-1 min-w-0">
                {}
                <div className="group/bubble relative inline-block max-w-full">
                    <div className="bg-[#f0f2f5] rounded-[18px] px-3 py-[7px] inline-block max-w-full">
                        {}
                        <span className="text-[13px] font-bold text-[#050505] block mb-[1px]">
                            {comment.author.name}
                            {comment.isEdited && (
                                <span className="text-[11px] font-normal text-[#65676b] ml-1">· Đã chỉnh sửa</span>
                            )}
                        </span>
                        {}
                        <p className="text-[14px] text-[#050505] leading-[1.45] m-0 whitespace-pre-wrap break-words">
                            {comment.content}
                        </p>
                    </div>

                    {}
                    {totalReactions > 0 && (
                        <div className="absolute -bottom-3.5 right-2 flex items-center gap-1 bg-white rounded-full shadow-[0_1px_6px_rgba(0,0,0,0.16)] px-1.5 py-[3px] border border-black/[0.06] cursor-pointer hover:bg-gray-50 transition-colors z-10">
                            <ThumbsUp
                                size={12}
                                strokeWidth={0}
                                fill={REACTION_COLOR["like"]}
                                className="flex-shrink-0"
                            />
                            <span className="text-[11px] font-medium text-[#65676b] leading-none">{totalReactions}</span>
                        </div>
                    )}

                    {}
                    <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover/bubble:opacity-100 transition-opacity relative">
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen((p) => !p)}
                                className="p-1.5 rounded-full text-[#65676b] hover:bg-[#e4e6eb] transition-colors"
                                title="Thêm tùy chọn"
                            >
                                <MoreHorizontal size={16} strokeWidth={1.8} />
                            </button>
                            {menuOpen && (
                                <ContextMenu
                                    isOwn={isOwn}
                                    onDelete={() => onDelete(comment.id, parentId)}
                                    onClose={() => setMenuOpen(false)}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {}
                <div className={`flex items-center gap-0.5 pl-1 flex-wrap ${totalReactions > 0 ? "mt-5" : "mt-[3px]"}`}>
                    <ReactionButton
                        myReaction={comment.myReaction}
                        totalCount={totalReactions}
                        onToggle={handleToggleLike}
                    />

                    <span className="text-[#65676b] text-[12px] px-0.5">·</span>

                    <button
                        onClick={() => setReplyOpen((p) => !p)}
                        className="flex items-center gap-[5px] px-2 py-[5px] rounded-md text-[12px] font-bold text-[#65676b] hover:bg-black/[0.06] transition-colors"
                    >
                        <MessageCircle size={13} strokeWidth={2.2} />
                        Phản hồi
                    </button>

                    <span className="text-[#65676b] text-[12px] px-0.5">·</span>

                    <span className="text-[11px] text-[#65676b] px-1">{timeAgo(comment.createdAt)}</span>

                    {}
                    <div className="relative ml-auto">
                        <button
                            onClick={() => setMenuOpen((p) => !p)}
                            className="p-1 rounded-full text-[#65676b] hover:bg-black/[0.06] transition-colors"
                            title="Thêm tùy chọn"
                        >
                            <MoreHorizontal size={14} strokeWidth={1.8} />
                        </button>
                        {menuOpen && (
                            <ContextMenu
                                isOwn={isOwn}
                                onDelete={() => onDelete(comment.id, parentId)}
                                onClose={() => setMenuOpen(false)}
                            />
                        )}
                    </div>
                </div>

                {}
                {!isReply && comment.replies.length > 0 && (
                    <button
                        onClick={() => setShowReplies((p) => !p)}
                        className="flex items-center gap-1 text-[13px] font-bold text-[#1877F2] mt-2 pl-1 hover:underline"
                    >
                        {showReplies
                            ? <ChevronUp size={13} strokeWidth={2.5} />
                            : <ChevronDown size={13} strokeWidth={2.5} />}
                        {showReplies
                            ? "Ẩn phản hồi"
                            : `${comment.replies.length} phản hồi`}
                    </button>
                )}

                {}
                {!isReply && showReplies && comment.replies.length > 0 && (
                    <div className="flex flex-col gap-3 mt-3">
                        {comment.replies.map((r) => (
                            <CommentItem
                                key={r.id}
                                comment={r}
                                currentUser={currentUser}
                                depth={1}
                                parentId={comment.id}
                                onReact={onReact}
                                onAddReply={onAddReply}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                )}

                {}
                {replyOpen && (
                    <div className="mt-2">
                        <CommentInput
                            currentUser={currentUser}
                            compact
                            placeholder={`Trả lời ${comment.author.name}…`}
                            autoFocus
                            onSubmit={(content) => {
                                onAddReply(parentId ?? comment.id, content);
                                setReplyOpen(false);
                                setShowReplies(true);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CommentSection({
    comments,
    currentUser,
    onAddComment,
    onAddReply,
    onReact,
    onDelete,
    placeholder,
    showReactions = true,
}: CommentSectionProps) {
    const total = comments.reduce((s, c) => s + 1 + c.replies.length, 0);

    return (
        <div className="w-full font-sans">
            {}
            {total > 0 && (
                <p className="text-[13px] text-[#65676b] mb-3 px-1">
                    {total} bình luận
                </p>
            )}

            {}
            <CommentInput
                currentUser={currentUser}
                onSubmit={onAddComment}
                placeholder={placeholder}
            />

            {}
            {comments.length > 0 && (
                <div className="flex flex-col gap-4 mt-4">
                    {comments.map((c) => (
                        <CommentItem
                            key={c.id}
                            comment={c}
                            currentUser={currentUser}
                            onReact={showReactions ? onReact : () => { }}
                            onAddReply={onAddReply}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}

            {comments.length === 0 && (
                <p className="text-center text-[13px] text-[#65676b] mt-6 mb-2">
                    Chưa có bình luận nào. Hãy là người đầu tiên! 💬
                </p>
            )}
        </div>
    );
}
