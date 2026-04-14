#!/bin/bash
# 使用Expo官方命令构建APK
# 基于Expo平台截图中的命令

set -e

echo "=========================================="
echo "  使用EAS云构建APK"
echo "=========================================="
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js"
    echo "请先安装Node.js: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js已安装: $(node --version)"
echo ""

# 步骤1：连接项目到Expo
echo "=========================================="
echo "步骤1: 连接项目到Expo"
echo "=========================================="
echo ""
echo "命令: npx eas-cli@latest init --id f05dfeb3-bc5b-42c0-b267-5084f48f7014"
echo ""
read -p "是否继续? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 1
fi

cd /workspace/projects/client
npx eas-cli@latest init --id f05dfeb3-bc5b-42c0-b267-5084f48f7014

echo ""
echo "✓ 项目已连接到Expo"
echo ""

# 步骤2：构建APK
echo "=========================================="
echo "步骤2: 构建APK"
echo "=========================================="
echo ""
echo "命令: npx eas-cli@latest build --platform android --profile preview"
echo ""
echo "说明:"
echo "  --platform android: 只构建Android版本"
echo "  --profile preview: 使用preview配置"
echo ""
read -p "是否继续? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 1
fi

npx eas-cli@latest build --platform android --profile preview

echo ""
echo "=========================================="
echo "✓ 构建完成！"
echo "=========================================="
echo ""
echo "APK可以在以下位置下载："
echo "1. EAS构建页面（在浏览器中打开）"
echo "2. 构建页面中的下载链接"
echo ""
echo "或者使用EAS CLI下载："
echo "  eas build:list"
echo "  eas build:view [BUILD_ID]"
echo ""
