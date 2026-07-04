'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { huongnghiepApi, HuongNghiep } from '@/lib/api/huongnghiep.api';
import StaticContent from '@/components/common/StaticContent';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function IndustryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [industry, setIndustry] = useState<HuongNghiep | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalItem, setModalItem] = useState<any>(null);
  const [modalType, setModalType] = useState<'workplace' | 'trainingPlace' | null>(null);

  useEffect(() => {
    const loadIndustry = async () => {
      try {
        setLoading(true);
        const response = await huongnghiepApi.getAllIndustries({ isPublished: true });
        const foundIndustry = response.data?.find((ind: HuongNghiep) => ind.slug === slug);
        
        if (foundIndustry) {
          setIndustry(foundIndustry);
        } else {
          setError('Không tìm thấy ngành nghề');
        }
      } catch (err) {
        console.error('Error loading industry:', err);
        setError('Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadIndustry();
    }
  }, [slug]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const scrollAmount = 200;
      tabsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-[var(--cn-text-muted)]">Đang tải...</div>
      </div>
    );
  }

  if (error || !industry) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 text-[var(--cn-text-muted)]">{error || 'Không tìm thấy ngành nghề'}</div>
      </div>
    );
  }

  // Define tabs based on available content
  const availableTabs = [
    { id: 'overview', label: 'Tổng quan', hasContent: true },
    { id: 'knowledge', label: 'Kiến thức', hasContent: industry.knowledge && industry.knowledge.length > 0 },
    { id: 'requirements', label: 'Yêu cầu', hasContent: industry.requirements && industry.requirements.length > 0 },
    { id: 'skills', label: 'Kỹ năng', hasContent: industry.skills && industry.skills.length > 0 },
    { id: 'advice', label: 'Lời khuyên', hasContent: !!industry.expertAdvice },
    { id: 'opportunities', label: 'Việc làm', hasContent: industry.jobOpportunities && industry.jobOpportunities.length > 0 },
    { id: 'training', label: 'Đào tạo', hasContent: industry.trainingPlaces && industry.trainingPlaces.length > 0 },
  ].filter(tab => tab.hasContent);

  const renderTabContent = () => {
    const currentTab = availableTabs[activeTab]?.id;

    switch (currentTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {industry.overview?.introduction && (
              <div>
                <h3 className="text-lg font-bold text-[var(--cn-text-main)] mb-3">Giới thiệu chung</h3>
                <p className="text-[var(--cn-text-sub)] leading-relaxed">{industry.overview.introduction}</p>
              </div>
            )}

            {/* 3-column grid for salary, demand, training duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(industry.overview?.salaryMin || industry.overview?.salaryMax) && (
                <div className="bg-[var(--cn-bg-section)] p-4 rounded-lg border border-[var(--cn-border)]">
                  <p className="text-sm text-[var(--cn-text-muted)] mb-1">Mức lương</p>
                  <p className="font-bold text-[var(--cn-text-main)]">
                    {industry.overview.salaryMin && industry.overview.salaryMax
                      ? `${industry.overview.salaryMin} - ${industry.overview.salaryMax} tr/tháng`
                      : industry.overview.salaryMin
                      ? `Từ ${industry.overview.salaryMin} tr/tháng`
                      : industry.overview.salaryMax
                      ? `Đến ${industry.overview.salaryMax} tr/tháng`
                      : ''}
                  </p>
                </div>
              )}
              {industry.overview?.demandLevel && (
                <div className="bg-[var(--cn-bg-section)] p-4 rounded-lg border border-[var(--cn-border)]">
                  <p className="text-sm text-[var(--cn-text-muted)] mb-1">Nhu cầu tuyển dụng</p>
                  <p className="font-bold text-[var(--cn-text-main)]">{industry.overview.demandLevel}</p>
                </div>
              )}
              {(industry.overview?.trainingDurationMin || industry.overview?.trainingDurationMax) && (
                <div className="bg-[var(--cn-bg-section)] p-4 rounded-lg border border-[var(--cn-border)]">
                  <p className="text-sm text-[var(--cn-text-muted)] mb-1">Thời gian đào tạo</p>
                  <p className="font-bold text-[var(--cn-text-main)]">
                    {industry.overview.trainingDurationMin && industry.overview.trainingDurationMax
                      ? `${industry.overview.trainingDurationMin} - ${industry.overview.trainingDurationMax} năm`
                      : industry.overview.trainingDurationMin
                      ? `Từ ${industry.overview.trainingDurationMin} năm`
                      : industry.overview.trainingDurationMax
                      ? `Đến ${industry.overview.trainingDurationMax} năm`
                      : ''}
                  </p>
                </div>
              )}
            </div>

            {industry.overview?.whatIndustryDoes && industry.overview.whatIndustryDoes.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-[var(--cn-text-main)] mb-3">Ngành học làm gì?</h3>
                <ul className="space-y-2">
                  {industry.overview.whatIndustryDoes.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[var(--cn-text-sub)]">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'knowledge':
        return (
          <ul className="space-y-3">
            {industry.knowledge?.map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-[var(--cn-text-sub)]">
                <span className="text-green-500 mt-1">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );

      case 'requirements':
        return (
          <ul className="space-y-3">
            {industry.requirements?.map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-[var(--cn-text-sub)]">
                <span className="text-orange-500 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );

      case 'skills':
        return (
          <ul className="space-y-3">
            {industry.skills?.map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-[var(--cn-text-sub)]">
                <span className="text-purple-500 mt-1">★</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );

      case 'advice':
        return <StaticContent content={industry.expertAdvice || ''} className="text-[var(--cn-text-sub)]" />;

      case 'opportunities':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {industry.jobOpportunities?.map((wp: any, index: number) => (
              <div
                key={index}
                onClick={() => {
                  setModalItem(wp);
                  setModalType('workplace');
                  setShowModal(true);
                }}
                className="flex items-center gap-3 p-4 bg-[var(--cn-bg-section)] rounded-lg border border-[var(--cn-border)] cursor-pointer hover:shadow-md transition-shadow"
              >
                {wp.image && <img src={wp.image} alt={wp.name} className="max-w-16 max-h-16 rounded object-contain" />}
                <div className="flex-1">
                  <p className="font-medium text-[var(--cn-text-main)]">{wp.name}</p>
                  <p className="text-sm text-[var(--cn-text-muted)]">{wp.address}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'training':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {industry.trainingPlaces?.map((tp: any, index: number) => (
              <div
                key={index}
                onClick={() => {
                  setModalItem(tp);
                  setModalType('trainingPlace');
                  setShowModal(true);
                }}
                className="flex items-center gap-3 p-4 bg-[var(--cn-bg-section)] rounded-lg border border-[var(--cn-border)] cursor-pointer hover:shadow-md transition-shadow"
              >
                {tp.logo && <img src={tp.logo} alt={tp.name} className="max-w-16 max-h-16 rounded object-contain" />}
                <div className="flex-1">
                  <p className="font-medium text-[var(--cn-text-main)]">{tp.name}</p>
                  <p className="text-sm text-[var(--cn-text-muted)]">{tp.location}</p>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    {tp.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 text-sm text-[var(--cn-text-muted)] hover:text-[var(--cn-text-main)] transition-colors"
        >
          ← Quay lại
        </button>
        
        {industry.thumbnail && (
          <img
            src={industry.thumbnail}
            alt={industry.name}
            className="w-full h-48 md:h-64 object-cover rounded-lg mb-4"
          />
        )}
        
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--cn-text-main)] mb-2">{industry.name}</h1>
        <div className="flex items-center gap-2 text-sm text-[var(--cn-text-muted)]">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
            Nhóm {industry.group}
          </span>
          <span>•</span>
          <span>Cập nhật: {new Date(industry.updatedAt).toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          {/* Left Arrow - Mobile/Tablet */}
          <button
            onClick={() => scrollTabs('left')}
            className="md:hidden p-2 rounded-lg bg-[var(--cn-bg-card)] border border-[var(--cn-border)] hover:bg-[var(--cn-bg-section)] transition-colors flex-shrink-0"
          >
            <ChevronLeft size={20} className="text-[var(--cn-text-muted)]" />
          </button>

          {/* Tabs Container */}
          <div className="flex-1 min-w-0">
            <div
              ref={tabsRef}
              className="overflow-x-auto scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex pr-2">
                {availableTabs.map((tab, index) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(index)}
                    className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === index
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-[var(--cn-text-muted)] hover:text-[var(--cn-text-main)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Full width border line */}
            <div className="border-b border-[var(--cn-border)]"></div>
          </div>

          {/* Right Arrow - Mobile/Tablet */}
          <button
            onClick={() => scrollTabs('right')}
            className="md:hidden p-2 rounded-lg bg-[var(--cn-bg-card)] border border-[var(--cn-border)] hover:bg-[var(--cn-bg-section)] transition-colors flex-shrink-0"
          >
            <ChevronRight size={20} className="text-[var(--cn-text-muted)]" />
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-[var(--cn-bg-card)] rounded-lg p-6 border border-[var(--cn-border)]">
        {renderTabContent()}
      </div>

      {/* Modal */}
      {showModal && modalItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--cn-bg-card)] rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-[var(--cn-text-main)]">
                  {modalType === 'workplace' ? 'Thông tin nơi làm việc' : 'Thông tin nơi đào tạo'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-[var(--cn-bg-section)] rounded-lg transition-colors"
                >
                  <X size={20} className="text-[var(--cn-text-muted)]" />
                </button>
              </div>

              {modalType === 'workplace' ? (
                <div className="space-y-4">
                  {modalItem.image && (
                    <img
                      src={modalItem.image}
                      alt={modalItem.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[var(--cn-text-muted)] mb-1">Tên</p>
                      <p className="font-medium text-[var(--cn-text-main)]">{modalItem.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--cn-text-muted)] mb-1">Địa chỉ</p>
                      <p className="text-[var(--cn-text-sub)]">{modalItem.address}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {modalItem.logo && (
                    <img
                      src={modalItem.logo}
                      alt={modalItem.name}
                      className="w-full h-48 object-contain rounded-lg"
                    />
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[var(--cn-text-muted)] mb-1">Tên</p>
                      <p className="font-medium text-[var(--cn-text-main)]">{modalItem.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--cn-text-muted)] mb-1">Địa điểm</p>
                      <p className="text-[var(--cn-text-sub)]">{modalItem.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--cn-text-muted)] mb-1">Khu vực</p>
                      <p className="text-[var(--cn-text-sub)]">{modalItem.region}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[var(--cn-text-muted)] mb-1">Loại hình</p>
                      <p className="text-[var(--cn-text-sub)]">{modalItem.type}</p>
                    </div>
                    {modalItem.strengths && (
                      <div className="col-span-2">
                        <p className="text-sm text-[var(--cn-text-muted)] mb-1">Điểm mạnh</p>
                        <p className="text-[var(--cn-text-sub)]">{modalItem.strengths}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-[var(--cn-text-muted)] mb-1">Số ngành</p>
                      <p className="text-[var(--cn-text-sub)]">{modalItem.majorsCount} ngành</p>
                    </div>
                    {(modalItem.tuitionMin || modalItem.tuitionMax) && (
                      <div>
                        <p className="text-sm text-[var(--cn-text-muted)] mb-1">Học phí</p>
                        <p className="text-[var(--cn-text-sub)]">
                          {modalItem.tuitionMin && modalItem.tuitionMax
                            ? `${modalItem.tuitionMin} - ${modalItem.tuitionMax} triệu/năm`
                            : modalItem.tuitionMin
                            ? `Từ ${modalItem.tuitionMin} triệu/năm`
                            : modalItem.tuitionMax
                            ? `Đến ${modalItem.tuitionMax} triệu/năm`
                            : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
