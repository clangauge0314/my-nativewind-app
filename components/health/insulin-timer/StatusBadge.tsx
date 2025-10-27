import { ThemedText } from '@/components/themed-text';
import { useResponsive } from '@/hooks/use-responsive';
import { StatusData } from '@/types/insulin-timer';
import React from 'react';
import { View } from 'react-native';

interface StatusBadgeProps {
  statusData: StatusData;
  statusFontSize: number;
}

export const StatusBadge = React.memo(function StatusBadge({ 
  statusData, 
  statusFontSize 
}: StatusBadgeProps) {
  const { responsiveSize, responsiveSpacing } = useResponsive();

  return (
    <View 
      style={{ 
        marginBottom: responsiveSpacing(24),
        paddingHorizontal: responsiveSpacing(16),
        paddingVertical: responsiveSpacing(8),
      }}
    >
      <View className="flex-row items-center">
        <View
          style={{
            width: responsiveSize(8),
            height: responsiveSize(8),
            borderRadius: responsiveSize(4),
            backgroundColor: statusData.color,
            marginRight: responsiveSpacing(8),
          }}
        />
        <ThemedText 
          className="font-semibold" 
          style={{ 
            color: statusData.color,
            fontSize: statusFontSize
          }}
        >
          {statusData.text}
        </ThemedText>
      </View>
    </View>
  );
});

