import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { IUser } from '@/types/auth.type'

interface AuthState {
  user: IUser | null
  token: string | null
  isOnboarded: boolean
  isLoaded: boolean
  isLoading: boolean
  coins: number
  setUser: (user: IUser | null) => void
  setToken: (token: string | null) => void
  setIsOnboarded: (isOnboarded: boolean) => void
  setAuth: (user: IUser, token: string) => void
  setCoins: (coins: number) => void
  logout: () => void
  checkAndSync: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isOnboarded: false,
      isLoaded: false,
      isLoading: false,
      coins: 0,

      setUser: (user) => set({ user, coins: user?.coins ?? 0 }),

      setToken: (token) => set({ token }),

      setIsOnboarded: (isOnboarded) => set({ isOnboarded }),

      setCoins: (coins) => set({ coins }),

      setAuth: (user, token) => {
        set({
          user,
          token,
          isOnboarded: user.isOnboarded,
          coins: user.coins ?? 0,
          isLoaded: true,
        })
        localStorage.setItem('token', token)
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isOnboarded: false, coins: 0, isLoaded: true })
      },

      checkAndSync: async () => {
        const token = get().token
        if (!token) {
          set({ isLoaded: true })
          return
        }

        set({ isLoading: true })
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const result = await res.json() as { success: boolean; data: Record<string, unknown> }

          if (result.success) {
            const raw = result.data

            const userData: IUser = {
              id: (raw._id as string) || (raw.id as string),
              email: raw.email as string,
              username: raw.username as string,
              fullName: raw.fullName as string,
              avatar: raw.avatar as string,
              role: raw.role as IUser['role'],
              isOnboarded: (raw.isOnboarded as boolean) || !!(raw.username),
              class: raw.class as string,
              province: raw.province as string,
              school: raw.school as string,
              birthday: raw.birthday as string,
              bio: raw.bio as string,
              coins: (raw.coins as number) ?? 0,
              streak: (raw.streak as number) ?? 0,
              createdAt: raw.createdAt as string,
              updatedAt: raw.updatedAt as string,
            }

            set({
              user: userData,
              isOnboarded: userData.isOnboarded,
              coins: userData.coins,
              isLoaded: true,
            })
          } else {
            get().logout()
          }
        } catch (error) {
          console.error('Sync failed:', error)
          get().logout()
        } finally {
          set({ isLoading: false, isLoaded: true })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isOnboarded: state.isOnboarded,
        coins: state.coins,
      }),
    }
  )
)