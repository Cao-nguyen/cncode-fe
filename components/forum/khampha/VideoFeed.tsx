'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Home, Users, UserCheck2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import CommentSection from '@/components/comment/CommentSection';
import VideoPlayer from './VideoPlayer';
import VideoActions from './VideoActions';
import VideoInfo from './VideoInfo';
import ProgressBar from './ProgressBar';
import { KhamphaVideo, VideoTab } from './types';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface VideoFeedProps {
  initialTab?: VideoTab;
}

export default function VideoFeed({ initialTab = 'khampha' }: VideoFeedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoIdFromUrl = searchParams?.get('id');

  const getCurrentUserId = () => {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (!authStorage) return null;
      const parsed = JSON.parse(authStorage);
      const token = parsed?.state?.token;
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || payload._id || payload.userId;
    } catch {
      return null;
    }
  };

  const [videos, setVideos] = useState<KhamphaVideo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<VideoTab>(initialTab);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => getCurrentUserId());
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);

  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const authStorage = localStorage.getItem('auth-storage');
        const parsed = authStorage ? JSON.parse(authStorage) : null;
        const token = parsed?.state?.token;

        let endpoint = '/api/khampha';
        if (activeTab === 'friends') endpoint = '/api/khampha/friends';
        if (activeTab === 'following') endpoint = '/api/khampha/following';

        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${API_URL}${endpoint}`, { headers });
        setVideos(response.data.data || response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching videos:', error);
        if (axios.isAxiosError(error)) {
          console.error('API Error:', error.response?.data);
          console.error('Status:', error.response?.status);
          console.error('Endpoint:', error.config?.url);
        }
        setLoading(false);
        toast.error('Không thể tải video. Vui lòng thử lại sau.');
      }
    };

    fetchVideos();
  }, [activeTab]);

  // Handle video navigation
  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
      setCurrentIndex(newIndex);
    }
  };

  // Handle like
  const toggleLike = async (videoId: string, isLiked: boolean) => {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (!authStorage) {
        toast.error('Vui lòng đăng nhập để thích video');
        return;
      }

      const parsed = JSON.parse(authStorage);
      const token = parsed?.state?.token;

      if (!token) {
        toast.error('Vui lòng đăng nhập để thích video');
        return;
      }

      await axios.post(
        `${API_URL}/api/khampha/${videoId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVideos(prevVideos =>
        prevVideos.map(video => {
          if (video._id === videoId) {
            const userId = currentUserId || '';
            return {
              ...video,
              likeCount: isLiked ? video.likeCount - 1 : video.likeCount + 1,
              likes: isLiked
                ? video.likes.filter(id => id !== userId)
                : [...video.likes, userId]
            };
          }
          return video;
        })
      );
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  // Handle favorite
  const toggleFavorite = async (videoId: string, isFavorited: boolean) => {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (!authStorage) {
        toast.error('Vui lòng đăng nhập để thêm vào yêu thích');
        return;
      }

      const parsed = JSON.parse(authStorage);
      const token = parsed?.state?.token;

      if (!token) {
        toast.error('Vui lòng đăng nhập để thêm vào yêu thích');
        return;
      }

      await axios.post(
        `${API_URL}/api/khampha/${videoId}/favorite`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVideos(prevVideos =>
        prevVideos.map(video => {
          if (video._id === videoId) {
            const userId = currentUserId || '';
            return {
              ...video,
              favoriteCount: isFavorited ? video.favoriteCount - 1 : video.favoriteCount + 1,
              favorites: isFavorited
                ? video.favorites.filter(id => id !== userId)
                : [...video.favorites, userId]
            };
          }
          return video;
        })
      );
    } catch (error) {
      console.error('Error favoriting video:', error);
    }
  };

  // Handle follow
  const toggleFollow = async (authorId: string) => {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (!authStorage) {
        toast.error('Vui lòng đăng nhập để theo dõi');
        return;
      }

      const parsed = JSON.parse(authStorage);
      const token = parsed?.state?.token;

      if (!token) {
        toast.error('Vui lòng đăng nhập để theo dõi');
        return;
      }

      const isFollowing = following.has(authorId);
      await axios.post(
        `${API_URL}/api/users/${authorId}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFollowing(prev => {
        const next = new Set(prev);
        if (isFollowing) {
          next.delete(authorId);
        } else {
          next.add(authorId);
        }
        return next;
      });
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleProgressPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDraggingProgress(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleProgressPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingProgress) return;
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setVideoProgress(progress);
  };

  const handleProgressPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDraggingProgress(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleProgressPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDraggingProgress(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const currentVideo = videos[currentIndex];
  const commentVideoId = showComments && currentVideo ? currentVideo._id : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white/60">Đang tải...</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/60">
        <Home className="w-16 h-16 mb-4" />
        <p>Chưa có video nào</p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Tab Navigation */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-black/40 backdrop-blur-sm rounded-full p-1">
        {(['khampha', 'friends', 'following'] as VideoTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeTab === tab
                ? "bg-white text-black"
                : "text-white/80 hover:text-white"
            )}
          >
            {tab === 'khampha' && 'Khám phá'}
            {tab === 'friends' && 'Bạn bè'}
            {tab === 'following' && 'Đang theo dõi'}
          </button>
        ))}
      </div>

      {/* Video Feed */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto snap-y snap-mandatory scroll-smooth"
        onScroll={handleScroll}
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {videos.map((video, index) => (
          <div
            key={video._id}
            ref={(el) => {
              if (el) itemRefs.current[index] = el;
            }}
            className="h-full snap-start relative"
          >
            <div className="flex h-full">
              {/* Video Area */}
              <div className="flex-1 relative bg-black">
                <VideoPlayer
                  video={video}
                  index={index}
                  isActive={index === currentIndex}
                  isMuted={isMuted}
                  isPlaying={isPlaying && index === currentIndex}
                  onPlayPause={() => setIsPlaying(!isPlaying)}
                  onToggleMute={() => setIsMuted(!isMuted)}
                  onTimeUpdate={setVideoProgress}
                  onLoadedMetadata={() => {}}
                  onVideoClick={() => setIsPlaying(!isPlaying)}
                />
                <ProgressBar
                  progress={index === currentIndex ? videoProgress : 0}
                  isDragging={isDraggingProgress}
                  onPointerDown={handleProgressPointerDown}
                  onPointerMove={handleProgressPointerMove}
                  onPointerUp={handleProgressPointerUp}
                  onPointerCancel={handleProgressPointerCancel}
                />
              </div>

              {/* Actions & Info */}
              <div className="hidden lg:flex w-96 flex-col justify-between p-4 bg-gradient-to-l from-black/80 to-transparent">
                <div className="flex-1" />
                <div className="space-y-4">
                  <VideoActions
                    likeCount={video.likeCount}
                    commentCount={video.commentCount}
                    shareCount={video.shareCount}
                    isLiked={video.likes.includes(currentUserId || '')}
                    isFavorited={video.favorites.includes(currentUserId || '')}
                    onToggleLike={() => toggleLike(video._id, video.likes.includes(currentUserId || ''))}
                    onToggleFavorite={() => toggleFavorite(video._id, video.favorites.includes(currentUserId || ''))}
                    onOpenComments={() => setShowComments(true)}
                    onOpenShare={() => setShowShareModal(true)}
                  />
                  <VideoInfo
                    video={video}
                    isFollowing={following.has(video.author._id)}
                    onToggleFollow={() => toggleFollow(video.author._id)}
                    expanded={expandedIds.has(video._id)}
                    onToggleExpand={() => toggleExpand(video._id)}
                  />
                </div>
              </div>
            </div>

            {/* Mobile Actions Overlay */}
            <div className="lg:hidden absolute right-4 bottom-24 flex flex-col gap-4">
              <VideoActions
                likeCount={video.likeCount}
                commentCount={video.commentCount}
                shareCount={video.shareCount}
                isLiked={video.likes.includes(currentUserId || '')}
                isFavorited={video.favorites.includes(currentUserId || '')}
                onToggleLike={() => toggleLike(video._id, video.likes.includes(currentUserId || ''))}
                onToggleFavorite={() => toggleFavorite(video._id, video.favorites.includes(currentUserId || ''))}
                onOpenComments={() => setShowComments(true)}
                onOpenShare={() => setShowShareModal(true)}
              />
            </div>

            {/* Mobile Info Overlay */}
            <div className="lg:hidden absolute left-4 bottom-24 right-20">
              <VideoInfo
                video={video}
                isFollowing={following.has(video.author._id)}
                onToggleFollow={() => toggleFollow(video.author._id)}
                expanded={expandedIds.has(video._id)}
                onToggleExpand={() => toggleExpand(video._id)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Comments Panel */}
      {showComments && commentVideoId && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden">
          <div className="absolute bottom-0 left-0 right-0 h-[70vh] bg-white rounded-t-2xl">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Bình luận</h3>
              <button onClick={() => setShowComments(false)} className="p-2">
                ✕
              </button>
            </div>
            <CommentSection targetType="short_video" targetId={commentVideoId} />
          </div>
        </div>
      )}
    </div>
  );
}
