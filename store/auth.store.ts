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