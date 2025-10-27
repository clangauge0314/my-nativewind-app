import { ThemedText } from '@/components/themed-text';
import { useRouter } from 'expo-router';
import { ArrowRight, LogIn, Sparkles, UserPlus } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

export function GuestWelcome() {
  const router = useRouter();

  return (
    <View className="mb-8 mt-4">
      {/* Main Card Container */}
      <View 
        className="rounded-3xl overflow-hidden"
        style={{ 
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#e5e7eb',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        {/* Gradient Header */}
        <View 
          className="px-6 py-8"
          style={{ 
            backgroundColor: '#2563eb',
          }}
        >
          {/* Icon */}
          <View className="items-center mb-4">
            <View 
              className="w-20 h-20 rounded-full items-center justify-center"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              <Sparkles size={40} color="#ffffff" />
            </View>
          </View>

          {/* Title */}
          <ThemedText 
            className="text-3xl font-bold text-center mb-2"
            style={{ color: '#ffffff' }}
          >
            Welcome! 👋
          </ThemedText>
          
          {/* Subtitle */}
          <ThemedText 
            className="text-sm text-center leading-5"
            style={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              maxWidth: 280,
              alignSelf: 'center'
            }}
          >
            Join thousands of users tracking their health and wellness journey
          </ThemedText>
        </View>

        {/* Content Section */}
        <View className="px-6 py-6">
          {/* Features */}
          <View style={{ gap: 12 }}>
            <View className="flex-row items-center">
              <View 
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: '#dbeafe' }}
              >
                <ThemedText style={{ color: '#2563eb', fontSize: 16 }}>✓</ThemedText>
              </View>
              <ThemedText 
                className="flex-1 text-sm"
                style={{ color: '#4b5563' }}
              >
                Track your health metrics daily
              </ThemedText>
            </View>
            <View className="flex-row items-center">
              <View 
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: '#dbeafe' }}
              >
                <ThemedText style={{ color: '#2563eb', fontSize: 16 }}>✓</ThemedText>
              </View>
              <ThemedText 
                className="flex-1 text-sm"
                style={{ color: '#4b5563' }}
              >
                Get personalized insights & tips
              </ThemedText>
            </View>
            <View className="flex-row items-center">
              <View 
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: '#dbeafe' }}
              >
                <ThemedText style={{ color: '#2563eb', fontSize: 16 }}>✓</ThemedText>
              </View>
              <ThemedText 
                className="flex-1 text-sm"
                style={{ color: '#4b5563' }}
              >
                Set reminders and never miss a dose
              </ThemedText>
            </View>
          </View>

          <View style={{ gap: 2, marginTop: -8 }}>
            {/* Login Button 1 - Main CTA */}
            <Pressable 
              onPress={() => router.push('/login')}
              className="flex-row items-center justify-between px-6 py-4 rounded-2xl"
              style={({ pressed }) => ({ 
                backgroundColor: pressed ? '#1d4ed8' : '#2563eb',
                transform: [{ scale: pressed ? 0.98 : 1 }]
              })}
            >
              <View className="flex-row items-center">
                <LogIn size={20} color="#ffffff" />
                <ThemedText 
                  className="ml-3 font-bold text-base"
                  style={{ color: '#ffffff' }}
                >
                  Login to Your Account
                </ThemedText>
              </View>
              <ArrowRight size={20} color="#ffffff" />
            </Pressable>

            <Pressable 
              onPress={() => router.push('/login')}
              className="flex-row items-center justify-between px-6 py-4 rounded-2xl"
              style={({ pressed }) => ({ 
                backgroundColor: pressed ? '#dbeafe' : ('#eff6ff'),
                borderWidth: 1.5,
                borderColor: '#2563eb',
                transform: [{ scale: pressed ? 0.98 : 1 }]
              })}
            >
              <View className="flex-row items-center">
                <LogIn size={20} color="#2563eb" />
                <ThemedText 
                  className="ml-3 font-bold text-base"
                  style={{ color: '#2563eb' }}
                >
                  Login
                </ThemedText>
              </View>
              <ArrowRight size={20} color="#2563eb" />
            </Pressable>

            {/* Sign Up Button */}
            <Pressable 
              onPress={() => router.push('/signup')}
              className="flex-row items-center justify-between px-6 py-4 rounded-2xl"
              style={({ pressed }) => ({ 
                backgroundColor: pressed ? '#f3f4f6' : ('#f9fafb'),
                borderWidth: 1.5,
                borderColor: '#e5e7eb',
                transform: [{ scale: pressed ? 0.98 : 1 }]
              })}
            >
              <View className="flex-row items-center">
                <UserPlus size={20} color={'#6b7280'} />
                <ThemedText 
                  className="ml-3 font-semibold text-base"
                  style={{ color: '#374151' }}
                >
                  Create New Account
                </ThemedText>
              </View>
              <ArrowRight size={20} color={'#6b7280'} />
            </Pressable>
          </View>

          {/* Footer Note */}
          <ThemedText 
            className="text-xs text-center mt-4"
            style={{ color: '#9ca3af' }}
          >
            Free forever • No credit card required
          </ThemedText>
        </View>
      </View>
    </View>
  );
}
