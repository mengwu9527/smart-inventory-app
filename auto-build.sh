#!/bin/bash

# 智慧记AI进销存 - 自动构建选择器
# 使用方法: ./auto-build.sh

set -e

echo "=========================================="
echo "  智慧记AI进销存 - 自动APK构建"
echo "=========================================="
echo ""
echo "请选择构建方式："
echo ""
echo "  1) EAS云构建（推荐，最简单）"
echo "  2) 本地脚本构建（快速）"
echo "  3) Docker构建（最稳定）"
echo "  4) 退出"
echo ""
read -p "请输入选项 (1-4): " choice

case $choice in
    1)
        echo ""
        echo "=========================================="
        echo "  方式1: EAS云构建"
        echo "=========================================="
        echo ""

        # 检查EAS CLI
        if ! command -v eas &> /dev/null; then
            echo "安装EAS CLI..."
            npm install -g eas-cli
        fi

        # 检查登录状态
        if ! eas whoami &> /dev/null; then
            echo ""
            echo "请先登录Expo账号："
            eas login
            if [ $? -ne 0 ]; then
                echo "登录失败，请检查网络连接"
                exit 1
            fi
        fi

        # 构建APK
        echo ""
        echo "开始构建APK（这需要10-15分钟）..."
        echo "构建页面将自动打开，请在浏览器中关注构建进度"
        echo ""
        cd client
        eas build --platform android --profile preview

        if [ $? -eq 0 ]; then
            echo ""
            echo "=========================================="
            echo "✓ 构建完成！"
            echo "=========================================="
            echo ""
            echo "APK可以在EAS网站下载"
            echo ""
        else
            echo "构建失败，请查看错误信息"
            exit 1
        fi
        ;;

    2)
        echo ""
        echo "=========================================="
        echo "  方式2: 本地脚本构建"
        echo "=========================================="
        echo ""

        # 检查环境
        echo "检查环境..."
        if ! command -v java &> /dev/null; then
            echo "错误: 未找到Java"
            echo "请先安装Java 17: https://adoptium.net/"
            exit 1
        fi

        if [ -z "$ANDROID_HOME" ]; then
            echo "错误: ANDROID_HOME 环境变量未设置"
            echo ""
            echo "请设置 ANDROID_HOME 环境变量："
            echo "  macOS: export ANDROID_HOME=/Users/yourname/Library/Android/Sdk"
            echo "  Linux: export ANDROID_HOME=/home/yourname/Android"
            echo "  Windows: set ANDROID_HOME=C:\\Users\\yourname\\AppData\\Local\\Android\\Sdk"
            echo ""
            read -p "是否继续？(y/n) " -n 1 -r
            echo ""
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi

        # 运行构建脚本
        echo ""
        echo "开始构建（这可能需要30-60分钟）..."
        echo ""
        ./build-apk-local.sh

        if [ $? -eq 0 ]; then
            echo ""
            echo "=========================================="
            echo "✓ 构建完成！"
            echo "=========================================="
            echo ""
            echo "APK文件已保存到项目根目录"
            echo ""
        else
            echo "构建失败"
            exit 1
        fi
        ;;

    3)
        echo ""
        echo "=========================================="
        echo "  方式3: Docker构建"
        echo "=========================================="
        echo ""

        # 检查Docker
        if ! command -v docker &> /dev/null; then
            echo "错误: 未找到Docker"
            echo "请先安装Docker: https://www.docker.com/products/docker-desktop"
            exit 1
        fi

        # 检查Docker是否运行
        if ! docker info &> /dev/null; then
            echo "错误: Docker未运行"
            echo "请启动Docker Desktop"
            exit 1
        fi

        # 运行Docker构建
        echo "开始Docker构建（这可能需要20-40分钟）..."
        echo ""
        ./docker-build.sh

        if [ $? -eq 0 ]; then
            echo ""
            echo "=========================================="
            echo "✓ 构建完成！"
            echo "=========================================="
            echo ""
            echo "APK文件已保存到 output/ 目录"
            ls -lh output/智慧记AI进销存-v1.0.0.apk
            echo ""
        else
            echo "构建失败"
            exit 1
        fi
        ;;

    4)
        echo ""
        echo "退出构建"
        exit 0
        ;;

    *)
        echo ""
        echo "无效选项"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "  构建完成！"
echo "=========================================="
echo ""
echo "下一步："
echo "  1. 将APK传输到Android设备"
echo "  2. 在设备上安装APK"
echo "  3. 开始使用应用"
echo ""
echo "技术支持："
echo "  - 查看 AUTO_BUILD_GUIDE.md 了解更多构建方式"
echo "  - 查看 LOCAL_BUILD_GUIDE.md 了解本地构建详情"
echo "  - 查看 USER_GUIDE.md 了解应用使用方法"
echo ""
