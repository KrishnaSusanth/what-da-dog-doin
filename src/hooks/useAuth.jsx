import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

// 1. Create the context internally (NOT exported, so Vite won't complain!)
const AuthContext = createContext({})

// 2. The Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    }).catch(() => {
      if (mounted) setLoading(false)
    })

    // Listen for changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    // Cleanup for React Strict Mode
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Simple, raw auth functions
  const login = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password })
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// 3. The Hook
export function useAuth() {
  return useContext(AuthContext)
}