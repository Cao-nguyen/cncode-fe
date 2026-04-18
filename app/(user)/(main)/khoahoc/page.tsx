"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SearchNormal1, Coin, Book, Crown } from "iconsax-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { courses } from "@/lib/courseData";

const LEVELS = ["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9", "Lớp 10", "Lớp 11", "Lớp 12", "Khác"];

export default function KhoaHocPage() {
    const [selectedLevel, setSelectedLevel] = useState("Tất cả");
    const [priceType, setPriceType] = useState<"all" | "free" | "pro">("all");
    const [search, setSearch] = useState("");

    const filteredCourses = courses.filter((course) => {
        const matchLevel = selectedLevel === "Tất cả" || course.level === selectedLevel;
        const matchPrice = priceType === "all" || (priceType === "free" ? course.isFree : !course.isFree);
        const matchSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
            course.description.toLowerCase().includes(search.toLowerCase());
        return matchLevel && matchPrice && matchSearch;
    });

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">Khoá học</h1>

                    <div className="relative w-full md:w-80">
                        <SearchNormal1 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm khoá học..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    <Button
                        variant={selectedLevel === "Tất cả" ? "default" : "outline"}
                        onClick={() => setSelectedLevel("Tất cả")}
                        size="sm"
                    >
                        Tất cả
                    </Button>
                    {LEVELS.map((level) => (
                        <Button
                            key={level}
                            variant={selectedLevel === level ? "default" : "outline"}
                            onClick={() => setSelectedLevel(level)}
                            size="sm"
                        >
                            {level}
                        </Button>
                    ))}
                </div>

                <div className="flex gap-2 mb-8">
                    <Button
                        variant={priceType === "all" ? "default" : "outline"}
                        onClick={() => setPriceType("all")}
                        size="sm"
                    >
                        Tất cả
                    </Button>
                    <Button
                        variant={priceType === "free" ? "default" : "outline"}
                        onClick={() => setPriceType("free")}
                        size="sm"
                        className="gap-1"
                    >
                        <Book size={16} /> Miễn phí
                    </Button>
                    <Button
                        variant={priceType === "pro" ? "default" : "outline"}
                        onClick={() => setPriceType("pro")}
                        size="sm"
                        className="gap-1"
                    >
                        <Crown size={16} /> Trả phí
                    </Button>
                </div>

                {filteredCourses.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">Không tìm thấy khoá học phù hợp</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => (
                            <Link key={course._id} href={`/khoahoc/${course._id}`} className="group">
                                <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                    <div className="relative h-48 overflow-hidden">
                                        <Image
                                            src={course.thumbnail || "/images/course-placeholder.jpg"}
                                            alt={course.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition duration-300"
                                        />
                                        {course.isFree ? (
                                            <Badge className="absolute top-2 left-2 bg-green-500">Miễn phí</Badge>
                                        ) : (
                                            <Badge className="absolute top-2 left-2 bg-yellow-500 gap-1">
                                                <Coin size={12} /> {course.price.toLocaleString()} xu
                                            </Badge>
                                        )}
                                        <Badge className="absolute top-2 right-2 bg-black/70">{course.level}</Badge>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{course.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                                        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                                            <span>{course.totalLessons} bài học</span>
                                            <span>{course.totalStudents.toLocaleString()} học viên</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}