import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import 'expo-router/entry';

// 백그라운드 메시지 핸들러
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  // 백그라운드에서도 명시적으로 헤드업 알림 표시
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: remoteMessage.notification?.title || remoteMessage.data?.title || 'Notification',
        body: remoteMessage.notification?.body || remoteMessage.data?.body || '',
        sound: 'default',
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
