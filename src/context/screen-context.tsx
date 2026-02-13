"use client"
import { createContext, useContext, useState } from "react"

const ScreenContext = createContext<any>(null)

export function ScreenProvider({ children }: { children: React.ReactNode }) {
    const [screen, setScreen] = useState(false)

    return (
        <ScreenContext.Provider value={{ screen, setScreen }}>
            {children}
        </ScreenContext.Provider>
    )
}

export const useScreen = () => useContext(ScreenContext)