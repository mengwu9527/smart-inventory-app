#!/bin/bash

# 智慧记AI进销存 - EAS快速构建脚本
# 使用方法: ./scripts/build-with-eas.sh

set -e

echo "=========================================="
echo "  使用EAS云构建APK"
echo "=========================================="
echo ""
echo "EAS云构建的优势："
echo "  ✅ 构建速度快（10-15分钟 vs 30-60分钟）"
echo "  ✅ 云端运行，无需本地环境配置"
echo "  ✅ 自动处理Android SDK和网络问题"
echo "  ✅ 浏览器实时查看构建进度"
echo "  ✅ 自动处理签名"
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js"
    echo "请先安装Node.js: https://nodejs.org/"
    exit 1
fi

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到npm"
    exit 1
fi

# 安装EAS CLI
echo ""
echo "步骤1: 检查EAS CLI"
echo ""
if ! command -v eas &> /dev/null; then
    echo "安装EAS CLI..."
    npm install -g eas-cli
    echo "✓ EAS CLI安装完成"
else
    echo "✓ EAS CLI已安装"
    eas --version
fi

# 检查登录状态
echo ""
echo "步骤2: 检查登录状态"
echo ""
if ! eas whoami &> /dev/null; then
    echo "需要登录Expo账号"
    echo ""
    echo "请访问以下链接获取访问令牌："
    echo "https://expo.dev/"
    echo ""
    eas login
    if [ $? -ne 0 ]; then
        echo "❌ 登录失败"
        echo "请检查网络连接并重试"
        exit 1
    fi
else
    echo "✓ 已登录"
    eas whoami
fi

# 构建APK
echo ""
echo "步骤3: 开始构建APK"
echo ""
echo "正在启动构建..."
echo "构建页面将自动在浏览器中打开"
echo "请关注浏览器中的构建进度"
echo ""
echo "预计时间: 10-15分钟"
echo ""

cd /workspace/projects/client
eas build --platform android --profile preview

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✓ 构建成功！"
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
else
    echo ""
    echo "=========================================="
    echo "❌ 构建失败"
    echo "=========================================="
    echo ""
    echo "请检查错误信息并重试"
    echo "常见问题："
    echo "  1. 网络连接问题"
    echo "  2. Expo账号未登录"
    echo "  3. 项目配置问题"
    echo ""
    echo "查看详细日志："
    echo "  eas build:view [BUILD_ID]"
    echo ""
    exit 1
fi

echo ""
echo "=========================================="
echo "  构建完成！"
echo "=========================================="
echo ""
echo "下一步："
echo "  1. 在浏览器中打开EAS构建页面"
echo "  2. 下载APK文件"
echo "  3. 传输到Android设备"
echo "  4. 安装并使用"
echo ""
echo "技术支持："
echo "  - 查看 BUILD_IN_PROGRESS.md 了解构建状态"
echo "  - 查看 AUTO_BUILD_GUIDE.md 了解其他构建方式"
echo "  - 查看 EAS文档: https://docs.expo.dev/build/introduction/"
echo ""
