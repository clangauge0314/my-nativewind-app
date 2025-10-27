import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useResponsive } from '@/hooks/use-responsive';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { useTimerStore } from '@/stores/timer-store';
import { InsulinPredictionFormData, MEAL_TYPES, TIMER_DURATIONS } from '@/types/health-record';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Save } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditRecordScreen() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { responsiveSize, responsiveFontSize, responsiveSpacing } = useResponsive();
  
  // Get timer store to update timer duration if changed
  const { recordId, startTimer } = useTimerStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(true);
  const [formData, setFormData] = useState<InsulinPredictionFormData>({
    currentGlucose: '',
    carbohydrates: '0',
    targetGlucose: '100',
    insulinRatio: '15',
    correctionFactor: '50',
    timerDuration: '1',
    isCustomTimer: false,
    mealType: 'breakfast',
    notes: '',
  });

  const calculatedInsulin = useMemo(() => {
    const currentGlucose = Number(formData.currentGlucose) || 0;
    const carbohydrates = Number(formData.carbohydrates) || 0;
    const targetGlucose = Number(formData.targetGlucose) || 100;
    const insulinRatio = Number(formData.insulinRatio) || 15;
    const correctionFactor = Number(formData.correctionFactor) || 50;

    if (currentGlucose === 0) return null;

    const carbInsulin = carbohydrates / insulinRatio;
    const correctionInsulin = Math.max(0, (currentGlucose - targetGlucose) / correctionFactor);
    const totalInsulin = carbInsulin + correctionInsulin;

    return {
      carbInsulin: Math.round(carbInsulin * 10) / 10,
      correctionInsulin: Math.round(correctionInsulin * 10) / 10,
      totalInsulin: Math.round(totalInsulin * 10) / 10,
    };
  }, [formData]);

  // Load record
  useEffect(() => {
    const loadRecord = async () => {
      if (!params.id || !user) {
        router.back();
        return;
      }
      
      setIsLoadingRecord(true);
      try {
        const { data, error } = await supabase
          .from('insulin_prediction_records')
          .select('*')
          .eq('id', params.id)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            currentGlucose: data.current_glucose.toString(),
            carbohydrates: data.carbohydrates.toString(),
            targetGlucose: data.target_glucose.toString(),
            insulinRatio: data.insulin_ratio.toString(),
            correctionFactor: data.correction_factor.toString(),
            timerDuration: data.timer_duration_minutes?.toString() || '1',
            isCustomTimer: false,
            mealType: data.meal_type,
            notes: data.notes || '',
          });
        }
      } catch (error) {
        console.error('Error loading record:', error);
        Alert.alert('Error', 'Failed to load record.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } finally {
        setIsLoadingRecord(false);
      }
    };

    loadRecord();
  }, [params.id, user, router]);

  const handleInputChange = useCallback((field: keyof InsulinPredictionFormData, value: string) => {
    setFormData(prev => {
      const currentValue = prev[field];
      if (currentValue === '0' && value.length === 1 && /[0-9]/.test(value)) {
        return { ...prev, [field]: value };
      }
      return { ...prev, [field]: value };
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!user || !params.id) {
      Alert.alert('Error', 'Invalid request.');
      return;
    }

    if (!formData.currentGlucose || isNaN(Number(formData.currentGlucose))) {
      Alert.alert('Error', 'Please enter a valid blood glucose value.');
      return;
    }

    setIsLoading(true);
    
    try {
      const currentGlucose = Number(formData.currentGlucose);
      const carbohydrates = Number(formData.carbohydrates);
      const targetGlucose = Number(formData.targetGlucose);
      const insulinRatio = Number(formData.insulinRatio);
      const correctionFactor = Number(formData.correctionFactor);

      const carbInsulin = carbohydrates / insulinRatio;
      const correctionInsulin = Math.max(0, (currentGlucose - targetGlucose) / correctionFactor);
      const totalInsulin = carbInsulin + correctionInsulin;

      const carbInsulinRounded = Math.min(Math.round(carbInsulin * 10) / 10, 9999.9);
      const correctionInsulinRounded = Math.min(Math.round(correctionInsulin * 10) / 10, 9999.9);
      const totalInsulinRounded = Math.min(Math.round(totalInsulin * 10) / 10, 9999.9);

      const timerDuration = formData.isCustomTimer && formData.timerDuration 
        ? Number(formData.timerDuration) 
        : Number(formData.timerDuration) || 1;

      const recordData = {
        user_id: user.id,
        current_glucose: currentGlucose,
        carbohydrates: carbohydrates,
        target_glucose: targetGlucose,
        insulin_ratio: insulinRatio,
        correction_factor: correctionFactor,
        carb_insulin: carbInsulinRounded,
        correction_insulin: correctionInsulinRounded,
        total_insulin: totalInsulinRounded,
        timer_duration_minutes: timerDuration,
        meal_type: formData.mealType,
        notes: formData.notes || null,
        // Reset insulin injection status when editing
        insulin_injected: false,
        injected_at: null,
      };

      const { error } = await supabase
        .from('insulin_prediction_records')
        .update(recordData)
        .eq('id', params.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Database error:', error);
        Alert.alert('Error', 'An error occurred while updating data.');
        return;
      }

      // If this record is currently active in the timer, update the timer duration
      console.log('💾 Edit record saved:', {
        recordId,
        paramsId: params.id,
        timerDuration,
        willStartTimer: recordId === params.id,
      });
      
      if (recordId === params.id) {
        const timerSeconds = timerDuration * 60;
        console.log('▶️ Starting timer from edit-record:', { timerSeconds });
        startTimer(params.id, timerSeconds);
      }

      Alert.alert('Success', 'Record updated successfully.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [user, formData, router, params.id, recordId, startTimer]);

  if (isLoadingRecord) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText>Loading record...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: responsiveSpacing(20),
            paddingBottom: insets.bottom + responsiveSpacing(120),
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Patient Status */}
          <View 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: responsiveSize(12),
              padding: responsiveSpacing(20),
              marginBottom: responsiveSpacing(24),
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          >
            <ThemedText 
              style={{ 
                fontSize: responsiveFontSize(16), 
                color: '#1f2937',
                fontWeight: 'bold',
                marginBottom: responsiveSpacing(16),
              }}
            >
              Patient Status
            </ThemedText>
            
            {/* Current Blood Glucose */}
            <View style={{ marginBottom: responsiveSpacing(16) }}>
              <ThemedText style={{ fontSize: responsiveFontSize(14), color: '#374151', marginBottom: 8 }}>
                Current Blood Glucose *
              </ThemedText>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  value={formData.currentGlucose}
                  onChangeText={(text) => handleInputChange('currentGlucose', text)}
                  placeholder="120"
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    padding: responsiveSpacing(12),
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    borderRadius: responsiveSize(8),
                    fontSize: responsiveFontSize(16),
                    backgroundColor: '#ffffff',
                  }}
                />
                <ThemedText style={{ marginLeft: 8, fontSize: responsiveFontSize(14), color: '#6b7280' }}>
                  mg/dL
                </ThemedText>
              </View>
            </View>

            {/* Carbohydrates */}
            <View style={{ marginBottom: responsiveSpacing(16) }}>
              <ThemedText style={{ fontSize: responsiveFontSize(14), color: '#374151', marginBottom: 8 }}>
                Carbohydrates to Consume
              </ThemedText>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  value={formData.carbohydrates}
                  onChangeText={(text) => handleInputChange('carbohydrates', text)}
                  placeholder="0"
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    padding: responsiveSpacing(12),
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    borderRadius: responsiveSize(8),
                    fontSize: responsiveFontSize(16),
                    backgroundColor: '#ffffff',
                  }}
                />
                <ThemedText style={{ marginLeft: 8, fontSize: responsiveFontSize(14), color: '#6b7280' }}>
                  g
                </ThemedText>
              </View>
            </View>

            {/* Target Blood Glucose */}
            <View>
              <ThemedText style={{ fontSize: responsiveFontSize(14), color: '#374151', marginBottom: 8 }}>
                Target Blood Glucose
              </ThemedText>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  value={formData.targetGlucose}
                  onChangeText={(text) => handleInputChange('targetGlucose', text)}
                  placeholder="100"
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    padding: responsiveSpacing(12),
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    borderRadius: responsiveSize(8),
                    fontSize: responsiveFontSize(16),
                    backgroundColor: '#ffffff',
                  }}
                />
                <ThemedText style={{ marginLeft: 8, fontSize: responsiveFontSize(14), color: '#6b7280' }}>
                  mg/dL
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Patient Settings */}
          <View 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: responsiveSize(12),
              padding: responsiveSpacing(20),
              marginBottom: responsiveSpacing(24),
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          >
            <ThemedText 
              style={{ 
                fontSize: responsiveFontSize(16), 
                color: '#1f2937',
                fontWeight: 'bold',
                marginBottom: responsiveSpacing(16),
              }}
            >
              Patient Settings
            </ThemedText>
            
            {/* Insulin Ratio */}
            <View style={{ marginBottom: responsiveSpacing(16) }}>
              <ThemedText style={{ fontSize: responsiveFontSize(14), color: '#374151', marginBottom: 8 }}>
                Insulin Ratio
              </ThemedText>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  value={formData.insulinRatio}
                  onChangeText={(text) => handleInputChange('insulinRatio', text)}
                  placeholder="15"
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    padding: responsiveSpacing(12),
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    borderRadius: responsiveSize(8),
                    fontSize: responsiveFontSize(16),
                    backgroundColor: '#ffffff',
                  }}
                />
                <ThemedText style={{ marginLeft: 8, fontSize: responsiveFontSize(14), color: '#6b7280' }}>
                  g/unit
                </ThemedText>
              </View>
            </View>

            {/* Correction Factor */}
            <View>
              <ThemedText style={{ fontSize: responsiveFontSize(14), color: '#374151', marginBottom: 8 }}>
                Correction Factor
              </ThemedText>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  value={formData.correctionFactor}
                  onChangeText={(text) => handleInputChange('correctionFactor', text)}
                  placeholder="50"
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    padding: responsiveSpacing(12),
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    borderRadius: responsiveSize(8),
                    fontSize: responsiveFontSize(16),
                    backgroundColor: '#ffffff',
                  }}
                />
                <ThemedText style={{ marginLeft: 8, fontSize: responsiveFontSize(14), color: '#6b7280' }}>
                  mg/dL/unit
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Timer Settings */}
          <View 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: responsiveSize(12),
              padding: responsiveSpacing(20),
              marginBottom: responsiveSpacing(24),
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          >
            <ThemedText 
              style={{ 
                fontSize: responsiveFontSize(16), 
                color: '#1f2937',
                fontWeight: 'bold',
                marginBottom: responsiveSpacing(16),
              }}
            >
              Timer Duration
            </ThemedText>
            
            <View style={{ marginBottom: responsiveSpacing(16) }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {TIMER_DURATIONS.filter(d => d.value !== 0).map((duration) => (
                  <Pressable
                    key={duration.value}
                    onPress={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        timerDuration: duration.value.toString(),
                        isCustomTimer: false
                      }));
                    }}
                    style={{
                      paddingHorizontal: responsiveSpacing(16),
                      paddingVertical: responsiveSpacing(8),
                      borderRadius: responsiveSize(20),
                      borderWidth: 1,
                      borderColor: formData.timerDuration === duration.value.toString() && !formData.isCustomTimer ? '#2563eb' : '#d1d5db',
                      backgroundColor: formData.timerDuration === duration.value.toString() && !formData.isCustomTimer ? '#eff6ff' : '#ffffff',
                    }}
                  >
                    <ThemedText 
                      style={{ 
                        fontSize: responsiveFontSize(14),
                        color: formData.timerDuration === duration.value.toString() && !formData.isCustomTimer ? '#2563eb' : '#6b7280'
                      }}
                    >
                      {duration.label}
                    </ThemedText>
                  </Pressable>
                ))}
                <Pressable
                  onPress={() => {
                    setFormData(prev => ({ 
                      ...prev, 
                      isCustomTimer: true,
                      timerDuration: ''
                    }));
                  }}
                  style={{
                    paddingHorizontal: responsiveSpacing(16),
                    paddingVertical: responsiveSpacing(8),
                    borderRadius: responsiveSize(20),
                    borderWidth: 1,
                    borderColor: formData.isCustomTimer ? '#2563eb' : '#d1d5db',
                    backgroundColor: formData.isCustomTimer ? '#eff6ff' : '#ffffff',
                  }}
                >
                  <ThemedText 
                    style={{ 
                      fontSize: responsiveFontSize(14),
                      color: formData.isCustomTimer ? '#2563eb' : '#6b7280'
                    }}
                  >
                    Custom
                  </ThemedText>
                </Pressable>
              </View>
            </View>

            {formData.isCustomTimer && (
              <View>
                <ThemedText style={{ fontSize: responsiveFontSize(14), color: '#374151', marginBottom: 8 }}>
                  Custom Duration (minutes)
                </ThemedText>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    value={formData.timerDuration}
                    onChangeText={(text) => handleInputChange('timerDuration', text)}
                    placeholder="Enter minutes"
                    keyboardType="numeric"
                    style={{
                      flex: 1,
                      padding: responsiveSpacing(12),
                      borderWidth: 1,
                      borderColor: '#d1d5db',
                      borderRadius: responsiveSize(8),
                      fontSize: responsiveFontSize(16),
                      backgroundColor: '#ffffff',
                    }}
                  />
                  <ThemedText style={{ marginLeft: 8, fontSize: responsiveFontSize(14), color: '#6b7280' }}>
                    min
                  </ThemedText>
                </View>
              </View>
            )}
          </View>

          {/* Insulin Dose Prediction */}
          {calculatedInsulin && (
            <View 
              style={{
                backgroundColor: '#f0f9ff',
                borderRadius: responsiveSize(12),
                padding: responsiveSpacing(20),
                marginBottom: responsiveSpacing(24),
                borderWidth: 2,
                borderColor: '#0ea5e9',
              }}
            >
              <ThemedText 
                style={{ 
                  fontSize: responsiveFontSize(16), 
                  color: '#0c4a6e',
                  fontWeight: 'bold',
                  marginBottom: responsiveSpacing(16),
                }}
              >
                💉 Insulin Dose Prediction
              </ThemedText>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <ThemedText style={{ fontSize: responsiveFontSize(14), color: '#0369a1' }}>
                  Carb Insulin
                </ThemedText>
                <ThemedText style={{ fontSize: responsiveFontSize(18), color: '#0c4a6e', fontWeight: 'bold' }}>
                  {calculatedInsulin.carbInsulin} units
                </ThemedText>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <ThemedText style={{ fontSize: responsiveFontSize(14), color: '#0369a1' }}>
                  Correction Insulin
                </ThemedText>
                <ThemedText style={{ fontSize: responsiveFontSize(18), color: '#0c4a6e', fontWeight: 'bold' }}>
                  {calculatedInsulin.correctionInsulin} units
                </ThemedText>
              </View>
              
              <View style={{ height: 1, backgroundColor: '#bae6fd', marginVertical: 12 }} />
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <ThemedText style={{ fontSize: responsiveFontSize(16), color: '#0c4a6e', fontWeight: 'bold' }}>
                  Total Insulin Dose
                </ThemedText>
                <ThemedText style={{ fontSize: responsiveFontSize(24), color: '#0c4a6e', fontWeight: 'bold' }}>
                  {calculatedInsulin.totalInsulin} units
                </ThemedText>
              </View>
            </View>
          )}

          {/* Additional Information */}
          <View 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: responsiveSize(12),
              padding: responsiveSpacing(20),
              marginBottom: responsiveSpacing(24),
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          >
            <ThemedText 
              style={{ 
                fontSize: responsiveFontSize(16), 
                color: '#1f2937',
                fontWeight: 'bold',
                marginBottom: responsiveSpacing(16),
              }}
            >
              Additional Information
            </ThemedText>
            
            {/* Meal Type */}
            <View style={{ marginBottom: responsiveSpacing(16) }}>
              <ThemedText style={{ fontSize: responsiveFontSize(14), color: '#374151', marginBottom: 8 }}>
                Meal Type
              </ThemedText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {MEAL_TYPES.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => handleInputChange('mealType', option.value)}
                    style={{
                      paddingHorizontal: responsiveSpacing(16),
                      paddingVertical: responsiveSpacing(8),
                      borderRadius: responsiveSize(20),
                      borderWidth: 1,
                      borderColor: formData.mealType === option.value ? '#2563eb' : '#d1d5db',
                      backgroundColor: formData.mealType === option.value ? '#eff6ff' : '#ffffff',
                    }}
                  >
                    <ThemedText 
                      style={{ 
                        fontSize: responsiveFontSize(14),
                        color: formData.mealType === option.value ? '#2563eb' : '#6b7280'
                      }}
                    >
                      {option.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View>
              <ThemedText style={{ fontSize: responsiveFontSize(14), color: '#374151', marginBottom: 8 }}>
                Notes
              </ThemedText>
              <TextInput
                value={formData.notes}
                onChangeText={(text) => handleInputChange('notes', text)}
                placeholder="Enter additional notes..."
                multiline
                numberOfLines={4}
                style={{
                  padding: responsiveSpacing(12),
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: responsiveSize(8),
                  fontSize: responsiveFontSize(16),
                  backgroundColor: '#ffffff',
                  textAlignVertical: 'top',
                }}
              />
            </View>
          </View>
        </ScrollView>

        {/* Bottom Save Button */}
        <View 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            paddingTop: responsiveSpacing(16),
            paddingBottom: insets.bottom + responsiveSpacing(16),
            paddingHorizontal: responsiveSpacing(20),
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
          }}
        >
          <Pressable
            onPress={handleSave}
            disabled={isLoading}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isLoading ? '#9ca3af' : '#2563eb',
              paddingVertical: responsiveSpacing(16),
              borderRadius: responsiveSize(12),
            }}
          >
            <Save size={20} color="#ffffff" />
            <ThemedText 
              style={{ 
                marginLeft: 8,
                fontSize: responsiveFontSize(16),
                color: '#ffffff',
                fontWeight: 'bold',
              }}
            >
              {isLoading ? 'Updating...' : 'Update Record'}
            </ThemedText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

