'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

export interface AdminPaginationProps {
    page: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
    itemLabel?: string;
    className?: string;
}

export function AdminPagination({
    page,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    itemLabel = 'bản ghi',
    className,
}: AdminPaginationProps) {
    const [isPerPageOpen, setIsPerPageOpen] = useState(false);
    const perPageDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (perPageDropdownRef.current && !perPageDropdownRef.current.contains(event.target as Node)) {
                setIsPerPageOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (totalItems <= 0) return null;

    const safeTotalPages = Math.max(totalPages, 1);
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalItems);

    return (
        <div
            className={cn(
                'flex flex-col items-start justify-between gap-3 border-t border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:items-center',
                className,
            )}
        >
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                {onPageSizeChange ? (
                    <>
                        <span>Hiển thị</span>
                        <div className="relative" ref={perPageDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsPerPageOpen((open) => !open)}
                                className="flex min-w-[60px] cursor-pointer items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-900 transition-all duration-200 hover:border-blue-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-blue-400 dark:focus:border-blue-400"
                            >
                                <span>{pageSize}</span>
                                <ChevronDown
                                    className={cn(
                                        'h-3.5 w-3.5 text-gray-600 transition-transform duration-200 dark:text-gray-400',
                                        isPerPageOpen && 'rotate-180',
                                    )}
                                />
                            </button>
                            {isPerPageOpen && (
                                <div className="absolute bottom-full z-[9999] mb-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                    {pageSizeOptions.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => {
                                                onPageSizeChange(option);
                                                onPageChange(1);
                                                setIsPerPageOpen(false);
                                            }}
                                            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <span className="text-gray-900 dark:text-gray-100">{option}</span>
                                            {pageSize === option && (
                                                <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : null}
                <span>
                    {start} - {end} của {totalItems} {itemLabel}
                </span>
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(1)}
                    disabled={page === 1}
                    className="rounded-md border border-gray-300 p-2 text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    title="Trang đầu"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="rounded-md border border-gray-300 p-2 text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    {page} / {safeTotalPages}
                </div>
                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(safeTotalPages, page + 1))}
                    disabled={page === safeTotalPages}
                    className="rounded-md border border-gray-300 p-2 text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => onPageChange(safeTotalPages)}
                    disabled={page === safeTotalPages}
                    className="rounded-md border border-gray-300 p-2 text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    title="Trang cuối"
                >
                    <ChevronsRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
