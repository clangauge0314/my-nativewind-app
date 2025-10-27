import { ThemedText } from '@/components/themed-text';
import { useAuthStore } from '@/stores/auth-store';
import { Bell, Settings } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { SettingsDropdown } from './settings-dropdown';

export function HomeHeader() {
  const user = useAuthStore((state) => state.user);
  const [showSettings, setShowSettings] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const settingsButtonRef = useRef<View>(null);

  const handleSettingsPress = () => {
    settingsButtonRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setDropdownPosition({
        top: pageY + height + 8,
        right: 16,
      });
      setShowSettings(true);
    });
  };

  // 로그인 상태가 아니면 헤더를 렌더링하지 않음
  if (!user) {
    return null;
  }

  const displayName = user.displayName || user.email?.split('@')[0] || 'User';

  return (
    <View className="flex-row items-center justify-between mb-8 mt-4">
      {/* Profile Section */}
      <View className="flex-row items-center">
        <View 
          className="w-20 h-20 rounded-full items-center justify-center mr-4"
          style={{ 
            backgroundColor: '#e0e7ff',
            borderWidth: 3,
            borderColor: '#1d4ed8',
            shadowColor: '#2563eb',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <ThemedText 
            className="font-bold"
            style={{ 
              color: '#1d4ed8',
              fontSize: 20,
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </ThemedText>
        </View>

        {/* User Info */}
        <View>
          <ThemedText 
            className="font-medium mb-1"
            style={{ 
              color: '#6b7280',
              fontSize: 12,
            }}
          >
            Hello, Welcome Back
          </ThemedText>
          <ThemedText 
            className="font-bold"
            style={{ fontSize: 20 }}
          >
            {displayName}
          </ThemedText>
        </View>
      </View>

      {/* Action Icons */}
      <View className="flex-row items-center" style={{ gap: 12 }}>
        <Pressable 
          className="w-14 h-14 rounded-full items-center justify-center relative"
          style={({ pressed }) => ({ 
            backgroundColor: pressed 
              ? ('#e5e7eb')
              : ('#f3f4f6'),
            transform: [{ scale: pressed ? 0.95 : 1 }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: pressed ? 0 : 0.1,
            shadowRadius: 4,
            elevation: pressed ? 0 : 2,
          })}
        >
          <Bell size={24} color={'#6b7280'} />
          <View 
            className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: '#ef4444' }}
          />
        </Pressable>
        <Pressable 
          ref={settingsButtonRef}
          onPress={handleSettingsPress}
          className="w-14 h-14 rounded-full items-center justify-center"
          style={({ pressed }) => ({ 
            backgroundColor: pressed 
              ? ('#e5e7eb')
              : ('#f3f4f6'),
            transform: [{ scale: pressed ? 0.95 : 1 }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: pressed ? 0 : 0.1,
            shadowRadius: 4,
            elevation: pressed ? 0 : 2,
          })}
        >
          <Settings size={24} color={'#6b7280'} />
        </Pressable>
      </View>

      {/* Settings Dropdown */}
      <SettingsDropdown 
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        anchorPosition={dropdownPosition}
      />
    </View>
  );
}
