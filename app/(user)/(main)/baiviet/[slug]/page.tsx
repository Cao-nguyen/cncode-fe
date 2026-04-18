"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import BlogDetail from "@/components/blog/blog.detail";
import BlogSidebar from "@/components/blog/blog.sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { IPost, IComment, IApiResponse, IUser } from "@/types/post.type";
import { postApi } from "@/lib/api/post.api";

interface FormattedComment {
    id: string;
    content: string;
    authorName: string;
    authorAvatar: string;
    createdAt: string;
    parentId: string | null;
    replyToName?: string;
    children?: FormattedComment[];
}

export default function ChiTietBaiVietPage() {
    const { slug } = useParams();
    const [post, setPost] = useState<IPost | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<IPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [comments, setComments] = useState<FormattedComment[]>([]);
    const [currentUser, setCurrentUser] = useState<IUser | null>(null);

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            try {
                const parsedUser = JSON.parse(user) as IUser;
                setCurrentUser(parsedUser);
            } catch (error) {
                console.error("Failed to parse user:", error);
            }
        }
    }, []);

    useEffect(() => {
        if (slug) {
            fetchPost();
        }
    }, [slug]);

    const formatComments = (commentsArray: IComment[]): FormattedComment[] => {
        const map = new Map<string, FormattedComment>();
        const roots: FormattedComment[] = [];

        commentsArray.forEach((comment) => {
            const formattedComment: FormattedComment = {
                id: comment._id,
                content: comment.content,
                authorName: comment.user.fullName,
                authorAvatar: comment.user.avatar || "/avatar.png",
                createdAt: comment.createdAt,
                parentId: comment.parentId || null,
                replyToName: comment.replyToName,
                children: [],
            };
            map.set(comment._id, formattedComment);
        });

        commentsArray.forEach((comment) => {
            const formattedComment = map.get(comment._id);
            if (formattedComment) {
                if (comment.parentId && map.has(comment.parentId)) {
                    const parent = map.get(comment.parentId);
                    if (parent) {
                        if (!parent.children) parent.children = [];
                        parent.children.push(formattedComment);
                    }
                } else {
                    roots.push(formattedComment);
                }
            }
        });

        return roots;
    };

    const fetchPost = async () => {
        setLoading(true);
        try {
            const result = await postApi.getPostBySlug(slug as string);

            if (result.success && result.data) {
                setPost(result.data);
                // Nếu API trả về relatedPosts, nếu không thì để mặc định là mảng rỗng
                setRelatedPosts((result.data).relatedPosts || []);
                setLikeCount(result.data.likes || 0);

                // Kiểm tra xem user hiện tại đã like bài viết chưa
                const userLiked = currentUser?._id && result.data.likedBy?.includes(currentUser._id);
                setLiked(userLiked || false);

                const formattedComments = formatComments(result.data.comments || []);
                setComments(formattedComments);
            }
        } catch (error) {
            console.error("Fetch post error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        const token = localStorage.getItem("token");
        if (!token || !post) {
            console.error("No token found or post not loaded");
            return;
        }

        try {
            const result = await postApi.likePost(post._id, token);
            if (result.success) {
                setLiked(result.data.liked);
                setLikeCount(result.data.likes);
            }
        } catch (error) {
            console.error("Like error:", error);
        }
    };

    const handleAddComment = async (content: string, parentId?: string | null, replyToName?: string) => {
        const token = localStorage.getItem("token");
        if (!token || !post) {
            console.error("No token found or post not loaded");
            return;
        }

        if (!currentUser) {
            console.error("User not logged in");
            return;
        }

        try {
            const result = await postApi.addComment(post._id, content, token, parentId || null);
            if (result.success && result.data) {
                // Tìm comment vừa được thêm từ API response
                const newCommentData = result.data.find(c => c.content === content && c.user._id === currentUser._id);

                if (newCommentData) {
                    const newComment: FormattedComment = {
                        id: newCommentData._id,
                        content: newCommentData.content,
                        authorName: currentUser.fullName,
                        authorAvatar: currentUser.avatar || "/avatar.png",
                        createdAt: newCommentData.createdAt,
                        parentId: parentId || null,
                        replyToName: replyToName,
                        children: [],
                    };

                    if (parentId) {
                        const addChildToParent = (commentsList: FormattedComment[]): FormattedComment[] => {
                            return commentsList.map((comment) => {
                                if (comment.id === parentId) {
                                    return {
                                        ...comment,
                                        children: [...(comment.children || []), newComment],
                                    };
                                }
                                if (comment.children && comment.children.length > 0) {
                                    return {
                                        ...comment,
                                        children: addChildToParent(comment.children),
                                    };
                                }
                                return comment;
                            });
                        };
                        setComments((prev) => addChildToParent(prev));
                    } else {
                        setComments([newComment, ...comments]);
                    }
                } else {
                    // Nếu không tìm thấy, refresh toàn bộ comments
                    const refreshResult = await postApi.getPostBySlug(slug as string);
                    if (refreshResult.success && refreshResult.data) {
                        const formattedComments = formatComments(refreshResult.data.comments || []);
                        setComments(formattedComments);
                    }
                }
            }
        } catch (error) {
            console.error("Add comment error:", error);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        const token = localStorage.getItem("token");
        if (!token || !post) {
            console.error("No token found or post not loaded");
            return;
        }

        try {
            const result = await postApi.deleteComment(post._id, commentId, token);
            if (result.success && result.data) {
                // Refresh comments từ API response
                const formattedComments = formatComments(result.data);
                setComments(formattedComments);
            }
        } catch (error) {
            console.error("Delete comment error:", error);
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

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return "Hôm qua";
        if (diffDays < 7) return `${diffDays} ngày trước`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
        return date.toLocaleDateString("vi-VN");
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <BlogDetail
                            title={post.title}
                            content={post.content}
                            authorName={post.author.fullName}
                            authorAvatar={post.author.avatar || "/avatar.png"}
                            publishDate={formatDate(post.createdAt)}
                            readTime={`${post.readTime} phút đọc`}
                            likeCount={likeCount}
                            commentCount={comments.length}
                            comments={comments}
                            onSubmitComment={handleAddComment}
                            onDeleteComment={handleDeleteComment}
                            currentUser={currentUser}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <BlogSidebar
                                authorName={post.author.fullName}
                                authorBio={post.author.bio || "Chia sẻ kiến thức về công nghệ và lập trình"}
                                likeCount={likeCount}
                                commentCount={comments.length}
                                onLike={handleLike}
                                onComment={() => {
                                    document.getElementById("comment-section")?.scrollIntoView({ behavior: "smooth" });
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}