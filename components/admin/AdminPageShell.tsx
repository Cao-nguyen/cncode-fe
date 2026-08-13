'use client';

import { cn } from '@/lib/utils';

/** Wrapper padding/spacing — chuẩn /admin/users */
export const adminPageClass = 'space-y-6 pb-6 sm:pb-8';

export const adminTitleClass = 'text-2xl sm:text-3xl font-bold text-gray-800';

export const adminDescriptionClass = 'text-sm text-gray-500 mt-1';

export const adminHeaderClass =
    'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3';

interface AdminPageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    extra?: React.ReactNode;
    /** Thay thế block title/description mặc định (vd. breadcrumb luyện tập) */
    titleSlot?: React.ReactNode;
    className?: string;
}

export function AdminPageHeader({
    title,
    description,
    action,
    extra,
    titleSlot,
    className,
}: AdminPageHeaderProps) {
    return (
        <div className={cn(adminHeaderClass, className)}>
            {titleSlot ?? (
                <div>
                    <h1 className={adminTitleClass}>{title}</h1>
                    {description ? (
                        <p className={adminDescriptionClass}>{description}</p>
                    ) : null}
                </div>
            )}
            {(action || extra) && (
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center shrink-0">
                    {extra}
                    {action}
                </div>
            )}
        </div>
    );
}

interface AdminPageShellProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    extra?: React.ReactNode;
    titleSlot?: React.ReactNode;
    header?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export function AdminPageShell({
    title,
    description,
    action,
    extra,
    titleSlot,
    header,
    children,
    className,
}: AdminPageShellProps) {
    return (
        <div className={cn(adminPageClass, className)}>
            {header ?? (
                <AdminPageHeader
                    title={title}
                    description={description}
                    action={action}
                    extra={extra}
                    titleSlot={titleSlot}
                />
            )}
            {children}
        </div>
    );
}
