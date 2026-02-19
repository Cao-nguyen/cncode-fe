export default function ButtonAuth(
    { children, className = "", ...props }: {
        children: React.ReactNode;
        className?: string;
    } & React.ButtonHTMLAttributes<HTMLButtonElement>
) {
    return (
        <button
            {...props}
            className={`w-full rounded-md text-[14px] p-[10px] ${className}`}
        >
            {children}
        </button>
    );
}