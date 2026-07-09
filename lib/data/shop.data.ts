import { ShopProduct } from '@/lib/utils/shopHistory';

export const SHOP_MOCK_DATA: ShopProduct[] = [
    {
        _id: 'shop001',
        title: 'Giáo trình Python cơ bản',
        description: 'Tài liệu hướng dẫn lập trình Python dành cho người mới bắt đầu, được biên soạn theo lộ trình từ cơ bản đến nâng cao. Nội dung bao gồm cài đặt môi trường, biến, kiểu dữ liệu, cấu trúc điều kiện, vòng lặp, hàm, module, xử lý file và lập trình hướng đối tượng. Mỗi chương đều có ví dụ minh họa, bài tập thực hành và lời giải giúp người học dễ dàng áp dụng vào các dự án thực tế cũng như chuẩn bị cho các kỳ thi Tin học và lập trình.',
        price: 0,
        category: 'Tài liệu',
        sellerId: 'lycaonguyen',
        sellerName: 'Lý Cao Nguyên',
        images: ['https://placehold.co/600x800/2563eb/ffffff?text=Python'],
        files: [
            { url: 'https://example.com/docs/python-co-ban.pdf', name: 'python-co-ban.pdf', size: 20971520, type: 'application/pdf' }
        ],
        tags: ['python', 'lập trình', 'cơ bản', 'beginner'],
        views: 1234,
        purchases: 1,
        status: 'approved',
        createdAt: '2026-01-15T10:00:00.000Z'
    },
    {
        _id: 'shop002',
        title: 'Học HTML & CSS từ Zero',
        description: 'Bộ tài liệu giúp người học xây dựng nền tảng vững chắc về HTML5 và CSS3. Nội dung bao gồm cấu trúc trang web, định dạng văn bản, bảng, biểu mẫu, Flexbox, Grid, Responsive Design và các kỹ thuật xây dựng giao diện hiện đại. Tài liệu đi kèm nhiều ví dụ trực quan, bài tập thực hành và mini project giúp người học có thể tự thiết kế website hoàn chỉnh.',
        price: 0,
        category: 'Tài liệu',
        sellerId: 'lycaonguyen',
        sellerName: 'Lý Cao Nguyên',
        images: ['https://placehold.co/600x800/ea580c/ffffff?text=HTML+CSS'],
        files: [
            { url: 'https://example.com/docs/html-css.pdf', name: 'html-css.pdf', size: 15728640, type: 'application/pdf' }
        ],
        tags: ['html', 'css', 'frontend', 'web'],
        views: 987,
        purchases: 2,
        status: 'approved',
        createdAt: '2026-02-20T14:30:00.000Z'
    },
    {
        _id: 'shop003',
        title: 'JavaScript cho người mới',
        description: 'Tài liệu cung cấp kiến thức từ cơ bản đến nâng cao về JavaScript, bao gồm cú pháp ES6+, DOM, Event, Promise, Async/Await, Fetch API và các kỹ thuật lập trình hiện đại. Nội dung được trình bày theo từng chuyên đề với ví dụ thực tế, giúp người học nhanh chóng làm quen với lập trình web tương tác.',
        price: 0,
        category: 'Tài liệu',
        sellerId: 'lycaonguyen',
        sellerName: 'Lý Cao Nguyên',
        images: ['https://placehold.co/600x800/eab308/ffffff?text=JavaScript'],
        files: [
            { url: 'https://example.com/docs/javascript.pdf', name: 'javascript.pdf', size: 18874368, type: 'application/pdf' }
        ],
        tags: ['javascript', 'js', 'frontend', 'async'],
        views: 876,
        purchases: 1,
        status: 'approved',
        createdAt: '2026-01-10T09:00:00.000Z'
    },
    {
        _id: 'shop004',
        title: 'Lập trình C++ căn bản',
        description: 'Giáo trình C++ được biên soạn dành cho học sinh THPT, sinh viên năm nhất và người mới học lập trình. Nội dung bao gồm biến, kiểu dữ liệu, hàm, mảng, con trỏ, cấu trúc, lớp và lập trình hướng đối tượng. Tài liệu có nhiều bài tập thực hành và bài toán thuật toán thường gặp trong các kỳ thi học sinh giỏi Tin học.',
        price: 0,
        category: 'Tài liệu',
        sellerId: 'lycaonguyen',
        sellerName: 'Lý Cao Nguyên',
        images: ['https://placehold.co/600x800/0284c7/ffffff?text=C%2B%2B'],
        files: [
            { url: 'https://example.com/docs/cpp.pdf', name: 'cpp.pdf', size: 22020096, type: 'application/pdf' }
        ],
        tags: ['c++', 'lập trình', 'THPT', 'algorithm'],
        views: 765,
        purchases: 2,
        status: 'approved',
        createdAt: '2026-02-05T16:00:00.000Z'
    },
    {
        _id: 'shop005',
        title: 'Cấu trúc dữ liệu và giải thuật',
        description: 'Bộ tài liệu tổng hợp đầy đủ các cấu trúc dữ liệu phổ biến như Stack, Queue, Linked List, Tree, Graph cùng các thuật toán sắp xếp, tìm kiếm và quy hoạch động. Nội dung được trình bày khoa học, có hình minh họa, ví dụ và bài tập từ dễ đến khó, phù hợp cho việc luyện thi lập trình và phỏng vấn kỹ thuật.',
        price: 0,
        category: 'Tài liệu',
        sellerId: 'lycaonguyen',
        sellerName: 'Lý Cao Nguyên',
        images: ['https://placehold.co/600x800/7c3aed/ffffff?text=DSA'],
        files: [
            { url: 'https://example.com/docs/dsa.pdf', name: 'dsa.pdf', size: 25165824, type: 'application/pdf' }
        ],
        tags: ['dsa', 'cấu trúc dữ liệu', 'giải thuật', 'algorithm'],
        views: 654,
        purchases: 1,
        status: 'approved',
        createdAt: '2026-01-05T08:00:00.000Z'
    },
    {
        _id: 'shop006',
        title: 'SQL từ cơ bản đến nâng cao',
        description: 'Tài liệu hướng dẫn học SQL với các câu lệnh SELECT, INSERT, UPDATE, DELETE, JOIN, GROUP BY, HAVING, VIEW, TRIGGER và Stored Procedure. Người học sẽ được thực hành trên nhiều bài toán quản lý dữ liệu thực tế, giúp nâng cao kỹ năng làm việc với cơ sở dữ liệu quan hệ.',
        price: 0,
        category: 'Tài liệu',
        sellerId: 'lycaonguyen',
        sellerName: 'Lý Cao Nguyên',
        images: ['https://placehold.co/600x800/dc2626/ffffff?text=SQL'],
        files: [
            { url: 'https://example.com/docs/sql.pdf', name: 'sql.pdf', size: 17825792, type: 'application/pdf' }
        ],
        tags: ['sql', 'database', 'postgresql', 'mysql'],
        views: 543,
        purchases: 2,
        status: 'approved',
        createdAt: '2026-02-28T13:00:00.000Z'
    },
    {
        _id: 'shop007',
        title: 'MongoDB thực hành',
        description: 'Giáo trình MongoDB hướng dẫn cách xây dựng cơ sở dữ liệu NoSQL từ cơ bản đến nâng cao. Nội dung bao gồm CRUD, Aggregation Pipeline, Index, Relationship, Transaction và tối ưu hiệu năng. Tài liệu đi kèm nhiều ví dụ với Node.js và Mongoose.',
        price: 0,
        category: 'Tài liệu',
        sellerId: 'lycaonguyen',
        sellerName: 'Lý Cao Nguyên',
        images: ['https://placehold.co/600x800/059669/ffffff?text=MongoDB'],
        files: [
            { url: 'https://example.com/docs/mongodb.pdf', name: 'mongodb.pdf', size: 19922944, type: 'application/pdf' }
        ],
        tags: ['mongodb', 'nosql', 'mongoose', 'nodejs'],
        views: 432,
        purchases: 1,
        status: 'approved',
        createdAt: '2026-02-10T10:30:00.000Z'
    },
    {
        _id: 'shop008',
        title: 'ReactJS cơ bản',
        description: 'Tài liệu học ReactJS dành cho người mới, bao gồm Component, JSX, Props, State, Hook, React Router và quản lý trạng thái. Mỗi chương đều có ví dụ minh họa và dự án nhỏ để giúp người học hiểu rõ cách xây dựng ứng dụng React hiện đại.',
        price: 0,
        category: 'Tài liệu',
        sellerId: 'lycaonguyen',
        sellerName: 'Lý Cao Nguyên',
        images: ['https://placehold.co/600x800/06b6d4/ffffff?text=ReactJS'],
        files: [
            { url: 'https://example.com/docs/react.pdf', name: 'react.pdf', size: 21018624, type: 'application/pdf' }
        ],
        tags: ['react', 'reactjs', 'frontend', 'component'],
        views: 321,
        purchases: 2,
        status: 'approved',
        createdAt: '2026-03-01T12:00:00.000Z'
    },
    {
        _id: 'shop009',
        title: 'Next.js Full Course',
        description: 'Tài liệu hướng dẫn xây dựng ứng dụng web bằng Next.js App Router với TypeScript. Nội dung bao gồm Routing, Server Component, Client Component, API Route, Authentication, SEO và triển khai lên Vercel. Phù hợp cho người muốn phát triển website chuyên nghiệp.',
        price: 0,
        category: 'Tài liệu',
        sellerId: 'lycaonguyen',
        sellerName: 'Lý Cao Nguyên',
        images: ['https://placehold.co/600x800/000000/ffffff?text=Next.js'],
        files: [
            { url: 'https://example.com/docs/nextjs.pdf', name: 'nextjs.pdf', size: 24117248, type: 'application/pdf' }
        ],
        tags: ['nextjs', 'next.js', 'react', 'ssr'],
        views: 234,
        purchases: 1,
        status: 'approved',
        createdAt: '2026-02-15T15:00:00.000Z'
    },
    {
        _id: 'shop010',
        title: 'Node.js & Express',
        description: 'Tài liệu hướng dẫn xây dựng RESTful API bằng Node.js và ExpressJS. Bao gồm Middleware, JWT Authentication, Upload File, MongoDB, Socket.IO và các kỹ thuật bảo mật cơ bản. Phù hợp cho người học phát triển Backend hiện đại.',
        price: 0,
        category: 'Tài liệu',
        sellerId: 'lycaonguyen',
        sellerName: 'Lý Cao Nguyên',
        images: ['https://placehold.co/600x800/16a34a/ffffff?text=Node.js'],
        files: [
            { url: 'https://example.com/docs/nodejs.pdf', name: 'nodejs.pdf', size: 23068672, type: 'application/pdf' }
        ],
        tags: ['nodejs', 'express', 'backend', 'api'],
        views: 198,
        purchases: 2,
        status: 'approved',
        createdAt: '2026-01-20T11:00:00.000Z'
    }
];

// Initialize mock data in localStorage - always refresh with latest data
export function initializeShopData() {
    if (typeof window === 'undefined') return;

    try {
        // Always update with latest mock data
        localStorage.setItem('shop_history_products', JSON.stringify(SHOP_MOCK_DATA));
    } catch (e) {
        console.error('Error initializing shop data:', e);
    }
}
