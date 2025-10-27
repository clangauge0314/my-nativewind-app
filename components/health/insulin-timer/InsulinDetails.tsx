import { useResponsive } from '@/hooks/use-responsive';
import { InsulinData } from '@/types/insulin-timer';
import React from 'react';
import { Dimensions, View } from 'react-native';
import { CalculationDetails } from './CalculationDetails';
import { DataGrid } from './DataGrid';
import { RecommendedDoseCard } from './RecommendedDoseCard';

const { width: screenWidth } = Dimensions.get('window');

interface InsulinDetailsProps {
  formattedDate: string | null;
  insulinData: InsulinData;
  bloodGlucose: number;
  carbohydrates: number;
  targetGlucose: number;
  totalSeconds: number;
  insulinRatio: number;
  correctionFactor: number;
}

export const InsulinDetails = React.memo(function InsulinDetails({
  formattedDate,
  insulinData,
  bloodGlucose,
  carbohydrates,
  targetGlucose,
  totalSeconds,
  insulinRatio,
  correctionFactor,
}: InsulinDetailsProps) {
  const { responsiveSpacing } = useResponsive();

  return (
    <View style={{ 
      width: screenWidth - responsiveSpacing(64), 
      marginBottom: responsiveSpacing(24),
    }}>
      <RecommendedDoseCard 
        formattedDate={formattedDate}
        insulinData={insulinData}
      />
      
      <DataGrid 
        formattedDate={formattedDate}
        bloodGlucose={bloodGlucose}
        carbohydrates={carbohydrates}
        targetGlucose={targetGlucose}
        totalSeconds={totalSeconds}
      />
      
      <CalculationDetails 
        formattedDate={formattedDate}
        insulinData={insulinData}
        carbohydrates={carbohydrates}
        insulinRatio={insulinRatio}
        bloodGlucose={bloodGlucose}
        targetGlucose={targetGlucose}
        correctionFactor={correctionFactor}
      />
    </View>
  );
});

