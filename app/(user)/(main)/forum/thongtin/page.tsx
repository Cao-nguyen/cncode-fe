'use client';

import React, { useState } from 'react';
import CreatePostForm from '@/components/forum/CreatePostForm';
import PostFeed from '@/components/forum/PostFeed';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { forumApi, IForumPost } from '@/lib/api/forum.api';
import { useAuthStore } from '@/store/auth.store';

export default function ForumThongtinPage() {
    const { user, token } = useAuthStore();
    const [posts, setPosts] = useState<IForumPost[]>([]);

    const handlePostCreated = (newPost: IForumPost) => {
        // Add new post to the beginning of the list, avoid duplicates
        setPosts((prev) => {
            if (prev.some(p => p._id === newPost._id)) {
                return prev;
            }
            return [newPost, ...prev];
        });
    };

    return (
        <div className="min-h-screen bg-[var(--cn-bg-section)] py-4 sm:py-6">
            <div className="container mx-auto px-3 sm:px-4 max-w-3xl">
                {/* Header */}
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <Link href="/forum" className="p-2 rounded-xl hover:bg-[var(--cn-bg-card)] transition-colors">
                        <ArrowLeft className="w-5 h-5 text-[var(--cn-text-sub)]" />
                    </Link>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-[var(--cn-text-main)]">Thông tin</h1>
                        <p className="text-xs sm:text-sm text-gray-500">Bản tin (Facebook style)</p>
                    </div>
                </div>

                {/* Create Post Form */}
                <CreatePostForm onPostCreated={handlePostCreated} />

                {/* Post Feed */}
                <PostFeed posts={posts.length > 0 ? posts : undefined} onPostsChange={setPosts} />
            </div>
        </div>
    );
}
