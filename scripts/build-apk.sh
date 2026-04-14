#!/bin/bash
# APK 本地构建脚本
# 用于在有完整Android开发环境的机器上构建APK

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLIENT_DIR="$ROOT_DIR/client"

echo "=========================================="
echo "智慧记AI进销存 - APK构建脚本"
echo "=========================================="

# 检查环境
check_environment() {
    echo "[1/5] 检查构建环境..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安装"
        exit 1
    fi
    echo "✅ Node.js: $(node -v)"
    
    # 检查 pnpm
    if ! command -v pnpm &> /dev/null; then
        echo "❌ pnpm 未安装"
        exit 1
    fi
    echo "✅ pnpm: $(pnpm -v)"
    
    # 检查 Java
    if ! command -v java &> /dev/null; then
        echo "⚠️  Java 未安装，将使用 EAS 云构建"
        USE_EAS=true
    else
        JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
        echo "✅ Java: $JAVA_VERSION"
        if [ "$JAVA_VERSION" != "17" ]; then
            echo "⚠️  建议使用 Java 17，当前版本: $JAVA_VERSION"
        fi
        USE_EAS=false
    fi
}

# 安装依赖
install_dependencies() {
    echo "[2/5] 安装项目依赖..."
    cd "$ROOT_DIR"
    pnpm install
    echo "✅ 依赖安装完成"
}

# 生成原生代码
generate_native() {
    echo "[3/5] 生成原生代码..."
    cd "$CLIENT_DIR"
    
    if [ -d "android" ]; then
        echo "⚠️  android 目录已存在，清理中..."
        rm -rf android
    fi
    
    npx expo prebuild --platform android
    echo "✅ 原生代码生成完成"
}

# 构建 APK
build_apk() {
    echo "[4/5] 构建 APK..."
    cd "$CLIENT_DIR/android"
    
    # 检查是否有签名配置
    if [ -f "../jxc-upload.keystore" ]; then
        echo "检测到签名密钥，构建 Release 版本..."
        ./gradlew assembleRelease
        APK_PATH="$CLIENT_DIR/android/app/build/outputs/apk/release/app-release.apk"
    else
        echo "未检测到签名密钥，构建 Debug 版本..."
        ./gradlew assembleDebug
        APK_PATH="$CLIENT_DIR/android/app/build/outputs/apk/debug/app-debug.apk"
    fi
    
    echo "✅ APK 构建完成"
    echo "📦 APK 位置: $APK_PATH"
}

# 复制 APK 到项目根目录
copy_apk() {
    echo "[5/5] 复制 APK..."
    
    if [ -f "$APK_PATH" ]; then
        OUTPUT_NAME="智慧记AI进销存-v1.0.0.apk"
        cp "$APK_PATH" "$ROOT_DIR/$OUTPUT_NAME"
        echo "✅ APK 已复制到: $ROOT_DIR/$OUTPUT_NAME"
    else
        echo "❌ APK 文件不存在"
        exit 1
    fi
}

# 使用 EAS 云构建（备选方案）
build_with_eas() {
    echo "[4/5] 使用 EAS 云构建..."
    cd "$CLIENT_DIR"
    
    # 检查 EAS CLI
    if ! command -v eas &> /dev/null; then
        echo "安装 EAS CLI..."
        npm install -g eas-cli
    fi
    
    # 检查是否已登录
    if ! eas whoami &> /dev/null; then
        echo "请登录 Expo 账户:"
        eas login
    fi
    
    # 构建 APK
    eas build --profile preview --platform android --wait
    
    echo "✅ 构建任务已提交，请查看控制台输出获取下载链接"
}

# 主流程
main() {
    check_environment
    
    install_dependencies
    
    if [ "$USE_EAS" = true ]; then
        build_with_eas
    else
        generate_native
        build_apk
        copy_apk
    fi
    
    echo ""
    echo "=========================================="
    echo "🎉 构建完成！"
    echo "=========================================="
}

main "$@"
