'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export default function ProgressBar({
  progress,
  isDragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: ProgressBarProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 cursor-pointer group">
      <div
        className="h-full bg-white transition-all duration-75"
        style={{ width: `${progress}%` }}
      />
      {/* Draggable handle */}
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
          isDragging && "opacity-100"
        )}
        style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      />
    </div>
  );
}
