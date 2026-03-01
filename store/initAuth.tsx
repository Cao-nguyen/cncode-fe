import { login } from "./authSlice"
import { store } from "./index"

export function initAuth() {
    if (typeof window === "undefined") return

    const user = localStorage.getItem("user")
    const token = localStorage.getItem("accessToken")

    if (user && token) {
        store.dispatch(login(JSON.parse(user)))
    }
}