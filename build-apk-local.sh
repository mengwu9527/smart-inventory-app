#!/bin/bash
set -e

echo "=========================================="
echo "  智慧记AI进销存 - 快速APK构建"
echo "=========================================="

# 设置项目目录
cd /workspace/projects

# 安装依赖
echo "1. 安装依赖..."
pnpm install

# 生成Android项目
echo "2. 生成Android项目..."
cd client
npx expo prebuild --platform android --clean

# 配置SDK路径
echo "3. 配置SDK路径..."
if [ -z "$ANDROID_HOME" ]; then
    echo "错误: 请设置 ANDROID_HOME 环境变量"
    echo "示例: export ANDROID_HOME=/path/to/Android/Sdk"
    exit 1
fi
echo "sdk.dir=$ANDROID_HOME" > android/local.properties

# 构建APK
echo "4. 构建APK（这可能需要30-60分钟）..."
cd android
./gradlew assembleDebug

# 复制APK
echo "5. 复制APK..."
cp app/build/outputs/apk/debug/app-debug.apk \
   ../智慧记AI进销存-v1.0.0-$(date +%Y%m%d).apk

echo ""
echo "=========================================="
echo "  构建完成！"
echo "=========================================="
echo ""
echo "APK文件: 智慧记AI进销存-v1.0.0-$(date +%Y%m%d).apk"
ls -lh ../智慧记AI进销存-v1.0.0-$(date +%Y%m%d).apk
echo ""
