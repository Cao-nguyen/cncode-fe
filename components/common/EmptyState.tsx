import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 mb-4">
                {icon || <FolderOpen className="h-10 w-10 text-gray-400" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{description}</p>
            )}
            {action && <div>{action}</div>}
        </div>
    );
}