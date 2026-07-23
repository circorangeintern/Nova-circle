import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  changeCurrentPassword,
  deleteCurrentAccount,
  getCurrentUser,
  loginAccount,
  registerAccount,
  updateCurrentUser,
} from '@/services/api'

export const useCitizenAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      register: async ({ name, email, password }) => {
        try {
          const session = await registerAccount({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
          })
          set({ user: session.user, token: session.token, isAuthenticated: true })
          return { ok: true }
        } catch (error) {
          return { ok: false, error: error.message }
        }
      },

      login: async ({ email, password }) => {
        try {
          const session = await loginAccount({ email, password })
          if (session.role !== 'CITIZEN') {
            return { ok: false, error: 'Government accounts must use the official portal.' }
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
          if (user.backendRole !== 'CITIZEN') throw new Error('Invalid citizen session')
          set({ user, isAuthenticated: true })
          return true
        } catch {
          set({ user: null, token: null, isAuthenticated: false })
          return false
        }
      },

      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      updateProfile: async (patch) => {
        const token = get().token
        try {
          const user = await updateCurrentUser(token, patch)
          set({ user })
          return { ok: true, user }
        } catch (error) {
          return { ok: false, error: error.message }
        }
      },

      changePassword: async (values) => {
        const token = get().token
        try {
          await changeCurrentPassword(token, values)
          return { ok: true }
        } catch (error) {
          return { ok: false, error: error.message }
        }
      },

      deleteAccount: async () => {
        const token = get().token
        try {
          await deleteCurrentAccount(token)
          set({ user: null, token: null, isAuthenticated: false })
          return { ok: true }
        } catch (error) {
          return { ok: false, error: error.message }
        }
      },
    }),
    {
      name: 'publiceye-citizen-session',
      partialize: ({ user, token, isAuthenticated }) => ({ user, token, isAuthenticated }),
    },
  ),
)
