import { ThemedText } from '@/components/themed-text';
import { useResponsive } from '@/hooks/use-responsive';
import { InsulinData } from '@/types/insulin-timer';
import React from 'react';
import { View } from 'react-native';

interface CalculationDetailsProps {
  formattedDate: string | null;
  insulinData: InsulinData;
  carbohydrates: number;
  insulinRatio: number;
  bloodGlucose: number;
  targetGlucose: number;
  correctionFactor: number;
}

export const CalculationDetails = React.memo(function CalculationDetails({
  formattedDate,
  insulinData,
  carbohydrates,
  insulinRatio,
  bloodGlucose,
  targetGlucose,
  correctionFactor,
}: CalculationDetailsProps) {
  const { responsiveSize, responsiveFontSize, responsiveSpacing } = useResponsive();

  return (
    <View 
      style={{
        marginTop: responsiveSpacing(32),
        padding: responsiveSpacing(24),
        backgroundColor: '#f8fafc',
        borderRadius: responsiveSize(16),
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <ThemedText 
        className="font-bold mb-4"
        style={{ fontSize: responsiveFontSize(14), color: '#1e293b', fontWeight: '600' }}
      >
        Calculation Details
      </ThemedText>
      
      {/* 계산 항목들 - 개별 카드 스타일 */}
      <View style={{ gap: responsiveSpacing(8) }}>
        {/* Carb Insulin */}
        <View 
          className="flex-row items-center justify-between"
          style={{
            padding: responsiveSpacing(16),
            backgroundColor: '#ffffff',
            borderRadius: responsiveSize(12),
            borderWidth: 1,
            borderColor: '#e2e8f0',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <View className="flex-row items-center flex-1">
            <View 
              style={{
                width: responsiveSize(8),
                height: responsiveSize(8),
                borderRadius: responsiveSize(4),
                backgroundColor: '#3b82f6',
                marginRight: responsiveSpacing(12),
              }}
            />
            <View className="flex-1">
              <ThemedText 
                className="font-semibold"
                style={{ fontSize: responsiveFontSize(12), color: '#475569', fontWeight: '600' }}
              >
                Carb Insulin
              </ThemedText>
              <ThemedText 
                style={{ fontSize: responsiveFontSize(10), color: '#94a3b8', marginTop: 2 }}
              >
                {formattedDate ? `${carbohydrates}g ÷ ${insulinRatio}` : 'N/A'}
              </ThemedText>
            </View>
          </View>
          <ThemedText 
            className="font-bold"
            style={{ fontSize: responsiveFontSize(16), color: formattedDate ? '#1e293b' : '#94a3b8', fontWeight: '700' }}
          >
            {formattedDate ? `${insulinData.carbInsulin}u` : 'N/A'}
          </ThemedText>
        </View>

        {/* Correction */}
        <View 
          className="flex-row items-center justify-between"
          style={{
            padding: responsiveSpacing(16),
            backgroundColor: '#ffffff',
            borderRadius: responsiveSize(12),
            borderWidth: 1,
            borderColor: '#e2e8f0',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <View className="flex-row items-center flex-1">
            <View 
              style={{
                width: responsiveSize(8),
                height: responsiveSize(8),
                borderRadius: responsiveSize(4),
                backgroundColor: '#f59e0b',
                marginRight: responsiveSpacing(12),
              }}
            />
            <View className="flex-1">
              <ThemedText 
                className="font-semibold"
                style={{ fontSize: responsiveFontSize(12), color: '#475569', fontWeight: '600' }}
              >
                Correction
              </ThemedText>
              <ThemedText 
                style={{ fontSize: responsiveFontSize(10), color: '#94a3b8', marginTop: 2 }}
              >
                ({formattedDate ? bloodGlucose : 'N/A'} - {formattedDate ? targetGlucose : 'N/A'}) ÷ {formattedDate ? correctionFactor : 'N/A'}
              </ThemedText>
            </View>
          </View>
          <ThemedText 
            className="font-bold"
            style={{ fontSize: responsiveFontSize(16), color: formattedDate ? '#1e293b' : '#94a3b8', fontWeight: '700' }}
          >
            {formattedDate ? `${insulinData.correctionInsulin}u` : 'N/A'}
          </ThemedText>
        </View>

        <View 
          style={{
            height: 1,
            marginVertical: responsiveSpacing(4),
          }}
        />

        {/* Total Dose */}
        <View 
          className="flex-row items-center justify-between"
          style={{
            padding: responsiveSpacing(20),
            backgroundColor: '#eff6ff',
            borderRadius: responsiveSize(12),
            borderWidth: 2,
            borderColor: '#3b82f6',
            shadowColor: '#3b82f6',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <ThemedText 
            className="font-bold"
            style={{ fontSize: responsiveFontSize(14), color: '#1e40af', fontWeight: '700' }}
          >
            Total Dose
          </ThemedText>
          <ThemedText 
            className="font-bold"
            style={{ fontSize: responsiveFontSize(18), color: '#1e40af', fontWeight: '800' }}
          >
            {formattedDate ? `${insulinData.totalInsulin} units` : 'N/A'}
          </ThemedText>
        </View>
      </View>

      {/* 설정 정보 - 하단 카드 */}
      <View 
        style={{
          marginTop: responsiveSpacing(20),
          padding: responsiveSpacing(16),
          backgroundColor: '#ffffff',
          borderRadius: responsiveSize(12),
          borderWidth: 1,
          borderColor: '#e2e8f0',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        <View className="flex-row justify-between">
          <View>
            <ThemedText 
              style={{ fontSize: responsiveFontSize(9), color: '#94a3b8', fontWeight: '500' }}
            >
              Insulin Ratio
            </ThemedText>
            <ThemedText 
              className="font-semibold"
              style={{ fontSize: responsiveFontSize(10), color: '#475569' }}
            >
              1:{insulinRatio}g
            </ThemedText>
          </View>
          <View>
            <ThemedText 
              style={{ fontSize: responsiveFontSize(9), color: '#94a3b8', fontWeight: '500' }}
            >
              Correction Factor
            </ThemedText>
            <ThemedText 
              className="font-semibold"
              style={{ fontSize: responsiveFontSize(10), color: '#475569' }}
            >
              1:{correctionFactor}mg/dL
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
});

