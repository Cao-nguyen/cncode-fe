import React from 'react';
import { ExternalLink, Edit, Trash2, ImageIcon } from 'lucide-react';
import { LinkedProduct } from '@/types/linkedProduct.type';
import { getImageUrl } from '@/lib/utils/imageUrl';

interface AdminProductCardProps {
    product: LinkedProduct;
    imgError?: boolean;
    onImgError?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export const AdminProductCard: React.FC<AdminProductCardProps> = ({
    product,
    imgError,
    onImgError,
    onEdit,
    onDelete,
}) => {
    return (
        <div className="group overflow-hidden rounded-[var(--cn-radius-md)] border border-[var(--cn-border)] bg-[var(--cn-bg-card)] transition-all duration-300 hover:shadow-[var(--cn-shadow-md)]">
            <div className="relative h-40 overflow-hidden bg-[var(--cn-bg-section)]">
                {product.thumbnailUrl && !imgError ? (
                    <img
                        src={getImageUrl(product.thumbnailUrl)}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={onImgError}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--cn-primary)]/10">
                            <ImageIcon className="h-8 w-8 text-[var(--cn-text-muted)]" />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3">
                <h3 className="text-center text-sm font-semibold text-[var(--cn-text-main)] break-words">
                    {product.name}
                </h3>

                <div className="mt-3 flex gap-2">
                    <a
                        href={product.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center justify-center gap-1 rounded-[var(--cn-radius-sm)] bg-[var(--cn-primary)] px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--cn-primary-hover)]"
                    >
                        <ExternalLink className="h-3 w-3" />
                        <span>Truy cập</span>
                    </a>
                    <button
                        onClick={onEdit}
                        className="rounded-[var(--cn-radius-sm)] border border-[var(--cn-border)] px-2 py-1.5 text-[var(--cn-text-muted)] transition-colors hover:border-blue-500 hover:text-blue-500"
                    >
                        <Edit className="h-3 w-3" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="rounded-[var(--cn-radius-sm)] border border-[var(--cn-border)] px-2 py-1.5 text-[var(--cn-text-muted)] transition-colors hover:border-red-500 hover:text-red-500"
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </div>
    );
};
