import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useAuthStore } from '@/stores/auth-store'
import React, { useState } from 'react'
import { Alert, TextInput, TouchableOpacity, View } from 'react-native'

interface AuthFormProps {
  onSuccess?: () => void
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const { signIn, signUp, loading } = useAuthStore()

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    const { error } = isSignUp 
      ? await signUp(email, password)
      : await signIn(email, password)

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      if (isSignUp) {
        Alert.alert('Success', "Account created successfully!")
      }
      onSuccess?.()
    }
  }

  return (
    <ThemedView className="flex-1 px-8 py-6">
      <View className="mb-8">
        <ThemedText className="text-3xl font-bold text-center mb-2">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </ThemedText>
        <ThemedText className="text-center opacity-60">
          {isSignUp ? 'Sign up to start tracking your health' : 'Sign in to continue'}
        </ThemedText>
      </View>

      <View className="space-y-4">
        {/* Email Input */}
        <View className="mb-4">
          <ThemedText className="text-sm font-medium mb-2">Email</ThemedText>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 text-base"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Password Input */}
        <View className="mb-6">
          <ThemedText className="text-sm font-medium mb-2">Password</ThemedText>
          <TextInput
            className="bg-gray-100 rounded-lg px-4 py-3 text-base"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className={`py-4 rounded-lg ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
          onPress={handleSubmit}
          disabled={loading}
        >
          <ThemedText className="text-white text-center font-semibold text-lg">
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </ThemedText>
        </TouchableOpacity>

        {/* Toggle Auth Mode */}
        <TouchableOpacity
          className="mt-4"
          onPress={() => setIsSignUp(!isSignUp)}
        >
          <ThemedText className="text-center text-blue-500">
            {isSignUp 
              ? 'Already have an account? Sign In' 
              : "Don't have an account? Sign Up"
            }
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  )
}