// components/common/StarRating.tsx
'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    readonly?: boolean;
    size?: number;
    showText?: boolean;
}

export default function StarRating({
    rating,
    onRatingChange,
    readonly = false,
    size = 24,
    showText = false
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const handleMouseEnter = (index: number) => {
        if (!readonly) setHoverRating(index);
    };

    const handleMouseLeave = () => {
        if (!readonly) setHoverRating(0);
    };

    const handleClick = (index: number) => {
        if (!readonly && onRatingChange) onRatingChange(index);
    };

    const displayRating = hoverRating || rating;

    const ratingText: Record<number, string> = {
        1: 'Rất tệ',
        2: 'Tệ',
        3: 'Bình thường',
        4: 'Tốt',
        5: 'Tuyệt vời!'
    };

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => handleMouseEnter(star)}
                        onMouseLeave={handleMouseLeave}
                        disabled={readonly}
                        className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
                    >
                        <Star
                            size={size}
                            data-filled={star <= displayRating}
                            className={`${star <= displayRating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-300 dark:fill-gray-700 dark:text-gray-600'
                                } transition-colors`}
                        />
                    </button>
                ))}
            </div>
            {showText && displayRating > 0 && (
                <span className="text-xs text-gray-500">{ratingText[displayRating]}</span>
            )}
        </div>
    );
}