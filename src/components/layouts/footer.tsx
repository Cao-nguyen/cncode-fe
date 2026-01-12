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
        <div className="w-[100%] px-[20px] py-[20px] mb-[20px] md:mb-[50px] lg:mb-[0px] md:px-[30px] md:py-[35px] lg:px-[40px] lg:py-[40px] 2xl:pb-[40px] pb-[60px] bg-[#f6f6f6] dark:bg-[#0e0e0e]">

            {/* Nơi chứa logo và text lớn */}
            <div className="flex flex-col md:flex-row items-center md:items-center">
                <Image
                    src="/logo.png"
                    alt="Logo CNcode"
                    width={120}
                    height={60}
                    className="md:w-[150px] md:h-[80px] lg:w-[150px] lg:h-[80px]"
                />
                <h1 className="font-bold mt-[15px] md:mt-0 md:ml-[20px] text-[16px] md:text-[18px] lg:text-[20px] text-center md:text-left">CNcode - Nền tảng dạy và học công nghệ thông tin trực tuyến</h1>
            </div>

            <div className="flex items-center my-[20px] w-[100%%] h-[0.5px] bg-black/10 dark:bg-white/10 mx-auto"></div>

            {/* Nội dung chính của footer */}
            <div>Nội dung đang trống</div>

            <div className="flex items-center my-[20px] w-[100%] h-[0.5px] bg-black/10 dark:bg-white/10 mx-auto"></div>

            {/* Nội dung phụ bên dưới */}
            <div className="flex flex-col md:flex-row md:justify-between gap-[20px] md:gap-0">
                <div className="flex flex-row gap-[20px] items-center">
                    <Link className="dark:text-white" href="/dieu-khoan-su-dung">Điều khoản sử dụng</Link>
                    <div className="h-[30px] bg-black/10 dark:bg-white/10 w-[1px]"></div>
                    <Link className="dark:text-white" href="/an-toan-bao-mat">An toàn & bảo mật</Link>
                </div>
                <div className="flex flex-row gap-[20px] items-center">
                    <p className="dark:text-white uppercase">theo dõi chúng tôi</p>
                    <div className="h-[30px] bg-black/10 dark:bg-white/10 w-[1px]"></div>
                    {mxh.map((item) => (
                        <Link key={item.link} href={item.link} target="_blank">
                            <IonIcon className="text-[20px]" icon={item.icon} color="#FFF" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* Bản quyền */}
            <p className="text-center mt-[20px] dark:text-white">Copyright © 2025 CNcode. All rights reserved.</p>
        </div>
    )
}