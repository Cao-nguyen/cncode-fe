"use client"
import "swiper/css"
import "swiper/css/pagination"
import Slideshow from "@/components/ui/slideshow"
import Image from "next/image"
import Link from "next/link"
import CardCourses from "@/components/ui/card-courses"

export default function Home() {
    const banner = [
        { linkImg: "/images/banner_giasuai.png", alt: "Gia sư AI", link: "/giasuai" },
        { linkImg: "/images/banner_cnbooks.png", alt: "CNbooks", link: "/ebook" },
        { linkImg: "/images/banner_cnjobs.png", alt: "CNjobs", link: "/timviec" }
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
                        <div data-aos="zoom-in" data-aos-delay="100"><CardCourses /></div>
                        <div data-aos="zoom-in" data-aos-delay="200"><CardCourses /></div>
                        <div data-aos="zoom-in" data-aos-delay="300"><CardCourses /></div>
                        <div data-aos="zoom-in" data-aos-delay="400"><CardCourses /></div>
                    </div>
                </div>
            </div>
        </div>
    )
}