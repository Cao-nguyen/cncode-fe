'use client';

import React, { useState, useEffect } from 'react';
import { Users, BarChart3, Plus, Search, Edit, Trash2, Eye, EyeOff, X, Building2, Image as ImageIcon, ImageOff, GraduationCap, Building } from 'lucide-react';
import { huongnghiepApi, HuongNghiep, HuongNghiepStats, Workplace, TrainingPlace } from '@/lib/api/huongnghiep.api';
import IndustryForm from '@/components/admin/huongnghiep/IndustryForm';
import WorkplaceForm from '@/components/admin/huongnghiep/WorkplaceForm';
import TrainingPlaceForm from '@/components/admin/huongnghiep/TrainingPlaceForm';
import { CustomButton } from '@/components/custom/CustomButton';
import { DashboardCard } from '@/components/custom/DashboardCard';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { CustomSelect } from '@/components/custom/CustomSelect';
import StaticContent from '@/components/common/StaticContent';

export default function HuongNghiepAdminPage() {
  const [stats, setStats] = useState<HuongNghiepStats>({
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    total: 0,
  });
  const [industries, setIndustries] = useState<HuongNghiep[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');

  const GROUP_FILTER_OPTIONS = [
    { value: 'all', label: 'Tất cả nhóm' },
    { value: 'A', label: 'A - Công nghệ' },
    { value: 'B', label: 'B - Sáng tạo' },
    { value: 'C', label: 'C - Xã hội' },
    { value: 'D', label: 'D - Kinh doanh' },
  ];
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showWorkplaceModal, setShowWorkplaceModal] = useState(false);
  const [showTrainingPlaceModal, setShowTrainingPlaceModal] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<HuongNghiep | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [industryToDelete, setIndustryToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'industries' | 'workplaces' | 'trainingPlaces'>('industries');
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [trainingPlaces, setTrainingPlaces] = useState<TrainingPlace[]>([]);
  const [selectedWorkplace, setSelectedWorkplace] = useState<Workplace | undefined>(undefined);
  const [selectedTrainingPlace, setSelectedTrainingPlace] = useState<TrainingPlace | undefined>(undefined);

  // Load industries data (only when on industries tab and filters change)
  useEffect(() => {
    const loadIndustriesData = async () => {
      try {
        setLoading(true);
        const [statsData, industriesData] = await Promise.all([
          huongnghiepApi.getStats(),
          huongnghiepApi.getAllIndustries({
            group: filterGroup === 'all' ? undefined : filterGroup,
            search: searchTerm || undefined,
          }),
        ]);
        setStats(statsData.data);
        setIndustries(industriesData.data);
      } catch (error) {
        console.error('Error loading industries:', error);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'industries') {
      loadIndustriesData();
    }
  }, [filterGroup, searchTerm]); // Remove activeTab from dependencies

  // Load workplaces data (only when on workplaces tab and not already loaded)
  useEffect(() => {
    if (activeTab === 'workplaces' && workplaces.length === 0) {
      const loadWorkplacesData = async () => {
        try {
          const workplacesData = await huongnghiepApi.getAllWorkplaces();
          setWorkplaces(workplacesData.data || []);
        } catch (error) {
          console.error('Error loading workplaces:', error);
          setWorkplaces([]);
        }
      };
      loadWorkplacesData();
    }
  }, [activeTab, workplaces.length]);

  // Load training places data (only when on training places tab and not already loaded)
  useEffect(() => {
    if (activeTab === 'trainingPlaces' && trainingPlaces.length === 0) {
      const loadTrainingPlacesData = async () => {
        try {
          const trainingPlacesData = await huongnghiepApi.getAllTrainingPlaces();
          setTrainingPlaces(trainingPlacesData.data || []);
        } catch (error) {
          console.error('Error loading training places:', error);
          setTrainingPlaces([]);
        }
      };
      loadTrainingPlacesData();
    }
  }, [activeTab, trainingPlaces.length]);

  // Unified loadData function for refreshing data
  const loadData = async (skipLoading = false) => {
    if (activeTab === 'industries') {
      try {
        if (!skipLoading) setLoading(true);
        const [statsData, industriesData] = await Promise.all([
          huongnghiepApi.getStats(),
          huongnghiepApi.getAllIndustries({
            group: filterGroup === 'all' ? undefined : filterGroup,
            search: searchTerm || undefined,
          }),
        ]);
        setStats(statsData.data);
        setIndustries(industriesData.data);
      } catch (error) {
        console.error('Error loading industries:', error);
      } finally {
        if (!skipLoading) setLoading(false);
      }
    } else if (activeTab === 'workplaces') {
      try {
        const workplacesData = await huongnghiepApi.getAllWorkplaces();
        setWorkplaces(workplacesData.data || []);
      } catch (error) {
        console.error('Error loading workplaces:', error);
        setWorkplaces([]);
      }
    } else if (activeTab === 'trainingPlaces') {
      try {
        const trainingPlacesData = await huongnghiepApi.getAllTrainingPlaces();
        setTrainingPlaces(trainingPlacesData.data || []);
      } catch (error) {
        console.error('Error loading training places:', error);
        setTrainingPlaces([]);
      }
    }
  };

  const handleDelete = async () => {
    if (!industryToDelete) return;

    try {
      await huongnghiepApi.deleteIndustry(industryToDelete);
      setShowDeleteModal(false);
      setIndustryToDelete(null);
      loadData(true);
    } catch (error) {
      console.error('Error deleting industry:', error);
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      await huongnghiepApi.togglePublish(id);
      loadData(true);
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[var(--cn-text-muted)]">Đang tải...</div>
      </div>
    );
  }

  const cardConfigs = [
    {
      key: 'total',
      title: 'Tổng ngành',
      value: stats.total,
      icon: <BarChart3 className="w-4 h-4" />,
      iconBgColor: '#EFF6FF',
      iconColor: '#3B82F6',
    },
    {
      key: 'A',
      title: 'Công nghệ',
      value: stats.A,
      icon: <span className="w-4 h-4 font-bold">A</span>,
      iconBgColor: '#DCFCE7',
      iconColor: '#16A34A',
    },
    {
      key: 'B',
      title: 'Sáng tạo',
      value: stats.B,
      icon: <span className="w-4 h-4 font-bold">B</span>,
      iconBgColor: '#FEF3C7',
      iconColor: '#D97706',
    },
    {
      key: 'C',
      title: 'Xã hội',
      value: stats.C,
      icon: <span className="w-4 h-4 font-bold">C</span>,
      iconBgColor: '#FCE7F3',
      iconColor: '#DB2777',
    },
    {
      key: 'D',
      title: 'Kinh doanh',
      value: stats.D,
      icon: <span className="w-4 h-4 font-bold">D</span>,
      iconBgColor: '#E0E7FF',
      iconColor: '#6366F1',
    },
  ];

  return (
    <div className="space-y-6 pb-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Quản lý Ngành Hướng nghiệp</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quản lý thông tin ngành nghề</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <CustomButton variant="outline" onClick={() => setShowWorkplaceModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo nơi làm việc
          </CustomButton>
          <CustomButton variant="outline" onClick={() => setShowTrainingPlaceModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo nơi đào tạo
          </CustomButton>
          <CustomButton onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo ngành mới
          </CustomButton>
        </div>
      </div>

      {/* Stats Cards */}
      {activeTab === 'industries' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {cardConfigs.map((card) => (
            <DashboardCard
              key={card.key}
              title={card.title}
              value={card.value}
              icon={card.icon}
              iconBgColor={card.iconBgColor}
              iconColor={card.iconColor}
            />
          ))}
        </div>
      )}

      {activeTab === 'workplaces' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardCard
            title="Tổng số nơi làm việc"
            value={workplaces.length}
            icon={<Building2 size={20} />}
            iconBgColor="#DBEAFE"
            iconColor="#2563EB"
          />
          <DashboardCard
            title="Có ảnh"
            value={workplaces.filter(wp => wp.image).length}
            icon={<ImageIcon size={20} />}
            iconBgColor="#FCE7F3"
            iconColor="#DB2777"
          />
          <DashboardCard
            title="Chưa có ảnh"
            value={workplaces.filter(wp => !wp.image).length}
            icon={<ImageOff size={20} />}
            iconBgColor="#F3F4F6"
            iconColor="#6B7280"
          />
        </div>
      )}

      {activeTab === 'trainingPlaces' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            title="Tổng số nơi đào tạo"
            value={trainingPlaces.length}
            icon={<GraduationCap size={20} />}
            iconBgColor="#DBEAFE"
            iconColor="#2563EB"
          />
          <DashboardCard
            title="Công lập"
            value={trainingPlaces.filter(tp => tp.type === 'Công lập').length}
            icon={<Building size={20} />}
            iconBgColor="#D1FAE5"
            iconColor="#059669"
          />
          <DashboardCard
            title="Tư thục"
            value={trainingPlaces.filter(tp => tp.type === 'Tư thục').length}
            icon={<Building2 size={20} />}
            iconBgColor="#FEF3C7"
            iconColor="#D97706"
          />
          <DashboardCard
            title="Có logo"
            value={trainingPlaces.filter(tp => tp.logo).length}
            icon={<ImageIcon size={20} />}
            iconBgColor="#FCE7F3"
            iconColor="#DB2777"
          />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('industries')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'industries'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Ngành nghề
        </button>
        <button
          onClick={() => setActiveTab('workplaces')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'workplaces'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Nơi làm việc
        </button>
        <button
          onClick={() => setActiveTab('trainingPlaces')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'trainingPlaces'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Nơi đào tạo
        </button>
      </div>

      {/* Filters - Only show on industries tab */}
      {activeTab === 'industries' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 sm:flex-[2]">
              <CustomInputSearch
                placeholder="Tìm kiếm ngành..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>
            <div className="sm:w-48">
              <CustomSelect
                options={GROUP_FILTER_OPTIONS}
                value={filterGroup}
                onChange={setFilterGroup}
              />
            </div>
          </div>
        </div>
      )}

      {/* Industry List */}
      {activeTab === 'industries' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Danh sách ngành</h2>
        </div>

        {industries.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-gray-500">
            Chưa có ngành nào
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {industries.map((industry) => (
              <div key={industry._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    {industry.thumbnail && (
                      <img
                        src={industry.thumbnail}
                        alt={industry.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-bold px-2 py-0.5 rounded bg-blue-500 text-white">
                          {industry.group}
                        </span>
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">{industry.name}</h3>
                        {!industry.isPublished && (
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                            Nháp
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {industry.overview.introduction}
                      </p>
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>Lương: {industry.overview.salaryMin} - {industry.overview.salaryMax} triệu</span>
                        <span>Nhu cầu: {industry.overview.demandLevel}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedIndustry(industry);
                        setShowPreviewModal(true);
                      }}
                      className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedIndustry(industry);
                        setIsEditing(true);
                        setShowCreateModal(true);
                      }}
                      className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500 transition-colors"
                      title="Sửa"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleTogglePublish(industry._id)}
                      className={`p-2 rounded-lg transition-colors ${
                        industry.isPublished
                          ? 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-500'
                          : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500'
                      }`}
                      title={industry.isPublished ? 'Ẩn' : 'Xuất bản'}
                    >
                      {industry.isPublished ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button
                      onClick={() => {
                        setIndustryToDelete(industry._id);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Workplace List */}
      {activeTab === 'workplaces' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Danh sách nơi làm việc</h2>
          </div>

          {workplaces.length === 0 ? (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500">
              Chưa có nơi làm việc nào
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {workplaces.map((workplace) => (
                <div key={workplace._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      {workplace.image && (
                        <img
                          src={workplace.image}
                          alt={workplace.name}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">{workplace.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{workplace.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedWorkplace(workplace);
                          setShowWorkplaceModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500 transition-colors"
                        title="Sửa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Bạn có chắc chắn muốn xóa nơi làm việc này?')) {
                            try {
                              await huongnghiepApi.deleteWorkplace(workplace._id!);
                              loadData();
                            } catch (error) {
                              console.error('Error deleting workplace:', error);
                            }
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Training Place List */}
      {activeTab === 'trainingPlaces' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Danh sách nơi đào tạo</h2>
          </div>

          {trainingPlaces.length === 0 ? (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500">
              Chưa có nơi đào tạo nào
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {trainingPlaces.map((place) => (
                <div key={place._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      {place.logo && (
                        <img
                          src={place.logo}
                          alt={place.name}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100">{place.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{place.location} - {place.region}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            {place.type}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                            {place.majorsCount} ngành
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedTrainingPlace(place);
                          setShowTrainingPlaceModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500 transition-colors"
                        title="Sửa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Bạn có chắc chắn muốn xóa nơi đào tạo này?')) {
                            try {
                              await huongnghiepApi.deleteTrainingPlace(place._id!);
                              loadData();
                            } catch (error) {
                              console.error('Error deleting training place:', error);
                            }
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Xác nhận xóa</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Bạn có chắc chắn muốn xóa ngành này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setIndustryToDelete(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <IndustryForm
          onClose={() => {
            setShowCreateModal(false);
            setSelectedIndustry(null);
            setIsEditing(false);
          }}
          onSuccess={() => {
            loadData(true);
            setShowCreateModal(false);
            setSelectedIndustry(null);
            setIsEditing(false);
          }}
          editData={isEditing ? selectedIndustry : undefined}
        />
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedIndustry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] mx-4 flex flex-col border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Chi tiết ngành: {selectedIndustry.name}</h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  {selectedIndustry.thumbnail && (
                    <img src={selectedIndustry.thumbnail} alt={selectedIndustry.name} className="w-32 h-32 rounded-lg object-cover" />
                  )}
                  <div>
                    <span className="text-sm font-bold px-2 py-0.5 rounded bg-blue-500 text-white">
                      {selectedIndustry.group}
                    </span>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-2">{selectedIndustry.name}</h3>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Giới thiệu</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedIndustry.overview.introduction}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Lương</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedIndustry.overview.salaryMin} - {selectedIndustry.overview.salaryMax} triệu</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Nhu cầu</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedIndustry.overview.demandLevel}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Ngành học làm gì?</h4>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                    {selectedIndustry.overview.whatIndustryDoes.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Kiến thức</h4>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                    {selectedIndustry.knowledge.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Yêu cầu</h4>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                    {selectedIndustry.requirements.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Kỹ năng</h4>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                    {selectedIndustry.skills.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                {selectedIndustry.expertAdvice && (
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Lời khuyên của chuyên gia</h4>
                    <StaticContent content={selectedIndustry.expertAdvice} className="text-gray-600 dark:text-gray-400" />
                  </div>
                )}

                {selectedIndustry.jobOpportunities && selectedIndustry.jobOpportunities.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Cơ hội việc làm</h4>
                    <div className="space-y-2">
                      {selectedIndustry.jobOpportunities.map((wp: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          {wp.image && <img src={wp.image} alt={wp.name} className="w-12 h-12 rounded object-cover" />}
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-100">{wp.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{wp.address}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedIndustry.trainingPlaces && selectedIndustry.trainingPlaces.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Nơi đào tạo</h4>
                    <div className="space-y-2">
                      {selectedIndustry.trainingPlaces.map((tp: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          {tp.logo && <img src={tp.logo} alt={tp.name} className="w-12 h-12 rounded object-cover" />}
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-100">{tp.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{tp.location} - {tp.region}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workplace Modal */}
      {showWorkplaceModal && (
        <WorkplaceForm
          onClose={() => {
            setShowWorkplaceModal(false);
            setSelectedWorkplace(undefined);
          }}
          onSuccess={() => {
            setShowWorkplaceModal(false);
            setSelectedWorkplace(undefined);
            loadData(true);
          }}
          editData={selectedWorkplace}
        />
      )}

      {/* Training Place Modal */}
      {showTrainingPlaceModal && (
        <TrainingPlaceForm
          onClose={() => {
            setShowTrainingPlaceModal(false);
            setSelectedTrainingPlace(undefined);
          }}
          onSuccess={() => {
            setShowTrainingPlaceModal(false);
            setSelectedTrainingPlace(undefined);
            loadData(true);
          }}
          editData={selectedTrainingPlace}
        />
      )}
    </div>
  );
}
