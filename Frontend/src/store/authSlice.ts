import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthUser } from '@/types'

type AuthState = {
  user: AuthUser | null
  accessToken: string | null
}

function load(): AuthState {
  try {
    const user = localStorage.getItem('hc_user')
    const accessToken = localStorage.getItem('hc_access')
    return { user: user ? (JSON.parse(user) as AuthUser) : null, accessToken }
  } catch {
    return { user: null, accessToken: null }
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: load(),
  reducers: {
    setSession: (state, action: PayloadAction<{ user: AuthUser; accessToken: string; refreshToken: string }>) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      localStorage.setItem('hc_user', JSON.stringify(action.payload.user))
      localStorage.setItem('hc_access', action.payload.accessToken)
      localStorage.setItem('hc_refresh', action.payload.refreshToken)
    },
    clearSession: (state) => {
      state.user = null
      state.accessToken = null
      localStorage.removeItem('hc_user')
      localStorage.removeItem('hc_access')
      localStorage.removeItem('hc_refresh')
    },
    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (!state.user) return
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('hc_user', JSON.stringify(state.user))
    },
    updateTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken
      localStorage.setItem('hc_access', action.payload.accessToken)
      localStorage.setItem('hc_refresh', action.payload.refreshToken)
    },
  },
})

export const { setSession, clearSession, updateUser, updateTokens } = authSlice.actions
export default authSlice.reducer
