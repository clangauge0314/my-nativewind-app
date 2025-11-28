module.exports = {
  expo: {
    name: "DiaBeats",
    slug: "my-nativewind-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "mynativewindapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.mynativewindapp",
      versionCode: 2,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON, 
      adaptiveIcon: {
        backgroundColor: "#A596E3",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: false,
      predictiveBackGestureEnabled: false,
      softwareKeyboardLayoutMode: "pan",
      navigationBar: {
        visible: "leanback"
      },
      statusBar: {
        hidden: false,
        style: "auto"
      }
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000"
          }
        }
      ],
      "expo-font"
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "f7a248cc-ffbe-4967-8a18-2476fc75f286"
      }
    }
  }
};