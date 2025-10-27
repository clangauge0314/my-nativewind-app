import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/stores/auth-store';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, User, X } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp, loading } = useAuthStore();

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    const { error } = await signUp(email, password);
    
    if (error) {
      toast.error(error.message || 'Sign up failed');
    } else {
      toast.success('Account created successfully! Please check your email for verification.');
      setTimeout(() => {
        try {
          router.dismiss();
        } catch {
          router.replace('/(tabs)');
        }
      }, 800);
    }
  };

  const handleLogin = () => {
    router.replace('/login');
  };

  return (
    <ThemedView className="flex-1">
      {/* Header with Close Button */}
      <View 
        className="flex-row items-center justify-between px-5 py-4 border-b"
        style={{ 
          paddingTop: insets.top + 16,
          borderBottomColor: '#e5e7eb',
          borderBottomWidth: 1,
        }}
      >
        <ThemedText className="text-xl font-bold">Sign Up</ThemedText>
        <Pressable 
          onPress={() => router.back()}
          className="p-2 rounded-full"
          style={{ backgroundColor: '#f3f4f6' }}
        >
          <X size={20} color={'#000000'} />
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1 px-6 pt-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8">
          <ThemedText className="text-3xl font-bold mb-2">
            Create Account
          </ThemedText>
          <ThemedText className="text-base opacity-60">
            Sign up to get started
          </ThemedText>
        </View>

        {/* Name Input */}
        <View className="mb-4">
          <ThemedText className="text-sm font-medium mb-2">
            Full Name
          </ThemedText>
          <View 
            className="flex-row items-center px-4 py-3 rounded-xl"
            style={{ 
              backgroundColor: '#f3f4f6',
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          >
            <User size={20} color={'#6b7280'} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={'#9ca3af'}
              autoCapitalize="words"
              className="flex-1 ml-3 text-base"
              style={{ color: '#000000' }}
            />
          </View>
        </View>

        {/* Email Input */}
        <View className="mb-4">
          <ThemedText className="text-sm font-medium mb-2">
            Email
          </ThemedText>
          <View 
            className="flex-row items-center px-4 py-3 rounded-xl"
            style={{ 
              backgroundColor: '#f3f4f6',
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          >
            <Mail size={20} color={'#6b7280'} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={'#9ca3af'}
              keyboardType="email-address"
              autoCapitalize="none"
              className="flex-1 ml-3 text-base"
              style={{ color: '#000000' }}
            />
          </View>
        </View>

        {/* Password Input */}
        <View className="mb-4">
          <ThemedText className="text-sm font-medium mb-2">
            Password
          </ThemedText>
          <View 
            className="flex-row items-center px-4 py-3 rounded-xl"
            style={{ 
              backgroundColor: '#f3f4f6',
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          >
            <Lock size={20} color={'#6b7280'} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              placeholderTextColor={'#9ca3af'}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              className="flex-1 ml-3 text-base"
              style={{ color: '#000000' }}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} color={'#6b7280'} />
              ) : (
                <Eye size={20} color={'#6b7280'} />
              )}
            </Pressable>
          </View>
        </View>

        {/* Confirm Password Input */}
        <View className="mb-6">
          <ThemedText className="text-sm font-medium mb-2">
            Confirm Password
          </ThemedText>
          <View 
            className="flex-row items-center px-4 py-3 rounded-xl"
            style={{ 
              backgroundColor: '#f3f4f6',
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          >
            <Lock size={20} color={'#6b7280'} />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              placeholderTextColor={'#9ca3af'}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              className="flex-1 ml-3 text-base"
              style={{ color: '#000000' }}
            />
            <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? (
                <EyeOff size={20} color={'#6b7280'} />
              ) : (
                <Eye size={20} color={'#6b7280'} />
              )}
            </Pressable>
          </View>
        </View>

        {/* Sign Up Button */}
        <Pressable 
          onPress={handleSignup}
          disabled={loading}
          className="py-4 rounded-xl mb-4"
          style={{ 
            backgroundColor: loading ? '#9ca3af' : ('#1d4ed8'),
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText 
              className="text-center text-base font-semibold"
              style={{ color: 'white' }}
            >
              Sign Up
            </ThemedText>
          )}
        </Pressable>

        {/* Login Link */}
        <View className="flex-row justify-center items-center mb-8">
          <ThemedText className="text-sm opacity-60">
            Already have an account?{' '}
          </ThemedText>
          <Pressable onPress={handleLogin}>
            <ThemedText className="text-sm font-semibold" style={{ color: '#1d4ed8' }}>
              Login
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
 