"use client"
import "swiper/css"
import "swiper/css/pagination"
import Slideshow from "@/components/ui/slideshow"

export default function Home() {
    return (
        <div>
            <Slideshow />
            <div className="m-5 xl:m-10">
                <h1>Hello</h1>
            </div>
        </div>
    )
}