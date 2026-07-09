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
        }
    ]
};