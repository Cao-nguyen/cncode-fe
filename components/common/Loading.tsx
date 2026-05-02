"use client";

import { useEffect, useState } from "react";

interface CNCodeLoaderProps {
    text?: string;
    duration?: number;
    onComplete?: () => void;
}

export default function Loading({
    text = "Đang tải",
    duration,
    onComplete,
}: CNCodeLoaderProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (!duration) return;
        const t = setTimeout(() => {
            setVisible(false);
            onComplete?.();
        }, duration);
        return () => clearTimeout(t);
    }, [duration, onComplete]);

    if (!visible) return null;

    return (
        <div className="flex flex-col items-center justify-center gap-5 py-12">
            {/* Icon */}
            <div
                className="w-20 h-20 flex items-center justify-center animate-[spinBounce_1.6s_cubic-bezier(0.4,0,0.2,1)_infinite]"
                style={{ background: "#29b6f6", borderRadius: "14px" }}
            >
                <span className="text-[38px] font-extrabold text-white leading-none select-none">
                    N
                </span>
            </div>

            {/* Label */}
            <p className="text-[15px] text-gray-400 m-0">
                {text}
                {[0, 0.2, 0.4].map((delay, i) => (
                    <span
                        key={i}
                        className="opacity-0 animate-[dotBlink_1.4s_ease-in-out_infinite]"
                        style={{ animationDelay: `${delay}s` }}
                    >
                        .
                    </span>
                ))}
            </p>

            <style>{`
        @keyframes spinBounce {
          0%   { transform: translateY(0)     rotate(0deg);   }
          25%  { transform: translateY(-18px) rotate(90deg);  }
          50%  { transform: translateY(0)     rotate(180deg); }
          75%  { transform: translateY(-18px) rotate(270deg); }
          100% { transform: translateY(0)     rotate(360deg); }
        }
        @keyframes dotBlink {
          0%, 80%, 100% { opacity: 0; }
          40%           { opacity: 1; }
        }
      `}</style>
        </div>
    );
}