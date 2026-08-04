'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { blogApi, Blog } from '@/lib/api/blog.api';
import { toast } from 'sonner';
import { Calendar, Eye, User, Loader2, Heart, Bookmark, MessageCircle, Tag, Folder, ChevronRight, Home, Feather, Play, Pause, Clock, Volume2 } from 'lucide-react';
import StaticContent from '@/components/common/StaticContent';
import CommentSection from '@/components/comment/CommentSection';
import { useAuthStore } from '@/store/auth.store';
import { getImageUrl } from '@/lib/utils/imageUrl';
import { SendGiftButton } from '@/components/gift/SendGiftButton';
import { BlogGiftList } from '@/components/gift/BlogGiftList';

export default function BlogDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, token } = useAuthStore();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
    const viewCountedRef = React.useRef(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [selectedVoice, setSelectedVoice] = useState<string>('');
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const [fullText, setFullText] = useState<string>('');

    useEffect(() => {
        fetchBlog();
        fetchRelatedBlogs();

        // Load available voices for text-to-speech
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            const vietnameseVoices = availableVoices.filter(voice => voice.lang.includes('vi'));

            // Try to find female Vietnamese voices first
            const femaleVietnameseVoices = vietnameseVoices.filter(voice =>
                voice.name.toLowerCase().includes('female') ||
                voice.name.toLowerCase().includes('woman') ||
                voice.name.toLowerCase().includes('google tiếng việt')
            );

            setVoices(vietnameseVoices.length > 0 ? vietnameseVoices : availableVoices);

            if (femaleVietnameseVoices.length > 0) {
                setSelectedVoice(femaleVietnameseVoices[0].name);
            } else if (vietnameseVoices.length > 0) {
                setSelectedVoice(vietnameseVoices[0].name);
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.cancel();
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            // Cleanup: Tăng viewCount khi user thoát khỏi trang
            const slug = params.slug as string;
            const sessionKey = `blog_viewed_${slug}`;

            // Kiểm tra đã count trong session chưa
            if (!sessionStorage.getItem(sessionKey) && !viewCountedRef.current) {
                viewCountedRef.current = true;
                sessionStorage.setItem(sessionKey, 'true');

                // Gọi API tăng viewCount
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blog/increment-view/${slug}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }).catch(err => console.error('Increment view error:', err));
            }
        };
    }, [params.slug]);

    useEffect(() => {
        if (blog && token) {
            checkInteraction();
        }
    }, [blog, token]);

    const fetchBlog = async () => {
        try {
            const res = await blogApi.getBlogBySlug(params.slug as string);
            if (res.success) {
                setBlog(res.data);
                setLikeCount(res.data.likeCount);
            } else {
                toast.error('Không tìm thấy bài viết');
                router.push('/blog');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
            router.push('/blog');
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedBlogs = async () => {
        try {
            const res = await blogApi.getRelatedBlogs(params.slug as string, 5);
            if (res.success) {
                setRelatedBlogs(res.data);
            }
        } catch (error) {
            console.error('Fetch related blogs error:', error);
        }
    };

    const checkInteraction = async () => {
        if (!blog || !token) return;
        try {
            const res = await blogApi.checkInteraction(blog._id);
            if (res.success) {
                setLiked(res.data.liked);
                setBookmarked(res.data.bookmarked);
            }
        } catch (error) {
            console.error('Check interaction error:', error);
        }
    };

    const handleLike = async () => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để thích bài viết');
            return;
        }
        if (!blog) return;

        try {
            const res = await blogApi.toggleLike(blog._id);
            if (res.success) {
                setLiked(res.liked);
                setLikeCount(prev => res.liked ? prev + 1 : prev - 1);
                toast.success(res.message);
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleBookmark = async () => {
        if (!token) {
            toast.error('Vui lòng đăng nhập để lưu bài viết');
            return;
        }
        if (!blog) return;

        try {
            const res = await blogApi.toggleBookmark(blog._id);
            if (res.success) {
                setBookmarked(res.bookmarked);
                toast.success(res.message);
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const categoryLabels: Record<string, string> = {
        technology: 'Công nghệ',
        education: 'Giáo dục',
        news: 'Tin tức',
        contest: 'Cuộc thi',
        other: 'Khác'
    };

    const handlePlayPause = () => {
        if (!blog) return;

        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            // Keep current time when pausing
        } else {
            window.speechSynthesis.cancel();

            // Extract text from content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = blog.content;
            const text = tempDiv.textContent || tempDiv.innerText || '';
            setFullText(text);

            // If resuming from a paused position
            if (currentTime > 0 && fullText) {
                const percentage = currentTime / totalTime;
                const charIndex = Math.floor(percentage * fullText.length);
                const textFromPosition = fullText.slice(charIndex);

                const utterance = new SpeechSynthesisUtterance(textFromPosition);
                utteranceRef.current = utterance;

                const voice = voices.find(v => v.name === selectedVoice) || voices[0];
                if (voice) {
                    utterance.voice = voice;
                }

                utterance.lang = 'vi-VN';
                utterance.rate = 1.3;
                utterance.pitch = 1;

                utterance.onstart = () => {
                    setIsPlaying(true);

                    // Start timer to track actual time
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                    }
                    timerRef.current = setInterval(() => {
                        setCurrentTime(prev => prev + 0.1);
                    }, 100);
                };

                utterance.onend = () => {
                    setIsPlaying(false);
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                };

                utterance.onerror = () => {
                    setIsPlaying(false);
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                };

                window.speechSynthesis.speak(utterance);
            } else {
                // Starting from beginning
                const utterance = new SpeechSynthesisUtterance(text);
                utteranceRef.current = utterance;

                const voice = voices.find(v => v.name === selectedVoice) || voices[0];
                if (voice) {
                    utterance.voice = voice;
                }

                utterance.lang = 'vi-VN';
                utterance.rate = 1.3;
                utterance.pitch = 1;

                utterance.onstart = () => {
                    setIsPlaying(true);
                    setCurrentTime(0);

                    // Start timer to track actual time
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                    }
                    timerRef.current = setInterval(() => {
                        setCurrentTime(prev => prev + 0.1);
                    }, 100);
                };

                utterance.onend = () => {
                    setIsPlaying(false);
                    setCurrentTime(0);
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                };

                utterance.onerror = () => {
                    setIsPlaying(false);
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                };

                window.speechSynthesis.speak(utterance);

                // Estimate total time
                const wordCount = text.split(/\s+/).length;
                setTotalTime(wordCount * 0.5);
            }
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!blog || !fullText) return;

        const seekTime = parseFloat(e.target.value);
        setCurrentTime(seekTime);

        // Calculate character index based on percentage
        const percentage = seekTime / totalTime;
        const charIndex = Math.floor(percentage * fullText.length);

        // Cancel current speech
        window.speechSynthesis.cancel();
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        // Start from the new position
        const textFromPosition = fullText.slice(charIndex);
        const utterance = new SpeechSynthesisUtterance(textFromPosition);
        utteranceRef.current = utterance;

        const voice = voices.find(v => v.name === selectedVoice) || voices[0];
        if (voice) {
            utterance.voice = voice;
        }

        utterance.lang = 'vi-VN';
        utterance.rate = 1.3;
        utterance.pitch = 1;

        utterance.onstart = () => {
            setIsPlaying(true);

            // Start timer to track actual time
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            timerRef.current = setInterval(() => {
                setCurrentTime(prev => prev + 0.1);
            }, 100);
        };

        utterance.onend = () => {
            setIsPlaying(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };

        utterance.onerror = () => {
            setIsPlaying(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };

        window.speechSynthesis.speak(utterance);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const processBlogImages = (content: string): string => {
        if (!content) return content;

        // Create a temporary div to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;

        // Find all img tags
        const images = tempDiv.querySelectorAll('img');
        images.forEach(img => {
            const src = img.getAttribute('src');
            if (src) {
                // Process the image URL through getImageUrl
                img.setAttribute('src', getImageUrl(src));
            }
        });

        return tempDiv.innerHTML;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!blog) return null;

    return (
        <div className="min-h-screen bg-gray-50 pt-16 md:pt-8 pb-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-600 mb-6">
                    <Link href="/" className="flex items-center gap-1 hover:text-gray-900 transition">
                        <Home className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="hidden sm:inline">Trang chủ</span>
                        <span className="sm:hidden">Home</span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                    <Link href="/blog" className="hover:text-gray-900 transition">
                        Blog
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
                    <span className="text-gray-900 font-medium truncate max-w-[120px] sm:max-w-xs md:max-w-xs">
                        {blog.title}
                    </span>
                </nav>

                {/* Header Section */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">{blog.title}</h1>

                    {/* Tags & Category + Metadata */}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 pb-4 border-b border-gray-200">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg text-sm font-medium shadow-sm">
                                {categoryLabels[blog.category] || blog.category}
                            </span>
                            {blog.tags && blog.tags.length > 0 && blog.tags.map((tag, index) => (
                                <span key={index} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="whitespace-nowrap">{formatDate(blog.publishedAt || blog.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="whitespace-nowrap">{blog.viewCount}</span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="whitespace-nowrap">{likeCount}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content with Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Blog Content */}
                    <div className="lg:col-span-2">
                        {/* Text-to-Speech Player */}
                        <div className="mb-6 bg-white rounded-2xl border border-gray-200 p-3 sm:p-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <button
                                    onClick={handlePlayPause}
                                    className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white hover:opacity-90 transition shrink-0"
                                >
                                    {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" data-filled={true} /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" data-filled={true} />}
                                </button>
                                <div className="hidden sm:block text-base font-bold text-gray-800 shrink-0">Nghe đọc bài</div>
                                <div className="flex-1 flex items-center gap-2 sm:gap-3">
                                    <input
                                        type="range"
                                        min="0"
                                        max={totalTime}
                                        step="0.1"
                                        value={currentTime}
                                        onChange={handleSeek}
                                        className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-500"
                                        style={{
                                            background: `linear-gradient(to right, #8b5cf6 0%, #6366f1 ${(currentTime / totalTime) * 100}%, #e5e7eb ${(currentTime / totalTime) * 100}%, #e5e7eb 100%)`
                                        }}
                                    />
                                    <div className="text-xs sm:text-sm text-gray-600 shrink-0 min-w-[3rem]">{formatTime(currentTime)}</div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="prose prose-lg max-w-none">
                                <StaticContent content={processBlogImages(blog.content)} />
                            </div>
                        </div>

                        {/* Author Badge */}
                        <div className="flex justify-end mb-6 -mt-7.5">
                            <div className="flex items-center gap-3 bg-gray-200 rounded-full px-4 py-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                                    <Feather className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-bold text-gray-800">{blog.author.fullName}</span>
                            </div>
                        </div>

                        {/* Like & Bookmark Actions */}
                        <div className="mb-6">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border transition ${liked
                                        ? 'border-red-200 bg-red-50 text-red-500'
                                        : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <Heart
                                        className="w-4 h-4 sm:w-5 sm:h-5"
                                        data-filled={liked}
                                        fill={liked ? 'currentColor' : 'none'}
                                    />
                                    <span className="text-xs sm:text-sm font-medium">{likeCount}</span>
                                </button>

                                <button
                                    onClick={handleBookmark}
                                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border transition ${bookmarked
                                        ? 'border-yellow-200 bg-yellow-50 text-yellow-500'
                                        : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <Bookmark
                                        className="w-4 h-4 sm:w-5 sm:h-5"
                                        data-filled={bookmarked}
                                        fill={bookmarked ? 'currentColor' : 'none'}
                                    />
                                    <span className="text-xs sm:text-sm font-medium">Lưu</span>
                                </button>

                                <SendGiftButton
                                    recipientId={blog.author._id}
                                    recipientName={blog.author.fullName}
                                    targetType="post"
                                    targetId={blog._id}
                                />

                                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-600">
                                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="text-xs sm:text-sm font-medium">{blog.commentCount} bình luận</span>
                                </div>
                            </div>
                        </div>

                        {/* Comment Section */}
                        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
                            <CommentSection targetType="blog" targetId={blog._id} />
                        </div>

                        {/* Gift List */}
                        <BlogGiftList blogId={blog._id} />
                    </div>

                    {/* Right: Sidebar */}
                    <div className="space-y-6 sticky top-24 self-start">
                        {/* Related Blogs */}
                        {relatedBlogs.length > 0 && (
                            <>
                                <h3 className="text-lg font-semibold text-gray-800 uppercase">Bài viết liên quan</h3>
                                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                                    {relatedBlogs.map((relatedBlog) => (
                                        <Link
                                            key={relatedBlog._id}
                                            href={`/blog/${relatedBlog.slug}`}
                                            className="block group"
                                        >
                                            <div className="flex gap-3">
                                                {relatedBlog.thumbnail && (
                                                    <img
                                                        src={getImageUrl(relatedBlog.thumbnail)}
                                                        alt={relatedBlog.title}
                                                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 mb-1">
                                                        {relatedBlog.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
                                                        {formatDate(relatedBlog.publishedAt || relatedBlog.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}