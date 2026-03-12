"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"

import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

import Image from "next/image"
import Link from "next/link"

export default function Home() {

    const slides = [
        {
            title: "Lớp Fullstack qua Zoom 👑",
            desc: "Học online trực tiếp qua Zoom, được review code và hỗ trợ bởi giảng viên.",
            btn: "NHẬN LỘ TRÌNH FULLSTACK",
            img: "/banner/banner1.png",
            link: "/courses/fullstack",
        },
        {
            title: "Học lập trình từ con số 0",
            desc: "Lộ trình bài bản giúp bạn trở thành lập trình viên Fullstack.",
            btn: "XEM KHÓA HỌC",
            img: "/banner/banner2.png",
            link: "/courses",
        },
    ]

    return (
        <div className="w-full mx-auto p-[5px] md:p-[10px] lg:p-[15px]">

            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                navigation
                autoplay={{ delay: 4000 }}
                loop
                pagination={{ clickable: true }}
            >

                {slides.map((s, i) => (
                    <SwiperSlide key={i}>

                        <div className="
              flex flex-col md:flex-row
              items-center justify-between
              bg-gradient-to-r
              from-sky-600 to-teal-400
              rounded-2xl
              px-6 md:px-10
              py-10 md:py-12
              gap-6
            ">

                            <div className="max-w-xl text-white text-center md:text-left">

                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                                    {s.title}
                                </h2>

                                <p className="mt-4 opacity-90 text-sm md:text-base">
                                    {s.desc}
                                </p>

                                <Link
                                    href={s.link}
                                    className="
                    inline-block
                    mt-6
                    border border-white
                    px-5 py-2
                    rounded-full
                    hover:bg-white
                    hover:text-black
                    transition
                  "
                                >
                                    {s.btn}
                                </Link>

                            </div>

                            <div className="relative w-full md:w-[420px] h-[220px] md:h-[260px]">
                                <Image
                                    src={s.img}
                                    alt={s.title}
                                    fill
                                    className="object-contain"
                                />
                            </div>

                        </div>

                    </SwiperSlide>
                ))}

            </Swiper>

        </div>
    )
}