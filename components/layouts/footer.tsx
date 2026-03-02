'use client'
import Image from "next/image"
import Link from "next/link"
import { IonIcon } from "@ionic/react"
import { callSharp, logoFacebook, logoYoutube } from "ionicons/icons"

export function Footer() {

    const mxh = [
        { icon: callSharp, link: "https:/zalo.me/0394217863" },
        { icon: logoFacebook, link: "https://www.facebook.com/cncode.edu.vn" },
        { icon: logoYoutube, link: "https://www.youtube.com/@CNcode-edu" }
    ]

    return (
        <div className="w-full px-5 py-5 mb-5 md:mb-12.5 lg:mb-0 md:px-7.5 md:8.75 lg:px-10 lg:py-10 2xl:pb-10 pb-15 bg-[#f6f6f6] dark:bg-[#0e0e0e]">

            {/* Nơi chứa logo và text lớn */}
            <div className="flex flex-col md:flex-row items-center md:items-center">
                <Image
                    src="/logo.png"
                    alt="Logo CNcode"
                    width={120}
                    height={60}
                    style={{ width: "auto", height: "auto" }}
                    className="md:w-37.5 md:h-20 lg:w-37.5 lg:h-20"
                    priority
                />
                <h1 className="font-bold mt-3.75 md:mt-0 md:ml-5 text-[16px] md:text-[18px] lg:text-[20px] text-center md:text-left">CNcode - Nền tảng dạy và học công nghệ thông tin trực tuyến</h1>
            </div>

            <div className="flex items-center my-5 w-[100%%] h-[0.5px] bg-black/10 dark:bg-white/10 mx-auto"></div>

            {/* Nội dung chính của footer */}
            <div>Nội dung đang trống</div>

            <div className="flex items-center my-5 w-full h-[0.5px] bg-black/10 dark:bg-white/10 mx-auto"></div>

            {/* Nội dung phụ bên dưới */}
            <div className="flex flex-col items-center md:flex-row md:justify-between gap-5 md:gap-0">
                <div className="flex flex-row gap-5 items-center">
                    <Link className="dark:text-white" href="/dieu-khoan-su-dung">Điều khoản sử dụng</Link>
                    <div className="h-7.5 bg-black/10 dark:bg-white/10 w-px"></div>
                    <Link className="dark:text-white" href="/an-toan-bao-mat">An toàn & bảo mật</Link>
                </div>
                <div className="flex flex-row gap-5 items-center">
                    <p className="dark:text-white uppercase">theo dõi chúng tôi</p>
                    <div className="h-7.5 bg-black/10 dark:bg-white/10 w-px"></div>
                    {mxh.map((item) => (
                        <Link key={item.link} href={item.link} target="_blank">
                            <IonIcon className="text-[20px]" icon={item.icon} color="#FFF" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* Bản quyền */}
            <p className="text-center mt-5 dark:text-white">Copyright © 2026 CNcode. All rights reserved.</p>
        </div>
    )
}