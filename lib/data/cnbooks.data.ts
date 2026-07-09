export interface BookContent {
    type: 'paragraph' | 'note' | 'heading' | 'code';
    text?: string;
    style?: 'tip' | 'warning' | 'important';
    level?: number;
    language?: string;
    code?: string;
    caption?: string;
}

export interface BookExercise {
    id: string;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    starterCode: string;
    solution: string;
    testCases: { input: string; expectedOutput: string }[];
    hints: string[];
    userCode: string;
    completed: boolean;
}

export interface BookQuiz {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
}

export interface BookLesson {
    id: string;
    order: number;
    title: string;
    slug: string;
    duration: string;
    difficulty: string;
    objectives: string[];
    content: BookContent[];
    notesEnabled: boolean;
    userNotes: string[];
    keyTakeaways: string[];
    exercises: BookExercise[];
    quiz: BookQuiz[];
}

export interface Book {
    title: string;
    subtitle: string;
    description: string;
    language: string;
    level: string;
    totalLessons: number;
    estimatedTotalTime: string;
    features: string[];
    version: string;
}

export interface CnBookData {
    book: Book;
    lessons: BookLesson[];
}

// Data cho cuốn Python Cơ Bản Cho Người Mới Bắt đầu
export const CNBOOKS_DATA: CnBookData = {
    book: {
        title: "Python Cơ Bản Cho Người Mới Bắt Đầu",
        subtitle: "Học Python từ con số 0 qua 20 bài học tương tác",
        description: "Một cuốn sách Python cơ bản dạng dữ liệu tương tác: mỗi bài học có lý thuyết, ví dụ code, ghi chú (notes) và bài tập thực hành trực tiếp kèm lời giải, giúp bạn vừa đọc vừa thực hành ngay trên trình duyệt.",
        language: "vi",
        level: "beginner-to-intermediate",
        totalLessons: 20,
        estimatedTotalTime: "9-10 giờ",
        features: [
            "Ghi chú trực tiếp (notes) trong từng bài học",
            "Bài tập thực hành trực tiếp kèm code mẫu, lời giải, test case và gợi ý",
            "Quiz trắc nghiệm cuối mỗi bài để tự kiểm tra",
            "Theo dõi tiến độ học tập (completed) cho từng bài tập"
        ],
        version: "1.0.0"
    },
    lessons: [
        {
            id: "lesson-01",
            order: 1,
            title: "Giới thiệu Python & Cài đặt môi trường",
            slug: "gioi-thieu-python",
            duration: "20 phút",
            difficulty: "beginner",
            objectives: [
                "Hiểu Python là gì và tại sao nên học Python",
                "Biết cách cài đặt Python và chạy chương trình đầu tiên",
                "Làm quen với việc in ra màn hình bằng print()"
            ],
            content: [
                {
                    "type": "paragraph",
                    "text": "Python là một ngôn ngữ lập trình bậc cao, dễ đọc, dễ học, được dùng rộng rãi trong phát triển web, khoa học dữ liệu, trí tuệ nhân tạo, tự động hoá và nhiều lĩnh vực khác."
                },
                {
                    "type": "note",
                    "style": "tip",
                    "text": "Python nổi tiếng vì cú pháp gần giống tiếng Anh tự nhiên, giúp người mới bắt đầu tiếp cận lập trình dễ dàng hơn nhiều ngôn ngữ khác."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Chương trình Python đầu tiên"
                },
                {
                    "type": "code",
                    "language": "python",
                    "code": "print(\"Xin chào, Python!\")",
                    "caption": "Chương trình in ra dòng chữ đầu tiên"
                },
                {
                    "type": "paragraph",
                    "text": "Hàm print() dùng để in dữ liệu ra màn hình. Đây là hàm bạn sẽ dùng thường xuyên nhất khi mới học lập trình để kiểm tra kết quả."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Cách chạy code"
                },
                {
                    "type": "paragraph",
                    "text": "Bạn có thể chạy Python qua: terminal (gõ lệnh python file.py), trình soạn thảo như VS Code, hoặc các môi trường online như Jupyter, Replit, Google Colab."
                }
            ],
            notesEnabled: true,
            userNotes: [],
            keyTakeaways: [
                "Python là ngôn ngữ lập trình dễ học, cú pháp rõ ràng",
                "print() dùng để hiển thị dữ liệu ra màn hình",
                "Có nhiều cách để chạy chương trình Python"
            ],
            exercises: [
                {
                    id: "ex-1-1",
                    title: "In lời chào",
                    description: "Viết chương trình in ra dòng chữ: Xin chào các bạn học Python!",
                    difficulty: "easy",
                    starterCode: "# Viết code của bạn ở đây",
                    solution: "print(\"Xin chào các bạn học Python!\")",
                    testCases: [
                        {
                            input: "",
                            expectedOutput: "Xin chào các bạn học Python!"
                        }
                    ],
                    hints: [
                        "Dùng hàm print()",
                        "Nhớ đặt chuỗi trong dấu ngoặc kép hoặc đơn"
                    ],
                    userCode: "",
                    completed: false
                },
                {
                    id: "ex-1-2",
                    title: "In nhiều dòng",
                    description: "In ra 3 dòng: tên bạn, môn học bạn đang học (Python), và câu 'Tôi rất hào hứng!'",
                    difficulty: "easy",
                    starterCode: "# Viết code của bạn ở đây",
                    solution: "print(\"Nguyen Van A\")\nprint(\"Python\")\nprint(\"Toi rat hao hung!\")",
                    testCases: [
                        {
                            input: "",
                            expectedOutput: "(3 dòng bất kỳ theo yêu cầu)"
                        }
                    ],
                    hints: [
                        "Gọi print() 3 lần liên tiếp"
                    ],
                    userCode: "",
                    completed: false
                }
            ],
            quiz: [
                {
                    question: "Hàm nào dùng để in dữ liệu ra màn hình trong Python?",
                    options: ["print()", "echo()", "console.log()", "display()"],
                    answerIndex: 0,
                    explanation: "print() là hàm chuẩn của Python để in dữ liệu ra màn hình."
                },
                {
                    question: "Python thường được dùng trong lĩnh vực nào?",
                    options: [
                        "Chỉ làm web",
                        "Chỉ làm game",
                        "Nhiều lĩnh vực: web, AI, data science, tự động hoá...",
                        "Chỉ chạy trên Windows"
                    ],
                    answerIndex: 2,
                    explanation: "Python là ngôn ngữ đa dụng, được dùng trong rất nhiều lĩnh vực khác nhau."
                }
            ]
        },
        {
            id: "lesson-02",
            order: 2,
            title: "Biến và Kiểu dữ liệu cơ bản",
            slug: "bien-va-kieu-du-lieu",
            duration: "25 phút",
            difficulty: "beginner",
            objectives: [
                "Hiểu khái niệm biến trong Python",
                "Nắm các kiểu dữ liệu cơ bản: int, float, str, bool",
                "Biết cách kiểm tra kiểu dữ liệu với type()"
            ],
            content: [
                {
                    "type": "paragraph",
                    "text": "Biến (variable) là nơi lưu trữ dữ liệu để sử dụng lại trong chương trình. Trong Python, bạn không cần khai báo kiểu dữ liệu trước, Python tự nhận diện."
                },
                {
                    "type": "code",
                    "language": "python",
                    "code": "ten = \"An\"\ntuoi = 20\nchieu_cao = 1.72\nla_sinh_vien = True\n\nprint(ten, tuoi, chieu_cao, la_sinh_vien)",
                    "caption": "Khai báo và in các biến"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Các kiểu dữ liệu cơ bản"
                },
                {
                    "type": "paragraph",
                    "text": "int: số nguyên (vd: 20). float: số thực (vd: 1.72). str: chuỗi ký tự (vd: \"An\"). bool: đúng/sai (True/False)."
                },
                {
                    "type": "code",
                    "language": "python",
                    "code": "print(type(ten))\nprint(type(tuoi))\nprint(type(chieu_cao))\nprint(type(la_sinh_vien))",
                    "caption": "Kiểm tra kiểu dữ liệu bằng type()"
                },
                {
                    "type": "note",
                    "style": "tip",
                    "text": "Tên biến nên có ý nghĩa, không bắt đầu bằng số, không chứa khoảng trắng hay ký tự đặc biệt (ngoại trừ dấu gạch dưới _)."
                }
            ],
            notesEnabled: true,
            userNotes: [],
            keyTakeaways: [
                "Biến dùng để lưu trữ dữ liệu, không cần khai báo kiểu trước",
                "4 kiểu dữ liệu cơ bản: int, float, str, bool",
                "Dùng type() để kiểm tra kiểu dữ liệu của một biến"
            ],
            exercises: [
                {
                    id: "ex-2-1",
                    title: "Khai báo thông tin cá nhân",
                    description: "Tạo các biến: ho_ten (chuỗi), tuoi (số nguyên), diem_trung_binh (số thực). In cả 3 biến ra màn hình, mỗi biến một dòng.",
                    difficulty: "easy",
                    starterCode: "# Viết code của bạn ở đây",
                    solution: "ho_ten = \"Tran Thi B\"\ntuoi = 22\ndiem_trung_binh = 8.5\nprint(ho_ten)\nprint(tuoi)\nprint(diem_trung_binh)",
                    testCases: [
                        {
                            input: "",
                            expectedOutput: "In ra 3 dòng tương ứng 3 biến"
                        }
                    ],
                    hints: [
                        "Mỗi biến dùng dấu = để gán giá trị"
                    ],
                    userCode: "",
                    completed: false
                },
                {
                    id: "ex-2-2",
                    title: "Kiểm tra kiểu dữ liệu",
                    description: "Cho biến x = 10, y = 10.5, z = 'Python'. In ra kiểu dữ liệu của cả 3 biến.",
                    difficulty: "medium",
                    starterCode: "x = 10\ny = 10.5\nz = 'Python'\n# In kiểu dữ liệu ở đây",
                    solution: "x = 10\ny = 10.5\nz = 'Python'\nprint(type(x))\nprint(type(y))\nprint(type(z))",
                    testCases: [
                        {
                            input: "",
                            expectedOutput: "<class 'int'>\\n<class 'float'>\\n<class 'str'>"
                        }
                    ],
                    hints: [
                        "Dùng print(type(bien))"
                    ],
                    userCode: "",
                    completed: false
                }
            ],
            quiz: [
                {
                    question: "Kiểu dữ liệu nào dùng để lưu số thực (có phần thập phân)?",
                    options: ["int", "float", "str", "bool"],
                    answerIndex: 1,
                    explanation: "float dùng để lưu số có phần thập phân, ví dụ 1.72."
                },
                {
                    question: "Tên biến nào sau đây KHÔNG hợp lệ trong Python?",
                    options: ["ten_bien", "_gia_tri", "2bien", "bien2"],
                    answerIndex: 2,
                    explanation: "Tên biến không được bắt đầu bằng chữ số."
                }
            ]
        },
        {
            id: "lesson-03",
            order: 3,
            title: "Toán tử và Biểu thức",
            slug: "toan-tu-va-bieu-thuc",
            duration: "25 phút",
            difficulty: "beginner",
            objectives: [
                "Sử dụng các toán tử số học (+, -, *, /, %, **)",
                "Hiểu toán tử so sánh và logic",
                "Biết thứ tự ưu tiên của các toán tử"
            ],
            content: [
                { type: "paragraph", text: "Python hỗ trợ đầy đủ các toán tử cơ bản để thực hiện tính toán và so sánh." },
                { type: "heading", level: 2, text: "Toán tử số học" },
                { type: "code", language: "python", code: "a = 10\nb = 3\nprint(a + b)  # Cộng: 13\nprint(a - b)  # Trừ: 7\nprint(a * b)  # Nhân: 30\nprint(a / b)  # Chia: 3.333...\nprint(a // b) # Chia lấy phần nguyên: 3\nprint(a % b)  # Chia lấy phần dư: 1\nprint(a ** b) # Lũy thừa: 1000", caption: "Các phép toán cơ bản" },
                { type: "heading", level: 2, text: "Toán tử so sánh" },
                { type: "paragraph", text: "Các toán tử so sánh trả về True hoặc False: ==, !=, >, <, >=, <=" },
                { type: "note", style: "tip", text: "Toán tử == (so sánh) khác với = (gán giá trị)" }
            ],
            notesEnabled: true,
            userNotes: [],
            keyTakeaways: [
                "Python có đầy đủ toán tử số học cơ bản",
                "Toán tử // chia lấy phần nguyên, % lấy phần dư",
                "Toán tử so sánh trả về giá trị boolean"
            ],
            exercises: [
                {
                    id: "ex-3-1",
                    title: "Tính diện tích hình chữ nhật",
                    description: "Cho chiều dài = 10, chiều rộng = 5. Tính và in ra diện tích.",
                    difficulty: "easy",
                    starterCode: "chieu_dai = 10\nchieu_rong = 5\n# Tính diện tích",
                    solution: "chieu_dai = 10\nchieu_rong = 5\ndien_tich = chieu_dai * chieu_rong\nprint(dien_tich)",
                    testCases: [{ input: "", expectedOutput: "50" }],
                    hints: ["Diện tích = chiều dài * chiều rộng"],
                    userCode: "",
                    completed: false
                },
                {
                    id: "ex-3-2",
                    title: "Kiểm tra số chẵn lẻ",
                    description: "Cho số n = 17. In ra True nếu n là số lẻ, False nếu là số chẵn.",
                    difficulty: "medium",
                    starterCode: "n = 17\n# Kiểm tra chẵn lẻ",
                    solution: "n = 17\nla_so_le = (n % 2 == 1)\nprint(la_so_le)",
                    testCases: [{ input: "", expectedOutput: "True" }],
                    hints: ["Số lẻ chia 2 dư 1", "Dùng toán tử % và =="],
                    userCode: "",
                    completed: false
                }
            ],
            quiz: [
                {
                    question: "Kết quả của 10 // 3 là gì?",
                    options: ["3.333", "3", "3.0", "Lỗi"],
                    answerIndex: 1,
                    explanation: "Toán tử // chia lấy phần nguyên, kết quả là 3"
                },
                {
                    question: "Toán tử nào dùng để kiểm tra hai giá trị bằng nhau?",
                    options: ["=", "==", "===", "!="],
                    answerIndex: 1,
                    explanation: "== là toán tử so sánh bằng, = là toán tử gán"
                }
            ]
        },
        {
            id: "lesson-04",
            order: 4,
            title: "Cấu trúc điều kiện if-else",
            slug: "cau-truc-dieu-kien",
            duration: "30 phút",
            difficulty: "beginner",
            objectives: [
                "Sử dụng if, elif, else để kiểm soát luồng chương trình",
                "Hiểu về khối lệnh và indentation trong Python",
                "Kết hợp điều kiện với toán tử logic"
            ],
            content: [
                { type: "paragraph", text: "Cấu trúc if-else cho phép chương trình thực hiện các hành động khác nhau dựa trên điều kiện." },
                { type: "code", language: "python", code: "tuoi = 18\nif tuoi >= 18:\n    print(\"Bạn đã đủ tuổi\")\nelse:\n    print(\"Bạn chưa đủ tuổi\")", caption: "if-else cơ bản" },
                { type: "note", style: "warning", text: "Python dùng indentation (thụt đầu dòng) để xác định khối lệnh. Thường dùng 4 dấu cách." },
                { type: "heading", level: 2, text: "elif - Nhiều điều kiện" },
                { type: "code", language: "python", code: "diem = 85\nif diem >= 90:\n    print(\"Xuất sắc\")\nelif diem >= 80:\n    print(\"Giỏi\")\nelif diem >= 70:\n    print(\"Khá\")\nelse:\n    print(\"Trung bình\")", caption: "Sử dụng elif" }
            ],
            notesEnabled: true,
            userNotes: [],
            keyTakeaways: [
                "if-else giúp chương trình ra quyết định",
                "Indentation rất quan trọng trong Python",
                "elif cho phép kiểm tra nhiều điều kiện"
            ],
            exercises: [
                {
                    id: "ex-4-1",
                    title: "Kiểm tra số dương âm",
                    description: "Cho số n. In 'Dương' nếu n > 0, 'Âm' nếu n < 0, 'Không' nếu n = 0",
                    difficulty: "easy",
                    starterCode: "n = -5\n# Viết code kiểm tra",
                    solution: "n = -5\nif n > 0:\n    print('Dương')\nelif n < 0:\n    print('Âm')\nelse:\n    print('Không')",
                    testCases: [{ input: "", expectedOutput: "Âm" }],
                    hints: ["Dùng if-elif-else", "So sánh n với 0"],
                    userCode: "",
                    completed: false
                },
                {
                    id: "ex-4-2",
                    title: "Xếp loại học lực",
                    description: "Cho điểm. In 'Giỏi' nếu >= 8, 'Khá' nếu >= 6.5, 'Trung bình' nếu >= 5, 'Yếu' nếu < 5",
                    difficulty: "medium",
                    starterCode: "diem = 7.5\n# Xếp loại",
                    solution: "diem = 7.5\nif diem >= 8:\n    print('Giỏi')\nelif diem >= 6.5:\n    print('Khá')\nelif diem >= 5:\n    print('Trung bình')\nelse:\n    print('Yếu')",
                    testCases: [{ input: "", expectedOutput: "Khá" }],
                    hints: ["Dùng nhiều elif", "Kiểm tra từ cao xuống thấp"],
                    userCode: "",
                    completed: false
                }
            ],
            quiz: [
                {
                    question: "Python dùng gì để xác định khối lệnh?",
                    options: ["Dấu {} như C", "Indentation (thụt đầu dòng)", "Dấu ; cuối dòng", "Từ khóa begin-end"],
                    answerIndex: 1,
                    explanation: "Python sử dụng indentation để xác định khối lệnh"
                },
                {
                    question: "Khi nào dùng elif thay vì nhiều if riêng lẻ?",
                    options: [
                        "Không bao giờ",
                        "Khi muốn kiểm tra nhiều điều kiện loại trừ lẫn nhau",
                        "Khi muốn kiểm tra tất cả điều kiện",
                        "Khi không có else"
                    ],
                    answerIndex: 1,
                    explanation: "elif dùng khi các điều kiện loại trừ nhau, chỉ một điều kiện được thực hiện"
                }
            ]
        },
        {
            id: "lesson-05",
            order: 5,
            title: "Vòng lặp for và while",
            slug: "vong-lap",
            duration: "35 phút",
            difficulty: "intermediate",
            objectives: [
                "Sử dụng vòng lặp for để duyệt qua sequence",
                "Sử dụng while cho vòng lặp có điều kiện",
                "Hiểu break, continue và range()"
            ],
            content: [
                { type: "paragraph", text: "Vòng lặp giúp thực hiện một đoạn code nhiều lần." },
                { type: "heading", level: 2, text: "Vòng lặp for" },
                { type: "code", language: "python", code: "# Lặp qua dãy số\nfor i in range(5):\n    print(i)  # In 0, 1, 2, 3, 4", caption: "for với range()" },
                { type: "heading", level: 2, text: "Vòng lặp while" },
                { type: "code", language: "python", code: "count = 0\nwhile count < 5:\n    print(count)\n    count += 1", caption: "while lặp khi điều kiện đúng" },
                { type: "note", style: "warning", text: "Cẩn thận vòng lặp vô hạn! Đảm bảo điều kiện while cuối cùng sẽ False" }
            ],
            notesEnabled: true,
            userNotes: [],
            keyTakeaways: [
                "for dùng để lặp qua sequence (list, range, string...)",
                "while lặp khi điều kiện còn đúng",
                "break thoát vòng lặp, continue bỏ qua vòng hiện tại"
            ],
            exercises: [
                {
                    id: "ex-5-1",
                    title: "In bảng cửu chương",
                    description: "In bảng cửu chương 5 (từ 5x1 đến 5x10)",
                    difficulty: "easy",
                    starterCode: "# In bảng cửu chương 5",
                    solution: "for i in range(1, 11):\n    print(f'5 x {i} = {5*i}')",
                    testCases: [{ input: "", expectedOutput: "10 dòng từ 5x1=5 đến 5x10=50" }],
                    hints: ["Dùng for i in range(1, 11)", "In kết quả 5 * i"],
                    userCode: "",
                    completed: false
                },
                {
                    id: "ex-5-2",
                    title: "Tính tổng các số từ 1 đến n",
                    description: "Cho n = 100. Tính tổng 1+2+3+...+100",
                    difficulty: "medium",
                    starterCode: "n = 100\n# Tính tổng",
                    solution: "n = 100\ntong = 0\nfor i in range(1, n+1):\n    tong += i\nprint(tong)",
                    testCases: [{ input: "", expectedOutput: "5050" }],
                    hints: ["Khởi tạo tong = 0", "Dùng vòng lặp for", "tong += i trong mỗi vòng"],
                    userCode: "",
                    completed: false
                }
            ],
            quiz: [
                {
                    question: "range(5) tạo ra dãy số nào?",
                    options: ["1, 2, 3, 4, 5", "0, 1, 2, 3, 4", "0, 1, 2, 3, 4, 5", "1, 2, 3, 4"],
                    answerIndex: 1,
                    explanation: "range(5) tạo ra 0, 1, 2, 3, 4 (bắt đầu từ 0, không bao gồm 5)"
                },
                {
                    question: "Lệnh nào thoát khỏi vòng lặp ngay lập tức?",
                    options: ["continue", "break", "exit", "return"],
                    answerIndex: 1,
                    explanation: "break thoát vòng lặp, continue bỏ qua vòng hiện tại và tiếp tục"
                }
            ]
        }
    ]
};
