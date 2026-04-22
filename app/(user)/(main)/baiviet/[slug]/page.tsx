'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import BlogDetail from '@/components/blog/blog.detail';
import BlogSidebar from '@/components/blog/blog.sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { IPost, IComment, IReactions } from '@/types/post.type';
import { postApi } from '@/lib/api/post.api';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { ImagePreview } from '@/components/blog/ImagePreview';

export default function ChiTietBaiVietPage() {
    const { slug } = useParams();
    const { user, token } = useAuthStore();
    const { socket } = useSocket();
    const [post, setPost] = useState<IPost | null>(null);
    const [comments, setComments] = useState<IComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [bookmarked, setBookmarked] = useState(false);
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);
    const viewTracked = useRef(false);

    const buildCommentTree = (flat: IComment[]): IComment[] => {
        const map = new Map<string, IComment>();
        const roots: IComment[] = [];
        flat.forEach((c) => map.set(c._id, { ...c, children: [] }));
        flat.forEach((c) => {
            const node = map.get(c._id)!;
            if (c.parentId && map.has(c.parentId)) {
                const parent = map.get(c.parentId)!;
                parent.children = parent.children || [];
                parent.children.push(node);
            } else {
                roots.push(node);
            }
        });
        return roots;
    };

    const flattenComments = (tree: IComment[]): IComment[] => {
        const result: IComment[] = [];
        const traverse = (node: IComment) => {
            result.push(node);
            if (node.children) {
                node.children.forEach(traverse);
            }
        };
        tree.forEach(traverse);
        return result;
    };

    const fetchPost = useCallback(async () => {
        if (!slug) return;
        try {
            const result = await postApi.getPostBySlug(slug as string);
            if (result.success && result.data) {
                const p = result.data;
                setPost(p);
                setLikeCount(p.likes || 0);
                setLiked(user ? (p.likedBy?.includes(user.id) ?? false) : false);
                setBookmarked(user ? (p.bookmarks?.includes(user.id) ?? false) : false);
                setComments(buildCommentTree(p.comments || []));
            }
        } catch (error) {
            console.error('Fetch post error:', error);
        }
    }, [slug, user]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await fetchPost();
            setLoading(false);
        };
        load();
    }, [fetchPost]);

    useEffect(() => {
        if (!slug || viewTracked.current) return;
        viewTracked.current = true;
        postApi.trackView(slug as string).catch(() => { });
    }, [slug]);

    // Socket realtime handlers
    // Chỉ giữ lại useEffect này cho socket events
    useEffect(() => {
        if (!socket || !slug) return;

        // Handle new comment
        const handleNewComment = (data: { comment: IComment; postSlug: string }) => {
            if (data.postSlug !== slug) return;

            setComments(prevComments => {
                const newComment = data.comment;

                if (newComment.parentId) {
                    const addChildToParent = (nodes: IComment[]): IComment[] => {
                        return nodes.map(node => {
                            if (node._id === newComment.parentId) {
                                return {
                                    ...node,
                                    children: [...(node.children || []), newComment]
                                };
                            }
                            if (node.children && node.children.length > 0) {
                                return {
                                    ...node,
                                    children: addChildToParent(node.children)
                                };
                            }
                            return node;
                        });
                    };
                    return addChildToParent(prevComments);
                } else {
                    return [...prevComments, newComment];
                }
            });
        };

        // Handle delete comment
        const handleDeleteComment = (data: { commentId: string; postSlug: string }) => {
            if (data.postSlug !== slug) return;

            setComments(prevComments => {
                const removeComment = (nodes: IComment[]): IComment[] => {
                    return nodes.filter(node => {
                        if (node._id === data.commentId) return false;
                        if (node.children && node.children.length > 0) {
                            node.children = removeComment(node.children);
                        }
                        return true;
                    });
                };
                return removeComment(prevComments);
            });
        };

        // Handle update comment
        const handleUpdateComment = (data: { comment: IComment; postSlug: string }) => {
            if (data.postSlug !== slug) return;

            setComments(prevComments => {
                const updateCommentInTree = (nodes: IComment[]): IComment[] => {
                    return nodes.map(node => {
                        if (node._id === data.comment._id) {
                            return { ...node, ...data.comment };
                        }
                        if (node.children && node.children.length > 0) {
                            return {
                                ...node,
                                children: updateCommentInTree(node.children)
                            };
                        }
                        return node;
                    });
                };
                return updateCommentInTree(prevComments);
            });
        };

        // Handle reaction update
        const handleReactionUpdate = (data: {
            commentId: string;
            reactions: IReactions;
            postSlug: string;
        }) => {
            if (data.postSlug !== slug) return;

            setComments(prevComments => {
                const updateReactionInTree = (nodes: IComment[]): IComment[] => {
                    return nodes.map(node => {
                        if (node._id === data.commentId) {
                            return { ...node, reactions: data.reactions };
                        }
                        if (node.children && node.children.length > 0) {
                            return {
                                ...node,
                                children: updateReactionInTree(node.children)
                            };
                        }
                        return node;
                    });
                };
                return updateReactionInTree(prevComments);
            });
        };

        socket.on('comment:new', handleNewComment);
        socket.on('comment:deleted', handleDeleteComment);
        socket.on('comment:updated', handleUpdateComment);
        socket.on('comment:reaction_updated', handleReactionUpdate);

        return () => {
            socket.off('comment:new', handleNewComment);
            socket.off('comment:deleted', handleDeleteComment);
            socket.off('comment:updated', handleUpdateComment);
            socket.off('comment:reaction_updated', handleReactionUpdate);
        };
    }, [socket, slug]);

    const handleLike = async () => {
        if (!token || !post) return;

        // Optimistic update
        const newLiked = !liked;
        setLiked(newLiked);
        setLikeCount(prev => newLiked ? prev + 1 : prev - 1);

        try {
            const result = await postApi.likePost(post._id, token);
            if (result.success) {
                setLiked(result.data.liked);
                setLikeCount(result.data.likes);
            } else {
                // Rollback
                setLiked(!newLiked);
                setLikeCount(prev => newLiked ? prev - 1 : prev + 1);
            }
        } catch (error) {
            // Rollback
            setLiked(!newLiked);
            setLikeCount(prev => newLiked ? prev - 1 : prev + 1);
            console.error('Like error:', error);
        }
    };

    const handleSubmitComment = async (content: string, parentId?: string | null) => {
        if (!token || !post) return;
        try {
            await postApi.addComment(post._id, content, token, parentId ?? null);
            // Không cần fetch lại, socket sẽ tự cập nhật
        } catch (error) {
            console.error('Add comment error:', error);
            throw error;
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (commentId === '__refresh__') {
            await fetchPost();
            return;
        }
        if (!token || !post) return;
        try {
            await postApi.deleteComment(post._id, commentId, token);
            // Không cần fetch lại, socket sẽ tự cập nhật
        } catch (error) {
            console.error('Delete comment error:', error);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4 min-w-0 overflow-hidden w-full">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-9 w-full" />
                            <Skeleton className="h-9 w-3/4" />
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <Skeleton className="h-3.5 w-28" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                            <Skeleton className="h-72 w-full" />
                            <Skeleton className="h-40 w-full" />
                        </div>
                        <div className="hidden lg:block lg:col-span-1">
                            <Skeleton className="h-48 w-full rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold">Không tìm thấy bài viết</h1>
            </div>
        );
    }

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 min-w-0 overflow-hidden">
                            <BlogDetail
                                post={post}
                                comments={comments}
                                likeCount={likeCount}
                                liked={liked}
                                bookmarked={bookmarked}
                                currentUser={user ?? null}
                                onLike={handleLike}
                                onBookmarkChange={setBookmarked}
                                onSubmitComment={handleSubmitComment}
                                onDeleteComment={handleDeleteComment}
                                onImagePreview={setPreviewSrc}
                            />
                        </div>
                        <div className="hidden lg:block lg:col-span-1">
                            <div className="sticky top-24">
                                <BlogSidebar
                                    authorName={post.author.fullName}
                                    authorId={post.author.id}
                                    authorBio={post.author.bio || ''}
                                    likeCount={likeCount}
                                    commentCount={comments.length}
                                    liked={liked}
                                    bookmarked={bookmarked}
                                    postId={post._id}
                                    postTitle={post.title}
                                    onLike={handleLike}
                                    onComment={() => {
                                        document
                                            .getElementById('comment-section')
                                            ?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {previewSrc && (
                <ImagePreview src={previewSrc} onClose={() => setPreviewSrc(null)} />
            )}
        </>
    );
}