#!/bin/bash
set -e

echo "=== 智慧记AI进销存 APK 构建脚本 ==="

# Install dependencies
echo "1. 安装依赖..."
pnpm install

# Setup Android environment
echo "2. 设置Android环境..."
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$PATH

# Prebuild Android project
echo "3. 生成Android原生项目..."
cd client
npx expo prebuild --platform android --clean

# Build APK
echo "4. 构建APK..."
cd android
./gradlew assembleDebug --no-daemon

# Copy APK
echo "5. 复制APK..."
cp app/build/outputs/apk/debug/app-debug.apk ../智慧记AI进销存-$(date +%Y%m%d).apk

echo "=== 构建完成 ==="
