import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Mail } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

interface ProfileCardProps {
  email: string;
  name?: string;
}

export const ProfileCard = React.memo(function ProfileCard({ email, name }: ProfileCardProps) {
  // 이메일에서 첫 글자 추출
  const initial = (name || email).charAt(0).toUpperCase();
  
  return (
    <ThemedView
      className="rounded-3xl p-6 mb-6"
      style={{
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <View className="items-center">
        {/* Avatar */}
        <View
          className="mb-4"
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: '#3b82f6',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#3b82f6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <ThemedText
            className="font-bold"
            style={{
              fontSize: 40,
              color: '#ffffff',
              lineHeight: 48,
            }}
          >
            {initial}
          </ThemedText>
        </View>

        {/* Name */}
        {name && (
          <ThemedText
            className="font-bold mb-1"
            style={{
              fontSize: 24,
              lineHeight: 32,
            }}
          >
            {name}
          </ThemedText>
        )}

        {/* Email */}
        <View className="flex-row items-center">
          <Mail size={16} color="#6b7280" />
          <ThemedText
            className="ml-2"
            style={{
              fontSize: 14,
              color: '#6b7280',
            }}
          >
            {email}
          </ThemedText>
        </View>

        {/* Badge */}
        <View
          className="mt-4 px-4 py-2 rounded-full"
          style={{
            backgroundColor: '#dbeafe',
          }}
        >
          <ThemedText
            className="font-semibold"
            style={{
              fontSize: 12,
              color: '#1e40af',
            }}
          >
            Active Member
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
});

