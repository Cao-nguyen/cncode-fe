"use client"
import { Provider } from "react-redux"
import { store } from "../store"
import { ReactNode, useEffect } from "react"
import { initAuth } from "../store/initAuth"

export default function Providers({ children }: { children: ReactNode }) {

    useEffect(() => {
        initAuth()
    }, [])

    return <Provider store={store}>{children}</Provider>
}