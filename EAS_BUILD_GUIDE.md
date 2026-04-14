# EAS云构建指南

## 为什么使用EAS云构建？

云端沙箱环境会定期清理长时间运行的进程和工具链（如Java、Android SDK），导致本地构建无法完成。EAS云构建在Expo云端服务器运行，不受此限制。

## 构建优势

- ⚡ **快速**：10-15分钟完成（本地构建需要30-60分钟）
- ✅ **稳定**：云端环境不会超时或清理
- 📊 **可视**：浏览器实时查看构建进度
- 🔧 **自动**：自动处理签名和SDK问题

## 构建步骤

### 步骤1：安装EAS CLI

在你的本地电脑（不是云端）执行：

```bash
npm install -g eas-cli
```

### 步骤2：登录Expo账号

```bash
eas login
```

系统会提示访问链接获取访问令牌，复制令牌到命令行即可。

**注意**：如果没有Expo账号，请先注册：https://expo.dev/signup（免费）

### 步骤3：构建APK

```bash
cd /workspace/projects/client
eas build --platform android --profile preview
```

或者使用快速构建脚本：

```bash
bash scripts/build-with-eas.sh
```

### 步骤4：查看构建进度

构建开始后，会自动打开浏览器页面，可以实时查看：

- 构建状态
- 构建日志
- 预计完成时间

也可以通过命令行查看：

```bash
eas build:list
```

### 步骤5：下载APK

构建完成后：

1. 在浏览器中点击下载链接
2. 或使用命令行下载：
   ```bash
   eas build:view [BUILD_ID]
   ```

## 构建配置说明

项目已配置好EAS构建配置（`client/eas.json`）：

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    }
  }
}
```

**配置说明**：
- `buildType: "apk"`：生成APK文件（而非AAB）
- `gradleCommand: ":app:assembleDebug"`：构建Debug版本
- `distribution: "internal"`：内部测试版本

## 常见问题

### Q1: 构建失败怎么办？

A: 查看构建日志，常见问题：
- 依赖冲突：检查`package.json`
- 代码错误：查看错误堆栈
- SDK问题：EAS会自动处理

### Q2: 需要多久？

A: 通常10-15分钟：
- 前端准备：3-5分钟
- 依赖下载：2-3分钟
- 编译打包：5-7分钟

### Q3: 需要费用吗？

A: 免费构建额度：
- 免费账号：每月15次构建
- 个人账号：每月60次构建

### Q4: 如何生成Release版本？

A: 修改`eas.json`，使用`production`配置：
```bash
eas build --platform android --profile production
```

## 本地构建（备用方案）

如果必须本地构建，需要：

### 1. 完整的本地环境
- Android Studio
- Java 17 JDK
- Android SDK
- NDK 27.1.12297006

### 2. 构建步骤
```bash
cd client/android
./gradlew assembleDebug
```

### 3. 注意事项
- 首次构建需要30-60分钟
- 确保网络稳定（下载依赖）
- 磁盘空间至少10GB

## 构建产物

构建完成后，APK文件：
- **文件名**：`app-debug.apk` 或 `app-release.apk`
- **位置**：浏览器下载或命令行下载
- **大小**：约50-80MB

## 快速构建脚本

项目已提供快速构建脚本（`scripts/build-with-eas.sh`）：

```bash
cd /workspace/projects
bash scripts/build-with-eas.sh
```

脚本会自动：
1. 检查EAS CLI是否安装
2. 检查是否已登录
3. 启动构建
4. 显示构建进度

## 获取帮助

- EAS文档：https://docs.expo.dev/build/introduction/
- 构建问题：https://forums.expo.dev/
- 联系支持：https://expo.dev/contact

---

**重要提示**：
- 请在本地电脑执行EAS构建命令
- 云端沙箱环境无法完成长时间构建
- EAS云构建是当前唯一可行的快速方案
