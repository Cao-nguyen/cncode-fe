// lib/data/cuahangso.ts
import { Product, Review } from '@/types/cuahangso'

export const products: Product[] = [
  {
    id: '1',
    name: 'Premium PowerPoint Template - Tech Bundle',
    slug: 'premium-powerpoint-template-tech-bundle',
    description: 'Bộ template PowerPoint chuyên nghiệp cho lĩnh vực công nghệ, bao gồm 50+ slide với thiết kế hiện đại',
    longDescription: 'Bộ template PowerPoint chuyên nghiệp với 50+ slide thiết kế hiện đại, phù hợp cho thuyết trình về công nghệ, startup, sản phẩm kỹ thuật số. Bao gồm biểu đồ, infographics, mockup điện thoại/máy tính, và nhiều animation chuyên nghiệp.',
    price: 299000,
    category: 'powerpoint',
    thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400',
    previewImages: [
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800'
    ],
    downloadCount: 15234,
    rating: 4.8,
    reviewCount: 1234,
    features: [
      '50+ slide thiết kế chuyên nghiệp',
      'Biểu đồ và infographics động',
      'Tương thích PowerPoint 2016 trở lên',
      'Font chữ miễn phí đi kèm',
      'Hỗ trợ tỷ lệ 16:9 và 4:3',
      'Animation và transition hiệu ứng'
    ],
    requirements: [
      'Microsoft PowerPoint 2016 trở lên',
      'Kiến thức cơ bản về PowerPoint',
      'Bộ nhớ trống 500MB'
    ],
    createdAt: '2024-01-15',
    fileUrl: 'https://drive.google.com/drive/folders/xxx',
    previewUrl: 'https://docs.google.com/presentation/d/xxx/preview',
    author: { name: 'CNcode Team', avatar: 'CT' }
  },
  {
    id: '2',
    name: 'React TypeScript Starter Kit Pro',
    slug: 'react-typescript-starter-kit-pro',
    description: 'Dự án React TypeScript hoàn chỉnh với các component tái sử dụng, routing, state management',
    longDescription: 'Dự án React TypeScript hoàn chỉnh, tích hợp sẵn các tính năng: routing với React Router, state management với Zustand, UI components với Tailwind CSS, và nhiều utility functions hữu ích.',
    price: 499000,
    category: 'code',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    previewImages: [
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      'https://images.unsplash.com/photo-1581276875532-b1c019a8fba8?w=800',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'
    ],
    downloadCount: 8765,
    rating: 4.9,
    reviewCount: 892,
    features: [
      'React 18 + TypeScript',
      'React Router v6',
      'Zustand state management',
      'Tailwind CSS + Shadcn UI',
      'Axios interceptor',
      'Authentication flow',
      'Dark mode support',
      'ESLint + Prettier'
    ],
    requirements: [
      'Node.js 18 trở lên',
      'npm hoặc yarn',
      'Kiến thức React cơ bản'
    ],
    createdAt: '2024-02-01',
    fileUrl: 'https://github.com/example/react-starter-kit',
    author: { name: 'CNcode Team', avatar: 'CT' }
  },
  {
    id: '3',
    name: 'UI Design System - Figma File',
    slug: 'ui-design-system-figma-file',
    description: 'Hệ thống design components đầy đủ cho Figma, bao gồm button, form, navigation, và nhiều hơn nữa',
    longDescription: 'Hệ thống design components chuyên nghiệp cho Figma, bao gồm 200+ components, 10+ themes, auto layout, variants, và design tokens đầy đủ.',
    price: 399000,
    category: 'design',
    thumbnail: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=400',
    previewImages: [
      'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800',
      'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800',
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800'
    ],
    downloadCount: 12453,
    rating: 4.7,
    reviewCount: 2156,
    features: [
      '200+ UI components',
      'Auto layout ready',
      'Dark/Light mode variants',
      'Design tokens system',
      'Responsive grid system',
      'Form components',
      'Navigation patterns',
      'Data visualization'
    ],
    requirements: [
      'Figma (miễn phí hoặc pro)',
      'Kiến thức cơ bản về Figma'
    ],
    createdAt: '2024-01-20',
    fileUrl: 'https://www.figma.com/file/xxx',
    author: { name: 'CNcode Team', avatar: 'CT' }
  },
  {
    id: '4',
    name: 'Ebook: Lộ trình Fullstack Developer',
    slug: 'ebook-lo-trinh-fullstack-developer',
    description: 'Hướng dẫn chi tiết từ A-Z để trở thành Fullstack Developer chuyên nghiệp',
    longDescription: 'Ebook chi tiết về lộ trình học Fullstack Development, bao gồm Frontend, Backend, Database, DevOps, và các dự án thực tế.',
    price: 199000,
    category: 'document',
    thumbnail: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    previewImages: [
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800',
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800'
    ],
    downloadCount: 9876,
    rating: 4.9,
    reviewCount: 789,
    features: [
      '300+ trang kiến thức',
      'Dự án thực tế',
      'Bài tập có đáp án',
      'Code mẫu đầy đủ',
      'Lộ trình 6 tháng',
      'Phỏng vấn xin việc'
    ],
    requirements: [
      'Không yêu cầu kiến thức nền',
      'Máy tính kết nối Internet'
    ],
    createdAt: '2024-02-10',
    fileUrl: 'https://drive.google.com/file/d/xxx',
    previewUrl: 'https://drive.google.com/file/d/xxx/preview',
    author: { name: 'CNcode Team', avatar: 'CT' }
  },
  {
    id: '5',
    name: 'Next.js 14 Master Course Materials',
    slug: 'nextjs-14-master-course-materials',
    description: 'Tài liệu và source code khóa học Next.js 14 từ cơ bản đến nâng cao',
    longDescription: 'Tài liệu đầy đủ cho khóa học Next.js 14, bao gồm App Router, Server Components, Server Actions, và các pattern tối ưu performance.',
    price: 599000,
    category: 'code',
    thumbnail: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=400',
    previewImages: [
      'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=800',
      'https://images.unsplash.com/photo-1581276875532-b1c019a8fba8?w=800'
    ],
    downloadCount: 5432,
    rating: 4.8,
    reviewCount: 456,
    features: [
      'Next.js 14 App Router',
      'Server Components',
      'Server Actions',
      'Authentication với NextAuth',
      'Database với Prisma',
      'Deployment trên Vercel',
      'Optimization techniques',
      '10+ dự án thực hành'
    ],
    requirements: [
      'React cơ bản',
      'JavaScript ES6+',
      'Node.js 18+'
    ],
    createdAt: '2024-02-20',
    fileUrl: 'https://github.com/example/nextjs-masterclass',
    author: { name: 'CNcode Team', avatar: 'CT' }
  },
  {
    id: '6',
    name: 'Creative PowerPoint - Marketing Template',
    slug: 'creative-powerpoint-marketing-template',
    description: 'Template PowerPoint sáng tạo dành cho marketing, quảng cáo và kinh doanh',
    longDescription: 'Template PowerPoint chuyên cho marketing với các slide về chiến lược, phân tích thị trường, kế hoạch quảng cáo, và báo cáo KPI.',
    price: 249000,
    category: 'powerpoint',
    thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400',
    previewImages: [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800'
    ],
    downloadCount: 11234,
    rating: 4.6,
    reviewCount: 987,
    features: [
      '35+ slide marketing',
      'Biểu đồ KPI',
      'Ma trận SWOT',
      'Kế hoạch chiến lược',
      'Báo cáo hiệu suất',
      'Infographic thị trường'
    ],
    requirements: [
      'PowerPoint 2016 trở lên',
      'Font hỗ trợ tiếng Việt'
    ],
    createdAt: '2024-01-05',
    fileUrl: 'https://drive.google.com/drive/folders/xxx',
    previewUrl: 'https://docs.google.com/presentation/d/xxx/preview',
    author: { name: 'CNcode Team', avatar: 'CT' }
  },
  {
    id: '7',
    name: 'Tailwind CSS Component Library',
    slug: 'tailwind-css-component-library',
    description: 'Thư viện component Tailwind CSS với 100+ component đẹp mắt, responsive',
    longDescription: 'Thư viện components Tailwind CSS đầy đủ, dễ dàng tùy chỉnh, tương thích với React, Vue, hoặc HTML thuần.',
    price: 349000,
    category: 'code',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
    previewImages: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
      'https://images.unsplash.com/photo-1581276875532-b1c019a8fba8?w=800'
    ],
    downloadCount: 7654,
    rating: 4.9,
    reviewCount: 634,
    features: [
      '100+ responsive components',
      'Dark mode support',
      'Animation và transitions',
      'Form elements',
      'Navigation menus',
      'Modal và popups',
      'Data tables',
      'Chart components'
    ],
    requirements: [
      'Tailwind CSS 3+',
      'HTML/CSS cơ bản'
    ],
    createdAt: '2024-02-25',
    fileUrl: 'https://github.com/example/tailwind-components',
    author: { name: 'CNcode Team', avatar: 'CT' }
  },
  {
    id: '8',
    name: 'Brand Identity Guidelines PDF',
    slug: 'brand-identity-guidelines-pdf',
    description: 'Tài liệu hướng dẫn xây dựng nhận diện thương hiệu chuyên nghiệp',
    longDescription: 'Tài liệu chi tiết về xây dựng bộ nhận diện thương hiệu, bao gồm logo, màu sắc, typography, và ứng dụng thực tế.',
    price: 149000,
    category: 'document',
    thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
    previewImages: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800'
    ],
    downloadCount: 4321,
    rating: 4.7,
    reviewCount: 345,
    features: [
      'Hướng dẫn sử dụng logo',
      'Bảng màu thương hiệu',
      'Hệ thống typography',
      'Ứng dụng thực tế',
      'Template có sẵn',
      'Case study mẫu'
    ],
    requirements: [
      'Adobe Acrobat Reader',
      'Không yêu cầu kiến thức chuyên sâu'
    ],
    createdAt: '2024-03-01',
    fileUrl: 'https://drive.google.com/file/d/xxx',
    previewUrl: 'https://drive.google.com/file/d/xxx/preview',
    author: { name: 'CNcode Team', avatar: 'CT' }
  },
  {
    id: '9',
    name: '3D Illustration Pack - 50+ Assets',
    slug: '3d-illustration-pack-50-assets',
    description: 'Bộ 50+ ảnh minh họa 3D chất lượng cao cho website và ứng dụng',
    longDescription: 'Bộ sưu tập 50+ illustration 3D với nhiều chủ đề: công nghệ, marketing, giáo dục, kinh doanh. Định dạng PNG và Figma.',
    price: 449000,
    category: 'design',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
    previewImages: [
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
      'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800'
    ],
    downloadCount: 6543,
    rating: 4.8,
    reviewCount: 567,
    features: [
      '50+ illustration 3D',
      'Định dạng PNG + Figma',
      'Nhiều chủ đề đa dạng',
      'Background trong suốt',
      'Dễ dàng tùy chỉnh',
      'License thương mại'
    ],
    requirements: [
      'Figma (để chỉnh sửa)',
      'Hoặc dùng trực tiếp file PNG'
    ],
    createdAt: '2024-02-15',
    fileUrl: 'https://www.figma.com/file/xxx',
    author: { name: 'CNcode Team', avatar: 'CT' }
  }
]

export const mockReviews: Review[] = [
  {
    id: '1',
    userName: 'Nguyễn Văn A',
    userAvatar: 'NA',
    rating: 5,
    comment: 'Sản phẩm rất chất lượng, đúng như mô tả. Tôi rất hài lòng!',
    createdAt: '2024-03-15T00:00:00Z'
  },
  {
    id: '2',
    userName: 'Trần Thị B',
    userAvatar: 'TB',
    rating: 4,
    comment: 'Giao diện đẹp, dễ sử dụng. Tuy nhiên giá hơi cao so với mặt bằng chung.',
    createdAt: '2024-03-10T00:00:00Z'
  },
  {
    id: '3',
    userName: 'Lê Văn C',
    userAvatar: 'LC',
    rating: 5,
    comment: 'Tài liệu rất chi tiết và dễ hiểu. Cảm ơn tác giả!',
    createdAt: '2024-03-05T00:00:00Z'
  }
]