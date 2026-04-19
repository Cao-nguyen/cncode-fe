"use client"

import { useState, useRef, useEffect } from "react"
import {
    Search,
    Send,
    Image as Galary,
    Folder,
    Component,
    PanelRight,
    ThumbsUp,
    Clock,
    Paperclip,
    Bell,
    Link,
    File,
    Settings,
    UserRound,
    Eye,
    OctagonAlert,
    CircleX,
    Trash,
    ChevronLeft
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const chats = [
    { id: 1, name: "Nguyễn Văn A", last: "Hello bro" },
    { id: 2, name: "Team CNcode", last: "Meeting 8h" },
]

const messages = [
    {
        id: 1,
        name: "Nguyễn Văn A",
        fromMe: false,
        text: "Hello bro",
        time: "08:00",
    },
    {
        id: 2,
        name: "Bạn",
        fromMe: true,
        text: "Hi 😎",
        time: "08:01",
    },
]

export default function ChatPage() {
    const [text, setText] = useState("")
    const [view, setView] = useState<"list" | "chat">("list")
    const [activeChat, setActiveChat] = useState<number | null>(null)
    const [showTools, setShowTools] = useState(false)
    const [loading, setLoading] = useState(false)
    const [typing, setTyping] = useState(false)
    const [toolTimeout, setToolTimeout] = useState<NodeJS.Timeout | null>(null)

    const [showInfo, setShowInfo] = useState(false)
    const [hideChat, setHideChat] = useState(false)

    const imageInputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (!activeChat) return
        setTimeout(() => {
            setLoading(false)
            setTyping(true)
            setTimeout(() => setTyping(false), 2000)
        }, 800)
    }, [activeChat])

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value)
        const el = textareaRef.current
        if (!el) return
        el.style.height = "auto"
        el.style.height = Math.min(el.scrollHeight, 96) + "px"
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const isMobile = window.innerWidth < 768
        if (!isMobile && e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleSend = () => {
        if (!text.trim()) return
        setText("")
        if (textareaRef.current) textareaRef.current.style.height = "auto"
    }

    const handleSelectImage = () => imageInputRef.current?.click()
    const handleSelectFile = () => fileInputRef.current?.click()

    return (
        <div className="flex h-[calc(100dvh-130px)] md:h-[calc(100dvh-90px)] bg-background">

            <input type="file" ref={imageInputRef} className="hidden" accept="image/*" multiple />
            <input type="file" ref={fileInputRef} className="hidden" multiple />

            {/* SIDEBAR */}
            <div
                className={cn(
                    "flex flex-col border-r",
                    // Mobile: nếu đang chat thì ẩn sidebar, desktop luôn show
                    view === "chat" ? "hidden md:flex md:w-80" : "w-full md:w-80"
                )}
            >
                {/* Sidebar content giữ nguyên */}
                <div className="p-[9.6px] border-b">
                    <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-xl">
                        <Search size={20} />
                        <input className="bg-transparent outline-none text-sm w-full" />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    {chats.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => {
                                setActiveChat(chat.id)
                                setView("chat")
                            }}
                            className={cn(
                                "flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-muted transition",
                                activeChat === chat.id && "bg-muted"
                            )}
                        >
                            <Avatar>
                                <AvatarFallback>A</AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                                <p className="text-sm font-medium">{chat.name}</p>
                                <p className="text-xs text-muted-foreground">{chat.last}</p>
                            </div>
                        </div>
                    ))}
                </ScrollArea>
            </div>

            {/* CHAT VIEW */}
            {activeChat && (
                <div
                    className={cn(
                        "flex-1 flex flex-col",
                        view === "list" ? "hidden md:flex" : "w-full md:flex-1"
                    )}
                >
                    <div className="flex-1 flex flex-col">

                        {/* HEADER */}
                        <div className="h-14 border-b flex items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                                <button className="md:hidden" onClick={() => setView("list")}>
                                    <ChevronLeft size={20} />
                                </button>

                                <Avatar>
                                    <AvatarFallback>A</AvatarFallback>
                                </Avatar>

                                <div>
                                    <p className="text-sm font-medium">Nguyễn Văn A</p>
                                    <p className="text-xs text-green-500">Đang hoạt động</p>
                                </div>
                            </div>

                            <button onClick={() => setShowInfo(true)}>
                                <PanelRight size={20} />
                            </button>
                        </div>

                        {/* PIN */}
                        <div className="px-4 py-2 text-sm bg-muted border-b flex items-center gap-2">
                            <Paperclip size={20} />
                            Họp lúc 8h - Nguyễn Văn A
                        </div>

                        {/* MESSAGES */}
                        <ScrollArea className="flex-1 p-4 space-y-5">
                            {messages.map((msg) => (
                                <div key={msg.id} className={cn("flex", msg.fromMe ? "justify-end" : "justify-start")}>
                                    <div className="flex gap-2 max-w-[65%]">

                                        {!msg.fromMe && (
                                            <Avatar className="w-8 h-8">
                                                <AvatarFallback>A</AvatarFallback>
                                            </Avatar>
                                        )}

                                        <div className={cn("flex flex-col", msg.fromMe && "items-end text-right")}>
                                            <p className="text-xs font-medium mb-1">{msg.name}</p>

                                            <div className={cn(
                                                "px-3 py-2 rounded-xl text-sm",
                                                msg.fromMe ? "bg-blue-500 text-white" : "bg-muted"
                                            )}>
                                                {msg.text}
                                            </div>

                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                {msg.time}
                                            </p>
                                        </div>

                                        {msg.fromMe && (
                                            <Avatar className="w-8 h-8">
                                                <AvatarFallback>B</AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </ScrollArea>

                        {/* INPUT */}
                        <div className="border-t p-3 space-y-2">
                            <div className="flex items-center gap-3 text-muted-foreground relative">
                                <Galary size={22} onClick={handleSelectImage} />
                                <Folder size={22} onClick={handleSelectFile} />

                                <div
                                    onMouseEnter={() => {
                                        if (toolTimeout) clearTimeout(toolTimeout)
                                        setShowTools(true)
                                    }}
                                    onMouseLeave={() => {
                                        const t = setTimeout(() => setShowTools(false), 200)
                                        setToolTimeout(t)
                                    }}
                                    className="relative"
                                >
                                    <Component size={22} />

                                    {showTools && (
                                        <div className="absolute bottom-6 left-0 bg-background border rounded-lg shadow p-2 w-36">
                                            <div className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                                                <ThumbsUp size={20} /> Bình chọn
                                            </div>
                                            <div className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                                                <Clock size={20} /> Nhắn hẹn
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-end gap-2">
                                <textarea
                                    ref={textareaRef}
                                    rows={1}
                                    value={text}
                                    onChange={handleInput}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Tin nhắn..."
                                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                                />

                                <button className="p-2 bg-blue-500 text-white rounded-lg">
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PANEL */}
            {showInfo && (
                <div className="fixed right-0 z-50 bg-background border-l w-full md:w-80 h-[calc(100dvh-130px)] md:h-[calc(100dvh-90px)] flex flex-col">
                    <div className="h-14 border-b flex items-center justify-between px-4 shrink-0">
                        <p className="font-semibold text-sm">Thông tin hội thoại</p>
                        <button onClick={() => setShowInfo(false)}>
                            <PanelRight size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="flex flex-col items-center gap-2">
                            <Avatar className="w-20 h-20"><AvatarFallback>A</AvatarFallback></Avatar>
                            <p className="font-medium">Nguyễn Văn A</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="p-2 rounded-xl hover:bg-muted flex flex-col items-center gap-1">
                                <Bell size={26} />
                                <p className="text-center">Tắt thông báo</p>
                            </div>
                            <div className="p-2 rounded-xl hover:bg-muted flex flex-col items-center gap-1">
                                <Paperclip size={26} />
                                <p className="text-center">Ghim</p>
                            </div>
                            <div className="p-2 rounded-xl hover:bg-muted flex flex-col items-center gap-1">
                                <Component size={26} />
                                <p className="text-center">Tạo nhóm</p>
                            </div>
                        </div>

                        <div className="h-2 bg-muted -mx-4" />

                        <div className="space-y-2 text-sm">
                            <div className="p-2 rounded-xl hover:bg-muted flex items-center gap-3"><Clock size={26} /><p>Nhắn hẹn</p></div>
                            <div className="p-2 rounded-xl hover:bg-muted flex items-center gap-3"><ThumbsUp size={26} /><p>Bình chọn</p></div>
                            <div className="p-2 rounded-xl hover:bg-muted flex items-center gap-3"><Galary size={26} /><p>Ảnh</p></div>
                            <div className="p-2 rounded-xl hover:bg-muted flex items-center gap-3"><Link size={26} /><p>Link</p></div>
                            <div className="p-2 rounded-xl hover:bg-muted flex items-center gap-3"><File size={26} /><p>File</p></div>
                        </div>

                        <div className="h-2 bg-muted -mx-4" />

                        <div className="space-y-2 text-sm">
                            <div className="p-2 rounded-xl hover:bg-muted flex items-center gap-3"><Settings size={26} /><p>Cài đặt chung</p></div>
                            <div className="p-2 rounded-xl hover:bg-muted flex items-center gap-3"><UserRound size={26} /><p>Cài đặt cộng đồng</p></div>
                        </div>

                        <div className="h-2 bg-muted -mx-4" />

                        <div className="space-y-2 text-sm">
                            <div className="p-2 rounded-xl hover:bg-muted flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Eye size={26} />
                                    <p>Ẩn cuộc trò chuyện</p>
                                </div>

                                <div
                                    onClick={() => setHideChat(!hideChat)}
                                    className={cn(
                                        "w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition",
                                        hideChat ? "bg-blue-500" : "bg-muted"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "w-4 h-4 bg-white rounded-full transition",
                                            hideChat ? "translate-x-5" : "translate-x-0"
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="p-2 rounded-xl hover:bg-muted flex items-center gap-3 text-red-500"><OctagonAlert size={26} /><p>Báo xấu</p></div>
                            <div className="p-2 rounded-xl hover:bg-muted flex items-center gap-3 text-red-500"><CircleX size={26} /><p>Chặn</p></div>
                            <div className="p-2 rounded-xl hover:bg-muted flex items-center gap-3 text-red-500"><Trash size={26} /><p>Xoá lịch sử</p></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}