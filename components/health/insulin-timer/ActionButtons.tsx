import { ThemedText } from '@/components/themed-text';
import { useResponsive } from '@/hooks/use-responsive';
import { Edit } from 'lucide-react-native';
import React from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface ActionButtonsProps {
  formattedDate: string | null;
  onEdit?: () => void;
}

export const ActionButtons = React.memo(function ActionButtons({ 
  formattedDate, 
  onEdit 
}: ActionButtonsProps) {
  const { responsiveSize, responsiveFontSize, responsiveSpacing } = useResponsive();

  return (
    <View
      style={{
        width: screenWidth - responsiveSpacing(64),
        flexDirection: 'row',
        gap: responsiveSpacing(12),
        marginBottom: responsiveSpacing(24),
      }}
    >
      {/* Edit Record 버튼 - 레코드가 없으면 비활성화 */}
      <TouchableOpacity
        onPress={formattedDate ? onEdit : undefined}
        disabled={!formattedDate}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: responsiveSpacing(16),
          paddingHorizontal: responsiveSpacing(20),
          backgroundColor: formattedDate ? '#2563eb' : '#cbd5e1',
          borderRadius: responsiveSize(12),
          shadowColor: formattedDate ? '#2563eb' : '#94a3b8',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: formattedDate ? 0.2 : 0.1,
          shadowRadius: 8,
          elevation: formattedDate ? 4 : 2,
        }}
        activeOpacity={formattedDate ? 0.8 : 1}
      >
        <Edit size={responsiveFontSize(20)} color={formattedDate ? '#ffffff' : '#94a3b8'} style={{ marginRight: 8 }} />
        <ThemedText 
          style={{ 
            fontSize: responsiveFontSize(14),
            color: formattedDate ? '#ffffff' : '#94a3b8',
            fontWeight: '700',
          }}
        >
          Edit Record
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
});

