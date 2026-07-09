'use client';

import React, { useState, useCallback } from 'react';
import CreatePostForm from '@/components/forum/CreatePostForm';
import PostFeed from '@/components/forum/PostFeed';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { IForumPost } from '@/lib/api/forum.api';

export default function ForumThongtinPage() {
    const [posts, setPosts] = useState<IForumPost[]>([]);
    const [hasFetched, setHasFetched] = useState(false);

    const handlePostCreated = useCallback((newPost: IForumPost) => {
        setPosts(prev => {
            // Avoid duplicates
            if (prev.some(p => p._id === newPost._id)) return prev;
            return [newPost, ...prev];
        });
    }, []);

    const handlePostsChange = useCallback((updatedPosts: IForumPost[]) => {
        setPosts(updatedPosts);
        if (updatedPosts.length > 0 && !hasFetched) {
            setHasFetched(true);
        }
    }, [hasFetched]);

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

                {/* Post Feed - pass posts only after initial fetch */}
                <PostFeed posts={hasFetched ? posts : undefined} onPostsChange={handlePostsChange} />
            </div>
        </div>
    );
}
