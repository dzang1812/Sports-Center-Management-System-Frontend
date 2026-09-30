import { createContext, useContext, useState } from 'react'
import { api, getAuth, setAuth } from './api'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export const ROLE_HOME = { Manager: '/manager', Receptionist: '/reception', Coach: '/coach', Member: '/member/schedule' }

export function AuthProvider({ children }) {
  const [auth, setState] = useState(getAuth)

  const save = (a) => {
    setAuth(a)
    setState(a)
  }

  const value = {
    auth,
    // Both endpoints return the same shape: token, expiresAt, userId, fullName, role, mustChangePassword, emailVerified.
    login: async (email, password) => {
      const a = await api('/auth/login', { method: 'POST', body: { email, password } })
      save(a)
      return a
    },
    register: async (body) => {
      const a = await api('/auth/register', { method: 'POST', body })
      save(a)
      return a
    },
    logout: () => save(null),
    updateAuth: (patch) => save({ ...auth, ...patch }),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
