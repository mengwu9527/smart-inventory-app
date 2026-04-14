# 自动重新构建APK - 完整指南

## 方案一：使用自动化脚本（推荐）

### macOS / Linux

#### 快速构建（非交互式）

```bash
cd /workspace/projects
./build-apk-local.sh
```

**脚本会自动执行以下步骤**：
1. ✅ 安装依赖
2. ✅ 生成Android原生项目
3. ✅ 配置SDK路径
4. ✅ 构建Debug APK
5. ✅ 复制APK到项目根目录

#### 详细构建（交互式）

```bash
cd /workspace/projects
./scripts/build-apk-local.sh
```

**脚本特点**：
- 🔍 自动检查环境（Node.js、Java、Android SDK）
- ✅ 版本验证
- 📊 实时进度显示
- 🎯 并行构建选项
- 📦 自动复制APK

### Windows

#### 使用PowerShell脚本

创建 `build-apk-windows.ps1`：

```powershell
# 设置错误处理
$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  智慧记AI进销存 - Windows APK构建" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# 设置项目目录
$PROJECT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$CLIENT_DIR = Join-Path $PROJECT_ROOT "client"

Write-Host "项目目录: $PROJECT_ROOT" -ForegroundColor Yellow
Write-Host ""

# 1. 安装依赖
Write-Host "1. 安装依赖..." -ForegroundColor Cyan
Set-Location $PROJECT_ROOT
pnpm install
Write-Host "✓ 依赖安装完成" -ForegroundColor Green
Write-Host ""

# 2. 生成Android项目
Write-Host "2. 生成Android原生项目..." -ForegroundColor Cyan
Set-Location $CLIENT_DIR
npx expo prebuild --platform android --clean
Write-Host "✓ Android原生项目生成完成" -ForegroundColor Green
Write-Host ""

# 3. 配置SDK路径
Write-Host "3. 配置SDK路径..." -ForegroundColor Cyan
$ANDROID_HOME = $env:ANDROID_HOME
if (-not $ANDROID_HOME) {
    Write-Host "错误: 请设置 ANDROID_HOME 环境变量" -ForegroundColor Red
    Write-Host "示例: set ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk" -ForegroundColor Yellow
    exit 1
}
$sdkPath = "sdk.dir=$ANDROID_HOME"
$sdkPath | Out-File -FilePath (Join-Path $CLIENT_DIR "android\local.properties") -Encoding utf8
Write-Host "✓ local.properties 配置完成" -ForegroundColor Green
Write-Host ""

# 4. 构建APK
Write-Host "4. 构建APK（这可能需要30-60分钟）..." -ForegroundColor Cyan
Set-Location (Join-Path $CLIENT_DIR "android")
.\gradlew.bat assembleDebug
Write-Host "✓ APK构建完成" -ForegroundColor Green
Write-Host ""

# 5. 复制APK
Write-Host "5. 复制APK..." -ForegroundColor Cyan
$apkSource = Join-Path $CLIENT_DIR "android\app\build\outputs\apk\debug\app-debug.apk"
$date = Get-Date -Format "yyyyMMdd"
$apkDest = Join-Path $PROJECT_ROOT "智慧记AI进销存-v1.0.0-$date.apk"

Copy-Item $apkSource $apkDest
Write-Host "✓ APK已复制到: $apkDest" -ForegroundColor Green
Write-Host ""

# 完成
Write-Host "==========================================" -ForegroundColor Green
Write-Host "✓ 构建完成！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "APK文件位置:"
Write-Host "  $apkDest" -ForegroundColor Yellow
Write-Host ""
Write-Host "文件大小:"
Get-Item $apkDest | Format-Table Name, @{Name="Size";Expression={"{0:N2} MB" -f ($_.Length/1MB)}} -AutoSize
Write-Host ""
```

**使用方法**：

```powershell
# 在项目根目录
.\build-apk-windows.ps1
```

## 方案二：使用Docker构建（最稳定）

### 创建Docker构建环境

创建 `Dockerfile.android`：

```dockerfile
FROM ubuntu:22.04

# 安装基础工具
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    wget \
    && rm -rf /var/lib/apt/lists/*

# 安装Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

# 安装pnpm
RUN npm install -g pnpm

# 安装Java 17
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    && rm -rf /var/lib/apt/lists/*

# 设置Java环境
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

# 安装Android SDK
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$PATH

RUN mkdir -p $ANDROID_HOME/cmdline-tools && \
    cd /tmp && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip && \
    unzip commandlinetools-linux-11076708_latest.zip && \
    mv cmdline-tools $ANDROID_HOME/cmdline-tools/latest

# 安装Android SDK组件
RUN yes | sdkmanager --licenses && \
    sdkmanager "platforms;android-34" \
                "build-tools;34.0.0" \
                "platform-tools" \
                "ndk;27.1.12297006"

# 设置工作目录
WORKDIR /workspace

# 安装项目依赖
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# 复制项目文件
COPY . .

# 构建APK
RUN cd client && \
    npx expo prebuild --platform android --clean && \
    echo "sdk.dir=/opt/android-sdk" > android/local.properties && \
    cd android && \
    ./gradlew assembleDebug

# 复制APK到输出目录
RUN cp client/android/app/build/outputs/apk/debug/app-debug.apk /output/智慧记AI进销存-v1.0.0.apk
```

### 使用Docker构建

创建 `docker-build.sh`：

```bash
#!/bin/bash

echo "=========================================="
echo "  使用Docker构建APK"
echo "=========================================="
echo ""

# 创建输出目录
mkdir -p output

# 构建Docker镜像
echo "1. 构建Docker镜像（这可能需要10-20分钟）..."
docker build -t jxc-app:latest -f Dockerfile.android .

# 运行容器并复制APK
echo "2. 运行容器..."
docker run --rm -v "$(pwd)/output:/output" jxc-app:latest

echo ""
echo "=========================================="
echo "✓ 构建完成！"
echo "=========================================="
echo ""
echo "APK文件位置:"
ls -lh output/智慧记AI进销存-v1.0.0.apk
echo ""
```

**使用方法**：

```bash
cd /workspace/projects
chmod +x docker-build.sh
./docker-build.sh
```

## 方案三：使用GitHub Actions（云端自动化）

### 创建GitHub Actions工作流

创建 `.github/workflows/build-android.yml`：

```yaml
name: Build Android APK

on:
  workflow_dispatch:
    inputs:
      version:
        description: '版本号'
        required: true
        default: '1.0.0'

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'

    - name: Install pnpm
      run: npm install -g pnpm

    - name: Install dependencies
      run: pnpm install

    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        distribution: 'zulu'
        java-version: '17'

    - name: Setup Android SDK
      uses: android-actions/setup-android@v2

    - name: Cache Gradle packages
      uses: actions/cache@v3
      with:
        path: |
          ~/.gradle/caches
          ~/.gradle/wrapper
        key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
        restore-keys: |
          ${{ runner.os }}-gradle-

    - name: Generate Android project
      run: |
        cd client
        npx expo prebuild --platform android --clean

    - name: Build APK
      run: |
        cd client/android
        ./gradlew assembleDebug

    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: jxc-app-debug-${{ github.run_number }}
        path: client/android/app/build/outputs/apk/debug/app-debug.apk

    - name: Create Release
      if: startsWith(github.ref, 'refs/tags/')
      uses: softprops/action-gh-release@v1
      with:
        files: client/android/app/build/outputs/apk/debug/app-debug.apk
        draft: false
        prerelease: true
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**使用方法**：

1. 将项目推送到GitHub
2. 在GitHub Actions页面点击"Run workflow"
3. 等待构建完成（约30-60分钟）
4. 在Actions页面下载APK

## 方案四：使用Expo EAS（最简单）

### 自动化EAS构建

创建 `eas-build.sh`：

```bash
#!/bin/bash

echo "=========================================="
echo "  使用EAS构建APK"
echo "=========================================="
echo ""

# 检查EAS CLI
if ! command -v eas &> /dev/null; then
    echo "安装EAS CLI..."
    npm install -g eas-cli
fi

# 检查登录状态
if ! eas whoami &> /dev/null; then
    echo "请先登录Expo账号："
    eas login
fi

# 构建APK
echo "开始构建APK（这需要10-15分钟）..."
cd client
eas build --platform android --profile preview

echo ""
echo "=========================================="
echo "✓ 构建完成！"
echo "=========================================="
echo ""
echo "APK可以在EAS网站下载:"
echo "https://expo.dev/accounts/[your-account]/projects/[project-id]/builds"
echo ""
```

**使用方法**：

```bash
cd /workspace/projects
chmod +x eas-build.sh
./eas-build.sh
```

## 推荐方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **自动化脚本** | 快速、本地运行、无需额外工具 | 需要配置本地环境 | 开发者、测试人员 |
| **Docker构建** | 环境隔离、稳定、可重复 | 需要安装Docker | CI/CD、团队协作 |
| **GitHub Actions** | 完全自动化、云端运行 | 需要GitHub账号 | 开源项目、团队协作 |
| **EAS构建** | 最简单、无需配置环境 | 需要Expo账号 | 快速发布、测试 |

## 快速开始

### 最简单的方式（推荐新手）

```bash
# 1. 安装EAS CLI
npm install -g eas-cli

# 2. 登录Expo账号
eas login

# 3. 构建APK
cd /workspace/projects/client
eas build --platform android --profile preview
```

### 最本地化的方式（推荐有本地环境的开发者）

```bash
# 1. 使用自动化脚本
cd /workspace/projects
./build-apk-local.sh

# 或使用详细脚本
./scripts/build-apk-local.sh
```

### 最稳定的方式（推荐团队使用）

```bash
# 1. 安装Docker
# 2. 使用Docker构建
cd /workspace/projects
./docker-build.sh
```

## 故障排除

### 问题：构建失败

**解决方案**：
1. 检查Java版本：`java -version`
2. 检查Android SDK：`echo $ANDROID_HOME`
3. 清理缓存：`rm -rf ~/.gradle/caches`
4. 重新运行构建脚本

### 问题：构建超时

**解决方案**：
1. 使用并行构建：`./gradlew assembleDebug --parallel`
2. 增加内存：`export GRADLE_OPTS="-Xmx4g"`
3. 使用EAS构建：`eas build --platform android`

### 问题：依赖安装失败

**解决方案**：
1. 删除node_modules：`rm -rf node_modules`
2. 清理pnpm缓存：`pnpm store prune`
3. 重新安装：`pnpm install`

## 技术支持

如遇问题，请参考：
- [LOCAL_BUILD_GUIDE.md](./LOCAL_BUILD_GUIDE.md) - 详细本地构建指南
- [BUILD.md](./BUILD.md) - APK构建指南
- [EAS文档](https://docs.expo.dev/build/introduction/) - EAS构建文档
