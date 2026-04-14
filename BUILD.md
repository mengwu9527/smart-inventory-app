# 智慧记AI进销存 - APK构建指南

## 前置要求

在开始构建之前，请确保您的开发环境已安装以下工具：

### 必需软件
- **Node.js**: v18 或更高版本
- **pnpm**: v8 或更高版本
- **Java Development Kit (JDK)**: JDK 17（推荐）
- **Android Studio**: 最新版本
- **Android SDK**: API Level 34 (Android 14)

### 安装 JDK 17
```bash
# macOS
brew install openjdk@17

# Ubuntu/Debian
sudo apt install openjdk-17-jdk

# Windows
# 下载并安装: https://adoptium.net/
```

### 配置 Android SDK
1. 安装 Android Studio
2. 打开 Android Studio → Settings → Appearance & Behavior → System Settings → Android SDK
3. 安装以下组件：
   - Android SDK Platform 34
   - Android SDK Build-Tools 34
   - Android SDK Command-line Tools
   - Android Emulator (可选，用于测试)

## 快速开始

### 1. 安装依赖
```bash
cd /workspace/projects
pnpm install
```

### 2. 配置 EAS（推荐方式）

#### 安装 EAS CLI
```bash
npm install -g eas-cli
```

#### 登录 Expo 账户
```bash
eas login
```

#### 配置项目
```bash
cd client
eas build:configure
```

#### 构建 APK

**预览版本（推荐用于测试）**
```bash
eas build --profile preview --platform android
```

**生产版本**
```bash
eas build --profile production --platform android
```

构建完成后，可以在 Expo 控制台下载 APK 文件。

### 3. 本地构建（备用方式）

如果您有完整的 Android 开发环境，可以使用本地构建：

#### 生成原生项目
```bash
cd client
npx expo prebuild --platform android
```

#### 构建 APK
```bash
# Debug 版本
cd android
./gradlew assembleDebug

# Release 版本
./gradlew assembleRelease
```

APK 文件将生成在 `android/app/build/outputs/apk/` 目录下。

## 签名配置（生产环境必需）

### 生成签名密钥
```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore jxc-upload.keystore \
  -alias jxc-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### 配置 gradle.properties
在 `client/android/gradle.properties` 中添加：
```properties
MYAPP_UPLOAD_STORE_FILE=jxc-upload.keystore
MYAPP_UPLOAD_KEY_ALIAS=jxc-key
MYAPP_UPLOAD_STORE_PASSWORD=你的密钥库密码
MYAPP_UPLOAD_KEY_PASSWORD=你的密钥密码
```

### 配置 build.gradle
在 `client/android/app/build.gradle` 中添加签名配置：
```gradle
android {
  ...
  signingConfigs {
    release {
      storeFile file(MYAPP_UPLOAD_STORE_FILE)
      storePassword MYAPP_UPLOAD_STORE_PASSWORD
      keyAlias MYAPP_UPLOAD_KEY_ALIAS
      keyPassword MYAPP_UPLOAD_KEY_PASSWORD
    }
  }
  buildTypes {
    release {
      signingConfig signingConfigs.release
    }
  }
}
```

## 项目配置

### 应用信息
- **应用名称**: 智慧记AI进销存
- **包名**: com.free.jxc.app
- **版本号**: 1.0.0
- **最低 Android 版本**: Android 10 (API Level 29)
- **目标 Android 版本**: Android 14 (API Level 34)

### 权限配置
应用已配置以下权限：
- 蓝牙权限（连接打印机）
- 相机权限（扫码、拍照）
- 存储权限（数据导入导出）
- 网络权限（在线功能）

## 常见问题

### 1. Java 版本不匹配
**问题**: `Unsupported class file major version 61`
**解决**: 确保使用 JDK 17

### 2. Android SDK 未找到
**问题**: `SDK location not found`
**解决**: 创建 `client/android/local.properties` 文件：
```properties
sdk.dir=/path/to/Android/sdk
```

### 3. 内存不足
**问题**: `Expiring Daemon because JVM heap space is exhausted`
**解决**: 在 `client/android/gradle.properties` 中增加内存：
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
```

### 4. 多 dex 问题
**问题**: `Cannot fit requested classes in a single dex file`
**解决**: 在 `client/android/app/build.gradle` 中启用 multidex：
```gradle
android {
  defaultConfig {
    multiDexEnabled true
  }
}
```

## 测试 APK

### 安装到设备
```bash
# 使用 adb 安装
adb install app-release.apk

# 或直接传输到设备安装
```

### 测试清单
- [ ] 应用正常启动
- [ ] 数据库初始化成功
- [ ] 商品管理功能正常
- [ ] 销售开单流程完整
- [ ] 库存管理功能正常
- [ ] 蓝牙打印功能正常
- [ ] 统计分析数据显示正确
- [ ] 数据持久化正常（重启后数据保留）

## 更新应用

### 更新版本号
在 `client/app.config.ts` 中修改：
```typescript
{
  "version": "1.0.1",  // 更新版本号
  "android": {
    "versionCode": 2   // 更新构建号
  }
}
```

### 重新构建
```bash
eas build --profile production --platform android
```

## 发布到应用商店

### 准备材料
1. 签名后的 APK
2. 应用图标（512x512）
3. 应用截图（至少2张）
4. 应用描述
5. 隐私政策

### 发布渠道
- Google Play Store
- 国内应用市场（华为、小米、OPPO等）
- 自有分发渠道

## 技术支持

如有问题，请参考：
- [Expo 官方文档](https://docs.expo.dev)
- [React Native 官方文档](https://reactnative.dev)
- [EAS Build 文档](https://docs.expo.dev/build/introduction/)
