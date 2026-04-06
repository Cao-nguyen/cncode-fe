"use client"

import { useEffect } from "react"
import AOS from "aos"

export default function AOSProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        AOS.init({
            once: true,
            duration: 600,
        })

        setTimeout(() => {
            AOS.refresh()
        }, 100)
    }, [])

    return <>{children}</>
}