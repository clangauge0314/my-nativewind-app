import { ThemedText } from '@/components/themed-text';
import { useHealthStore } from '@/stores/health-store';
import { InsulinEntry } from '@/types/health';
import { Droplet, X } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, TextInput, View } from 'react-native';

interface AddInsulinProps {
  visible: boolean;
  onClose: () => void;
}

export function AddInsulin({ visible, onClose }: AddInsulinProps) {
  const { addInsulin } = useHealthStore();
  
  const [units, setUnits] = useState('');
  const [type, setType] = useState<InsulinEntry['type']>('rapid');
  const [notes, setNotes] = useState('');

  const insulinTypes: { value: InsulinEntry['type']; label: string; duration: number }[] = [
    { value: 'rapid', label: 'Rapid Acting', duration: 4 },
    { value: 'short', label: 'Short Acting', duration: 6 },
    { value: 'intermediate', label: 'Intermediate', duration: 12 },
    { value: 'long', label: 'Long Acting', duration: 24 },
  ];

  const selectedType = insulinTypes.find((t) => t.value === type)!;

  const handleSave = () => {
    const unitsValue = parseFloat(units);
    if (isNaN(unitsValue) || unitsValue <= 0) {
      return;
    }

    addInsulin({
      units: unitsValue,
      type,
      timestamp: Date.now(),
      duration: selectedType.duration,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setUnits('');
    setType('rapid');
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
                <Droplet size={20} color="#2563eb" />
              </View>
              <ThemedText className="text-xl font-bold">
                Log Insulin Dose
              </ThemedText>
            </View>
            <Pressable onPress={onClose}>
              <X size={24} color={'#6b7280'} />
            </Pressable>
          </View>

          {/* Units Input */}
          <View className="mb-4">
            <ThemedText className="text-sm font-semibold mb-2">
              Insulin Units
            </ThemedText>
            <TextInput
              value={units}
              onChangeText={setUnits}
              placeholder="Enter units"
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
              Insulin Type
            </ThemedText>
            <View style={{ gap: 8 }}>
              {insulinTypes.map((insulinType) => (
                <Pressable
                  key={insulinType.value}
                  onPress={() => setType(insulinType.value)}
                  className="px-4 py-3 rounded-xl flex-row items-center justify-between"
                  style={{
                    backgroundColor: type === insulinType.value
                      ? '#2563eb'
                      : ('#f3f4f6'),
                  }}
                >
                  <View>
                    <ThemedText
                      className="font-semibold"
                      style={{
                        color: type === insulinType.value ? '#ffffff' : ('#1f2937'),
                      }}
                    >
                      {insulinType.label}
                    </ThemedText>
                    <ThemedText
                      className="text-xs mt-1"
                      style={{
                        color: type === insulinType.value ? '#dbeafe' : ('#6b7280'),
                      }}
                    >
                      Duration: {insulinType.duration}h
                    </ThemedText>
                  </View>
                  {type === insulinType.value && (
                    <View
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                  )}
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
              placeholder="e.g., With breakfast, Correction dose..."
              placeholderTextColor={'#9ca3af'}
              multiline
              numberOfLines={2}
              className="px-4 py-3 rounded-xl"
              style={{
                backgroundColor: '#f3f4f6',
                color: '#000000',
                fontSize: 14,
                minHeight: 60,
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
              opacity: !units ? 0.5 : 1,
            })}
            disabled={!units}
          >
            <ThemedText className="text-center text-base font-bold text-white">
              Log Insulin
            </ThemedText>
          </Pressable>

          {/* Info */}
          <View className="mt-4 p-3 rounded-xl" style={{ backgroundColor: '#f3f4f6' }}>
            <ThemedText className="text-xs opacity-60 text-center">
              This dose will be tracked for IOB calculations
            </ThemedText>
          </View>
        </View>
      </View>
    </Modal>
  );
}

