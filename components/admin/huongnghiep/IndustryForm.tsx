'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Upload } from 'lucide-react';
import { CustomTextarea } from '@/components/custom/CustomTextarea';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import CustomEditor from '@/components/custom/CustomEditor';
import { CustomButton } from '@/components/custom/CustomButton';
import { DeleteConfirmModal } from '@/components/common/DeleteConfirmModal';
import { huongnghiepApi, CreateHuongNghiepData, Workplace, TrainingPlace } from '@/lib/api/huongnghiep.api';

interface IndustryFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editData?: any;
}

const DEMAND_OPTIONS = [
  { value: 'Không cao', label: 'Không cao' },
  { value: 'Bình thường', label: 'Bình thường' },
  { value: 'Cao', label: 'Cao' },
  { value: 'Rất cao', label: 'Rất cao' },
];

const REGION_OPTIONS = [
  { value: 'Miền Bắc', label: 'Miền Bắc' },
  { value: 'Miền Trung', label: 'Miền Trung' },
  { value: 'Miền Nam', label: 'Miền Nam' },
];

const TYPE_OPTIONS = [
  { value: 'Tư thục', label: 'Tư thục' },
  { value: 'Công lập', label: 'Công lập' },
];

const GROUP_OPTIONS = [
  { value: 'A', label: 'A - Công nghệ' },
  { value: 'B', label: 'B - Sáng tạo' },
  { value: 'C', label: 'C - Xã hội' },
  { value: 'D', label: 'D - Kinh doanh' },
];

export default function IndustryForm({ onClose, onSuccess, editData }: IndustryFormProps) {
  const [activeTab, setActiveTab] = useState(1);
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState<'whatIndustryDoes' | 'knowledge' | 'requirements' | 'skills' | 'workplace' | 'trainingPlace' | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [availableWorkplaces, setAvailableWorkplaces] = useState<Workplace[]>([]);
  const [availableTrainingPlaces, setAvailableTrainingPlaces] = useState<TrainingPlace[]>([]);

  // Tab 1: Tổng quan
  const [formData, setFormData] = useState({
    name: '',
    group: 'A' as 'A' | 'B' | 'C' | 'D',
    overview: {
      introduction: '',
      salaryMin: '',
      salaryMax: '',
      demandLevel: 'Bình thường' as const,
      trainingDurationMin: '',
      trainingDurationMax: '',
      whatIndustryDoes: [''],
    },
    knowledge: [''],
    requirements: [''],
    skills: [''],
    expertAdvice: '',
    jobOpportunities: [] as Workplace[],
    trainingPlaces: [] as TrainingPlace[],
  });

  // Editor refs
  const expertAdviceEditorRef = React.useRef<any>(null);

  // Handle dynamic arrays (knowledge, requirements, skills)
  const handleArrayChange = (field: 'knowledge' | 'requirements' | 'skills', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayItem = (field: 'knowledge' | 'requirements' | 'skills') => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field: 'knowledge' | 'requirements' | 'skills', index: number) => {
    setDeleteType(field);
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const handleArrayKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: 'knowledge' | 'requirements' | 'skills', index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addArrayItem(field);
    }
  };

  // Save editor content when switching away from expert advice tab
  const handleTabChange = (newTab: number) => {
    if (activeTab === 5 && expertAdviceEditorRef.current) {
      const content = expertAdviceEditorRef.current.getContent();
      setFormData(prev => ({ ...prev, expertAdvice: content }));
    }
    setActiveTab(newTab);
  };

  // Restore expert advice content when switching to tab 5
  useEffect(() => {
    if (activeTab === 5 && expertAdviceEditorRef.current && formData.expertAdvice) {
      setTimeout(() => {
        expertAdviceEditorRef.current?.setContent(formData.expertAdvice);
      }, 100);
    }
  }, [activeTab]);

  // Load available workplaces and training places
  useEffect(() => {
    const loadAvailableData = async () => {
      try {
        const [workplacesData, trainingPlacesData] = await Promise.all([
          huongnghiepApi.getAllWorkplaces().catch(() => ({ data: [] })),
          huongnghiepApi.getAllTrainingPlaces().catch(() => ({ data: [] })),
        ]);
        setAvailableWorkplaces(workplacesData.data || []);
        setAvailableTrainingPlaces(trainingPlacesData.data || []);
      } catch (error) {
        console.error('Error loading available data:', error);
        setAvailableWorkplaces([]);
        setAvailableTrainingPlaces([]);
      }
    };
    loadAvailableData();
  }, []);

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        group: editData.group || 'A',
        overview: editData.overview || {
          introduction: '',
          salaryMin: '',
          salaryMax: '',
          demandLevel: 'Bình thường',
          trainingDurationMin: '',
          trainingDurationMax: '',
          whatIndustryDoes: [''],
        },
        knowledge: Array.isArray(editData.knowledge) ? editData.knowledge : (editData.knowledge ? [editData.knowledge] : ['']),
        requirements: Array.isArray(editData.requirements) ? editData.requirements : (editData.requirements ? [editData.requirements] : ['']),
        skills: Array.isArray(editData.skills) ? editData.skills : (editData.skills ? [editData.skills] : ['']),
        expertAdvice: editData.expertAdvice || '',
        jobOpportunities: editData.jobOpportunities || [],
        trainingPlaces: editData.trainingPlaces || [],
      });
      setThumbnail(editData.thumbnail || '');

      // Convert 0 to empty string for number fields
      if (editData.overview) {
        setFormData(prev => ({
          ...prev,
          overview: {
            ...prev.overview,
            salaryMin: editData.overview.salaryMin === 0 ? '' : (editData.overview.salaryMin || ''),
            salaryMax: editData.overview.salaryMax === 0 ? '' : (editData.overview.salaryMax || ''),
            trainingDurationMin: editData.overview.trainingDurationMin === 0 ? '' : (editData.overview.trainingDurationMin || ''),
            trainingDurationMax: editData.overview.trainingDurationMax === 0 ? '' : (editData.overview.trainingDurationMax || ''),
          }
        }));
      }
    }
  }, [editData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOverviewChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      overview: { ...prev.overview, [field]: value },
    }));
  };

  const handleWhatIndustryDoesChange = (index: number, value: string) => {
    const newWhatIndustryDoes = [...formData.overview.whatIndustryDoes];
    newWhatIndustryDoes[index] = value;
    handleOverviewChange('whatIndustryDoes', newWhatIndustryDoes);
  };

  const addWhatIndustryDoes = () => {
    handleOverviewChange('whatIndustryDoes', [...formData.overview.whatIndustryDoes, '']);
  };

  const removeWhatIndustryDoes = (index: number) => {
    setDeleteType('whatIndustryDoes');
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleting(true);
    if (deleteType === 'whatIndustryDoes' && deleteIndex !== null) {
      const newWhatIndustryDoes = formData.overview.whatIndustryDoes.filter((_, i) => i !== deleteIndex);
      handleOverviewChange('whatIndustryDoes', newWhatIndustryDoes);
    } else if (deleteType === 'knowledge' && deleteIndex !== null) {
      const newArray = formData.knowledge.filter((_, i) => i !== deleteIndex);
      setFormData(prev => ({ ...prev, knowledge: newArray }));
    } else if (deleteType === 'requirements' && deleteIndex !== null) {
      const newArray = formData.requirements.filter((_, i) => i !== deleteIndex);
      setFormData(prev => ({ ...prev, requirements: newArray }));
    } else if (deleteType === 'skills' && deleteIndex !== null) {
      const newArray = formData.skills.filter((_, i) => i !== deleteIndex);
      setFormData(prev => ({ ...prev, skills: newArray }));
    } else if (deleteType === 'workplace' && deleteIndex !== null) {
      setFormData(prev => ({
        ...prev,
        jobOpportunities: prev.jobOpportunities.filter((_, i) => i !== deleteIndex),
      }));
    } else if (deleteType === 'trainingPlace' && deleteIndex !== null) {
      setFormData(prev => ({
        ...prev,
        trainingPlaces: prev.trainingPlaces.filter((_, i) => i !== deleteIndex),
      }));
    }
    setShowDeleteModal(false);
    setDeleteType(null);
    setDeleteIndex(null);
    setIsDeleting(false);
  };

  const handleWhatIndustryDoesKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addWhatIndustryDoes();
    }
  };

  const removeWorkplace = (index: number) => {
    setDeleteType('workplace');
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const removeTrainingPlace = (index: number) => {
    setDeleteType('trainingPlace');
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnail(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const submitData: CreateHuongNghiepData = {
        name: formData.name,
        group: formData.group,
        thumbnail,
        overview: {
          ...formData.overview,
          whatIndustryDoes: formData.overview.whatIndustryDoes.filter(item => item.trim() !== ''),
        },
        knowledge: formData.knowledge.filter(item => item.trim() !== ''),
        requirements: formData.requirements.filter(item => item.trim() !== ''),
        skills: formData.skills.filter(item => item.trim() !== ''),
        expertAdvice: expertAdviceEditorRef.current?.getContent() || formData.expertAdvice,
        jobOpportunities: formData.jobOpportunities.filter(wp => wp.name.trim() !== ''),
        trainingPlaces: formData.trainingPlaces.filter(tp => tp.name.trim() !== ''),
      };

      if (editData) {
        await huongnghiepApi.updateIndustry(editData._id, submitData);
      } else {
        await huongnghiepApi.createIndustry(submitData);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving industry:', error);
      if (error?.response?.data?.errors) {
        alert('Lỗi validation:\n' + error.response.data.errors.join('\n'));
      } else {
        alert(error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi lưu ngành');
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 1, label: 'Tổng quan' },
    { id: 2, label: 'Kiến thức' },
    { id: 3, label: 'Yêu cầu' },
    { id: 4, label: 'Kỹ năng' },
    { id: 5, label: 'Lời khuyên' },
    { id: 6, label: 'Cơ hội việc làm' },
    { id: 7, label: 'Nơi đào tạo' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[var(--cn-bg-card)] rounded-lg w-full max-w-6xl h-[90vh] mx-4 flex flex-col border border-[var(--cn-border)]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--cn-border)]">
          <h2 className="text-lg font-bold text-[var(--cn-text-main)]">
            {editData ? 'Sửa ngành' : 'Tạo ngành mới'}
          </h2>
          <CustomButton
            variant="secondary"
            size="small"
            onClick={onClose}
          >
            <X size={20} />
          </CustomButton>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--cn-border)] overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-[var(--cn-text-muted)] hover:text-[var(--cn-text-main)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab 1: Tổng quan */}
          {activeTab === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <CustomInput
                  label="Tên ngành"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
                <CustomSelect
                  label="Nhóm"
                  options={GROUP_OPTIONS}
                  value={formData.group}
                  onChange={(value) => handleInputChange('group', value)}
                  required
                />
              </div>

              <CustomTextarea
                label="Giới thiệu ngành"
                value={formData.overview.introduction}
                onChange={(value) => handleOverviewChange('introduction', value)}
                rows={4}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <CustomInput
                  label="Lương tối thiểu (triệu)"
                  type="number"
                  value={formData.overview.salaryMin}
                  onChange={(e) => handleOverviewChange('salaryMin', e.target.value)}
                  required
                />
                <CustomInput
                  label="Lương tối đa (triệu)"
                  type="number"
                  value={formData.overview.salaryMax}
                  onChange={(e) => handleOverviewChange('salaryMax', e.target.value)}
                  required
                />
              </div>

              <CustomSelect
                label="Nhu cầu tuyển dụng"
                options={DEMAND_OPTIONS}
                value={formData.overview.demandLevel}
                onChange={(value) => handleOverviewChange('demandLevel', value)}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <CustomInput
                  label="Thời gian đào tạo tối thiểu (năm)"
                  type="number"
                  value={formData.overview.trainingDurationMin}
                  onChange={(e) => handleOverviewChange('trainingDurationMin', e.target.value)}
                  required
                />
                <CustomInput
                  label="Thời gian đào tạo tối đa (năm)"
                  type="number"
                  value={formData.overview.trainingDurationMax}
                  onChange={(e) => handleOverviewChange('trainingDurationMax', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-[var(--cn-text-sub)] mb-2 text-sm">
                  Ngành học làm gì?
                </label>
                <div className="space-y-2">
                  {formData.overview.whatIndustryDoes.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1">
                        <CustomInput
                          value={item}
                          onChange={(e) => handleWhatIndustryDoesChange(index, e.target.value)}
                          onKeyPress={(e) => handleWhatIndustryDoesKeyDown(e as any, index)}
                          placeholder="Nhập và nhấn + hoặc Enter để thêm"
                        />
                      </div>
                      {formData.overview.whatIndustryDoes.length > 1 && (
                        <button
                          onClick={() => removeWhatIndustryDoes(index)}
                          className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <CustomButton
                    variant="outline-primary"
                    size="small"
                    onClick={addWhatIndustryDoes}
                  >
                    <Plus size={16} />
                    Thêm mục
                  </CustomButton>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[var(--cn-text-sub)] mb-2 text-sm">
                  Ảnh thumbnail
                </label>
                <div className="border-2 border-dashed border-[var(--cn-border)] rounded-lg p-4 text-center">
                  {thumbnail ? (
                    <div className="relative inline-block">
                      <img src={thumbnail} alt="Thumbnail" className="max-h-40 rounded-lg" />
                      <button
                        onClick={() => setThumbnail('')}
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
                        id="thumbnail-upload"
                      />
                      <label
                        htmlFor="thumbnail-upload"
                        className="cursor-pointer text-[var(--cn-text-muted)] hover:text-[var(--cn-text-sub)]"
                      >
                        <Upload size={32} className="mx-auto mb-2" />
                        <p className="text-sm">Tải ảnh thumbnail lên</p>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Kiến thức */}
          {activeTab === 2 && (
            <div>
              <label className="block font-medium text-[var(--cn-text-sub)] mb-2 text-sm">
                Kiến thức
              </label>
              <div className="space-y-2">
                {formData.knowledge.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <CustomInput
                        value={item}
                        onChange={(e) => handleArrayChange('knowledge', index, e.target.value)}
                        onKeyPress={(e) => handleArrayKeyDown(e as any, 'knowledge', index)}
                        placeholder="Nhập kiến thức và nhấn + hoặc Enter để thêm"
                      />
                    </div>
                    {formData.knowledge.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('knowledge', index)}
                        className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <CustomButton
                  variant="outline-primary"
                  size="small"
                  onClick={() => addArrayItem('knowledge')}
                >
                  <Plus size={16} />
                  Thêm kiến thức
                </CustomButton>
              </div>
            </div>
          )}

          {/* Tab 3: Yêu cầu */}
          {activeTab === 3 && (
            <div>
              <label className="block font-medium text-[var(--cn-text-sub)] mb-2 text-sm">
                Yêu cầu
              </label>
              <div className="space-y-2">
                {formData.requirements.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <CustomInput
                        value={item}
                        onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                        onKeyPress={(e) => handleArrayKeyDown(e as any, 'requirements', index)}
                        placeholder="Nhập yêu cầu và nhấn + hoặc Enter để thêm"
                      />
                    </div>
                    {formData.requirements.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('requirements', index)}
                        className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <CustomButton
                  variant="outline-primary"
                  size="small"
                  onClick={() => addArrayItem('requirements')}
                >
                  <Plus size={16} />
                  Thêm yêu cầu
                </CustomButton>
              </div>
            </div>
          )}

          {/* Tab 4: Kỹ năng */}
          {activeTab === 4 && (
            <div>
              <label className="block font-medium text-[var(--cn-text-sub)] mb-2 text-sm">
                Kỹ năng
              </label>
              <div className="space-y-2">
                {formData.skills.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <CustomInput
                        value={item}
                        onChange={(e) => handleArrayChange('skills', index, e.target.value)}
                        onKeyPress={(e) => handleArrayKeyDown(e as any, 'skills', index)}
                        placeholder="Nhập kỹ năng và nhấn + hoặc Enter để thêm"
                      />
                    </div>
                    {formData.skills.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('skills', index)}
                        className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <CustomButton
                  variant="outline-primary"
                  size="small"
                  onClick={() => addArrayItem('skills')}
                >
                  <Plus size={16} />
                  Thêm kỹ năng
                </CustomButton>
              </div>
            </div>
          )}

          {/* Tab 5: Lời khuyên của chuyên gia */}
          {activeTab === 5 && (
            <div>
              <label className="block font-medium text-[var(--cn-text-sub)] mb-2 text-sm">
                Lời khuyên của chuyên gia
              </label>
              <CustomEditor
                ref={expertAdviceEditorRef}
                initialValue={formData.expertAdvice}
              />
            </div>
          )}

          {/* Tab 6: Cơ hội việc làm */}
          {activeTab === 6 && (
            <div className="space-y-6">
              <div>
                <label className="block font-medium text-[var(--cn-text-sub)] mb-2 text-sm">
                  Chọn nơi làm việc từ danh sách
                </label>
                <CustomSelect
                  placeholder="Tìm kiếm nơi làm việc..."
                  searchable
                  showAvatar
                  options={availableWorkplaces.map(wp => ({
                    value: wp._id || '',
                    label: wp.name,
                    avatar: wp.image || undefined
                  }))}
                  onChange={(value) => {
                    const selected = availableWorkplaces.find(wp => wp._id === value);
                    if (selected && !formData.jobOpportunities.some(wp => wp._id === selected._id)) {
                      setFormData(prev => ({
                        ...prev,
                        jobOpportunities: [...prev.jobOpportunities, selected],
                      }));
                    }
                  }}
                />
              </div>

              <div>
                <label className="block font-medium text-[var(--cn-text-sub)] mb-4 text-sm">
                  Nơi làm việc đã chọn
                </label>

                {formData.jobOpportunities.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 dark:text-gray-500 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    Chưa chọn nơi làm việc nào
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.jobOpportunities.map((workplace, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border border-[var(--cn-border)] rounded-lg">
                        {workplace.image && (
                          <img src={workplace.image} alt={workplace.name} className="w-12 h-12 rounded object-cover" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-[var(--cn-text-main)]">{workplace.name}</p>
                          <p className="text-sm text-[var(--cn-text-muted)]">{workplace.address}</p>
                        </div>
                        <button
                          onClick={() => removeWorkplace(index)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                          title="Xóa"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 7: Nơi đào tạo */}
          {activeTab === 7 && (
            <div className="space-y-6">
              <div>
                <label className="block font-medium text-[var(--cn-text-sub)] mb-2 text-sm">
                  Chọn nơi đào tạo từ danh sách
                </label>
                <CustomSelect
                  placeholder="Tìm kiếm nơi đào tạo..."
                  searchable
                  showAvatar
                  options={availableTrainingPlaces.map(tp => ({
                    value: tp._id || '',
                    label: tp.name,
                    avatar: tp.logo || undefined
                  }))}
                  onChange={(value) => {
                    const selected = availableTrainingPlaces.find(tp => tp._id === value);
                    if (selected && !formData.trainingPlaces.some(tp => tp._id === selected._id)) {
                      setFormData(prev => ({
                        ...prev,
                        trainingPlaces: [...prev.trainingPlaces, selected],
                      }));
                    }
                  }}
                />
              </div>

              <div>
                <label className="block font-medium text-[var(--cn-text-sub)] mb-4 text-sm">
                  Nơi đào tạo đã chọn
                </label>

                {formData.trainingPlaces.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 dark:text-gray-500 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    Chưa chọn nơi đào tạo nào
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.trainingPlaces.map((place, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border border-[var(--cn-border)] rounded-lg">
                        {place.logo && (
                          <img src={place.logo} alt={place.name} className="w-12 h-12 rounded object-cover" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-[var(--cn-text-main)]">{place.name}</p>
                          <p className="text-sm text-[var(--cn-text-muted)]">{place.location} - {place.region}</p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                              {place.type}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                              {place.majorsCount} ngành
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeTrainingPlace(index)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                          title="Xóa"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[var(--cn-border)]">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-[var(--cn-text-muted)] hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {tab.id}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
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
              {editData ? 'Cập nhật' : 'Tạo ngành'}
            </CustomButton>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteType(null);
          setDeleteIndex(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa mục này không?"
      />
    </div>
  );
}
