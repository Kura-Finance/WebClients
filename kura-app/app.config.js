module.exports = {
  expo: {
    name: "Kura",
    slug: "kura-app",
    version: "0.0.1",
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
      "expo-image-picker",
    ],
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      bundleIdentifier: "com.rick.kuraapp",
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSLocalNetworkUsageDescription: "This app needs access to your local network to connect to financial services",
        NSBonjourServiceTypes: ["_http._tcp", "_https._tcp"],
        // Wallet detection - allows AppKit to detect installed wallets on iOS
        LSApplicationQueriesSchemes: [
          "metamask",
          "trust",
          "safe",
          "rainbow",
          "uniswap",
          "oneinch",
          "ledger",
          "coinbase",
          "walletconnect"
        ]
      },
      // Deep linking support for wallet redirects
      scheme: "kura"
    },
    android: {
      package: "com.rick.kuraapp",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      // Deep linking support for wallet redirects
      scheme: "kura",
      // Wallet queries for Android
      intentFilters: [
        {
          action: "android.intent.action.VIEW",
          autoVerify: true,
          data: {
            scheme: "https",
            host: "*.kurafinance.app"
          },
          category: [
            "android.intent.category.DEFAULT",
            "android.intent.category.BROWSABLE"
          ]
        },
        {
          action: "android.intent.action.VIEW",
          data: {
            scheme: "kura"
          },
          category: [
            "android.intent.category.DEFAULT",
            "android.intent.category.BROWSABLE"
          ]
        }
      ]
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      eas: {
        projectId: "65a47cb5-faa8-4d32-805c-e35ced4da335",
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
