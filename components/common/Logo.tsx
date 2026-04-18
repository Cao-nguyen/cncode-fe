import Image from "next/image";
import Link from "next/link";

interface LogoProps {
    className?: string;
    showText?: boolean;
    size?: "sm" | "md" | "lg";
}

const sizeClasses = {
    sm: { width: 32, height: 32, textSize: "text-lg" },
    md: { width: 40, height: 40, textSize: "text-xl" },
    lg: { width: 48, height: 48, textSize: "text-2xl" },
};

export default function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
    const { width, height, textSize } = sizeClasses[size];

    return (
        <Link href="/" className={`flex items-center gap-2 ${className}`}>
            <Image src="/images/logo.png" alt="CNcode Logo" width={width} height={height} className="object-contain" />
            {showText && <span className={`font-bold ${textSize} text-gray-900 dark:text-white`}>CNcode</span>}
        </Link>
    );
}