'use client';

import {
    Handshake,
    Megaphone,
    Clock,
    Radio,
    Eye,
    Heart,
    PlusCircle,
    FolderOpen,
    BadgeCheck,
    Facebook,
    ExternalLink,
} from 'lucide-react';

export type CrossPromotionSidebarView =
    | 'intro'
    | 'running'
    | 'pending'
    | 'publishing'
    | 'reach'
    | 'engagement'
    | 'my-campaigns'
    | 'completed';

export interface CrossPromotionSidebarStats {
    runningCampaigns: number;
    pendingPosts: number;
    publishingPosts: number;
    reach: number;
    engagement: number;
    completed: number;
}

interface CrossPromotionSidebarProps {
    stats: CrossPromotionSidebarStats;
    loadingStats?: boolean;
    isLoggedIn: boolean;
    activeView: CrossPromotionSidebarView;
    className?: string;
    onViewChange: (view: CrossPromotionSidebarView) => void;
    onCreateCampaign: () => void;
}

function formatStat(value: number, loading?: boolean) {
    if (loading) return '…';
    return value.toLocaleString('vi-VN');
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-6">
            <p
                className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--cn-text-muted)' }}
            >
                {title}
            </p>
            <div className="space-y-0.5">{children}</div>
        </div>
    );
}

function OverviewItem({
    icon: Icon,
    label,
    value,
    loading,
    active,
    onClick,
}: {
    icon: React.ElementType;
    label: string;
    value: number;
    loading?: boolean;
    active?: boolean;
    onClick?: () => void;
}) {
    const Comp = onClick ? 'button' : 'div';
    return (
        <Comp
            type={onClick ? 'button' : undefined}
            onClick={onClick}
            className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                onClick ? 'cursor-pointer hover:bg-black/5' : ''
            }`}
            style={{
                color: active ? 'var(--cn-primary)' : 'var(--cn-text-main)',
                backgroundColor: active ? 'color-mix(in srgb, var(--cn-primary) 10%, transparent)' : undefined,
            }}
        >
            <span className="flex min-w-0 items-center gap-2">
                <Icon className="h-4 w-4 shrink-0" style={{ color: 'var(--cn-primary)' }} />
                <span className="truncate">{label}</span>
            </span>
            <span className="shrink-0 text-xs font-semibold tabular-nums" style={{ color: 'var(--cn-text-sub)' }}>
                {formatStat(value, loading)}
            </span>
        </Comp>
    );
}

function NavItem({
    icon: Icon,
    label,
    onClick,
    active,
}: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    active?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-black/5"
            style={{
                color: active ? 'var(--cn-primary)' : 'var(--cn-text-main)',
                backgroundColor: active ? 'color-mix(in srgb, var(--cn-primary) 10%, transparent)' : undefined,
            }}
        >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
        </button>
    );
}

export function CrossPromotionSidebar({
    stats,
    loadingStats,
    isLoggedIn,
    activeView,
    className = '',
    onViewChange,
    onCreateCampaign,
}: CrossPromotionSidebarProps) {
    return (
        <aside
            className={`w-64 shrink-0 overflow-y-auto border-r py-6 pl-4 pr-3 ${className}`}
            style={{ backgroundColor: 'var(--cn-bg-card)', borderColor: 'var(--cn-border)' }}
        >
            <SidebarSection title="Tổng quan">
                <NavItem
                    icon={Handshake}
                    label="Truyền thông chéo"
                    active={activeView === 'intro'}
                    onClick={() => onViewChange('intro')}
                />
                <OverviewItem
                    icon={Megaphone}
                    label="Chiến dịch đang chạy"
                    value={stats.runningCampaigns}
                    loading={loadingStats}
                    active={activeView === 'running'}
                    onClick={isLoggedIn ? () => onViewChange('running') : undefined}
                />
                <OverviewItem
                    icon={Clock}
                    label="Bài chờ duyệt"
                    value={stats.pendingPosts}
                    loading={loadingStats}
                    active={activeView === 'pending'}
                    onClick={isLoggedIn ? () => onViewChange('pending') : undefined}
                />
                <OverviewItem
                    icon={Radio}
                    label="Bài đang phát hành"
                    value={stats.publishingPosts}
                    loading={loadingStats}
                    active={activeView === 'publishing'}
                    onClick={isLoggedIn ? () => onViewChange('publishing') : undefined}
                />
                <OverviewItem
                    icon={Eye}
                    label="Lượt tiếp cận"
                    value={stats.reach}
                    loading={loadingStats}
                    active={activeView === 'reach'}
                    onClick={() => onViewChange('reach')}
                />
                <OverviewItem
                    icon={Heart}
                    label="Lượt tương tác"
                    value={stats.engagement}
                    loading={loadingStats}
                    active={activeView === 'engagement'}
                    onClick={() => onViewChange('engagement')}
                />
            </SidebarSection>

            <SidebarSection title="Chiến dịch">
                <NavItem icon={PlusCircle} label="Tạo chiến dịch" onClick={onCreateCampaign} />
                <NavItem
                    icon={FolderOpen}
                    label="Chiến dịch của tôi"
                    active={activeView === 'my-campaigns'}
                    onClick={() => onViewChange('my-campaigns')}
                />
                <NavItem
                    icon={Clock}
                    label="Đang chờ duyệt"
                    active={activeView === 'pending'}
                    onClick={() => onViewChange('pending')}
                />
                <NavItem
                    icon={BadgeCheck}
                    label="Đã hoàn thành"
                    active={activeView === 'completed'}
                    onClick={() => onViewChange('completed')}
                />
            </SidebarSection>

            <SidebarSection title="Kênh truyền thông">
                <a
                    href="https://www.facebook.com/cncode.io.vn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-black/5"
                    style={{ color: 'var(--cn-text-main)' }}
                >
                    <Facebook className="h-4 w-4 shrink-0 text-[#1877F2]" />
                    <span className="min-w-0 flex-1 truncate">Fanpage</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-50" />
                </a>
            </SidebarSection>

            {!isLoggedIn && (
                <p className="mx-3 mt-2 text-xs leading-relaxed" style={{ color: 'var(--cn-text-muted)' }}>
                    Đăng nhập để xem thống kê chiến dịch và quản lý yêu cầu của bạn.
                </p>
            )}
        </aside>
    );
}
