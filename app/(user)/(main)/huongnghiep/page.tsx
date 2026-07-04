'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { huongnghiepApi, HuongNghiep, TrainingPlace } from '@/lib/api/huongnghiep.api';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { CustomSelect } from '@/components/custom/CustomSelect';
import { X } from 'lucide-react';
import { Skeleton, CardSkeleton, TrainingPlaceSkeleton, IndustrySkeleton } from '@/components/common/Skeleton';

interface Question {
  id: number;
  group: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

const questions: Question[] = [
  {
    id: 1,
    group: 'Nhóm 1. Sở thích (Câu 1–4)',
    question: 'Nếu có một ngày rảnh hoàn toàn, bạn sẽ chọn làm gì?',
    options: {
      A: 'Tự học lập trình hoặc tìm hiểu công nghệ mới.',
      B: 'Thiết kế ảnh, vẽ hoặc chỉnh sửa video.',
      C: 'Tham gia hoạt động tình nguyện hoặc giúp đỡ mọi người.',
      D: 'Bán hàng hoặc thử kinh doanh một món đồ.',
    },
  },
  {
    id: 2,
    group: 'Nhóm 1. Sở thích (Câu 1–4)',
    question: 'Bạn thích môn học nào nhất?',
    options: {
      A: 'Tin học, Toán.',
      B: 'Mỹ thuật, Ngữ văn.',
      C: 'Sinh học, Giáo dục công dân.',
      D: 'Kinh tế và Pháp luật.',
    },
  },
  {
    id: 3,
    group: 'Nhóm 1. Sở thích (Câu 1–4)',
    question: 'Bạn thích làm việc theo cách nào?',
    options: {
      A: 'Giải quyết vấn đề bằng logic.',
      B: 'Nghĩ ra ý tưởng mới.',
      C: 'Làm việc với con người.',
      D: 'Lập kế hoạch và quản lý công việc.',
    },
  },
  {
    id: 4,
    group: 'Nhóm 1. Sở thích (Câu 1–4)',
    question: 'Điều gì khiến bạn hứng thú nhất?',
    options: {
      A: 'Công nghệ mới.',
      B: 'Sáng tạo sản phẩm.',
      C: 'Giúp người khác phát triển.',
      D: 'Xây dựng một dự án hoặc doanh nghiệp.',
    },
  },
  {
    id: 5,
    group: 'Nhóm 2. Khả năng (Câu 5–8)',
    question: 'Bạn tự tin nhất về điều gì?',
    options: {
      A: 'Phân tích và giải quyết vấn đề.',
      B: 'Sáng tạo.',
      C: 'Giao tiếp.',
      D: 'Lãnh đạo.',
    },
  },
  {
    id: 6,
    group: 'Nhóm 2. Khả năng (Câu 5–8)',
    question: 'Khi gặp một vấn đề khó, bạn thường...',
    options: {
      A: 'Tìm nguyên nhân và phân tích.',
      B: 'Nghĩ nhiều cách giải quyết mới.',
      C: 'Hỏi ý kiến người khác.',
      D: 'Lập kế hoạch xử lý.',
    },
  },
  {
    id: 7,
    group: 'Nhóm 2. Khả năng (Câu 5–8)',
    question: 'Bạn thường được bạn bè khen là...',
    options: {
      A: 'Thông minh, tư duy tốt.',
      B: 'Có óc nghệ thuật.',
      C: 'Dễ gần, biết lắng nghe.',
      D: 'Có khả năng tổ chức.',
    },
  },
  {
    id: 8,
    group: 'Nhóm 2. Khả năng (Câu 5–8)',
    question: 'Trong một dự án nhóm, bạn muốn làm gì?',
    options: {
      A: 'Phần kỹ thuật.',
      B: 'Thiết kế.',
      C: 'Hỗ trợ và kết nối mọi người.',
      D: 'Trưởng nhóm.',
    },
  },
  {
    id: 9,
    group: 'Nhóm 3. Môi trường làm việc (Câu 9–12)',
    question: 'Bạn thích làm việc ở đâu?',
    options: {
      A: 'Văn phòng công nghệ.',
      B: 'Studio sáng tạo.',
      C: 'Trường học hoặc bệnh viện.',
      D: 'Doanh nghiệp.',
    },
  },
  {
    id: 10,
    group: 'Nhóm 3. Môi trường làm việc (Câu 9–12)',
    question: 'Bạn thích công việc...',
    options: {
      A: 'Có nhiều thử thách về tư duy.',
      B: 'Được tự do sáng tạo.',
      C: 'Có ý nghĩa với cộng đồng.',
      D: 'Có cơ hội phát triển và thu nhập cao.',
    },
  },
  {
    id: 11,
    group: 'Nhóm 3. Môi trường làm việc (Câu 9–12)',
    question: 'Bạn thích làm việc...',
    options: {
      A: 'Với máy tính.',
      B: 'Với hình ảnh và ý tưởng.',
      C: 'Với con người.',
      D: 'Với khách hàng và đối tác.',
    },
  },
  {
    id: 12,
    group: 'Nhóm 3. Môi trường làm việc (Câu 9–12)',
    question: 'Bạn muốn nơi làm việc của mình...',
    options: {
      A: 'Hiện đại, nhiều công nghệ.',
      B: 'Thoải mái và sáng tạo.',
      C: 'Thân thiện.',
      D: 'Chuyên nghiệp và năng động.',
    },
  },
  {
    id: 13,
    group: 'Nhóm 4. Giá trị nghề nghiệp (Câu 13–16)',
    question: 'Bạn mong muốn điều gì nhất từ công việc tương lai?',
    options: {
      A: 'Được tạo ra sản phẩm công nghệ.',
      B: 'Được sáng tạo.',
      C: 'Giúp ích cho xã hội.',
      D: 'Có thu nhập và cơ hội thăng tiến.',
    },
  },
  {
    id: 14,
    group: 'Nhóm 4. Giá trị nghề nghiệp (Câu 13–16)',
    question: 'Bạn thích thành công theo cách nào?',
    options: {
      A: 'Tạo ra phần mềm hữu ích.',
      B: 'Tạo ra tác phẩm đẹp.',
      C: 'Giúp nhiều người.',
      D: 'Xây dựng doanh nghiệp thành công.',
    },
  },
  {
    id: 15,
    group: 'Nhóm 4. Giá trị nghề nghiệp (Câu 13–16)',
    question: 'Bạn muốn người khác nhớ đến mình là...',
    options: {
      A: 'Chuyên gia công nghệ.',
      B: 'Người sáng tạo.',
      C: 'Người truyền cảm hứng.',
      D: 'Nhà lãnh đạo.',
    },
  },
  {
    id: 16,
    group: 'Nhóm 4. Giá trị nghề nghiệp (Câu 13–16)',
    question: 'Bạn cảm thấy hạnh phúc khi...',
    options: {
      A: 'Giải quyết được một bài toán khó.',
      B: 'Hoàn thành một sản phẩm đẹp.',
      C: 'Thấy người khác tiến bộ nhờ mình.',
      D: 'Đạt được mục tiêu lớn.',
    },
  },
  {
    id: 17,
    group: 'Nhóm 5. Định hướng tương lai (Câu 17–20)',
    question: 'Nếu được chọn một câu lạc bộ ở trường, bạn sẽ chọn...',
    options: {
      A: 'CLB Tin học.',
      B: 'CLB Truyền thông.',
      C: 'CLB Tình nguyện.',
      D: 'CLB Khởi nghiệp.',
    },
  },
  {
    id: 18,
    group: 'Nhóm 5. Định hướng tương lai (Câu 17–20)',
    question: 'Bạn muốn học thêm kỹ năng nào?',
    options: {
      A: 'Lập trình.',
      B: 'Thiết kế đồ họa.',
      C: 'Giao tiếp và tâm lý.',
      D: 'Marketing và kinh doanh.',
    },
  },
  {
    id: 19,
    group: 'Nhóm 5. Định hướng tương lai (Câu 17–20)',
    question: 'Nếu được thực tập ngay hôm nay, bạn sẽ chọn...',
    options: {
      A: 'Công ty phần mềm.',
      B: 'Công ty thiết kế.',
      C: 'Trung tâm giáo dục hoặc tổ chức xã hội.',
      D: 'Doanh nghiệp hoặc startup.',
    },
  },
  {
    id: 20,
    group: 'Nhóm 5. Định hướng tương lai (Câu 17–20)',
    question: 'Bạn thấy bản thân phù hợp với hình ảnh nào nhất?',
    options: {
      A: 'Người tạo ra công nghệ.',
      B: 'Người tạo ra ý tưởng.',
      C: 'Người giúp đỡ và kết nối mọi người.',
      D: 'Người lãnh đạo và phát triển doanh nghiệp.',
    },
  },
];

export default function HuongNghiepPage() {
  const [activeTab, setActiveTab] = useState<'quiz' | 'industries' | 'training'>('quiz');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [industries, setIndustries] = useState<HuongNghiep[]>([]);
  const [trainingPlaces, setTrainingPlaces] = useState<TrainingPlace[]>([]);
  const [loadingIndustries, setLoadingIndustries] = useState(false);
  const [loadingTrainingPlaces, setLoadingTrainingPlaces] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<'A' | 'B' | 'C' | 'D' | 'all'>('all');
  const [filterRegion, setFilterRegion] = useState<'Miền Bắc' | 'Miền Trung' | 'Miền Nam' | 'all'>('all');
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [selectedTrainingPlace, setSelectedTrainingPlace] = useState<TrainingPlace | null>(null);

  useEffect(() => {
    const savedAnswers = localStorage.getItem('careerQuizAnswers');
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }

    const handleBeforeUnload = () => {
      localStorage.removeItem('careerQuizAnswers');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (showResults) {
      loadIndustries();
    }
  }, [showResults]);

  useEffect(() => {
    if (activeTab === 'industries') {
      loadIndustries();
    } else if (activeTab === 'training') {
      loadTrainingPlaces();
    }
  }, [activeTab]);

  const loadIndustries = async () => {
    try {
      setLoadingIndustries(true);
      const response = await huongnghiepApi.getAllIndustries({ isPublished: true });
      setIndustries(response.data || []);
    } catch (error) {
      console.error('Error loading industries:', error);
    } finally {
      setLoadingIndustries(false);
    }
  };

  const loadTrainingPlaces = async () => {
    try {
      setLoadingTrainingPlaces(true);
      const response = await huongnghiepApi.getAllTrainingPlaces();
      setTrainingPlaces(response.data || []);
    } catch (error) {
      console.error('Error loading training places:', error);
    } finally {
      setLoadingTrainingPlaces(false);
    }
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: answer };
    setAnswers(newAnswers);
    localStorage.setItem('careerQuizAnswers', JSON.stringify(newAnswers));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    localStorage.removeItem('careerQuizAnswers');
  };

  const countAnswers = () => {
    const counts = { A: 0, B: 0, C: 0, D: 0 };
    Object.values(answers).forEach((answer) => {
      counts[answer as keyof typeof counts]++;
    });
    return counts;
  };

  const filteredIndustries = industries.filter(ind => {
    const matchesSearch = ind.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ind.overview?.introduction || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = filterGroup === 'all' || ind.group === filterGroup;
    return matchesSearch && matchesGroup;
  });

  const filteredTrainingPlaces = trainingPlaces.filter(tp => {
    const matchesSearch = tp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tp.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = filterRegion === 'all' || tp.region === filterRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[var(--cn-text-main)] mb-6 text-center">Hướng nghiệp</h1>

      {/* Tabs Navigation */}
      <div className="mb-6">
        <div className="flex border-b border-[var(--cn-border)]">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'quiz'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-[var(--cn-text-muted)] hover:text-[var(--cn-text-main)]'
            }`}
          >
            Trắc nghiệm nghề nghiệp
          </button>
          <button
            onClick={() => setActiveTab('industries')}
            className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'industries'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-[var(--cn-text-muted)] hover:text-[var(--cn-text-main)]'
            }`}
          >
            Các ngành nghề
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'training'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-[var(--cn-text-muted)] hover:text-[var(--cn-text-main)]'
            }`}
          >
            Các nơi đào tạo
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'quiz' && (
        <>
          {showResults ? (() => {
            const counts = countAnswers();

            // Find the group with the highest score
            const sortedGroups = Object.entries(counts)
              .sort(([, a], [, b]) => b - a);
            const highestGroup = sortedGroups[0][0];

            const groupNames: Record<string, string> = {
              A: 'Công nghệ',
              B: 'Sáng tạo',
              C: 'Xã hội',
              D: 'Kinh doanh',
            };

            const highestGroupIndustries = industries.filter(ind => ind.group === highestGroup);

            return (
              <div className="bg-[var(--cn-bg-card)] rounded-lg p-6 border border-[var(--cn-border)] max-w-4xl mx-auto">
                <h2 className="text-xl font-bold text-[var(--cn-text-main)] mb-4 text-center">Kết quả trắc nghiệm</h2>

                <div className="mb-8">
                  <h3 className="text-lg font-bold text-[var(--cn-text-main)] mb-4 text-center">
                    Ngành nghề phù hợp với bạn: Nhóm {highestGroup} - {groupNames[highestGroup]}
                  </h3>

                  {loadingIndustries ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <CardSkeleton />
                      <CardSkeleton />
                      <CardSkeleton />
                    </div>
                  ) : highestGroupIndustries.length === 0 ? (
                    <div className="text-center py-8 text-[var(--cn-text-muted)]">
                      Hiện tại chúng tôi đang cập nhật thêm dữ liệu
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {highestGroupIndustries.map(industry => (
                        <Link
                          key={industry._id}
                          href={`/huongnghiep/${industry.slug}`}
                          className="bg-[var(--cn-bg-section)] rounded-lg overflow-hidden border border-[var(--cn-border)] hover:shadow-md transition-shadow cursor-pointer"
                        >
                          {industry.thumbnail && (
                            <img
                              src={industry.thumbnail}
                              alt={industry.name}
                              className="w-full h-48 object-cover"
                            />
                          )}
                          <div className="p-4">
                            <h4 className="font-bold text-[var(--cn-text-main)] mb-2 text-lg">{industry.name}</h4>
                            <p className="text-sm text-[var(--cn-text-muted)] line-clamp-3">
                              {industry.overview?.introduction || ''}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={resetQuiz}
                  className="w-full bg-blue-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors"
                >
                  Làm lại bài trắc nghiệm
                </button>
              </div>
            );
          })() : (
            <>
              {/* Timeline Section */}
              <div className="mb-8">
                {/* Mobile/Tablet: Vertical */}
                <div className="md:hidden relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
                  
                  <div className="relative pl-10 pb-6">
                    <div className="absolute left-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">1</div>
                    <div className="bg-[var(--cn-bg-card)] rounded-lg p-4 border border-[var(--cn-border)]">
                      <h2 className="font-bold text-[var(--cn-text-main)] mb-1">Làm bài trắc nghiệm</h2>
                      <p className="text-sm text-[var(--cn-text-muted)]">Trả lời các câu hỏi để hiểu tính cách của bạn</p>
                    </div>
                  </div>

                  <div className="relative pl-10 pb-6">
                    <div className="absolute left-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">2</div>
                    <div className="bg-[var(--cn-bg-card)] rounded-lg p-4 border border-[var(--cn-border)]">
                      <h2 className="font-bold text-[var(--cn-text-main)] mb-1">Kiểm tra kết quả</h2>
                      <p className="text-sm text-[var(--cn-text-muted)]">Xem phân tích chi tiết về tính cách</p>
                    </div>
                  </div>

                  <div className="relative pl-10">
                    <div className="absolute left-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">3</div>
                    <div className="bg-[var(--cn-bg-card)] rounded-lg p-4 border border-[var(--cn-border)]">
                      <h2 className="font-bold text-[var(--cn-text-main)] mb-1">Khám phá nghề nghiệp</h2>
                      <p className="text-sm text-[var(--cn-text-muted)]">Xem nghề phù hợp và lời khuyên</p>
                    </div>
                  </div>
                </div>

                {/* Desktop: Horizontal */}
                <div className="hidden md:block">
                  <div className="relative flex items-center justify-between gap-4">
                    <div className="absolute top-4 left-8 right-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                    
                    <div className="flex-1 text-center relative z-10">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">1</div>
                      <div className="bg-[var(--cn-bg-card)] rounded-lg p-4 border border-[var(--cn-border)]">
                        <h2 className="font-bold text-[var(--cn-text-main)] mb-1">Làm bài trắc nghiệm</h2>
                        <p className="text-sm text-[var(--cn-text-muted)]">Trả lời các câu hỏi</p>
                      </div>
                    </div>

                    <div className="flex-1 text-center relative z-10">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">2</div>
                      <div className="bg-[var(--cn-bg-card)] rounded-lg p-4 border border-[var(--cn-border)]">
                        <h2 className="font-bold text-[var(--cn-text-main)] mb-1">Kiểm tra kết quả</h2>
                        <p className="text-sm text-[var(--cn-text-muted)]">Xem phân tích</p>
                      </div>
                    </div>

                    <div className="flex-1 text-center relative z-10">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">3</div>
                      <div className="bg-[var(--cn-bg-card)] rounded-lg p-4 border border-[var(--cn-border)]">
                        <h2 className="font-bold text-[var(--cn-text-main)] mb-1">Khám phá nghề nghiệp</h2>
                        <p className="text-sm text-[var(--cn-text-muted)]">Xem nghề phù hợp</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quiz Section */}
              <div className="bg-[var(--cn-bg-card)] rounded-lg p-6 border border-[var(--cn-border)] max-w-2xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[var(--cn-text-main)] mb-2 text-center">TRẮC NGHIỆM NGHỀ NGHIỆP</h2>
                  <div className="flex justify-between items-center text-sm text-[var(--cn-text-muted)]">
                    <span>{questions[currentQuestion].group}</span>
                    <span>Câu {currentQuestion + 1} / {questions.length}</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-lg font-bold text-[var(--cn-text-main)] mb-4">{questions[currentQuestion].question}</p>
                </div>

                <div className="space-y-3 mb-6">
                  {Object.entries(questions[currentQuestion].options).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => handleAnswer(key)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        answers[questions[currentQuestion].id] === key
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-transparent border-[var(--cn-border)] hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      }`}
                    >
                      <span className="font-bold mr-2">{key}.</span>
                      <span>{value}</span>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between gap-4">
                  <button
                    onClick={handleBack}
                    disabled={currentQuestion === 0}
                    className="flex-1 px-4 py-2 rounded-lg border border-[var(--cn-border)] font-bold text-[var(--cn-text-main)] hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Trở lại
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!answers[questions[currentQuestion].id]}
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {currentQuestion === questions.length - 1 ? 'Xem kết quả' : 'Tiếp tục'}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {activeTab === 'industries' && (
        <div className="max-w-6xl mx-auto">
          {/* Filters */}
          <div className="bg-[var(--cn-bg-card)] rounded-lg p-4 border border-[var(--cn-border)] mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <CustomInputSearch
                  placeholder="Tìm kiếm ngành nghề..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <CustomSelect
                  placeholder="Tất cả nhóm, lĩnh vực"
                  value={filterGroup}
                  onChange={(value) => setFilterGroup(value as any)}
                  options={[
                    { value: 'all', label: 'Tất cả nhóm, lĩnh vực' },
                    { value: 'A', label: 'Nhóm A - Công nghệ' },
                    { value: 'B', label: 'Nhóm B - Sáng tạo' },
                    { value: 'C', label: 'Nhóm C - Xã hội' },
                    { value: 'D', label: 'Nhóm D - Kinh doanh' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Industries List */}
          {loadingIndustries ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <IndustrySkeleton />
              <IndustrySkeleton />
              <IndustrySkeleton />
              <IndustrySkeleton />
              <IndustrySkeleton />
              <IndustrySkeleton />
            </div>
          ) : filteredIndustries.length === 0 ? (
            <div className="text-center py-12 text-[var(--cn-text-muted)]">Không tìm thấy ngành nghề nào</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIndustries.map(industry => (
                <Link
                  key={industry._id}
                  href={`/huongnghiep/${industry.slug}`}
                  className="bg-[var(--cn-bg-card)] rounded-lg overflow-hidden border border-[var(--cn-border)] hover:shadow-md transition-shadow cursor-pointer"
                >
                  {industry.thumbnail && (
                    <img
                      src={industry.thumbnail}
                      alt={industry.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs font-medium">
                        Nhóm {industry.group}
                      </span>
                    </div>
                    <h4 className="font-bold text-[var(--cn-text-main)] mb-2">{industry.name}</h4>
                    <p className="text-sm text-[var(--cn-text-muted)] line-clamp-3">
                      {industry.overview?.introduction || ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'training' && (
        <div className="max-w-6xl mx-auto">
          {/* Filters */}
          <div className="bg-[var(--cn-bg-card)] rounded-lg p-4 border border-[var(--cn-border)] mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <CustomInputSearch
                  placeholder="Tìm kiếm trường học..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <CustomSelect
                  placeholder="Tất cả khu vực"
                  value={filterRegion}
                  onChange={(value) => setFilterRegion(value as any)}
                  options={[
                    { value: 'all', label: 'Tất cả khu vực' },
                    { value: 'Miền Bắc', label: 'Miền Bắc' },
                    { value: 'Miền Trung', label: 'Miền Trung' },
                    { value: 'Miền Nam', label: 'Miền Nam' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Training Places List */}
          {loadingTrainingPlaces ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TrainingPlaceSkeleton />
              <TrainingPlaceSkeleton />
              <TrainingPlaceSkeleton />
              <TrainingPlaceSkeleton />
              <TrainingPlaceSkeleton />
              <TrainingPlaceSkeleton />
            </div>
          ) : filteredTrainingPlaces.length === 0 ? (
            <div className="text-center py-12 text-[var(--cn-text-muted)]">Không tìm thấy trường học nào</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrainingPlaces.map(tp => (
                <div
                  key={tp._id}
                  onClick={() => {
                    setSelectedTrainingPlace(tp);
                    setShowTrainingModal(true);
                  }}
                  className="bg-[var(--cn-bg-card)] rounded-lg p-4 border border-[var(--cn-border)] cursor-pointer hover:shadow-md transition-shadow"
                >
                  {tp.logo && (
                    <img
                      src={tp.logo}
                      alt={tp.name}
                      className="w-full h-32 object-contain rounded-lg mb-4"
                    />
                  )}
                  <h4 className="font-bold text-[var(--cn-text-main)] mb-2">{tp.name}</h4>
                  <p className="text-sm text-[var(--cn-text-muted)] mb-2">{tp.location}</p>
                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs">
                      {tp.type}
                    </span>
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-xs">
                      {tp.region}
                    </span>
                  </div>
                  {tp.majorsCount && (
                    <p className="text-sm text-[var(--cn-text-muted)]">{tp.majorsCount} ngành</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Training Place Modal */}
      {showTrainingModal && selectedTrainingPlace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--cn-bg-card)] rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-[var(--cn-text-main)]">Thông tin nơi đào tạo</h3>
                <button
                  onClick={() => setShowTrainingModal(false)}
                  className="p-2 hover:bg-[var(--cn-bg-section)] rounded-lg transition-colors"
                >
                  <X size={20} className="text-[var(--cn-text-muted)]" />
                </button>
              </div>

              <div className="space-y-4">
                {selectedTrainingPlace.logo && (
                  <img
                    src={selectedTrainingPlace.logo}
                    alt={selectedTrainingPlace.name}
                    className="w-full h-48 object-contain rounded-lg"
                  />
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[var(--cn-text-muted)] mb-1">Tên</p>
                    <p className="font-medium text-[var(--cn-text-main)]">{selectedTrainingPlace.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--cn-text-muted)] mb-1">Địa điểm</p>
                    <p className="text-[var(--cn-text-sub)]">{selectedTrainingPlace.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--cn-text-muted)] mb-1">Khu vực</p>
                    <p className="text-[var(--cn-text-sub)]">{selectedTrainingPlace.region}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--cn-text-muted)] mb-1">Loại hình</p>
                    <p className="text-[var(--cn-text-sub)]">{selectedTrainingPlace.type}</p>
                  </div>
                  {selectedTrainingPlace.strengths && (
                    <div className="col-span-2">
                      <p className="text-sm text-[var(--cn-text-muted)] mb-1">Điểm mạnh</p>
                      <p className="text-[var(--cn-text-sub)]">{selectedTrainingPlace.strengths}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-[var(--cn-text-muted)] mb-1">Số ngành</p>
                    <p className="text-[var(--cn-text-sub)]">{selectedTrainingPlace.majorsCount} ngành</p>
                  </div>
                  {(selectedTrainingPlace.tuitionMin || selectedTrainingPlace.tuitionMax) && (
                    <div>
                      <p className="text-sm text-[var(--cn-text-muted)] mb-1">Học phí</p>
                      <p className="text-[var(--cn-text-sub)]">
                        {selectedTrainingPlace.tuitionMin && selectedTrainingPlace.tuitionMax
                          ? `${selectedTrainingPlace.tuitionMin} - ${selectedTrainingPlace.tuitionMax} triệu/năm`
                          : selectedTrainingPlace.tuitionMin
                          ? `Từ ${selectedTrainingPlace.tuitionMin} triệu/năm`
                          : selectedTrainingPlace.tuitionMax
                          ? `Đến ${selectedTrainingPlace.tuitionMax} triệu/năm`
                          : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
