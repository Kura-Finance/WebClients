module.exports = {
  expo: {
    name: "kura-app",
    slug: "kura-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    plugins: [
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
          },
        },
      ],
    ],
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      bundleIdentifier: "com.rick.kuraapp",
      supportsTablet: true,
    },
    android: {
      package: "com.rick.kuraapp",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    // ✅ 环境变量配置
    // 关于 SSL 证书问题的说明:
    // - React Native 在开发环境会拒绝自签名的 HTTPS 证书
    // - 解决方案: 在 .env.local 中设置 EXPO_PUBLIC_BACKEND_URL_DEV=http://localhost:8080
    // - 或者让后端在开发环境同时支持 HTTP 和 HTTPS
    extra: {
      eas: {
        projectId: "your-eas-project-id",
      },
      walletConnectProjectId:
        process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID ||
        process.env.WALLETCONNECT_PROJECT_ID ||
        "development_project_id",
      backendUrl:
        process.env.EXPO_PUBLIC_BACKEND_URL ||
        "https://localhost:8080",
      backendUrlDev:
        process.env.EXPO_PUBLIC_BACKEND_URL_DEV ||
        undefined,
      environment: process.env.APP_ENV || process.env.NODE_ENV || "development",
    },
  },
};
