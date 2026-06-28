'use client';

import React, { useRef } from 'react';
import {
    Share2,
    Handshake,
    Send,
    CheckCircle2,
    Building2,
    Target,
    TrendingUp,
    Globe,
    Zap,
    Users,
    Shield,
    X,
    Clock,
    Ban,
    BadgeCheck,
    Eye,
    Loader2,
    ChevronLeft,
    ChevronRight,
    FileText,
    Calendar,
} from 'lucide-react';
import { CustomButton } from '@/components/custom/CustomButton';
import { CustomInput } from '@/components/custom/CustomInput';
import { CustomInputSearch } from '@/components/custom/CustomInputSearch';
import { CustomSelect } from '@/components/custom/CustomSelect';
import CustomEditor, { CustomEditorRef } from '@/components/custom/CustomEditor';
import StaticContent from '@/components/common/StaticContent';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/providers/socket.provider';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Link from 'next/link';

interface Pagination {
    total: number;
    page: number;
    pages: number;
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    pagination?: Pagination;
}

interface Request {
    _id: string;
    title: string;
    content: string;
    cooperationType: 'blog-post' | 'fanpage-post';
    requester: { _id: string; fullName: string; email: string; avatar?: string };
    requesterInfo: { organizationName?: string; contactEmail?: string; contactPhone?: string; website?: string };
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    createdAt: Date;
    adminResponse?: { message: string; respondedBy?: { _id: string; fullName: string }; respondedAt: Date };
    completedAt?: Date;
}

const api = {
    getAllRequests: async (token: string, page = 1, limit = 10, status = '', search = ''): Promise<ApiResponse<Request[]>> => {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            status,
            search
        });
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cross-promotion?${queryParams}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return res.json();
    },
    submitRequest: async (token: string, title: string, content: string, cooperationType: 'blog-post' | 'fanpage-post', organizationName?: string, contactEmail?: string, contactPhone?: string, website?: string): Promise<ApiResponse<null>> => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cross-promotion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                content,
                cooperationType,
                requesterInfo: {
                    organizationName,
                    contactEmail,
                    contactPhone,
                    website
                }
            })
        });
        return res.json();
    }
};

const RequestStatusBadge = ({ status }: { status: Request['status'] }) => {
    let colorClass = '';
    let text = '';
    let Icon = Clock;

    switch (status) {
        case 'pending':
            colorClass = 'bg-yellow-100 text-yellow-800';
            text = 'Đang chờ duyệt';
            Icon = Clock;
            break;
        case 'approved':
            colorClass = 'bg-green-100 text-green-800';
            text = 'Đã duyệt';
            Icon = CheckCircle2;
            break;
        case 'rejected':
            colorClass = 'bg-red-100 text-red-800';
            text = 'Đã từ chối';
            Icon = Ban;
            break;
        case 'completed':
            colorClass = 'bg-blue-100 text-blue-800';
            text = 'Đã hoàn thành';
            Icon = BadgeCheck;
            break;
        default:
            colorClass = 'bg-gray-100 text-gray-800';
            text = 'Không xác định';
            Icon = Clock;
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            <Icon className="w-3 h-3 mr-1" />
            {text}
        </span>
    );
};

export default function CrossPromotionPage() {
    const { token } = useAuthStore();
    const { socket, isConnected } = useSocket();
    const editorRef = useRef<CustomEditorRef>(null);
    const [isOpenPolicy, setIsOpenPolicy] = React.useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = React.useState(false);
    const [isListModalOpen, setIsListModalOpen] = React.useState(false);

    const [requestTitle, setRequestTitle] = React.useState('');
    const [requestCooperationType, setRequestCooperationType] = React.useState<'blog-post' | 'fanpage-post'>('blog-post');
    const [requestOrgName, setRequestOrgName] = React.useState('');
    const [requestContactEmail, setRequestContactEmail] = React.useState('');
    const [requestContactPhone, setRequestContactPhone] = React.useState('');
    const [requestWebsite, setRequestWebsite] = React.useState('');
    const [isSubmittingRequest, setIsSubmittingRequest] = React.useState(false);

    const [requests, setRequests] = React.useState<Request[]>([]);
    const [loadingRequests, setLoadingRequests] = React.useState(true);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    const [filterStatus, setFilterStatus] = React.useState('');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedRequest, setSelectedRequest] = React.useState<Request | null>(null);
    const [isViewDetailModalOpen, setIsViewDetailModalOpen] = React.useState(false);

    const limit = 5; // Items per page for the list modal

    const cooperationTypeOptions = [
        { value: 'blog-post', label: 'Bài đăng ở mục bài viết (Blog)' },
        { value: 'fanpage-post', label: 'Bài đăng trên Fanpage CNcode' },
    ];

    const statusOptions = [
        { value: '', label: 'Tất cả trạng thái' },
        { value: 'pending', label: 'Đang chờ duyệt' },
        { value: 'approved', label: 'Đã duyệt' },
        { value: 'rejected', label: 'Đã từ chối' },
        { value: 'completed', label: 'Đã hoàn thành' },
    ];

    const cooperationTypeMap: Record<string, string> = {
        'blog-post': 'Bài đăng Blog',
        'fanpage-post': 'Bài đăng Fanpage',
    };

    const cooperationTypeMapFull: Record<string, string> = {
        'blog-post': 'Bài đăng ở mục bài viết (Blog)',
        'fanpage-post': 'Bài đăng trên Fanpage CNcode',
    };

    const resetRequestForm = () => {
        setRequestTitle('');
        setRequestCooperationType('blog-post');
        setRequestOrgName('');
        setRequestContactEmail('');
        setRequestContactPhone('');
        setRequestWebsite('');
        setTimeout(() => editorRef.current?.setContent(''), 100);
    };

    const handleOpenRequestModal = () => {
        resetRequestForm();
        setIsRequestModalOpen(true);
    };

    const handleCloseRequestModal = () => {
        setIsRequestModalOpen(false);
        resetRequestForm();
    };

    const handleSubmitRequest = async () => {
        if (!token) {
            toast.error('Bạn cần đăng nhập để gửi yêu cầu.');
            return;
        }

        const content = editorRef.current?.getContent() || '';
        if (!requestTitle.trim()) {
            toast.error('Vui lòng nhập tiêu đề yêu cầu.');
            return;
        }
        if (!content.trim() || content === '<p><br></p>') {
            toast.error('Vui lòng nhập nội dung chi tiết.');
            return;
        }

        setIsSubmittingRequest(true);
        try {
            const res = await api.submitRequest(
                token,
                requestTitle.trim(),
                content,
                requestCooperationType,
                requestOrgName,
                requestContactEmail,
                requestContactPhone,
                requestWebsite
            );
            if (res.success) {
                toast.success(res.message);
                handleCloseRequestModal();
                fetchRequests();
            } else {
                toast.error(res.message || 'Gửi yêu cầu thất bại.');
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            toast.error('Đã xảy ra lỗi khi gửi yêu cầu.');
        } finally {
            setIsSubmittingRequest(false);
        }
    };

    const fetchRequests = async (): Promise<void> => {
        setLoadingRequests(true);
        try {
            const res: ApiResponse<Request[]> = await api.getAllRequests(token as string, currentPage, limit);
            if (res.success && res.data) {
                setRequests(res.data);
                setTotalPages(res.pagination?.pages || 1);
            } else {
                toast.error(res.message || 'Lỗi khi tải danh sách yêu cầu.');
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            toast.error('Đã xảy ra lỗi khi tải danh sách yêu cầu.');
        } finally {
            setLoadingRequests(false);
        }
    };

    React.useEffect(() => {
        if (isListModalOpen && token) {
            fetchRequests();
        }
    }, [isListModalOpen, token, currentPage]);

    React.useEffect(() => {
        if (!socket || !isConnected || !token) return;

        const handleStatusChanged = (data: {
            requestId: string;
            status: Request['status'];
            message?: string;
            adminResponse?: Request['adminResponse'];
        }) => {
            setRequests((prev) =>
                prev.map((request) =>
                    request._id === data.requestId
                        ? {
                            ...request,
                            status: data.status,
                            adminResponse: data.adminResponse || {
                                message: data.message || '',
                                respondedAt: new Date(),
                            },
                        }
                        : request
                )
            );

            setSelectedRequest((prev) =>
                prev && prev._id === data.requestId
                    ? {
                        ...prev,
                        status: data.status,
                        adminResponse: data.adminResponse || {
                            message: data.message || '',
                            respondedAt: new Date(),
                        },
                    }
                    : prev
            );

            if (isListModalOpen) {
                fetchRequests();
            }
        };

        socket.on('cross_promotion_status_changed', handleStatusChanged);

        return () => {
            socket.off('cross_promotion_status_changed', handleStatusChanged);
        };
    }, [socket, isConnected, token, isListModalOpen]);

    const handleViewDetailRequest = (request: Request) => {
        setSelectedRequest(request);
        setIsViewDetailModalOpen(true);
    };

    const filteredRequests = requests.filter((request) => {
        const matchesStatus = filterStatus ? request.status === filterStatus : true;
        const search = searchTerm.trim().toLowerCase();
        const matchesSearch = search
            ? request.title.toLowerCase().includes(search) ||
              request.requesterInfo.organizationName?.toLowerCase().includes(search)
            : true;
        return matchesStatus && matchesSearch;
    });
    const steps = [
        {
            icon: Send,
            title: '1. Gửi Yêu Cầu Hợp Tác',
            desc: 'Tổ chức/Doanh nghiệp điền thông tin & nội dung muốn quảng bá qua biểu mẫu.',
            color: '#3BA4E8'
        },
        {
            icon: CheckCircle2,
            title: '2. CNcode Duyệt & Trao Đổi',
            desc: 'Ban quản trị đánh giá tính phù hợp và thảo luận phương án đăng bài chéo.',
            color: '#F59E0B'
        },
        {
            icon: Share2,
            title: '3. Đăng Bài Tương Hỗ',
            desc: 'Hai bên đồng thời đăng tải bài viết giới thiệu về nhau lên các kênh truyền thông.',
            color: '#22C55E'
        },
        {
            icon: TrendingUp,
            title: '4. Cộng Hưởng Lan Tỏa',
            desc: 'Tối ưu hóa lượt tiếp cận tệp người dùng tiềm năng chất lượng cao từ cả hai phía.',
            color: '#8B5CF6'
        }
    ];

    const benefits = [
        {
            icon: Users,
            title: 'Tiếp cận đúng đối tượng',
            description: 'Chia sẻ cộng đồng người dùng chất lượng, đúng nhân khẩu học mục tiêu của bạn.',
            color: '#3BA4E8'
        },
        {
            icon: Globe,
            title: 'Mở rộng kênh truyền thông',
            description: 'Tận dụng hệ thống kênh truyền thông đa dạng của CNcode để gia tăng độ phủ.',
            color: '#22C55E'
        },
        {
            icon: Zap,
            title: 'Chi phí thấp, hiệu quả cao',
            description: 'Truyền thông chéo giúp tiết kiệm ngân sách quảng cáo nhưng vẫn đạt hiệu quả lan tỏa vượt trội.',
            color: '#F59E0B'
        },
        {
            icon: Handshake,
            title: 'Hợp tác bền vững',
            description: 'Xây dựng mối quan hệ đối tác chiến lược dài hạn, cùng phát triển và hỗ trợ lẫn nhau.',
            color: '#EF4444'
        },
        {
            icon: Shield,
            title: 'Cam kết minh bạch',
            description: 'Quy trình duyệt chéo rõ ràng, minh bạch, đảm bảo lợi ích công bằng cho cả hai bên.',
            color: '#8B5CF6'
        },
        {
            icon: Target,
            title: 'Tăng độ tin cậy',
            description: 'Được giới thiệu bởi một nền tảng uy tín giúp củng cố niềm tin nơi khách hàng tiềm năng.',
            color: '#EC4899'
        }
    ];

    return (
        <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--cn-bg-main)' }}>
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--cn-text-main)' }}>
                                <Handshake className="w-8 h-8" style={{ color: 'var(--cn-primary)' }} />
                                Truyền thông chéo
                            </h1>
                            <p style={{ color: 'var(--cn-text-sub)' }}>Hợp tác cùng phát triển với CNcode</p>
                        </div>
                        {token && (
                            <div className="flex gap-2 flex-wrap">
                                <CustomButton onClick={handleOpenRequestModal}>
                                    <Send className="w-4 h-4 mr-2" />
                                    Gửi yêu cầu
                                </CustomButton>
                                <CustomButton variant="secondary" onClick={() => setIsListModalOpen(true)}>
                                    Yêu cầu của tôi
                                </CustomButton>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Banner */}
                <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'var(--cn-bg-card)', border: '1px solid var(--cn-border)' }}>
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--cn-primary)' }} />
                        <div>
                            <p className="text-sm" style={{ color: 'var(--cn-text-main)' }}>
                                CNcode hợp tác với các tổ chức, doanh nghiệp để trao đổi bài đăng truyền thông - mỗi bên giới thiệu về đối tác đến cộng đồng của mình.
                                {' '}
                                <button
                                    onClick={() => setIsOpenPolicy(true)}
                                    className="text-blue-500 hover:underline"
                                >
                                    Xem chính sách →
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                {/* How It Works */}
                <div className="mb-16">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--cn-text-main)]">
                            Quy trình hợp tác
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div key={index} className="relative bg-[var(--cn-bg-card)] rounded-2xl p-6 border border-[var(--cn-border)] shadow-sm text-center flex flex-col justify-between min-h-[200px]">
                                    <div>
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                            style={{ backgroundColor: `${step.color}15` }}
                                        >
                                            <Icon className="w-7 h-7" style={{ color: step.color }} />
                                        </div>
                                        <h3 className="text-base font-bold text-[var(--cn-text-main)] mb-2">{step.title}</h3>
                                    </div>
                                    <p className="text-xs text-[var(--cn-text-sub)] mt-2">{step.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Benefits */}
                <div className="mb-16">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--cn-text-main)] mb-3">
                            Tại sao nên truyền thông chéo với CNcode?
                        </h2>
                        <p className="text-[var(--cn-text-muted)] max-w-2xl mx-auto">
                            Hợp tác truyền thông chéo mang lại giá trị vượt trội cho cả hai bên
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {benefits.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-[var(--cn-bg-card)] rounded-2xl p-6 border border-[var(--cn-border)] shadow-sm hover:shadow-md transition-all group"
                                >
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                                        style={{ backgroundColor: `${item.color}15` }}
                                    >
                                        <Icon className="w-6 h-6" style={{ color: item.color }} />
                                    </div>
                                    <h3 className="text-lg font-bold text-[var(--cn-text-main)] mb-2">{item.title}</h3>
                                    <p className="text-sm text-[var(--cn-text-sub)] leading-relaxed">{item.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Who is this for */}
                <div className="mb-16 bg-[var(--cn-bg-card)] rounded-2xl p-8 md:p-10 border border-[var(--cn-border)] shadow-sm">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--cn-primary)] to-blue-500 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-[var(--cn-text-main)] mb-3">Đối tượng phù hợp</h3>
                            <p className="text-[var(--cn-text-sub)] leading-relaxed mb-4">
                                Chương trình truyền thông chéo của CNcode dành cho:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    'Các trung tâm đào tạo, trường học, tổ chức giáo dục',
                                    'Doanh nghiệp công nghệ, startup muốn tiếp cận nhân tài',
                                    'Công ty cung cấp dịch vụ cho IT (co-working space, sự kiện)',
                                    'Tổ chức phi lợi nhuận, câu lạc bộ, cộng đồng lập trình',
                                    'Nhà tuyển dụng muốn tiếp cận ứng viên CNTT chất lượng',
                                    'Đối tác nội dung, blogger, KOL trong lĩnh vực công nghệ'
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-[var(--cn-success)] mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-[var(--cn-text-sub)]">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Policy Popup Modal */}
            {isOpenPolicy && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-2xl max-h-[85vh] bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--cn-border)]">
                            <h3 className="text-xl font-bold text-[var(--cn-text-main)] flex items-center gap-2">
                                <Shield className="w-5 h-5 text-[var(--cn-primary)]" />
                                Điều khoản & Chính sách Truyền thông chéo
                            </h3>
                            <button
                                onClick={() => setIsOpenPolicy(false)}
                                className="p-1.5 rounded-lg hover:bg-[var(--cn-hover)] text-[var(--cn-text-muted)] hover:text-[var(--cn-text-main)] transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-[var(--cn-text-sub)] leading-relaxed">
                            <section>
                                <h4 className="font-bold text-[var(--cn-text-main)] mb-2">1. Định nghĩa & Mục đích</h4>
                                <p>
                                    Truyền thông chéo (Cross-Promotion) là hình thức hợp tác tự nguyện giữa CNcode và các tổ chức, doanh nghiệp, cộng đồng đối tác. Mục đích nhằm gia tăng nhận diện thương hiệu, chia sẻ tệp khách hàng tiềm năng và tối ưu hóa hiệu quả truyền thông một cách phi lợi nhuận hoặc dựa trên thỏa thuận trao đổi giá trị tương đương.
                                </p>
                            </section>

                            <section>
                                <h4 className="font-bold text-[var(--cn-text-main)] mb-2">2. Tiêu chuẩn Nội dung đăng tải</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Thông tin chính xác, trung thực, không vi phạm pháp luật và các quy chuẩn thuần phong mỹ tục Việt Nam.</li>
                                    <li>Nội dung liên quan trực tiếp đến lĩnh vực Công nghệ thông tin, Giáo dục, Hướng nghiệp, Đào tạo hoặc mang lại giá trị thiết thực cho cộng đồng lập trình viên.</li>
                                    <li>Hình ảnh, video, banner truyền thông đạt độ phân giải tối thiểu theo yêu cầu kỹ thuật của từng kênh và không vi phạm bản quyền.</li>
                                </ul>
                            </section>

                            <section>
                                <h4 className="font-bold text-[var(--cn-text-main)] mb-2">3. Nguyên tắc Hợp tác & Duyệt tin</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><strong>Tương đồng giá trị:</strong> Hai bên cam kết bài đăng có mức độ tiếp cận (Reach/Engagement) và vị trí hiển thị tương đương trên các kênh đã thống nhất.</li>
                                    <li><strong>Quy trình xét duyệt:</strong> CNcode có quyền từ chối hoặc yêu cầu chỉnh sửa nội dung nếu phát hiện dấu hiệu spam, lừa đảo, đa cấp hoặc không phù hợp với định hướng phát triển của nền tảng.</li>
                                    <li><strong>Tần suất & Thời gian:</strong> Khung giờ lên bài và tần suất đăng bài phải được thống nhất tối thiểu 24 giờ trước thời điểm đăng tải chính thức.</li>
                                </ul>
                            </section>

                            <section>
                                <h4 className="font-bold text-[var(--cn-text-main)] mb-2">4. Trách nhiệm của các bên</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Tự chịu trách nhiệm pháp lý đối với nội dung và bản quyền hình ảnh/sản phẩm mà mình cung cấp cho đối tác đăng tải.</li>
                                    <li>Không tự ý chỉnh sửa, gỡ bỏ bài đăng của đối tác trước thời hạn cam kết trừ khi có thỏa thuận khác hoặc có yêu cầu từ cơ quan chức năng.</li>
                                    <li>Phối hợp xử lý nhanh chóng các sự cố truyền thông phát sinh (nếu có).</li>
                                </ul>
                            </section>

                            <section>
                                <h4 className="font-bold text-[var(--cn-text-main)] mb-2">5. Miễn trừ trách nhiệm</h4>
                                <p>
                                    CNcode không chịu trách nhiệm đối với bất kỳ thiệt hại trực tiếp hoặc gián tiếp nào phát sinh từ các sản phẩm, dịch vụ hoặc giao dịch giữa người dùng và đơn vị đối tác liên kết truyền thông chéo.
                                </p>
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--cn-border)] bg-[var(--cn-bg-card)]">
                            <button
                                onClick={() => setIsOpenPolicy(false)}
                                className="px-5 py-2 text-sm font-semibold border border-[var(--cn-border)] rounded-xl hover:bg-[var(--cn-hover)] text-[var(--cn-text-main)] transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Request Modal */}
            {isRequestModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
                    onClick={handleCloseRequestModal}
                >
                    <div
                        className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 py-4 border-b border-[var(--cn-border)] shrink-0">
                            <div className="min-w-0">
                                <h3 className="text-lg sm:text-xl font-bold text-[var(--cn-text-main)] flex items-center gap-2">
                                    <Send className="w-5 h-5 text-[var(--cn-primary)] shrink-0" />
                                    Gửi yêu cầu hợp tác
                                </h3>
                                <p className="text-sm text-[var(--cn-text-sub)] mt-1">
                                    Điền thông tin chi tiết về yêu cầu truyền thông chéo của bạn.
                                </p>
                            </div>
                            <button
                                onClick={handleCloseRequestModal}
                                className="p-2 rounded-lg hover:bg-[var(--cn-hover)] text-[var(--cn-text-muted)] shrink-0"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
                            <CustomInput
                                label="Tiêu đề yêu cầu"
                                placeholder="Ví dụ: Hợp tác quảng bá sự kiện Tech Summit 2024"
                                value={requestTitle}
                                onChange={(e) => setRequestTitle(e.target.value)}
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-[var(--cn-text-main)] mb-2">
                                    Nội dung chi tiết <span className="text-red-500">*</span>
                                </label>
                                <div className="rounded-xl border border-[var(--cn-border)] overflow-hidden">
                                    <CustomEditor ref={editorRef} initialValue="" compact />
                                </div>
                            </div>

                            <CustomSelect
                                label="Loại hình hợp tác"
                                value={requestCooperationType}
                                onChange={(value) => setRequestCooperationType(value as 'blog-post' | 'fanpage-post')}
                                options={cooperationTypeOptions}
                            />

                            <div className="rounded-xl border border-[var(--cn-border)] p-4 space-y-4 bg-[var(--cn-bg-alt)]/40">
                                <p className="text-sm font-medium text-[var(--cn-text-main)]">Thông tin liên hệ (tùy chọn)</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <CustomInput
                                        label="Tổ chức / Doanh nghiệp"
                                        placeholder="Công ty TNHH XYZ"
                                        value={requestOrgName}
                                        onChange={(e) => setRequestOrgName(e.target.value)}
                                    />
                                    <CustomInput
                                        label="Email liên hệ"
                                        placeholder="contact@company.com"
                                        value={requestContactEmail}
                                        onChange={(e) => setRequestContactEmail(e.target.value)}
                                    />
                                    <CustomInput
                                        label="Số điện thoại"
                                        placeholder="0912 345 678"
                                        value={requestContactPhone}
                                        onChange={(e) => setRequestContactPhone(e.target.value)}
                                    />
                                    <CustomInput
                                        label="Website"
                                        placeholder="https://company.com"
                                        value={requestWebsite}
                                        onChange={(e) => setRequestWebsite(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 px-4 sm:px-6 py-4 border-t border-[var(--cn-border)] shrink-0 bg-[var(--cn-bg-card)]">
                            <CustomButton variant="secondary" onClick={handleCloseRequestModal} className="w-full sm:w-auto">
                                Hủy
                            </CustomButton>
                            <CustomButton
                                onClick={handleSubmitRequest}
                                loading={isSubmittingRequest}
                                className="w-full sm:flex-1"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Gửi yêu cầu
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {/* List Requests Modal */}
            {isListModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsListModalOpen(false)}
                >
                    <div
                        className="relative w-full sm:max-w-4xl max-h-[92vh] sm:max-h-[90vh] bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 py-4 border-b border-[var(--cn-border)] shrink-0">
                            <div className="min-w-0">
                                <h3 className="text-lg sm:text-xl font-bold text-[var(--cn-text-main)] flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-[var(--cn-primary)] shrink-0" />
                                    Yêu cầu của tôi
                                </h3>
                                <p className="text-sm text-[var(--cn-text-sub)] mt-1">
                                    Theo dõi trạng thái các yêu cầu truyền thông chéo đã gửi.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsListModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-[var(--cn-hover)] text-[var(--cn-text-muted)] shrink-0"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-4 sm:px-6 py-4 border-b border-[var(--cn-border)] shrink-0">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 min-w-0">
                                    <CustomInputSearch
                                        placeholder="Tìm theo tiêu đề hoặc tổ chức..."
                                        value={searchTerm}
                                        onChange={setSearchTerm}
                                        size="medium"
                                    />
                                </div>
                                <div className="w-full sm:w-48">
                                    <CustomSelect
                                        value={filterStatus}
                                        onChange={setFilterStatus}
                                        options={statusOptions}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                            {loadingRequests ? (
                                <div className="flex flex-col items-center justify-center py-16 text-[var(--cn-text-muted)]">
                                    <Loader2 className="w-8 h-8 animate-spin mb-3 text-[var(--cn-primary)]" />
                                    <p className="text-sm">Đang tải danh sách...</p>
                                </div>
                            ) : filteredRequests.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <FileText className="w-12 h-12 text-[var(--cn-text-muted)] opacity-40 mb-3" />
                                    <p className="text-[var(--cn-text-sub)] font-medium">Chưa có yêu cầu nào</p>
                                    <p className="text-sm text-[var(--cn-text-muted)] mt-1 max-w-xs">
                                        {searchTerm || filterStatus
                                            ? 'Không tìm thấy yêu cầu phù hợp với bộ lọc.'
                                            : 'Bạn chưa gửi yêu cầu truyền thông chéo nào.'}
                                    </p>
                                    {!searchTerm && !filterStatus && (
                                        <CustomButton onClick={() => { setIsListModalOpen(false); handleOpenRequestModal(); }} className="mt-4">
                                            <Send className="w-4 h-4 mr-2" />
                                            Gửi yêu cầu đầu tiên
                                        </CustomButton>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="hidden md:block overflow-x-auto rounded-xl border border-[var(--cn-border)]">
                                        <table className="w-full min-w-[720px]">
                                            <thead className="bg-[var(--cn-bg-alt)] border-b border-[var(--cn-border)]">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--cn-text-sub)] uppercase">Tiêu đề</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--cn-text-sub)] uppercase">Loại</th>
                                                    <th className="px-4 py-3 text-center text-xs font-medium text-[var(--cn-text-sub)] uppercase">Trạng thái</th>
                                                    <th className="px-4 py-3 text-center text-xs font-medium text-[var(--cn-text-sub)] uppercase">Ngày gửi</th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-[var(--cn-text-sub)] uppercase">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--cn-border)]">
                                                {filteredRequests.map((request) => (
                                                    <tr key={request._id} className="hover:bg-[var(--cn-hover)] transition-colors">
                                                        <td className="px-4 py-3">
                                                            <p className="text-sm font-medium text-[var(--cn-text-main)] line-clamp-1">{request.title}</p>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-[var(--cn-text-sub)] whitespace-nowrap">
                                                            {cooperationTypeMap[request.cooperationType]}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <RequestStatusBadge status={request.status} />
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-sm text-[var(--cn-text-sub)] whitespace-nowrap">
                                                            {format(new Date(request.createdAt), 'dd/MM/yyyy')}
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <button
                                                                onClick={() => handleViewDetailRequest(request)}
                                                                className="p-2 rounded-lg hover:bg-[var(--cn-hover)] text-[var(--cn-primary)] transition"
                                                                title="Xem chi tiết"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="md:hidden space-y-3">
                                        {filteredRequests.map((request) => (
                                            <div
                                                key={request._id}
                                                className="rounded-xl border border-[var(--cn-border)] p-4 bg-[var(--cn-bg-card)] hover:border-[var(--cn-primary)]/30 transition-colors"
                                            >
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <h4 className="text-sm font-semibold text-[var(--cn-text-main)] line-clamp-2 flex-1">
                                                        {request.title}
                                                    </h4>
                                                    <RequestStatusBadge status={request.status} />
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--cn-text-sub)] mb-3">
                                                    <span className="inline-flex items-center gap-1">
                                                        <Share2 className="w-3.5 h-3.5" />
                                                        {cooperationTypeMap[request.cooperationType]}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {format(new Date(request.createdAt), 'dd/MM/yyyy')}
                                                    </span>
                                                </div>
                                                <CustomButton
                                                    variant="secondary"
                                                    size="small"
                                                    onClick={() => handleViewDetailRequest(request)}
                                                    className="w-full"
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Xem chi tiết
                                                </CustomButton>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-[var(--cn-border)] shrink-0 bg-[var(--cn-bg-card)]">
                            {totalPages > 1 ? (
                                <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-[var(--cn-border)] disabled:opacity-40 hover:bg-[var(--cn-hover)] transition"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm text-[var(--cn-text-main)] px-2">
                                        Trang {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-[var(--cn-border)] disabled:opacity-40 hover:bg-[var(--cn-hover)] transition"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="hidden sm:block" />
                            )}
                            <CustomButton variant="secondary" onClick={() => setIsListModalOpen(false)} className="w-full sm:w-auto">
                                Đóng
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {/* View Detail Request Modal */}
            {isViewDetailModalOpen && selectedRequest && (
                <div
                    className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsViewDetailModalOpen(false)}
                >
                    <div
                        className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] bg-[var(--cn-bg-card)] border border-[var(--cn-border)] rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 py-4 border-b border-[var(--cn-border)] shrink-0">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <RequestStatusBadge status={selectedRequest.status} />
                                    <span className="text-xs text-[var(--cn-text-sub)]">
                                        {cooperationTypeMapFull[selectedRequest.cooperationType]}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-[var(--cn-text-main)] line-clamp-2">
                                    {selectedRequest.title}
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsViewDetailModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-[var(--cn-hover)] text-[var(--cn-text-muted)] shrink-0"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
                            <div className="rounded-xl border border-[var(--cn-border)] p-4 bg-[var(--cn-bg-alt)]/40">
                                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cn-text-sub)] mb-2">Nội dung</p>
                                <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--cn-text-sub)]">
                                    <StaticContent content={selectedRequest.content} />
                                </div>
                            </div>

                            {(selectedRequest.requesterInfo.organizationName ||
                                selectedRequest.requesterInfo.contactEmail ||
                                selectedRequest.requesterInfo.contactPhone ||
                                selectedRequest.requesterInfo.website) && (
                                <div className="rounded-xl border border-[var(--cn-border)] p-4 space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cn-text-sub)] mb-1">Thông tin liên hệ</p>
                                    {selectedRequest.requesterInfo.organizationName && (
                                        <p className="text-sm text-[var(--cn-text-main)] flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-[var(--cn-primary)] shrink-0" />
                                            {selectedRequest.requesterInfo.organizationName}
                                        </p>
                                    )}
                                    {selectedRequest.requesterInfo.contactEmail && (
                                        <p className="text-sm text-[var(--cn-text-sub)]">{selectedRequest.requesterInfo.contactEmail}</p>
                                    )}
                                    {selectedRequest.requesterInfo.contactPhone && (
                                        <p className="text-sm text-[var(--cn-text-sub)]">{selectedRequest.requesterInfo.contactPhone}</p>
                                    )}
                                    {selectedRequest.requesterInfo.website && (
                                        <Link
                                            href={selectedRequest.requesterInfo.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-[var(--cn-primary)] hover:underline break-all"
                                        >
                                            {selectedRequest.requesterInfo.website}
                                        </Link>
                                    )}
                                </div>
                            )}

                            <p className="text-sm text-[var(--cn-text-sub)]">
                                Ngày gửi: {format(new Date(selectedRequest.createdAt), 'dd/MM/yyyy HH:mm')}
                            </p>

                            {selectedRequest.adminResponse?.message && (
                                <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
                                    <p className="text-sm font-semibold text-[var(--cn-text-main)] mb-1">Phản hồi từ CNcode</p>
                                    <p className="text-sm text-[var(--cn-text-sub)]">{selectedRequest.adminResponse.message}</p>
                                    {selectedRequest.adminResponse.respondedAt && (
                                        <p className="text-xs text-[var(--cn-text-muted)] mt-2">
                                            {selectedRequest.adminResponse.respondedBy?.fullName || 'Admin'} •{' '}
                                            {format(new Date(selectedRequest.adminResponse.respondedAt), 'dd/MM/yyyy HH:mm')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="px-4 sm:px-6 py-4 border-t border-[var(--cn-border)] shrink-0">
                            <CustomButton variant="secondary" onClick={() => setIsViewDetailModalOpen(false)} className="w-full sm:w-auto">
                                Đóng
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
