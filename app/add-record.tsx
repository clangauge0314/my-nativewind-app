import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useResponsive } from '@/hooks/use-responsive';
import { useAuthStore } from '@/stores/auth-store';
import { InsulinPredictionFormData, InsulinPredictionRecord } from '@/types/health-record';
import firestore from '@react-native-firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Activity, ChevronLeft, Save } from 'lucide-react-native';
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

export default function AddRecordScreen() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const { responsiveSize, responsiveFontSize, responsiveSpacing } = useResponsive();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecord, setIsLoadingRecord] = useState(false);
  const [formData, setFormData] = useState<InsulinPredictionFormData>({
    currentGlucose: '',
    carbohydrates: '0',
    targetGlucose: '100',
    insulinRatio: '15',
    correctionFactor: '50',
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

  // Load record if ID is provided
  useEffect(() => {
    const loadRecord = async () => {
      if (!params.id || !user) return;
      
      setIsLoadingRecord(true);
      try {
        const docSnapshot = await firestore()
          .collection('insulin_records')
          .doc(params.id)
          .get();

        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as InsulinPredictionRecord;
          
          if (data.user_id === user.uid) {
            setFormData({
              currentGlucose: data.current_glucose.toString(),
              carbohydrates: data.carbohydrates.toString(),
              targetGlucose: data.target_glucose.toString(),
              insulinRatio: data.insulin_ratio.toString(),
              correctionFactor: data.correction_factor.toString(),
              mealType: data.meal_type,
              notes: data.notes || '',
            });
          }
        }
      } catch (error) {
        console.error('Error loading record:', error);
        Alert.alert('Error', 'Failed to load record.');
      } finally {
        setIsLoadingRecord(false);
      }
    };

    loadRecord();
  }, [params.id, user]);

  const handleInputChange = useCallback((field: keyof InsulinPredictionFormData, value: string) => {
    // If the current value is '0' and user types a number, replace '0' with the new number
    setFormData(prev => {
      const currentValue = prev[field];
      if (currentValue === '0' && value.length === 1 && /[0-9]/.test(value)) {
        return { ...prev, [field]: value };
      }
      return { ...prev, [field]: value };
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!user) {
      Alert.alert('Error', 'Login required.');
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

      // Round to 1 decimal place and ensure values are within reasonable bounds
      const carbInsulinRounded = Math.min(Math.round(carbInsulin * 10) / 10, 9999.9);
      const correctionInsulinRounded = Math.min(Math.round(correctionInsulin * 10) / 10, 9999.9);
      const totalInsulinRounded = Math.min(Math.round(totalInsulin * 10) / 10, 9999.9);

      const recordData = {
        user_id: user.uid,
        current_glucose: currentGlucose,
        carbohydrates: carbohydrates,
        target_glucose: targetGlucose,
        insulin_ratio: insulinRatio,
        correction_factor: correctionFactor,
        carb_insulin: carbInsulinRounded,
        correction_insulin: correctionInsulinRounded,
        total_insulin: totalInsulinRounded,
        insulin_injected: true,  // ✅ 인슐린 투여 완료
        injected_at: firestore.FieldValue.serverTimestamp(),  // ✅ Firestore timestamp
        meal_type: formData.mealType,
        notes: formData.notes || null,
      };

      if (params.id) {
        await firestore()
          .collection('insulin_records')
          .doc(params.id)
          .update({
            ...recordData,
            updated_at: firestore.FieldValue.serverTimestamp(),
          });
      } else {
        await firestore()
          .collection('insulin_records')
          .add({
            ...recordData,
            created_at: firestore.FieldValue.serverTimestamp(),
            updated_at: firestore.FieldValue.serverTimestamp(),
          });
      }

      const successMessage = params.id 
        ? 'Insulin prediction record updated.' 
        : 'Insulin prediction record saved.';
      
      Alert.alert('Success', successMessage, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [user, formData, router, params.id]);

  if (isLoadingRecord) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText>Loading record...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Header */}
      <View
        className="px-6 pb-4 border-b border-gray-200"
        style={{
          paddingTop: insets.top + 16,
          backgroundColor: '#ffffff',
        }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#f3f4f6' : 'transparent',
            })}
          >
            <ChevronLeft size={28} color="#1f2937" strokeWidth={2} />
          </Pressable>

          <View className="flex-row items-center">
            <Activity size={24} color="#2563eb" strokeWidth={2} />
            <ThemedText className="ml-3 font-bold" style={{ fontSize: 22 }}>
              {params.id ? 'Edit Record' : 'Blood Sugar Record'}
            </ThemedText>
          </View>

          <View style={{ width: 40 }} />
        </View>
      </View>

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
                  onFocus={(e) => {
                    if (formData.carbohydrates === '0') {
                      e.target.setNativeProps({ selection: { start: 0, end: 1 } });
                    }
                  }}
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

          {/* Notes */}
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
              Notes
            </ThemedText>
            
            <TextInput
              value={formData.notes}
              onChangeText={(text) => handleInputChange('notes', text)}
              placeholder="Enter additional notes..."
              placeholderTextColor="#9ca3af"
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
                color: '#1f2937',
              }}
            />
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
              {isLoading ? 'Saving...' : 'Save Record'}
            </ThemedText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
