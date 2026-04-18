interface SectionProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    className?: string;
    containerClassName?: string;
}

export default function Section({ children, title, description, className = "", containerClassName = "" }: SectionProps) {
    return (
        <section className={`py-12 md:py-16 lg:py-20 ${className}`}>
            <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${containerClassName}`}>
                {(title || description) && (
                    <div className="text-center mb-10">
                        {title && <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>}
                        {description && <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{description}</p>}
                    </div>
                )}
                {children}
            </div>
        </section>
    );
}