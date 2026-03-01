export default function ButtonAuth(
    { children, className = "", ...props }: {
        children: React.ReactNode;
        className?: string;
    } & React.ButtonHTMLAttributes<HTMLButtonElement>
) {
    return (
        <button
            {...props}
            className={`transition-transform duration-150 hover:scale-[0.99] w-full rounded-md text-[14px] p-[10px] ${className}`}
        >
            {children}
        </button>
    );
}