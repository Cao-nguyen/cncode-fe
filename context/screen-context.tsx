"use client"

import { createContext, useContext, useState } from "react"
import type { ScreenContextType } from "@/types/screen"

const ScreenContext = createContext<ScreenContextType | null>(null)

export function ScreenProvider({ children }: { children: React.ReactNode }) {
    const [screen, setScreen] = useState(false)

    return (
        <ScreenContext.Provider value={{ screen, setScreen }}>
            {children}
        </ScreenContext.Provider>
    )
}

export const useScreen = () => {
    const ctx = useContext(ScreenContext)
    if (!ctx) {
        throw new Error("useScreen must be used within ScreenProvider")
    }
    return ctx
}