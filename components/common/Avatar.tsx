import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
    src?: string | null;
    alt?: string;
    fallback?: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizeClasses = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
    xl: "h-16 w-16 text-xl",
};

export default function Avatar({ src, alt = "Avatar", fallback, size = "md", className = "" }: AvatarProps) {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (src) {
        return (
            <div className={cn("relative rounded-full overflow-hidden flex-shrink-0", sizeClasses[size], className)}>
                <Image src={src} alt={alt} fill className="object-cover" />
            </div>
        );
    }

    return (
        <div
            className={cn(
                "rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-medium flex-shrink-0",
                sizeClasses[size],
                className
            )}
        >
            {fallback ? getInitials(fallback) : "?"}
        </div>
    );
}