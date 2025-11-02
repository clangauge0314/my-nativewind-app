import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Alert, Platform } from 'react-native';

/**
 * Firebase 설정 상태를 확인하는 디버깅 도구
 */
export const debugFirebaseConfig = async () => {
  try {
    const authInstance = auth();
    const firestoreInstance = firestore();
    
    const debugInfo = {
      // Platform 정보
      platform: Platform.OS,
      platformVersion: Platform.Version,
      
      // Auth 정보
      authAppName: authInstance.app.name,
      authProjectId: authInstance.app.options.projectId || 'NOT SET',
      authApiKey: authInstance.app.options.apiKey 
        ? authInstance.app.options.apiKey.substring(0, 15) + '...' 
        : 'NOT SET',
      currentUser: authInstance.currentUser?.uid || 'None',
      
      // Firestore 정보
      firestoreAppName: firestoreInstance.app.name,
      firestoreProjectId: firestoreInstance.app.options.projectId || 'NOT SET',
      
      // Package 정보
      packageName: 'com.mynativewindapp',
    };
    
    console.log('🔍 Firebase Full Debug:', debugInfo);
    
    const message = 
      `Platform: ${debugInfo.platform} ${debugInfo.platformVersion}\n\n` +
      `Project ID: ${debugInfo.authProjectId}\n\n` +
      `API Key: ${debugInfo.authApiKey}\n\n` +
      `Package: ${debugInfo.packageName}\n\n` +
      `Current User: ${debugInfo.currentUser}`;
    
    Alert.alert('🔍 Firebase Config', message, [{ text: 'OK' }]);
    
    return debugInfo;
  } catch (error) {
    console.error('🔴 Firebase debug error:', error);
    Alert.alert('🔴 Error', String(error));
    return { error: String(error) };
  }
};

/**
 * Firebase 연결 테스트
 */
export const testFirebaseConnection = async () => {
  const results: string[] = [];
  let hasError = false;
  
  try {
    // 1. Auth 테스트
    try {
      const authInstance = auth();
      results.push('✅ Auth initialized');
      results.push(`   Project: ${authInstance.app.options.projectId}`);
      
      // API Key 확인
      if (!authInstance.app.options.apiKey) {
        results.push('🔴 API Key NOT found!');
        hasError = true;
      } else {
        results.push('✅ API Key exists');
      }
    } catch (e: any) {
      results.push(`🔴 Auth error: ${e.message}`);
      hasError = true;
    }
    
    // 2. Firestore 테스트
    try {
      await firestore().collection('_connection_test_').limit(1).get();
      results.push('✅ Firestore connected');
    } catch (e: any) {
      results.push(`🔴 Firestore error: ${e.code || e.message}`);
      hasError = true;
    }
    
    // 3. 실제 컬렉션 테스트
    try {
      const quizzesSnapshot = await firestore().collection('quizzes').limit(1).get();
      results.push(`✅ Quizzes collection: ${quizzesSnapshot.size} items`);
    } catch (e: any) {
      results.push(`🔴 Quizzes error: ${e.code || e.message}`);
    }
    
    // 4. Auth 메서드 테스트
    const authInstance = auth();
    const hasSignIn = typeof authInstance.signInWithEmailAndPassword === 'function';
    const hasSignUp = typeof authInstance.createUserWithEmailAndPassword === 'function';
    
    if (hasSignIn && hasSignUp) {
      results.push('✅ Auth methods available');
    } else {
      results.push('🔴 Auth methods NOT available');
      hasError = true;
    }
    
    // 결과 표시
    const title = hasError ? '⚠️ Connection Test (Has Issues)' : '✅ Connection Test (All OK)';
    Alert.alert(title, results.join('\n'), [{ text: 'OK' }]);
    
    return { success: !hasError, results };
  } catch (error: any) {
    results.push(`🔴 Test failed: ${error.message}`);
    Alert.alert('🔴 Connection Test Failed', results.join('\n'));
    return { success: false, error };
  }
};

/**
 * google-services.json 로드 확인
 */
export const checkGoogleServicesJson = () => {
  try {
    const authInstance = auth();
    const app = authInstance.app;
    const options = app.options;
    
    const checks = {
      hasProjectId: !!options.projectId,
      hasApiKey: !!options.apiKey,
      hasAppId: !!options.appId,
      projectId: options.projectId || 'NOT SET',
      expectedPackage: 'com.mynativewindapp',
    };
    
    const allGood = checks.hasProjectId && checks.hasApiKey && checks.hasAppId;
    
    const message = 
      `Project ID: ${checks.hasProjectId ? '✅' : '🔴'}\n` +
      `API Key: ${checks.hasApiKey ? '✅' : '🔴'}\n` +
      `App ID: ${checks.hasAppId ? '✅' : '🔴'}\n\n` +
      `Project: ${checks.projectId}\n\n` +
      `Package: ${checks.expectedPackage}\n\n` +
      (allGood 
        ? '✅ google-services.json is properly loaded!' 
        : '🔴 google-services.json may not be loaded correctly!');
    
    Alert.alert('google-services.json Check', message);
    
    return checks;
  } catch (error: any) {
    Alert.alert('🔴 Error', `Failed to check: ${error.message}`);
    return { error: error.message };
  }
};

/**
 * SHA 지문이 등록되었는지 확인
 * (oauth_client가 비어있으면 SHA 지문이 등록되지 않은 것)
 */
export const checkSHAFingerprints = () => {
  const instructions = 
    'SHA Fingerprint Check:\n\n' +
    '1. google-services.json 파일을 확인하세요\n\n' +
    '2. "oauth_client" 배열이 비어있으면:\n' +
    '   🔴 SHA 지문이 등록되지 않았습니다!\n\n' +
    '3. Firebase Console에서:\n' +
    '   - SHA-1: C1:78:57:54:05:CB:E8:8C:E4:93:DA:64:03:5F:1D:26:1B:E3:0B:2C\n' +
    '   - SHA-256: 8C:FA:EB:6F:2E:84:3A:D9:56:AC:00:C8:42:B5:8B:95:08:E1:1D:20:6E:B2:70:1A:95:19:F8:04:1E:F5:BD:D2\n\n' +
    '4. 등록 후 google-services.json을 다시 다운로드하세요!';
  
  Alert.alert('SHA Fingerprints Guide', instructions, [{ text: 'OK' }]);
};

/**
 * 전체 진단 실행
 */
export const runFullDiagnostics = async () => {
  Alert.alert(
    '🔍 Running Full Diagnostics',
    'This will check all Firebase configurations...',
    [
      {
        text: 'Start',
        onPress: async () => {
          // 1. Config 확인
          await debugFirebaseConfig();
          
          // 2초 대기
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // 2. google-services.json 확인
          checkGoogleServicesJson();
          
          // 2초 대기
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // 3. 연결 테스트
          await testFirebaseConnection();
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]
  );
};

