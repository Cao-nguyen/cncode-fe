import { cn } from "@/lib/utils";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}

export function Card({ children, className = "", hover = false }: CardProps) {
    return (
        <div
            className={cn(
                "bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden",
                hover && "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                className
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("p-4 border-b border-gray-200 dark:border-gray-800", className)}>{children}</div>;
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("p-4", className)}>{children}</div>;
}

export function CardFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("p-4 border-t border-gray-200 dark:border-gray-800", className)}>{children}</div>;
}