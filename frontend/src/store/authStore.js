import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/* ---------------------------------------------------------------------------
   Official auth store (MOCK for MVP).
   Backend dev: replace `login` with a real POST /official/login returning a
   session/JWT, and drive `user`/`isAuthenticated` from that. RBAC note: the
   MVP official role can update status only — never delete or edit citizen
   reports (enforced in the UI; must also be enforced server-side).

   Demo credentials (MVP only):  official@publiceye.ng  /  publiceye
--------------------------------------------------------------------------- */

const DEMO = {
  email: 'official@publiceye.ng',
  password: 'publiceye',
  profile: {
    name: 'Councillor Bala Mohammed',
    role: 'LGA Official',
    lga: 'Surulere',
    state: 'Lagos',
    department: 'Works & Infrastructure',
    // Capabilities are explicit so UI can hide unauthorized actions.
    can: { updateStatus: true, viewAnalytics: true, deleteReport: false, editReport: false },
  },
}

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async ({ email, password }) => {
        await new Promise((r) => setTimeout(r, 600)) // simulate network
        if (email.trim().toLowerCase() === DEMO.email && password === DEMO.password) {
          set({ user: DEMO.profile, isAuthenticated: true })
          return { ok: true }
        }
        return { ok: false, error: "The email or password you entered doesn't match our records." }
      },

      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'publiceye-official-auth' },
  ),
)
