# 智慧记AI进销存 - Windows自动构建脚本
# 使用方法: 右键 -> 使用PowerShell运行

Write-Host "==========================================" -ForegroundColor Green
Write-Host "  智慧记AI进销存 - Windows APK构建" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "请选择构建方式：" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1) EAS云构建（推荐，最简单）"
Write-Host "  2) 本地脚本构建"
Write-Host "  3) Docker构建"
Write-Host "  4) 退出"
Write-Host ""

$choice = Read-Host "请输入选项 (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "==========================================" -ForegroundColor Green
        Write-Host "  方式1: EAS云构建" -ForegroundColor Green
        Write-Host "==========================================" -ForegroundColor Green
        Write-Host ""

        # 检查EAS CLI
        if (-not (Get-Command eas -ErrorAction SilentlyContinue)) {
            Write-Host "安装EAS CLI..." -ForegroundColor Yellow
            npm install -g eas-cli
        }

        # 检查登录状态
        try {
            eas whoami | Out-Null
        } catch {
            Write-Host ""
            Write-Host "请先登录Expo账号：" -ForegroundColor Yellow
            eas login
            if ($LASTEXITCODE -ne 0) {
                Write-Host "登录失败，请检查网络连接" -ForegroundColor Red
                exit 1
            }
        }

        # 构建APK
        Write-Host ""
        Write-Host "开始构建APK（这需要10-15分钟）..." -ForegroundColor Cyan
        Write-Host "构建页面将自动打开，请在浏览器中关注构建进度"
        Write-Host ""
        Set-Location client
        eas build --platform android --profile preview

        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "==========================================" -ForegroundColor Green
            Write-Host "✓ 构建完成！" -ForegroundColor Green
            Write-Host "==========================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "APK可以在EAS网站下载"
            Write-Host ""
        } else {
            Write-Host "构建失败，请查看错误信息" -ForegroundColor Red
            exit 1
        }
    }

    "2" {
        Write-Host ""
        Write-Host "==========================================" -ForegroundColor Green
        Write-Host "  方式2: 本地脚本构建" -ForegroundColor Green
        Write-Host "==========================================" -ForegroundColor Green
        Write-Host ""

        # 检查Java
        if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
            Write-Host "错误: 未找到Java" -ForegroundColor Red
            Write-Host "请先安装Java 17: https://adoptium.net/"
            exit 1
        }

        # 检查ANDROID_HOME
        if (-not $env:ANDROID_HOME) {
            Write-Host "错误: ANDROID_HOME 环境变量未设置" -ForegroundColor Red
            Write-Host ""
            Write-Host "请设置 ANDROID_HOME 环境变量：" -ForegroundColor Yellow
            Write-Host "  Windows: set ANDROID_HOME=C:\Users\yourname\AppData\Local\Android\Sdk"
            Write-Host "  或在系统环境变量中添加"
            Write-Host ""
            $continue = Read-Host "是否继续？(y/n)"
            if ($continue -ne "y") {
                exit 1
            }
        }

        # 运行构建
        Write-Host ""
        Write-Host "开始构建（这可能需要30-60分钟）..." -ForegroundColor Cyan
        Write-Host ""

        # 执行构建步骤
        $PROJECT_ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
        $CLIENT_DIR = Join-Path $PROJECT_ROOT "client"

        # 安装依赖
        Write-Host "1. 安装依赖..." -ForegroundColor Yellow
        Set-Location $PROJECT_ROOT
        pnpm install

        # 生成Android项目
        Write-Host "2. 生成Android原生项目..." -ForegroundColor Yellow
        Set-Location $CLIENT_DIR
        npx expo prebuild --platform android --clean

        # 配置SDK路径
        Write-Host "3. 配置SDK路径..." -ForegroundColor Yellow
        if ($env:ANDROID_HOME) {
            $sdkPath = "sdk.dir=$($env:ANDROID_HOME)"
            $sdkPath | Out-File -FilePath (Join-Path $CLIENT_DIR "android\local.properties") -Encoding utf8
        }

        # 构建APK
        Write-Host "4. 构建APK..." -ForegroundColor Yellow
        Set-Location (Join-Path $CLIENT_DIR "android")
        .\gradlew.bat assembleDebug

        # 复制APK
        Write-Host "5. 复制APK..." -ForegroundColor Yellow
        $apkSource = Join-Path $CLIENT_DIR "android\app\build\outputs\apk\debug\app-debug.apk"
        $date = Get-Date -Format "yyyyMMdd"
        $apkDest = Join-Path $PROJECT_ROOT "智慧记AI进销存-v1.0.0-$date.apk"

        Copy-Item $apkSource $apkDest

        if (Test-Path $apkDest) {
            Write-Host ""
            Write-Host "==========================================" -ForegroundColor Green
            Write-Host "✓ 构建完成！" -ForegroundColor Green
            Write-Host "==========================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "APK文件: $apkDest" -ForegroundColor Yellow
            Write-Host ""
            Get-Item $apkDest | Format-Table Name, @{Name="Size";Expression={"{0:N2} MB" -f ($_.Length/1MB)}} -AutoSize
        } else {
            Write-Host "构建失败" -ForegroundColor Red
            exit 1
        }
    }

    "3" {
        Write-Host ""
        Write-Host "==========================================" -ForegroundColor Green
        Write-Host "  方式3: Docker构建" -ForegroundColor Green
        Write-Host "==========================================" -ForegroundColor Green
        Write-Host ""

        # 检查Docker
        if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
            Write-Host "错误: 未找到Docker" -ForegroundColor Red
            Write-Host "请先安装Docker Desktop: https://www.docker.com/products/docker-desktop"
            exit 1
        }

        # 检查Docker是否运行
        try {
            docker info | Out-Null
        } catch {
            Write-Host "错误: Docker未运行" -ForegroundColor Red
            Write-Host "请启动Docker Desktop"
            exit 1
        }

        # 运行Docker构建
        Write-Host "开始Docker构建（这可能需要20-40分钟）..." -ForegroundColor Cyan
        Write-Host ""
        .\docker-build.ps1

        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "==========================================" -ForegroundColor Green
            Write-Host "✓ 构建完成！" -ForegroundColor Green
            Write-Host "==========================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "APK文件已保存到 output/ 目录" -ForegroundColor Yellow
            Get-Item output\智慧记AI进销存-v1.0.0.apk | Format-Table Name, @{Name="Size";Expression={"{0:N2} MB" -f ($_.Length/1MB)}} -AutoSize
        } else {
            Write-Host "构建失败" -ForegroundColor Red
            exit 1
        }
    }

    "4" {
        Write-Host ""
        Write-Host "退出构建" -ForegroundColor Yellow
        exit 0
    }

    default {
        Write-Host ""
        Write-Host "无效选项" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  构建完成！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "下一步：" -ForegroundColor Cyan
Write-Host "  1. 将APK传输到Android设备"
Write-Host "  2. 在设备上安装APK"
Write-Host "  3. 开始使用应用"
Write-Host ""
Write-Host "技术支持：" -ForegroundColor Cyan
Write-Host "  - 查看 AUTO_BUILD_GUIDE.md 了解更多构建方式"
Write-Host "  - 查看 LOCAL_BUILD_GUIDE.md 了解本地构建详情"
Write-Host "  - 查看 USER_GUIDE.md 了解应用使用方法"
Write-Host ""
