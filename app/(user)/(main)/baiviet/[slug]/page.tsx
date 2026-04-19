'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import BlogDetail from '@/components/blog/blog.detail';
import BlogSidebar from '@/components/blog/blog.sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { IPost, IComment } from '@/types/post.type';
import { postApi } from '@/lib/api/post.api';
import { useAuthStore } from '@/store/auth.store';

export default function ChiTietBaiVietPage() {
    const { slug } = useParams();
    const { user, token } = useAuthStore();
    const [post, setPost] = useState<IPost | null>(null);
    const [comments, setComments] = useState<IComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [bookmarked, setBookmarked] = useState(false);
    const viewTracked = useRef(false);

    const buildCommentTree = (flat: IComment[]): IComment[] => {
        const map = new Map<string, IComment>();
        const roots: IComment[] = [];

        flat.forEach((c) => map.set(c._id, { ...c, children: [] }));

        flat.forEach((c) => {
            const node = map.get(c._id)!;
            if (c.parentId && map.has(c.parentId)) {
                map.get(c.parentId)!.children!.push(node);
            } else {
                roots.push(node);
            }
        });

        return roots;
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

    const handleLike = async () => {
        if (!token || !post) return;
        try {
            const result = await postApi.likePost(post._id, token);
            if (result.success) {
                setLiked(result.data.liked);
                setLikeCount(result.data.likes);
            }
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    const handleSubmitComment = async (content: string, parentId?: string | null) => {
        if (!token || !post) return;
        try {
            await postApi.addComment(post._id, content, token, parentId ?? null);
            await fetchPost();
        } catch (error) {
            console.error('Add comment error:', error);
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
            await fetchPost();
        } catch (error) {
            console.error('Delete comment error:', error);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Skeleton className="h-10 w-3/4" />
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-96 w-full" />
                        </div>
                        <div className="lg:col-span-1">
                            <Skeleton className="h-64 w-full rounded-2xl" />
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
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
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
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <BlogSidebar
                                authorName={post.author.fullName}
                                authorBio={post.author.bio || ''}
                                likeCount={likeCount}
                                commentCount={comments.length}
                                liked={liked}
                                bookmarked={bookmarked}
                                onLike={handleLike}
                                onComment={() => {
                                    document.getElementById('comment-section')?.scrollIntoView({
                                        behavior: 'smooth',
                                    });
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}