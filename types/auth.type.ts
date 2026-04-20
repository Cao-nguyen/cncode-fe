
export interface IUser {
  id: string
  email: string
  username: string
  fullName: string
  avatar: string
  role: 'user' | 'teacher' | 'admin'
  requestedRole?: 'teacher' | null  
  isOnboarded: boolean
  class: string
  province: string
  school: string
  birthday: string
  bio: string
  coins: number
  streak: number
  createdAt: string
  updatedAt: string
}

export interface IOnboardingData {
  username: string
  class: string
  province: string
  school: string
  birthday: string
  bio: string
}

export interface IGoogleLoginResponse {
  success: boolean
  data: {
    user: IUser
    token: string
    isNewUser: boolean
  }
  message: string
}

export interface IOnboardingResponse {
  success: boolean
  data: IUser
  message: string
}

export interface ICheckUsernameResponse {
  available: boolean
  message?: string
}

export interface IStreakResponse {
  success: boolean
  data: {
    streak: number
    coinsEarned: number
    totalCoins: number
  }
  message: string
}