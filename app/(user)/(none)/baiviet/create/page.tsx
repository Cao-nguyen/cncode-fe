"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import {
    TextBold, TextItalic, TextUnderline,
    Link1, Gallery, Code, QuoteDown, Grid8,
    TextalignLeft, TextalignCenter, TextalignRight, TextalignJustifycenter,
    Math
} from "iconsax-react"

// KaTeX
import 'katex/dist/katex.min.css'
import { BlockMath } from 'react-katex'

// SyntaxHighlighter
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'

// Markdown parser
import { marked } from "marked"

export default function CreateBlogPage() {
    const [title, setTitle] = useState("")
    const [contentBlocks, setContentBlocks] = useState<string[]>([])
    const [editorMarkdown, setEditorMarkdown] = useState("")
    const [isPublic, setIsPublic] = useState(true)

    // Thêm Markdown block
    const addBlock = (markdown: string) => {
        setEditorMarkdown((prev) => prev + markdown)
        setContentBlocks((prev) => [...prev, markdown])
    }

    const handlePublish = () => alert(`Xuất bản blog!\nCông khai: ${isPublic}`)

    return (
        <div className="pb-10 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Header */}
            <header className="flex justify-between items-center px-4 py-2 md:px-6 md:py-3 bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
                <Button variant="outline" onClick={() => window.history.back()}>Back</Button>
                <div className="flex gap-2">
                    <Button
                        className="bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                        onClick={handlePublish}
                    >
                        Xuất bản
                    </Button>
                </div>
            </header>

            <main className="p-4 md:p-6 max-w-6xl mx-auto">
                {/* Tiêu đề */}
                <div className="mb-6">
                    <Label htmlFor="title">Tiêu đề blog</Label>
                    <Input
                        id="title"
                        placeholder="Nhập tiêu đề..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* Toolbar */}
                <div className="mb-2 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => addBlock("**Bold text**")}><TextBold variant="Outline" size="20" /></Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock("*Italic text*")}><TextItalic variant="Outline" size="20" /></Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock("__Underline text__")}><TextUnderline variant="Outline" size="20" /></Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock(`[Link](${prompt("Nhập URL") || "#"})`)}><Link1 variant="Outline" size="20" /></Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock(`![Image](${prompt("Nhập link ảnh")})`)}><Gallery variant="Outline" size="20" /></Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock(`\`\`\`javascript\n${prompt("Nhập code")}\n\`\`\``)}><Code variant="Outline" size="20" /></Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock("> Quote")}><QuoteDown variant="Outline" size="20" /></Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock("| Cell1 | Cell2 |\n| ----- | ----- |\n| Row1  | Row2  |")}><Grid8 variant="Outline" size="20" /></Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock("<div align='left'>Left</div>")}><TextalignLeft variant="Outline" size="20" /></Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock("<div align='center'>Center</div>")}><TextalignCenter variant="Outline" size="20" /></Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock("<div align='right'>Right</div>")}><TextalignRight variant="Outline" size="20" /></Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock("<div align='justify'>Justify</div>")}><TextalignJustifycenter variant="Outline" size="20" /></Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock(`\\(${prompt("Nhập công thức toán") || ""}\\)`)}><Math variant="Outline" size="20" /></Button>
                </div>

                {/* Editor */}
                <textarea
                    className="w-full min-h-[200px] p-3 mb-4 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={editorMarkdown}
                    onChange={(e) => setEditorMarkdown(e.target.value)}
                />

                {/* Công khai */}
                <div className="mb-6 flex items-center gap-2">
                    <Label>Công khai</Label>
                    <Switch checked={isPublic} onCheckedChange={(val: boolean) => setIsPublic(val)} />
                </div>

                {/* Bản xem trước */}
                <Card className="bg-gray-50 dark:bg-gray-800">
                    <CardHeader><CardTitle>Bản xem trước</CardTitle></CardHeader>
                    <CardContent>
                        <ScrollArea className="h-64 md:h-80">
                            <div className="prose dark:prose-invert max-w-full space-y-2">
                                {editorMarkdown ? editorMarkdown.split("\n\n").map((block, i) => {
                                    if (block.startsWith("```")) {
                                        const code = block.replace(/```.*\n?|```/g, "")
                                        return <SyntaxHighlighter key={i} language="javascript" style={tomorrow}>{code}</SyntaxHighlighter>
                                    } else if (block.includes("\\(") && block.includes("\\)")) {
                                        const math = block.replace(/\\\(|\\\)/g, "")
                                        return <BlockMath key={i} math={math} />
                                    } else {
                                        return <div key={i} dangerouslySetInnerHTML={{ __html: marked(block) }} />
                                    }
                                }) : <p className="text-gray-700 dark:text-gray-300">Chưa có nội dung</p>}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}