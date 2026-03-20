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
                <h1>Khoá học nổi bật</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <CardCourses />
                    <CardCourses />
                    <CardCourses />
                    <CardCourses />
                </div>
            </div>
        </div>
    )
}