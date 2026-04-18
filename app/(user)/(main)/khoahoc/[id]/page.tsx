"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/userSlice";
import { Check, User, Book, Clock, Coin, ShoppingCart, DocumentText } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getCourseById, courses } from "@/lib/courseData";

export default function CourseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const user = useSelector(selectUser);
    const course = getCourseById(id);

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Không tìm thấy khóa học</h1>
                    <Link href="/khoahoc">
                        <Button>Quay lại danh sách</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const handlePurchase = () => {
        if (!user) {
            toast.error("Vui lòng đăng nhập để mua khóa học");
            return;
        }
        toast.success("Chức năng đang phát triển");
    };

    const firstLessonId = course.lessons[0]?._id;

    return (
        <div className="min-h-screen bg-background">
            <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
                <Image
                    src={course.banner || course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-2xl md:text-4xl font-bold mb-2">{course.title}</h1>
                        <div className="flex flex-wrap gap-4 text-sm">
                            <span className="flex items-center gap-1"><Book size={16} /> {course.totalLessons} bài học</span>
                            <span className="flex items-center gap-1"><Clock size={16} /> {course.totalDuration}</span>
                            <span className="flex items-center gap-1"><User size={16} /> {course.totalStudents.toLocaleString()} học viên</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-xl font-bold mb-4">Bạn sẽ nhận được gì sau khóa học?</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {course.whatYouWillLearn.map((item, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm">
                                        <Check size={18} className="text-green-500 flex-shrink-0" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold mb-4">Mô tả khóa học</h2>
                            <p className="text-muted-foreground whitespace-pre-wrap">{course.longDescription}</p>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold mb-4">Nội dung khóa học</h2>
                            <div className="border border-border rounded-xl overflow-hidden">
                                {course.lessons.map((lesson, index) => (
                                    <div key={lesson._id} className="border-b border-border last:border-0">
                                        <div className="flex items-center justify-between p-4 hover:bg-muted/30">
                                            <div className="flex items-center gap-3">
                                                <span className="text-muted-foreground text-sm w-6">{index + 1}</span>
                                                <span>{lesson.title}</span>
                                                {lesson.isPreview && (
                                                    <Badge variant="secondary" className="text-xs">Xem thử</Badge>
                                                )}
                                            </div>
                                            <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-20 bg-card border border-border rounded-2xl p-6">
                            <div className="text-center mb-4">
                                {course.isFree ? (
                                    <span className="text-2xl font-bold text-green-500">Miễn phí</span>
                                ) : (
                                    <div className="flex items-center justify-center gap-1">
                                        <Coin size={24} className="text-yellow-500" />
                                        <span className="text-3xl font-bold">{course.price.toLocaleString()}</span>
                                        <span className="text-muted-foreground">xu</span>
                                    </div>
                                )}
                            </div>

                            {firstLessonId ? (
                                <Link href={`/khoahoc/learning/${firstLessonId}`}>
                                    <Button className="w-full gap-2">
                                        <Book size={18} /> Vào học ngay
                                    </Button>
                                </Link>
                            ) : (
                                <Button onClick={handlePurchase} className="w-full gap-2" disabled={!user}>
                                    <ShoppingCart size={18} />
                                    {user ? (course.isFree ? "Đăng ký ngay" : `Mua với ${course.price.toLocaleString()} xu`) : "Đăng nhập để mua"}
                                </Button>
                            )}

                            {!course.isFree && (
                                <div className="mt-4 pt-4 border-t border-border">
                                    <p className="text-xs text-muted-foreground text-center">Hoặc thanh toán qua</p>
                                    <Button variant="outline" className="w-full mt-2 gap-2">
                                        <DocumentText size={16} />
                                        Chuyển khoản PayOS
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}