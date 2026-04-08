"use client"

import { useState, useRef, useEffect } from "react"
import {
    SearchNormal1,
    Send2,
    Gallery,
    DirectSend,
    Element3,
    SidebarLeft,
    LikeShapes,
    Clock,
    Paperclip2,
} from "iconsax-react"

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

    return (
        <div className="flex h-[calc(100dvh-130px)] md:h-[calc(100dvh-90px)] bg-background">

            {/* SIDEBAR */}
            <div className={cn(
                "w-full md:w-80 border-r flex flex-col",
                view === "chat" && "hidden md:flex"
            )}>
                <div className="p-[9.6px] border-b">
                    <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-xl">
                        <SearchNormal1 variant="Outline" size={20} />
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

            {/* PLACEHOLDER (desktop only) */}
            {!activeChat && (
                <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
                    <p className="text-sm">Chọn đoạn chat để trò chuyện</p>
                </div>
            )}

            {/* CHAT (chỉ render khi có activeChat) */}
            {activeChat && (
                <div className={cn(
                    "flex-1 flex flex-col transition-all duration-300",
                    view === "list" && "hidden md:flex",
                    view === "chat" && "animate-in slide-in-from-right"
                )}>

                    {/* HEADER */}
                    <div className="h-14 border-b flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <button className="md:hidden" onClick={() => setView("list")}>
                                <SidebarLeft variant="Bold" size={20} />
                            </button>

                            <Avatar>
                                <AvatarFallback>A</AvatarFallback>
                            </Avatar>

                            <div>
                                <p className="text-sm font-medium">Nguyễn Văn A</p>
                                <p className="text-xs text-green-500">Đang hoạt động</p>
                            </div>
                        </div>

                        <SidebarLeft variant="Bold" size={20} />
                    </div>

                    {/* PIN */}
                    <div className="px-4 py-2 text-sm bg-muted border-b flex items-center gap-2">
                        <Paperclip2 variant="Bold" size={20} />
                        Họp lúc 8h - Nguyễn Văn A
                    </div>

                    {/* MESSAGES */}
                    <ScrollArea className="flex-1 p-4 space-y-5">

                        {loading && (
                            <div className="space-y-3">
                                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                                <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                            </div>
                        )}

                        {!loading && messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={cn(
                                    "flex",
                                    msg.fromMe ? "justify-end" : "justify-start"
                                )}
                            >
                                <div className="flex gap-2 max-w-[65%]">

                                    {!msg.fromMe && (
                                        <Avatar className="w-8 h-8">
                                            <AvatarFallback>A</AvatarFallback>
                                        </Avatar>
                                    )}

                                    <div className={cn(
                                        "flex flex-col",
                                        msg.fromMe && "items-end text-right"
                                    )}>
                                        <p className="text-xs font-medium mb-1">{msg.name}</p>

                                        <div className={cn(
                                            "px-3 py-2 rounded-xl text-sm",
                                            msg.fromMe
                                                ? "bg-blue-500 text-white"
                                                : "bg-muted"
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

                        {typing && (
                            <div className="text-xs text-muted-foreground animate-pulse">
                                Nguyễn Văn A đang nhập...
                            </div>
                        )}
                    </ScrollArea>

                    {/* INPUT */}
                    <div className="border-t p-3 space-y-2">

                        <div className="flex items-center gap-3 text-muted-foreground relative">
                            <Gallery size={22} variant="Bold" />
                            <DirectSend size={22} variant="Bold" />

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
                                <Element3 variant="Bold" size={22} />

                                {showTools && (
                                    <div className="absolute bottom-6 left-0 bg-background border rounded-lg shadow p-2 w-36">
                                        <div className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                                            <LikeShapes variant="Bold" size={20} /> Bình chọn
                                        </div>
                                        <div className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                                            <Clock variant="Bold" size={20} /> Nhắn hẹn
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
                                className="no-scrollbar flex-1 resize-none border rounded-lg px-3 py-2 text-sm max-h-24 overflow-y-auto"
                            />

                            <button className="p-2 bg-blue-500 text-white rounded-lg">
                                <Send2 size={20} variant="Bold" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}