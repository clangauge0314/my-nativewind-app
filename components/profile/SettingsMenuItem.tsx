import { ThemedText } from '@/components/themed-text';
import { ChevronRight } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';

interface SettingsMenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  onPress: () => void;
  color?: string;
  dangerous?: boolean;
}

export const SettingsMenuItem = React.memo(function SettingsMenuItem({
  icon,
  title,
  subtitle,
  value,
  onPress,
  color = '#3b82f6',
  dangerous = false,
}: SettingsMenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-3"
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        className="flex-row items-center p-4 rounded-2xl"
        style={{
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#e5e7eb',
        }}
      >
        {/* Icon */}
        <View
          className="mr-3 items-center justify-center"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: dangerous ? '#fee2e2' : color + '15',
          }}
        >
          {icon}
        </View>

        {/* Content */}
        <View className="flex-1">
          <ThemedText
            className="font-semibold"
            style={{
              fontSize: 15,
              color: dangerous ? '#dc2626' : '#1f2937',
            }}
          >
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText
              style={{
                fontSize: 12,
                color: '#6b7280',
                marginTop: 2,
              }}
            >
              {subtitle}
            </ThemedText>
          )}
        </View>

        {/* Value or Arrow */}
        {value ? (
          <ThemedText
            className="font-semibold mr-2"
            style={{
              fontSize: 14,
              color: '#6b7280',
            }}
          >
            {value}
          </ThemedText>
        ) : null}
        
        <ChevronRight size={20} color="#9ca3af" />
      </View>
    </Pressable>
  );
});

