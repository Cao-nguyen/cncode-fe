"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";
import { ArrowLeft } from "iconsax-react";
import Link from "next/link";
import { postApi } from "@/lib/api/post.api";

const Editor = dynamic(() => import("@tinymce/tinymce-react").then((mod) => mod.Editor), {
    ssr: false,
});

const categories = [
    { value: "frontend", label: "Frontend" },
    { value: "backend", label: "Backend" },
    { value: "devops", label: "DevOps" },
    { value: "mobile", label: "Mobile" },
    { value: "ai", label: "AI/ML" },
    { value: "career", label: "Career" },
    { value: "react", label: "React" },
    { value: "nextjs", label: "NextJS" },
    { value: "nodejs", label: "NodeJS" },
];

export default function CreatePostPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        content: "",
        category: "",
        thumbnail: "",
    });
    const [imagePreview, setImagePreview] = useState("");
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            toast.error("Vui lòng đăng nhập để đăng bài");
            router.push("/dang-nhap");
            return;
        }
        setToken(storedToken);
    }, [router]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formDataImg = new FormData();
        formDataImg.append("image", file);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formDataImg,
            });
            const data = await response.json();
            if (data.url) {
                setFormData({ ...formData, thumbnail: data.url });
                setImagePreview(data.url);
                toast.success("Tải ảnh lên thành công");
            }
        } catch (error) {
            toast.error("Lỗi khi tải ảnh lên");
        }
    };

    const handleSubmit = async (status: "draft" | "published") => {
        if (!formData.title || !formData.description || !formData.content || !formData.category || !formData.thumbnail) {
            toast.error("Vui lòng điền đầy đủ thông tin");
            return;
        }

        if (!token) {
            toast.error("Vui lòng đăng nhập lại");
            return;
        }

        setLoading(true);
        try {
            const result = await postApi.createPost(
                {
                    title: formData.title,
                    description: formData.description,
                    content: formData.content,
                    category: formData.category,
                    thumbnail: formData.thumbnail,
                    status: status,
                },
                token
            );

            if (result.success) {
                toast.success(status === "draft" ? "Đã lưu bài viết" : "Đăng bài thành công");
                router.push(`/baiviet/${result.data.slug}`);
            } else {
                toast.error(result.message || "Đăng bài thất bại");
            }
        } catch (error) {
            console.error("Create post error:", error);
            toast.error("Lỗi khi đăng bài");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">Đang kiểm tra đăng nhập...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <Link
                href="/baiviet"
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 mb-4 transition"
            >
                <ArrowLeft size={18} variant="Outline" />
                Quay lại trang bài viết
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Đăng bài viết mới</CardTitle>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Chia sẻ kiến thức và kinh nghiệm của bạn với cộng đồng
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Tiêu đề *</label>
                            <Input
                                placeholder="Nhập tiêu đề bài viết..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Mô tả ngắn *</label>
                            <Textarea
                                placeholder="Mô tả ngắn về bài viết..."
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Danh mục *</label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Ảnh đại diện *</label>
                            <Input type="file" accept="image/*" onChange={handleImageUpload} />
                            {imagePreview && (
                                <div className="mt-3 relative h-48 w-full rounded-lg overflow-hidden border">
                                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Nội dung *</label>
                            <Editor
                                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "your-api-key"}
                                value={formData.content}
                                onEditorChange={(content) => setFormData({ ...formData, content })}
                                init={{
                                    height: 500,
                                    menubar: true,
                                    plugins: [
                                        "advlist", "autolink", "lists", "link", "image", "charmap", "preview",
                                        "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
                                        "insertdatetime", "media", "table", "code", "help", "wordcount"
                                    ],
                                    toolbar: "undo redo | blocks | " +
                                        "bold italic forecolor | alignleft aligncenter " +
                                        "alignright alignjustify | bullist numlist outdent indent | " +
                                        "removeformat | help",
                                    content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                                }}
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                onClick={() => handleSubmit("published")}
                                disabled={loading}
                                className="bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
                            >
                                {loading ? "Đang đăng..." : "Đăng bài"}
                            </Button>
                            <Button
                                onClick={() => handleSubmit("draft")}
                                disabled={loading}
                                variant="outline"
                            >
                                {loading ? "Đang lưu..." : "Lưu nháp"}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.push("/baiviet")}
                            >
                                Hủy
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}