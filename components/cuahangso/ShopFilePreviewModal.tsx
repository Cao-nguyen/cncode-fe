'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Loader2, Download, ExternalLink, Eye } from 'lucide-react';
import StaticContent from '@/components/common/StaticContent';
import { CustomButton } from '@/components/custom/CustomButton';
import {
    buildShopFileProxyUrl,
    canPreviewShopFile,
    downloadShopFile,
    fetchShopFileArrayBuffer,
    fetchShopFilePreviewContent,
    getShopFilePreviewErrorMessage,
    getShopFilePreviewMode,
    isDocxBuffer,
    isTelegramProxyFile,
    type ShopFileLike,
} from '@/lib/cuahangso/shop-file.utils';
import { toast } from 'sonner';
import { shopApi } from '@/lib/api/shop.api';

interface ShopFilePreviewModalProps {
    file: ShopFileLike | null;
    onClose: () => void;
    productId?: string;
    fileIndex?: number;
    onDownloadRecorded?: (downloads: number) => void;
}

function ShopPptxPreview({ arrayBuffer }: { arrayBuffer: ArrayBuffer }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let cancelled = false;

        const render = async () => {
            container.innerHTML = '';
            const { init } = await import('pptx-preview');
            if (cancelled || !containerRef.current) return;

            const viewer = init(containerRef.current, {
                width: Math.min(containerRef.current.clientWidth || 960, 960),
                height: 540,
            });
            await viewer.preview(arrayBuffer);
        };

        render().catch((err) => {
            console.error('[ShopPptxPreview]', err);
        });

        return () => {
            cancelled = true;
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [arrayBuffer]);

    return (
        <div className="overflow-auto rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#141414]">
            <div ref={containerRef} className="mx-auto min-h-[540px] w-full max-w-[960px]" />
        </div>
    );
}

export function ShopFilePreviewModal({
    file,
    onClose,
    productId,
    fileIndex,
    onDownloadRecorded,
}: ShopFilePreviewModalProps) {
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [previewHtml, setPreviewHtml] = useState('');
    const [previewText, setPreviewText] = useState('');
    const [pptxBuffer, setPptxBuffer] = useState<ArrayBuffer | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!file) {
            setPreviewHtml('');
            setPreviewText('');
            setPptxBuffer(null);
            setError('');
            return;
        }

        const mode = getShopFilePreviewMode(file);
        if (mode === 'link' || mode === 'pdf' || mode === 'image' || mode === 'unsupported') {
            setPreviewHtml('');
            setPreviewText('');
            setPptxBuffer(null);
            setError('');
            setLoading(false);
            return;
        }

        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError('');
            setPreviewHtml('');
            setPreviewText('');
            setPptxBuffer(null);

            try {
                if (isTelegramProxyFile(file.url)) {
                    const preview = await fetchShopFilePreviewContent(file);
                    if (cancelled) return;

                    if (preview.type === 'html') {
                        setPreviewHtml(preview.content);
                        return;
                    }
                    if (preview.type === 'text') {
                        setPreviewText(preview.content);
                        return;
                    }
                    if (preview.type === 'pptx') {
                        const buffer = await fetchShopFileArrayBuffer(file);
                        if (cancelled) return;
                        setPptxBuffer(buffer);
                        return;
                    }
                }

                const buffer = await fetchShopFileArrayBuffer(file);
                if (cancelled) return;

                if (mode === 'pptx') {
                    setPptxBuffer(buffer);
                    return;
                }

                if (mode === 'docx') {
                    if (!isDocxBuffer(buffer)) {
                        throw new Error('File không phải định dạng Word (.docx) hợp lệ');
                    }
                    const mammoth = await import('mammoth');
                    const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
                    if (cancelled) return;
                    setPreviewHtml(result.value || '<p>Không có nội dung</p>');
                    return;
                }

                if (mode === 'text') {
                    const decoder = new TextDecoder('utf-8');
                    if (cancelled) return;
                    setPreviewText(decoder.decode(buffer));
                }
            } catch (err) {
                if (!cancelled) {
                    setError(getShopFilePreviewErrorMessage(err));
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [file]);

    if (!file) return null;

    const mode = getShopFilePreviewMode(file);
    const previewUrl = buildShopFileProxyUrl(file.url, {
        filename: file.name,
        disposition: 'inline',
    });

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await downloadShopFile(file);
            if (productId != null && fileIndex != null) {
                const res = await shopApi.recordProductDownload(productId, fileIndex);
                if (res.success && res.data?.counted && res.data.downloads != null) {
                    onDownloadRecorded?.(res.data.downloads);
                }
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Không thể tải file');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div
                className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-[#141414]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                    <div className="min-w-0 pr-4">
                        <p className="text-xs uppercase tracking-wide text-gray-400">Xem trước tài liệu</p>
                        <h3 className="mt-1 truncate text-lg font-semibold text-gray-900 dark:text-gray-100">{file.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <CustomButton variant="outline" size="small" onClick={handleDownload} loading={downloading}>
                            <Download className="h-4 w-4" />
                            Tải xuống
                        </CustomButton>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-gray-50 p-4 dark:bg-gray-950">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-[var(--cn-primary)]" />
                            {mode === 'pptx' && (
                                <p className="text-sm text-gray-500">Đang tải slide...</p>
                            )}
                        </div>
                    ) : error ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/40 dark:bg-red-900/20">
                            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                            <CustomButton className="mt-4" variant="outline" onClick={handleDownload}>
                                Tải xuống để xem
                            </CustomButton>
                        </div>
                    ) : mode === 'link' ? (
                        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#141414]">
                            <p className="mb-4 break-all text-sm text-gray-600 dark:text-gray-300">{file.url}</p>
                            <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                            >
                                Mở liên kết
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>
                    ) : mode === 'pdf' && previewUrl ? (
                        <iframe
                            src={previewUrl}
                            title={file.name}
                            className="h-[70vh] w-full rounded-xl border border-gray-200 bg-white"
                        />
                    ) : mode === 'image' && previewUrl ? (
                        <div className="flex justify-center">
                            <img src={previewUrl} alt={file.name} className="max-h-[70vh] rounded-xl object-contain" />
                        </div>
                    ) : mode === 'pptx' && pptxBuffer ? (
                        <ShopPptxPreview arrayBuffer={pptxBuffer} />
                    ) : mode === 'legacy-doc' ? (
                        <div className="space-y-3">
                            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
                                File Word (.doc) — hiển thị bản trích xuất văn bản. Bảng/hình ảnh phức tạp có thể không hiện đủ; tải xuống để xem đầy đủ.
                            </p>
                            <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-xl border border-gray-200 bg-white p-6 text-sm leading-relaxed text-gray-800 dark:border-gray-800 dark:bg-[#141414] dark:text-gray-100">
                                {previewText || 'Không trích xuất được nội dung. Vui lòng tải xuống và mở bằng Microsoft Word.'}
                            </pre>
                        </div>
                    ) : mode === 'docx' && previewHtml ? (
                        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#141414]">
                            <StaticContent content={previewHtml} compact />
                        </div>
                    ) : mode === 'text' ? (
                        <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-800 dark:border-gray-800 dark:bg-[#141414] dark:text-gray-100">
                            {previewText}
                        </pre>
                    ) : (
                        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-[#141414]">
                            <p className="text-sm text-gray-500">Không hỗ trợ xem trước loại file này.</p>
                            <CustomButton className="mt-4" onClick={handleDownload}>
                                Tải xuống
                            </CustomButton>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface ShopFileActionsProps {
    file: ShopFileLike;
    className?: string;
    productId?: string;
    fileIndex?: number;
    onDownloadRecorded?: (downloads: number) => void;
}

export function ShopFileActions({ file, className, productId, fileIndex, onDownloadRecorded }: ShopFileActionsProps) {
    const [previewFile, setPreviewFile] = useState<ShopFileLike | null>(null);
    const [downloading, setDownloading] = useState(false);
    const canPreview = canPreviewShopFile(file);
    const shouldTrackDownload = productId != null && fileIndex != null;

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setDownloading(true);
        try {
            await downloadShopFile(file);
            if (shouldTrackDownload) {
                const res = await shopApi.recordProductDownload(productId, fileIndex);
                if (res.success && res.data?.counted && res.data.downloads != null) {
                    onDownloadRecorded?.(res.data.downloads);
                }
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Không thể tải file');
        } finally {
            setDownloading(false);
        }
    };

    const actionBtnClass =
        'inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition disabled:opacity-60';

    return (
        <>
            <div className={`flex shrink-0 items-center gap-2 ${className || ''}`}>
                {canPreview && file.url && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setPreviewFile(file);
                        }}
                        className={`${actionBtnClass} border border-[var(--cn-border)] bg-[var(--cn-bg-card)] text-[var(--cn-primary)] hover:bg-[var(--cn-bg-section)]`}
                    >
                        <Eye className="h-3.5 w-3.5" />
                        Xem
                    </button>
                )}
                {file.url && (
                    <button
                        type="button"
                        onClick={handleDownload}
                        disabled={downloading}
                        className={`${actionBtnClass} bg-[var(--cn-primary)] text-white hover:opacity-90`}
                    >
                        {downloading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Download className="h-3.5 w-3.5" />
                        )}
                        Tải về
                    </button>
                )}
            </div>
            <ShopFilePreviewModal
                file={previewFile}
                onClose={() => setPreviewFile(null)}
                productId={productId}
                fileIndex={fileIndex}
                onDownloadRecorded={onDownloadRecorded}
            />
        </>
    );
}
