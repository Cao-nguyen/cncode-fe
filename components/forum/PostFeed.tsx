'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ThumbsUp, MessageSquare, MoreHorizontal, MapPin, Smile, Pin, Edit2, Trash2, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { forumApi, IForumPost, IForumUser, IForumPostReaction } from '@/lib/api/forum.api';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { toast } from 'sonner';
import Image from 'next/image';
import CommentSection from '@/components/comment/CommentSection';
import ForumImagePreview from './ForumImagePreview';
import EditPostModal from './EditPostModal';

interface PostFeedProps {
    posts?: IForumPost[];
    onPostsChange?: (posts: IForumPost[]) => void;
}

// Utility to dedupe posts by _id
const dedupePosts = (posts: IForumPost[]): IForumPost[] => {
    const seen = new Set();
    return posts.filter(post => {
        if (seen.has(post._id)) return false;
        seen.add(post._id);
        return true;
    });
};

export default function PostFeed({ posts: initialPosts, onPostsChange }: PostFeedProps) {
    const { user, token } = useAuthStore();
    const { socket } = useSocket();
    const [posts, setPosts] = useState<IForumPost[]>(dedupePosts(initialPosts || []));
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [showComments, setShowComments] = useState<Record<string, boolean>>({});
    const [showMenu, setShowMenu] = useState<Record<string, boolean>>({});
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPost, setEditingPost] = useState<IForumPost | null>(null);
    const [showReactionPicker, setShowReactionPicker] = useState<Record<string, boolean>>({});
    const [showReactionDetails, setShowReactionDetails] = useState<Record<string, boolean>>({});
    const [showImagePreview, setShowImagePreview] = useState<Record<string, boolean>>({});
    const [previewIndex, setPreviewIndex] = useState<Record<string, number>>({});
    const [activeReactionFilter, setActiveReactionFilter] = useState<Record<string, string | null>>({});

    const observerRef = useRef<HTMLDivElement>(null);
    const observerTarget = useRef<HTMLDivElement>(null);

    // Infinite scroll with Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setPage((prev) => prev + 1);
                }
            },
            { threshold: 0.1, rootMargin: '300px' }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, loading]);

    // Fetch posts when page changes
    useEffect(() => {
        if (page > 1) {
            fetchPosts(page);
        }
    }, [page]);

    useEffect(() => {
        if (initialPosts && initialPosts.length > 0 && posts.length === 0) {
            setPosts(initialPosts);
        } else if (!initialPosts && posts.length === 0) {
            fetchPosts();
        }

        // Socket event listeners for real-time updates
        if (socket) {
            socket.on('forum:post-created', (data) => {
                setPosts((prev) => {
                    // Avoid duplicate posts
                    if (prev.some(p => p._id === data.post._id)) {
                        return prev;
                    }
                    return [data.post, ...prev];
                });
            });

            socket.on('forum:post-liked', (data) => {
                setPosts((prev) =>
                    prev.map((post) =>
                        post._id === data.postId
                            ? {
                                ...post,
                                likeCount: data.likeCount,
                                reactions: data.reactions,
                                userReactions: data.userReactions || post.userReactions,
                            }
                            : post
                    )
                );
            });

            socket.on('forum:post-updated', (data) => {
                setPosts((prev) => {
                    // If the updated post is now private and current user is not the author, remove it
                    if (data.post.privacy === 'private' && data.post.author._id !== user?._id) {
                        return prev.filter((post) => post._id !== data.postId);
                    }

                    // If the post exists in the list, update it
                    const postExists = prev.some(p => p._id === data.postId);
                    if (postExists) {
                        return prev.map((post) =>
                            post._id === data.postId ? data.post : post
                        );
                    }

                    // If the post doesn't exist and is now public, add it to the feed
                    if (data.post.privacy === 'public') {
                        return [data.post, ...prev];
                    }

                    return prev;
                });
            });

            socket.on('forum:post-deleted', (data) => {
                setPosts((prev) => prev.filter((post) => post._id !== data.postId));
            });

            socket.on('forum:post-comment-count-changed', (data) => {
                setPosts((prev) =>
                    prev.map((post) =>
                        post._id === data.postId
                            ? {
                                ...post,
                                commentCount: data.commentCount,
                            }
                            : post
                    )
                );
            });
        }

        return () => {
            if (socket) {
                socket.off('forum:post-created');
                socket.off('forum:post-liked');
                socket.off('forum:post-updated');
                socket.off('forum:post-deleted');
                socket.off('forum:post-comment-count-changed');
            }
        };
    }, [socket]);

    const fetchPosts = async (pageNum = 1) => {
        try {
            setLoading(true);
            const result = await forumApi.getPosts(pageNum, 10);

            if (pageNum === 1) {
                setPosts(dedupePosts(result.data));
            } else {
                setPosts((prev) => dedupePosts([...prev, ...result.data]));
            }

            setHasMore(pageNum < result.pagination.totalPages);
            onPostsChange?.(result.data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi tải bài viết';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postId: string) => {
        if (!token) {
            toast.error('Bạn cần đăng nhập để thích bài viết');
            return;
        }

        try {
            const result = await forumApi.toggleLikePost(postId, token);

            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post._id === postId
                        ? {
                            ...post,
                            likeCount: result.likeCount ?? post.likeCount,
                            reactions: result.reactions ?? post.reactions,
                            userReactions: result.userReactions ?? post.userReactions,
                        }
                        : post
                )
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi thích bài viết';
            toast.error(errorMessage);
        }
    };

    const handlePin = async (postId: string) => {
        if (!token) {
            toast.error('Bạn cần đăng nhập để ghim bài viết');
            return;
        }

        try {
            const result = await forumApi.togglePinPost(postId, token);

            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post._id === postId ? { ...post, isPinned: result.isPinned ?? post.isPinned } : post
                )
            );

            toast.success(result.message);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi ghim bài viết';
            toast.error(errorMessage);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!token) {
            toast.error('Bạn cần đăng nhập để xóa bài viết');
            return;
        }

        if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
            return;
        }

        try {
            await forumApi.deletePost(postId, token);

            setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
            toast.success('Đã xóa bài viết');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi xóa bài viết';
            toast.error(errorMessage);
        }
    };

    const handleShare = async (postId: string) => {
        if (!token) {
            toast.error('Bạn cần đăng nhập để chia sẻ bài viết');
            return;
        }

        try {
            await forumApi.sharePost(postId, '', token);
            toast.success('Đã chia sẻ bài viết');
            fetchPosts(1);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi chia sẻ bài viết';
            toast.error(errorMessage);
        }
    };

    const toggleCommentSection = (postId: string) => {
        setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
    };

    const toggleMenu = (postId: string) => {
        setShowMenu((prev) => ({ ...prev, [postId]: !prev[postId] }));
    };

    const toggleReactionPicker = (postId: string) => {
        setShowReactionPicker((prev) => ({ ...prev, [postId]: !prev[postId] }));
    };

    const toggleReactionDetails = (postId: string) => {
        setShowReactionDetails((prev) => ({ ...prev, [postId]: !prev[postId] }));
    };

    const getUserReaction = (post: IForumPost): string | null => {
        if (!user || !post.userReactions) return null;
        const userReaction = post.userReactions.find((r) =>
            (typeof r.userId === 'string' ? r.userId : r.userId?._id) === user._id
        );
        return userReaction?.reaction || null;
    };

    const handleReaction = async (postId: string, reaction: string) => {
        if (!token) {
            toast.error('Bạn cần đăng nhập để thả cảm xúc');
            return;
        }

        try {
            await forumApi.toggleLikePost(postId, token, reaction);
            setShowReactionPicker((prev) => ({ ...prev, [postId]: false }));
            // Refresh posts to get updated reaction data
            fetchPosts(1);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi thả cảm xúc';
            toast.error(errorMessage);
        }
    };

    const handleEdit = (post: IForumPost) => {
        setEditingPost(post);
        setShowEditModal(true);
        setShowMenu((prev) => ({ ...prev, [post._id]: false }));
    };

    const handlePostUpdated = (updatedPost: IForumPost) => {
        setPosts((prev) =>
            prev.map((post) =>
                post._id === updatedPost._id ? updatedPost : post
            )
        );
        setShowEditModal(false);
        setEditingPost(null);
    };

    if (posts.length === 0 && !loading) {
        return (
            <div className="bg-[var(--cn-bg-card)] rounded-2xl shadow-sm border border-[var(--cn-border)] p-8 text-center">
                <p className="text-gray-500">Chưa có bài viết nào. Hãy là người đầu tiên đăng bài!</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {posts.map((post) => (
                    <div
                        key={post._id}
                        className="bg-[var(--cn-bg-card)] rounded-2xl shadow-sm border border-[var(--cn-border)] p-3 sm:p-4"
                    >
                        {/* Post header */}
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                                    <AvatarImage src={post.author.avatar} />
                                    <AvatarFallback className="text-xs sm:text-sm font-bold bg-[var(--cn-primary)] text-white">
                                        {post.author.fullName?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <h3 className="font-bold text-xs sm:text-sm text-[var(--cn-text-main)] truncate">
                                            {post.author.fullName}
                                        </h3>
                                        {post.isPinned && <Pin className="w-3 h-3 text-[var(--cn-primary)] flex-shrink-0" />}
                                    </div>
                                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
                                        <span className="truncate">
                                            {formatDistanceToNow(new Date(post.createdAt), {
                                                addSuffix: true,
                                                locale: vi,
                                            })}
                                        </span>
                                        {post.privacy !== 'public' && (
                                            <span className="flex-shrink-0">· {post.privacy === 'friends' ? 'Bạn bè' : 'Chỉ mình tôi'}</span>
                                        )}
                                        {post.isEdited && <span className="flex-shrink-0">· Đã chỉnh sửa</span>}
                                    </div>
                                </div>
                            </div>

                            {post.author._id === user?._id && (
                                <div className="relative">
                                    <button
                                        onClick={() => toggleMenu(post._id)}
                                        className="p-1.5 rounded-xl hover:bg-[var(--cn-bg-section)] transition-colors"
                                    >
                                        <MoreHorizontal className="w-5 h-5 text-gray-500" />
                                    </button>
                                    {showMenu[post._id] && (
                                        <>
                                            {/* Backdrop to close menu when clicking outside */}
                                            <div
                                                className="fixed inset-0 z-[5]"
                                                onClick={() => setShowMenu((prev) => ({ ...prev, [post._id]: false }))}
                                            />
                                            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 min-w-[150px]">
                                                <button
                                                    onClick={() => handleEdit(post)}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Chỉnh sửa
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post._id)}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Xóa bài đăng
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Post content */}
                        <div className="mb-3 sm:mb-4">
                            <p className="text-xs sm:text-sm text-[var(--cn-text-main)] whitespace-pre-wrap">{post.content}</p>
                            {post.location && (
                                <div className="flex items-center gap-1 mt-2 text-[10px] sm:text-xs text-gray-500">
                                    <MapPin className="w-3 h-3" />
                                    <span>{post.location}</span>
                                </div>
                            )}
                            {post.feeling && (
                                <div className="flex items-center gap-1 mt-2 text-[10px] sm:text-xs text-gray-500">
                                    <Smile className="w-3 h-3" />
                                    <span>đang cảm thấy {post.feeling}</span>
                                </div>
                            )}
                        </div>

                        {/* Post images */}
                        {post.images && post.images.length > 0 && (
                            <div className="mb-3 sm:mb-4">
                                {post.images.length === 1 && (
                                    <div className="relative w-full h-[300px] rounded-lg overflow-hidden cursor-pointer" onClick={() => { setPreviewIndex(prev => ({ ...prev, [post._id]: 0 })); setShowImagePreview(prev => ({ ...prev, [post._id]: true })); }}>
                                        <img src={post.images[0]} alt="Post image" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                {post.images.length === 2 && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {post.images.map((img: string, index: number) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => { setPreviewIndex(prev => ({ ...prev, [post._id]: index })); setShowImagePreview(prev => ({ ...prev, [post._id]: true })); }}>
                                                <img src={img} alt={`Post image ${index + 1}`} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {post.images.length === 3 && (
                                    <div className="space-y-2">
                                        <div className="relative w-full h-[200px] rounded-lg overflow-hidden cursor-pointer" onClick={() => { setPreviewIndex(prev => ({ ...prev, [post._id]: 0 })); setShowImagePreview(prev => ({ ...prev, [post._id]: true })); }}>
                                            <img src={post.images[0]} alt="Post image 1" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {post.images.slice(1).map((img: string, index: number) => (
                                                <div key={index + 1} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => { setPreviewIndex(prev => ({ ...prev, [post._id]: index + 1 })); setShowImagePreview(prev => ({ ...prev, [post._id]: true })); }}>
                                                    <img src={img} alt={`Post image ${index + 2}`} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {post.images.length === 4 && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {post.images.map((img: string, index: number) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => { setPreviewIndex(prev => ({ ...prev, [post._id]: index })); setShowImagePreview(prev => ({ ...prev, [post._id]: true })); }}>
                                                <img src={img} alt={`Post image ${index + 1}`} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {post.images.length === 5 && (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            {post.images.slice(0, 2).map((img: string, index: number) => (
                                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => { setPreviewIndex(prev => ({ ...prev, [post._id]: index })); setShowImagePreview(prev => ({ ...prev, [post._id]: true })); }}>
                                                    <img src={img} alt={`Post image ${index + 1}`} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {post.images.slice(2).map((img: string, index: number) => (
                                                <div key={index + 2} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => { setPreviewIndex(prev => ({ ...prev, [post._id]: index + 2 })); setShowImagePreview(prev => ({ ...prev, [post._id]: true })); }}>
                                                    <img src={img} alt={`Post image ${index + 3}`} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {post.images.length >= 6 && (
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            {post.images.slice(0, 2).map((img: string, index: number) => (
                                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => { setPreviewIndex(prev => ({ ...prev, [post._id]: index })); setShowImagePreview(prev => ({ ...prev, [post._id]: true })); }}>
                                                    <img src={img} alt={`Post image ${index + 1}`} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {post.images.slice(2, 4).map((img: string, index: number) => (
                                                <div key={index + 2} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => { setPreviewIndex(prev => ({ ...prev, [post._id]: index + 2 })); setShowImagePreview(prev => ({ ...prev, [post._id]: true })); }}>
                                                    <img src={img} alt={`Post image ${index + 3}`} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                            <div key={4} className="relative aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => { setPreviewIndex(prev => ({ ...prev, [post._id]: 4 })); setShowImagePreview(prev => ({ ...prev, [post._id]: true })); }}>
                                                <img src={post.images[4]} alt="Post image 5" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="text-white font-semibold text-lg">+{post.images.length - 5}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Image preview modal */}
                        <ForumImagePreview
                            images={post.images || []}
                            initialIndex={previewIndex[post._id] || 0}
                            isOpen={showImagePreview[post._id] || false}
                            onClose={() => setShowImagePreview(prev => ({ ...prev, [post._id]: false }))}
                        />

                        {/* Post videos */}
                        {post.videos && post.videos.length > 0 && (
                            <div className="space-y-2 mb-3 sm:mb-4">
                                {post.videos.map((video: string, index: number) => (
                                    <div key={index} className="relative rounded-lg overflow-hidden bg-gray-100">
                                        <video src={video} className="w-full h-48 sm:h-64 object-cover" controls />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Original post (if shared) */}
                        {post.originalPost && (
                            <div className="bg-[var(--cn-bg-section)] rounded-xl p-2 sm:p-3 mb-3 sm:mb-4 border border-[var(--cn-border)]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Avatar className="w-5 h-5 sm:w-6 sm:h-6">
                                        <AvatarImage src={post.originalPost.author?.avatar} />
                                        <AvatarFallback className="text-[10px] sm:text-xs font-bold bg-[var(--cn-primary)] text-white">
                                            {post.originalPost.author?.fullName?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-[10px] sm:text-xs font-bold">{post.originalPost.author?.fullName}</span>
                                </div>
                                <p className="text-[10px] sm:text-xs text-gray-600">{post.originalPost.content}</p>
                            </div>
                        )}

                        {/* Post actions */}
                        <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-[var(--cn-border)] relative">
                            <div className="flex items-center gap-1.5 z-20">
                                <div className="relative">
                                    <button
                                        onClick={() => toggleReactionPicker(post._id)}
                                        className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-[var(--cn-bg-section)] transition-colors text-[10px] sm:text-sm ${getUserReaction(post) ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        {getUserReaction(post) ? (
                                            <img
                                                src={`/icons/${getUserReaction(post)}.svg`}
                                                alt={getUserReaction(post) || 'reaction'}
                                                className="w-4 h-4 sm:w-5 sm:h-5"
                                            />
                                        ) : (
                                            <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5" />
                                        )}
                                        <span>{post.likeCount}</span>
                                    </button>

                                    {/* Reaction Picker */}
                                    {showReactionPicker[post._id] && (
                                        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 p-2 flex gap-1 z-20">
                                            {['like', 'love', 'haha', 'wow', 'sad', 'angry'].map((reaction) => (
                                                <button
                                                    key={reaction}
                                                    onClick={() => handleReaction(post._id, reaction)}
                                                    className="w-10 h-10 hover:scale-125 transition-transform flex items-center justify-center"
                                                >
                                                    <img
                                                        src={`/icons/${reaction}.svg`}
                                                        alt={reaction}
                                                        className="w-8 h-8"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => toggleCommentSection(post._id)}
                                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-[var(--cn-bg-section)] transition-colors text-[10px] sm:text-sm text-gray-600 dark:text-gray-400"
                                >
                                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span>{post.commentCount}</span>
                                </button>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleReactionDetails(post._id);
                                }}
                                className="flex items-center -ml-2 z-10 hover:opacity-80 transition-opacity"
                            >
                                {post.reactions && Object.entries(post.reactions).filter(([_, count]) => (count as number) > 0).map(([reaction, count], index, array) => (
                                    <img
                                        key={reaction}
                                        src={`/icons/${reaction}.svg`}
                                        alt={reaction}
                                        className={`w-5 h-5 sm:w-6 sm:h-6 border-2 border-white rounded-full ${index < array.length - 1 ? '-mr-1' : ''}`}
                                        title={`${reaction}: ${count} - Click to view details`}
                                    />
                                ))}
                            </button>
                        </div>

                        {/* Comment Section */}
                        {showComments[post._id] && (
                            <div className="mt-[5px]">
                                <CommentSection
                                    targetType="feed"
                                    targetId={post._id}
                                    onCommentCountChange={(count) => {
                                        setPosts(prev =>
                                            prev.map(p =>
                                                p._id === post._id ? { ...p, commentCount: count } : p
                                            )
                                        );
                                    }}
                                />
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="flex items-center justify-center py-6">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-[var(--cn-primary)] border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-gray-500">Đang tải...</span>
                        </div>
                    </div>
                )}

                {/* Observer target for infinite scroll */}
                <div ref={observerTarget} className="h-4" />
            </div>

            {/* Edit Post Modal */}
            {editingPost && (
                <EditPostModal
                    post={editingPost}
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingPost(null);
                    }}
                    onPostUpdated={handlePostUpdated}
                />
            )}

            {/* Reaction Details Modals */}
            {posts.map((post) => (
                showReactionDetails[post._id] && (
                    <div
                        key={`reaction-${post._id}`}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => toggleReactionDetails(post._id)}
                    >
                        <div
                            className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-gray-200 flex items-center justify-end">
                                <button
                                    onClick={() => toggleReactionDetails(post._id)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-600" />
                                </button>
                            </div>
                            {/* Reaction Tabs */}
                            <div className="px-4 pt-2 border-b border-gray-200">
                                <div className="flex items-center justify-center gap-6 overflow-x-auto">
                                    <button
                                        onClick={() => setActiveReactionFilter(prev => ({ ...prev, [post._id]: null }))}
                                        className={`pb-3 transition-colors whitespace-nowrap flex items-center gap-2 text-gray-700 hover:text-blue-500 relative ${activeReactionFilter[post._id] === null ? 'text-blue-500' : ''
                                            }`}
                                    >
                                        Tất cả
                                        {activeReactionFilter[post._id] === null && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                                        )}
                                    </button>
                                    {Object.entries(post.reactions || {})
                                        .filter(([_, count]) => (count as number) > 0)
                                        .map(([reaction, count]) => (
                                            <button
                                                key={reaction}
                                                onClick={() => setActiveReactionFilter(prev => ({ ...prev, [post._id]: reaction }))}
                                                className={`pb-3 transition-colors whitespace-nowrap flex items-center gap-2 text-gray-700 hover:text-blue-500 relative ${activeReactionFilter[post._id] === reaction ? 'text-blue-500' : ''
                                                    }`}
                                            >
                                                <img
                                                    src={`/icons/${reaction}.svg`}
                                                    alt={reaction}
                                                    className="w-5 h-5"
                                                />
                                                {count as number}
                                                {activeReactionFilter[post._id] === reaction && (
                                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                                                )}
                                            </button>
                                        ))}
                                </div>
                            </div>
                            {/* User List */}
                            <div className="p-4 overflow-y-auto flex-1">
                                {(() => {
                                    let filteredReactions = post.userReactions || [];
                                    if (activeReactionFilter[post._id]) {
                                        filteredReactions = filteredReactions.filter(
                                            (ur: IForumPostReaction) => ur.reaction === activeReactionFilter[post._id]
                                        );
                                    }

                                    return filteredReactions.length > 0 ? (
                                        <div className="space-y-3">
                                            {filteredReactions.map((userReaction: IForumPostReaction, index: number) => {
                                                const userData = typeof userReaction.userId === 'string' ? null : userReaction.userId as IForumUser;
                                                return (
                                                    <div key={index} className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <Avatar className="w-10 h-10">
                                                                {userData?.avatar ? (
                                                                    <AvatarImage src={userData.avatar} />
                                                                ) : (
                                                                    <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-blue-500 to-purple-500">
                                                                        {userData?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                                                    </AvatarFallback>
                                                                )}
                                                            </Avatar>
                                                            <div className="absolute -bottom-1 -right-1">
                                                                <img
                                                                    src={`/icons/${userReaction.reaction}.svg`}
                                                                    alt={userReaction.reaction}
                                                                    className="w-5 h-5"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">
                                                                {userData?.fullName || 'Người dùng'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-400 py-8">Chưa có ai thả cảm xúc</p>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                )
            ))}
        </>
    );
}
