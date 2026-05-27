'use client';

import React, { useState } from 'react';
import { BookOpen, PlayCircle, ArrowLeft, CheckCircle2, XCircle, RefreshCcw, Award, ChevronRight, Target } from 'lucide-react';

const QUIZ_DATA = [
    {
        id: "bai17",
        title: "Bài 17: Quản trị cơ sở dữ liệu trên máy tính",
        questions: [
            { id: 1, question: "Lợi ích chính của việc quản trị CSDL trên máy tính là gì?", options: ["Tăng tốc độ xử lý dữ liệu và hạn chế sai sót", "Giảm yêu cầu về phần cứng", "Không cần nhân lực quản lý", "Tăng chi phí quản lý"], correct: 0 },
            { id: 2, question: "Việc quản lý dữ liệu thủ công trước khi có hệ quản trị cơ sở dữ liệu gặp phải khó khăn lớn nhất là gì?", options: ["Khó khăn trong việc lưu trữ dữ liệu", "Khó kiểm soát và đòi hỏi nhiều công sức", "Dễ quản lý nhưng tốn kém", "Không có khó khăn đáng kể"], correct: 1 },
            { id: 3, question: "Trong hệ quản trị CSDL, chức năng nào giúp đảm bảo tính nhất quán của dữ liệu?", options: ["Tính toàn vẹn dữ liệu", "Tính phân quyền người dùng", "Tính khả dụng cao", "Tính bảo mật dữ liệu"], correct: 0 },
            { id: 4, question: "Tại sao MySQL được ưa chuộng trong quản trị CSDL?", options: ["Vì có giá thành thấp", "Vì nó là phần mềm mã nguồn mở và miễn phí", "Vì chỉ hỗ trợ cho các hệ thống nhỏ", "Vì không cần phần cứng mạnh"], correct: 1 },
            { id: 5, question: "Chức năng nào của hệ quản trị CSDL giúp bảo vệ dữ liệu khỏi những truy cập trái phép?", options: ["Tính toàn vẹn dữ liệu", "Tính phân quyền người dùng", "Tính nhất quán dữ liệu", "Tính lưu trữ"], correct: 1 },
            { id: 6, question: "Phần mềm HeidiSQL được sử dụng để làm gì trong quản trị CSDL?", options: ["Quản lý giao diện đồ họa cho MySQL", "Chạy các ứng dụng ngoài hệ thống", "Tăng tốc độ xử lý MySQL", "Quản lý bộ nhớ máy tính"], correct: 0 },
            { id: 7, question: "Một trong những lợi ích của việc sử dụng hệ quản trị CSDL là gì?", options: ["Dữ liệu được lưu trữ trực tiếp trên giấy", "Dữ liệu có thể được truy xuất và chỉnh sửa nhanh chóng", "Hạn chế quyền truy cập của tất cả người dùng", "Không cần kiểm tra dữ liệu"], correct: 1 },
            { id: 8, question: "Hệ quản trị CSDL MySQL chủ yếu được sử dụng trong các trường hợp nào?", options: ["Chỉ dành cho hệ thống nhỏ", "Các hệ thống CSDL lớn và ứng dụng trên Internet", "Các hệ thống không đòi hỏi tính an toàn cao", "Hệ thống không có kết nối mạng"], correct: 1 },
            { id: 9, question: "Một tính năng đặc biệt của HeidiSQL là gì?", options: ["Chỉ hỗ trợ MySQL", "Hỗ trợ nhiều ngôn ngữ, bao gồm tiếng Việt", "Không hỗ trợ kết nối Internet", "Chỉ có trên hệ điều hành Windows"], correct: 1 },
            { id: 10, question: "Lợi ích của hệ quản trị CSDL trong lĩnh vực ngân hàng là gì?", options: ["Giảm thiểu nhân lực", "Tăng thời gian xử lý giao dịch", "Đảm bảo giao dịch chính xác và nhanh chóng", "Hạn chế khả năng tự động hóa"], correct: 2 },
            { id: 11, question: "Tại sao cần phải nhập mật khẩu khi truy cập MySQL với quyền root?", options: ["Để bảo vệ dữ liệu khỏi truy cập trái phép", "Để giới hạn thời gian truy cập", "Để nâng cao tốc độ xử lý", "Để kiểm soát quyền truy cập mạng"], correct: 0 },
        ]
    },
    {
        id: "bai18",
        title: "Bài 18: Thực hành xác định cấu trúc bảng và các trường khóa",
        questions: [
            { id: 1, question: "Trong cấu trúc bảng banthuam(idBanthuam, idBannhac, idCasi) trường nào được chọn làm khóa chính?", options: ["idBanthuam", "idBannhac", "idCasi", "tenBannhac"], correct: 0 },
            { id: 2, question: "Tại sao cần tách bảng casi(idCasi, tenCasi) thay vì lưu trữ trực tiếp tenCasi trong bảng banthuam?", options: ["Giúp giảm dung lượng lưu trữ và tránh trùng lặp dữ liệu", "Giúp lưu trữ nhiều ca sĩ hơn", "Giúp truy vấn nhanh hơn", "Giúp quản lý các bản nhạc phức tạp hơn"], correct: 0 },
            { id: 3, question: "Trong cấu trúc bảng bannhac(idBannhac, tenBannhac, idNhacsi), trường idNhacsi là gì?", options: ["Khóa chính", "Khóa ngoài", "Khóa cắm trùng lặp", "Không có khóa"], correct: 1 },
            { id: 4, question: "Khi cần quản lý thêm thông tin ngày sinh của các ca sĩ trong CSDL, nên thay đổi như thế nào?", options: ["Thêm trường ngaysinh vào bảng banthuam", "Thêm trường ngaysinh vào bảng casi", "Tạo bảng mới lưu trữ thông tin ngày sinh", "Không cần thay đổi"], correct: 1 },
            { id: 5, question: "Nếu muốn quản lý thêm thông tin nơi sinh của nhạc sĩ, CSDL cần thay đổi như thế nào?", options: ["Thêm trường noisinh vào bảng nhacsi", "Thêm trường noisinh vào bảng bannhac", "Tạo bảng mới lưu trữ nơi sinh", "Không cần thay đổi"], correct: 0 },
            { id: 6, question: "Trường nào trong bảng banthuam(idBanthuam, idBannhac, idCasi) là khóa ngoài?", options: ["idBanthuam", "idBannhac và idCasi", "tenBannhac", "tenCasi"], correct: 1 },
            { id: 7, question: "Tại sao cần phải có khóa ngoài trong cơ sở dữ liệu quan hệ?", options: ["Để giảm trùng lặp dữ liệu", "Để tạo mối liên hệ giữa các bảng", "Để làm cho truy vấn nhanh hơn", "Để quản lý được nhiều dữ liệu hơn"], correct: 1 },
            { id: 8, question: "Trong bảng nhacsi(idNhacsi, tenNhacsi), idNhacsi có vai trò gì?", options: ["Khóa ngoài", "Khóa chính", "Chỉ mục", "Trường không cần thiết"], correct: 1 },
            { id: 9, question: "Cặp trường nào không được trùng lặp giá trị trong bảng bannhac(idBannhac, tenBannhac, idNhacsi)?", options: ["idBannhac và idNhacsi", "tenBannhac và idNhacsi", "idBannhac và tenBannhac", "idNhacsi và tenNhacsi"], correct: 1 },
            { id: 10, question: "Lợi ích của việc sử dụng kiểu dữ liệu AUTO_INCREMENT cho các trường khóa chính là gì?", options: ["Tự động tăng giá trị khi thêm bản ghi mới", "Đảm bảo giá trị duy nhất cho mỗi bản ghi", "Giúp truy vấn dữ liệu nhanh hơn", "Cả A và B"], correct: 3 },
        ]
    },
    {
        id: "bai19",
        title: "Bài 19: Thực hành tạo lập cơ sở dữ liệu và các bảng",
        questions: [
            { id: 1, question: "Khi tạo lập cơ sở dữ liệu mới trong MySQL, bộ mã ký tự mặc định nào thường được sử dụng?", options: ["ASCII", "utf8mb3", "Unicode 2 byte", "utf8mb4"], correct: 3 },
            { id: 2, question: "Để tạo bảng 'nhacsi' với trường 'idNhacsi' và 'tenNhacsi', kiểu dữ liệu của 'idNhacsi' là gì?", options: ["VARCHAR", "INT", "TEXT", "FLOAT"], correct: 1 },
            { id: 3, question: "Trong quá trình tạo bảng, nếu muốn trường 'idNhacsi' tự động tăng giá trị, ta phải chọn tùy chọn nào?", options: ["AUTO_INCREMENT", "UNSIGNED", "NOT NULL", "DEFAULT"], correct: 0 },
            { id: 4, question: "Để thiết lập trường 'idNhacsi' làm khóa chính, ta phải thực hiện thao tác nào?", options: ["Chọn AUTO_INCREMENT", "Chọn khóa ngoài", "Chọn PRIMARY trong phần Create new index", "Chọn VARCHAR"], correct: 2 },
            { id: 5, question: "Nếu vô tình chọn sai trường làm khóa chính, cách nào sau đây đúng để sửa lại?", options: ["Xóa bảng và tạo lại", "Nhấp chuột phải vào trường sai và chọn Delete column", "Nhấp đúp chuột vào trường sai và sửa lại khóa chính", "Đặt trường sai làm khóa ngoại"], correct: 2 },
            { id: 6, question: "Sau khi hoàn tất việc khai báo bảng, bước cuối cùng để lưu bảng là gì?", options: ["Đóng cửa sổ tạo bảng", "Nhấn nút Lưu", "Chọn Export", "Chọn Commit"], correct: 1 },
            { id: 7, question: "Khi khai báo trường 'tenNhacsi', kiểu dữ liệu nào phù hợp để lưu tên của nhạc sĩ?", options: ["INT", "VARCHAR", "FLOAT", "DATE"], correct: 1 },
            { id: 8, question: "Khi khai báo trường 'tenNhacsi', độ dài tối đa bao nhiêu thường được sử dụng?", options: ["50", "100", "255", "500"], correct: 1 },
            { id: 9, question: "Nếu muốn tạo thêm trường mới cho bảng 'nhacsi', phím tắt nào sau đây có thể được sử dụng?", options: ["Ctrl+S", "Ctrl+C", "Ctrl+Insert", "Ctrl+Delete"], correct: 2 },
            { id: 10, question: "Khi khai báo trường 'idNhacsi', để đảm bảo rằng trường này không nhận giá trị NULL, cần chọn tùy chọn nào?", options: ["AUTO_INCREMENT", "UNSIGNED", "NOT NULL", "DEFAULT"], correct: 2 },
        ]
    },
    {
        id: "bai20",
        title: "Bài 20: Thực hành tạo lập các bảng có khoá ngoài",
        questions: [
            { id: 1, question: "Trường nào trong bảng 'bannhac' được thiết lập làm khóa chính?", options: ["idNhacsi", "tenBannhac", "idBannhac", "tenNhacsi"], correct: 2 },
            { id: 2, question: "Khi khai báo khóa ngoài cho bảng 'bannhac', trường nào được chọn làm khóa ngoài?", options: ["idBannhac", "tenBannhac", "idNhacsi", "idBanthuam"], correct: 2 },
            { id: 3, question: "Khi khai báo khóa ngoài cho idNhacsi, bảng tham chiếu nào được chọn?", options: ["bannhac", "Nhacsi", "Banthuam", "casi"], correct: 1 },
            { id: 4, question: "Khi khai báo khóa ngoài, kiểu dữ liệu của trường idNhacsi trong bảng 'bannhac' nên là gì?", options: ["VARCHAR", "TEXT", "INT", "FLOAT"], correct: 2 },
            { id: 5, question: "Khi khai báo cặp trường (tenBannhac, idNhacsi) không được trùng lặp giá trị, loại khóa nào được sử dụng?", options: ["PRIMARY", "UNIQUE", "FOREIGN KEY", "INDEX"], correct: 1 },
            { id: 6, question: "Khi tạo bảng 'bannhac', để thêm một trường mới vào bảng, bạn sử dụng thao tác nào?", options: ["Nhấn Ctrl+Alt+Del", "Nhấn Ctrl+Insert", "Nhấn Ctrl+Delete", "Nhấn Alt+Insert"], correct: 1 },
            { id: 7, question: "Giá trị mặc định của trường khóa ngoài idNhacsi trong bảng 'bannhac' nên là gì?", options: ["NULL", "AUTO_INCREMENT", "0", "Một chuỗi rỗng"], correct: 0 },
            { id: 8, question: "Khóa ngoài trong bảng 'bannhac' tham chiếu đến khóa chính ở bảng nào?", options: ["nhacsi", "Casi", "Banthuam", "quận/huyện"], correct: 0 },
            { id: 9, question: "Thao tác nào được sử dụng để khai báo khóa chính cho trường idBannhac?", options: ["Chọn 'Create new index' → 'UNIQUE'", "Chọn 'Create new index' → 'PRIMARY'", "Chọn 'Create new index' → 'FOREIGN KEY'", "Chọn 'Create new index' → 'INDEX'"], correct: 1 },
            { id: 10, question: "Sau khi khai báo xong các trường trong bảng 'bannhac', thao tác cuối cùng là gì?", options: ["Chọn 'Tạo bảng mới'", "Chọn 'Xóa bảng'", "Chọn 'Lưu'", "Chọn 'Chỉnh sửa khóa'"], correct: 2 },
        ]
    },
    {
        id: "bai21",
        title: "Bài 21: Thực hành cập nhật và truy xuất dữ liệu các bảng",
        questions: [
            { id: 1, question: "Chọn thao tác nào để thêm dữ liệu mới vào bảng trong HeidiSQL?", options: ["Nhấn phím Delete", "Nhấn phím Insert", "Nhấn phím Ctrl + S", "Nhấn phím Alt + Enter"], correct: 1 },
            { id: 2, question: "Khi chỉnh sửa dữ liệu trong bảng, để sửa nội dung của một ô dữ liệu, ta thực hiện thao tác nào?", options: ["Nhấn đôi chuột vào ô cần sửa", "Chọn ô rồi nhấn phím Delete", "Chọn ô rồi nhấn phím Ctrl + Enter", "Chọn ô rồi nhấn phím F"], correct: 0 },
            { id: 3, question: "Trong HeidiSQL, tổ hợp phím nào được sử dụng để xóa các dòng dữ liệu đã chọn?", options: ["Ctrl + Delete", "Shift + Delete", "Alt + Delete", "Ctrl + Shift"], correct: 1 },
            { id: 4, question: "Để sắp xếp dữ liệu trong bảng theo thứ tự giảm dần của một trường (column), ta thực hiện thao tác nào?", options: ["Nhấp chuột phải vào tiêu đề cột và chọn 'Sort Descending'", "Nhấn đôi chuột vào tiêu đề cột", "Nhấn chuột vào tiêu đề cột, sau đó chọn biểu tượng tam giác", "Nhấp chuột vào tiêu đề cột"], correct: 0 },
            { id: 5, question: "Câu lệnh SQL nào dùng để lấy tất cả các trường trong bảng 'nhacsi'?", options: ["SELECT * FROM nhacsi", "SELECT idNhacsi, tenNhacsi FROM nhacsi", "SELECT nhacsi.* FROM nhacsi", "SELECT * FROM nhacsi WHERE idNhacsi > 0"], correct: 0 },
            { id: 6, question: "Để tìm kiếm các bản ghi có tên nhạc sĩ bắt đầu bằng chữ 'P', câu lệnh SQL nào là đúng?", options: ["SELECT * FROM nhacsi WHERE tenNhacsi = 'P%'", "SELECT * FROM nhacsi WHERE tenNhacsi LIKE 'P%'", "SELECT * FROM nhacsi WHERE tenNhacsi LIKE '%P%'", "SELECT * FROM nhacsi WHERE tenNhacsi LIKE '%P'"], correct: 1 },
            { id: 7, question: "Khi muốn xóa tất cả các bản ghi trong bảng 'nhacsi', nhưng vẫn giữ cấu trúc bảng, ta sử dụng câu lệnh nào?", options: ["DELETE FROM nhacsi", "DROP TABLE nhacsi", "TRUNCATE TABLE nhacsi", "DELETE * FROM nhacsi"], correct: 2 },
            { id: 8, question: "Trong HeidiSQL, để lọc dữ liệu với tiêu chí 'LIKE', ta chọn tùy chọn nào?", options: ["Edit > Filter > LIKE", "Nhấp chuột phải vào cột dữ liệu, chọn Quick Filter và chọn LIKE", "View > Data Filter > LIKE", "Filter > Apply LIKE Condition"], correct: 1 },
            { id: 9, question: "Để xem toàn bộ dữ liệu trong bảng 'nhacsi' trong HeidiSQL, ta thực hiện thao tác nào?", options: ["Mở bảng 'nhacsi' và chọn thẻ 'Dữ liệu'", "Chọn thẻ 'Truy vấn', nhập câu truy vấn SQL", "Chọn thẻ 'Thiết kế bảng'", "Mở bảng 'nhacsi' và nhấn F5"], correct: 0 },
            { id: 10, question: "Câu lệnh SQL nào sau đây dùng để sắp xếp dữ liệu theo tên nhạc sĩ theo thứ tự tăng dần?", options: ["SELECT * FROM nhacsi ORDER BY tenNhacsi DESC", "SELECT * FROM nhacsi ORDER BY tenNhacsi ASC", "SELECT * FROM nhacsi ORDER BY idNhacsi", "SELECT * FROM nhacsi WHERE ORDER BY tenNhacsi ASC"], correct: 1 },
        ]
    }
];

export default function LuyenTapPage() {
    
    const [view, setView] = useState<'list' | 'quiz'>('list');
    const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const quiz = QUIZ_DATA.find(q => q.id === selectedQuizId);

    const handleStartQuiz = (id: string) => {
        setSelectedQuizId(id);
        setUserAnswers({});
        setIsSubmitted(false);
        setView('quiz');
        window.scrollTo(0, 0);
    };

    const handleSelectOption = (qId: number, oIdx: number) => {
        if (isSubmitted) return;
        setUserAnswers(prev => ({ ...prev, [qId]: oIdx }));
    };

    const handleSubmit = () => {
        if (!quiz) return;
        if (Object.keys(userAnswers).length < quiz.questions.length) {
            if (!confirm("Bạn chưa chọn hết đáp án. Vẫn nộp bài chứ?")) return;
        }
        setIsSubmitted(true);
        window.scrollTo(0, 0);
    };

    const getScore = () => {
        if (!quiz) return 0;
        return quiz.questions.reduce((acc, q) => (userAnswers[q.id] === q.correct ? acc + 1 : acc), 0);
    };

    if (view === 'list') {
        return (
            <div className="min-h-screen bg-gray-50/50 p-6 lg:p-10">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-10 text-center sm:text-left">
                        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Hệ thống luyện tập</h1>
                        <p className="text-gray-500 text-sm mt-1 font-medium">Ôn tập kiến thức CSDL cùng CN Books</p>
                    </div>

                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">STT</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tên bài học</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Câu hỏi</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {QUIZ_DATA.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-blue-50/30 transition-all group">
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-bold text-gray-300 group-hover:text-blue-200">{(idx + 1).toString().padStart(2, '0')}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        <BookOpen className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700">{item.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-400">
                                                    {item.questions.length} CÂU
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => handleStartQuiz(item.id)}
                                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-all shadow-md shadow-gray-200"
                                                >
                                                    Làm bài
                                                    <PlayCircle className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!quiz) return null;
    const score = getScore();

    return (
        <div className="min-h-screen bg-gray-50/30 pb-24">
            {}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={() => setView('list')}
                        className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold text-sm transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> QUAY LẠI
                    </button>
                    <div className="hidden sm:block font-black text-gray-800 text-sm truncate px-4">{quiz.title}</div>
                    {isSubmitted ? (
                        <div className="px-4 py-1 bg-blue-600 text-white rounded-full text-xs font-black">
                            {score} / {quiz.questions.length} ĐIỂM
                        </div>
                    ) : (
                        <div className="px-4 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black">
                            ĐANG LÀM BÀI
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-6 mt-8">
                {}
                {isSubmitted && (
                    <div className="mb-10 bg-white rounded-[32px] p-8 border border-blue-100 shadow-xl shadow-blue-50 text-center animate-in fade-in zoom-in duration-500">
                        <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Hoàn thành bài tập!</h2>
                        <p className="text-gray-500 font-medium mb-6">Bạn đạt được <span className="text-blue-600 font-black">{score}</span> trên tổng số <span className="font-black">{quiz.questions.length}</span> câu hỏi.</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => { setIsSubmitted(false); setUserAnswers({}); }} className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-200 transition-all flex items-center gap-2">
                                <RefreshCcw className="w-4 h-4" /> Làm lại
                            </button>
                            <button onClick={() => setView('list')} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                                Kết thúc bài học
                            </button>
                        </div>
                    </div>
                )}

                {}
                <div className="space-y-6">
                    {quiz.questions.map((q, qIdx) => (
                        <div key={q.id} className={`bg-white rounded-[28px] border transition-all p-6 sm:p-8 ${isSubmitted
                            ? (userAnswers[q.id] === q.correct ? 'border-green-200 bg-green-50/20' : 'border-red-200 bg-red-50/20')
                            : 'border-gray-100 shadow-sm'
                            }`}>
                            <div className="flex items-start gap-4 mb-8">
                                <span className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-[11px] font-black text-gray-400 shrink-0">
                                    {(qIdx + 1).toString().padStart(2, '0')}
                                </span>
                                <p className="text-gray-800 font-bold text-base leading-relaxed pt-1">{q.question}</p>
                            </div>

                            <div className="grid gap-3 sm:pl-12">
                                {q.options.map((option, oIdx) => {
                                    const isSelected = userAnswers[q.id] === oIdx;
                                    const isCorrect = q.correct === oIdx;

                                    let btnClass = "border-gray-100 hover:bg-gray-50 text-gray-600";
                                    if (isSubmitted) {
                                        if (isCorrect) btnClass = "border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500";
                                        else if (isSelected) btnClass = "border-red-400 bg-red-50 text-red-700";
                                        else btnClass = "opacity-40 border-gray-100";
                                    } else if (isSelected) {
                                        btnClass = "border-blue-500 bg-blue-50 text-blue-700";
                                    }

                                    return (
                                        <button
                                            key={oIdx}
                                            disabled={isSubmitted}
                                            onClick={() => handleSelectOption(q.id, oIdx)}
                                            className={`group flex items-center p-4 rounded-2xl border-2 text-left text-sm font-semibold transition-all ${btnClass}`}
                                        >
                                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black mr-4 transition-colors ${isSelected ? 'bg-current text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600'
                                                }`}>
                                                {String.fromCharCode(65 + oIdx)}
                                            </span>
                                            <span className="flex-1">{option}</span>
                                            {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500 ml-2" />}
                                            {isSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400 ml-2" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {}
                {!isSubmitted && (
                    <div className="mt-12 flex justify-center">
                        <button
                            onClick={handleSubmit}
                            className="px-10 py-4 bg-gray-900 text-white rounded-[20px] font-black text-sm hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 flex items-center gap-3 active:scale-95"
                        >
                            <Target className="w-5 h-5" /> NỘP BÀI VÀ CHẤM ĐIỂM
                        </button>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
            `}</style>
        </div>
    );
}
