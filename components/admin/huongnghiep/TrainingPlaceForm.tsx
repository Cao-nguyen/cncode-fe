'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { CustomButton } from '@/components/custom/CustomButton';
import { huongnghiepApi, TrainingPlace } from '@/lib/api/huongnghiep.api';

interface TrainingPlaceFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editData?: TrainingPlace;
}

const REGION_OPTIONS = [
  { value: 'Miền Bắc', label: 'Miền Bắc' },
  { value: 'Miền Trung', label: 'Miền Trung' },
  { value: 'Miền Nam', label: 'Miền Nam' },
];

const TYPE_OPTIONS = [
  { value: 'Tư thục', label: 'Tư thục' },
  { value: 'Công lập', label: 'Công lập' },
];

export default function TrainingPlaceForm({ onClose, onSuccess, editData }: TrainingPlaceFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TrainingPlace>({
    logo: '',
    name: '',
    strengths: '',
    location: '',
    region: 'Miền Bắc',
    type: 'Tư thục',
    majorsCount: 1,
    tuitionMin: 0,
    tuitionMax: 0,
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
      setFormData(prev => ({ ...prev, logo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (editData?._id) {
        await huongnghiepApi.updateTrainingPlace(editData._id, formData);
      } else {
        await huongnghiepApi.createTrainingPlace(formData);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving training place:', error);
      alert(error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi lưu nơi đào tạo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[var(--cn-bg-card)] rounded-[var(--cn-radius-md)] w-full max-w-2xl shadow-[var(--cn-shadow-lg)] flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-[var(--cn-border)]">
          <h2 className="text-lg font-bold text-[var(--cn-text-main)]">
            {editData ? 'Sửa nơi đào tạo' : 'Tạo nơi đào tạo mới'}
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
              Tên trường *
            </label>
            <CustomInput
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nhập tên trường"
            />
          </div>

          <div>
            <label className="block font-medium text-[var(--cn-text-sub)] mb-2 text-sm">
              Điểm mạnh
            </label>
            <CustomInput
              value={formData.strengths}
              onChange={(e) => setFormData(prev => ({ ...prev, strengths: e.target.value }))}
              placeholder="Nhập điểm mạnh"
            />
          </div>

          <div>
            <label className="block font-medium text-[var(--cn-text-sub)] mb-2 text-sm">
              Địa điểm
            </label>
            <CustomInput
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Nhập địa điểm"
            />
          </div>

          <div>
            <label className="block font-medium text-[var(--cn-text-sub)] mb-2 text-sm">
              Khu vực
            </label>
            <CustomSelect
              options={REGION_OPTIONS}
              value={formData.region}
              onChange={(value) => setFormData(prev => ({ ...prev, region: value as any }))}
            />
          </div>

          <div>
            <label className="block font-medium text-[var(--cn-text-sub)] mb-2 text-sm">
              Loại hình
            </label>
            <CustomSelect
              options={TYPE_OPTIONS}
              value={formData.type}
              onChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-[var(--cn-text-sub)] mb-2 text-sm">
                Số ngành học
              </label>
              <CustomInput
                type="number"
                value={formData.majorsCount}
                onChange={(e) => setFormData(prev => ({ ...prev, majorsCount: parseInt(e.target.value) || 0 }))}
                placeholder="Số ngành học"
              />
            </div>
            <div>
              <label className="block font-medium text-[var(--cn-text-sub)] mb-2 text-sm">
                Học phí tối thiểu (triệu)
              </label>
              <CustomInput
                type="number"
                value={formData.tuitionMin}
                onChange={(e) => setFormData(prev => ({ ...prev, tuitionMin: parseInt(e.target.value) || 0 }))}
                placeholder="Học phí tối thiểu"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[var(--cn-text-sub)] mb-2 text-sm">
              Học phí tối đa (triệu)
            </label>
            <CustomInput
              type="number"
              value={formData.tuitionMax}
              onChange={(e) => setFormData(prev => ({ ...prev, tuitionMax: parseInt(e.target.value) || 0 }))}
              placeholder="Học phí tối đa"
            />
          </div>

          <div>
            <label className="block font-medium text-[var(--cn-text-sub)] mb-2 text-sm">
              Logo
            </label>
            <div className="border-2 border-dashed border-[var(--cn-border)] rounded-lg p-4 text-center">
              {formData.logo ? (
                <div className="relative inline-block">
                  <img src={formData.logo} alt="Logo" className="max-h-48 rounded-lg" />
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, logo: '' }))}
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
                    id="trainingplace-logo"
                  />
                  <label
                    htmlFor="trainingplace-logo"
                    className="cursor-pointer text-[var(--cn-text-muted)] hover:text-[var(--cn-text-sub)]"
                  >
                    <Upload size={24} className="mx-auto mb-2" />
                    <p className="text-sm">Tải logo lên</p>
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
            {editData ? 'Cập nhật' : 'Tạo nơi đào tạo'}
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
