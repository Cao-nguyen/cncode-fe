export interface LessonData {
    _id: string;
    title: string;
    content: string;
    videoUrl: string;
    isPreview: boolean;
    duration: string;
    order: number;
    questions?: QuestionData[];
}

export interface QuestionData {
    _id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    rewardCoins: number;
    timestamp: number;
}

export interface CourseData {
    _id: string;
    title: string;
    description: string;
    longDescription: string;
    thumbnail: string;
    banner: string;
    level: string;
    price: number;
    isFree: boolean;
    whatYouWillLearn: string[];
    totalLessons: number;
    totalDuration: string;
    totalStudents: number;
    lessons: LessonData[];
}

export const courses: CourseData[] = [
    {
        _id: "course_1",
        title: "Lập trình JavaScript từ cơ bản đến nâng cao",
        description: "Khóa học giúp bạn nắm vững kiến thức JavaScript để phát triển web",
        longDescription: "Khóa học JavaScript toàn diện bao gồm các kiến thức từ cơ bản như biến, vòng lặp, hàm đến nâng cao như Promise, Async/Await, OOP, và các tính năng hiện đại của ES6+. Bạn sẽ được thực hành qua nhiều bài tập và dự án thực tế.",
        thumbnail: "/images/images1.jpg",
        banner: "/images/images1.jpg",
        level: "Lớp 10",
        price: 50000,
        isFree: false,
        whatYouWillLearn: [
            "Nắm vững cú pháp và cấu trúc JavaScript",
            "Hiểu sâu về Closure và Scope",
            "Sử dụng thành thạo Promise và Async/Await",
            "Xây dựng ứng dụng thực tế với JavaScript",
            "Làm chủ các tính năng ES6+",
        ],
        totalLessons: 4,
        totalDuration: "45 phút",
        totalStudents: 15234,
        lessons: [
            {
                _id: "lesson_1_1",
                title: "Giới thiệu về JavaScript",
                content: "<p>JavaScript là ngôn ngữ lập trình phổ biến nhất cho phát triển web. Trong bài học này, chúng ta sẽ tìm hiểu về lịch sử, ứng dụng và cách chạy JavaScript.</p><h3>Nội dung chính:</h3><ul><li>JavaScript là gì?</li><li>Lịch sử phát triển</li><li>Các ứng dụng của JavaScript</li><li>Cách chạy JavaScript trong trình duyệt</li></ul>",
                videoUrl: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
                isPreview: true,
                duration: "15:20",
                order: 1,
                questions: [
                    {
                        _id: "q1",
                        question: "JavaScript được tạo ra bởi ai?",
                        options: ["Microsoft", "Google", "Brendan Eich", "Mozilla"],
                        correctAnswer: 2,
                        explanation: "JavaScript được Brendan Eich tạo ra vào năm 1995 khi ông làm việc tại Netscape.",
                        rewardCoins: 10,
                        timestamp: 10,
                    },
                ],
            },
            {
                _id: "lesson_1_2",
                title: "Biến và kiểu dữ liệu",
                content: "<p>Tìm hiểu về các loại biến trong JavaScript: var, let, const và các kiểu dữ liệu cơ bản.</p><h3>Các loại biến:</h3><ul><li><strong>var</strong> - Khai báo biến có phạm vi hàm</li><li><strong>let</strong> - Khai báo biến có phạm vi khối</li><li><strong>const</strong> - Khai báo hằng số không thể gán lại</li></ul>",
                videoUrl: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
                isPreview: true,
                duration: "25:30",
                order: 2,
                questions: [
                    {
                        _id: "q2",
                        question: "Từ khóa nào dùng để khai báo biến có thể thay đổi giá trị?",
                        options: ["const", "let", "final", "static"],
                        correctAnswer: 1,
                        explanation: "let và var đều dùng để khai báo biến có thể thay đổi giá trị. const dùng cho hằng số.",
                        rewardCoins: 10,
                        timestamp: 30,
                    },
                ],
            },
            {
                _id: "lesson_1_3",
                title: "Hàm trong JavaScript",
                content: "<p>Hàm là khối code thực hiện một nhiệm vụ cụ thể. Có nhiều cách khai báo hàm trong JavaScript.</p><h3>Các loại hàm:</h3><ul><li>Function Declaration</li><li>Function Expression</li><li>Arrow Function</li></ul>",
                videoUrl: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
                isPreview: false,
                duration: "20:15",
                order: 3,
            },
            {
                _id: "lesson_1_4",
                title: "Promise và Async/Await",
                content: "<p>Xử lý bất đồng bộ trong JavaScript với Promise và Async/Await.</p>",
                videoUrl: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
                isPreview: false,
                duration: "30:00",
                order: 4,
            },
        ],
    },
    {
        _id: "course_2",
        title: "ReactJS Mastery - Xây dựng ứng dụng thực tế",
        description: "Từ cơ bản đến nâng cao, xây dựng dự án thực tế với ReactJS",
        longDescription: "Khóa học ReactJS chuyên sâu giúp bạn hiểu rõ về component, props, state, hooks, context API, và các thư viện phổ biến như React Router, Redux Toolkit.",
        thumbnail: "/images/images1.jpg",
        banner: "/images/images1.jpg",
        level: "Lớp 11",
        price: 99000,
        isFree: false,
        whatYouWillLearn: [
            "Hiểu sâu về React Component và Lifecycle",
            "Sử dụng thành thạo React Hooks",
            "Quản lý state với Context API",
            "Routing với React Router",
            "Xây dựng ứng dụng thực tế hoàn chỉnh",
        ],
        totalLessons: 2,
        totalDuration: "40 phút",
        totalStudents: 8743,
        lessons: [
            {
                _id: "lesson_2_1",
                title: "Giới thiệu ReactJS",
                content: "<p>React là thư viện JavaScript phổ biến nhất để xây dựng giao diện người dùng.</p>",
                videoUrl: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
                isPreview: true,
                duration: "18:45",
                order: 1,
            },
            {
                _id: "lesson_2_2",
                title: "JSX và Component",
                content: "<p>Tìm hiểu về JSX và cách tạo component trong React.</p>",
                videoUrl: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
                isPreview: true,
                duration: "22:30",
                order: 2,
            },
        ],
    },
    {
        _id: "course_3",
        title: "Python cho người mới bắt đầu",
        description: "Học Python từ cơ bản với nhiều bài tập thực hành",
        longDescription: "Khóa học Python dành cho người mới bắt đầu, bao gồm cú pháp cơ bản, cấu trúc dữ liệu, hàm, module và xử lý file.",
        thumbnail: "/images/images1.jpg",
        banner: "/images/images1.jpg",
        level: "Lớp 9",
        price: 0,
        isFree: true,
        whatYouWillLearn: [
            "Nắm vững cú pháp Python cơ bản",
            "Sử dụng thành thạo các cấu trúc dữ liệu",
            "Viết hàm và module",
            "Xử lý file và ngoại lệ",
        ],
        totalLessons: 1,
        totalDuration: "12 phút",
        totalStudents: 45678,
        lessons: [
            {
                _id: "lesson_3_1",
                title: "Cài đặt và Hello World",
                content: "<p>Hướng dẫn cài đặt Python và viết chương trình đầu tiên.</p>",
                videoUrl: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
                isPreview: true,
                duration: "12:30",
                order: 1,
            },
        ],
    },
];

export const getCourseById = (id: string): CourseData | undefined => {
    return courses.find(course => course._id === id);
};

export const getLessonById = (lessonId: string): { lesson: LessonData; course: CourseData } | null => {
    for (const course of courses) {
        const lesson = course.lessons.find(l => l._id === lessonId);
        if (lesson) {
            return { lesson, course };
        }
    }
    return null;
};

export const getAdjacentLessons = (courseId: string, currentLessonId: string): { prev: LessonData | null; next: LessonData | null } => {
    const course = getCourseById(courseId);
    if (!course) return { prev: null, next: null };

    const currentIndex = course.lessons.findIndex(l => l._id === currentLessonId);
    if (currentIndex === -1) return { prev: null, next: null };

    return {
        prev: currentIndex > 0 ? course.lessons[currentIndex - 1] : null,
        next: currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null,
    };
};