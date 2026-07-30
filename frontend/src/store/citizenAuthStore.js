import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/* ---------------------------------------------------------------------------
   Citizen auth store (MOCK for MVP — no real backend yet).

   Accounts are OPTIONAL: anyone can still report anonymously. Signing in unlocks
   a personal account area — contribution stats, and the ability to edit/delete
   your own reports while they are still "Open".

   Backend dev: replace register/login/deleteAccount with real API calls +
   secure session cookies. The mock "user database" lives in localStorage under
   `publiceye-citizens` (passwords in plain text — DEMO ONLY, never ship this).
--------------------------------------------------------------------------- */

const DB_KEY = 'publiceye-citizens'

const readDB = () => {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY)) ?? []
  } catch {
    return []
  }
}
const writeDB = (users) => localStorage.setItem(DB_KEY, JSON.stringify(users))

// Public view of a user (never expose the password to the app state).
const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  createdAt: u.createdAt,
  prefs: u.prefs ?? { defaultAnonymous: true },
})

let idSeed = 1000

export const useCitizenAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      register: async ({ name, email, password, legalAccepted }) => {
        await new Promise((r) => setTimeout(r, 500))
        const users = readDB()
        const normalized = email.trim().toLowerCase()
        if (users.some((u) => u.email === normalized)) {
          return { ok: false, error: 'An account with this email already exists. Try signing in.' }
        }
        idSeed += 1
        const newUser = {
          id: `cz_${idSeed}`,
          name: name.trim(),
          email: normalized,
          password,
          createdAt: new Date().toISOString(),
          legalAcceptedAt: legalAccepted ? new Date().toISOString() : null,
          prefs: { defaultAnonymous: true },
        }
        writeDB([...users, newUser])
        set({ user: publicUser(newUser), isAuthenticated: true })
        return { ok: true }
      },

      login: async ({ email, password }) => {
        await new Promise((r) => setTimeout(r, 500))
        const users = readDB()
        const normalized = email.trim().toLowerCase()
        const found = users.find((u) => u.email === normalized)
        if (!found || found.password !== password) {
          return { ok: false, error: "The email or password you entered doesn't match our records." }
        }
        set({ user: publicUser(found), isAuthenticated: true })
        return { ok: true }
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      updateProfile: (patch) => {
        const current = get().user
        if (!current) return
        const users = readDB().map((u) =>
          u.id === current.id ? { ...u, ...patch, prefs: { ...u.prefs, ...(patch.prefs ?? {}) } } : u,
        )
        writeDB(users)
        const updated = users.find((u) => u.id === current.id)
        set({ user: publicUser(updated) })
      },

      changePassword: async ({ current: currentPw, next }) => {
        await new Promise((r) => setTimeout(r, 400))
        const current = get().user
        const users = readDB()
        const me = users.find((u) => u.id === current?.id)
        if (!me || me.password !== currentPw) {
          return { ok: false, error: 'Your current password is incorrect.' }
        }
        writeDB(users.map((u) => (u.id === me.id ? { ...u, password: next } : u)))
        return { ok: true }
      },

      deleteAccount: async () => {
        await new Promise((r) => setTimeout(r, 500))
        const current = get().user
        if (current) writeDB(readDB().filter((u) => u.id !== current.id))
        set({ user: null, isAuthenticated: false })
        return { ok: true }
      },
    }),
    { name: 'publiceye-citizen-session' },
  ),
)
