import { ThemedText } from '@/components/themed-text';
import { useResponsive } from '@/hooks/use-responsive';
import { InsulinData } from '@/types/insulin-timer';
import React from 'react';
import { View } from 'react-native';

interface RecommendedDoseCardProps {
  formattedDate: string | null;
  insulinData: InsulinData;
}

export const RecommendedDoseCard = React.memo(function RecommendedDoseCard({
  formattedDate,
  insulinData,
}: RecommendedDoseCardProps) {
  const { responsiveSize, responsiveFontSize, responsiveSpacing } = useResponsive();

  return (
    <View 
      style={{
        padding: responsiveSpacing(32),
        marginBottom: responsiveSpacing(20),
        backgroundColor: '#ffffff',
        borderRadius: responsiveSize(20),
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View 
        className="items-center justify-center"
        style={{ 
          minHeight: responsiveSize(120),
          paddingVertical: responsiveSpacing(16),
          paddingHorizontal: responsiveSpacing(8),
        }}
      >
        <ThemedText 
          style={{ 
            fontSize: responsiveFontSize(12), 
            color: '#64748b', 
            letterSpacing: 1.5, 
            fontWeight: '600',
            marginBottom: responsiveSpacing(8),
          }}
        >
          RECOMMENDED DOSE
        </ThemedText>
        <ThemedText 
          className="font-bold"
          style={{ 
            fontSize: responsiveFontSize(52), 
            color: formattedDate ? '#1e293b' : '#94a3b8', 
            letterSpacing: -2,
            lineHeight: responsiveFontSize(52) * 1.2,
            textAlign: 'center',
            marginVertical: responsiveSpacing(8),
          }}
        >
          {formattedDate ? insulinData.totalInsulin : 'N/A'}
        </ThemedText>
        <ThemedText 
          className="font-semibold"
          style={{ 
            fontSize: responsiveFontSize(16), 
            color: '#64748b', 
            letterSpacing: 0.5,
            lineHeight: responsiveFontSize(16) * 1.3,
            textAlign: 'center',
            marginTop: responsiveSpacing(4),
          }}
        >
          units of insulin
        </ThemedText>
      </View>
    </View>
  );
});

