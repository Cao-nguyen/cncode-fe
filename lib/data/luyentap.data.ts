// Mock data cho bài tập luyện tập - extracted from ĐỀ CƯƠNG ÔN TẬP HỌC KỲ II - TIN HỌC 11

export interface LuyentapQuestion {
    id: string;
    type: 'tracnghiem' | 'dungsai' | 'traloingan';
    content: string;
    options?: string[];
    correctAnswer: string | string[];
    explanation?: string;
}

export interface LuyentapExercise {
    _id: string;
    title: string;
    description: string;
    duration: number;
    questions: LuyentapQuestion[];
    tier: 'tin11' | 'tin10';
    status: 'approved';
    createdAt: string;
}

// Bài 17: Quản trị CSDL
export const LUYENTAP_DATA: LuyentapExercise[] = [
    {
        _id: 'luyentap-17',
        title: 'Bài 17: Quản trị cơ sở dữ liệu trên máy tính',
        description: 'Ôn tập về quản trị CSDL trên máy tính - Tin học 11',
        duration: 30,
        tier: 'tin11',
        status: 'approved',
        createdAt: '2026-07-01T00:00:00.000Z',
        questions: [
            {
                id: 'c17-1',
                type: 'tracnghiem',
                content: 'Lợi ích chính của việc quản trị CSDL trên máy tính là gì?',
                options: [
                    'Tăng tốc độ xử lý dữ liệu và hạn chế sai sót',
                    'Giảm yêu cầu về phần cứng',
                    'Không cần nhân lực quản lý',
                    'Tăng chi phí quản lý'
                ],
                correctAnswer: 'Tăng tốc độ xử lý dữ liệu và hạn chế sai sót',
                explanation: 'Hệ quản trị CSDL giúp xử lý dữ liệu nhanh chóng và chính xác hơn.'
            },
            {
                id: 'c17-2',
                type: 'tracnghiem',
                content: 'Việc quản lý dữ liệu thủ công trước khi có hệ quản trị cơ sở dữ liệu gặp phải khó khăn lớn nhất là gì?',
                options: [
                    'Khó khăn trong việc lưu trữ dữ liệu',
                    'Khó kiểm soát và đòi hỏi nhiều công sức',
                    'Dễ quản lý nhưng tốn kém',
                    'Không có khó khăn đáng kể'
                ],
                correctAnswer: 'Khó kiểm soát và đòi hỏi nhiều công sức',
                explanation: 'Quản lý thủ công rất mất công sức và khó kiểm soát dữ liệu.'
            },
            {
                id: 'c17-3',
                type: 'tracnghiem',
                content: 'Trong hệ quản trị CSDL, chức năng nào giúp đảm bảo tính nhất quán của dữ liệu?',
                options: [
                    'Tính toàn vẹn dữ liệu',
                    'Tính phân quyền người dùng',
                    'Tính khả dụng cao',
                    'Tính bảo mật dữ liệu'
                ],
                correctAnswer: 'Tính toàn vẹn dữ liệu',
                explanation: 'Tính toàn vẹn dữ liệu đảm bảo dữ liệu luôn nhất quán và chính xác.'
            },
            {
                id: 'c17-4',
                type: 'tracnghiem',
                content: 'Tại sao MySQL được ưa chuộng trong quản trị CSDL?',
                options: [
                    'Vì có giá thành thấp',
                    'Vì nó là phần mềm mã nguồn mở và miễn phí',
                    'Vì chỉ hỗ trợ cho các hệ thống nhỏ',
                    'Vì không cần phần cứng mạnh'
                ],
                correctAnswer: 'Vì nó là phần mềm mã nguồn mở và miễn phí',
                explanation: 'MySQL là phần mềm mã nguồn mở nên miễn phí và phổ biến.'
            },
            {
                id: 'c17-5',
                type: 'tracnghiem',
                content: 'Chức năng nào của hệ quản trị CSDL giúp bảo vệ dữ liệu khỏi những truy cập trái phép?',
                options: [
                    'Tính toàn vẹn dữ liệu',
                    'Tính phân quyền người dùng',
                    'Tính nhất quán dữ liệu',
                    'Tính lưu trữ'
                ],
                correctAnswer: 'Tính phân quyền người dùng',
                explanation: 'Tính phân quyền giúp kiểm soát ai được truy cập dữ liệu nào.'
            },
            {
                id: 'c17-6',
                type: 'tracnghiem',
                content: 'Phần mềm HeidiSQL được sử dụng để làm gì trong quản trị CSDL?',
                options: [
                    'Quản lý giao diện đồ họa cho MySQL',
                    'Chạy các ứng dụng ngoài hệ thống',
                    'Tăng tốc độ xử lý MySQL',
                    'Quản lý bộ nhớ máy tính'
                ],
                correctAnswer: 'Quản lý giao diện đồ họa cho MySQL',
                explanation: 'HeidiSQL là công cụ quản lý CSDL MySQL với giao diện đồ họa.'
            }
        ]
    },
    // Bài 18: Thực hành xác định cấu trúc bảng
    {
        _id: 'luyentap-18',
        title: 'Bài 18: Thực hành xác định cấu trúc bảng và các trường khóa',
        description: 'Ôn tập về cấu trúc bảng và các loại khóa trong CSDL - Tin học 11',
        duration: 30,
        tier: 'tin11',
        status: 'approved',
        createdAt: '2026-07-01T00:00:00.000Z',
        questions: [
            {
                id: 'c18-1',
                type: 'tracnghiem',
                content: 'Trong cấu trúc bảng banthuam(idBanthuam, idBannhac, idCasi) trường nào được chọn làm khóa chính?',
                options: ['idBanthuam', 'idBannhac', 'idCasi', 'tenBannhac'],
                correctAnswer: 'idBanthuam',
                explanation: 'idBanthuam là khóa chính dùng để phân biệt từng bản ghi.'
            },
            {
                id: 'c18-2',
                type: 'tracnghiem',
                content: 'Tại sao cần tách bảng casi(idCasi, tenCasi) thay vì lưu trữ trực tiếp tenCasi trong bảng banthuam?',
                options: [
                    'Giúp giảm dung lượng lưu trữ và tránh trùng lặp dữ liệu',
                    'Giúp lưu trữ nhiều ca sĩ hơn',
                    'Giúp truy vấn nhanh hơn',
                    'Giúp quản lý các bản nhạc phức tạp hơn'
                ],
                correctAnswer: 'Giúp giảm dung lượng lưu trữ và tránh trùng lặp dữ liệu',
                explanation: 'Tách bảng giúp chuẩn hóa CSDL, tránh dữ liệu trùng lặp.'
            },
            {
                id: 'c18-3',
                type: 'tracnghiem',
                content: 'Trong cấu trúc bảng bannhac(idBannhac, tenBannhac, idNhacsi), trường idNhacsi là gì?',
                options: ['Khóa chính', 'Khóa ngoài', 'Khóa cắm trùng lặp', 'Không có khóa'],
                correctAnswer: 'Khóa ngoài',
                explanation: 'idNhacsi tham chiếu đến bảng nhacsi nên là khóa ngoài.'
            },
            {
                id: 'c18-4',
                type: 'tracnghiem',
                content: 'Khi cần quản lý thêm thông tin ngày sinh của các ca sĩ trong CSDL, nên thay đổi như thế nào?',
                options: [
                    'Thêm trường ngaysinh vào bảng banthuam',
                    'Thêm trường ngaysinh vào bảng casi',
                    'Tạo bảng mới lưu trữ thông tin ngày sinh',
                    'Không cần thay đổi'
                ],
                correctAnswer: 'Thêm trường ngaysinh vào bảng casi',
                explanation: 'Thông tin ca sĩ nên lưu trong bảng casi.'
            },
            {
                id: 'c18-5',
                type: 'tracnghiem',
                content: 'Nếu muốn quản lý thêm thông tin nơi sinh của nhạc sĩ, CSDL cần thay đổi như thế nào?',
                options: [
                    'Thêm trường noisinh vào bảng nhacsi',
                    'Thêm trường noisinh vào bảng bannhac',
                    'Tạo bảng mới lưu trữ nơi sinh',
                    'Không cần thay đổi'
                ],
                correctAnswer: 'Thêm trường noisinh vào bảng nhacsi',
                explanation: 'Thông tin nhạc sĩ nên lưu trong bảng nhacsi.'
            },
            {
                id: 'c18-6',
                type: 'tracnghiem',
                content: 'Trường nào trong bảng banthuam(idBanthuam, idBannhac, idCasi) là khóa ngoài?',
                options: ['idBanthuam', 'idBannhac và idCasi', 'tenBannhac', 'tenCasi'],
                correctAnswer: 'idBannhac và idCasi',
                explanation: 'Cả idBannhac và idCasi đều tham chiếu đến bảng khác.'
            }
        ]
    },
    // Bài 19: Thực hành tạo lập cơ sở dữ liệu
    {
        _id: 'luyentap-19',
        title: 'Bài 19: Thực hành tạo lập cơ sở dữ liệu và các bảng',
        description: 'Ôn tập về tạo lập CSDL và các bảng - Tin học 11',
        duration: 30,
        tier: 'tin11',
        status: 'approved',
        createdAt: '2026-07-01T00:00:00.000Z',
        questions: [
            {
                id: 'c19-1',
                type: 'tracnghiem',
                content: 'Khi tạo lập cơ sở dữ liệu mới trong MySQL, bộ mã ký tự mặc định nào thường được sử dụng?',
                options: ['ASCII', 'utf8mb3', 'Unicode 2 byte', 'utf8mb4'],
                correctAnswer: 'utf8mb4',
                explanation: 'utf8mb4 là bộ mã ký tự mặc định, hỗ trợ đầy đủ Unicode.'
            },
            {
                id: 'c19-2',
                type: 'tracnghiem',
                content: 'Để tạo bảng "nhacsi" với trường "idNhacsi" và "tenNhacsi", kiểu dữ liệu của "idNhacsi" là gì?',
                options: ['VARCHAR', 'INT', 'TEXT', 'FLOAT'],
                correctAnswer: 'INT',
                explanation: 'Trường khóa thường dùng kiểu INT cho hiệu suất.'
            },
            {
                id: 'c19-3',
                type: 'tracnghiem',
                content: 'Trong quá trình tạo bảng, nếu muốn trường "idNhacsi" tự động tăng giá trị, ta phải chọn tùy chọn nào?',
                options: ['AUTO_INCREMENT', 'UNSIGNED', 'NOT NULL', 'DEFAULT'],
                correctAnswer: 'AUTO_INCREMENT',
                explanation: 'AUTO_INCREMENT tự động tăng giá trị khi thêm bản ghi mới.'
            },
            {
                id: 'c19-4',
                type: 'tracnghiem',
                content: 'Để thiết lập trường "idNhacsi" làm khóa chính, ta phải thực hiện thao tác nào?',
                options: [
                    'Chọn AUTO_INCREMENT',
                    'Chọn khóa ngoại',
                    'Chọn PRIMARY trong phần Create new index',
                    'Chọn VARCHAR'
                ],
                correctAnswer: 'Chọn PRIMARY trong phần Create new index',
                explanation: 'Chọn PRIMARY để đặt khóa chính cho trường.'
            },
            {
                id: 'c19-5',
                type: 'tracnghiem',
                content: 'Nếu vô tình chọn sai trường làm khóa chính, cách nào sau đây đúng để sửa lại?',
                options: [
                    'Xóa bảng và tạo lại',
                    'Nhấp chuột phải vào trường sai và chọn Delete column',
                    'Nhấp đúp chuột vào trường sai và sửa lại khóa chính',
                    'Đặt trường sai làm khóa ngoại'
                ],
                correctAnswer: 'Nhấp đúp chuột vào trường sai và sửa lại khóa chính',
                explanation: 'Có thể chỉnh sửa trực tiếp trường khóa chính.'
            },
            {
                id: 'c19-6',
                type: 'tracnghiem',
                content: 'Sau khi hoàn tất việc khai báo bảng, bước cuối cùng để lưu bảng là gì?',
                options: ['Đóng cửa sổ tạo bảng', 'Nhấn nút Lưu', 'Chọn Export', 'Chọn Commit'],
                correctAnswer: 'Chọn Commit',
                explanation: 'Commit là bước cuối cùng để lưu cấu trúc bảng.'
            }
        ]
    },
    // Bài 20: Thực hành tạo lập các bảng có khóa ngoài
    {
        _id: 'luyentap-20',
        title: 'Bài 20: Thực hành tạo lập các bảng có khoá ngoài',
        description: 'Ôn tập về khóa ngoài trong CSDL - Tin học 11',
        duration: 30,
        tier: 'tin11',
        status: 'approved',
        createdAt: '2026-07-01T00:00:00.000Z',
        questions: [
            {
                id: 'c20-1',
                type: 'tracnghiem',
                content: 'Trường nào trong bảng "bannhac" được thiết lập làm khóa chính?',
                options: ['idNhacsi', 'tenBannhac', 'idBannhac', 'tenNhacsi'],
                correctAnswer: 'idBannhac',
                explanation: 'idBannhac là khóa chính cho bảng bannhac.'
            },
            {
                id: 'c20-2',
                type: 'tracnghiem',
                content: 'Khi khai báo khóa ngoài cho bảng "bannhac", trường nào được chọn làm khóa ngoài?',
                options: ['idBannhac', 'tenBannhac', 'idNhacsi', 'idBanthuam'],
                correctAnswer: 'idNhacsi',
                explanation: 'idNhacsi là khóa ngoài tham chiếu đến bảng nhacsi.'
            },
            {
                id: 'c20-3',
                type: 'tracnghiem',
                content: 'Khi khai báo khóa ngoài cho idNhacsi, bảng tham chiếu nào được chọn?',
                options: ['bannhac', 'Nhacsi', 'Banthuam', 'casi'],
                correctAnswer: 'Nhacsi',
                explanation: 'idNhacsi tham chiếu đến bảng nhacsi.'
            },
            {
                id: 'c20-4',
                type: 'tracnghiem',
                content: 'Khi khai báo khóa ngoài, kiểu dữ liệu của trường idNhacsi trong bảng "bannhac" nên là gì?',
                options: ['VARCHAR', 'TEXT', 'INT', 'FLOAT'],
                correctAnswer: 'INT',
                explanation: 'Kiểu dữ liệu phải giống với trường tham chiếu trong bảng nhacsi.'
            },
            {
                id: 'c20-5',
                type: 'tracnghiem',
                content: 'Khi khai báo cặp trường (tenBannhac, idNhacsi) không được trùng lặp giá trị, loại khóa nào được sử dụng?',
                options: ['PRIMARY', 'UNIQUE', 'FOREIGN KEY', 'INDEX'],
                correctAnswer: 'UNIQUE',
                explanation: 'UNIQUE đảm bảo cặp giá trị không bị trùng lặp.'
            },
            {
                id: 'c20-6',
                type: 'tracnghiem',
                content: 'Khóa ngoài trong bảng "bannhac" tham chiếu đến khóa chính ở bảng nào?',
                options: ['nhacsi', 'Casi', 'Banthuam', 'quận/huyện'],
                correctAnswer: 'nhacsi',
                explanation: 'idNhacsi tham chiếu đến khóa chính trong bảng nhacsi.'
            }
        ]
    },
    // Bài 21: Thực hành cập nhật và truy xuất dữ liệu
    {
        _id: 'luyentap-21',
        title: 'Bài 21: Thực hành cập nhật và truy xuất dữ liệu các bảng',
        description: 'Ôn tập về cập nhật và truy xuất dữ liệu - Tin học 11',
        duration: 30,
        tier: 'tin11',
        status: 'approved',
        createdAt: '2026-07-01T00:00:00.000Z',
        questions: [
            {
                id: 'c21-1',
                type: 'tracnghiem',
                content: 'Chọn thao tác nào để thêm dữ liệu mới vào bảng trong HeidiSQL?',
                options: ['Nhấn phím Delete', 'Nhấn phím Insert', 'Nhấn phím Ctrl + S', 'Nhấn phím Alt + Enter'],
                correctAnswer: 'Nhấn phím Insert',
                explanation: 'Phím Insert dùng để thêm bản ghi mới.'
            },
            {
                id: 'c21-2',
                type: 'tracnghiem',
                content: 'Khi chỉnh sửa dữ liệu trong bảng, để sửa nội dung của một ô dữ liệu, ta thực hiện thao tác nào?',
                options: [
                    'Nhấn đôi chuột vào ô cần sửa',
                    'Chọn ô rồi nhấn phím Delete',
                    'Chọn ô rồi nhấn phím Ctrl + Enter',
                    'Chọn ô rồi nhấn phím F'
                ],
                correctAnswer: 'Nhấn đôi chuột vào ô cần sửa',
                explanation: 'Double-click vào ô để sửa trực tiếp.'
            },
            {
                id: 'c21-3',
                type: 'tracnghiem',
                content: 'Trong HeidiSQL, tổ hợp phím nào được sử dụng để xóa các dòng dữ liệu đã chọn?',
                options: ['Ctrl + Delete', 'Shift + Delete', 'Alt + Delete', 'Ctrl + Shift'],
                correctAnswer: 'Ctrl + Delete',
                explanation: 'Tổ hợp phím Ctrl + Delete xóa các dòng đã chọn.'
            },
            {
                id: 'c21-4',
                type: 'tracnghiem',
                content: 'Để sắp xếp dữ liệu theo thứ tự giảm dần của một trường, ta thực hiện thao tác nào?',
                options: [
                    'Nhấp chuột phải vào tiêu đề cột và chọn "Sort Descending"',
                    'Nhấn đôi chuột vào tiêu đề cột',
                    'Nhấn chuột vào tiêu đề cột, sau đó chọn biểu tượng tam giác',
                    'Nhấp chuột vào tiêu đề cột'
                ],
                correctAnswer: 'Nhấp chuột phải vào tiêu đề cột và chọn "Sort Descending"',
                explanation: 'Right-click menu có tùy chọn Sort Descending.'
            },
            {
                id: 'c21-5',
                type: 'tracnghiem',
                content: 'Câu lệnh SQL nào dùng để lấy tất cả các trường trong bảng "nhacsi"?',
                options: [
                    'SELECT * FROM nhacsi',
                    'SELECT idNhacsi, tenNhacsi FROM nhacsi',
                    'SELECT nhacsi.* FROM nhacsi',
                    'SELECT * FROM nhacsi WHERE idNhacsi > 0'
                ],
                correctAnswer: 'SELECT * FROM nhacsi',
                explanation: 'SELECT * truy xuất tất cả các trường.'
            },
            {
                id: 'c21-6',
                type: 'tracnghiem',
                content: 'Để tìm kiếm các bản ghi có tên nhạc sĩ bắt đầu bằng chữ "P", câu lệnh SQL nào là đúng?',
                options: [
                    'SELECT * FROM nhacsi WHERE tenNhacsi = \'P%\'',
                    'SELECT * FROM nhacsi WHERE tenNhacsi LIKE \'P%\'',
                    'SELECT * FROM nhacsi WHERE tenNhacsi LIKE \'%P%\'',
                    'SELECT * FROM nhacsi WHERE tenNhacsi LIKE \'%P\''
                ],
                correctAnswer: 'SELECT * FROM nhacsi WHERE tenNhacsi LIKE \'P%\'',
                explanation: 'LIKE với % ở cuối tìm chuỗi bắt đầu bằng P.'
            }
        ]
    }
];