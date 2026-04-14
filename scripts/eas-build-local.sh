#!/bin/bash
# EAS云构建 - 完整执行指南
# 在本地电脑上执行此脚本

set -e

echo "=========================================="
echo "  智慧记AI进销存 - EAS云构建"
echo "=========================================="
echo ""
echo "开始时间: $(date)"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查Node.js
echo "=== 步骤0: 检查环境 ==="
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ 错误: 未找到Node.js${NC}"
    echo "请先安装Node.js: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✓ Node.js已安装: $NODE_VERSION${NC}"
echo -e "${GREEN}✓ npm已安装: $NPM_VERSION${NC}"
echo ""

# 步骤1: 安装EAS CLI
echo "=== 步骤1: 安装EAS CLI ==="
echo "命令: npm install -g eas-cli"
echo ""

read -p "是否安装EAS CLI? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm install -g eas-cli
    echo -e "${GREEN}✓ EAS CLI安装完成${NC}"
else
    echo "跳过安装，假设已安装"
fi

# 验证EAS CLI
if command -v eas &> /dev/null; then
    EAS_VERSION=$(eas --version | grep -oP '(?<=EAS CLI/)\S+')
    echo -e "${GREEN}✓ EAS CLI版本: $EAS_VERSION${NC}"
else
    echo -e "${YELLOW}注意: 将使用npx运行EAS CLI${NC}"
fi
echo ""

# 步骤2: 登录Expo账号
echo "=== 步骤2: 登录Expo账号 ==="
echo ""
echo "如果您还没有Expo账号，请先注册:"
echo "https://expo.dev/signup"
echo ""
echo "登录后，EAS CLI会打开浏览器让您授权"
echo ""

read -p "是否登录Expo账号? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v eas &> /dev/null; then
        eas login
    else
        npx eas-cli@latest login
    fi

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 登录成功${NC}"
    else
        echo -e "${RED}✗ 登录失败${NC}"
        exit 1
    fi
else
    echo "跳过登录，假设已登录"
fi
echo ""

# 步骤3: 进入项目目录
echo "=== 步骤3: 进入项目目录 ==="
PROJECT_DIR="/workspace/projects/client"

if [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"
    echo -e "${GREEN}✓ 已进入项目目录: $PROJECT_DIR${NC}"
else
    echo -e "${RED}✗ 错误: 项目目录不存在: $PROJECT_DIR${NC}"
    echo "请确认项目路径是否正确"
    exit 1
fi
echo ""

# 步骤4: 连接项目到Expo
echo "=== 步骤4: 连接项目到Expo ==="
echo "项目ID: f05dfeb3-bc5b-42c0-b267-5084f48f7014"
echo ""

read -p "是否连接项目到Expo? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "命令: npx eas-cli@latest init --id f05dfeb3-bc5b-42c0-b267-5084f48f7014"
    echo ""

    npx eas-cli@latest init --id f05dfeb3-bc5b-42c0-b267-5084f48f7014

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ 项目已连接到Expo${NC}"
    else
        echo -e "${YELLOW}注意: 连接失败，可能是已连接或其他问题${NC}"
        read -p "是否继续构建? (y/n) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
else
    echo "跳过连接，假设已连接"
fi
echo ""

# 步骤5: 构建APK
echo "=== 步骤5: 构建Android APK ==="
echo ""
echo "构建配置:"
echo "  - 平台: Android"
echo "  - 配置: preview"
echo "  - 类型: Debug APK"
echo "  - 预计时间: 10-15分钟"
echo ""

read -p "是否开始构建? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "命令: npx eas-cli@latest build --platform android --profile preview"
    echo ""
    echo -e "${YELLOW}构建开始后，浏览器将自动打开构建页面${NC}"
    echo -e "${YELLOW}您可以在浏览器中查看构建进度${NC}"
    echo ""
    echo "正在启动构建..."
    echo ""

    npx eas-cli@latest build --platform android --profile preview

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}=========================================="
        echo "  ✓ 构建完成！"
        echo "==========================================${NC}"
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
        echo -e "${RED}=========================================="
        echo "  ✗ 构建失败"
        echo "==========================================${NC}"
        echo ""
        echo "请检查构建日志，并参考以下文档："
        echo "- EAS_BUILD_GUIDE.md"
        echo "- BUILD_SOLUTION.md"
        echo ""
        exit 1
    fi
else
    echo "取消构建"
    exit 0
fi

echo "完成时间: $(date)"
echo ""
echo -e "${GREEN}=========================================="
echo "  所有步骤完成！"
echo "==========================================${NC}"
