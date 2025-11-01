import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import { create } from 'zustand'

interface AuthState {
  user: FirebaseAuthTypes.User | null
  loading: boolean
  initialized: boolean
  
  // Actions
  setUser: (user: FirebaseAuthTypes.User | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  clearUser: () => void
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  initializeAuth: () => Promise<void>
  
  // Additional Firebase methods
  sendPasswordResetEmail: (email: string) => Promise<{ error: any }>
  updateProfile: (displayName: string) => Promise<{ error: any }>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,
  
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
  clearUser: () => set({ user: null }),
  
  signIn: async (email: string, password: string) => {
    set({ loading: true })
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password)
      
      set({ 
        user: userCredential.user, 
        loading: false 
      })
      
      return { error: null }
    } catch (error: any) {
      set({ loading: false })
      console.error('Sign in error:', error)
      
      // Firebase 에러 메시지를 사용자 친화적으로 변환
      let errorMessage = 'Login failed. Please try again.'
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.'
          break
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.'
          break
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.'
          break
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.'
          break
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password.'
          break
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.'
          break
      }
      
      return { error: { message: errorMessage, code: error.code } }
    }
  },
  
  signUp: async (email: string, password: string) => {
    set({ loading: true })
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password)
      
      set({ 
        user: userCredential.user, 
        loading: false 
      })
      
      return { error: null }
    } catch (error: any) {
      set({ loading: false })
      console.error('Sign up error:', error)
      
      // Firebase 에러 메시지를 사용자 친화적으로 변환
      let errorMessage = 'Sign up failed. Please try again.'
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered.'
          break
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.'
          break
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password sign up is not enabled.'
          break
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Use at least 6 characters.'
          break
      }
      
      return { error: { message: errorMessage, code: error.code } }
    }
  },
  
  signOut: async () => {
    set({ loading: true })
    try {
      await auth().signOut()
      set({ 
        user: null, 
        loading: false 
      })
    } catch (error) {
      set({ loading: false })
      console.error('Error signing out:', error)
    }
  },
  
  sendPasswordResetEmail: async (email: string) => {
    set({ loading: true })
    try {
      await auth().sendPasswordResetEmail(email)
      set({ loading: false })
      return { error: null }
    } catch (error: any) {
      set({ loading: false })
      console.error('Password reset error:', error)
      
      let errorMessage = 'Failed to send password reset email.'
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.'
          break
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.'
          break
      }
      
      return { error: { message: errorMessage, code: error.code } }
    }
  },
  
  updateProfile: async (displayName: string) => {
    const currentUser = auth().currentUser
    
    if (!currentUser) {
      return { error: { message: 'No user logged in' } }
    }
    
    set({ loading: true })
    try {
      await currentUser.updateProfile({ displayName })
      
      // Refresh user data
      await currentUser.reload()
      const updatedUser = auth().currentUser
      
      set({ 
        user: updatedUser, 
        loading: false 
      })
      
      return { error: null }
    } catch (error: any) {
      set({ loading: false })
      console.error('Update profile error:', error)
      return { error: { message: 'Failed to update profile', code: error.code } }
    }
  },
  
  initializeAuth: async () => {
    set({ loading: true })
    try {
      // Firebase Auth 상태 리스너 설정
      const unsubscribe = auth().onAuthStateChanged((user) => {
        set({ 
          user, 
          loading: false,
          initialized: true 
        })
      })
      
      // 초기 사용자 가져오기
      const currentUser = auth().currentUser
      
      set({ 
        user: currentUser, 
        loading: false,
        initialized: true 
      })
      
      // Clean up은 앱이 종료될 때 자동으로 처리됨
      return unsubscribe
    } catch (error) {
      set({ loading: false, initialized: true })
      console.error('Error initializing auth:', error)
    }
  },
}))
