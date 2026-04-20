import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { IUser } from '@/types/auth.type'

interface AuthState {
  user: IUser | null
  token: string | null
  isOnboarded: boolean
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
      coins: 0,

      setUser: (user) => set({ user, coins: user?.coins || 0 }),

      setToken: (token) => set({ token }),

      setIsOnboarded: (isOnboarded) => set({ isOnboarded }),

      setCoins: (coins) => set({ coins }),

      setAuth: (user, token) => {
        console.log('setAuth - coins:', user.coins)
        set({
          user,
          token,
          isOnboarded: user.isOnboarded,
          coins: user.coins || 0
        })
        localStorage.setItem('token', token)
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isOnboarded: false, coins: 0 })
      },

      checkAndSync: async () => {
        const token = get().token
        if (!token) return

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const result = await res.json()
          console.log('checkAndSync - result:', result)

          if (result.success) {
            // Lấy coins từ đúng vị trí
            const userData = result.data
            // Coins có thể nằm ở userData._doc.coins hoặc userData.coins
            const coinsValue = userData.coins || userData._doc?.coins || 0
            console.log('checkAndSync - coins from API:', coinsValue)

            set({
              user: userData,
              isOnboarded: userData.isOnboarded || !!userData.username,
              coins: coinsValue
            })
          } else {
            get().logout()
          }
        } catch (error) {
          console.error('Sync failed:', error)
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)