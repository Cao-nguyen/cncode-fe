'use client';

import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Search,
    Eye,
    Heart,
    Calendar,
    MessageCircle,
    ChevronRight,
    Clock,
    BookOpen,
    ArrowLeft,
    User,
    ThumbsUp,
    Share2,
    Flag
} from 'lucide-react';

// --- INTERFACES ---
interface IBlog {
    _id: string;
    title: string;
    img: string;
    description: string;
    content: string;
    createdAt: string;
    slug: string;
    eye_watch: number;
    like: number;
    comments: number;
    author: string;
}

// --- DỮ LIỆU BLOG TỪ JSON ---
const BLOGS_DATA: IBlog[] = [
    {
        "_id": "67e920a20dd0de43927fa336",
        "title": "Mình đã đạt được những thành tích gì sau 4 năm học tại THCS Thành Đông",
        "img": "https://res.cloudinary.com/dckuqnehz/image/upload/v1743331345/uploads/img/30-03-2025/kmiuigyawxu9vow4zqjv.png",
        "description": "Trong blog này mình sẽ tổng kết những thành tích mình đạt được trong 4 năm học tại trường THCS Thành Đông nhằm truyền động lực cho các bạn cố gắng học và cũng như lưu trữ những kỉ niệm đẹp đẽ của chính bản thân mình",
        "content": "<div class=\"al-justify\">\n\nBốn năm học thật sự trôi qua rất nhanh, mình nhớ mới ngày nào đó mình còn e dè và rụt rè trước một môi trường mới, bạn bè mới mà giờ đây đã đến lúc phải chia tay mái trường mà mình đã gắn bó suốt 4 năm học. Cho nên để lưu trữ những kỉ niệm đẹp đẽ đó, mình sẽ tổng kết, ghi nhận những thành tích mình đạt được vào blog này.\n\n![Image](https://res.cloudinary.com/dckuqnehz/image/upload/v1743331345/uploads/img/30-03-2025/kmiuigyawxu9vow4zqjv.png)\n\nSau khi mình học tại trường THCS Thành Đông được 4 năm thì mình đạt được rất nhiều thành tích, thầy cô rất tận tình giúp đỡ mình trong học tập. Cụ thể những thành tích mình đạt được như sau: \n- Lớp 6: Đạt được danh hiệu HSG (nhất lớp).\n- Lớp 7: Đạt được danh hiệu HSG (nhất lớp).\n- Lớp 8: \n   + Đạt được danh hiệu HSG (nhất lớp).\n   + Đạt danh hiệu \"Cháu Ngoan Bác Hồ\".\n   + Giải KK Kỹ năng lập trình Pascal cấp huyện (Tin học trẻ).\n   + Giải Nhì bảng D2 Tin học trẻ cấp huyện.\n   + Giải Nhì bảng D2 Tin học trẻ cấp tỉnh.\n   + Giải Ba cuộc thi sáng tạo thanh thiếu niên nhi đồng cấp huyện.\n   + Giải KK cuộc thi sáng tạo thanh thiếu niên nhi đồng cấp tỉnh.\n- Lớp 9: \n   + Đạt được danh hiệu HSG (nhất lớp).\n   + Đạt danh hiệu \"Cháu Ngoan Bác Hồ\".\n   + Giải KK HSG Ngữ văn cấp huyện\n   + Đạt danh hiệu \"Dũng sĩ kế hoạch nhỏ\".\n   + Giải Nhì bảng D2 Tin học trẻ cấp huyện.\n   + Giải Ba bảng D2 Tin học trẻ cấp tỉnh.\n   + Giải Ba cuộc thi sáng tạo thanh thiếu niên nhi đồng cấp huyện.\n\nMình cũng được tham gia hội thi Tin học trẻ Toàn Quốc vòng Khu vực và Sáng tạo thanh thiếu niên nhi đồng Toàn Quốc năm 2023 và 2024 nhưng mình không đạt giải.\n</div>",
        "createdAt": "2025-03-30T10:44:50.387Z",
        "slug": "minh-dja-djat-djuoc-nhung-thanh-tich-gi-sau-4-nam-hoc-tai-thcs-thanh-djong-30-3-2025",
        "eye_watch": 34,
        "like": 1,
        "comments": 0,
        "author": "Lý Cao Nguyên"
    },
    {
        "_id": "67f36c21225f9c21e8216f03",
        "title": "Mình đã làm thế nào để hoàn thành một dự án website chỉ trong 15 ngày",
        "img": "https://res.cloudinary.com/dckuqnehz/image/upload/v1742302299/uploads/img/18-03-2025/pbmuq6myctbmsghtaunp.png",
        "description": "Xin chào mọi người mình là Lý Cao Nguyên, mình đã làm một dự án website front-end với hơn 100 bài học và 200 bài viết nhưng mình chỉ cần 15 ngày để hoàn thành toàn bộ chúng. Bạn nghĩ mình làm như thế nào và tại sao lại làm trong thời gian ngắn như vậy?",
        "content": "![Image](https://res.cloudinary.com/dckuqnehz/image/upload/v1742302299/uploads/img/18-03-2025/pbmuq6myctbmsghtaunp.png)\n\nBài viết này sẽ bao gồm các phần như sau:\n> 1 - Tại sao mình lại làm một dự án trong một thời gian ngắn như vậy?\n>\n> 2 - Lúc mất dữ liệu mình ra sao?\n>\n> 3 - Cách mình đã làm để hoàn thành dự án chỉ trong 15 ngày.\n\n<div class=\"al-justify\">\n\n**1. Tại sao mình lại làm một dự án trong một thời gian ngắn như vậy?**\nLí do mình làm một dự án trong thời gian ngắn như vậy là gì một số lỗi trong quá trình xây dựng mà gần đến ngày dự thi. Laptop của mình vào một ngày đẹp trời thì bị hỏng (mình không dùng github) nên tất cả code cũng bay theo hư vô khi laptop được sửa và trở lại bình thường mặc dù đã ra sức khôi phục dữ liệu.\n\n**2. Lúc mất dữ liệu mình ra sao?**\nLúc mất dữ liệu là mình đã sắp hoàn thành dự án rồi (chỉ còn phần tin tức nữa là xong). Nên là mình bị suy sụp và buồn trong một khoảng thời gian 2 ngày. Mình định bỏ cuộc nhưng lý trí không cho và bắt buộc mình phải ngồi lại chiếc bàn học cùng với chiếc laptop và bàn phím bắt đầu code một trang web mới giống với cái cũ.\n\n**3. Cách mình đã làm để hoàn thành dự án chỉ trong 15 ngày.**\n***3.1. Lên kế hoạch, thiết kế logo, thiết kế layout, chuẩn bị nội dung cho dự án (5 ngày)***\n- Mình đã lên kế hoạch cho dự án, phác thảo một khung sườn website cơ bản và ghi chú những mục nào có trên thanh menu.\n- Thiết kế logo cho trang web bằng canva.\n- Sau đó vẽ ra layout cho từng trang để dựa vào đó và code.\n- Quá trình chuẩn bị nội dung là lâu nhất, mình đã chuẩn bị toàn bộ nội dung Ngữ văn 9 để vào file word.\n\n***3.2 Code giao diện cho từng trang (2 ngày)***\nTừ những gì đã vạch ra mình bắt đầu code giao diện cho từng trang trên thanh menu như Trang chủ, Giới thiệu, Học văn, Soạn văn, Tài liệu,...\n\n***3.3 Đưa nội dung lên website (5 ngày)***\nTừ những nội dung có sẵn trong file word mình bắt đầu copy và dán vào giao diện đã tạo trước đó. Vì số lượng khá nhiều nên quá trình này phải mất đến 5 ngày để đưa toàn bộ nội dung lên website.\n\n***3.4 Phát sinh thêm một số tính năng do quá trình thực hiện nảy sinh ra ý tưởng mới (1 ngày)***\nTrong quá trình mình code thì mình đã nảy sinh ra những ý tưởng và bắt đầu thực hiện luôn, quá trình này mình làm rất nhanh chỉ 1 ngày là hoàn thành (mình làm từ 6:00 sáng cho đến 0:00 tối).\n\n***3.5 Đưa website lên hosting (1 ngày)***\nSau khi đã hoàn thành hết mọi công việc thì mình bắt đầu đẩy hết code lên hosting. Vì hosting miễn phí nên không gian lưu trữ không đủ mình phải tạo nhiều kho lưu trữ khác và chia ra để lưu trữ nên quá trình upload code lên hosting mình làm tận 1 ngày.\n\n***3.6 Sửa lỗi xảy ra sau khi upload code và chạy thử nghiệm (1 ngày)***\nMọi chuyện không bao giờ đơn giản như chúng ta nghĩ, khi upload lên hosting chạy thử nghiệm thì trang web bị lỗi ở một số chỗ nên mình phải sửa lại. Sau khi hoàn thành mình đăng công khai và share web trên trang cá nhân để mọi người đều thấy và truy cập web.\n\nCảm ơn mọi người đã đọc!\n</div>",
        "createdAt": "2025-04-07T06:09:37.717Z",
        "slug": "minh-dja-lam-the-nao-dje-hoan-thanh-mot-du-an-website-chi-trong-15-ngay-7-4-2025",
        "eye_watch": 70,
        "like": 0,
        "comments": 2,
        "author": "Lý Cao Nguyên"
    },
    {
        "_id": "680c4b92caa42415a4eea4d4",
        "title": "Cách học Tin học hiệu quả – Đừng học để biết, hãy học để làm",
        "img": "https://res.cloudinary.com/dckuqnehz/image/upload/v1745636238/uploads/img/26-04-2025/n1pzzgr5jd0albeumh5w.jpg",
        "description": "Học tin học không chỉ đơn giản là ghi nhớ lý thuyết hay cú pháp, mà là hiểu cách ứng dụng chúng để giải quyết vấn đề. ",
        "content": "![Image](https://res.cloudinary.com/dckuqnehz/image/upload/v1745636238/uploads/img/26-04-2025/n1pzzgr5jd0albeumh5w.jpg)\n\nDưới đây là một vài gợi ý giúp bạn học tin học hiệu quả hơn:\n\n- Học qua dự án thực tế: Hãy tự tạo cho mình những dự án nhỏ như viết máy tính đơn giản, làm trang web cá nhân hay tạo game mini.\n\n- Thường xuyên luyện thuật toán: Giải bài trên các trang như VNOJ, Codeforces, Leetcode sẽ giúp bạn nâng cao tư duy logic.\n\n- Xem video hoặc blog: Đôi khi học qua video hướng dẫn hoặc blog dễ tiếp cận hơn sách giáo khoa.\n\n- Chăm chỉ thực hành: “Code mỗi ngày, tiến bộ mỗi giờ” – hãy rèn luyện đều đặn.\n\nĐiều quan trọng nhất là hãy giữ lửa đam mê. Khi bạn yêu thích công nghệ, việc học sẽ không còn là gánh nặng nữa.",
        "createdAt": "2025-04-26T02:57:22.634Z",
        "slug": "cach-hoc-tin-hoc-hieu-qua-djung-hoc-dje-biet-hay-hoc-dje-lam-26-4-2025",
        "eye_watch": 18,
        "like": 0,
        "comments": 0,
        "author": "Lý Cao Nguyên"
    },
    {
        "_id": "680cb7eb9b5936b060dda92c",
        "title": "Giới thiệu về Python – Ngôn ngữ thân thiện với người mới bắt đầu",
        "img": "https://res.cloudinary.com/dckuqnehz/image/upload/v1745635978/uploads/img/26-04-2025/fh766g8szgshz3r59z7e.jpg",
        "description": "Python là một trong những ngôn ngữ lập trình phổ biến nhất hiện nay. Điều làm nên sức hút của Python chính là cú pháp đơn giản, dễ đọc, gần giống với tiếng Anh.",
        "content": "Python là một trong những ngôn ngữ lập trình phổ biến nhất hiện nay. Điều làm nên sức hút của Python chính là cú pháp đơn giản, dễ đọc, gần giống với tiếng Anh. Chính vì vậy, Python được xem là lựa chọn lý tưởng cho người mới bắt đầu học lập trình.\n\n![Image](https://res.cloudinary.com/dckuqnehz/image/upload/v1745635978/uploads/img/26-04-2025/fh766g8szgshz3r59z7e.jpg)\n\nKhông chỉ dễ học, Python còn cực kỳ mạnh mẽ. Nó được dùng để tạo ra website, ứng dụng, game, trí tuệ nhân tạo, khoa học dữ liệu và nhiều lĩnh vực khác. Thư viện phong phú như **numpy**, **pandas**, **matplotlib**, hay **tensorflow** giúp lập trình viên giải quyết vấn đề nhanh chóng.\n\nNếu bạn đang tìm một điểm khởi đầu cho hành trình công nghệ, hãy thử với Python. Biết đâu, bạn sẽ yêu thích việc lập trình hơn bao giờ hết!",
        "createdAt": "2025-04-26T10:39:39.795Z",
        "slug": "gioi-thieu-ve-python-ngon-ngu-than-thien-voi-nguoi-moi-bat-djau-26-4-2025",
        "eye_watch": 17,
        "like": 2,
        "comments": 0,
        "author": "Nguyễn Văn A"
    },
    {
        "_id": "680cb87b9b5936b060dda9c9",
        "title": "Giới thiệu về C++ – Ngôn ngữ của sự mạnh mẽ và tối ưu",
        "img": "https://res.cloudinary.com/dckuqnehz/image/upload/v1745636135/uploads/img/26-04-2025/gwthyau0bfl8rqkiyyxv.jpg",
        "description": "C++ là một ngôn ngữ lập trình lâu đời nhưng vẫn giữ vai trò quan trọng trong thế giới công nghệ. Nó là bản mở rộng của C, mang lại sức mạnh vượt trội nhờ khả năng quản lý bộ nhớ, xử lý nhanh và linh hoạt.",
        "content": "C++ là một ngôn ngữ lập trình lâu đời nhưng vẫn giữ vai trò quan trọng trong thế giới công nghệ. Nó là bản mở rộng của C, mang lại sức mạnh vượt trội nhờ khả năng quản lý bộ nhớ, xử lý nhanh và linh hoạt.\n\n![Image](https://res.cloudinary.com/dckuqnehz/image/upload/v1745636135/uploads/img/26-04-2025/gwthyau0bfl8rqkiyyxv.jpg)\n\nC++ thường được dùng trong phát triển phần mềm hệ thống, game, phần mềm nhúng, trình biên dịch và nhiều ứng dụng đòi hỏi hiệu suất cao. Tuy cú pháp có phần phức tạp hơn Python, nhưng C++ sẽ rèn luyện cho bạn tư duy logic và khả năng tối ưu hóa chương trình.\n\nNếu bạn yêu thích thử thách và muốn trở thành lập trình viên “cứng cựa”, học C++ sẽ là một quyết định đúng đắn.",
        "createdAt": "2025-04-26T10:42:03.352Z",
        "slug": "gioi-thieu-ve-c-ngon-ngu-cua-su-manh-me-va-toi-uu-26-4-2025",
        "eye_watch": 37,
        "like": 3,
        "comments": 0,
        "author": "Nguyễn Văn A"
    },
    {
        "_id": "680e40c104308653e11bf82d",
        "title": "Tác giả Nguyễn Trường Sinh - người truyền ngọn lửa đam mê",
        "img": "https://res.cloudinary.com/dckuqnehz/image/upload/v1745764438/uploads/img/27-04-2025/q8huyvfj4bnlvypnrfcb.jpg",
        "description": "Năm nay là tròn hai mươi năm kể từ khi cuốn sách được xuất bản. Cho dù cuốn sách có là một cuốn sách dịch, sách rác, tôi vẫn rất biết ơn tác giả Nguyễn Trường Sinh - người thầy về lập trình đầu tiên của tôi.",
        "content": "Nhà tôi có nhiều sách, nhưng ít sách mới. Bố tôi có vài cuốn về tin học, liên quan đến phần cứng máy tính thì kiến thức là về những máy 386, 486, Pentium, có duy nhất một cuốn lập trình: \"Sử dụng PHP và MySQL thiết kế web động\" của tác giả Nguyễn Trường Sinh, xuất bản năm 2005.\n\n![Image](https://res.cloudinary.com/dckuqnehz/image/upload/v1745764438/uploads/img/27-04-2025/q8huyvfj4bnlvypnrfcb.jpg) \n\nTôi bắt đầu đọc cuốn này vào khoảng năm lớp 4 - lớp 5. Mỗi lần đọc cuốn này, đầu óc tôi trở nên hưng phấn đến kỳ lạ. Những hình ảnh về trang web, về mã nguồn trang web, về trình duyệt, về giao diện windows xp, về MySQL khiến tôi thích thú.\n\nNăm nay là tròn hai mươi năm kể từ khi cuốn sách được xuất bản. Cho dù cuốn sách có là một cuốn sách dịch, sách rác, tôi vẫn rất biết ơn tác giả Nguyễn Trường Sinh - người thầy về lập trình đầu tiên của tôi.",
        "createdAt": "2025-04-27T14:35:45.653Z",
        "slug": "tac-gia-nguyen-truong-sinh-nguoi-truyen-ngon-lua-djam-me-27-4-2025",
        "eye_watch": 38,
        "like": 1,
        "comments": 1,
        "author": "Trần Văn B"
    },
    {
        "_id": "68102cc5b07b09116565d785",
        "title": "Một số lệnh làm việc với danh sách trong Python",
        "img": "https://res.cloudinary.com/dckuqnehz/image/upload/v1745890288/uploads/img/29-04-2025/gcylffg27bbsv8ucenlc.png",
        "description": "Danh sách là một kiểu dữ liệu trong Python hay được gọi là list, danh sách sẽ bao gồm nhiều phần tử và các phần tử trong danh sách có thể không cùng kiểu dữ liệu.",
        "content": "Danh sách là một kiểu dữ liệu trong Python hay được gọi là list, danh sách sẽ bao gồm nhiều phần tử và các phần tử trong danh sách có thể không cùng kiểu dữ liệu.\n\n![Image](https://res.cloudinary.com/dckuqnehz/image/upload/v1745890288/uploads/img/29-04-2025/gcylffg27bbsv8ucenlc.png)\n\n**1. Khai báo danh sách**\n- Để khai báo một danh sách rỗng trong Python ta viết lệnh: \n```Python\n<tên danh sách> = []\n```\n- Để khai báo một danh sách có phần tử ta viết lệnh: \n```Python\n<tên danh sách> = [<phần tử 1>, <phần tử 2>,...<phần tử n>]\n```\n\n**2. Lệnh append**\nAppend là một hàm được thiết kế sẵn trong Python dùng để thêm một tử vào cuối danh sách\n- Cú pháp: \n```Python\n<tên danh sách>.append(<phần tử cần thêm>)\n```\n\n**3. Lệnh remove**\nRemove là một hàm được thiết kế sẵn trong Python dùng để xoá một phần tử có trong danh sách.",
        "createdAt": "2025-04-29T01:35:01.501Z",
        "slug": "mot-so-lenh-lam-viec-voi-danh-sach-trong-python-29-4-2025",
        "eye_watch": 39,
        "like": 1,
        "comments": 2,
        "author": "Lý Cao Nguyên"
    },
    {
        "_id": "6831c94a8ba69747bf7bf9b8",
        "title": "Hội thi Tin học trẻ tỉnh Vĩnh Long lần thứ 27",
        "img": "https://res.cloudinary.com/dckuqnehz/image/upload/v1748092927/uploads/img/24-05-2025/eepqocglgruju9dzweud.jpg",
        "description": "Tin học trẻ là sân chơi tin học bổ ích được tổ chức thường niên dành cho học sinh cấp tiểu học, trung học cơ sở và trung học phổ thông",
        "content": "Sáng nay, ngày 24 - 05 - 2025, Hội thi Tin học trẻ vừa được tổ chức tại trường Đại học sư phạm kỹ thuật Vĩnh Long. Năm nay có khoảng 200 thí sinh tham cấp tỉnh ở các bảng thi A, B, C1, C2, D1, D2, D3.\n\n![Image](https://res.cloudinary.com/dckuqnehz/image/upload/v1748092927/uploads/img/24-05-2025/eepqocglgruju9dzweud.jpg)\n\nTrong hội thi lần này, Lý Cao Nguyên hân hạnh được nhận giải Khuyến Khích ở Bảng D3 - Sản phẩm sáng tạo dành cho khối THPT.",
        "createdAt": "2025-05-24T13:27:38.440Z",
        "slug": "hoi-thi-tin-hoc-tre-tinh-vinh-long-lan-thu-27-24-5-2025",
        "eye_watch": 22,
        "like": 1,
        "comments": 0,
        "author": "Lý Cao Nguyên"
    },
    {
        "_id": "687602ea6310a709a79692b5",
        "title": "Sản phẩm của Lý Cao Nguyên được chọn tham gia vòng Toàn Quốc Cuộc Thi Sáng Tạo TTNNĐ lần thứ XIV, năm học 2024-2025",
        "img": "https://res.cloudinary.com/dckuqnehz/image/upload/v1752564138/uploads/img/15-07-2025/rs57yeenmnqb2pf5frrc.jpg",
        "description": "Lý Cao Nguyên - 10A10 trường THPT Tân Quới đạt giải tại cuộc thi Sáng tạo thanh thiếu niên nhi đồng lần thứ XIV và được lựa chọn tham gia cuộc thi cấp Toàn Quốc",
        "content": "<div class=\"al-justify\">\nQua 14 lần tổ chức, Cuộc thi Sáng tạo Thanh thiếu niên nhi đồng đã trở thành sân chơi trí tuệ, bổ ích, lành mạnh, khơi dậy niềm đam mê.\n\n![Image](https://res.cloudinary.com/dckuqnehz/image/upload/v1752564138/uploads/img/15-07-2025/rs57yeenmnqb2pf5frrc.jpg)\n\nTrong số các sản phẩm đạt giải có sản phẩm \"CNcode - Nền tảng dạy và học công nghệ thông tin trực tuyến\" của Lý Cao Nguyên (10A10 - THPT Tân Quới) và được lựa chọn tham gia cuộc thi cấp Toàn Quốc.\n</div>",
        "createdAt": "2025-07-15T07:27:38.793Z",
        "slug": "san-pham-cua-ly-cao-nguyen-djuoc-chon-tham-gia-vong-toan-quoc-cuoc-thi-sang-tao-ttnndj-lan-thu-xiv-nam-hoc-2024-2025-15-7-2025",
        "eye_watch": 27,
        "like": 1,
        "comments": 2,
        "author": "Lý Cao Nguyên"
    },
    {
        "_id": "68b9094719cd41ee41b8df59",
        "title": "80 năm Quốc khánh nước Cộng hoà xã hội chủ nghĩa Việt Nam",
        "img": "https://res.cloudinary.com/dckuqnehz/image/upload/v1756956602/uploads/img/04-09-2025/nr8iwwzcaqfdxui5qsls.jpg",
        "description": "Tám mươi năm đã đi qua kể từ mùa Thu lịch sử năm 1945, khi cả dân tộc Việt Nam vùng lên làm nên Cách mạng Tháng Tám vĩ đại.",
        "content": "<div class=\"al-justify\">\n\nTrong 80 năm dựng xây và bảo vệ Tổ quốc, nhân dân Việt Nam đã vượt qua bao gian nan, thử thách.\n\n![Image](https://res.cloudinary.com/dckuqnehz/image/upload/v1756956602/uploads/img/04-09-2025/nr8iwwzcaqfdxui5qsls.jpg) \n\n***Tự hào Việt Nam – 80 năm một chặng đường, một niềm tin bất diệt!***\n\n</div>",
        "createdAt": "2025-09-01T10:44:50.387Z",
        "slug": "80-nam-quoc-khanh-nuoc-cong-hoa-xa-hoi-chu-nghia-Viet-Nam-01-09-2025",
        "eye_watch": 19,
        "like": 1,
        "comments": 1,
        "author": "Lý Cao Nguyên"
    },
    {
        "_id": "69146fd48b7e747d3f42b696",
        "title": "Lý Cao Nguyên - Đạt danh hiệu học sinh 3 tốt cấp tỉnh Vĩnh Long năm 2024 - 2",
        "img": "https://res.cloudinary.com/dckuqnehz/image/upload/v1762946696/uploads/img/12-11-2025/too1eh1muww3ikoghcsm.jpg",
        "description": "Lý Cao Nguyên, học sinh tiêu biểu của tỉnh Vĩnh Long, đã vinh dự đạt danh hiệu \"Học sinh 3 tốt\" cấp tỉnh năm học 2024–2025.",
        "content": "<div class=\"al-justify\">\n\nTôi tên là Lý Cao Nguyên, một học sinh đang học tập tại tỉnh Vĩnh Long. Trong suốt năm học vừa qua, tôi luôn cố gắng phấn đấu để hoàn thiện bản thân.\n\n![Image](https://res.cloudinary.com/dckuqnehz/image/upload/v1762946696/uploads/img/12-11-2025/too1eh1muww3ikoghcsm.jpg)\n\nKhi được nhận danh hiệu “Học sinh 3 tốt” cấp tỉnh, tôi cảm thấy vừa vui vừa xúc động.\n\n</div>",
        "createdAt": "2025-11-12T11:30:28.880Z",
        "slug": "ly-cao-nguyen-djat-danh-hieu-hoc-sinh-3-tot-cap-tinh-vinh-long-nam-2024-2-12-11-2025",
        "eye_watch": 28,
        "like": 0,
        "comments": 2,
        "author": "Lý Cao Nguyên"
    },
    {
        "_id": "69db8dfdf8b061281d7c529f",
        "title": "Chuyển sang hệ thống CNcode mới",
        "img": "https://res.cloudinary.com/dckuqnehz/image/upload/v1775996369/uploads/img/12-04-2026/ecm7pztell9zd123kise.png",
        "description": "Từ ngày 12 tháng 04 năm 2026, CNcode xin thông báo đến Quý người dùng, chúng tôi sẽ chuyển sang hệ thống CNcode mới",
        "content": "<div class=\"al-center\">\n\n**CHUYỂN SANG HỆ THỐNG CNCODE MỚI**\n\n[Link CNcode mới](https://cncode.io.vn)\n</div>\n\n![Image](https://res.cloudinary.com/dckuqnehz/image/upload/v1775996369/uploads/img/12-04-2026/ecm7pztell9zd123kise.png)\n\n<div class=\"al-right\">\n\n***Trân trọng***\nLý Cao Nguyên\n</div>",
        "createdAt": "2026-04-12T12:20:13.924Z",
        "slug": "chuyen-sang-he-thong-cncode-moi-12-4-2026",
        "eye_watch": 4,
        "like": 0,
        "comments": 0,
        "author": "Lý Cao Nguyên"
    }
];

// Component Blog Detail
const BlogDetail = ({ blog, onBack }: { blog: IBlog; onBack: () => void }) => {
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50/30 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 pt-8 pb-4 px-6 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Quay lại danh sách</span>
                    </button>

                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                        <Calendar className="w-3 h-3" />
                        {formatDate(blog.createdAt)}
                        <span className="mx-2">•</span>
                        <Eye className="w-3 h-3" />
                        {blog.eye_watch} lượt xem
                    </div>

                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                        {blog.title}
                    </h1>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Tác giả</p>
                            <p className="text-sm font-medium text-gray-700">{blog.author}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Featured Image */}
                <div className="rounded-2xl overflow-hidden mb-8 shadow-lg">
                    <img
                        src={blog.img}
                        alt={blog.title}
                        className="w-full h-auto object-cover"
                    />
                </div>

                {/* Blog Content */}
                <article className="prose prose-lg max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {blog.content}
                    </ReactMarkdown>
                </article>

                {/* Interaction Buttons */}
                <div className="flex items-center gap-4 mt-12 pt-8 border-t border-gray-100">
                    <button className="flex items-center gap-2 px-6 py-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm font-medium">Thích ({blog.like})</span>
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Chia sẻ</span>
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                        <Flag className="w-4 h-4" />
                        <span className="text-sm font-medium">Báo cáo</span>
                    </button>
                </div>

                {/* Comments Section */}
                <div className="mt-12">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Bình luận ({blog.comments})
                    </h3>
                    <div className="bg-white rounded-2xl p-6 border border-gray-100">
                        <textarea
                            placeholder="Viết bình luận của bạn..."
                            className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 ring-blue-500/20 resize-none"
                            rows={3}
                        />
                        <button className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                            Gửi bình luận
                        </button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .prose {
                    color: #374151;
                }
                .prose h1, .prose h2, .prose h3 {
                    color: #111827;
                    font-weight: 700;
                    margin-top: 1.5em;
                    margin-bottom: 0.5em;
                }
                .prose p {
                    margin-bottom: 1.25em;
                    line-height: 1.7;
                }
                .prose img {
                    border-radius: 16px;
                    margin: 2rem auto;
                }
                .prose .al-justify {
                    text-align: justify;
                }
                .prose .al-center {
                    text-align: center;
                }
                .prose .al-right {
                    text-align: right;
                }
                .prose blockquote {
                    border-left: 4px solid #3b82f6;
                    padding-left: 1.5rem;
                    margin: 1.5rem 0;
                    font-style: italic;
                    color: #4b5563;
                }
                .prose code {
                    background: #f3f4f6;
                    padding: 0.2rem 0.4rem;
                    border-radius: 6px;
                    font-size: 0.875em;
                }
                .prose pre {
                    background: #1f2937;
                    padding: 1rem;
                    border-radius: 12px;
                    overflow-x: auto;
                }
                .prose pre code {
                    background: none;
                    color: #e5e7eb;
                }
                .prose table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1.5rem 0;
                }
                .prose th, .prose td {
                    border: 1px solid #e5e7eb;
                    padding: 0.75rem;
                    text-align: left;
                }
                .prose th {
                    background: #f9fafb;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

// Main Component
export default function BlogListPage() {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedBlog, setSelectedBlog] = useState<IBlog | null>(null);

    const filteredBlogs: IBlog[] = useMemo(() => {
        return BLOGS_DATA.filter((blog: IBlog) =>
            blog.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Nếu đã chọn blog, hiển thị chi tiết
    if (selectedBlog) {
        return <BlogDetail blog={selectedBlog} onBack={() => setSelectedBlog(null)} />;
    }

    // Hiển thị danh sách blog
    return (
        <div className="min-h-screen bg-gray-50/30 pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-100 pt-12 pb-8 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-4">
                                <BookOpen className="w-3 h-3" />
                                Tin tức & Blog
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                                TRANG THÔNG TIN
                            </h1>
                            <p className="text-gray-400 text-sm mt-2 font-medium">
                                Cập nhật tin tức, kiến thức và những câu chuyện từ CNcode.
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm bài viết..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-500/20 focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Blog Grid */}
            <div className="max-w-7xl mx-auto px-6 mt-12">
                {filteredBlogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredBlogs.map((blog: IBlog) => (
                            <div
                                key={blog._id}
                                onClick={() => setSelectedBlog(blog)}
                                className="group bg-white rounded-[32px] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-100/50 hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-[16/9] overflow-hidden">
                                    <img
                                        src={blog.img}
                                        alt={blog.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-gray-600 flex items-center gap-1.5 shadow-sm">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(blog.createdAt)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 sm:p-8">
                                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <Eye className="w-3.5 h-3.5" />
                                            {blog.eye_watch} lượt xem
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Heart className="w-3.5 h-3.5" />
                                            {blog.like} thích
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            {blog.comments}
                                        </div>
                                    </div>

                                    <h2 className="text-lg font-bold text-gray-800 leading-tight mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {blog.title}
                                    </h2>

                                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6">
                                        {blog.description}
                                    </p>

                                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                                            Đọc tiếp
                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                        <div className="flex items-center gap-1 text-gray-300">
                                            <User className="w-3 h-3" />
                                            <span className="text-[10px] font-bold">{blog.author}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-200" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Không tìm thấy bài viết</h3>
                        <p className="text-gray-400 text-sm">Thử tìm kiếm với từ khóa khác xem sao bạn nhé.</p>
                    </div>
                )}
            </div>
        </div>
    );
}