import Link from "next/link"
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
import Feed from "@/components/ui/feed"

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

export default function Forum({ searchParams }: { searchParams?: { id?: string } }) {
    const activeTab = searchParams?.id || "discover"

    return (
        <main>
            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-3 border-b border-slate-200">
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

            {/* DISCOVER */}
            {activeTab === "discover" && (
                <section className="h-160 flex items-center justify-center">
                    <Feed />
                </section>
            )}

            {/* INFO */}
            {activeTab === "info" && (
                <section className="mt-5">
                    <div className="mx-auto w-full max-w-[1200px] space-y-5">
                        <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-11 w-11 bg-slate-950 text-white">
                                    <AvatarFallback>👤</AvatarFallback>
                                </Avatar>
                                <button className="flex-1 rounded-[16px] border bg-slate-100 px-4 py-3 text-left text-sm text-slate-500">
                                    Bạn đang nghĩ gì?
                                </button>
                            </div>

                            <textarea
                                placeholder="Viết gì đó..."
                                className="mt-4 w-full min-h-[120px] rounded-[16px] border bg-slate-50 p-4 text-sm"
                            />

                            <div className="mt-4 flex justify-between">
                                <div className="flex gap-2">
                                    <button className="btn">Ảnh</button>
                                    <button className="btn">File</button>
                                </div>
                                <button className="bg-black text-white px-4 py-2 rounded">
                                    Đăng
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* COMMUNITY */}
            {activeTab === "community" && (
                <section className="grid gap-5 mt-5">
                    <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
                        <div className="grid gap-3 bg-slate-950 p-4 rounded-[20px]">
                            <div className="text-white font-semibold">Tin nhắn</div>

                            {chats.map((chat) => (
                                <div
                                    key={chat.name}
                                    className="flex items-center gap-3 bg-slate-900 p-3 rounded"
                                >
                                    <Avatar>
                                        <AvatarFallback>{chat.avatar}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="text-white">{chat.name}</div>
                                        <div className="text-slate-400 text-sm">
                                            {chat.lastMessage}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-slate-950 p-4 rounded-[20px] text-white">
                            {messages.map((m, i) => (
                                <div
                                    key={i}
                                    className={`p-3 rounded mb-2 ${m.type === "me"
                                        ? "bg-slate-800 text-right"
                                        : "bg-slate-700"
                                        }`}
                                >
                                    {m.text}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </main>
    )
}