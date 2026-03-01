"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import NotFoundAdmin from "./admin/not-found"
import NotFoundUser from "./(users)/not-found"

export default function GlobalNotFound() {
    const path = usePathname()
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        const root = '/' + path.split('/').filter(Boolean)[0]
        setIsAdmin(root === "/admin")
    }, [path])

    return (
        <div className="h-screen flex items-center justify-center">
            {isAdmin ? <NotFoundAdmin /> : <NotFoundUser />}
        </div>
    )
}