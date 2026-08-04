'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Music,
  Clock
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { useAuthStore } from '@/store/auth.store';

export default function UploadVideoPage() {
    const router = useRouter();
    const { token } = useAuthStore();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [caption, setCaption] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [videoDuration, setVideoDuration] = useState<number>(0);
    const [durationError, setDurationError] = useState<string | null>(null);
    const [selectedMusic, setSelectedMusic] = useState<{ title: string; artist: string } | null>(null);
    const [showMusicPicker, setShowMusicPicker] = useState(false);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const MAX_DURATION_SECONDS = 5 * 60; // 5 minutes

  const extractThumbnail = (videoElement: HTMLVideoElement): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 568; // 9:16 aspect ratio
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.8);
    }
    
    return '';
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (!file.type.startsWith('video/')) {
            toast.error('Vui lòng chọn file video');
            return;
        }
        setVideoFile(file);
        setDurationError(null);
        const reader = new FileReader();
        reader.onloadend = () => {
            setVideoPreview(reader.result as string);

            // Extract video duration and thumbnail
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.src = reader.result as string;

            video.onloadedmetadata = () => {
                if (isFinite(video.duration) && video.duration > 0) {
                    setVideoDuration(video.duration);
                    console.log('Video duration extracted:', video.duration);
                    
                    // Seek to 0.5s to extract thumbnail
                    video.currentTime = 0.5;
                } else {
                    console.error('Invalid video duration:', video.duration);
                }
            };

            video.onseeked = () => {
                // Extract thumbnail when seek completes
                const thumbnail = extractThumbnail(video);
                setThumbnailUrl(thumbnail);
                console.log('Thumbnail extracted');
            };

            video.onerror = () => {
                console.error('Error loading video metadata');
            };
        };
        reader.readAsDataURL(file);
    }
  };

  const uploadFileToServer = async (file: File, type: 'video' | 'image'): Promise<string | null> => {
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const endpoint = type === 'video' ? '/api/upload/file' : '/api/upload/image';
      const payload = type === 'video'
        ? { file: base64, fileName: file.name, folder: 'khampha' }
        : { image: base64, folder: 'khampha' };

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success && res.data.data?.url) {
        return res.data.data.url;
      }
      return null;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const handleContinue = () => {
    if (!videoFile) {
        toast.error('Vui lòng chọn video');
        return;
    }
    if (durationError) {
        toast.error(durationError);
        return;
    }
    if (videoDuration === 0) {
        toast.warning('Đang tải thông tin video, vui lòng đợi...');
        return;
    }
    if (videoDuration > MAX_DURATION_SECONDS) {
        const mins = Math.floor(MAX_DURATION_SECONDS / 60);
        toast.error(`Video quá dài! Vui lòng chọn video tối đa ${mins} phút`);
        return;
    }
  };

  const handleUpload = async () => {
    if (!videoFile || uploading) return;

    if (!token) {
      toast.error('Vui lòng đăng nhập để đăng video');
      return;
    }

    // Check if duration was extracted
    if (videoDuration === 0) {
      toast.warning('Đang tải thông tin video, vui lòng đợi...');
      return;
    }

    console.log('Uploading video with duration:', videoDuration);

    setUploading(true);
    setUploadProgress(0);

    try {
      let videoUrl = '';
      let finalThumbnailUrl = '';

      // Upload video
      setUploadProgress(30);
      const uploadedVideoUrl = await uploadFileToServer(videoFile, 'video');
      if (uploadedVideoUrl) {
        videoUrl = uploadedVideoUrl;
      } else {
        toast.error('Upload video thất bại');
        setUploading(false);
        return;
      }

      // Upload thumbnail if available
      if (thumbnailUrl) {
        setUploadProgress(50);
        // Convert base64 to blob
        const response = await fetch(thumbnailUrl);
        const blob = await response.blob();
        const thumbnailFile = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
        
        const uploadedThumbnailUrl = await uploadFileToServer(thumbnailFile, 'image');
        if (uploadedThumbnailUrl) {
          finalThumbnailUrl = uploadedThumbnailUrl;
        }
      }

      setUploadProgress(90);

      // Create video - extract hashtags from caption
      const hashtagRegex = /#(\w+)/g;
      const hashtagArray: string[] = [];
      let match;
      while ((match = hashtagRegex.exec(caption)) !== null) {
        hashtagArray.push(match[1]);
      }

      const payload = {
        videoUrl,
        thumbnailUrl: finalThumbnailUrl,
        caption,
        hashtags: hashtagArray,
        duration: videoDuration,
        music: selectedMusic ? {
          title: selectedMusic.title,
          artist: selectedMusic.artist,
        } : null,
      };

      console.log('Sending payload to backend:', payload);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/khampha`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUploadProgress(100);

      if (res.data.success) {
        toast.success('Đăng video thành công!');
        router.push('/khampha');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('Có lỗi xảy ra khi đăng video');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={handleCancel}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">
          {videoPreview ? 'Chỉnh sửa video' : 'Tải lên video'}
        </h1>
        <div className="w-8" />
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4">
        {!videoPreview ? (
          /* Upload Video Screen */
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tải lên video</h2>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center relative bg-gray-50 hover:bg-gray-100 transition-colors">
                <div>
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Kéo thả video hoặc click để chọn
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    MP4 hoặc WebM
                  </p>
                  <p className="text-sm text-yellow-600 font-medium">
                    Tối đa 5 phút
                  </p>
                </div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Video Editor Screen */
          <div className="space-y-6">
            {/* Video Preview */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="max-w-[300px] mx-auto w-full">
                <div className="relative w-full aspect-[9/16] bg-black rounded-lg overflow-hidden">
                  <video
                    src={videoPreview}
                    className="w-full h-full object-contain"
                    controls
                  />
                </div>
              </div>
              {/* Video Duration Display */}
              <div className="flex items-center justify-center gap-2 mt-4 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {Math.floor(videoDuration / 60)}:{String(Math.floor(videoDuration % 60)).padStart(2, '0')}
                  <span className="text-gray-400 ml-1">/ 5:00</span>
                </span>
              </div>
              {/* Duration Error */}
              {durationError && (
                <div className="text-red-500 text-sm font-medium text-center mt-2">{durationError}</div>
              )}
              <button
                onClick={() => {
                  setVideoFile(null);
                  setVideoPreview('');
                  setThumbnailUrl('');
                  setDurationError(null);
                  setVideoDuration(0);
                  if (videoInputRef.current) {
                    videoInputRef.current.value = '';
                  }
                }}
                className="text-red-500 text-sm hover:underline w-full text-center mt-2"
              >
                Xóa video
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <button
                onClick={() => setShowMusicPicker(true)}
                className="w-full flex items-center justify-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Music className="w-6 h-6 text-gray-700" />
                <span className="text-sm text-gray-600">Chọn âm thanh</span>
              </button>
            </div>

            {/* Music Selection */}
            {selectedMusic && (
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium text-sm">{selectedMusic.title}</p>
                    <p className="text-gray-500 text-xs">{selectedMusic.artist}</p>
                  </div>
                  <button
                    onClick={() => setSelectedMusic(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Caption */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Mô tả</h2>
              <CustomTextarea
                value={caption}
                onChange={setCaption}
                placeholder="Viết mô tả cho video của bạn... (Sử dụng #hashtag để thêm tag)"
                rows={4}
                maxLength={700}
              />
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-[#005ae0] animate-spin" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      Đang đăng video... {uploadProgress}%
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#005ae0] h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={uploading || durationError !== null}
              className="w-full py-4 bg-[#005ae0] text-white rounded-xl font-semibold hover:bg-[#0047b0] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang đăng...
                </>
              ) : (
                'Đăng video'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Music Picker Modal */}
      {showMusicPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chọn âm thanh</h3>
              <button onClick={() => setShowMusicPicker(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {[
                { title: 'Original Sound - @user', artist: 'TikTok' },
                { title: 'Popular Song 1', artist: 'Artist 1' },
                { title: 'Popular Song 2', artist: 'Artist 2' },
              ].map((music, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedMusic(music);
                    setShowMusicPicker(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-gray-900 font-medium text-sm">{music.title}</p>
                    <p className="text-gray-500 text-xs">{music.artist}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
