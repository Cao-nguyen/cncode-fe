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
        <div className="w-[100%] px-[40px] py-[40px] dark:bg-[#0e0e0e]">

            {/* Nơi chứa logo và text lớn */}
            <div className="flex items-center">
                <Image
                    src="/logo.png"
                    alt="Logo CNcode"
                    width={150}
                    height={80}
                />
                <h1 className="font-bold ml-[20px] text-[20px]">CNcode - Nền tảng dạy và học công nghệ thông tin trực tuyến</h1>
            </div>

            <div className="flex items-center my-[20px] w-[100%%] h-[0.5px] bg-white/10 mx-auto"></div>

            {/* Nội dung chính của footer */}
            <div>Nội dung đang trống</div>

            <div className="flex items-center my-[20px] w-[100%] h-[0.5px] bg-white/10 mx-auto"></div>

            {/* Nội dung phụ bên dưới */}
            <div className="flex justify-between">
                <div className="flex gap-[20px]">
                    <Link className="text-white" href="/dieu-khoan-su-dung">Điều khoản sử dụng</Link>
                    <div className="h-[30px] bg-white/10 w-[1px]"></div>
                    <Link className="text-white" href="/an-toan-bao-mat">An toàn & bảo mật</Link>
                </div>
                <div className="flex gap-[20px]">
                    <p className="text-white uppercase">theo dõi chúng tôi</p>
                    <div className="h-[30px] bg-white/10 w-[1px]"></div>
                    {mxh.map((item) => (
                        <Link href={item.link} target="_blank">
                            <IonIcon className="text-[20px]" icon={item.icon} color="#FFF" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}