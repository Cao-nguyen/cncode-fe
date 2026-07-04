'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomButton } from '@/components/custom/CustomButton';
import { huongnghiepApi, Workplace } from '@/lib/api/huongnghiep.api';

interface WorkplaceFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editData?: Workplace;
}

export default function WorkplaceForm({ onClose, onSuccess, editData }: WorkplaceFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Workplace>({
    image: '',
    name: '',
    address: '',
  });

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    }
  }, [editData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (editData?._id) {
        await huongnghiepApi.updateWorkplace(editData._id, formData);
      } else {
        await huongnghiepApi.createWorkplace(formData);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving workplace:', error);
      alert(error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi lưu nơi làm việc');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] w-full max-w-2xl shadow-[var(--cn-shadow-lg)] flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-[var(--cn-border)]">
          <h2 className="text-lg font-bold text-[var(--cn-text-main)]">
            {editData ? 'Sửa nơi làm việc' : 'Tạo nơi làm việc mới'}
          </h2>
          <CustomButton
            variant="secondary"
            size="small"
            onClick={onClose}
          >
            <X size={20} />
          </CustomButton>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block font-medium text-[var(--cn-text-sub)] mb-2 text-sm">
              Tên nơi làm việc *
            </label>
            <CustomInput
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nhập tên nơi làm việc"
            />
          </div>

          <div>
            <label className="block font-medium text-[var(--cn-text-sub)] mb-2 text-sm">
              Địa chỉ
            </label>
            <CustomInput
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Nhập địa chỉ"
            />
          </div>

          <div>
            <label className="block font-medium text-[var(--cn-text-sub)] mb-2 text-sm">
              Ảnh
            </label>
            <div className="border-2 border-dashed border-[var(--cn-border)] rounded-lg p-4 text-center">
              {formData.image ? (
                <div className="relative inline-block">
                  <img src={formData.image} alt="Workplace" className="max-h-48 rounded-lg" />
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="workplace-image"
                  />
                  <label
                    htmlFor="workplace-image"
                    className="cursor-pointer text-[var(--cn-text-muted)] hover:text-[var(--cn-text-sub)]"
                  >
                    <Upload size={24} className="mx-auto mb-2" />
                    <p className="text-sm">Tải ảnh lên</p>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-4 pt-0">
          <CustomButton
            variant="outline"
            onClick={onClose}
          >
            Hủy
          </CustomButton>
          <CustomButton
            onClick={handleSubmit}
            disabled={loading}
            loading={loading}
          >
            {editData ? 'Cập nhật' : 'Tạo nơi làm việc'}
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
