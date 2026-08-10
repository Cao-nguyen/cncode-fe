'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Briefcase, GraduationCap, X, Upload, X as XIcon, Edit2, Trash2, Eye, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Check } from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomSelect } from '@/components/custom/CustomSelect';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';
import { huongnghiepApi, TrainingPlace, Industry } from '@/lib/api/huongnghiep.api';
import { uploadApi } from '@/lib/upload';
import { toast } from 'sonner';
import { TableSkeleton, IndustryCardSkeleton } from '@/components/ui/skeleton';

const PROVINCES = [
  { value: 'Hà Nội', label: 'Hà Nội' },
  { value: 'Hải Phòng', label: 'Hải Phòng' },
  { value: 'Huế', label: 'Huế' },
  { value: 'Đà Nẵng', label: 'Đà Nẵng' },
  { value: 'Cần Thơ', label: 'Cần Thơ' },
  { value: 'Thành phố Hồ Chí Minh', label: 'Thành phố Hồ Chí Minh' },
  { value: 'Cao Bằng', label: 'Cao Bằng' },
  { value: 'Tuyên Quang', label: 'Tuyên Quang' },
  { value: 'Lào Cai', label: 'Lào Cai' },
  { value: 'Điện Biên', label: 'Điện Biên' },
  { value: 'Lai Châu', label: 'Lai Châu' },
  { value: 'Sơn La', label: 'Sơn La' },
  { value: 'Lạng Sơn', label: 'Lạng Sơn' },
  { value: 'Thái Nguyên', label: 'Thái Nguyên' },
  { value: 'Phú Thọ', label: 'Phú Thọ' },
  { value: 'Bắc Ninh', label: 'Bắc Ninh' },
  { value: 'Quảng Ninh', label: 'Quảng Ninh' },
  { value: 'Hưng Yên', label: 'Hưng Yên' },
  { value: 'Ninh Bình', label: 'Ninh Bình' },
  { value: 'Thanh Hóa', label: 'Thanh Hóa' },
  { value: 'Nghệ An', label: 'Nghệ An' },
  { value: 'Hà Tĩnh', label: 'Hà Tĩnh' },
  { value: 'Quảng Trị', label: 'Quảng Trị' },
  { value: 'Quảng Ngãi', label: 'Quảng Ngãi' },
  { value: 'Gia Lai', label: 'Gia Lai' },
  { value: 'Đắk Lắk', label: 'Đắk Lắk' },
  { value: 'Khánh Hòa', label: 'Khánh Hòa' },
  { value: 'Lâm Đồng', label: 'Lâm Đồng' },
  { value: 'Đồng Nai', label: 'Đồng Nai' },
  { value: 'Tây Ninh', label: 'Tây Ninh' },
  { value: 'Đồng Tháp', label: 'Đồng Tháp' },
  { value: 'Vĩnh Long', label: 'Vĩnh Long' },
  { value: 'Cà Mau', label: 'Cà Mau' },
  { value: 'An Giang', label: 'An Giang' }
];

const REGION_OPTIONS = [
  { value: 'Miền Bắc', label: 'Miền Bắc' },
  { value: 'Miền Trung', label: 'Miền Trung' },
  { value: 'Miền Nam', label: 'Miền Nam' },
];

const TYPE_OPTIONS = [
  { value: 'Công lập', label: 'Công lập' },
  { value: 'Tư thục', label: 'Tư thục' },
];

const PAGINATION_OPTIONS = [5, 10, 25, 50];

export default function HuongNghiepAdminPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'industries' | 'training'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTrainingPlaceModal, setShowTrainingPlaceModal] = useState(false);
  const [showIndustryModal, setShowIndustryModal] = useState(false);
  const [trainingPlaces, setTrainingPlaces] = useState<TrainingPlace[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isPerPageOpen, setIsPerPageOpen] = useState(false);

  // Training place states
  const [logo, setLogo] = useState('');
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [province, setProvince] = useState('');
  const [type, setType] = useState('Công lập');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingTrainingPlace, setEditingTrainingPlace] = useState<TrainingPlace | null>(null);
  const [viewTrainingPlace, setViewTrainingPlace] = useState<TrainingPlace | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<TrainingPlace | null>(null);

  // Industry states
  const [industryImage, setIndustryImage] = useState('');
  const [industryName, setIndustryName] = useState('');
  const [isIndustryUploading, setIsIndustryUploading] = useState(false);
  const [isIndustrySubmitting, setIsIndustrySubmitting] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null);
  const [industryCurrentPage, setIndustryCurrentPage] = useState(1);
  const [industryItemsPerPage, setIndustryItemsPerPage] = useState(8);
  const [isIndustryPerPageOpen, setIsIndustryPerPageOpen] = useState(false);

  const editorRef = useRef<CustomEditorRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const perPageDropdownRef = useRef<HTMLDivElement>(null);
  const industryPerPageDropdownRef = useRef<HTMLDivElement>(null);
  const industryFileInputRef = useRef<HTMLInputElement>(null);
  const industryBasicInfoRef = useRef<CustomEditorRef>(null);
  const industryCareerPathRef = useRef<CustomEditorRef>(null);
  const industryExpertAdviceRef = useRef<CustomEditorRef>(null);
  const industrySalaryRef = useRef<CustomEditorRef>(null);

  // Fetch all training places once
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await huongnghiepApi.getAllTrainingPlaces({});
        if (res.success) {
          setTrainingPlaces(res.data);
        } else {
          toast.error(res.message || 'Không thể tải danh sách');
        }
      } catch (error) {
        console.error('Fetch training places error:', error);
        toast.error('Không thể tải danh sách nơi đào tạo');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch all industries once
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const res = await huongnghiepApi.getAllIndustries({});
        if (res.success) {
          setIndustries(res.data);
        } else {
          toast.error(res.message || 'Không thể tải danh sách ngành nghề');
        }
      } catch (error) {
        console.error('Fetch industries error:', error);
        toast.error('Không thể tải danh sách ngành nghề');
      }
    };

    fetchIndustries();
  }, []);

  // Client-side pagination
  const totalPages = Math.ceil(trainingPlaces.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPlaces = trainingPlaces.slice(startIndex, endIndex);

  // Industry pagination
  const industryTotalPages = Math.ceil(industries.length / industryItemsPerPage);
  const industryStartIndex = (industryCurrentPage - 1) * industryItemsPerPage;
  const industryEndIndex = industryStartIndex + industryItemsPerPage;
  const paginatedIndustries = industries.slice(industryStartIndex, industryEndIndex);

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleIndustryItemsPerPageChange = (newItemsPerPage: number) => {
    setIndustryItemsPerPage(newItemsPerPage);
    setIndustryCurrentPage(1);
  };

  const handleIndustryPageChange = (newPage: number) => {
    setIndustryCurrentPage(newPage);
  };

  const handleLogoUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const result = await uploadApi.uploadImage(base64, 'huongnghiep');
      if (result.success && result.url) {
        setLogo(result.url);
        toast.success('Upload logo thành công');
      } else {
        toast.error(result.message || 'Upload thất bại');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Lỗi upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveTrainingPlace = async () => {
    console.log('Current values:', { name, region, province, type });

    if (!name || !region || !province) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const content = editorRef.current?.getContent() || '';
    if (!content.trim() || content === '<p><br></p>') {
      toast.error('Vui lòng nhập giới thiệu');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        logo,
        name,
        region: region as 'Miền Bắc' | 'Miền Trung' | 'Miền Nam',
        province,
        type: type as 'Công lập' | 'Tư thục',
        description: content,
      };
      console.log('Sending payload:', payload);

      if (editingTrainingPlace) {
        const res = await huongnghiepApi.updateTrainingPlace(editingTrainingPlace._id, payload);
        toast.success('Cập nhật nơi đào tạo thành công');
        // Update local state
        setTrainingPlaces(prev => prev.map(place =>
          place._id === editingTrainingPlace._id ? res.data : place
        ));
      } else {
        const res = await huongnghiepApi.createTrainingPlace(payload);
        toast.success('Tạo nơi đào tạo thành công');
        // Add to local state (prepend)
        setTrainingPlaces(prev => [res.data, ...prev]);
      }

      setShowTrainingPlaceModal(false);
      setEditingTrainingPlace(null);
      // Reset form
      setLogo('');
      setName('');
      setRegion('');
      setProvince('');
      setType('Công lập');
      setTimeout(() => editorRef.current?.setContent(''), 100);
    } catch (error) {
      console.error('Create training place error:', error);
      toast.error('Không thể tạo nơi đào tạo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTrainingPlace = (place: TrainingPlace) => {
    setEditingTrainingPlace(place);
    setLogo(place.logo);
    setName(place.name);
    setRegion(place.region);
    setProvince(place.province);
    setType(place.type);
    setTimeout(() => editorRef.current?.setContent(place.description), 100);
    setShowTrainingPlaceModal(true);
  };

  const handleDeleteTrainingPlace = async () => {
    if (!deleteConfirm) return;
    try {
      await huongnghiepApi.deleteTrainingPlace(deleteConfirm._id);
      toast.success('Xóa nơi đào tạo thành công');
      // Remove from local state
      setTrainingPlaces(prev => prev.filter(place => place._id !== deleteConfirm._id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Delete training place error:', error);
      toast.error('Không thể xóa nơi đào tạo');
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTrainingPlace(null);
    setLogo('');
    setName('');
    setRegion('');
    setProvince('');
    setType('Công lập');
    setTimeout(() => editorRef.current?.setContent(''), 100);
    setShowTrainingPlaceModal(true);
  };

  const handleOpenIndustryModal = () => {
    setEditingIndustry(null);
    setIndustryImage('');
    setIndustryName('');
    setShowIndustryModal(true);
  };

  const handleIndustryImageUpload = async (file: File) => {
    setIsIndustryUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const result = await uploadApi.uploadImage(base64, 'huongnghiep');
      if (result.success && result.url) {
        setIndustryImage(result.url);
        toast.success('Upload hình ảnh thành công');
      } else {
        toast.error(result.message || 'Upload thất bại');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Lỗi upload');
    } finally {
      setIsIndustryUploading(false);
    }
  };

  const handleIndustryNextStep = () => {
    // Removed - no more steps
  };

  const handleIndustryPrevStep = () => {
    // Removed - no more steps
  };

  const handleSaveIndustry = async () => {
    setIsIndustrySubmitting(true);
    try {
      const payload = {
        image: industryImage,
        name: industryName,
        basicInfo: industryBasicInfoRef.current?.getContent() || '',
        careerPath: industryCareerPathRef.current?.getContent() || '',
        expertAdvice: industryExpertAdviceRef.current?.getContent() || '',
        salary: industrySalaryRef.current?.getContent() || '',
      };

      if (editingIndustry) {
        const res = await huongnghiepApi.updateIndustry(editingIndustry._id, payload);
        toast.success('Cập nhật ngành nghề thành công');
        setIndustries(prev => prev.map(ind =>
          ind._id === editingIndustry._id ? res.data : ind
        ));
      } else {
        const res = await huongnghiepApi.createIndustry(payload);
        toast.success('Tạo ngành nghề thành công');
        setIndustries(prev => [res.data, ...prev]);
      }

      setShowIndustryModal(false);
      setEditingIndustry(null);
      setIndustryImage('');
      setIndustryName('');
    } catch (error) {
      console.error('Create industry error:', error);
      toast.error('Không thể tạo ngành nghề');
    } finally {
      setIsIndustrySubmitting(false);
    }
  };

  const handleEditIndustry = (industry: Industry) => {
    setEditingIndustry(industry);
    setIndustryImage(industry.image || '');
    setIndustryName(industry.name || '');
    setTimeout(() => {
      industryBasicInfoRef.current?.setContent(industry.basicInfo || '');
      industryCareerPathRef.current?.setContent(industry.careerPath || '');
      industryExpertAdviceRef.current?.setContent(industry.expertAdvice || '');
      industrySalaryRef.current?.setContent(industry.salary || '');
    }, 100);
    setShowIndustryModal(true);
  };

  const handleDeleteIndustry = async (industry: Industry) => {
    if (confirm(`Bạn có chắc muốn xóa ngành nghề "${industry.name}"?`)) {
      try {
        await huongnghiepApi.deleteIndustry(industry._id);
        toast.success('Xóa ngành nghề thành công');
        setIndustries(prev => prev.filter(ind => ind._id !== industry._id));
      } catch (error) {
        console.error('Delete industry error:', error);
        toast.error('Không thể xóa ngành nghề');
      }
    }
  };

  return (
    <div className="space-y-6 pb-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Quản lý hướng nghiệp</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quản lý ngành nghề và nơi đào tạo</p>
        </div>
        <CustomButton onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo bản ghi
        </CustomButton>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 overflow-y-auto h-screen w-screen">
          <div className="bg-white dark:bg-gray-950 rounded-lg max-w-lg w-full p-6 my-auto mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Chọn loại bản ghi</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  handleOpenIndustryModal();
                }}
                className="group p-6 border-2 border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-md"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Ngành nghề</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tạo thông tin về các ngành nghề</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  handleOpenCreateModal();
                }}
                className="group p-6 border-2 border-gray-200 dark:border-gray-800 rounded-lg hover:border-green-500 dark:hover:border-green-500 transition-all hover:shadow-md"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                    <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Nơi đào tạo</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tạo thông tin về nơi đào tạo</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Training Place Modal */}
      {showTrainingPlaceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 overflow-y-auto h-screen w-screen">
          <div className="bg-white dark:bg-gray-950 rounded-lg max-w-2xl w-full my-auto max-h-[90vh] flex flex-col mx-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{editingTrainingPlace ? 'Cập nhật nơi đào tạo' : 'Tạo nơi đào tạo'}</h2>
              <button
                onClick={() => {
                  setShowTrainingPlaceModal(false);
                  setEditingTrainingPlace(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {/* Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Logo nơi đào tạo
                  </label>
                  <div className="w-full">
                    {logo ? (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img
                          src={logo}
                          alt="Logo"
                          className="w-full h-full object-contain bg-gray-50 dark:bg-gray-800"
                        />
                        <button
                          type="button"
                          onClick={() => setLogo('')}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition"
                      >
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {isUploading ? 'Đang upload...' : 'Tải lên logo nơi đào tạo'}
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleLogoUpload(file);
                          }}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Tên nơi đào tạo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tên nơi đào tạo
                  </label>
                  <CustomInput
                    placeholder="Nhập tên nơi đào tạo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Khu vực */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Khu vực
                  </label>
                  <CustomSelect
                    placeholder="Chọn khu vực"
                    value={region}
                    onChange={setRegion}
                    options={REGION_OPTIONS}
                  />
                </div>

                {/* Loại hình */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Loại hình
                  </label>
                  <CustomSelect
                    placeholder="Chọn loại hình"
                    value={type}
                    onChange={(value) => {
                      console.log('Type changed:', value);
                      setType(value);
                    }}
                    options={TYPE_OPTIONS}
                  />
                </div>

                {/* Tỉnh/TP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tỉnh/Thành phố
                  </label>
                  <CustomSelect
                    placeholder="Chọn tỉnh/thành phố"
                    value={province}
                    onChange={setProvince}
                    options={PROVINCES}
                    searchable
                  />
                </div>

                {/* Giới thiệu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Giới thiệu chung về nơi đào tạo
                  </label>
                  <CustomEditor ref={editorRef} />
                </div>
              </div>
            </div>

            {/* Buttons - Fixed at bottom */}
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-b-lg">
              <CustomButton
                onClick={handleSaveTrainingPlace}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Đang lưu...' : (editingTrainingPlace ? 'Cập nhật' : 'Lưu')}
              </CustomButton>
              <CustomButton
                onClick={() => {
                  setShowTrainingPlaceModal(false);
                  setEditingTrainingPlace(null);
                }}
                variant="outline"
                className="flex-1"
                disabled={isSubmitting}
              >
                Hủy
              </CustomButton>
            </div>
          </div>
        </div>
      )}

      {/* Industry Modal - Step by Step */}
      {showIndustryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 overflow-y-auto h-screen w-screen">
          <div className="bg-white dark:bg-gray-950 rounded-lg max-w-3xl w-full my-auto max-h-[90vh] flex flex-col mx-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{editingIndustry ? 'Cập nhật ngành nghề' : 'Tạo ngành nghề'}</h2>
              <button
                onClick={() => {
                  setShowIndustryModal(false);
                  setEditingIndustry(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {/* Hình ảnh */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hình ảnh ngành nghề
                  </label>
                  <div className="w-full">
                    {industryImage ? (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img
                          src={industryImage}
                          alt="Industry"
                          className="w-full h-full object-contain bg-gray-50 dark:bg-gray-800"
                        />
                        <button
                          type="button"
                          onClick={() => setIndustryImage('')}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => industryFileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition"
                      >
                        <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {isIndustryUploading ? 'Đang upload...' : 'Tải lên hình ảnh ngành nghề'}
                        </p>
                        <input
                          ref={industryFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleIndustryImageUpload(file);
                          }}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Tên ngành nghề */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tên ngành nghề
                  </label>
                  <CustomInput
                    placeholder="Nhập tên ngành nghề"
                    value={industryName}
                    onChange={(e) => setIndustryName(e.target.value)}
                  />
                </div>

                {/* Cơ bản về ngành nghề */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cơ bản về ngành nghề
                  </label>
                  <CustomEditor ref={industryBasicInfoRef} />
                </div>

                {/* Học xong làm gì */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Học xong làm gì?
                  </label>
                  <CustomEditor ref={industryCareerPathRef} />
                </div>

                {/* Lời khuyên từ chuyên gia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lời khuyên từ chuyên gia
                  </label>
                  <CustomEditor ref={industryExpertAdviceRef} />
                </div>

                {/* Mức lương */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mức lương
                  </label>
                  <CustomEditor ref={industrySalaryRef} />
                </div>
              </div>
            </div>

            {/* Buttons - Fixed at bottom */}
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-b-lg">
              <CustomButton
                onClick={() => {
                  setShowIndustryModal(false);
                  setEditingIndustry(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Hủy
              </CustomButton>
              <CustomButton
                onClick={handleSaveIndustry}
                disabled={isIndustrySubmitting}
                className="flex-1"
              >
                {isIndustrySubmitting ? 'Đang lưu...' : 'Lưu'}
              </CustomButton>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="p-1 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg inline-flex overflow-x-auto w-full">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap rounded-md ${activeTab === 'all'
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/30'
              }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActiveTab('industries')}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap rounded-md ${activeTab === 'industries'
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/30'
              }`}
          >
            Ngành nghề
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap rounded-md ${activeTab === 'training'
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/30'
              }`}
          >
            Nơi đào tạo
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'all' && (
        <>
          {/* Industries Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Ngành nghề</h2>
              <button
                onClick={() => setActiveTab('industries')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Xem tất cả
              </button>
            </div>
            <div>
              {loading ? (
                <IndustryCardSkeleton count={4} />
              ) : industries.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">Chưa có ngành nghề nào</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {industries.slice(0, 4).map((industry) => (
                      <div key={industry._id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition">
                        <div className="aspect-[3/2] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          {industry.image ? (
                            <img src={industry.image} alt={industry.name} className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-sm text-gray-500 dark:text-gray-400">N/A</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 line-clamp-2">{industry.name}</h3>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditIndustry(industry)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md transition"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteIndustry(industry)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md transition"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Training Places Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Nơi đào tạo</h2>
              <button
                onClick={() => setActiveTab('training')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Xem tất cả
              </button>
            </div>
            <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
              {loading ? (
                <TableSkeleton rows={5} cols={6} />
              ) : trainingPlaces.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">Chưa có nơi đào tạo nào</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Logo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tên</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Khu vực</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tỉnh/TP</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Loại hình</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {trainingPlaces.slice(0, 5).map((place) => (
                        <tr key={place._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                          <td className="px-4 py-3">
                            {place.logo ? (
                              <img src={place.logo} alt={place.name} className="w-10 h-10 object-contain rounded" />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-500 dark:text-gray-400">N/A</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{place.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{place.region}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{place.province}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${place.type === 'Công lập'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              }`}>
                              {place.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setViewTrainingPlace(place)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md transition"
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditTrainingPlace(place)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md transition"
                                title="Chỉnh sửa"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(place)}
                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md transition"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'industries' && (
        <>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Danh sách ngành nghề</h2>
          {/* Industries Grid */}
          {loading ? (
            <IndustryCardSkeleton count={8} />
          ) : industries.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Chưa có ngành nghề nào</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedIndustries.map((industry) => (
                  <div key={industry._id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition">
                    <div className="aspect-[3/2] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      {industry.image ? (
                        <img src={industry.image} alt={industry.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">N/A</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 line-clamp-2">{industry.name}</h3>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditIndustry(industry)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md transition"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteIndustry(industry)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md transition"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Industry Pagination */}
              {industries.length > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Hiển thị</span>
                    <div className="relative" ref={industryPerPageDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsIndustryPerPageOpen(!isIndustryPerPageOpen)}
                        className="min-w-[60px] px-3 py-1 text-sm font-medium border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:outline-none cursor-pointer flex items-center justify-between gap-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400"
                      >
                        <span>{industryItemsPerPage}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${isIndustryPerPageOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isIndustryPerPageOpen && (
                        <div className="absolute z-[9999] w-full bottom-full mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                          {PAGINATION_OPTIONS.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                handleIndustryItemsPerPageChange(option);
                                setIsIndustryPerPageOpen(false);
                              }}
                              className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors"
                            >
                              <span className="text-gray-900 dark:text-gray-100">{option}</span>
                              {industryItemsPerPage === option && (
                                <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <span>{industryStartIndex + 1} - {Math.min(industryEndIndex, industries.length)} của {industries.length} bản ghi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Về trang đầu */}
                    <button
                      onClick={() => handleIndustryPageChange(1)}
                      disabled={industryCurrentPage === 1}
                      className="p-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      title="Trang đầu"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>

                    {/* Lùi 1 trang */}
                    <button
                      onClick={() => handleIndustryPageChange(Math.max(1, industryCurrentPage - 1))}
                      disabled={industryCurrentPage === 1}
                      className="p-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Hiển thị trang hiện tại / tổng trang */}
                    <div className="px-3 py-1.5 text-sm font-medium rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      {industryCurrentPage} / {industryTotalPages}
                    </div>

                    {/* Tới 1 trang */}
                    <button
                      onClick={() => handleIndustryPageChange(Math.min(industryTotalPages, industryCurrentPage + 1))}
                      disabled={industryCurrentPage === industryTotalPages}
                      className="p-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Về trang cuối */}
                    <button
                      onClick={() => handleIndustryPageChange(industryTotalPages)}
                      disabled={industryCurrentPage === industryTotalPages}
                      className="p-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      title="Trang cuối"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeTab === 'training' && (
        <>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Danh sách nơi đào tạo</h2>
          {/* Training Places List */}
          <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            {loading ? (
              <TableSkeleton rows={10} cols={6} />
            ) : trainingPlaces.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">Chưa có nơi đào tạo nào</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Logo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tên</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Khu vực</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tỉnh/TP</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Loại hình</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedPlaces.map((place) => (
                      <tr key={place._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <td className="px-4 py-3">
                          {place.logo ? (
                            <img src={place.logo} alt={place.name} className="w-10 h-10 object-contain rounded" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-500 dark:text-gray-400">N/A</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{place.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{place.region}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{place.province}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${place.type === 'Công lập'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                            {place.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setViewTrainingPlace(place)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md transition"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditTrainingPlace(place)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md transition"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(place)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md transition"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {trainingPlaces.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>Hiển thị</span>
                  <div className="relative" ref={perPageDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsPerPageOpen(!isPerPageOpen)}
                      className="min-w-[60px] px-3 py-1 text-sm font-medium border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all duration-200 focus:outline-none cursor-pointer flex items-center justify-between gap-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400"
                    >
                      <span>{itemsPerPage}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${isPerPageOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isPerPageOpen && (
                      <div className="absolute z-[9999] w-full bottom-full mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                        {PAGINATION_OPTIONS.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              handleItemsPerPageChange(option);
                              setIsPerPageOpen(false);
                            }}
                            className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between transition-colors"
                          >
                            <span className="text-gray-900 dark:text-gray-100">{option}</span>
                            {itemsPerPage === option && (
                              <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span>{startIndex + 1} - {Math.min(endIndex, trainingPlaces.length)} của {trainingPlaces.length} bản ghi</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Về trang đầu */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    title="Trang đầu"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  {/* Lùi 1 trang */}
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Hiển thị trang hiện tại / tổng trang */}
                  <div className="px-3 py-1.5 text-sm font-medium rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    {currentPage} / {totalPages}
                  </div>

                  {/* Tới 1 trang */}
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Về trang cuối */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    title="Trang cuối"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* View Detail Modal */}
      {viewTrainingPlace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 overflow-y-auto h-screen w-screen">
          <div className="bg-white dark:bg-gray-950 rounded-lg max-w-2xl w-full p-6 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Chi tiết nơi đào tạo</h2>
              <button
                onClick={() => setViewTrainingPlace(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {viewTrainingPlace.logo && (
                <div className="flex justify-center">
                  <img src={viewTrainingPlace.logo} alt={viewTrainingPlace.name} className="max-w-full h-48 object-contain rounded-lg" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tên nơi đào tạo</label>
                <p className="text-gray-900 dark:text-gray-100">{viewTrainingPlace.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Khu vực</label>
                  <p className="text-gray-900 dark:text-gray-100">{viewTrainingPlace.region}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tỉnh/Thành phố</label>
                  <p className="text-gray-900 dark:text-gray-100">{viewTrainingPlace.province}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Loại hình</label>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${viewTrainingPlace.type === 'Công lập'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                  {viewTrainingPlace.type}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Giới thiệu</label>
                <div className="prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100" dangerouslySetInnerHTML={{ __html: viewTrainingPlace.description }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 overflow-y-auto h-screen w-screen">
          <div className="bg-white dark:bg-gray-950 rounded-lg max-w-md w-full p-6 my-auto">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Xác nhận xóa</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Bạn có chắc chắn muốn xóa nơi đào tạo {deleteConfirm.name}?
            </p>
            <div className="flex gap-3">
              <CustomButton
                onClick={handleDeleteTrainingPlace}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Xóa
              </CustomButton>
              <CustomButton
                onClick={() => setDeleteConfirm(null)}
                variant="outline"
                className="flex-1"
              >
                Hủy
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
