'use client';

import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoActionsProps {
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  isFavorited: boolean;
  onToggleLike: () => void;
  onToggleFavorite: () => void;
  onOpenComments: () => void;
  onOpenShare: () => void;
}

export default function VideoActions({
  likeCount,
  commentCount,
  shareCount,
  isLiked,
  isFavorited,
  onToggleLike,
  onToggleFavorite,
  onOpenComments,
  onOpenShare,
}: VideoActionsProps) {
  const formatNumber = (num: number) =>
    new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(num);

  return (
    <div className="flex flex-col gap-4">
      {/* Like */}
      <button
        onClick={onToggleLike}
        className="flex flex-col items-center gap-1 group"
      >
        <div className={cn(
          "w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all",
          isLiked && "bg-red-500/20"
        )}>
          <Heart className={cn(
            "w-6 h-6 transition-colors",
            isLiked ? "text-red-500 fill-red-500" : "text-white"
          )} />
        </div>
        <span className="text-xs text-white font-medium">{formatNumber(likeCount)}</span>
      </button>

      {/* Comment */}
      <button
        onClick={onOpenComments}
        className="flex flex-col items-center gap-1 group"
      >
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all group-hover:bg-white/20">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <span className="text-xs text-white font-medium">{formatNumber(commentCount)}</span>
      </button>

      {/* Bookmark */}
      <button
        onClick={onToggleFavorite}
        className="flex flex-col items-center gap-1 group"
      >
        <div className={cn(
          "w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all",
          isFavorited && "bg-yellow-500/20"
        )}>
          <Bookmark className={cn(
            "w-6 h-6 transition-colors",
            isFavorited ? "text-yellow-500 fill-yellow-500" : "text-white"
          )} />
        </div>
        <span className="text-xs text-white font-medium">Lưu</span>
      </button>

      {/* Share */}
      <button
        onClick={onOpenShare}
        className="flex flex-col items-center gap-1 group"
      >
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all group-hover:bg-white/20">
          <Share2 className="w-6 h-6 text-white" />
        </div>
        <span className="text-xs text-white font-medium">{formatNumber(shareCount)}</span>
      </button>
    </div>
  );
}
