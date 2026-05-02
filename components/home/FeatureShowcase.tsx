"use client";

import Link from "next/link";
import React, { useState } from "react";

interface Service {
    tooltip: string;
    href: string;
    icon: React.ReactNode;
    label: string;
    sublabel: string;
}

// ─── Logo Icons ───────────────────────────────────────────────────────────────

const IconCNbooks = () => (
    <div className="border border-slate-200 rounded-full px-4 py-1.5 inline-flex items-baseline gap-0.5 bg-white">
        <span className="text-[15px] font-black text-red-500 tracking-tight italic">CN</span>
        <span className="text-[13px] font-bold text-slate-700 tracking-wide">books</span>
    </div>
);

const IconCNjobs = () => (
    <div className="border border-slate-200 rounded-full px-4 py-1.5 inline-flex items-baseline gap-0.5 bg-white">
        <span className="text-[15px] font-black text-red-500 tracking-tight italic">CN</span>
        <span className="text-[13px] font-bold text-slate-700 tracking-wide">jobs</span>
    </div>
);

const IconGiaSuAI = () => (
    <div className="border border-indigo-200 rounded-full px-4 py-1.5 inline-flex items-baseline gap-1 bg-indigo-50">
        <span className="text-[14px] font-black text-indigo-700 italic">Gia sư</span>
        <span className="text-[9px] font-black text-indigo-400 tracking-widest self-start mt-0.5">AI</span>
    </div>
);

const IconGopY = () => (
    <div className="border border-amber-200 rounded-full px-4 py-1.5 inline-flex items-baseline gap-1 bg-amber-50">
        <span className="text-[15px] font-black text-amber-600 italic tracking-tight">Góp ý</span>
        <span className="text-[9px] font-bold text-amber-400 tracking-widest self-start mt-0.5">✦</span>
    </div>
);

const IconChatAdmin = () => (
    <div className="border border-emerald-200 rounded-full px-4 py-1.5 inline-flex items-baseline gap-1 bg-emerald-50">
        <span className="text-[14px] font-black text-emerald-600 italic">Chat</span>
        <span className="text-[8px] font-black text-emerald-400 tracking-widest self-end mb-0.5">ADMIN</span>
    </div>
);

const IconHoiDap = () => (
    <div className="border border-blue-200 rounded-full px-4 py-1.5 inline-flex items-baseline gap-0 bg-blue-50">
        <span className="text-[16px] font-black text-blue-700 italic">H</span>
        <span className="text-[11px] font-bold text-blue-500">ỏi </span>
        <span className="text-[16px] font-black text-blue-700 italic ml-1">Đ</span>
        <span className="text-[11px] font-bold text-blue-500">áp</span>
    </div>
);

const IconTruyenThong = () => (
    <div className="border border-purple-200 rounded-full px-3 py-1.5 inline-flex items-baseline gap-1 bg-purple-50">
        <span className="text-[13px] font-black text-purple-700 italic tracking-tight">Truyền</span>
        <span className="text-[8px] font-black text-purple-400 tracking-widest self-end mb-0.5">THÔNG</span>
    </div>
);

const IconTiepThi = () => (
    <div className="border border-orange-200 rounded-full px-4 py-1.5 inline-flex items-baseline gap-0.5 bg-orange-50">
        <span className="text-[13px] font-black text-orange-600 italic">Affiliate</span>
        <span className="text-[9px] font-black text-orange-400 self-start mt-0.5">®</span>
    </div>
);

const IconCNsocial = () => (
    <div className="border border-slate-200 rounded-full px-4 py-1.5 inline-flex items-baseline gap-0.5 bg-white">
        <span className="text-[15px] font-black text-red-500 tracking-tight italic">CN</span>
        <span className="text-[13px] font-bold text-slate-700 tracking-wide">social</span>
    </div>
);

const IconRutGon = () => (
    <div className="border border-pink-200 rounded-full px-4 py-1.5 inline-flex items-baseline gap-1 bg-pink-50">
        <span className="text-[14px] font-black text-pink-600 italic tracking-tight">short</span>
        <span className="text-[8px] font-black text-pink-400 tracking-widest self-start mt-0.5">URL</span>
    </div>
);

const IconKhoahoc = () => (
    <div className="border border-violet-200 rounded-full px-4 py-1.5 inline-flex items-center gap-1.5 bg-violet-50">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M12 3L2 8l10 5 10-5-10-5z" fill="#7c3aed" />
            <path d="M2 12l10 5 10-5" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
            <path d="M2 16l10 5 10-5" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="text-[14px] font-black text-violet-700 italic tracking-tight">Khoá học</span>
    </div>
);

const IconLuyentap = () => (
    <div className="border border-green-200 rounded-full px-4 py-1.5 inline-flex items-center gap-1.5 bg-green-50">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#16a34a" strokeWidth="2" />
            <path d="M9 12l2 2 4-4" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[14px] font-black text-green-700 italic tracking-tight">Luyện tập</span>
    </div>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const SERVICES: Service[] = [
    { tooltip: "Xem CNbooks", href: "/cnbooks", label: "CNbooks", sublabel: "Sách & tài liệu học tập", icon: <IconCNbooks /> },
    { tooltip: "Xem CNjobs", href: "/cnjobs", label: "CNjobs", sublabel: "Việc làm & tuyển dụng", icon: <IconCNjobs /> },
    { tooltip: "Trải nghiệm Gia sư AI", href: "/giasuai", label: "Gia sư AI", sublabel: "Học với AI thông minh", icon: <IconGiaSuAI /> },
    { tooltip: "Gửi góp ý", href: "/gopy", label: "Góp ý", sublabel: "Phản hồi & cải thiện", icon: <IconGopY /> },
    { tooltip: "Chat với Admin", href: "/chatwithadmin", label: "Chat với Admin", sublabel: "Hỗ trợ trực tiếp", icon: <IconChatAdmin /> },
    { tooltip: "Hỏi đáp cộng đồng", href: "/faq", label: "Hỏi đáp", sublabel: "Cộng đồng giải đáp", icon: <IconHoiDap /> },
    { tooltip: "Truyền thông chéo", href: "/truyenthongcheo", label: "Truyền thông chéo", sublabel: "Kết nối đa kênh", icon: <IconTruyenThong /> },
    { tooltip: "Tiếp thị liên kết", href: "/me/affiliate", label: "Tiếp thị liên kết", sublabel: "Affiliate & hoa hồng", icon: <IconTiepThi /> },
    { tooltip: "Xem CNsocial", href: "/cnsocial", label: "CNsocial", sublabel: "Mạng xã hội cộng đồng", icon: <IconCNsocial /> },
    { tooltip: "Rút gọn link ngay", href: "/rutgonlink", label: "Rút gọn link", sublabel: "Sở hữu link ngắn dễ dàng share", icon: <IconRutGon /> },
    { tooltip: "Khoá học", href: "/khoahoc", label: "Khoá học", sublabel: "Học những điều thú vị", icon: <IconKhoahoc /> },
    { tooltip: "Luyện tập", href: "/luyentap", label: "Luyện tập", sublabel: "Lên trình tư duy cùng bài tập", icon: <IconLuyentap /> },
];

// ─── ServiceItem ──────────────────────────────────────────────────────────────

function ServiceItem({ svc }: { svc: Service }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <Link
                href={svc.href}
                className="relative flex flex-col items-center text-center px-3 py-5 sm:px-4 sm:py-7 no-underline transition-colors duration-200 hover:bg-slate-50"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Tooltip — ẩn trên mobile */}
                <div
                    className="absolute left-1/2 pointer-events-none z-10 whitespace-nowrap hidden sm:block"
                    style={{
                        top: -40,
                        transform: `translateX(-50%) translateY(${hovered ? 0 : 4}px)`,
                        opacity: hovered ? 1 : 0,
                        transition: "opacity 0.15s, transform 0.15s",
                    }}
                >
                    <div className="bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
                        {svc.tooltip}
                    </div>
                    <div
                        className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
                        style={{
                            top: "100%",
                            borderLeft: "5px solid transparent",
                            borderRight: "5px solid transparent",
                            borderTop: "5px solid #1e293b",
                        }}
                    />
                </div>

                {/* Icon */}
                <div
                    className="mb-3 sm:mb-5 flex items-center justify-center"
                    style={{
                        transform: hovered ? "scale(1.06)" : "scale(1)",
                        transition: "transform 0.2s",
                    }}
                >
                    {svc.icon}
                </div>

                {/* Label */}
                <p className="text-xs sm:text-sm font-bold text-slate-800 mb-0.5 sm:mb-1 leading-tight">
                    {svc.label}
                </p>

                {/* Sublabel — ẩn trên mobile nhỏ */}
                <p className="hidden sm:block text-xs text-slate-400 leading-snug">
                    {svc.sublabel}
                </p>
            </Link>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CNServicesGrid() {
    return (
        // Div lớn — shadow
        <div className="mt-5 sm:mt-5 bg-white rounded-2xl md:rounded-3xl p-2 sm:p-3 w-[95%] max-w-6xl mx-auto" style={{ boxShadow: "0 -8px 24px -4px rgba(0,0,0,0.18), 0 4px 8px -4px rgba(0,0,0,0.04)" }}>

            {/* Div giữa — border */}
            <div className="border border-slate-200 rounded-2xl md:rounded-3xl">
                <div className="grid grid-cols-2 sm:grid-cols-3">
                    {SERVICES.map((svc) => (
                        <ServiceItem key={svc.label} svc={svc} />
                    ))}
                </div>

            </div>
        </div>
    );
}