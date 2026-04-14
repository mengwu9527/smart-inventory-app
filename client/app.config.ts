import { ExpoConfig, ConfigContext } from 'expo/config';

const appName = '智慧记AI进销存';
const projectId = process.env.COZE_PROJECT_ID || process.env.EXPO_PUBLIC_COZE_PROJECT_ID;
const slugAppName = 'free-jxc-app';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    "name": appName,
    "slug": slugAppName,
    "version": "1.1.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "freejxc",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.free.jxc.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#4F46E5"
      },
      "package": "com.free.jxc.app",
      "permissions": [
        "android.permission.BLUETOOTH",
        "android.permission.BLUETOOTH_ADMIN",
        "android.permission.BLUETOOTH_CONNECT",
        "android.permission.BLUETOOTH_SCAN",
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.READ_MEDIA_IMAGES",
        "android.permission.READ_MEDIA_VIDEO",
        "android.permission.RECORD_AUDIO",
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.VIBRATE"
      ]
    },
    "web": {
      "bundler": "metro",
      "output": "single",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-sqlite",
      process.env.EXPO_PUBLIC_BACKEND_BASE_URL ? [
        "expo-router",
        {
          "origin": process.env.EXPO_PUBLIC_BACKEND_BASE_URL
        }
      ] : 'expo-router',
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": `允许智慧进销存App访问您的相册，以便您上传或保存图片。`,
          "cameraPermission": `允许智慧进销存App使用您的相机，以便您直接拍摄照片上传。`,
          "microphonePermission": `允许智慧进销存App访问您的麦克风，以便您拍摄带有声音的视频。`
        }
      ],
      [
        "expo-location",
        {
          "locationWhenInUsePermission": `智慧进销存App需要访问您的位置以提供周边服务及导航功能。`
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": `智慧进销存App需要访问相机以拍摄照片和视频。`,
          "microphonePermission": `智慧进销存App需要访问麦克风以录制视频声音。`,
          "recordAudioAndroid": true
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
