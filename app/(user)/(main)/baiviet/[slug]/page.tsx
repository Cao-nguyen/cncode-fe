import BlogDetail from "@/components/sections/blog/blog.detail"
import BlogSidebar from "@/components/sections/blog/blog.sidebar"

export default function BlogDetailPage() {
    return (
        <div className="w-full px-4 py-6">

            {/* Layout */}
            <div className="
                max-w-350 mx-auto
                grid grid-cols-1
                lg:grid-cols-[20%_60%_20%]
                gap-6
            ">

                <div className="hidden lg:block">
                    <div className="sticky top-20">
                        <BlogSidebar />
                    </div>
                </div>

                <div className="w-full">
                    <BlogDetail />
                </div>

                <div className="hidden lg:block" />

            </div>

        </div>
    )
}