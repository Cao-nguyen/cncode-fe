"use client";

import Image from "next/image";
import Link from "next/link";

const SOCIALS = [
    { size: 30, icon: "/icons/pb.svg", link: "https://zalo.me/0394217863", big: true },
    { size: 30, icon: "/icons/ttb.svg", link: "https://www.tiktok.com/@cncode.io.vn?lang=vi-VN", big: true },
    { size: 34, icon: "/icons/fbb.svg", link: "https://www.facebook.com/cncode.edu.vn" },
    { size: 34, icon: "/icons/ytbb.svg", link: "https://www.youtube.com/@CNcode-edu" },
];

const LINKS = [
    {
        title: "Chăm sóc khách hàng",
        items: [
            { href: "/chatwithadmin", label: "Liên hệ admin" },
            { href: "/chinhsachbaohanh", label: "Chính sách bảo hành" },
            { href: "/huongdanthanhtoan", label: "Hướng dẫn thanh toán" },
            { href: "/quytrinhsudung", label: "Quy trình sử dụng" },
        ],
    },
    {
        title: "Tính năng nổi bật",
        items: [
            { href: "/giasuai", label: "Gia sư AI" },
            { href: "/cuahangso", label: "Cửa hàng số" },
            { href: "/forum", label: "Diễn đàn" },
            { href: "/rutgonlink", label: "Rút gọn link" },
        ],
    },
    {
        title: "Về chúng tôi",
        items: [
            { href: "/gioithieu", label: "Giới thiệu" },
            { href: "/hotro", label: "Trung tâm hỗ trợ" },
            { href: "/hanhtrinhyeuthuong", label: "Hành trình yêu thương" },
        ],
    },
    {
        title: "Điều hành",
        items: [
            { href: "https://zalo.me/0394217863", label: "Founder: Lý Cao Nguyên", external: true },
            { href: "/sanphamlienket", label: "Sản phẩm của chúng tôi" },
        ],
    },
];

function Divider({ vertical = false }: { vertical?: boolean }) {
    if (vertical) {
        return <div className="w-px h-5 md:h-7 bg-white/20" />;
    }
    return <div className="my-5 w-full h-[0.5px] bg-white/20" />;
}

export default function Footer() {
    return (
        <footer className="w-full px-5 py-5 mb-5 md:mb-12.5 lg:mb-0 md:px-7.5 lg:px-10 lg:py-10 pb-15 bg-[#242938] text-white text-[clamp(13px,1.4vw,16px)]">
            <div className="flex flex-col items-center md:flex-row md:items-center">
                <Image
                    src="/images/logo.png"
                    alt="Logo CNcode"
                    width={120}
                    height={60}
                    className="md:w-37.5 md:h-20 brightness-0 invert"
                    priority
                />
                <h1 className="hidden md:block font-bold md:ml-5 text-[clamp(12px,2.2vw,20px)] whitespace-nowrap text-white">
                    CNcode - Nền tảng học công nghệ và sáng tạo đổi mới
                </h1>
            </div>

            <Divider />

            <div className="grid grid-cols-2 lg:grid-cols-[35%_15%_13%_12%_15%] gap-8">
                <div className="col-span-2 lg:col-span-1">
                    <h3 className="font-semibold mb-2 text-white">Thông tin chung</h3>
                    <p className="text-justify text-white/80">
                        CNcode - Nền tảng học công nghệ và đổi mới sáng tạo với nhiều công nghệ hiện đại
                        dành cho mọi đối tượng như học sinh, sinh viên, giáo viên, người làm văn phòng,...
                    </p>
                </div>

                {LINKS.map((group) => (
                    <div key={group.title}>
                        <h3 className="font-semibold mb-2 text-white">{group.title}</h3>
                        <div className="flex flex-col space-y-2">
                            {group.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    target={item.external ? "_blank" : undefined}
                                    className="hover:pl-1 transition-all text-white/70 hover:text-white"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <Divider />

            <div className="flex flex-col items-center md:flex-row md:justify-between gap-5">
                <div className="flex items-center gap-3 md:gap-5">
                    <Link href="/dieukhoansudung" className="text-white/70 hover:text-white transition-colors">
                        Điều khoản sử dụng
                    </Link>
                    <Divider vertical />
                    <Link href="/antoanbaomat" className="text-white/70 hover:text-white transition-colors">
                        An toàn & bảo mật
                    </Link>
                </div>

                <div className="flex items-center gap-3 md:gap-5">
                    <p className="uppercase whitespace-nowrap text-white/80">Theo dõi chúng tôi</p>
                    <Divider vertical />

                    {SOCIALS.map((item, index) => (
                        <Link
                            key={index}
                            href={item.link}
                            target="_blank"
                            className="flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                        >
                            <Image
                                src={item.icon}
                                alt="icon"
                                width={item.size}
                                height={item.size}
                                className={`object-contain brightness-0 invert ${item.big ? "w-7 h-7 md:w-9 md:h-9" : "w-6 h-6 md:w-8 md:h-8"}`}
                            />
                        </Link>
                    ))}
                </div>
            </div>

            <p className="text-center mt-5 whitespace-nowrap text-white/60 text-sm">
                Copyright © 2026 CNcode. All rights reserved.
            </p>
        </footer>
    );
}