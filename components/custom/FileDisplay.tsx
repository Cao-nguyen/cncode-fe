'use client';

import { FileText, Download, ExternalLink } from 'lucide-react';

interface FileItem {
    url: string;
    name: string;
    size: number;
}

interface FileDisplayProps {
    filesJson: string;
}

export function FileDisplay({ filesJson }: FileDisplayProps) {
    let files: FileItem[];
    try {
        files = JSON.parse(filesJson);
        if (!Array.isArray(files)) files = [];
    } catch {
        files = [];
    }

    if (files.length === 0) return null;

    const formatSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="space-y-2 max-w-[320px]">
            {files.map((file, index) => (
                <a
                    key={index}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-lg hover:bg-[var(--cn-hover)] transition group"
                >
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--cn-text-main)] truncate group-hover:text-[var(--cn-primary)] transition">
                            {file.name}
                        </p>
                        <p className="text-xs text-[var(--cn-text-sub)]">
                            {formatSize(file.size)}
                        </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[var(--cn-text-sub)] flex-shrink-0 opacity-0 group-hover:opacity-100 transition" />
                </a>
            ))}
        </div>
    );
}