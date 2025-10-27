import { ThemedText } from '@/components/themed-text';
import { useResponsive } from '@/hooks/use-responsive';
import React from 'react';
import { View } from 'react-native';

interface DataGridProps {
  formattedDate: string | null;
  bloodGlucose: number;
  carbohydrates: number;
  targetGlucose: number;
  totalSeconds: number;
}

export const DataGrid = React.memo(function DataGrid({
  formattedDate,
  bloodGlucose,
  carbohydrates,
  targetGlucose,
  totalSeconds,
}: DataGridProps) {
  const { responsiveSize, responsiveFontSize, responsiveSpacing } = useResponsive();

  const cardStyle = {
    padding: responsiveSpacing(20),
    backgroundColor: '#ffffff',
    borderRadius: responsiveSize(16),
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  };

  return (
    <View style={{ gap: responsiveSpacing(12) }}>
      {/* 첫 번째 행 */}
      <View className="flex-row" style={{ gap: responsiveSpacing(12) }}>
        {/* Blood Glucose 카드 */}
        <View className="flex-1" style={cardStyle}>
          <View 
            style={{
              width: responsiveSize(40),
              height: responsiveSize(40),
              borderRadius: responsiveSize(12),
              backgroundColor: '#dbeafe',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: responsiveSpacing(12),
            }}
          >
            <ThemedText style={{ fontSize: responsiveFontSize(20) }}>💉</ThemedText>
          </View>
          <ThemedText 
            className="font-bold mb-1"
            style={{ fontSize: responsiveFontSize(24), color: formattedDate ? '#1e293b' : '#94a3b8', fontWeight: '700' }}
          >
            {formattedDate ? bloodGlucose : 'N/A'}
          </ThemedText>
          <ThemedText 
            style={{ fontSize: responsiveFontSize(12), color: '#64748b', fontWeight: '600', marginBottom: 4 }}
          >
            Blood Glucose
          </ThemedText>
          <ThemedText 
            className="font-semibold"
            style={{ fontSize: responsiveFontSize(10), color: '#94a3b8' }}
          >
            mg/dL
          </ThemedText>
        </View>

        {/* Carbohydrates 카드 */}
        <View className="flex-1" style={cardStyle}>
          <View 
            style={{
              width: responsiveSize(40),
              height: responsiveSize(40),
              borderRadius: responsiveSize(12),
              backgroundColor: '#fef3c7',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: responsiveSpacing(12),
            }}
          >
            <ThemedText style={{ fontSize: responsiveFontSize(20) }}>🍞</ThemedText>
          </View>
          <ThemedText 
            className="font-bold mb-1"
            style={{ fontSize: responsiveFontSize(24), color: formattedDate ? '#1e293b' : '#94a3b8', fontWeight: '700' }}
          >
            {formattedDate ? carbohydrates : 'N/A'}
          </ThemedText>
          <ThemedText 
            style={{ fontSize: responsiveFontSize(12), color: '#64748b', fontWeight: '600', marginBottom: 4 }}
          >
            Carbohydrates
          </ThemedText>
          <ThemedText 
            className="font-semibold"
            style={{ fontSize: responsiveFontSize(10), color: '#94a3b8' }}
          >
            grams
          </ThemedText>
        </View>
      </View>

      {/* 두 번째 행 */}
      <View className="flex-row" style={{ gap: responsiveSpacing(12) }}>
        {/* Target Level 카드 */}
        <View className="flex-1" style={cardStyle}>
          <View 
            style={{
              width: responsiveSize(40),
              height: responsiveSize(40),
              borderRadius: responsiveSize(12),
              backgroundColor: '#dcfce7',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: responsiveSpacing(12),
            }}
          >
            <ThemedText style={{ fontSize: responsiveFontSize(20) }}>🎯</ThemedText>
          </View>
          <ThemedText 
            className="font-bold mb-1"
            style={{ fontSize: responsiveFontSize(24), color: formattedDate ? '#1e293b' : '#94a3b8', fontWeight: '700' }}
          >
            {formattedDate ? targetGlucose : 'N/A'}
          </ThemedText>
          <ThemedText 
            style={{ fontSize: responsiveFontSize(12), color: '#64748b', fontWeight: '600', marginBottom: 4 }}
          >
            Target Level
          </ThemedText>
          <ThemedText 
            className="font-semibold"
            style={{ fontSize: responsiveFontSize(10), color: '#94a3b8' }}
          >
            mg/dL
          </ThemedText>
        </View>

        {/* Timer Duration 카드 */}
        <View className="flex-1" style={cardStyle}>
          <View 
            style={{
              width: responsiveSize(40),
              height: responsiveSize(40),
              borderRadius: responsiveSize(12),
              backgroundColor: '#f3e8ff',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: responsiveSpacing(20),
            }}
          >
            <ThemedText style={{ fontSize: responsiveFontSize(20) }}>⏱️</ThemedText>
          </View>
          <ThemedText 
            className="font-bold mb-1"
            style={{ fontSize: responsiveFontSize(24), color: formattedDate ? '#1e293b' : '#94a3b8', fontWeight: '700' }}
          >
            {formattedDate ? Math.floor(totalSeconds / 60) : 'N/A'}
          </ThemedText>
          <ThemedText 
            style={{ fontSize: responsiveFontSize(12), color: '#64748b', fontWeight: '600', marginBottom: 4 }}
          >
            Timer Duration
          </ThemedText>
          <ThemedText 
            className="font-semibold"
            style={{ fontSize: responsiveFontSize(10), color: '#94a3b8' }}
          >
            minutes
          </ThemedText>
        </View>
      </View>
    </View>
  );
});

