'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { huongnghiepApi, IndustryDetail, TrainingPlace } from '@/lib/api/huongnghiep.api';
import StaticContent from '@/components/common/StaticContent';
import { Briefcase, Home, Calendar, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';

export default function IndustryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [industry, setIndustry] = useState<IndustryDetail | null>(null);
  const [allIndustries, setAllIndustries] = useState<IndustryDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [activeRegion, setActiveRegion] = useState('all');
  const [trainingPlaces, setTrainingPlaces] = useState<TrainingPlace[]>([]);

  useEffect(() => {
    const loadIndustry = async () => {
      try {
        setLoading(true);
        // Use admin endpoint directly since public endpoint doesn't exist yet
        const adminRes = await huongnghiepApi.getAllIndustries({ limit: 100 });

        if (adminRes.success) {
          // Transform all industries
          const transformed = adminRes.data.map((item: any) => ({
            _id: item._id,
            name: item.name,
            slug: item._id,
            group: 'Khác',
            thumbnail: item.image,
            overview: {
              introduction: item.basicInfo,
              careerPath: item.careerPath,
              salary: item.salary,
            },
            expertAdvice: item.expertAdvice,
            knowledge: [],
            requirements: [],
            skills: [],
            jobOpportunities: [],
            trainingPlaces: [],
            updatedAt: item.updatedAt || new Date().toISOString(),
          }));
          setAllIndustries(transformed);

          // Find current industry
          const foundIndustry = transformed.find((ind: any) => ind._id === slug);

          if (foundIndustry) {
            setIndustry(foundIndustry);
            // Update document title dynamically
            document.title = `${foundIndustry.name} - Hướng nghiệp - CNcode`;
          } else {
            setError('Không tìm thấy ngành nghề');
          }
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

    const loadTrainingPlaces = async () => {
      try {
        const res = await huongnghiepApi.getAllTrainingPlaces({ limit: 100 });
        if (res.success) {
          setTrainingPlaces(res.data);
        }
      } catch (err) {
        console.error('Error loading training places:', err);
      }
    };

    if (slug) {
      loadIndustry();
      loadTrainingPlaces();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 md:pt-8 pb-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Content Skeleton */}
            <div className="lg:col-span-2">
              {/* Breadcrumb Skeleton */}
              <div className="mb-6 flex items-center gap-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
              
              {/* Header Skeleton */}
              <div className="mb-6">
                <div className="h-8 w-3/4 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>

              {/* Tabs Skeleton */}
              <div className="mb-6">
                <div className="flex gap-4 border-b border-gray-200 pb-3">
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>

              {/* Tab Content Skeleton */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="space-y-4">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>

              {/* Training Places Section Skeleton */}
              <div className="mt-8">
                <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
                
                {/* Region Tabs Skeleton */}
                <div className="mb-6">
                  <div className="p-1 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-1">
                      <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                      <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                      <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                      <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Training Places Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 bg-gray-200 rounded animate-pulse flex-shrink-0" />
                        <div className="flex-1">
                          <div className="h-4 w-3/4 bg-gray-200 rounded mb-2 animate-pulse" />
                          <div className="h-3 w-1/2 bg-gray-200 rounded mb-2 animate-pulse" />
                          <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar Skeleton */}
            <div className="space-y-6 sticky top-24 self-start">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto" />
            </div>
          </div>
        </div>
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
    { id: 'career', label: 'Công việc', hasContent: !!industry.overview?.careerPath },
    { id: 'salary', label: 'Mức lương', hasContent: !!industry.overview?.salary },
    { id: 'advice', label: 'Lời khuyên', hasContent: !!industry.expertAdvice },
  ].filter(tab => tab.hasContent);

  const renderTabContent = () => {
    const currentTab = availableTabs[activeTab]?.id;

    switch (currentTab) {
      case 'overview':
        return (
          <div className="prose prose-gray max-w-none">
            <StaticContent content={industry.overview?.introduction || ''} />
          </div>
        );

      case 'career':
        return (
          <div className="prose prose-gray max-w-none">
            <StaticContent content={industry.overview?.careerPath || ''} />
          </div>
        );

      case 'salary':
        return (
          <div className="prose prose-gray max-w-none">
            <StaticContent content={industry.overview?.salary || ''} />
          </div>
        );

      case 'advice':
        return (
          <div className="text-gray-700 leading-relaxed">
            <StaticContent content={industry.expertAdvice || ''} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 md:pt-14 lg:pt-8 pb-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-600 mb-6">
          <Link href="/" className="flex items-center gap-1 hover:text-gray-900 transition">
            <Home className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Trang chủ</span>
            <span className="sm:hidden">Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
          <Link href="/huongnghiep" className="hover:text-gray-900 transition">
            Hướng nghiệp
          </Link>
          <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
          <span className="text-gray-900 font-medium truncate max-w-[120px] sm:max-w-xs md:max-w-xs">
            {industry?.name}
          </span>
        </nav>

        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{industry?.name}</h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{new Date(industry?.updatedAt || '').toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Industry Content */}
          <div className="lg:col-span-2">
            {/* Tabs Navigation */}
            <div className="mb-6">
              <div className="p-1 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-1">
                  {availableTabs.map((tab, index) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(index)}
                      className={`px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap rounded-md ${activeTab === index
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {renderTabContent()}
            </div>

            {/* Training Places Section */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Nơi đào tạo</h3>
              
              {/* Region Tabs */}
              <div className="mb-6">
                <div className="p-1 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-1">
                    {[
                      { id: 'all', label: 'Tất cả' },
                      { id: 'Miền Bắc', label: 'Bắc' },
                      { id: 'Miền Trung', label: 'Trung' },
                      { id: 'Miền Nam', label: 'Nam' },
                    ].map((region) => (
                      <button
                        key={region.id}
                        onClick={() => setActiveRegion(region.id)}
                        className={`px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap rounded-md ${activeRegion === region.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {region.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Training Places Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trainingPlaces
                  .filter(tp => activeRegion === 'all' || tp.region === activeRegion)
                  .map((tp) => (
                    <div key={tp._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        {tp.logo && (
                          <img src={tp.logo} alt={tp.name} className="w-16 h-16 object-contain rounded flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 mb-1">{tp.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{tp.province}</p>
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-600">
                            {tp.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                {trainingPlaces.filter(tp => activeRegion === 'all' || tp.region === activeRegion).length === 0 && (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    Chưa có nơi đào tạo nào
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6 sticky top-24 self-start">
            {/* Other Industries */}
            <>
              <h3 className="text-lg font-semibold text-gray-800 uppercase">CÁC NGÀNH KHÁC</h3>
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                {allIndustries.filter((ind) => ind._id !== industry?._id).length > 0 ? (
                  allIndustries
                    .filter((ind) => ind._id !== industry?._id)
                    .slice(0, 4)
                    .map((otherIndustry) => (
                      <Link
                        key={otherIndustry._id}
                        href={`/huongnghiep/${otherIndustry.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          {otherIndustry.thumbnail ? (
                            <img
                              src={otherIndustry.thumbnail}
                              alt={otherIndustry.name}
                              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Briefcase className="w-8 h-8 text-blue-500" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 mb-1">
                              {otherIndustry.name}
                            </h4>
                          </div>
                        </div>
                      </Link>
                    ))
                ) : (
                  <p className="text-sm text-gray-600 text-center py-4">Chưa có ngành khác</p>
                )}
              </div>
              {allIndustries.filter((ind) => ind._id !== industry?._id).length > 0 && (
                <Link
                  href="/huongnghiep"
                  className="block text-center text-sm text-blue-600 hover:underline"
                >
                  Xem tất cả
                </Link>
              )}
            </>
          </div>
        </div>
      </div>
    </div>
  );
}
