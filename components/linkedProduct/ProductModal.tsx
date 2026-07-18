import React, { useRef } from 'react';
import { X, Loader2, Upload, ImageIcon } from 'lucide-react';
import { CreateLinkedProductDto, LinkedProduct } from '@/types/linkedProduct.type';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomButton } from '@/components/custom/CustomButton';
import { uploadApi } from '@/lib/upload';
import { getImageUrl } from '@/lib/utils/imageUrl';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateLinkedProductDto) => Promise<void>;
    editingProduct?: LinkedProduct | null;
    submitting?: boolean;
}

export const ProductModal: React.FC<ProductModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    editingProduct,
    submitting = false,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = React.useState<CreateLinkedProductDto>({
        name: '',
        thumbnailUrl: '',
        productUrl: '',
    });
    const [uploading, setUploading] = React.useState(false);

    React.useEffect(() => {
        if (editingProduct) {
            setFormData({
                name: editingProduct.name,
                thumbnailUrl: editingProduct.thumbnailUrl || '',
                productUrl: editingProduct.productUrl,
            });
        } else {
            setFormData({
                name: '',
                thumbnailUrl: '',
                productUrl: '',
            });
        }
    }, [editingProduct, isOpen]);

    const handleFileUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file ảnh');
            return;
        }

        setUploading(true);
        try {
            const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(file);
            });

            const result = await uploadApi.uploadImage(base64, 'linked-products');

            if (result.success && result.url) {
                setFormData({ ...formData, thumbnailUrl: result.url });
            } else {
                alert(result.message || 'Upload ảnh thất bại');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Có lỗi khi upload ảnh');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.productUrl) {
            alert('Vui lòng nhập tên sản phẩm và URL');
            return;
        }
        await onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="w-full max-w-md rounded-[var(--cn-radius-lg)] bg-[var(--cn-bg-card)]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-[var(--cn-border)] p-5">
                    <h2 className="text-lg font-semibold text-[var(--cn-text-main)]">
                        {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
                    </h2>
                    <button onClick={onClose} className="rounded p-1 hover:bg-[var(--cn-hover)]">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4 p-5">
                    <CustomInput
                        label="Tên sản phẩm"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nhập tên sản phẩm"
                    />

                    <div>
                        <label className="mb-1.5 block text-[11px] font-medium text-[var(--cn-text-sub)] lg:text-[13px]">
                            Ảnh thumbnail
                        </label>
                        <div
                            className="relative cursor-pointer rounded-[var(--cn-radius-md)] border-2 border-dashed border-[var(--cn-border)] p-4 text-center transition-colors hover:border-[var(--cn-primary)]"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file);
                                }}
                            />

                            {uploading ? (
                                <div className="py-4">
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--cn-primary)]" />
                                    <p className="mt-2 text-sm text-[var(--cn-text-muted)]">Đang upload...</p>
                                </div>
                            ) : formData.thumbnailUrl ? (
                                <div className="relative">
                                    <img
                                        src={getImageUrl(formData.thumbnailUrl)}
                                        alt="preview"
                                        className="mx-auto max-h-32 rounded-md object-contain"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFormData({ ...formData, thumbnailUrl: '' });
                                        }}
                                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="py-4">
                                    <Upload className="mx-auto h-8 w-8 text-[var(--cn-text-muted)]" />
                                    <p className="mt-2 text-sm text-[var(--cn-text-muted)]">Click để chọn ảnh</p>
                                    <p className="text-xs text-[var(--cn-text-muted)]">PNG, JPG, JPEG (tối đa 5MB)</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <CustomInput
                        label="URL sản phẩm"
                        required
                        value={formData.productUrl}
                        onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                        placeholder="https://cncode.com/san-pham/..."
                    />
                </div>

                <div className="flex gap-3 p-5 pt-0">
                    <CustomButton variant="secondary" fullWidth onClick={onClose}>
                        Hủy
                    </CustomButton>
                    <CustomButton fullWidth onClick={handleSubmit} disabled={submitting || uploading} loading={submitting}>
                        {editingProduct ? 'Cập nhật' : 'Thêm mới'}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};
