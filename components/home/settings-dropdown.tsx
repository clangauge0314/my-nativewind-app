import { ThemedText } from '@/components/themed-text';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';

interface SettingsDropdownProps {
  visible: boolean;
  onClose: () => void;
  anchorPosition: { top: number; right: number };
}

export function SettingsDropdown({ visible, onClose, anchorPosition }: SettingsDropdownProps) {
  const signOut = useAuthStore((state) => state.signOut);
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Zustand store의 signOut 사용 (Supabase 로그아웃 + 상태 클리어)
      await signOut();
      
      // 드롭다운 닫기
      onClose();
      
      // 짧은 지연 후 라우팅 (상태 업데이트 보장)
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        className="flex-1" 
        onPress={onClose}
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      >
        <View
          className="absolute rounded-3xl overflow-hidden"
          style={{
            top: anchorPosition.top,
            right: anchorPosition.right,
            backgroundColor: '#ffffff',
            borderWidth: 1,
            borderColor: '#e5e7eb',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 12,
            minWidth: 220,
          }}
        >
          {/* Logout */}
          <Pressable
            onPress={handleLogout}
            disabled={isLoggingOut}
            className="flex-row items-center px-6 py-4"
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#ef444410' : 'transparent',
              opacity: isLoggingOut ? 0.5 : 1,
            })}
          >
            <View 
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: '#fee2e2' }}
            >
              <LogOut size={18} color="#ef4444" />
            </View>
            <View className="flex-1">
              <ThemedText className="font-semibold text-base" style={{ color: '#ef4444' }}>
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </ThemedText>
              <ThemedText 
                className="text-xs mt-0.5"
                style={{ color: '#ef4444', opacity: 0.7 }}
              >
                Sign out of account
              </ThemedText>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}