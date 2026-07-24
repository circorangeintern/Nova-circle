import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getCurrentUser, loginAccount } from '@/services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async ({ email, password }) => {
        try {
          const session = await loginAccount({ email, password })
          if (session.role !== 'GOVERNMENT_OFFICIAL') {
            return { ok: false, error: 'This account does not have access to the official portal.' }
          }
          set({ user: session.user, token: session.token, isAuthenticated: true })
          return { ok: true }
        } catch (error) {
          return { ok: false, error: error.message }
        }
      },

      refreshSession: async () => {
        const token = get().token
        if (!token) return false
        try {
          const user = await getCurrentUser(token)
          if (user.backendRole !== 'GOVERNMENT_OFFICIAL') throw new Error('Invalid official session')
          set({ user, isAuthenticated: true })
          return true
        } catch {
          set({ user: null, token: null, isAuthenticated: false })
          return false
        }
      },

      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'publiceye-official-auth',
      partialize: ({ user, token, isAuthenticated }) => ({ user, token, isAuthenticated }),
    },
  ),
)
