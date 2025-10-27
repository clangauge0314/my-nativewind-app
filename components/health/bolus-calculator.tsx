import { ThemedText } from '@/components/themed-text';
import { useHealthStore } from '@/stores/health-store';
import { BolusCalculatorResult } from '@/types/health';
import { calculateBolusInsulin, calculateIOB } from '@/utils/diabetes-calculator';
import { Activity, AlertTriangle, Calculator, TrendingUp } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

export function BolusCalculator() {
  const { settings, insulinEntries } = useHealthStore();
  
  const [currentBG, setCurrentBG] = useState('');
  const [carbs, setCarbs] = useState('');
  const [result, setResult] = useState<BolusCalculatorResult | null>(null);

  const handleCalculate = () => {
    const bgValue = parseFloat(currentBG);
    const carbValue = parseFloat(carbs);
    
    if (isNaN(bgValue) || isNaN(carbValue)) {
      return;
    }
    
    // Calculate IOB
    const recentInsulin = insulinEntries.filter(
      (entry) => Date.now() - entry.timestamp < entry.duration * 60 * 60 * 1000
    );
    const iobResult = calculateIOB(recentInsulin);
    
    // Calculate bolus
    const bolusResult = calculateBolusInsulin({
      currentBloodGlucose: bgValue,
      targetBloodGlucose: settings.targetBloodGlucose,
      carbs: carbValue,
      insulinSensitivityFactor: settings.insulinSensitivityFactor,
      carbRatio: settings.carbRatio,
      activeInsulin: iobResult.totalIOB,
    });
    
    setResult(bolusResult);
  };

  return (
    <View
      className="rounded-2xl p-6 mb-6"
      style={{
        backgroundColor: '#ffffff',
        borderWidth: 0,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: '#eff6ff' }}
        >
          <Calculator size={24} color="#2563eb" />
        </View>
        <View className="flex-1">
          <ThemedText className="text-xl font-bold">
            Bolus Calculator
          </ThemedText>
          <ThemedText className="text-xs opacity-60">
            Insulin dose recommendation
          </ThemedText>
        </View>
      </View>

      {/* Input Fields */}
      <View style={{ gap: 16 }} className="mb-6">
        {/* Current Blood Glucose */}
        <View>
          <ThemedText className="text-sm font-semibold mb-2">
            Current Blood Glucose ({settings.units})
          </ThemedText>
          <View
            className="flex-row items-center px-4 py-3 rounded-xl"
            style={{
              backgroundColor: '#ffffff',
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          >
            <Activity size={20} color={'#6b7280'} />
            <TextInput
              value={currentBG}
              onChangeText={setCurrentBG}
              placeholder="Enter BG value"
              placeholderTextColor={'#9ca3af'}
              keyboardType="numeric"
              className="flex-1 ml-3"
              style={{ 
                color: '#000000',
                fontSize: 16,
              }}
            />
          </View>
        </View>

        {/* Carbs */}
        <View>
          <ThemedText className="text-sm font-semibold mb-2">
            Carbohydrates (grams)
          </ThemedText>
          <View
            className="flex-row items-center px-4 py-3 rounded-xl"
            style={{
              backgroundColor: '#ffffff',
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          >
            <TrendingUp size={20} color={'#6b7280'} />
            <TextInput
              value={carbs}
              onChangeText={setCarbs}
              placeholder="Enter carbs"
              placeholderTextColor={'#9ca3af'}
              keyboardType="numeric"
              className="flex-1 ml-3"
              style={{ 
                color: '#000000',
                fontSize: 16,
              }}
            />
          </View>
        </View>
      </View>

      {/* Calculate Button */}
      <Pressable
        onPress={handleCalculate}
        className="py-4 rounded-2xl mb-6"
        style={({ pressed }) => ({
          backgroundColor: pressed ? '#1d4ed8' : '#2563eb',
          opacity: (!currentBG || !carbs) ? 0.5 : 1,
        })}
        disabled={!currentBG || !carbs}
      >
        <ThemedText className="text-center text-base font-bold text-white">
          Calculate Dose
        </ThemedText>
      </Pressable>

      {/* Result */}
      {result && (
        <View
          className="p-5 rounded-2xl"
          style={{
            backgroundColor: result.warning 
              ? ('#fee2e2')
              : ('#dbeafe'),
          }}
        >
          {/* Warning */}
          {result.warning && (
            <View className="flex-row items-start mb-4 pb-4" style={{ borderBottomWidth: 1, borderBottomColor: '#fecaca' }}>
              <AlertTriangle size={20} color="#ef4444" />
              <ThemedText className="flex-1 ml-3 text-sm" style={{ color: '#ef4444' }}>
                {result.warning}
              </ThemedText>
            </View>
          )}

          {/* Recommended Dose */}
          <View className="items-center mb-4">
            <ThemedText className="text-sm opacity-80 mb-2">
              Recommended Insulin Dose
            </ThemedText>
            <ThemedText className="text-4xl font-bold" style={{ color: '#2563eb' }}>
              {result.finalRecommendation} units
            </ThemedText>
          </View>

          {/* Breakdown */}
          <View style={{ gap: 8 }}>
            <View className="flex-row justify-between">
              <ThemedText className="text-sm opacity-70">
                Correction Dose:
              </ThemedText>
              <ThemedText className="text-sm font-semibold">
                {result.correctionDose} u
              </ThemedText>
            </View>
            <View className="flex-row justify-between">
              <ThemedText className="text-sm opacity-70">
                Carb Dose:
              </ThemedText>
              <ThemedText className="text-sm font-semibold">
                {result.carbDose} u
              </ThemedText>
            </View>
            <View className="flex-row justify-between">
              <ThemedText className="text-sm opacity-70">
                IOB Adjustment:
              </ThemedText>
              <ThemedText className="text-sm font-semibold">
                -{result.iobAdjustment} u
              </ThemedText>
            </View>
          </View>
        </View>
      )}

      {/* Info */}
      <View className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#f3f4f6' }}>
        <ThemedText className="text-xs opacity-60 text-center">
          Always consult your doctor. This is an estimate based on your settings.
        </ThemedText>
      </View>
    </View>
  );
}

