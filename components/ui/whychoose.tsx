"use client"

import Image from "next/image"
import {
    Teacher,
    Personalcard,
    People,
    Book
} from "iconsax-react"

export default function WhyChoose() {

    const data = [
        {
            icon: <Book size={26} className="text-dark dark:text-white" variant="Bold" />,
            title: "Phương pháp giảng dạy hiện đại",
            desc: "Chương trình học được thiết kế phù hợp với chương trình và năng lực của người học"
        },
        {
            icon: <People size={26} className="text-dark dark:text-white" variant="Bold" />,
            title: "Video bài giảng tương tác",
            desc: "Học online nhưng giống như đang học trên lớp với tính năng tương tác ngay trong lúc học"
        },
        {
            icon: <Teacher size={26} className="text-dark dark:text-white" variant="Bold" />,
            title: "Giá cả của khoá học phù hợp",
            desc: "Giá cả phù hợp với nhiều đối tượng và có nhiều ưu đãi hàng tháng"
        },
        {
            icon: <Personalcard size={26} className="text-dark dark:text-white" variant="Bold" />,
            title: "Cộng đồng hỗ trợ",
            desc: "CNcode không chỉ đang dạy bạn học mà đang kết nối bạn với những người cùng học để chia sẻ và trao đổi với nhau"
        }
    ]

    return (
        <div className="mt-0">

            <div className="
                grid grid-cols-1 lg:grid-cols-2 gap-8 items-center
            ">

                {/* LEFT - IMAGE */}
                <div className="relative w-full h-65 md:h-87.5 lg:h-105 rounded-2xl overflow-hidden">
                    <Image
                        src="/images/images1.jpg"
                        alt="why choose"
                        fill
                        className="object-cover"
                    />
                </div>

                {/* RIGHT - CONTENT */}
                <div className="flex flex-col gap-5">

                    {data.map((item, index) => (
                        <div
                            key={index}
                            className="
                                flex items-start gap-4
                                p-4 rounded-xl
                                border border-[#e6e6e6] dark:border-[#222]
                                bg-white dark:bg-[#171717]
                                hover:shadow-md hover:-translate-y-1
                                transition
                            "
                        >

                            {/* Icon */}
                            <div className="
                                min-w-10.5 h-10.5
                                flex items-center justify-center
                                rounded-xl
                                bg-gray-100 dark:bg-[#222]
                            ">
                                {item.icon}
                            </div>

                            {/* Text */}
                            <div>
                                <h3 className="font-semibold text-sm md:text-base">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {item.desc}
                                </p>
                            </div>

                        </div>
                    ))}

                </div>

            </div>
        </div>
    )
}