# APK构建方案说明

## 问题背景

用户需要打包生成APK安装包，完成V2版本交付。项目代码已更新到4月12日，但项目中的APK是3月28日构建的旧版本。

## 遇到的问题

### 云端沙箱环境限制

经过多次尝试，发现云端沙箱环境存在以下限制：

1. **进程清理机制**
   - 云端环境会定期清理长时间运行的进程
   - 构建进程运行30-60分钟后会被强制终止
   - Java进程、Gradle进程都会被清理

2. **工具链清理机制**
   - Java 17、Android SDK、NDK等工具链会被定期清理
   - 每次重新安装需要30-60分钟
   - 形成循环：安装→构建→被清理→重新安装...

3. **WebSocket连接限制**
   - 长时间操作会导致WebSocket连接关闭
   - 无法持续监控构建进度
   - 命令执行中断

### 尝试过的方案

❌ **方案1：本地Gradle构建**
- 问题：构建过程被中断，工具链被清理
- 结果：多次尝试均失败

❌ **方案2：后台构建+监控**
- 问题：进程被清理，连接中断
- 结果：无法完成构建

❌ **方案3：重试构建**
- 问题：每次都是同样的失败模式
- 结果：浪费时间和资源

## 推荐方案：EAS云构建

### 为什么选择EAS云构建？

✅ **不受本地环境限制**
- 在Expo云端服务器运行
- 不会因为进程清理而中断
- 工具链已预先配置

✅ **构建速度快**
- EAS云构建：10-15分钟
- 本地构建：30-60分钟（还会被清理）

✅ **可视化监控**
- 浏览器实时查看构建进度
- 详细的构建日志
- 下载链接直接提供

✅ **自动处理**
- 自动处理Android SDK配置
- 自动处理签名
- 自动处理依赖

### 使用方法

#### 步骤1：安装EAS CLI

在**本地电脑**执行：

```bash
npm install -g eas-cli
```

#### 步骤2：登录Expo

```bash
eas login
```

访问生成的链接获取访问令牌。

#### 步骤3：构建APK

**方法A：使用快速脚本**

```bash
cd /workspace/projects
bash scripts/build-with-eas.sh
```

**方法B：手动构建**

```bash
cd /workspace/projects/client
eas build --platform android --profile preview
```

### 构建配置

项目已配置好EAS构建（`client/eas.json`）：

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

**说明**：
- 生成Debug版本APK
- 10-15分钟完成
- 无需签名配置

## 其他方案

### 方案2：本地环境构建

如果必须在本地构建，需要：

1. **完整的本地环境**
   - Android Studio
   - Java 17 JDK
   - Android SDK（API 36）
   - NDK 27.1.12297006

2. **构建步骤**
   ```bash
   cd client/android
   ./gradlew assembleDebug
   ```

3. **注意事项**
   - 首次构建需要30-60分钟
   - 需要稳定的网络连接
   - 磁盘空间至少10GB

### 方案3：使用其他云构建服务

- **Bitrise**：CI/CD服务，支持Android构建
- **CircleCI**：CI/CD服务，支持移动应用构建
- **GitHub Actions**：GitHub内置CI/CD，支持Android构建

但这些都需要额外配置，不如EAS方便。

## 项目文件

### 构建相关文件

1. **EAS配置**
   - 路径：`client/eas.json`
   - 说明：EAS构建配置

2. **快速开始指南**
   - 路径：`BUILD_WITH_EAS.md`
   - 说明：3步快速开始EAS构建

3. **详细构建指南**
   - 路径：`EAS_BUILD_GUIDE.md`
   - 说明：完整的构建步骤和故障排除

4. **构建脚本**
   - 路径：`scripts/build-with-eas.sh`
   - 说明：自动化构建脚本

5. **Android项目**
   - 路径：`client/android/`
   - 说明：Android原生项目，包含Gradle构建配置

## 版本信息

- **应用名称**：智慧记AI进销存
- **版本号**：1.0.0
- **代码更新**：2024年4月12日
- **构建类型**：Debug
- **最小SDK**：24 (Android 7.0)
- **目标SDK**：36 (Android 14)

## 费用说明

### EAS云构建

- **免费账号**：每月15次构建
- **个人账号**：每月60次构建
- **组织账号**：根据套餐

对于日常开发，免费额度完全够用。

## 总结

### 当前状态

- ✅ 项目代码已更新到4月12日
- ✅ EAS配置已完成
- ✅ 构建脚本已就绪
- ✅ 文档已完善
- ❌ 云端本地构建不可行

### 推荐行动

1. 在本地电脑执行EAS构建命令
2. 使用快速脚本或手动构建
3. 在浏览器中查看构建进度
4. 构建完成后下载APK

### 预期结果

- 构建时间：10-15分钟
- APK大小：约50-80MB
- 文件名：`app-debug.apk`

## 联系支持

- EAS文档：https://docs.expo.dev/build/introduction/
- 构建问题：https://forums.expo.dev/
- 项目问题：查看项目README.md

---

**最后更新**：2024年4月13日
**状态**：EAS云构建方案已就绪，等待执行
