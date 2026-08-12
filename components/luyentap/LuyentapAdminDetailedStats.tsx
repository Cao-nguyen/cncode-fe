'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, Loader2, X } from 'lucide-react';
import {
    Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { toast } from 'sonner';
import StaticContent from '@/components/common/StaticContent';
import LuyentapAdminQuestionPreviewContent from '@/components/luyentap/LuyentapAdminQuestionPreviewContent';
import {
    luyentapApi,
    type AdminDetailedStatistics,
    type AdminFrequencyGroupRow,
    type AdminQuestionStatRow,
} from '@/lib/api/luyentap.api';
import { formatScoreValue } from '@/lib/luyentap/exercise-display.utils';
import { cn } from '@/lib/utils';

interface LuyentapAdminDetailedStatsProps {
    exerciseId: string;
}

const TABLE_HEAD = 'border border-slate-200 bg-slate-800 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white';
const TABLE_CELL = 'border border-slate-200 px-3 py-2.5 text-sm text-slate-700';
const TABLE_CELL_CENTER = cn(TABLE_CELL, 'text-center');

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[#1e3a8a]">
            {children}
        </h2>
    );
}

function ScoreDistributionSection({
    title,
    data,
}: {
    title: string;
    data: AdminDetailedStatistics['scoreDistribution'];
}) {
    const [chartReady, setChartReady] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => setChartReady(true), 0);
        return () => window.clearTimeout(timer);
    }, []);

    const chartData = useMemo(
        () => (data.buckets || []).map((bucket) => ({
            name: bucket.label,
            count: bucket.count,
        })),
        [data.buckets],
    );

    const maxCount = Math.max(1, ...(data.buckets || []).map((bucket) => bucket.count));

    return (
        <section className="mb-8">
            <SectionTitle>Thống kê phổ điểm</SectionTitle>
            <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.75fr)_minmax(300px,1fr)]">
                <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-800">Biểu đồ phổ điểm</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Thống kê điểm thi_{title}
                        </p>
                    </div>
                    <div className="px-2 pb-4 pt-2">
                        <div className="h-[300px] w-full min-w-0">
                            {chartReady && chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={chartData}
                                        margin={{ top: 12, right: 16, left: 4, bottom: 28 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 11, fill: '#64748b' }}
                                            interval={0}
                                            angle={chartData.length > 8 ? -35 : 0}
                                            textAnchor={chartData.length > 8 ? 'end' : 'middle'}
                                            height={chartData.length > 8 ? 56 : 32}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: '#64748b' }}
                                            allowDecimals={false}
                                            domain={[0, maxCount]}
                                            width={36}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: 8,
                                                border: '1px solid #e2e8f0',
                                                fontSize: 12,
                                            }}
                                        />
                                        <Bar
                                            dataKey="count"
                                            name="Số lượng"
                                            fill="#2563eb"
                                            radius={[4, 4, 0, 0]}
                                            maxBarSize={48}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                                    {chartData.length === 0 ? 'Chưa có dữ liệu phổ điểm' : 'Đang tải biểu đồ…'}
                                </div>
                            )}
                        </div>
                        <div className="mt-1 flex items-center gap-2 px-2 text-xs text-slate-500">
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-600" />
                            Số lượng
                        </div>
                    </div>
                </div>

                <div className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-800">Thống kê</p>
                    </div>
                    <div className="max-h-[360px] overflow-y-auto px-4 py-3">
                        <div className="space-y-2.5">
                            {(data.buckets || []).map((bucket) => {
                                const width = maxCount > 0 ? (bucket.count / maxCount) * 100 : 0;
                                return (
                                    <div
                                        key={bucket.label}
                                        className="grid grid-cols-[56px_minmax(0,1fr)_28px] items-center gap-2"
                                    >
                                        <span className="text-xs font-medium text-slate-600">{bucket.label}</span>
                                        <div className="h-2 rounded-full bg-slate-100">
                                            <div
                                                className={cn(
                                                    'h-full rounded-full',
                                                    bucket.count > 0 ? 'bg-blue-600' : 'bg-slate-200',
                                                )}
                                                style={{ width: `${Math.max(width, bucket.count > 0 ? 10 : 0)}%` }}
                                            />
                                        </div>
                                        <span className="text-right text-xs font-semibold text-slate-800">
                                            {bucket.count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="space-y-3 border-t border-slate-100 px-4 py-4">
                        <div className="flex items-end justify-between gap-3">
                            <span className="text-2xl font-bold text-slate-900">
                                {formatScoreValue(data.averageScore)}
                            </span>
                            <span className="pb-0.5 text-xs text-slate-500">Điểm trung bình</span>
                        </div>
                        <div className="flex items-end justify-between gap-3">
                            <span className="text-2xl font-bold text-slate-900">
                                {data.modeCount > 0 ? data.modeLabel : '—'}
                            </span>
                            <span className="max-w-[160px] pb-0.5 text-right text-xs leading-snug text-slate-500">
                                Mốc điểm có nhiều học sinh đạt được nhất
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function FrequencyTableSection({
    rows,
    passScore,
}: {
    rows: AdminFrequencyGroupRow[];
    passScore: number;
}) {
    const bucketLabels = rows[0]?.buckets.map((bucket) => bucket.label) || [];

    return (
        <section className="mb-8">
            <SectionTitle>Bảng tần số</SectionTitle>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-[960px] w-full border-collapse">
                    <thead>
                        <tr>
                            <th rowSpan={2} className={cn(TABLE_HEAD, 'text-left')}>Lớp</th>
                            <th rowSpan={2} className={cn(TABLE_HEAD, 'text-center')}>Đăng ký</th>
                            <th rowSpan={2} className={cn(TABLE_HEAD, 'text-center')}>Dự thi</th>
                            {bucketLabels.map((label) => (
                                <th key={label} colSpan={2} className={cn(TABLE_HEAD, 'text-center')}>
                                    {label}
                                </th>
                            ))}
                            <th colSpan={2} className={cn(TABLE_HEAD, 'text-center')}>
                                TRÊN TB (≥{formatScoreValue(passScore)})
                            </th>
                        </tr>
                        <tr>
                            {bucketLabels.map((label) => (
                                <React.Fragment key={`${label}-sub`}>
                                    <th className={cn(TABLE_HEAD, 'bg-slate-700 text-center text-[10px]')}>SL</th>
                                    <th className={cn(TABLE_HEAD, 'bg-slate-700 text-center text-[10px]')}>%</th>
                                </React.Fragment>
                            ))}
                            <th className={cn(TABLE_HEAD, 'bg-slate-700 text-center text-[10px]')}>SL</th>
                            <th className={cn(TABLE_HEAD, 'bg-slate-700 text-center text-[10px]')}>%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr
                                key={row.label}
                                className={cn(
                                    rowIndex % 2 === 1 && 'bg-slate-50/80',
                                    row.label === 'TỔNG' && 'bg-blue-50 font-semibold',
                                )}
                            >
                                <td className={cn(TABLE_CELL, 'font-semibold text-slate-900')}>{row.label}</td>
                                <td className={cn(TABLE_CELL_CENTER, 'font-medium')}>{row.registered}</td>
                                <td className={cn(TABLE_CELL_CENTER, 'font-medium')}>{row.participated}</td>
                                {row.buckets.map((bucket) => (
                                    <React.Fragment key={`${row.label}-${bucket.label}`}>
                                        <td className={cn(TABLE_CELL_CENTER, 'font-semibold text-slate-900')}>
                                            {bucket.count}
                                        </td>
                                        <td className={cn(TABLE_CELL_CENTER, 'text-slate-500')}>{bucket.percent}</td>
                                    </React.Fragment>
                                ))}
                                <td className={cn(TABLE_CELL_CENTER, 'font-semibold text-slate-900')}>
                                    {row.aboveAverage.count}
                                </td>
                                <td className={cn(TABLE_CELL_CENTER, 'text-slate-500')}>
                                    {row.aboveAverage.percent}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function QuestionPreviewModal({
    question,
    open,
    onClose,
}: {
    question: AdminQuestionStatRow | null;
    open: boolean;
    onClose: () => void;
}) {
    if (!open || !question) return null;

    return (
        <div
            className="fixed inset-0 z-[10003] flex items-center justify-center bg-black/50 p-3 sm:p-4"
            onClick={onClose}
        >
            <div
                className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Nội dung câu hỏi
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-bold text-blue-600">
                                {question.questionLabel}
                            </span>
                            {question.groupTitle && (
                                <span className="text-sm text-slate-500">· {question.groupTitle}</span>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        aria-label="Đóng"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    {question.preview ? (
                        <LuyentapAdminQuestionPreviewContent preview={question.preview} />
                    ) : question.questionHtml ? (
                        <StaticContent
                            content={question.questionHtml}
                            className="prose prose-sm max-w-none text-slate-800"
                        />
                    ) : (
                        <p className="text-sm text-slate-500">Không có nội dung câu hỏi</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function QuestionAccuracySection({
    rows,
    groupLabel,
}: {
    rows: AdminDetailedStatistics['questionStats'];
    groupLabel: string;
}) {
    const [previewQuestion, setPreviewQuestion] = useState<AdminQuestionStatRow | null>(null);

    return (
        <section>
            <SectionTitle>Bảng thống kê tỷ lệ đúng sai</SectionTitle>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700">
                    {groupLabel}
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-[1100px] w-full border-collapse">
                        <thead>
                            <tr>
                                <th className={cn(TABLE_HEAD, 'w-12 text-center')}>STT</th>
                                <th className={cn(TABLE_HEAD, 'min-w-[140px] text-left')}>ID câu hỏi</th>
                                <th className={cn(TABLE_HEAD, 'text-center')}>Tổng HS dự thi</th>
                                <th className={cn(TABLE_HEAD, 'text-center')}>HS đã làm</th>
                                <th className={cn(TABLE_HEAD, 'text-center')}>HS chưa làm</th>
                                <th className={cn(TABLE_HEAD, 'text-center')}>HS làm đúng</th>
                                <th className={cn(TABLE_HEAD, 'text-center')}>HS làm sai</th>
                                <th className={cn(TABLE_HEAD, 'min-w-[120px] text-center')}>Chưa hoàn thành</th>
                                <th className={cn(TABLE_HEAD, 'min-w-[140px] text-left')}>HS làm đúng</th>
                                <th className={cn(TABLE_HEAD, 'min-w-[140px] text-left')}>HS làm sai</th>
                                <th className={cn(TABLE_HEAD, 'min-w-[140px] text-left')}>HS chưa làm</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="border border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                                        Chưa có dữ liệu thống kê câu hỏi
                                    </td>
                                </tr>
                            ) : rows.map((row, rowIndex) => (
                                <tr
                                    key={String(row.questionId)}
                                    className={cn(rowIndex % 2 === 1 && 'bg-slate-50/60')}
                                >
                                    <td className={cn(TABLE_CELL_CENTER, 'font-medium')}>{row.index}</td>
                                    <td className={TABLE_CELL}>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold tracking-wide text-slate-800">
                                                {row.questionLabel}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    setPreviewQuestion(row);
                                                }}
                                                className="rounded-md p-1 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                                title="Xem câu hỏi"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className={cn(TABLE_CELL_CENTER, 'font-medium')}>{row.totalParticipants}</td>
                                    <td className={cn(TABLE_CELL_CENTER, 'font-medium')}>{row.attemptedCount}</td>
                                    <td className={cn(TABLE_CELL_CENTER, 'font-semibold text-orange-600')}>
                                        {row.notAttemptedCount}
                                    </td>
                                    <td className={cn(TABLE_CELL_CENTER, 'font-semibold text-emerald-600')}>
                                        {row.correctCount}
                                    </td>
                                    <td className={cn(TABLE_CELL_CENTER, 'font-semibold text-red-600')}>
                                        {row.wrongCount}
                                    </td>
                                    <td className={TABLE_CELL}>
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                                                <div
                                                    className="h-full rounded-full bg-blue-600"
                                                    style={{ width: `${row.incompletePercent}%` }}
                                                />
                                            </div>
                                            <span className="min-w-[36px] text-xs font-semibold text-slate-700">
                                                {row.incompletePercent}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className={cn(TABLE_CELL, 'text-xs leading-relaxed')}>
                                        {row.correctStudents.join(', ') || '—'}
                                    </td>
                                    <td className={cn(TABLE_CELL, 'text-xs leading-relaxed')}>
                                        {row.wrongStudents.join(', ') || '—'}
                                    </td>
                                    <td className={cn(TABLE_CELL, 'text-xs leading-relaxed')}>
                                        {row.notAttemptedStudents.join(', ') || '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <QuestionPreviewModal
                question={previewQuestion}
                open={Boolean(previewQuestion)}
                onClose={() => setPreviewQuestion(null)}
            />
        </section>
    );
}

export default function LuyentapAdminDetailedStats({ exerciseId }: LuyentapAdminDetailedStatsProps) {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<AdminDetailedStatistics | null>(null);

    const loadStats = useCallback(async () => {
        setLoading(true);
        try {
            const data = await luyentapApi.getAdminDetailedStatistics(exerciseId);
            setStats(data);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Không thể tải thống kê chi tiết');
        } finally {
            setLoading(false);
        }
    }, [exerciseId]);

    useEffect(() => {
        void loadStats();
    }, [loadStats]);

    if (loading) {
        return (
            <div className="flex min-h-[240px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!stats) {
        return (
            <p className="py-10 text-center text-sm text-slate-500">
                Không có dữ liệu thống kê
            </p>
        );
    }

    const frequencyRows = [...stats.frequencyTable.groups, stats.frequencyTable.total];
    const groupLabel = stats.frequencyTable.groups[0]?.label || 'Thí sinh tự do';

    return (
        <div className="space-y-2">
            <ScoreDistributionSection
                title={stats.exerciseTitle}
                data={stats.scoreDistribution}
            />
            <FrequencyTableSection
                rows={frequencyRows}
                passScore={stats.frequencyTable.passScore}
            />
            <QuestionAccuracySection
                rows={stats.questionStats}
                groupLabel={groupLabel}
            />
        </div>
    );
}
