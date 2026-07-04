'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  width?: string;
  height?: string;
}

export function Skeleton({ className = '', variant = 'rect', width, height }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-[var(--cn-bg-section)] rounded';
  
  const variantClasses = {
    text: 'h-4 w-full',
    rect: 'rounded-lg',
    circle: 'rounded-full',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-[var(--cn-bg-card)] rounded-lg overflow-hidden border border-[var(--cn-border)]">
      <Skeleton variant="rect" height="192px" className="w-full" />
      <div className="p-4 space-y-3">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </div>
    </div>
  );
}

export function TrainingPlaceSkeleton() {
  return (
    <div className="bg-[var(--cn-bg-card)] rounded-lg p-4 border border-[var(--cn-border)]">
      <Skeleton variant="rect" height="128px" className="w-full mb-4" />
      <Skeleton variant="text" width="70%" className="mb-2" />
      <Skeleton variant="text" width="50%" className="mb-2" />
      <div className="flex gap-2 mb-2">
        <Skeleton variant="text" width="60px" height="24px" />
        <Skeleton variant="text" width="60px" height="24px" />
      </div>
      <Skeleton variant="text" width="80px" />
    </div>
  );
}

export function IndustrySkeleton() {
  return (
    <div className="bg-[var(--cn-bg-card)] rounded-lg overflow-hidden border border-[var(--cn-border)]">
      <Skeleton variant="rect" height="192px" className="w-full" />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton variant="text" width="60px" height="20px" />
        </div>
        <Skeleton variant="text" width="80%" className="mb-2" />
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </div>
    </div>
  );
}
