'use client';

import { useRef, useEffect } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { KhamphaVideo } from './types';

interface VideoPlayerProps {
  video: KhamphaVideo;
  index: number;
  isActive: boolean;
  isMuted: boolean;
  isPlaying: boolean;
  onPlayPause: () => void;
  onToggleMute: () => void;
  onTimeUpdate: (progress: number) => void;
  onLoadedMetadata: (duration: number) => void;
  onVideoClick: () => void;
}

export default function VideoPlayer({
  video,
  index,
  isActive,
  isMuted,
  isPlaying,
  onPlayPause,
  onToggleMute,
  onTimeUpdate,
  onLoadedMetadata,
  onVideoClick,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (isActive && isPlaying) {
      videoEl.play().catch(console.error);
    } else {
      videoEl.pause();
    }
  }, [isActive, isPlaying]);

  const handleTimeUpdate = () => {
    const videoEl = videoRef.current;
    if (!videoEl || videoEl.duration === 0) return;
    const progress = (videoEl.currentTime / videoEl.duration) * 100;
    onTimeUpdate(progress);
  };

  const handleLoadedMetadata = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    onLoadedMetadata(videoEl.duration);
  };

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src={video.streamUrl || video.videoUrl}
        poster={video.thumbnailUrl}
        className="w-full h-full object-contain"
        loop
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={onVideoClick}
      />

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <button
          onClick={onPlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
        >
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </button>
      )}

      {/* Mute Button */}
      <button
        onClick={onToggleMute}
        className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-white" />
        ) : (
          <Volume2 className="w-5 h-5 text-white" />
        )}
      </button>
    </div>
  );
}
