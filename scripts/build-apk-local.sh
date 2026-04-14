#!/bin/bash

# 智慧记AI进销存 - 本地APK构建脚本
# 使用方法: ./scripts/build-apk-local.sh

set -e

echo "=========================================="
echo "  智慧记AI进销存 - APK本地构建脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}错误: 未找到 $1${NC}"
        echo "请先安装 $1"
        exit 1
    fi
}

check_version() {
    local cmd=$1
    local min_version=$2
    local current_version=$($3 2>&1 | head -1 | grep -oE '[0-9]+\.[0-9]+' | head -1)

    if [ -z "$current_version" ]; then
        echo -e "${YELLOW}警告: 无法获取 $cmd 版本${NC}"
        return
    fi

    echo "  $cmd 版本: $current_version (需要 >= $min_version)"
}

# 1. 检查环境
echo "1. 检查环境..."
echo ""
check_command "node"
check_command "pnpm"
check_command "java"
check_command "git"

check_version "Node.js" "20.0" "node --version"
check_version "pnpm" "8.0" "pnpm --version"
check_version "Java" "17" "java -version"

echo ""

# 2. 检查Android SDK
echo "2. 检查Android SDK..."
echo ""

if [ -z "$ANDROID_HOME" ]; then
    echo -e "${YELLOW}警告: ANDROID_HOME 环境变量未设置${NC}"
    echo "请设置 ANDROID_HOME 环境变量"
    echo ""
    echo "示例:"
    echo "  export ANDROID_HOME=/path/to/Android/Sdk"
    echo "  export PATH=\$ANDROID_HOME/tools:\$ANDROID_HOME/tools/bin:\$ANDROID_HOME/platform-tools:\$PATH"
    echo ""
    read -p "是否继续? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "  ANDROID_HOME: $ANDROID_HOME"

    # 检查SDK组件
    if [ -d "$ANDROID_HOME/platforms/android-34" ]; then
        echo "  ✓ Android API 34 已安装"
    else
        echo -e "${YELLOW}  ! Android API 34 未安装${NC}"
    fi

    if [ -d "$ANDROID_HOME/build-tools/34.0.0" ]; then
        echo "  ✓ Build Tools 34.0.0 已安装"
    else
        echo -e "${YELLOW}  ! Build Tools 34.0.0 未安装${NC}"
    fi
fi

echo ""

# 3. 设置项目目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CLIENT_DIR="$PROJECT_ROOT/client"

echo "3. 项目信息..."
echo "  项目根目录: $PROJECT_ROOT"
echo "  客户端目录: $CLIENT_DIR"
echo ""

# 4. 安装依赖
echo "4. 安装依赖..."
echo ""
cd "$PROJECT_ROOT"
pnpm install
echo -e "${GREEN}✓ 依赖安装完成${NC}"
echo ""

# 5. 生成Android原生项目
echo "5. 生成Android原生项目..."
echo ""
cd "$CLIENT_DIR"
npx expo prebuild --platform android --clean
echo -e "${GREEN}✓ Android原生项目生成完成${NC}"
echo ""

# 6. 配置本地属性
echo "6. 配置本地属性..."
echo ""

if [ -z "$ANDROID_HOME" ]; then
    echo -e "${RED}错误: 需要设置 ANDROID_HOME 环境变量${NC}"
    exit 1
fi

cd "$CLIENT_DIR/android"
echo "sdk.dir=$ANDROID_HOME" > local.properties
echo -e "${GREEN}✓ local.properties 配置完成${NC}"
echo ""

# 7. 构建APK
echo "7. 构建APK..."
echo "  这可能需要 30-60 分钟，请耐心等待..."
echo ""

cd "$CLIENT_DIR/android"

# 检查是否使用并行构建
read -p "是否使用并行构建（更快，需要更多内存）? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "使用并行构建..."
    ./gradlew assembleDebug --parallel
else
    echo "使用标准构建..."
    ./gradlew assembleDebug
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ APK构建完成${NC}"
else
    echo -e "${RED}✗ APK构建失败${NC}"
    exit 1
fi

echo ""

# 8. 复制APK
echo "8. 复制APK..."
echo ""

APK_SOURCE="$CLIENT_DIR/android/app/build/outputs/apk/debug/app-debug.apk"
APK_DEST="$PROJECT_ROOT/智慧记AI进销存-v1.0.0-$(date +%Y%m%d).apk"

if [ -f "$APK_SOURCE" ]; then
    cp "$APK_SOURCE" "$APK_DEST"
    echo -e "${GREEN}✓ APK已复制到: $APK_DEST${NC}"
    ls -lh "$APK_DEST"
else
    echo -e "${RED}错误: 找不到APK文件: $APK_SOURCE${NC}"
    exit 1
fi

echo ""

# 9. 完成
echo "=========================================="
echo -e "${GREEN}✓ 构建完成！${NC}"
echo "=========================================="
echo ""
echo "APK文件位置:"
echo "  $APK_DEST"
echo ""
echo "文件大小:"
ls -lh "$APK_DEST" | awk '{print "  " $5}'
echo ""
echo "下一步:"
echo "  1. 将APK传输到Android设备"
echo "  2. 在设备上安装APK"
echo "  3. 允许安装未知来源应用"
echo "  4. 开始使用应用"
echo ""
echo "技术支持:"
echo "  - 查看 BUILD.md 了解详细构建信息"
echo "  - 查看 USER_GUIDE.md 了解使用方法"
echo "  - 查看 LOCAL_BUILD_GUIDE.md 了解完整的本地构建指南"
echo ""
