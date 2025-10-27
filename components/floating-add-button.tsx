import { useResponsive } from '@/hooks/use-responsive';
import { Plus } from 'lucide-react-native';
import React from 'react';
import { Pressable } from 'react-native';

interface FloatingAddButtonProps {
  onPress: () => void;
}

export function FloatingAddButton({ onPress }: FloatingAddButtonProps) {
  const { responsiveSize, responsiveFontSize, responsiveSpacing } = useResponsive();

  const handlePress = () => {
    console.log('➕ Floating + button clicked');
    onPress();
  };

  const handlePressIn = () => {
    console.log('🔴 Pressed in');
  };

  const handlePressOut = () => {
    console.log('🟢 Pressed out');
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      style={({ pressed }) => ({
        width: 60,
        height: 60,
        minWidth: 60,
        minHeight: 60,
        borderRadius: 30,
        backgroundColor: pressed ? '#1d4ed8' : '#2563eb',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: pressed ? 0.4 : 0.3,
        shadowRadius: 16,
        elevation: 50,
        borderWidth: 4,
        borderColor: '#ffffff',
      })}
    >
      <Plus size={28} color="#ffffff" />
    </Pressable>
  );
}
