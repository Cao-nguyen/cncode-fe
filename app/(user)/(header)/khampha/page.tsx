'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
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
  Trash2,
  Share2,
  Eye,
  Copy,
  Download
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import CommentSection from '@/components/comment/CommentSection';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getImageUrl } from '@/lib/utils/imageUrl';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const formatNumber = (num: number) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(num);

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const videoIdFromUrl = searchParams?.get('id');

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
  const [isMuted, setIsMuted] = useState(true); // Mặc định MUTE để browser cho phép autoplay
  const [isPlaying, setIsPlaying] = useState(true); // Mặc định PLAY
  const [videoLoading, setVideoLoading] = useState<{ [key: number]: boolean }>({}); // Track loading state per video
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'khampha' | 'friends' | 'following'>('khampha');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => getCurrentUserId());
  const [showComments, setShowComments] = useState(false);
  const [isClosingComments, setIsClosingComments] = useState(false);
  // Derive commentVideoId from currentIndex and videos instead of managing it as state
  const commentVideoId = showComments && videos[currentIndex] ? videos[currentIndex]._id : null;
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [isClosingMusicModal, setIsClosingMusicModal] = useState(false);
  const [musicVideos, setMusicVideos] = useState<KhamphaVideo[]>([]);
  const [loadingMusicVideos, setLoadingMusicVideos] = useState(false);
  const [currentMusic, setCurrentMusic] = useState<{ title: string; artist: string; coverUrl: string } | null>(null);
  const [showVideoMenu, setShowVideoMenu] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<KhamphaVideo | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [isClosingShareModal, setIsClosingShareModal] = useState(false);

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
  const itemRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

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
        console.log('Fetching videos from:', `${process.env.NEXT_PUBLIC_API_URL}/api/khampha`);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/khampha`);
        console.log('API response:', response.data);
        const fetchedVideos = response.data.data;
        console.log('Fetched videos:', fetchedVideos);
        setVideos(fetchedVideos);

        // Nếu có video ID trong URL, tìm video đó và hiển thị
        if (videoIdFromUrl && fetchedVideos.length > 0) {
          const foundIndex = fetchedVideos.findIndex((v: KhamphaVideo) => v._id === videoIdFromUrl);
          if (foundIndex !== -1) {
            setCurrentIndex(foundIndex);
            // Scroll đến video đó sau khi render
            setTimeout(() => {
              const targetEl = itemRefs.current[foundIndex];
              if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 100);
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

    // Tự động phát (vì đã mute)
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
      const targetIndex = Math.max(0, Math.min(videos.length - 1, currentIndexRef.current + direction));
      itemRefs.current[targetIndex]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [videos.length]);

  // IntersectionObserver để track video nào đang visible
  useEffect(() => {
    const container = containerRef.current;
    if (!container || videos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(idx) && idx !== currentIndexRef.current) {
              pauseAllVideos();
              setIsPlaying(true); // Tự động phát (vì đã mute)
              setCurrentIndex(idx);
            }
          }
        });
      },
      {
        root: container,
        threshold: [0.6], // video phải hiện >=60% mới tính là "đang xem"
      }
    );

    Object.values(itemRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [videos.length]);

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
  }, [isMuted, currentIndex, videos]); // Thêm videos để chạy lại khi danh sách video thay đổi

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
      const link = `${window.location.origin}/khampha?id=${videoId}`;
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
    router.push('/khampha/upload');
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
    setIsClosingComments(true);
    setTimeout(() => {
      setShowComments(false);
      setIsClosingComments(false);
    }, 300);
  };

  const handleToggleMusicModal = async (videoId: string) => {
    if (showMusicModal) {
      handleCloseMusicModal();
      return;
    }

    const currentVideo = videos.find(v => v._id === videoId);
    console.log('Current video:', currentVideo);
    console.log('Music data:', currentVideo?.music);

    // Tạo music mặc định nếu video không có music
    const musicData = currentVideo?.music || {
      title: `Original Sound - @${currentVideo?.author.username}`,
      artist: currentVideo?.author.fullName || currentVideo?.author.username || 'Unknown',
      coverUrl: currentVideo?.author.avatar || ''
    };

    setCurrentMusic(musicData);
    setShowMusicModal(true);
    setLoadingMusicVideos(true);

    try {
      // Chỉ fetch nếu có music thật (không phải default)
      if (currentVideo?.music) {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/khampha/music/${encodeURIComponent(currentVideo.music.title)}`);
        console.log('Music videos response:', response.data);
        setMusicVideos(response.data.data || []);
      } else {
        // Nếu là music mặc định, không fetch
        setMusicVideos([]);
      }
    } catch (error) {
      console.error('Error fetching music videos:', error);
      toast.error('Không thể tải danh sách video');
      setMusicVideos([]);
    } finally {
      setLoadingMusicVideos(false);
    }
  };

  const handleCloseMusicModal = () => {
    setIsClosingMusicModal(true);
    setTimeout(() => {
      setShowMusicModal(false);
      setIsClosingMusicModal(false);
      setMusicVideos([]);
    }, 300);
  };

  const handleToggleShareModal = () => {
    if (showShareModal) {
      handleCloseShareModal();
      return;
    }
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setIsClosingShareModal(true);
    setTimeout(() => {
      setShowShareModal(false);
      setIsClosingShareModal(false);
    }, 300);
  };

  const handleCopyLink = () => {
    const currentVideo = videos[currentIndex];
    if (currentVideo) {
      const videoUrl = `${window.location.origin}/khampha?video=${currentVideo._id}`;
      navigator.clipboard.writeText(videoUrl).then(() => {
        toast.success('Đã sao chép link video');
        handleCloseShareModal();
      }).catch(() => {
        toast.error('Không thể sao chép link');
      });
    }
  };

  const handleDownloadVideo = async () => {
    const currentVideo = videos[currentIndex];
    if (currentVideo) {
      try {
        const response = await fetch(currentVideo.streamUrl || currentVideo.videoUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video_${currentVideo._id}.mp4`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Đã tải video');
        handleCloseShareModal();
      } catch (error) {
        console.error('Error downloading video:', error);
        toast.error('Không thể tải video');
      }
    }
  };

  const handleDeleteVideoFromShare = () => {
    const currentVideo = videos[currentIndex];
    if (currentVideo) {
      setVideoToDelete(currentVideo._id);
      setShowDeleteModal(true);
      handleCloseShareModal();
    }
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
      <div className="flex items-center justify-center h-full">
        <div className="text-4xl font-bold text-gray-800">VIDEO</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-4xl font-bold text-gray-800">VIDEO</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-[calc(100vh-97px)] md:h-[calc(100vh-60px)] overflow-hidden">
      <div className="relative w-[calc(100%-48px)] max-w-[400px] mx-auto bg-white overflow-hidden aspect-[9/16]">
        {/* Fixed Header Overlay - kiểu TikTok: trong suốt, đè lên video */}
        <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
          <div className="flex justify-center gap-6 pt-8 pb-3 md:pt-4 md:pb-3 bg-gradient-to-b from-black/40 to-transparent">
            {[
              { key: 'friends', label: 'Bạn bè' },
              { key: 'following', label: 'Đang follow' },
              { key: 'khampha', label: 'Dành cho bạn' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`text-sm font-semibold transition-colors pointer-events-auto drop-shadow-md relative ${
                  activeTab === tab.key
                    ? 'text-white font-bold'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Video Container with scroll snap */}
        <div
          ref={containerRef}
          className="relative w-full h-full overflow-y-scroll no-scrollbar snap-y snap-mandatory"
          style={{ scrollSnapType: 'y mandatory' }}
        >
          {videos.map((video, index) => (
            <div
              key={video._id}
              ref={(el) => { itemRefs.current[index] = el; }}
              data-index={index}
              className="relative w-full h-full snap-start flex items-center justify-center"
            >
              <video
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                src={video.streamUrl || video.videoUrl}
                poster={video.thumbnailUrl}
                className="w-full h-full object-contain"
                loop
                playsInline
                muted={isMuted}
                onClick={togglePlayPause}
                onTimeUpdate={() => {
                  if (index === currentIndex) {
                    const videoEl = videoRefs.current[index];
                    if (videoEl) {
                      const total = getEffectiveDuration();
                      if (total && total > 0) {
                        setVideoProgress((videoEl.currentTime / total) * 100);
                      }
                    }
                  }
                }}
              />

              {/* Video Info - Above Progress Bar */}
              {index === currentIndex && (
                <div className="absolute bottom-[35px] left-4 right-16 z-20 md:bottom-[45px] lg:bottom-5 lg:right-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white font-semibold text-sm">@{video.author.username}</span>
                    <span className="text-white/60 text-xs">
                      {new Date(video.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit'
                      }).replace(/\//g, ' - ')}
                    </span>
                  </div>
                  <div className="text-white text-sm line-clamp-2">
                    {video.caption.split(/(#\w+)/g).map((part, i) => {
                      if (part.startsWith('#')) {
                        return <span key={i} className="font-bold">{part}</span>;
                      }
                      return part;
                    })}
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {index === currentIndex && (
                <div
                  ref={index === currentIndex ? progressBarRef : null}
                  className="absolute bottom-[15px] left-0 right-0 h-[4px] bg-white/30 cursor-pointer z-20 md:h-[4px] md:bottom-[32px] lg:bottom-0"
                  onPointerDown={handleProgressPointerDown}
                  onPointerMove={handleProgressPointerMove}
                  onPointerUp={handleProgressPointerUp}
                  onPointerCancel={handleProgressPointerCancel}
                >
                  <div
                    className="h-full bg-blue-500 transition-all duration-100"
                    style={{ width: `${videoProgress}%` }}
                  />
                </div>
              )}

              {/* Play/Pause Overlay */}
              {index === currentIndex && !isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer" onClick={togglePlayPause}>
                  <Play className="w-16 h-16 text-white opacity-70" fill="white" data-filled={true} />
                </div>
              )}

              {/* Right Side Actions - Mobile */}
              <div className="absolute right-3 bottom-8 flex flex-col items-center gap-4 z-10 md:bottom-12 lg:bottom-5">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={getImageUrl(video.author.avatar)} />
                    <AvatarFallback className="text-xs font-bold bg-[#005ae0] text-white">
                      {video.author.fullName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => toggleFollow(video.author._id)}
                    className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      following.has(video.author._id)
                        ? 'bg-gray-500 text-white'
                        : 'bg-[#005ae0] text-white'
                    }`}
                  >
                    {following.has(video.author._id) ? <X className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5" />}
                  </button>
                </div>

                {/* Like */}
                <button
                  onClick={() => toggleLike(video._id, video.likes.includes(currentUserId || ''))}
                  className="flex flex-col items-center gap-1 mt-2"
                >
                  <Heart className={`w-7 h-7 ${video.likes.includes(currentUserId || '') ? 'fill-red-500 text-red-500' : 'text-white'}`} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }} data-filled={true} />
                  <span className="text-white text-[10px] font-semibold drop-shadow-sm">
                    {formatNumber(video.likeCount)}
                  </span>
                </button>

                {/* Comment */}
                <button
                  onClick={() => handleToggleComments(video._id)}
                  className="flex flex-col items-center gap-1"
                >
                  <MessageCircle className="w-7 h-7 text-white" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }} data-filled={true} />
                  <span className="text-white text-[10px] font-semibold drop-shadow-sm">
                    {video.commentCount === 0 ? 'Bóc tem' : formatNumber(video.commentCount)}
                  </span>
                </button>

                {/* Bookmark */}
                <button
                  onClick={() => toggleFavorite(video._id, video.favorites.includes(currentUserId || ''))}
                  className="flex flex-col items-center gap-1"
                >
                  <Bookmark className={`w-7 h-7 ${video.favorites.includes(currentUserId || '') ? 'fill-yellow-500 text-yellow-500' : 'text-white'}`} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }} data-filled={true} />
                  <span className="text-white text-[10px] font-semibold drop-shadow-sm">
                    {formatNumber(video.favoriteCount)}
                  </span>
                </button>

                {/* Share */}
                <button
                  onClick={() => handleToggleShareModal()}
                  className="flex flex-col items-center gap-1"
                >
                  <Share2 className="w-7 h-7 text-white" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }} data-filled={true} />
                  <span className="text-white text-[10px] font-semibold drop-shadow-sm">
                    {formatNumber(video.shareCount)}
                  </span>
                </button>

                {/* Volume Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="flex flex-col items-center gap-1"
                >
                  {isMuted ? (
                    <VolumeX className="w-7 h-7 text-white" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }} data-filled={true} />
                  ) : (
                    <Volume2 className="w-7 h-7 text-white" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }} data-filled={true} />
                  )}
                </button>

                {/* Music Disc */}
                <button
                  onClick={() => handleToggleMusicModal(video._id)}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-800 to-gray-600 border-4 border-gray-700 flex items-center justify-center animate-spin"
                  style={{ animationDuration: '3s' }}
                >
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={getImageUrl(video.author.avatar)} />
                    <AvatarFallback className="text-[10px] font-bold bg-[#005ae0] text-white">
                      {video.author.fullName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comment Sidebar */}
      {showComments && commentVideoId && (
        <>
          {/* Overlay */}
          <div
            className={`fixed inset-0 bg-black/50 z-50 ${isClosingComments ? 'animate-out fade-out duration-300' : 'animate-in fade-in duration-200'}`}
            onClick={handleCloseComments}
          />
          {/* Sidebar */}
          <div className={`fixed right-0 top-0 bottom-0 w-full md:w-[400px] bg-white z-[51] shadow-xl flex flex-col ${
            isClosingComments ? 'animate-out slide-out-to-right duration-300' : 'animate-in slide-in-from-right duration-300'
          }`}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">Bình luận</h3>
              <button onClick={handleCloseComments} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-[15px]">
              <CommentSection
                targetType="short_video"
                targetId={commentVideoId}
              />
            </div>
          </div>
        </>
      )}

      {/* Music Modal */}
      {showMusicModal && (
        <>
          {/* Overlay */}
          <div
            className={`fixed inset-0 bg-black/50 z-50 ${isClosingMusicModal ? 'animate-out fade-out duration-300' : 'animate-in fade-in duration-200'}`}
            onClick={handleCloseMusicModal}
          />
          {/* Modal */}
          <div className={`fixed right-0 top-0 bottom-0 w-full md:w-[400px] bg-white z-[51] shadow-xl flex flex-col ${
            isClosingMusicModal ? 'animate-out slide-out-to-right duration-300' : 'animate-in slide-in-from-right duration-300'
          }`}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">Âm thanh</h3>
              <button onClick={handleCloseMusicModal} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {currentMusic ? (
                <>
                  {/* Music Info */}
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      {currentMusic.coverUrl ? (
                        <img
                          src={getImageUrl(currentMusic.coverUrl)}
                          alt={currentMusic.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Music className="w-8 h-8 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{currentMusic.title}</h4>
                        <p className="text-gray-500 text-xs">{currentMusic.artist}</p>
                      </div>
                    </div>
                  </div>

                  {/* Videos using this music */}
                  <div className="p-4">
                    <h5 className="font-semibold text-sm mb-3">Video sử dụng âm thanh này</h5>
                    {loadingMusicVideos ? (
                      <div className="text-center py-8 text-gray-500">Đang tải...</div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {/* Video gốc (hiện tại) */}
                        {videos[currentIndex] && (
                          <div
                            className="relative aspect-[9/16] rounded-lg overflow-hidden cursor-pointer group"
                            onClick={() => {
                              handleCloseMusicModal();
                            }}
                          >
                            <img
                              src={getImageUrl(videos[currentIndex].thumbnailUrl)}
                              alt={videos[currentIndex].caption}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-8 h-8 text-white fill-white" />
                            </div>
                            <div className="absolute top-1 left-1 bg-[#005ae0] text-white text-[8px] px-1.5 py-0.5 rounded font-semibold">
                              Gốc
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/60 to-transparent">
                              <p className="text-white text-[10px] truncate">@{videos[currentIndex].author.username}</p>
                            </div>
                          </div>
                        )}
                        {/* Các video khác sử dụng cùng âm thanh */}
                        {musicVideos.map((video) => (
                          <div
                            key={video._id}
                            className="relative aspect-[9/16] rounded-lg overflow-hidden cursor-pointer group"
                            onClick={() => {
                              const index = videos.findIndex(v => v._id === video._id);
                              if (index !== -1) {
                                goToIndex(index);
                                handleCloseMusicModal();
                              }
                            }}
                          >
                            <img
                              src={getImageUrl(video.thumbnailUrl)}
                              alt={video.caption}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-8 h-8 text-white fill-white" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/60 to-transparent">
                              <p className="text-white text-[10px] truncate">@{video.author.username}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Video này không có thông tin âm thanh</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <>
          {/* Overlay */}
          <div
            className={`fixed inset-0 bg-black/50 z-50 ${isClosingShareModal ? 'animate-out fade-out duration-300' : 'animate-in fade-in duration-200'}`}
            onClick={handleCloseShareModal}
          />
          {/* Modal */}
          <div className={`fixed bottom-0 left-0 right-0 bg-white z-[51] rounded-t-2xl shadow-xl ${
            isClosingShareModal ? 'animate-out slide-out-to-bottom duration-300' : 'animate-in slide-in-from-bottom duration-300'
          }`}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Chia sẻ video</h3>
                <button onClick={handleCloseShareModal} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Copy className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-medium">Sao chép link</span>
                </button>

                {/* Download */}
                <button
                  onClick={handleDownloadVideo}
                  className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Download className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-medium">Tải về</span>
                </button>

                {/* Delete - Only show if user is the author */}
                {videos[currentIndex]?.author._id === currentUserId && (
                  <button
                    onClick={handleDeleteVideoFromShare}
                    className="w-full flex items-center gap-3 p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <span className="font-medium text-red-600">Xoá video</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[51] p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-in zoom-in duration-200">
              <h3 className="text-lg font-semibold mb-2">Xoá video?</h3>
              <p className="text-gray-600 mb-6">Bạn có chắc muốn xoá video này? Hành động này không thể hoàn tác.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Huỷ
                </button>
                <button
                  onClick={confirmDeleteVideo}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                >
                  Xoá
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
