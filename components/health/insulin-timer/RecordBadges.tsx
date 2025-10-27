import { ThemedText } from '@/components/themed-text';
import { useResponsive } from '@/hooks/use-responsive';
import { Calendar } from 'lucide-react-native';
import React from 'react';
import { Dimensions, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface RecordBadgesProps {
  formattedDate: string | null;
  insulinInjected: boolean;
}

export const RecordBadges = React.memo(function RecordBadges({ 
  formattedDate, 
  insulinInjected 
}: RecordBadgesProps) {
  const { responsiveSize, responsiveFontSize, responsiveSpacing } = useResponsive();

  return (
    <View 
      style={{
        width: screenWidth - responsiveSpacing(64),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: responsiveSpacing(50),
      }}
    >
      {/* 레코드 생성일시 배지 또는 "레코드 없음" 메시지 */}
      {formattedDate ? (
        <View 
          style={{
            paddingHorizontal: responsiveSpacing(12),
            paddingVertical: responsiveSpacing(6),
            backgroundColor: '#f0f9ff',
            borderRadius: responsiveSize(20),
            borderWidth: 1,
            borderColor: '#e0f2fe',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Calendar size={responsiveFontSize(16)} color="#0369a1" style={{ marginRight: 6 }} />
          <ThemedText 
            style={{ 
              fontSize: responsiveFontSize(12),
              color: '#0369a1',
              fontWeight: '600',
            }}
          >
            {formattedDate}
          </ThemedText>
        </View>
      ) : (
        <View 
          style={{
            paddingHorizontal: responsiveSpacing(12),
            paddingVertical: responsiveSpacing(6),
            backgroundColor: '#fef2f2',
            borderRadius: responsiveSize(20),
            borderWidth: 1,
            borderColor: '#fee2e2',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Calendar size={responsiveFontSize(16)} color="#dc2626" style={{ marginRight: 6 }} />
          <ThemedText 
            style={{ 
              fontSize: responsiveFontSize(12),
              color: '#dc2626',
              fontWeight: '600',
            }}
          >
            No scheduled insulin record
          </ThemedText>
        </View>
      )}

      {/* 인슐린 접종 여부 배지 */}
      <View 
        style={{
          paddingHorizontal: responsiveSpacing(12),
          paddingVertical: responsiveSpacing(6),
          backgroundColor: insulinInjected ? '#f0fdf4' : '#fef2f2',
          borderRadius: responsiveSize(20),
          borderWidth: 1,
          borderColor: insulinInjected ? '#dcfce7' : '#fee2e2',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: responsiveSize(8),
            height: responsiveSize(8),
            borderRadius: responsiveSize(4),
            backgroundColor: insulinInjected ? '#22c55e' : '#ef4444',
            marginRight: responsiveSpacing(6),
          }}
        />
        <ThemedText 
          style={{ 
            fontSize: responsiveFontSize(12),
            color: insulinInjected ? '#16a34a' : '#dc2626',
            fontWeight: '600',
          }}
        >
          {insulinInjected ? 'Injected' : 'Not Injected'}
        </ThemedText>
      </View>
    </View>
  );
});

