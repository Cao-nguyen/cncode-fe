'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Play,
  Volume2,
  VolumeX,
  Plus,
  User,
  Music,
  Home,
  Users,
  UserCheck2,
  X,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import CommentSection from '@/components/comment/CommentSection';

interface KhamphaVideo {
  _id: string;
  videoUrl: string;
  streamUrl?: string; // URL streaming với Range Request support
  thumbnailUrl: string;
  caption: string;
  author: {
    _id: string;
    fullName: string;
    username: string;
    avatar: string;
    followers: number;
    following: number;
  };
  music?: {
    title: string;
    artist: string;
    coverUrl: string;
  };
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  favoriteCount: number;
  likes: string[];
  favorites: string[];
  createdAt: string;
  // Tổng thời lượng video (giây), nếu backend trả về thì ưu tiên dùng giá trị này
  // để thanh tua luôn hiện đúng full độ dài video ngay từ đầu, không phụ thuộc
  // vào việc trình duyệt đã tải/parse xong metadata của file video hay chưa.
  duration?: number;
}

// Khung tham chiếu 9:16 (1080x1920) - video sẽ luôn được "contain" (không bao giờ bị crop) bên trong khung này
const FRAME_ASPECT = 1080 / 1920;

// Ngưỡng ký tự để quyết định có hiện nút "Xem thêm" hay không (tương đương ~2 dòng trên mobile)
const CAPTION_TRUNCATE_LENGTH = 90;

// Render mô tả + hashtag chung 1 dòng, từ nào bắt đầu bằng # thì tô màu xanh
function renderCaptionWithHashtags(text: string) {
  return text.split(/(\s+)/).map((part, i) =>
    part.startsWith('#') && part.length > 1 ? (
      <span key={i} className="text-sky-400 font-semibold">
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

export default function KhamphaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoIdFromUrl = searchParams?.get('v');

  // Lấy user ID từ auth-storage
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
  const [isMuted, setIsMuted] = useState(false); // Mặc định BẬT tiếng khi vào trang / load lại trang
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoLoading, setVideoLoading] = useState<{ [key: number]: boolean }>({}); // Track loading state per video
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'khampha' | 'friends' | 'following'>('khampha');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => getCurrentUserId());
  const [showComments, setShowComments] = useState(false);
  // Derive commentVideoId from currentIndex and videos instead of managing it as state
  const commentVideoId = showComments && videos[currentIndex] ? videos[currentIndex]._id : null;
  const [showVideoMenu, setShowVideoMenu] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<KhamphaVideo | null>(null);
  const [editCaption, setEditCaption] = useState('');

  // Progress bar: use DB duration for consistency
  // - videoDuration: tổng thời lượng từ DB
  // - videoProgress: % đã phát (thanh trắng)
  const [videoProgress, setVideoProgress] = useState(0);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);

  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const touchStartYRef = useRef(0);
  const previousIndexRef = useRef(-1);
  const videoDurationRef = useRef(0);
  const videosRef = useRef<KhamphaVideo[]>([]);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    videosRef.current = videos;
  }, [videos]);

  // Hàm pause tất cả video - gọi trước khi chuyển video
  const pauseAllVideos = () => {
    Object.values(videoRefs.current).forEach(video => {
      if (!video) return;
      video.pause();
      video.currentTime = 0;
      video.muted = true;
    });
  };

  // Sử dụng duration từ video element (trình duyệt), fallback nếu chưa có metadata
  const currentVideo = videos[currentIndex];
  const videoElementDuration = useRef<number>(0);

  const getEffectiveDuration = (): number => {
    const currentVideoEl = videoRefs.current[currentIndex];
    const browserDuration = currentVideoEl?.duration;

    if (browserDuration !== undefined && isFinite(browserDuration) && browserDuration > 0) {
      videoElementDuration.current = browserDuration;
      return browserDuration;
    }

    const apiDuration = currentVideo?.duration;
    const hasValidApiDuration = typeof apiDuration === 'number' && isFinite(apiDuration) && apiDuration > 0;
    return hasValidApiDuration ? apiDuration : videoElementDuration.current;
  };

  useEffect(() => {
    const currentVideoEl = videoRefs.current[currentIndex];
    if (!currentVideoEl) return;

    const dur = currentVideoEl.duration;
    if (dur !== undefined && isFinite(dur) && dur > 0) {
      videoElementDuration.current = dur;
    }
  }, [currentIndex, videos]);

  // Dùng một hàm self-calling để tránh cảnh báo React
  useEffect(() => {
    const initialize = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/khampha`);
        const fetchedVideos = response.data.data;
        setVideos(fetchedVideos);

        // Nếu có video ID trong URL, tìm video đó và hiển thị
        if (videoIdFromUrl && fetchedVideos.length > 0) {
          const foundIndex = fetchedVideos.findIndex((v: KhamphaVideo) => v._id === videoIdFromUrl);
          if (foundIndex !== -1) {
            setCurrentIndex(foundIndex);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setLoading(false);
      }
    };
    initialize();
  }, [videoIdFromUrl]);

  // Removed URL update effect - không cần video ID trong URL nữa

  // Nhảy tới 1 video cụ thể (có khóa để tránh cuộn liên tiếp nhiều video 1 lúc)
  const goToIndex = (targetIndex: number) => {
    const clamped = Math.max(0, Math.min(videos.length - 1, targetIndex));
    if (clamped === currentIndexRef.current || isAnimatingRef.current) return;

    // Pause TẤT CẢ video ngay lập tức - fix âm thanh chồng
    pauseAllVideos();

    // Reset.isPlaying để video mới luôn tự động phát
    setIsPlaying(true);

    isAnimatingRef.current = true;
    setCurrentIndex(clamped);
    window.setTimeout(() => {
      isAnimatingRef.current = false;
    }, 450);
  };

  // Bắt sự kiện cuộn chuột / trackpad -> nhảy đúng 1 video mỗi lần
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isAnimatingRef.current) return;
      const direction = e.deltaY > 0 ? 1 : -1;
      goToIndex(currentIndexRef.current + direction);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [videos.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartYRef.current - e.changedTouches[0].clientY;
    const threshold = 50;
    if (Math.abs(diff) > threshold) {
      goToIndex(currentIndexRef.current + (diff > 0 ? 1 : -1));
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') goToIndex(currentIndexRef.current + 1);
      if (e.key === 'ArrowUp') goToIndex(currentIndexRef.current - 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [videos.length]);

  // 🎵 Specifically sync isMuted state to the current video element
  useEffect(() => {
    const currentVideoEl = videoRefs.current[currentIndex];
    if (currentVideoEl) {
      currentVideoEl.muted = isMuted;
      console.log("Syncing muted to current video:", isMuted, "actual value:", currentVideoEl.muted);

      // Also apply on next frame in case element just mounted
      const rafId = requestAnimationFrame(() => {
        const el = videoRefs.current[currentIndex];
        if (el) {
          el.muted = isMuted;
        }
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [isMuted, currentIndex]);

  // ✅ CONSOLIDATED: Quản lý TẤT CẢ video trong 1 useEffect duy nhất - fix audio overlap
  useEffect(() => {
    // Pause & mute TẤT CẢ video không phải hiện tại
    Object.entries(videoRefs.current).forEach(([key, video]) => {
      if (!video) return;
      const idx = Number(key);
      if (idx !== currentIndex) {
        video.pause();
        video.muted = true;
      }
    });

    // Sau đó chỉ xử lý video hiện tại
    const currentVideoEl = videoRefs.current[currentIndex];
    if (currentVideoEl) {
      // Initialize progress bar
      const total = getEffectiveDuration();
      if (total && total > 0) {
        setVideoProgress((currentVideoEl.currentTime / total) * 100);
      }

      if (isPlaying) {
        currentVideoEl.play().catch(err => {
          if (err.name !== 'AbortError') {
            console.error('Error playing video:', err);
          }
        });
      } else {
        currentVideoEl.pause();
      }
    }
  }, [currentIndex, isPlaying, videos]); // Run when videos changes too

  // We're handling timeupdate directly on the video element now

  // Seek theo vị trí con trỏ (dùng chung cho cả bấm và kéo)
  const seekToClientX = (clientX: number) => {
    const bar = progressBarRef.current;
    const currentVideoEl = videoRefs.current[currentIndex];
    if (!bar || !currentVideoEl) return;

    // Use effective duration (browser or API fallback)
    const totalDuration = getEffectiveDuration();
    if (!isFinite(totalDuration) || totalDuration <= 0) return;

    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    setVideoProgress(ratio * 100);
    currentVideoEl.currentTime = ratio * totalDuration;
  };

  const handleProgressPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Ngăn event lan truyền lên video element
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingProgress(true);
    seekToClientX(e.clientX);
  };

  const handleProgressPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Ngăn event lan truyền lên video element
    if (!isDraggingProgress) return;
    seekToClientX(e.clientX);
  };

  const handleProgressPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Ngăn event lan truyền lên video element
    // First finalize the seek with final position
    seekToClientX(e.clientX);
    setIsDraggingProgress(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Also handle pointer cancel
  const handleProgressPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDraggingProgress(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Tự động phát video đầu tiên khi load page với âm thanh
  useEffect(() => {
    // The consolidated useEffect already handles this, so we don't need this separate one
    // It will be handled by the main consolidated useEffect above
  }, []);

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
        `${process.env.NEXT_PUBLIC_API_URL}/api/khampha/${videoId}/like`,
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/khampha/${videoId}/favorite`,
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

  const handleShare = async (videoId: string) => {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage)?.state?.token : null;

      if (token) {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/khampha/${videoId}/share`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      const link = `${window.location.origin}/forum/khampha`;
      await navigator.clipboard.writeText(link);
      toast.success('Đã sao chép liên kết!');
    } catch (error) {
      console.error('Error sharing video:', error);
      toast.error('Lỗi khi chia sẻ');
    }
  };

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

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/${authorId}/follow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const newFollowing = new Set(following);
        if (newFollowing.has(authorId)) {
          newFollowing.delete(authorId);
        } else {
          newFollowing.add(authorId);
        }
        setFollowing(newFollowing);

        setVideos(prevVideos =>
          prevVideos.map(video => {
            if (video.author._id === authorId) {
              return {
                ...video,
                author: {
                  ...video.author,
                  followers: response.data.data.followerCount
                }
              };
            }
            return video;
          })
        );
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const togglePlayPause = () => {
    const currentVideoEl = videoRefs.current[currentIndex];
    if (!currentVideoEl) return;

    if (isPlaying) {
      currentVideoEl.pause();
      setIsPlaying(false);
    } else {
      currentVideoEl.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    // Prevent click from toggling play/pause
    e?.stopPropagation();
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    // Chỉ toggle mute cho video HIỆN TẠI
    const currentVideoEl = videoRefs.current[currentIndex];
    if (currentVideoEl) {
      currentVideoEl.muted = newMutedState;
    }
    // Log for debugging
    console.log("Toggle mute to:", newMutedState);
  };

  const handleUploadClick = () => {
    router.push('/forum/khampha/upload');
  };

  const handleToggleComments = (videoId: string) => {
    if (showComments && commentVideoId === videoId) {
      // Đang mở comment của video này -> đóng lại
      setShowComments(false);
    } else {
      // Đóng hoặc mở comment của video khác -> mở comment video này
      setShowComments(true);
    }
  };

  const handleCloseComments = () => {
    setShowComments(false);
  };

  const handleOpenVideoMenu = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowVideoMenu(showVideoMenu === videoId ? null : videoId);
  };

  const handleEditVideo = (video: KhamphaVideo) => {
    setEditingVideo(video);
    setEditCaption(video.caption);
    setShowVideoMenu(null);
  };

  const handleDeleteVideo = (videoId: string) => {
    setVideoToDelete(videoId);
    setShowDeleteModal(true);
    setShowVideoMenu(null);
  };

  const confirmDeleteVideo = async () => {
    if (!videoToDelete) return;

    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (!authStorage) return;

      const parsed = JSON.parse(authStorage);
      const token = parsed?.state?.token;
      if (!token) return;

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/khampha/${videoToDelete}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVideos(prevVideos => prevVideos.filter(v => v._id !== videoToDelete));
      setShowDeleteModal(false);
      setVideoToDelete(null);
      toast.success('Đã xóa video thành công');
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Lỗi khi xóa video');
    }
  };

  const saveEditVideo = async () => {
    if (!editingVideo) return;

    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (!authStorage) return;

      const parsed = JSON.parse(authStorage);
      const token = parsed?.state?.token;
      if (!token) return;

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/khampha/${editingVideo._id}`,
        { caption: editCaption },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVideos(prevVideos =>
        prevVideos.map(v =>
          v._id === editingVideo._id ? { ...v, caption: editCaption } : v
        )
      );
      setEditingVideo(null);
      setEditCaption('');
      toast.success('Đã cập nhật video thành công');
    } catch (error) {
      console.error('Error updating video:', error);
      toast.error('Lỗi khi cập nhật video');
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-800 text-lg">Đang tải...</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        <div className="hidden lg:flex flex-col py-6 px-4 bg-white border-r border-gray-200 w-48 shrink-0">
          <button
            onClick={handleUploadClick}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center gap-2 text-white shadow-lg mb-8 hover:scale-105 transition-transform"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Đăng video</span>
          </button>
          <nav className="flex flex-col gap-2 flex-1">
            <button onClick={() => setActiveTab('khampha')} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'khampha' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'}`}>
              <Home className="w-5 h-5" />
              <span className="font-medium">Khám phá</span>
            </button>
            <button onClick={() => setActiveTab('friends')} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'friends' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'}`}>
              <Users className="w-5 h-5" />
              <span className="font-medium">Bạn bè</span>
            </button>
            <button onClick={() => setActiveTab('following')} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'following' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'}`}>
              <UserCheck2 className="w-5 h-5" />
              <span className="font-medium">Đã follow</span>
            </button>
          </nav>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="lg:hidden bg-white border-b border-gray-200 shrink-0">
            <div className="flex justify-around items-center py-3">
              <button onClick={() => setActiveTab('following')} className={`text-sm font-medium ${activeTab === 'following' ? 'text-gray-900 border-b-2 border-gray-900 pb-1' : 'text-gray-400'}`}>Đã follow</button>
              <button onClick={() => setActiveTab('friends')} className={`text-sm font-medium ${activeTab === 'friends' ? 'text-gray-900 border-b-2 border-gray-900 pb-1' : 'text-gray-400'}`}>Bạn bè</button>
              <button onClick={() => setActiveTab('khampha')} className={`text-sm font-medium ${activeTab === 'khampha' ? 'text-gray-900 border-b-2 border-gray-900 pb-1' : 'text-gray-400'}`}>Khám phá</button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-800 text-lg mb-2">Chưa có video nào</p>
              <p className="text-gray-500 text-sm">Hãy là người đầu tiên đăng video!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col py-6 px-4 bg-white border-r border-gray-200 w-48 shrink-0">
        <button
          onClick={() => router.push('/forum')}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 mb-4 transition-colors"
          title="Quay lại Forum"
        >
          <X className="w-5 h-5" />
        </button>

        <button
          onClick={handleUploadClick}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center gap-2 text-white shadow-lg mb-8 hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Đăng video</span>
        </button>

        <nav className="flex flex-col gap-2 flex-1">
          <button onClick={() => setActiveTab('khampha')} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'khampha' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'}`}>
            <Home className="w-5 h-5" />
            <span className="font-medium">Khám phá</span>
          </button>
          <button onClick={() => setActiveTab('friends')} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'friends' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'}`}>
            <Users className="w-5 h-5" />
            <span className="font-medium">Bạn bè</span>
          </button>
          <button onClick={() => setActiveTab('following')} className={`flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'following' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50'}`}>
            <UserCheck2 className="w-5 h-5" />
            <span className="font-medium">Đã follow</span>
          </button>
        </nav>
      </div>

      {/* Main Content - Desktop: flex để share space với comment sidebar */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${showComments ? 'lg:mr-0' : ''}`}>
        {/* Mobile/Tablet Top Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 shrink-0">
          <div className="flex justify-between items-center px-4 py-3">
            <button
              onClick={() => router.push('/forum')}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
              title="Quay lại Forum"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-6">
              <button onClick={() => setActiveTab('following')} className={`text-sm font-medium ${activeTab === 'following' ? 'text-gray-900 border-b-2 border-gray-900 pb-1' : 'text-gray-400'}`}>Đã follow</button>
              <button onClick={() => setActiveTab('friends')} className={`text-sm font-medium ${activeTab === 'friends' ? 'text-gray-900 border-b-2 border-gray-900 pb-1' : 'text-gray-400'}`}>Bạn bè</button>
              <button onClick={() => setActiveTab('khampha')} className={`text-sm font-medium ${activeTab === 'khampha' ? 'text-gray-900 border-b-2 border-gray-900 pb-1' : 'text-gray-400'}`}>Khám phá</button>
            </div>

            <button
              onClick={handleUploadClick}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium shadow-md hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng</span>
            </button>
          </div>
        </div>

        {/* Video Feed */}
        <div
          ref={containerRef}
          className="flex-1 relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              transform: `translateY(-${currentIndex * 100}%)`,
              transition: 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          >
            {videos.map((video, index) => {
              const fullText = video.caption || '';
              const isExpanded = expandedIds.has(video._id);
              const isLong = fullText.length > CAPTION_TRUNCATE_LENGTH;
              const isLiked = video.likes.includes(currentUserId || '');
              const isFavorited = video.favorites.includes(currentUserId || '');

              // Nội dung action bar dùng chung cho cả bản mobile (overlay trong video)
              // và bản desktop (nằm ngoài video), tránh lặp logic.
              const actionBarContent = (
                <>
                  {/* Avatar + Follow */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="relative">
                      <div className="w-9 h-9 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center overflow-hidden ring-2 ring-white/80">
                        {video.author.avatar ? (
                          <img src={video.author.avatar} alt={video.author.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <button
                        onClick={() => toggleFollow(video.author._id)}
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg"
                      >
                        <Plus className="w-3 h-3" data-filled={true} />
                      </button>
                    </div>
                  </div>

                  {/* Like */}
                  <button onClick={() => toggleLike(video._id, isLiked)} className="flex flex-col items-center gap-1">
                    <Heart
                      className={`w-7 h-7 lg:w-8 lg:h-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`}
                      data-filled={true}
                    />
                    <span className="text-white text-xs font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                      {video.likeCount}
                    </span>
                  </button>

                  {/* Comment */}
                  <button
                    onClick={() => handleToggleComments(video._id)}
                    className="flex flex-col items-center gap-1"
                  >
                    <MessageCircle className="w-7 h-7 lg:w-8 lg:h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" data-filled={true} />
                    <span className="text-white text-xs font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                      {video.commentCount}
                    </span>
                  </button>

                  {/* Favorite */}
                  <button onClick={() => toggleFavorite(video._id, isFavorited)} className="flex flex-col items-center gap-1">
                    <Bookmark
                      className={`w-7 h-7 lg:w-8 lg:h-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] ${isFavorited ? 'fill-yellow-500 text-yellow-500' : 'text-white'}`}
                      data-filled={true}
                    />
                    <span className="text-white text-xs font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                      {video.favoriteCount}
                    </span>
                  </button>

                  {/* More Menu - Only for video owner */}
                  {video.author._id === currentUserId && (
                    <div className="relative flex flex-col items-center gap-1">
                      <button
                        onClick={(e) => handleOpenVideoMenu(video._id, e)}
                        className="flex flex-col items-center gap-1"
                      >
                        <MoreHorizontal className="w-7 h-7 lg:w-8 lg:h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" data-filled={true} />
                      </button>

                      {/* Dropdown Menu */}
                      {showVideoMenu === video._id && (
                        <div className="absolute right-full mr-2 top-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[160px] z-50">
                          <button
                            onClick={() => handleEditVideo(video)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Chỉnh sửa</span>
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(video._id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Xóa video</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              );

              return (
                <div
                  key={video._id}
                  style={{ height: '100%', flexShrink: 0 }}
                  className="w-full relative flex items-center justify-center bg-black"
                >
                  {/* Nhóm video-frame + action bar desktop nằm chung 1 hàng flex,
                      để action bar desktop luôn bám sát mép phải video và canh giữa
                      theo chiều dọc một cách chắc chắn, không cần absolute/transform. */}
                  <div className="relative h-full flex items-center lg:gap-[10px]">
                    {/* Khung tỉ lệ cố định ~1080x1920 (9:16) */}
                    <div
                      className="relative h-full"
                      style={{ aspectRatio: `${FRAME_ASPECT}`, maxWidth: '100%' }}
                    >
                      <video
                        ref={el => {
                          if (el) {
                            // FIX: chỉ force muted=true khi đây thực sự là lần mount đầu tiên
                            // của element này. Trước đây arrow function inline khiến React
                            // gọi lại ref callback ở MỌI lần re-render (ví dụ mỗi lần
                            // videoProgress cập nhật qua onTimeUpdate), làm el.muted = true
                            // bị set lại liên tục và video bị mất tiếng dù người dùng đã unmute.
                            const isNewElement = videoRefs.current[index] !== el;
                            videoRefs.current[index] = el;
                            if (isNewElement) {
                              // Chỉ video đang hiện tại mới theo state isMuted (mặc định false = bật tiếng),
                              // các video khác (chưa active) luôn giữ muted để tránh phát chồng âm thanh.
                              el.muted = index === currentIndexRef.current ? isMuted : true;
                            }
                          }
                        }}
                        src={video.streamUrl || video.videoUrl}
                        poster={video.thumbnailUrl}
                        className="w-full h-full object-contain"
                        loop
                        playsInline
                        muted={index !== currentIndex || isMuted}
                        preload={index === currentIndex ? "auto" : "metadata"}
                        onClick={togglePlayPause}
                        onWaiting={() => setVideoLoading(prev => ({ ...prev, [index]: true }))}
                        onPlaying={() => setVideoLoading(prev => ({ ...prev, [index]: false }))}
                        onPlay={(e) => {
                          if (index === currentIndex && e.currentTarget) {
                            // ENFORCE muted state every time it starts playing
                            e.currentTarget.muted = isMuted;
                            console.log("onPlay - index:", index, "isMuted:", isMuted, "actual muted:", e.currentTarget.muted);
                          } else if (e.currentTarget) {
                            // Non-current videos are ALWAYS muted
                            e.currentTarget.muted = true;
                          }
                        }}
                        onLoadedData={(e) => {
                          setVideoLoading(prev => ({ ...prev, [index]: false }));
                          // Make sure current video uses isMuted state
                          if (index === currentIndex && e.currentTarget) {
                            e.currentTarget.muted = isMuted;
                          }
                        }}
                        onTimeUpdate={(e) => {
                          if (index === currentIndex && !isDraggingProgress) {
                            const total = getEffectiveDuration();
                            if (total && total > 0) {
                              setVideoProgress((e.currentTarget.currentTime / total) * 100);
                            }
                          }
                        }}
                        onDurationChange={() => {
                          if (index === currentIndex) {
                            // Trigger a re-render to update progress
                            const total = getEffectiveDuration();
                            if (total && total > 0 && videoRefs.current[index]) {
                              setVideoProgress((videoRefs.current[index]!.currentTime / total) * 100);
                            }
                          }
                        }}
                        onSeeked={() => {
                          if (index === currentIndex) {
                            setIsDraggingProgress(false);
                          }
                        }}
                      />

                      {videoLoading[index] && index === currentIndex && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
                          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                        </div>
                      )}
                      {index === currentIndex && !isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <Play className="w-16 h-16 text-white opacity-80" fill="white" data-filled={true} />
                        </div>
                      )}

                      <div className="absolute top-4 right-4">
                        <button
                          onClick={toggleMute}
                          className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" data-filled={true} /> : <Volume2 className="w-4 h-4" data-filled={true} />}
                        </button>
                      </div>

                      {/* Tên user + mô tả + hashtag - dính đáy, full width video, có xem thêm/thu gọn */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 pt-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                        <div className="text-white font-bold text-lg mb-2">{video.author.fullName}</div>

                        {fullText && (
                          <div className="text-white text-sm">
                            <span className={isExpanded ? '' : 'line-clamp-2'}>
                              {renderCaptionWithHashtags(fullText)}
                            </span>
                            {isLong && (
                              <button
                                onClick={() => toggleExpand(video._id)}
                                className="text-white/70 text-xs font-semibold mt-1 block hover:text-white"
                              >
                                {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                              </button>
                            )}
                          </div>
                        )}

                        {video.music && (
                          <div className="flex items-center gap-2 text-white/80 text-sm mt-2">
                            <Music className="w-4 h-4" />
                            <span className="truncate">{video.music.title} - {video.music.artist}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons - MOBILE/TABLET: overlay góc dưới phải, ẩn trên desktop */}
                      <div className="absolute bottom-10 right-[5px] z-20 flex flex-col items-center gap-3 lg:hidden">
                        {actionBarContent}
                      </div>

                      {/* Thanh tua video - có thumb tròn kéo được (Pointer Events: dùng chung chuột & cảm ứng) */}
                      {index === currentIndex && (
                        <div
                          ref={progressBarRef}
                          className="absolute bottom-0 left-0 right-0 h-4 flex items-center cursor-pointer group touch-none z-20"
                          onPointerDown={handleProgressPointerDown}
                          onPointerMove={handleProgressPointerMove}
                          onPointerUp={handleProgressPointerUp}
                          onPointerCancel={handleProgressPointerCancel}
                        >
                          <div className="relative w-full h-1 group-hover:h-1.5 bg-white/20 rounded-full transition-all">
                            {/* Played - phần đã phát (trắng) */}
                            <div
                              className="absolute left-0 top-0 h-full bg-white rounded-full"
                              style={{ width: `${Math.min(100, Math.max(0, videoProgress))}%` }}
                            />
                            {/* Thumb tròn kéo được */}
                            <div
                              className={`absolute top-1/2 w-3 h-3 -translate-y-1/2 -translate-x-1/2 bg-white rounded-full shadow-md transition-opacity ${isDraggingProgress ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'}`}
                              style={{ left: `${Math.min(100, Math.max(0, videoProgress))}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons - DESKTOP: nằm ngoài video, cách video 10px, canh giữa theo chiều dọc */}
                    <div className="hidden lg:flex flex-col items-center gap-5">
                      {actionBarContent}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comment Sidebar */}
      {/* Mobile: Fixed overlay sliding from right */}
      {/* Desktop: Static sidebar, always visible when showComments=true */}
      {showComments && (
        <div className="hidden lg:flex lg:w-[400px] lg:flex-col bg-white border-l border-gray-200 flex-shrink-0">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Bình luận</h2>
              <button
                onClick={handleCloseComments}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Comment Section */}
            <div className="flex-1 overflow-y-auto">
              {commentVideoId && (
                <CommentSection
                  key={commentVideoId}
                  targetType="short_video"
                  targetId={commentVideoId}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile: Bottom sheet overlay */}
      <div
        className={`
          lg:hidden fixed inset-y-0 right-0 w-full bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${showComments ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Bình luận</h2>
            <button
              onClick={handleCloseComments}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Comment Section */}
          <div className="flex-1 overflow-y-auto">
            {commentVideoId && (
              <CommentSection
                key={commentVideoId}
                targetType="short_video"
                targetId={commentVideoId}
              />
            )}
          </div>
        </div>
      </div>

      {/* Backdrop - Mobile only */}
      {showComments && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={handleCloseComments}
        />
      )}

      {/* Edit Video Modal */}
      {editingVideo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa video</h3>
                <button
                  onClick={() => {
                    setEditingVideo(null);
                    setEditCaption('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none h-32"
                  placeholder="Nhập mô tả cho video..."
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setEditingVideo(null);
                    setEditCaption('');
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={saveEditVideo}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:scale-105 transition-transform font-medium shadow-lg"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-center mb-2">Xóa video?</h3>
              <p className="text-center text-gray-600 mb-6">
                Bạn có chắc muốn xóa video này? Hành động này không thể hoàn tác.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setVideoToDelete(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDeleteVideo}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-lg"
                >
                  Xóa video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
