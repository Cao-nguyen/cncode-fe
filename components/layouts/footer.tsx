'use client'

import Image from "next/image"
import Link from "next/link"

export function Footer() {

    const mxh = [
        { sizew: 34, sizeh: 34, iconDark: "/icons/pw.svg", iconWhite: "/icons/pb.svg", link: "https://zalo.me/0394217863" },
        { sizew: 34, sizeh: 34, iconDark: "/icons/ttw.svg", iconWhite: "/icons/ttb.svg", link: "/" },
        { sizew: 30, sizeh: 30, iconDark: "/icons/fbw.svg", iconWhite: "/icons/fbb.svg", link: "https://www.facebook.com/cncode.edu.vn" },
        { sizew: 30, sizeh: 30, iconDark: "/icons/ytbw.svg", iconWhite: "/icons/ytbb.svg", link: "https://www.youtube.com/@CNcode-edu" },
    ]

    return (
        <div className="w-full px-5 py-5 mb-5 md:mb-12.5 lg:mb-0 md:px-7.5 lg:px-10 lg:py-10 pb-15 bg-[#f6f6f6] dark:bg-[#0e0e0e] text-[clamp(13px,1.4vw,16px)]">

            {/* Logo + slogan */}
            <div className="flex flex-col md:flex-row items-center">

                <Image
                    src="/images/logo.png"
                    alt="Logo CNcode"
                    width={120}
                    height={60}
                    style={{ width: "auto", height: "auto" }}
                    className="md:w-37.5 md:h-20"
                    priority
                />

                <h1 className="font-bold mt-3.5 md:mt-0 md:ml-5 text-[clamp(12px,2.2vw,20px)] text-center md:text-left whitespace-nowrap">
                    CNcode - Nền tảng dạy và học công nghệ thông tin trực tuyến
                </h1>

            </div>

            <div className="flex items-center my-5 w-full h-[0.5px] bg-black/10 dark:bg-white/10"></div>

            <div className="grid grid-cols-2 lg:grid-cols-[35%_15%_15%_10%_15%] gap-x-8 gap-y-8">

                {/* Thông tin chung */}
                <div className="col-span-2 lg:col-span-1 min-w-0">

                    <h3 className="font-semibold mb-2">
                        Thông tin chung
                    </h3>

                    <p className="text-justify">
                        CNcode - Nền tảng dạy và học công nghệ thông tin miễn phí với nhiều
                        công nghệ hiện đại dành cho mọi đối tượng như học sinh, sinh viên,
                        giáo viên, người làm văn phòng,... Với tính năng mới, phù hợp với
                        nhu cầu thực tiễn của xã hội.
                    </p>

                </div>

                {/* Chăm sóc khách hàng */}
                <div className="min-w-0">

                    <h3 className="font-semibold mb-2">
                        Chăm sóc khách hàng
                    </h3>

                    <div className="flex flex-col space-y-2">
                        <Link className="hover:pl-1 transition-all" href="/chatwithadmin">Liên hệ admin</Link>
                        <Link className="hover:pl-1 transition-all" href="/chinhsachbaohanh">Chính sách bảo hành</Link>
                        <Link className="hover:pl-1 transition-all" href="/huongdanthanhtoan">Hướng dẫn thanh toán</Link>
                        <Link className="hover:pl-1 transition-all" href="/quytrinhsudungdichvu">Quy trình sử dụng</Link>
                    </div>

                </div>

                {/* Tính năng */}
                <div className="min-w-0">

                    <h3 className="font-semibold mb-2">
                        Tính năng
                    </h3>

                    <div className="flex flex-col space-y-2">
                        <Link className="hover:pl-1 transition-all" href="/giasuai">Gia sư AI</Link>
                        <Link className="hover:pl-1 transition-all" href="/cuahangso">Cửa hàng số</Link>
                        <Link className="hover:pl-1 transition-all" href="/diendan">Diễn đàn</Link>
                        <Link className="hover:pl-1 transition-all" href="/baiviet">Bài viết</Link>
                    </div>

                </div>

                {/* Về chúng tôi */}
                <div className="min-w-0">

                    <h3 className="font-semibold mb-2">
                        Về chúng tôi
                    </h3>

                    <div className="flex flex-col space-y-2">
                        <Link className="hover:pl-1 transition-all" href="/gioithieu">Giới thiệu</Link>
                        <Link className="hover:pl-1 transition-all" href="/hotro">Trung tâm hỗ trợ</Link>
                        <Link className="hover:pl-1 transition-all" href="/hanhtrinhiyeuthuong">Hành trình yêu thương</Link>
                    </div>

                </div>

                {/* Điều hành */}
                <div className="min-w-0">

                    <h3 className="font-semibold mb-2">
                        Điều hành
                    </h3>

                    <div className="flex flex-col space-y-2">
                        <Link className="hover:pl-1 transition-all" target="_blank" href="https://zalo.me/0394217863">
                            Founder: Lý Cao Nguyên
                        </Link>
                        <Link className="hover:pl-1 transition-all" href="/sanphamlienket">
                            Sản phẩm của chúng tôi
                        </Link>
                    </div>

                </div>

            </div>

            <div className="flex items-center my-5 w-full h-[0.5px] bg-black/10 dark:bg-white/10"></div>

            {/* Footer dưới */}
            <div className="flex flex-col items-center md:flex-row md:justify-between gap-5">

                <div className="flex flex-row gap-5 items-center">

                    <Link className="dark:text-white whitespace-nowrap" href="/dieukhoansudung">
                        Điều khoản sử dụng
                    </Link>

                    <div className="h-7 bg-black/10 dark:bg-white/10 w-px"></div>

                    <Link className="dark:text-white whitespace-nowrap" href="/antoanbaomat">
                        An toàn & bảo mật
                    </Link>

                </div>

                <div className="flex flex-row gap-5 items-center">

                    <p className="dark:text-white uppercase whitespace-nowrap">
                        Theo dõi chúng tôi
                    </p>

                    <div className="h-7 bg-black/10 dark:bg-white/10 w-px"></div>

                    {mxh.map((item) => (
                        <Link
                            className="transition-all duration-150 hover:scale-105 hover:shadow-3xl"
                            key={item.link}
                            href={item.link}
                            target="_blank"
                        >
                            <Image className="hidden dark:block" width={item.sizew} height={item.sizeh} src={item.iconDark} alt="icon" />
                            <Image className="block dark:hidden" width={item.sizew} height={item.sizeh} src={item.iconWhite} alt="icon" />
                        </Link>
                    ))}

                </div>

            </div>

            <p className="text-center mt-5 dark:text-white whitespace-nowrap">
                Copyright © 2026 CNcode. All rights reserved.
            </p>

        </div>
    )
}