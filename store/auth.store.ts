// store/auth.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { IUser } from '@/types/auth.type'

interface AuthState {
  user: IUser | null
  token: string | null
  isOnboarded: boolean
  setUser: (user: IUser | null) => void
  setToken: (token: string | null) => void
  setIsOnboarded: (isOnboarded: boolean) => void
  setAuth: (user: IUser, token: string) => void  // Thêm method mới
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isOnboarded: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setIsOnboarded: (isOnboarded) => set({ isOnboarded }),
      setAuth: (user, token) => set({ user, token }),  // Thêm method này
      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isOnboarded: false })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)