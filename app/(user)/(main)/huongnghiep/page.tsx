'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase } from 'lucide-react';
import { huongnghiepApi, IndustryDetail } from '@/lib/api/huongnghiep.api';
import { IndustryCardSkeleton } from '@/components/ui/skeleton';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import Link from 'next/link';

export default function HuongNghiepPage() {
  const [industries, setIndustries] = useState<IndustryDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const adminRes = await huongnghiepApi.getAllIndustries({ limit: 100 });
      if (adminRes.success) {
        const transformed = adminRes.data.map((item: any) => ({
          _id: item._id,
          name: item.name,
          slug: item._id,
          group: 'Khác',
          thumbnail: item.image,
          overview: {
            salaryMin: item.salary,
            salaryMax: item.salary,
          },
          trainingPlaces: [],
          jobOpportunities: [],
          updatedAt: item.updatedAt || new Date().toISOString(),
        }));
        setIndustries(transformed);
      }
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter industries based on search
  const filteredIndustries = industries.filter(industry =>
    industry.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 pt-16 md:pt-14 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-6 lg:mb-6">
          <h1 className="text-3xl font-bold text-[var(--cn-text-main)] mb-2 uppercase">Hướng nghiệp</h1>
          <p className="text-[var(--cn-text-secondary)]">Khám phá các ngành nghề và cơ hội phát triển sự nghiệp</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <CustomInputSearch
            placeholder="Tìm kiếm ngành nghề..."
            value={searchQuery}
            onChange={setSearchQuery}
            size="medium"
            className="w-full"
          />
        </div>

        {/* Industry Grid */}
        {loading ? (
          <IndustryCardSkeleton count={12} />
        ) : filteredIndustries.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto text-[var(--cn-text-secondary)] mb-4" />
            <p className="text-[var(--cn-text-secondary)] text-lg">Không tìm thấy ngành nghề nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredIndustries.map((industry: IndustryDetail) => (
              <Link
                key={industry._id}
                href={`/huongnghiep/${industry.slug}`}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                  {/* Thumbnail */}
                  <div className="aspect-[16/10] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden">
                    {industry.thumbnail ? (
                      <img
                        src={industry.thumbnail}
                        alt={industry.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Briefcase className="w-16 h-16 text-blue-500 dark:text-blue-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-[var(--cn-text-main)] mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {industry.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
