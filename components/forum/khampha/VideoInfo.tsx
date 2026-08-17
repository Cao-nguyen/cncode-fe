'use client';

import { User, Music, UserCheck2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getImageUrl } from '@/lib/utils/imageUrl';
import { KhamphaVideo } from './types';

interface VideoInfoProps {
  video: KhamphaVideo;
  isFollowing: boolean;
  onToggleFollow: () => void;
  expanded: boolean;
  onToggleExpand: () => void;
}

export default function VideoInfo({
  video,
  isFollowing,
  onToggleFollow,
  expanded,
  onToggleExpand,
}: VideoInfoProps) {
  const formatNumber = (num: number) =>
    new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(num);

  const renderCaptionWithHashtags = (text: string) => {
    return text.split(/(\s+)/).map((part, i) =>
      part.startsWith('#') && part.length > 1 ? (
        <span key={i} className="text-sky-400 font-semibold">
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const CAPTION_TRUNCATE_LENGTH = 90;
  const shouldTruncate = video.caption.length > CAPTION_TRUNCATE_LENGTH && !expanded;

  return (
    <div className="flex flex-col gap-3">
      {/* Author Info */}
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={getImageUrl(video.author.avatar)} alt={video.author.fullName} />
          <AvatarFallback>{video.author.fullName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white text-sm truncate">@{video.author.username}</h3>
            <span className="text-xs text-white/60">{formatNumber(video.author.followers)} người theo dõi</span>
          </div>
        </div>
        <button
          onClick={onToggleFollow}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
            isFollowing
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-[var(--cn-primary)] text-white hover:bg-[var(--cn-primary)]/90"
          )}
        >
          {isFollowing ? (
            <>
              <UserCheck2 className="w-3 h-3 inline mr-1" />
              Đang theo dõi
            </>
          ) : (
            <>
              <User className="w-3 h-3 inline mr-1" />
              Theo dõi
            </>
          )}
        </button>
      </div>

      {/* Caption */}
      <div className="text-sm text-white/90 leading-relaxed">
        {shouldTruncate ? (
          <>
            {renderCaptionWithHashtags(video.caption.slice(0, CAPTION_TRUNCATE_LENGTH))}
            <button
              onClick={onToggleExpand}
              className="text-white/60 hover:text-white ml-1"
            >
              ...xem thêm
            </button>
          </>
        ) : (
          renderCaptionWithHashtags(video.caption)
        )}
      </div>

      {/* Music Info */}
      {video.music && (
        <div className="flex items-center gap-2 text-sm text-white/80">
          <Music className="w-4 h-4" />
          <span className="truncate">{video.music.title} - {video.music.artist}</span>
        </div>
      )}

      {/* Hashtags */}
      {video.hashtags && video.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {video.hashtags.map((tag, i) => (
            <span key={i} className="text-xs text-sky-400">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

import { cn } from '@/lib/utils';
