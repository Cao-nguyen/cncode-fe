"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Heart,
    Message,
    Share,
    Gallery,
    Document,
    Sticker,
    EmojiHappy,
    Send,
} from "iconsax-react"

const tabs = [
    { id: "discover", label: "Khám phá" },
    { id: "info", label: "Thông tin" },
    { id: "community", label: "Cộng đồng" },
]

const chats = [
    {
        avatar: "👤",
        name: "Minh Anh",
        lastMessage: "Ok, mai mình gửi file luôn nhé",
    },
    {
        avatar: "👩‍💻",
        name: "Hà Linh",
        lastMessage: "Đã xem, hợp lý rồi đó",
    },
    {
        avatar: "🧑‍🎓",
        name: "Tuấn",
        lastMessage: "Mình đang kiểm tra UI rồi",
    },
    {
        avatar: "🧠",
        name: "Quỳnh",
        lastMessage: "Gửi sticker cho mọi người thôi",
    },
]

const messages = [
    { type: "other", text: "Chào bạn, hôm nay bạn có muốn họp nhanh không?" },
    { type: "me", text: "Dạ, mình rảnh 2h chiều." },
    { type: "other", text: "Ok, mình sẽ gửi link họp sau." },
    { type: "me", text: "Tốt. Nhớ check luôn phần gửi file nhé." },
]

export default function Forum() {
    const searchParams = useSearchParams()
    const activeTab = searchParams?.get("id") || "discover"

    return (
        <main className="px-10 py-5 box-border">
            <div className="flex flex-wrap gap-3 border-b border-slate-200">
                {tabs.map((tab) => (
                    <Link
                        href={`/diendan?id=${tab.id}`}
                        key={tab.id}
                        className={`inline-flex items-center justify-center h-10 min-w-[110px] px-3 font-semibold text-sm border-b-2 ${activeTab === tab.id
                            ? "border-slate-900 text-slate-900"
                            : "border-transparent text-slate-500 hover:text-slate-900"
                            }`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>

            {activeTab === "discover" && (
                <section className="grid gap-5 mt-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        <article className="relative overflow-hidden rounded-[20px] bg-slate-950 text-white min-h-[520px]">
                            <div className="relative w-full pb-[177%] bg-slate-900">
                                <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/5 to-black/70">
                                    <div className="flex items-center justify-between p-4">
                                        <span className="rounded-full bg-black/40 px-3 py-1 text-[12px] text-slate-100">
                                            LIVE
                                        </span>
                                        <span className="text-[12px] text-slate-100">00:32</span>
                                    </div>
                                    <div className="absolute right-3 bottom-20 grid gap-3">
                                        <button className="h-11 w-11 rounded-full bg-white/10 text-white">
                                            <Heart size="18" variant="Bulk" />
                                        </button>
                                        <button className="h-11 w-11 rounded-full bg-white/10 text-white">
                                            <Message size="18" variant="Bulk" />
                                        </button>
                                        <button className="h-11 w-11 rounded-full bg-white/10 text-white">
                                            <Share size="18" variant="Bulk" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-slate-950 px-4 py-4">
                                <Avatar className="h-11 w-11 bg-slate-800 text-xl">
                                    <AvatarFallback>👤</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                    <span className="font-semibold text-sm">@nguoisangtao</span>
                                    <span className="text-xs text-slate-400">#sáng tạo #video #tiktok</span>
                                </div>
                            </div>
                        </article>

                        <article className="grid gap-4 rounded-[20px] bg-slate-900 p-4 text-white min-h-[520px]">
                            <div className="grid gap-3">
                                <h3 className="text-lg font-semibold">Luồng video</h3>
                                <p className="text-sm leading-6 text-slate-400">
                                    Cuộn video, xem nhanh và tương tác ngay như TikTok.
                                </p>
                            </div>

                            <div className="grid gap-3">
                                <div className="grid h-32 place-items-center rounded-[16px] bg-slate-800 text-sm text-slate-500">
                                    Video mẫu
                                </div>

                                <div className="grid gap-2">
                                    <button className="h-11 rounded-[12px] bg-slate-800 text-white inline-flex items-center justify-center gap-2">
                                        <Heart size="16" variant="Bulk" /> Thích
                                    </button>
                                    <button className="h-11 rounded-[12px] bg-slate-800 text-white inline-flex items-center justify-center gap-2">
                                        <Message size="16" variant="Bulk" /> Bình luận
                                    </button>
                                    <button className="h-11 rounded-[12px] bg-slate-800 text-white inline-flex items-center justify-center gap-2">
                                        <Share size="16" variant="Bulk" /> Chia sẻ
                                    </button>
                                </div>
                            </div>
                        </article>
                    </div>
                </section>
            )}

            {activeTab === "info" && (
                <section className="mt-5">
                    <div className="mx-auto w-full max-w-[1200px] space-y-5">
                        <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                            <div className="flex flex-wrap items-center gap-3">
                                <Avatar className="h-11 w-11 bg-slate-950 text-white">
                                    <AvatarFallback>👤</AvatarFallback>
                                </Avatar>
                                <button
                                    type="button"
                                    className="flex-1 rounded-[16px] border border-slate-200 bg-slate-100 px-4 py-3 text-left text-sm text-slate-500 hover:bg-slate-50"
                                >
                                    Bạn đang nghĩ gì?
                                </button>
                            </div>

                            <div className="mt-4 space-y-3">
                                <textarea
                                    placeholder="Viết gì đó..."
                                    className="min-h-[120px] w-full rounded-[20px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                                />

                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex flex-wrap gap-2">
                                        <button className="inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600">
                                            <Gallery size="16" variant="Bulk" /> Ảnh
                                        </button>
                                        <button className="inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600">
                                            <Document size="16" variant="Bulk" /> File
                                        </button>
                                        <button className="inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600">
                                            <Sticker size="16" variant="Bulk" /> Sticker
                                        </button>
                                        <button className="inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600">
                                            <EmojiHappy size="16" variant="Bulk" /> Biểu tượng
                                        </button>
                                    </div>

                                    <button className="rounded-[16px] bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 inline-flex items-center gap-2">
                                        <Send size="16" variant="Bulk" /> Đăng
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-2">
                            <article className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-11 w-11 bg-slate-950 text-white">
                                        <AvatarFallback>👤</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">Nguyễn Văn A</div>
                                        <div className="text-xs text-slate-500">1 giờ trước</div>
                                    </div>
                                </div>

                                <p className="mt-4 text-sm leading-6 text-slate-700">
                                    Chia sẻ nhanh về buổi workshop hôm nay. Mọi người nhớ check lại tài liệu và file đính kèm nhé.
                                </p>

                                <div className="mt-4 h-52 rounded-[16px] bg-slate-100" />

                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                                    <span>👍 24</span>
                                    <span>💬 8 bình luận</span>
                                </div>
                            </article>

                            <article className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-11 w-11 bg-slate-950 text-white">
                                        <AvatarFallback>👩‍💻</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">Hà Linh</div>
                                        <div className="text-xs text-slate-500">2 giờ trước</div>
                                    </div>
                                </div>

                                <p className="mt-4 text-sm leading-6 text-slate-700">
                                    Ai đã thử công cụ mới chưa? Mình cảm thấy layout của nó khá ổn và dễ dùng, đặc biệt khi soạn bài đăng.
                                </p>

                                <div className="mt-4 h-52 rounded-[16px] bg-slate-100" />

                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                                    <span>👍 18</span>
                                    <span>💬 5 bình luận</span>
                                </div>
                            </article>
                        </div>
                    </div>
                </section>
            )}

            {activeTab === "community" && (
                <section className="grid gap-5 mt-5">
                    <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
                        <div className="grid gap-3 rounded-[20px] bg-slate-950 p-4">
                            <div className="text-base font-semibold text-white">Tin nhắn</div>
                            {chats.map((chat) => (
                                <div
                                    key={chat.name}
                                    className="flex cursor-pointer items-center gap-3 rounded-[16px] bg-slate-900 p-3"
                                >
                                    <Avatar className="h-11 w-11 bg-slate-800 text-lg">
                                        <AvatarFallback>{chat.avatar}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid gap-1">
                                        <span className="font-semibold text-white">{chat.name}</span>
                                        <span className="text-sm text-slate-500">{chat.lastMessage}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid gap-4 rounded-[20px] bg-slate-950 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-11 w-11 bg-slate-800 text-lg">
                                        <AvatarFallback>👤</AvatarFallback>
                                    </Avatar>
                                    <div className="grid gap-1">
                                        <span className="font-semibold text-white">Minh Anh</span>
                                        <span className="text-sm text-emerald-400">Đang hoạt động</span>
                                    </div>
                                </div>
                                <div className="rounded-full bg-slate-800 px-3 py-1 text-xs text-white">Online</div>
                            </div>

                            <div className="grid gap-3 max-h-[420px] overflow-y-auto pr-1">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`max-w-[85%] rounded-[18px] px-4 py-3 text-sm ${message.type === "me"
                                            ? "self-end bg-slate-900 text-white"
                                            : "self-start bg-slate-800 text-slate-100"
                                            }`}
                                    >
                                        {message.text}
                                    </div>
                                ))}
                            </div>

                            <div className="grid gap-3">
                                <textarea
                                    placeholder="Nhập tin nhắn..."
                                    className="h-32 w-full resize-y rounded-[16px] border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                                />
                                <div className="flex flex-wrap gap-3">
                                    <button className="flex-1 min-w-[100px] rounded-[12px] bg-slate-800 px-4 py-3 text-sm text-white inline-flex items-center justify-center gap-2">
                                        <Send size="16" variant="Bulk" /> Gửi
                                    </button>
                                    <button className="min-w-[100px] rounded-[12px] bg-slate-800 px-4 py-3 text-sm text-white inline-flex items-center justify-center gap-2">
                                        <Document size="16" variant="Bulk" /> File
                                    </button>
                                    <button className="min-w-[100px] rounded-[12px] bg-slate-800 px-4 py-3 text-sm text-white inline-flex items-center justify-center gap-2">
                                        <Gallery size="16" variant="Bulk" /> Ảnh
                                    </button>
                                    <button className="min-w-[100px] rounded-[12px] bg-slate-800 px-4 py-3 text-sm text-white inline-flex items-center justify-center gap-2">
                                        <Sticker size="16" variant="Bulk" /> Sticker
                                    </button>
                                    <button className="min-w-[100px] rounded-[12px] bg-slate-800 px-4 py-3 text-sm text-white inline-flex items-center justify-center gap-2">
                                        <EmojiHappy size="16" variant="Bulk" /> Biểu tượng
                                    </button>
                                    <button className="min-w-[100px] rounded-[12px] bg-slate-800 px-4 py-3 text-sm text-white inline-flex items-center justify-center gap-2">
                                        <Heart size="16" variant="Bulk" /> Bình chọn
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </main>
    )
}