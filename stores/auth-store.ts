import { supabase } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'
import { create } from 'zustand'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  clearUser: () => void
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: false,
  initialized: false,
  
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
  clearUser: () => set({ user: null, session: null }),
  
  signIn: async (email: string, password: string) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        set({ loading: false })
        return { error }
      }
      
      set({ 
        user: data.user, 
        session: data.session, 
        loading: false 
      })
      
      return { error: null }
    } catch (error) {
      set({ loading: false })
      return { error }
    }
  },
  
  signUp: async (email: string, password: string) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) {
        set({ loading: false })
        return { error }
      }
      
      set({ 
        user: data.user, 
        session: data.session, 
        loading: false 
      })
      
      return { error: null }
    } catch (error) {
      set({ loading: false })
      return { error }
    }
  },
  
  signOut: async () => {
    set({ loading: true })
    try {
      await supabase.auth.signOut()
      set({ 
        user: null, 
        session: null, 
        loading: false 
      })
    } catch (error) {
      set({ loading: false })
      console.error('Error signing out:', error)
    }
  },
  
  initializeAuth: async () => {
    set({ loading: true })
    try {
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession()
      
      set({ 
        user: session?.user ?? null, 
        session, 
        loading: false,
        initialized: true 
      })
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ 
          user: session?.user ?? null, 
          session 
        })
      })
    } catch (error) {
      set({ loading: false, initialized: true })
      console.error('Error initializing auth:', error)
    }
  },
}))