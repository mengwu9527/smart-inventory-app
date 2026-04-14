# 本地构建APK完整指南

## 前置要求检查

### 1. 检查Node.js版本
```bash
node --version
# 需要 >= 20.0.0
```

### 2. 检查pnpm版本
```bash
pnpm --version
# 需要 >= 8.0.0
```

### 3. 检查Java版本
```bash
java -version
# 需要 Java 17
```

### 4. 检查Android SDK
```bash
# 设置环境变量
export ANDROID_HOME=/path/to/Android/Sdk
export PATH=$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$PATH

# 验证安装
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --version
```

## 环境安装

### 安装Java 17 (macOS)
```bash
# 使用Homebrew
brew install openjdk@17

# 设置JAVA_HOME
echo 'export JAVA_HOME=/opt/homebrew/opt/openjdk@17' >> ~/.zshrc
source ~/.zshrc
```

### 安装Java 17 (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install -y openjdk-17-jdk

# 设置JAVA_HOME
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
source ~/.bashrc
```

### 安装Android SDK

#### macOS (使用Homebrew)
```bash
# 安装Android Command Line Tools
brew install --cask android-commandlinetools

# 设置环境变量
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$PATH' >> ~/.zshrc
source ~/.zshrc

# 安装必要的SDK组件
sdkmanager "platforms;android-34" "build-tools;34.0.0" "platform-tools"
```

#### Ubuntu/Debian
```bash
# 下载Android Command Line Tools
mkdir -p ~/Android/cmdline-tools
cd /tmp
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip commandlinetools-linux-11076708_latest.zip
mv cmdline-tools ~/Android/cmdline-tools/latest

# 设置环境变量
echo 'export ANDROID_HOME=$HOME/Android' >> ~/.bashrc
echo 'export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$PATH' >> ~/.bashrc
source ~/.bashrc

# 安装必要的SDK组件
sdkmanager "platforms;android-34" "build-tools;34.0.0" "platform-tools"
```

#### Windows
1. 下载 [Android Studio](https://developer.android.com/studio)
2. 安装时勾选 Android SDK, Android SDK Platform-Tools, Android SDK Build-Tools
3. 添加环境变量：
   - `ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk`
   - `PATH` 添加 `%ANDROID_HOME%\tools`, `%ANDROID_HOME%\tools\bin`, `%ANDROID_HOME%\platform-tools`

## 项目构建步骤

### 步骤1: 克隆或下载项目

```bash
# 如果是从云端下载
# 1. 下载整个项目文件夹
# 2. 解压到本地目录

cd /path/to/workspace/projects
```

### 步骤2: 安装依赖

```bash
# 在项目根目录
pnpm install
```

### 步骤3: 生成Android原生项目

```bash
cd client
npx expo prebuild --platform android --clean
```

**说明**：
- `--clean`：清理现有的Android原生项目，确保从零开始构建
- `--platform android`：只生成Android平台
- 这个过程会生成 `client/android/` 目录

### 步骤4: 配置本地属性

```bash
# 编辑 local.properties 文件
cd android

# 创建或编辑 local.properties
cat > local.properties << EOF
sdk.dir=/path/to/your/Android/Sdk
EOF

# macOS 示例
# sdk.dir=/Users/yourname/Library/Android/Sdk

# Linux 示例
# sdk.dir=/home/yourname/Android

# Windows 示例
# sdk.dir=C:\\Users\\yourname\\AppData\\Local\\Android\\Sdk
```

### 步骤5: 构建Debug APK

```bash
# 在 android 目录下
cd /workspace/projects/client/android

# 方式一: 快速构建（推荐）
./gradlew assembleDebug

# 方式二: 并行构建（更快，需要更多内存）
./gradlew assembleDebug --parallel

# 方式三: 清理后构建
./gradlew clean assembleDebug
```

**构建时间**：
- 首次构建：30-60分钟
- 增量构建：20-30分钟

### 步骤6: 查找APK文件

```bash
# APK文件位置
ls -lh app/build/outputs/apk/debug/

# 输出示例：
# app-debug.apk  (约50MB)
```

**APK文件路径**：
```
/workspace/projects/client/android/app/build/outputs/apk/debug/app-debug.apk
```

### 步骤7: 复制到项目根目录

```bash
# 复制APK到项目根目录
cp app/build/outputs/apk/debug/app-debug.apk \
   /workspace/projects/智慧记AI进销存-v1.0.0-$(date +%Y%m%d).apk

# 验证
ls -lh /workspace/projects/智慧记AI进销存-*.apk
```

## 常见问题解决

### 问题1: Java版本错误

**错误信息**：
```
Unsupported class file major version 61
```

**解决方法**：
```bash
# 确保使用Java 17
java -version

# 如果版本不对，切换Java版本
# macOS
/usr/libexec/java_home -v 17

# Ubuntu
sudo update-alternatives --config java
```

### 问题2: Android SDK未找到

**错误信息**：
```
SDK location not found. Define location with sdk.dir in local.properties
```

**解决方法**：
```bash
# 编辑 local.properties 文件
cd /workspace/projects/client/android
cat > local.properties << EOF
sdk.dir=/path/to/your/Android/Sdk
EOF
```

### 问题3: Gradle下载失败

**错误信息**：
```
Could not resolve gradle-8.14.3-bin.zip
```

**解决方法**：
```bash
# 使用国内镜像
cd ~/.gradle
cat > init.gradle << EOF
allprojects {
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/public' }
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
        google()
        mavenCentral()
    }
}
EOF
```

### 问题4: 构建内存不足

**错误信息**：
```
java.lang.OutOfMemoryError: Java heap space
```

**解决方法**：
```bash
# 增加Gradle内存
export GRADLE_OPTS="-Xmx4g -XX:MaxMetaspaceSize=1g"

# 然后重新构建
./gradlew assembleDebug
```

### 问题5: 磁盘空间不足

**错误信息**：
```
No space left on device
```

**解决方法**：
```bash
# 清理Gradle缓存
rm -rf ~/.gradle/caches

# 清理Android缓存
rm -rf ~/.android/cache

# 清理构建缓存
./gradlew clean
```

## 构建优化建议

### 1. 使用并行构建
```bash
./gradlew assembleDebug --parallel
```

### 2. 配置Gradle镜像（国内）
```bash
# 创建 ~/.gradle/init.gradle
cat > ~/.gradle/init.gradle << EOF
allprojects {
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/public' }
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
        google()
        mavenCentral()
    }
}
EOF
```

### 3. 增加构建内存
```bash
export GRADLE_OPTS="-Xmx4g -XX:MaxMetaspaceSize=1g"
```

### 4. 禁用不必要的任务
```bash
# 只构建必要的任务
./gradlew assembleDebug -x lint -x test
```

## 验证APK

### 检查APK信息

```bash
# 使用aapt工具（Android SDK自带的工具）
$ANDROID_HOME/build-tools/34.0.0/aapt dump badging app-debug.apk

# 查看包名、版本号等信息
```

### 安装到设备测试

```bash
# 通过USB连接设备
adb devices

# 安装APK
adb install app-debug.apk

# 查看日志
adb logcat | grep "expo"
```

## Release版本构建

如果需要构建发布版本的APK（带签名）：

```bash
# 1. 创建签名密钥
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# 2. 配置签名
cd android
mkdir -p app/src/main/jniLibs
cp /path/to/my-release-key.keystore app/

# 编辑 android/gradle.properties
cat >> gradle.properties << EOF
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=*****
MYAPP_RELEASE_KEY_PASSWORD=*****
EOF

# 3. 配置build.gradle
# 编辑 android/app/build.gradle
# 添加signingConfigs配置

# 4. 构建Release APK
./gradlew assembleRelease

# 5. APK位置
# app/build/outputs/apk/release/app-release.apk
```

## 总结

### 快速构建命令

```bash
# 一键构建脚本
cd /workspace/projects/client

# 设置环境变量
export JAVA_HOME=/path/to/java-17
export ANDROID_HOME=/path/to/Android/Sdk
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$PATH

# 生成Android项目
npx expo prebuild --platform android --clean

# 配置SDK路径
echo "sdk.dir=$ANDROID_HOME" > android/local.properties

# 构建APK
cd android
./gradlew assembleDebug

# 复制APK
cp app/build/outputs/apk/debug/app-debug.apk \
   ../智慧记AI进销存-v1.0.0-$(date +%Y%m%d).apk
```

### 预期时间

- 环境准备：10-20分钟
- 首次构建：30-60分钟
- 增量构建：20-30分钟

### 输出文件

```
/workspace/projects/智慧记AI进销存-v1.0.0-YYYYMMDD.apk
```

### 注意事项

1. **首次构建时间长**：需要下载大量依赖
2. **网络要求**：稳定的网络连接
3. **磁盘空间**：至少需要10GB可用空间
4. **内存要求**：至少8GB内存推荐

## 技术支持

如遇问题，请参考：
- [Expo官方文档](https://docs.expo.dev/)
- [React Native文档](https://reactnative.dev/)
- [Android Gradle文档](https://developer.android.com/build)
