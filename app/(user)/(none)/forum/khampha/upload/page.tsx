'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { useAuthStore } from '@/store/auth.store';

export default function UploadVideoPage() {
    const router = useRouter();
    const { token } = useAuthStore();
    const [step, setStep] = useState<1 | 2>(1);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState('');
    const [caption, setCaption] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [videoDuration, setVideoDuration] = useState<number>(0);
    const [durationError, setDurationError] = useState<string | null>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const MAX_DURATION_SECONDS = 5 * 60; // 5 minutes

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

            // Extract video duration
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.src = reader.result as string;

            video.onloadedmetadata = () => {
                if (isFinite(video.duration) && video.duration > 0) {
                    setVideoDuration(video.duration);
                    console.log('Video duration extracted:', video.duration);
                    if (video.duration > MAX_DURATION_SECONDS) {
                        const mins = Math.floor(MAX_DURATION_SECONDS / 60);
                        setDurationError(`Video quá dài! Vui lòng chọn video tối đa ${mins} phút`);
                        toast.error(`Video quá dài! Vui lòng chọn video tối đa ${mins} phút`);
                    }
                } else {
                    console.error('Invalid video duration:', video.duration);
                }
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
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
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

      // Upload video
      setUploadProgress(50);
      const uploadedVideoUrl = await uploadFileToServer(videoFile, 'video');
      if (uploadedVideoUrl) {
        videoUrl = uploadedVideoUrl;
      } else {
        toast.error('Upload video thất bại');
        setUploading(false);
        return;
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
        caption,
        hashtags: hashtagArray,
        duration: videoDuration,
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
        router.push('/forum/khampha');
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
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={handleCancel}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">
          {step === 1 ? 'Tải lên video' : 'Chi tiết video'}
        </h1>
        <div className="w-8" />
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className={`text-sm ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
              Video
            </span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step > 1 ? 'bg-pink-500' : 'bg-gray-200'}`} />
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
              {step > 2 ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <span className={`text-sm ${step >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
              Chi tiết
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4">
        {step === 1 ? (
          /* Step 1: Upload Video */
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tải lên video</h2>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center relative">
                {videoPreview ? (
                  <div className="space-y-4">
                    <div className="max-w-[500px] mx-auto w-full">
                      <div className="relative w-full" style={{ aspectRatio: '9/16' }}>
                        <video
                          src={videoPreview}
                          className="w-full h-full object-contain rounded-lg"
                          controls
                          style={{ aspectRatio: '9/16' }}
                        />
                      </div>
                    </div>
                    {/* Video Duration Display */}
                    <div className="text-center">
                      <span className="text-sm text-gray-600">
                        Thời lượng: {Math.floor(videoDuration / 60)}:{String(Math.floor(videoDuration % 60)).padStart(2, '0')}
                        <span className="text-gray-400 ml-1">/ 5:00</span>
                      </span>
                    </div>
                    {/* Duration Error */}
                    {durationError && (
                      <div className="text-red-500 text-sm font-medium">{durationError}</div>
                    )}
                    <button
                      onClick={() => {
                        setVideoFile(null);
                        setVideoPreview('');
                        setDurationError(null);
                        setVideoDuration(0);
                        if (videoInputRef.current) {
                          videoInputRef.current.value = '';
                        }
                      }}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Xóa video
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
                )}
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleContinue}
              disabled={!videoFile}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Tiếp tục
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          /* Step 2: Details */
          <div className="space-y-6">
            {/* Video Preview */}
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Xem trước</h2>
              <div className="max-w-[500px] mx-auto w-full">
                <div className="relative w-full" style={{ aspectRatio: '9/16' }}>
                  <video
                    src={videoPreview}
                    className="w-full h-full object-contain rounded-lg"
                    controls
                    style={{ aspectRatio: '9/16' }}
                  />
                </div>
              </div>
            </div>

            {/* Caption */}
            <div className="bg-white rounded-2xl p-6">
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
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-pink-500 animate-spin" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      Đang đăng video... {uploadProgress}%
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleBack}
                disabled={uploading}
                className="flex-1 py-4 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Quay lại
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          </div>
        )}
      </div>
    </div>
  );
}
