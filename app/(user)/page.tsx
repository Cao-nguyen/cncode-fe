"use client"
import "swiper/css"
import "swiper/css/pagination"
import Slideshow from "@/components/ui/slideshow"
import Image from "next/image"
import Link from "next/link"
import CardCourses from "@/components/ui/card-courses"
import Roadmap from "@/components/ui/roadmap"
import Stats from "@/components/ui/stats"
import { User, Book, TaskSquare, Award } from "iconsax-react"
import { useTheme } from "next-themes"
import BlogCard from "@/components/ui/blog"

export default function Home() {
    const { theme } = useTheme()
    const colorTheme = theme === "dark" ? "#111" : "#fff"
    const roadmapData = [
        {
            title: "Web Dev",
            steps: ["HTML/CSS", "JavaScript", "React/Next"],
            link: "/roadmap/web"
        },
        {
            title: "AI Engineer",
            steps: ["Python", "Machine Learning", "Deep Learning"],
            link: "/roadmap/ai"
        },
        {
            title: "Game Dev",
            steps: ["C#/C++", "Unity", "Publish Game"],
            link: "/roadmap/game"
        }
    ]

    const banner = [
        { linkImg: "/images/banner_giasuai.png", alt: "Gia sư AI", link: "/giasuai" },
        { linkImg: "/images/banner_cnbooks.png", alt: "CNbooks", link: "/ebook" },
        { linkImg: "/images/banner_cnjobs.png", alt: "CNjobs", link: "/timviec" }
    ]

    const statsData = [
        {
            label: "Người học",
            value: 12000,
            icon: <User size={20} color={colorTheme} variant="Bold" />
        },
        {
            label: "Khoá học",
            value: 120,
            icon: <Book size={20} color={colorTheme} variant="Bold" />
        },
        {
            label: "Bài tập",
            value: 3500,
            icon: <TaskSquare size={20} color={colorTheme} variant="Bold" />
        },
        {
            label: "Thành tựu",
            value: 980,
            icon: <Award size={20} color={colorTheme} variant="Bold" />
        }
    ]

    return (
        <div>
            <Slideshow />
            <div className="m-5 xl:m-10">
                {/* Banner giới thiệu */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {banner.map((item, index) => (
                        <Link key={index} href={item.link}>
                            <Image
                                width={450}
                                height={100}
                                src={item.linkImg}
                                alt={item.alt}
                                className="rounded-2xl w-full"
                            />
                        </Link>
                    ))}
                </div>

                {/* Khoá học nổi bật */}
                <div className="mt-8">
                    <div className="mb-5" data-aos="fade-up">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white">
                            Khoá học nổi bật
                        </h1>

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Khám phá các khoá học chất lượng cao dành cho bạn
                        </p>

                        <div className="w-16 h-0.75 bg-black dark:bg-white mt-2 rounded-full" />
                    </div>

                    <div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                        data-aos="fade-up"
                        data-aos-delay="100"
                    >
                        <div data-aos="zoom-in" data-aos-delay="100">
                            <CardCourses
                                title="Khóa học Fullstack từ A-Z"
                                description="Học từ cơ bản đến nâng cao, build dự án thực tế."
                                image="/images/images1.jpg"
                                duration="12h"
                                students="1.2K"
                                price="299.000đ"
                                oldPrice="499.000đ"
                                discount={40}
                                isFree={false}
                                link="/course"
                            />
                        </div>
                        <div data-aos="zoom-in" data-aos-delay="100">
                            <CardCourses
                                title="Khóa học Fullstack từ A-Z"
                                description="Học từ cơ bản đến nâng cao, build dự án thực tế."
                                image="/images/images1.jpg"
                                duration="12h"
                                students="1.2K"
                                price="299.000đ"
                                oldPrice="499.000đ"
                                discount={40}
                                isFree={false}
                                link="/course"
                            />
                        </div>
                        <div data-aos="zoom-in" data-aos-delay="100">
                            <CardCourses
                                title="Khóa học Fullstack từ A-Z"
                                description="Học từ cơ bản đến nâng cao, build dự án thực tế."
                                image="/images/images1.jpg"
                                duration="12h"
                                students="1.2K"
                                price="299.000đ"
                                oldPrice="499.000đ"
                                discount={40}
                                isFree={false}
                                link="/course"
                            />
                        </div>
                        <div data-aos="zoom-in" data-aos-delay="100">
                            <CardCourses
                                title="Khóa học Fullstack từ A-Z"
                                description="Học từ cơ bản đến nâng cao, build dự án thực tế. Học từ cơ bản đến nâng cao, build dự án thực tế. Học từ cơ bản đến nâng cao, build dự án thực tế."
                                image="/images/images1.jpg"
                                duration="12h"
                                students="1.2K"
                                price="299.000đ"
                                oldPrice="499.000đ"
                                discount={40}
                                isFree={false}
                                link="/course"
                            />
                        </div>
                    </div>
                </div>

                {/* Lộ trình học tập */}
                <div className="mt-8">
                    <div className="mb-5" data-aos="fade-up">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white">
                            Lộ trình cơ bản
                        </h1>

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Khám phá hành trình học tập chúng tôi đã nghiên cứu sáng tạo ra
                        </p>

                        <div className="w-16 h-0.75 bg-black dark:bg-white mt-2 rounded-full" />
                    </div>

                    <div className="mx-auto">
                        <Roadmap data={roadmapData} />
                    </div>
                </div>

                {/* Thành tựu */}
                <div className="mt-8">
                    <div className="mb-5" data-aos="fade-up">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white">
                            Thành tựu của chúng tôi
                        </h1>

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Hãy xem những giá trị của chúng tôi tạo ra
                        </p>

                        <div className="w-16 h-0.75 bg-black dark:bg-white mt-2 rounded-full" />
                    </div>

                    <div className="mx-auto">
                        <Stats data={statsData} />
                    </div>
                </div>

                {/* Bài viết */}
                <div className="mt-8">
                    <div className="mb-5" data-aos="fade-up">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white">
                            Bài viết nổi bật
                        </h1>

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Hãy xem mọi người đang bàn luận về những vấn đề nào
                        </p>

                        <div className="w-16 h-0.75 bg-black dark:bg-white mt-2 rounded-full" />
                    </div>

                    <div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                        data-aos="fade-up"
                        data-aos-delay="100"
                    >
                        <div data-aos="zoom-in" data-aos-delay="100">
                            <BlogCard
                                title="Cách học lập trình hiệu quả cho người mới bắt đầu"
                                description="Bài viết này sẽ giúp bạn hiểu rõ lộ trình học lập trình từ con số 0 đến khi có thể đi làm thực tế..."
                                image="/images/image2.jpg"
                                time="5 phút đọc"
                                author="Nguyễn Văn A"
                                avatar="/images/avatar.jpg"
                                link="/blog/1"
                            />
                        </div>
                        <div data-aos="zoom-in" data-aos-delay="100">
                            <BlogCard
                                title="Cách học lập trình hiệu quả cho người mới bắt đầu"
                                description="Bài viết này sẽ giúp bạn hiểu rõ lộ trình học lập trình từ con số 0 đến khi có thể đi làm thực tế..."
                                image="/images/image2.jpg"
                                time="5 phút đọc"
                                author="Nguyễn Văn A"
                                avatar="/images/avatar.jpg"
                                link="/blog/1"
                            />
                        </div>
                        <div data-aos="zoom-in" data-aos-delay="100">
                            <BlogCard
                                title="Cách học lập trình hiệu quả cho người mới bắt đầu"
                                description="Bài viết này sẽ giúp bạn hiểu rõ lộ trình học lập trình từ con số 0 đến khi có thể đi làm thực tế..."
                                image="/images/image2.jpg"
                                time="5 phút đọc"
                                author="Nguyễn Văn A"
                                avatar="/images/avatar.jpg"
                                link="/blog/1"
                            />
                        </div>
                        <div data-aos="zoom-in" data-aos-delay="100">
                            <BlogCard
                                title="Cách học lập trình hiệu quả cho người mới bắt đầu"
                                description="Bài viết này sẽ giúp bạn hiểu rõ lộ trình học lập trình từ con số 0 đến khi có thể đi làm thực tế..."
                                image="/images/image2.jpg"
                                time="5 phút đọc"
                                author="Nguyễn Văn A"
                                avatar="/images/avatar.jpg"
                                link="/blog/1"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}