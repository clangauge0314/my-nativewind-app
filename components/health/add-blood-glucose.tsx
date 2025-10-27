import { ThemedText } from '@/components/themed-text';
import { useHealthStore } from '@/stores/health-store';
import { BloodGlucoseEntry } from '@/types/health';
import { Activity, X } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, TextInput, View } from 'react-native';

interface AddBloodGlucoseProps {
  visible: boolean;
  onClose: () => void;
}

export function AddBloodGlucose({ visible, onClose }: AddBloodGlucoseProps) {
  const { addBloodGlucose, settings } = useHealthStore();
  
  const [value, setValue] = useState('');
  const [type, setType] = useState<BloodGlucoseEntry['type']>('random');
  const [notes, setNotes] = useState('');

  const bgTypes: { value: BloodGlucoseEntry['type']; label: string }[] = [
    { value: 'fasting', label: 'Fasting' },
    { value: 'before_meal', label: 'Before Meal' },
    { value: 'after_meal', label: 'After Meal' },
    { value: 'bedtime', label: 'Bedtime' },
    { value: 'random', label: 'Random' },
  ];

  const handleSave = () => {
    const bgValue = parseFloat(value);
    if (isNaN(bgValue) || bgValue <= 0) {
      return;
    }

    addBloodGlucose({
      value: bgValue,
      timestamp: Date.now(),
      type,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setValue('');
    setType('random');
    setNotes('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={onClose}
        />
        
        <View
          className="rounded-t-3xl p-6"
          style={{
            backgroundColor: '#ffffff',
            maxHeight: '80%',
          }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: '#eff6ff' }}
              >
                <Activity size={20} color="#2563eb" />
              </View>
              <ThemedText className="text-xl font-bold">
                Add Blood Glucose
              </ThemedText>
            </View>
            <Pressable onPress={onClose}>
              <X size={24} color={'#6b7280'} />
            </Pressable>
          </View>

          {/* Value Input */}
          <View className="mb-4">
            <ThemedText className="text-sm font-semibold mb-2">
              Blood Glucose ({settings.units})
            </ThemedText>
            <TextInput
              value={value}
              onChangeText={setValue}
              placeholder="Enter value"
              placeholderTextColor={'#9ca3af'}
              keyboardType="numeric"
              className="px-4 py-3 rounded-xl"
              style={{
                backgroundColor: '#f3f4f6',
                color: '#000000',
                fontSize: 16,
              }}
            />
          </View>

          {/* Type Selection */}
          <View className="mb-4">
            <ThemedText className="text-sm font-semibold mb-2">
              Type
            </ThemedText>
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {bgTypes.map((bgType) => (
                <Pressable
                  key={bgType.value}
                  onPress={() => setType(bgType.value)}
                  className="px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: type === bgType.value
                      ? '#2563eb'
                      : ('#f3f4f6'),
                  }}
                >
                  <ThemedText
                    className="text-sm"
                    style={{
                      color: type === bgType.value ? '#ffffff' : ('#1f2937'),
                    }}
                  >
                    {bgType.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View className="mb-6">
            <ThemedText className="text-sm font-semibold mb-2">
              Notes (Optional)
            </ThemedText>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes..."
              placeholderTextColor={'#9ca3af'}
              multiline
              numberOfLines={3}
              className="px-4 py-3 rounded-xl"
              style={{
                backgroundColor: '#f3f4f6',
                color: '#000000',
                fontSize: 14,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
            />
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            className="py-4 rounded-2xl"
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#1d4ed8' : '#2563eb',
              opacity: !value ? 0.5 : 1,
            })}
            disabled={!value}
          >
            <ThemedText className="text-center text-base font-bold text-white">
              Save Blood Glucose
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

