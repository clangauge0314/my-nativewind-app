import { ThemedText } from '@/components/themed-text';
import { useHealthStore } from '@/stores/health-store';
import { Save, Settings } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

export function SettingsPanel() {
  const { settings, updateSettings } = useHealthStore();
  
  const [isf, setIsf] = useState(settings.insulinSensitivityFactor.toString());
  const [carbRatio, setCarbRatio] = useState(settings.carbRatio.toString());
  const [targetBG, setTargetBG] = useState(settings.targetBloodGlucose.toString());
  const [nightThreshold, setNightThreshold] = useState(settings.nightHypoThreshold.toString());

  const handleSave = () => {
    updateSettings({
      insulinSensitivityFactor: parseFloat(isf) || 50,
      carbRatio: parseFloat(carbRatio) || 10,
      targetBloodGlucose: parseFloat(targetBG) || 100,
      nightHypoThreshold: parseFloat(nightThreshold) || 70,
    });
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
        <Settings size={24} color="#2563eb" />
        <ThemedText className="text-xl font-bold ml-3">
          Diabetes Settings
        </ThemedText>
      </View>

      <View style={{ gap: 16 }}>
        {/* ISF */}
        <View>
          <ThemedText className="text-sm font-semibold mb-2">
            Insulin Sensitivity Factor (ISF)
          </ThemedText>
          <TextInput
            value={isf}
            onChangeText={setIsf}
            placeholder="50"
            placeholderTextColor={'#9ca3af'}
            keyboardType="numeric"
            className="px-4 py-3 rounded-xl"
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              fontSize: 16,
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          />
          <ThemedText className="text-xs opacity-60 mt-1">
            How much 1 unit lowers BG (mg/dL)
          </ThemedText>
        </View>

        {/* Carb Ratio */}
        <View>
          <ThemedText className="text-sm font-semibold mb-2">
            Insulin to Carb Ratio (I:C)
          </ThemedText>
          <TextInput
            value={carbRatio}
            onChangeText={setCarbRatio}
            placeholder="10"
            placeholderTextColor={'#9ca3af'}
            keyboardType="numeric"
            className="px-4 py-3 rounded-xl"
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              fontSize: 16,
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          />
          <ThemedText className="text-xs opacity-60 mt-1">
            Grams of carbs per 1 unit of insulin
          </ThemedText>
        </View>

        {/* Target BG */}
        <View>
          <ThemedText className="text-sm font-semibold mb-2">
            Target Blood Glucose
          </ThemedText>
          <TextInput
            value={targetBG}
            onChangeText={setTargetBG}
            placeholder="100"
            placeholderTextColor={'#9ca3af'}
            keyboardType="numeric"
            className="px-4 py-3 rounded-xl"
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              fontSize: 16,
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          />
          <ThemedText className="text-xs opacity-60 mt-1">
            Your target blood glucose (mg/dL)
          </ThemedText>
        </View>

        {/* Night Threshold */}
        <View>
          <ThemedText className="text-sm font-semibold mb-2">
            Night Hypo Threshold
          </ThemedText>
          <TextInput
            value={nightThreshold}
            onChangeText={setNightThreshold}
            placeholder="70"
            placeholderTextColor={'#9ca3af'}
            keyboardType="numeric"
            className="px-4 py-3 rounded-xl"
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              fontSize: 16,
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}
          />
          <ThemedText className="text-xs opacity-60 mt-1">
            Alert when bedtime BG is below this (mg/dL)
          </ThemedText>
        </View>
      </View>

      {/* Save Button */}
      <Pressable
        onPress={handleSave}
        className="mt-6 py-4 rounded-2xl flex-row items-center justify-center"
        style={({ pressed }) => ({
          backgroundColor: pressed ? '#1d4ed8' : '#2563eb',
        })}
      >
        <Save size={20} color="#ffffff" />
        <ThemedText className="ml-2 text-base font-bold text-white">
          Save Settings
        </ThemedText>
      </Pressable>

      {/* Info */}
      <View className="mt-4 p-3 rounded-xl" style={{ backgroundColor: '#f3f4f6' }}>
        <ThemedText className="text-xs opacity-60 text-center">
          Consult your doctor to determine these values. They vary by individual.
        </ThemedText>
      </View>
    </View>
  );
}

