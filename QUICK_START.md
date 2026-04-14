# 🚀 快速开始 - 自动构建APK

## 一键构建

### macOS / Linux / Git Bash

```bash
cd /workspace/projects
./auto-build.sh
```

### Windows (PowerShell)

```powershell
cd C:\path\to\workspace\projects
.\auto-build.ps1
```

脚本会自动检测环境并提供4种构建方式供选择。

---

## 构建方式对比

| 方式 | 时间 | 难度 | 适用场景 | 推荐度 |
|------|------|------|----------|--------|
| **EAS云构建** | 10-15分钟 | ⭐ 简单 | 快速测试、发布 | ⭐⭐⭐⭐⭐ |
| **本地脚本** | 30-60分钟 | ⭐⭐ 中等 | 开发、调试 | ⭐⭐⭐⭐ |
| **Docker构建** | 20-40分钟 | ⭐⭐ 中等 | CI/CD、团队 | ⭐⭐⭐⭐ |
| **手动构建** | 30-60分钟 | ⭐⭐⭐ 复杂 | 自定义需求 | ⭐⭐⭐ |

---

## 详细步骤

### 方式1: EAS云构建（强烈推荐）

**适合**：新手、快速测试、不想配置本地环境

```bash
# 1. 安装EAS CLI
npm install -g eas-cli

# 2. 登录Expo账号
eas login

# 3. 构建APK
cd /workspace/projects/client
eas build --platform android --profile preview

# 4. 在浏览器中查看构建进度
# 5. 构建完成后下载APK
```

**优势**：
- ✅ 最简单，无需配置本地环境
- ✅ 构建速度快（10-15分钟）
- ✅ 云端环境稳定
- ✅ 自动处理签名

### 方式2: 本地脚本构建

**适合**：有本地开发环境、需要自定义配置

```bash
cd /workspace/projects
./build-apk-local.sh
```

**脚本自动完成**：
1. ✅ 安装依赖
2. ✅ 生成Android原生项目
3. ✅ 配置SDK路径
4. ✅ 构建Debug APK
5. ✅ 复制APK到项目根目录

**前置要求**：
- Node.js 20+
- Java 17
- Android SDK (API 34)
- 环境变量：`ANDROID_HOME`

### 方式3: Docker构建

**适合**：团队协作、CI/CD、需要隔离环境

```bash
cd /workspace/projects
./docker-build.sh
```

**优势**：
- ✅ 环境隔离，不污染本地环境
- ✅ 构建结果一致
- ✅ 易于团队共享

### 方式4: 手动构建

**适合**：需要完全控制构建过程

详见 [LOCAL_BUILD_GUIDE.md](./LOCAL_BUILD_GUIDE.md)

---

## 环境检查

### 快速检查

```bash
# 检查Node.js
node --version  # 需要 >= 20.0

# 检查pnpm
pnpm --version  # 需要 >= 8.0

# 检查Java
java -version  # 需要 Java 17

# 检查Android SDK
echo $ANDROID_HOME
```

### 环境配置

#### Java 17

**macOS**:
```bash
brew install openjdk@17
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
```

**Linux**:
```bash
sudo apt-get install openjdk-17-jdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

**Windows**:
下载并安装：https://adoptium.net/

#### Android SDK

**macOS**:
```bash
brew install --cask android-commandlinetools
export ANDROID_HOME=$HOME/Library/Android/sdk
```

**Linux**:
```bash
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip commandlinetools-linux-11076708_latest.zip
mkdir -p ~/Android/cmdline-tools
mv cmdline-tools ~/Android/cmdline-tools/latest
export ANDROID_HOME=$HOME/Android
```

**Windows**:
下载 [Android Studio](https://developer.android.com/studio)，安装时勾选Android SDK。

---

## 常见问题

### Q1: 构建失败，提示"Java版本错误"

**解决**:
```bash
# 确保使用Java 17
java -version

# 如果版本不对，切换Java版本
# macOS
/usr/libexec/java_home -v 17

# Linux
sudo update-alternatives --config java
```

### Q2: 构建失败，提示"ANDROID_HOME未找到"

**解决**:
```bash
# 设置环境变量
export ANDROID_HOME=/path/to/Android/Sdk
export PATH=$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$PATH
```

### Q3: 构建很慢或卡住

**解决**:
```bash
# 使用并行构建
./gradlew assembleDebug --parallel

# 增加内存
export GRADLE_OPTS="-Xmx4g -XX:MaxMetaspaceSize=1g"

# 清理缓存
rm -rf ~/.gradle/caches
```

### Q4: 磁盘空间不足

**解决**:
```bash
# 清理Gradle缓存
rm -rf ~/.gradle/caches

# 清理Android缓存
rm -rf ~/.android/cache

# 清理构建缓存
./gradlew clean
```

### Q5: 网络问题，依赖下载失败

**解决**:
```bash
# 使用国内镜像
cat > ~/.gradle/init.gradle << EOF
allprojects {
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/public' }
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
        google()
        mavenCentral()
    }
}
EOF
```

---

## 构建后验证

### 检查APK文件

```bash
# 查看APK信息
ls -lh 智慧记AI进销存-*.apk

# 使用aapt工具检查
$ANDROID_HOME/build-tools/34.0.0/aapt dump badging 智慧记AI进销存-*.apk
```

### 安装到设备测试

```bash
# 连接设备
adb devices

# 安装APK
adb install 智慧记AI进销存-*.apk

# 查看日志
adb logcat | grep "expo"
```

---

## 输出文件

### APK位置

**脚本构建**:
```
/workspace/projects/智慧记AI进销存-v1.0.0-YYYYMMDD.apk
```

**手动构建**:
```
/workspace/projects/client/android/app/build/outputs/apk/debug/app-debug.apk
```

**Docker构建**:
```
/workspace/projects/output/智慧记AI进销存-v1.0.0.apk
```

### 文件大小

- Debug APK: 约 50-60 MB
- Release APK: 约 45-55 MB

---

## 进阶配置

### Release版本构建（带签名）

详见 [BUILD.md](./BUILD.md) 中的Release构建部分

### 自定义应用信息

编辑 `client/app.json`:
```json
{
  "expo": {
    "name": "智慧记AI进销存",
    "version": "1.0.0",
    "android": {
      "package": "com.free.jxc.app",
      "versionCode": 1
    }
  }
}
```

---

## 文档索引

| 文档 | 说明 |
|------|------|
| **[QUICK_START.md](./QUICK_START.md)** | 本文档 - 快速开始指南 |
| [AUTO_BUILD_GUIDE.md](./AUTO_BUILD_GUIDE.md) | 自动构建详细指南 |
| [LOCAL_BUILD_GUIDE.md](./LOCAL_BUILD_GUIDE.md) | 本地构建完整指南 |
| [BUILD.md](./BUILD.md) | APK构建技术细节 |
| [APK_QUICK_START.md](./APK_QUICK_START.md) | APK快速使用指南 |
| [RELEASE.md](./RELEASE.md) | 版本发布说明 |
| [USER_GUIDE.md](./USER_GUIDE.md) | 用户使用手册 |

---

## 获取帮助

### 遇到问题？

1. 查看文档：
   - [AUTO_BUILD_GUIDE.md](./AUTO_BUILD_GUIDE.md) - 详细构建指南
   - [LOCAL_BUILD_GUIDE.md](./LOCAL_BUILD_GUIDE.md) - 本地构建完整步骤
   - [BUILD.md](./BUILD.md) - 技术细节

2. 检查日志：
   ```bash
   # 查看构建日志
   cat /tmp/apk-build-new.log

   # 查看Expo日志
   adb logcat | grep "expo"
   ```

3. 使用最简单的方式：
   ```bash
   # 使用EAS构建，最简单可靠
   eas build --platform android --profile preview
   ```

---

## 推荐流程

### 首次构建

1. **新手**: 使用EAS云构建（10-15分钟）
2. **有本地环境**: 使用本地脚本（30-60分钟）
3. **团队协作**: 使用Docker构建（20-40分钟）

### 日常开发

1. 使用Expo Go测试（无需构建）
2. 需要测试原生功能时使用本地构建
3. 发布版本时使用EAS云构建

---

## 总结

**最简单的方式**:
```bash
npm install -g eas-cli
eas login
cd client
eas build --platform android --profile preview
```

**最快的方式**:
```bash
./build-apk-local.sh
```

**最稳定的方式**:
```bash
./docker-build.sh
```

**自动选择**:
```bash
./auto-build.sh
```

选择适合你的方式，开始构建APK吧！🚀
