import { ThemedText } from '@/components/themed-text';
import { Edit3, User } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface ProfileInputButtonProps {
  onPress?: () => void;
}

export function ProfileInputButton({ onPress }: ProfileInputButtonProps) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      style={{
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
        width: '100%',
        maxWidth: 400,
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center justify-center">
        {/* 아이콘 */}
        <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
          <User size={24} color="#3b82f6" />
        </View>
        
        {/* 텍스트 영역 */}
        <View className="flex-1">
          <ThemedText className="text-lg font-semibold text-gray-800">
            Update My Profile
          </ThemedText>
          <ThemedText className="text-sm text-gray-500 mt-1">
            Manage your diabetes settings and preferences
          </ThemedText>
        </View>
        
        {/* 화살표 아이콘 */}
        <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
          <Edit3 size={16} color="#6b7280" />
        </View>
      </View>
      
      {/* 하단 정보 */}
      <View className="mt-4 pt-4 border-t border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <ThemedText className="text-xs text-gray-400 mb-1">
              Last updated
            </ThemedText>
            <ThemedText className="text-sm font-medium text-gray-600">
              2 hours ago
            </ThemedText>
          </View>
          
          <View className="flex-1 items-end">
            <ThemedText className="text-xs text-gray-400 mb-1">
              Status
            </ThemedText>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-green-400 rounded-full mr-2" />
              <ThemedText className="text-sm font-medium text-gray-600">
                Up to date
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
