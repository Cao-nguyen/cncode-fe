// "use client"

import FeatureShowcase from "@/components/home/FeatureShowcase";

// import { useState, useEffect } from "react"
// import "swiper/css"
// import "swiper/css/pagination"
// import Slideshow from "@/components/sections/home/slideshow"
// import Image from "@/node_modules/next/image"
// import Link from "@/node_modules/next/link"
// import CardCourses from "@/components/sections/course/cardcourses"
// import Roadmap from "@/components/ui/roadmap"
// import Stats from "@/components/sections/home/stats"
// import { User, Book, ListTodo, Award, Loader2 } from "lucide-react"
// import BlogCard from "@/components/blog/BlogCard"
// import Analytics from "@/components/sections/home/analytic"
// import WhyChoose from "@/components/sections/home/whychoose"
// import Testimonial from "@/components/sections/home/testimoninal"
// import FloatingButtons from "@/components/common/floatingicon"
// import { postApi } from "@/lib/api/post.api"
// import { IPost } from "@/types/post.type"

// export default function Home() {
//     const [featuredPosts, setFeaturedPosts] = useState<IPost[]>([])
//     const [loadingPosts, setLoadingPosts] = useState(true)


//     const [stats, setStats] = useState({
//         today: 0,
//         guest: 0,
//         online: 0,
//         total: 0
//     })
//     const [loadingStats, setLoadingStats] = useState(true)

//     const roadmapData = [
//         {
//             title: "Web Dev",
//             steps: ["HTML/CSS", "JavaScript", "React/Next"],
//             link: "/roadmap/web"
//         },
//         {
//             title: "AI Engineer",
//             steps: ["Python", "Machine Learning", "Deep Learning"],
//             link: "/roadmap/ai"
//         },
//         {
//             title: "Game Dev",
//             steps: ["C#/C++", "Unity", "Publish Game"],
//             link: "/roadmap/game"
//         }
//     ]

//     const banner = [
//         { linkImg: "/images/banner_giasuai.png", alt: "Gia sư AI", link: "/giasuai" },
//         { linkImg: "/images/banner_cnbooks.png", alt: "CNbooks", link: "/ebook" },
//         { linkImg: "/images/banner_cnjobs.png", alt: "CNjobs", link: "/timviec" }
//     ]

//     const statsData = [
//         {
//             label: "Người học",
//             value: 12000,
//             icon: <User size={20} className="text-white dark:text-black" />
//         },
//         {
//             label: "Khoá học",
//             value: 120,
//             icon: <Book size={20} className="text-white dark:text-black" />
//         },
//         {
//             label: "Bài tập",
//             value: 3500,
//             icon: <ListTodo size={20} className="text-white dark:text-black" />
//         },
//         {
//             label: "Thành tựu",
//             value: 980,
//             icon: <Award size={20} className="text-white dark:text-black" />
//         }
//     ]

//     useEffect(() => {
//         fetchFeaturedPosts()
//         fetchStatistics()
//         const interval = setInterval(fetchStatistics, 30000)
//         return () => clearInterval(interval)
//     }, [])

//     const fetchFeaturedPosts = async () => {
//         try {
//             setLoadingPosts(true)
//             const response = await postApi.getFeaturedPosts(3)
//             if (response.success) {
//                 setFeaturedPosts(response.data)
//             }
//         } catch (error) {
//             console.error("Lỗi khi lấy bài viết nổi bật:", error)
//         } finally {
//             setLoadingPosts(false)
//         }
//     }

//     const fetchStatistics = async () => {
//         try {
//             setLoadingStats(true)
//             const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/stats`)
//             const result = await response.json()

//             if (result.success) {
//                 setStats({
//                     total: result.data.totalVisits,
//                     today: result.data.todayVisits,
//                     guest: result.data.onlineGuest,
//                     online: result.data.onlineUser
//                 })
//             }
//         } catch (error) {
//             console.error("Lỗi khi lấy thống kê:", error)
//         } finally {
//             setLoadingStats(false)
//         }
//     }


//     const getReadingTime = (content: string) => {
//         const wordsPerMinute = 200
//         const wordCount = content?.split(/\s+/).length || 0
//         const minutes = Math.ceil(wordCount / wordsPerMinute)
//         return `${minutes} phút đọc`
//     }

//     return (
//         <div>
//             <FloatingButtons />
//             <Slideshow />
//             <div className="m-5 xl:m-10">

//                 <div className="mt-8">
//                     <div className="mb-5" data-aos="fade-up">
//                         <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white">
//                             Tính năng nổi bật
//                         </h1>

//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                             Khám phá những tính năng nổi bật của chúng tôi
//                         </p>

//                         <div className="w-16 h-0.75 bg-black dark:bg-white mt-2 rounded-full" />
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         {banner.map((item, index) => (
//                             <Link key={index} href={item.link}>
//                                 <Image
//                                     width={450}
//                                     height={100}
//                                     src={item.linkImg}
//                                     alt={item.alt}
//                                     className="rounded-2xl w-full"
//                                 />
//                             </Link>
//                         ))}
//                     </div>
//                 </div>


//                 <div className="mt-8">
//                     <div className="mb-5" data-aos="fade-up">
//                         <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white">
//                             Khoá học nổi bật
//                         </h1>

//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                             Khám phá các khoá học chất lượng cao dành cho bạn
//                         </p>

//                         <div className="w-16 h-0.75 bg-black dark:bg-white mt-2 rounded-full" />
//                     </div>

//                     <div
//                         className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
//                         data-aos="fade-up"
//                         data-aos-delay="100"
//                     >
//                         <div data-aos="zoom-in" data-aos-delay="100">
//                             <CardCourses
//                                 title="Khóa học Fullstack từ A-Z"
//                                 description="Học từ cơ bản đến nâng cao, build dự án thực tế."
//                                 image="/images/images1.jpg"
//                                 duration="12h"
//                                 students="1.2K"
//                                 price="299.000đ"
//                                 oldPrice="499.000đ"
//                                 discount={40}
//                                 isFree={false}
//                                 link="/course"
//                             />
//                         </div>
//                         <div data-aos="zoom-in" data-aos-delay="100">
//                             <CardCourses
//                                 title="Khóa học Fullstack từ A-Z"
//                                 description="Học từ cơ bản đến nâng cao, build dự án thực tế."
//                                 image="/images/images1.jpg"
//                                 duration="12h"
//                                 students="1.2K"
//                                 price="299.000đ"
//                                 oldPrice="499.000đ"
//                                 discount={40}
//                                 isFree={false}
//                                 link="/course"
//                             />
//                         </div>
//                         <div data-aos="zoom-in" data-aos-delay="100">
//                             <CardCourses
//                                 title="Khóa học Fullstack từ A-Z"
//                                 description="Học từ cơ bản đến nâng cao, build dự án thực tế."
//                                 image="/images/images1.jpg"
//                                 duration="12h"
//                                 students="1.2K"
//                                 price="299.000đ"
//                                 oldPrice="499.000đ"
//                                 discount={40}
//                                 isFree={false}
//                                 link="/course"
//                             />
//                         </div>
//                         <div data-aos="zoom-in" data-aos-delay="100">
//                             <CardCourses
//                                 title="Khóa học Fullstack từ A-Z"
//                                 description="Học từ cơ bản đến nâng cao, build dự án thực tế. Học từ cơ bản đến nâng cao, build dự án thực tế. Học từ cơ bản đến nâng cao, build dự án thực tế."
//                                 image="/images/images1.jpg"
//                                 duration="12h"
//                                 students="1.2K"
//                                 price="299.000đ"
//                                 oldPrice="499.000đ"
//                                 discount={40}
//                                 isFree={false}
//                                 link="/course"
//                             />
//                         </div>
//                     </div>
//                 </div>


//                 <div className="mt-8">
//                     <div className="mb-5" data-aos="fade-up">
//                         <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white">
//                             Lộ trình cơ bản
//                         </h1>

//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                             Khám phá hành trình học tập chúng tôi đã nghiên cứu sáng tạo ra
//                         </p>

//                         <div className="w-16 h-0.75 bg-black dark:bg-white mt-2 rounded-full" />
//                     </div>

//                     <div className="mx-auto">
//                         <Roadmap data={roadmapData} />
//                     </div>
//                 </div>


//                 <div className="mt-8">
//                     <div className="mb-5" data-aos="fade-up">
//                         <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white">
//                             Tại sao nên lựa chọn CNcode
//                         </h1>

//                         <div className="w-16 h-0.75 bg-black dark:bg-white mt-2 rounded-full" />
//                     </div>

//                     <div className="mx-auto">
//                         <WhyChoose />
//                     </div>
//                 </div>


//                 <div className="mt-8">
//                     <div className="mb-5" data-aos="fade-up">
//                         <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white">
//                             Thành tựu của chúng tôi
//                         </h1>

//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                             Hãy xem những giá trị của chúng tôi tạo ra
//                         </p>

//                         <div className="w-16 h-0.75 bg-black dark:bg-white mt-2 rounded-full" />
//                     </div>

//                     <div className="mx-auto">
//                         <Stats data={statsData} />
//                     </div>
//                 </div>


//                 <div className="mt-8">
//                     <div className="mb-5" data-aos="fade-up">
//                         <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white">
//                             Bài viết nổi bật
//                         </h1>

//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                             Những bài viết được quan tâm nhiều nhất
//                         </p>

//                         <div className="w-16 h-0.75 bg-black dark:bg-white mt-2 rounded-full" />
//                     </div>

//                     {loadingPosts ? (
//                         <div className="flex justify-center items-center py-12">
//                             <Loader2 size={40} className="animate-spin text-blue-600" />
//                         </div>
//                     ) : featuredPosts.length === 0 ? (
//                         <div className="text-center py-12 text-gray-500">
//                             Chưa có bài viết nào.
//                         </div>
//                     ) : (
//                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//                             {featuredPosts.map((post, idx) => (
//                                 <div key={post._id} data-aos="zoom-in" data-aos-delay={100 + idx * 50}>
//                                     <BlogCard
//                                         title={post.title}
//                                         description={post.description}
//                                         image={post.thumbnail}
//                                         createdAt={post.createdAt}
//                                         author={post.author?.fullName || "CNcode"}
//                                         avatar={post.author?.avatar || "/images/avatar.jpg"}
//                                         link={`/blog/${post.slug}`}
//                                         views={post.views}
//                                     />
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>


//                 <div className="mt-8">
//                     <div className="mb-5" data-aos="fade-up">
//                         <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white">
//                             Thống kê truy cập
//                         </h1>

//                         <div className="w-16 h-0.75 bg-black dark:bg-white mt-2 rounded-full" />
//                     </div>

//                     {loadingStats ? (
//                         <div className="flex justify-center items-center py-12">
//                             <Loader2 size={40} className="animate-spin text-blue-600" />
//                         </div>
//                     ) : (
//                         <Analytics />
//                     )}
//                 </div>


//                 <div className="mt-8">
//                     <div className="mb-5" data-aos="fade-up">
//                         <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-black dark:text-white">
//                             Người dùng nói gì về CNcode
//                         </h1>

//                         <div className="w-16 h-0.75 bg-black dark:bg-white mt-2 rounded-full" />
//                     </div>

//                     <div className="mx-auto">
//                         <Testimonial />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

export default function Home() {
    return (
        <>
            <h1 className="text-center font-bold text-main text-4xl p-[20px_20px]">Website hiện tại đang nâng cấp phần giao diện và chỉnh sửa một số lỗi để mang đến trải nghiệm tốt nhất cho người dùng. Mong Quý người dùng thông cảm</h1>
            <FeatureShowcase />
        </>
    )
}