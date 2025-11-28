import messaging from '@react-native-firebase/messaging';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import 'expo-router/entry';
import { Platform } from 'react-native';

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  if (Platform.OS === 'android') {
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'asset:/alarm_sound.mp3' },
        { shouldPlay: true, volume: 1.0 }
      );
    } catch (error) {
      console.error('Error playing background sound:', error);
    }
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: remoteMessage.notification?.title || remoteMessage.data?.title || 'Notification',
        body: remoteMessage.notification?.body || remoteMessage.data?.body || '',
        sound: 'alarm_sound',
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrate: [0, 250, 250, 250],
        categoryIdentifier: 'meal_alarm',
        sticky: false,
        autoDismiss: true,
        data: remoteMessage.data ? Object.fromEntries(
          Object.entries(remoteMessage.data).map(([key, value]) => [key, String(value)])
        ) : {},
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error displaying background notification:', error);
  }
});
