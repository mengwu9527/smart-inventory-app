# APK构建方案总结

## 当前状态

✅ **项目代码已更新到4月12日**
✅ **EAS配置已完成**
✅ **所有构建脚本已就绪**
✅ **文档已完善**

## 推荐方案：使用Expo官方命令

根据您展示的Expo平台截图，官方推荐的构建方式如下：

### 方案概述

使用`npx`命令直接运行最新版本的EAS CLI，无需预先安装。

### 执行步骤

#### 1. 连接项目到Expo

```bash
cd /workspace/projects/client
npx eas-cli@latest init --id f05dfeb3-bc5b-42c0-b267-5084f48f7014
```

**说明**：
- 将项目连接到Expo平台
- 使用项目ID：`f05dfeb3-bc5b-42c0-b267-5084f48f7014`
- 生成必要的配置文件

#### 2. 构建Android APK

```bash
npx eas-cli@latest build --platform android --profile preview
```

**说明**：
- 只构建Android版本
- 使用preview配置
- 生成Debug APK

**构建时间**：10-15分钟

### 使用自动化脚本

```bash
cd /workspace/projects
bash scripts/build-with-npx.sh
```

脚本会自动执行所有步骤。

## 其他方案

### 方案2：使用全局安装的EAS CLI

```bash
# 安装EAS CLI
npm install -g eas-cli

# 登录
eas login

# 构建
cd /workspace/projects/client
eas build --platform android --profile preview
```

### 方案3：使用项目中的快速构建脚本

```bash
cd /workspace/projects
bash scripts/build-with-eas.sh
```

## 方案对比

| 方案 | 优势 | 适用场景 |
|------|------|----------|
| **npx命令（推荐）** | 无需安装，自动最新版本 | 第一次使用，临时构建 |
| 全局安装 | 多次使用更方便 | 频繁构建 |
| 快速脚本 | 自动化程度高 | 快速开始 |

## 构建配置

### EAS配置文件（eas.json）

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    }
  }
}
```

**说明**：
- 生成Debug APK
- 快速构建（10-15分钟）
- 用于内部测试

## 构建结果

### APK信息

- **文件名**：`app-debug.apk`
- **大小**：约50-80MB
- **类型**：Debug版本
- **最小SDK**：24 (Android 7.0)
- **目标SDK**：36 (Android 14)

### 下载位置

构建完成后，APK可以通过以下方式下载：

1. **浏览器**：EAS构建页面自动打开
2. **命令行**：`eas build:view [BUILD_ID]`
3. **本地下载**：浏览器下载文件夹

## 文档索引

### 构建指南

1. **BUILD_WITH_EAS.md** - 快速开始指南
   - 3步完成构建
   - 适合快速上手

2. **EAS_BUILD_GUIDE.md** - 详细构建指南
   - 完整步骤
   - 故障排除

3. **EXP_OFFICIAL_COMMANDS.md** - 官方命令说明
   - 基于Expo平台截图
   - 命令详解

4. **BUILD_SOLUTION.md** - 完整解决方案
   - 问题分析
   - 多种方案对比

### 构建脚本

1. **scripts/build-with-eas.sh** - 使用全局EAS CLI
2. **scripts/build-with-npx.sh** - 使用npx命令（推荐）

## 执行位置

⚠️ **重要提示**

所有构建命令必须在**本地电脑**执行，不能在云端沙箱中执行。

**原因**：
- 云端沙箱会清理长时间运行的进程
- Java、Android SDK等工具链会被清理
- 构建无法完成

**建议执行顺序**：

1. 在本地电脑打开终端
2. 执行以下命令：
   ```bash
   cd /workspace/projects/client
   npx eas-cli@latest init --id f05dfeb3-bc5b-42c0-b267-5084f48f7014
   npx eas-cli@latest build --platform android --profile preview
   ```
3. 在浏览器中查看构建进度
4. 等待10-15分钟
5. 下载APK

## 项目信息

- **应用名称**：智慧记AI进销存
- **版本号**：1.0.0
- **代码更新**：2024年4月12日
- **项目ID**：`f05dfeb3-bc5b-42c0-b267-5084f48f7014`

## 费用说明

### EAS云构建

- **免费账号**：每月15次构建
- **个人账号**：每月60次构建
- **组织账号**：根据套餐

对于日常开发，免费额度完全够用。

## 常见问题

### Q1: 必须连接到Expo吗？

**A**: 是的。EAS云构建需要将项目连接到Expo平台，才能使用云构建服务。

### Q2: 项目ID是什么？

**A**: 项目ID是Expo平台的唯一标识，用于：
- 连接项目到Expo
- 跟踪构建记录
- 管理应用配置

### Q3: npx和全局安装有什么区别？

**A**:
- `npx`：临时使用，自动下载最新版本
- 全局安装：持久使用，需要预先安装

### Q4: 构建失败怎么办？

**A**:
1. 查看构建日志（浏览器页面）
2. 检查网络连接
3. 验证项目配置
4. 参考`EAS_BUILD_GUIDE.md`中的故障排除

### Q5: 可以同时构建Android和iOS吗？

**A**: 可以，但：
- iOS需要Apple开发者账号
- 需要配置iOS签名
- 构建时间更长

建议先单独构建Android测试。

## 推荐执行流程

```bash
# 在本地电脑执行

# 1. 进入项目目录
cd /workspace/projects/client

# 2. 连接项目到Expo（第一次需要）
npx eas-cli@latest init --id f05dfeb3-bc5b-42c0-b267-5084f48f7014

# 3. 构建Android APK
npx eas-cli@latest build --platform android --profile preview

# 4. 等待构建完成（10-15分钟）

# 5. 在浏览器中下载APK
```

## 快速开始

### 最简单的方式

```bash
cd /workspace/projects
bash scripts/build-with-npx.sh
```

### 使用官方命令

```bash
cd /workspace/projects/client
npx eas-cli@latest init --id f05dfeb3-bc5b-42c0-b267-5084f48f7014
npx eas-cli@latest build --platform android --profile preview
```

## 参考资源

- **Expo官网**：https://expo.dev/
- **EAS文档**：https://docs.expo.dev/build/introduction/
- **构建指南**：https://docs.expo.dev/build/building-an-apk/
- **项目文档**：查看项目根目录的文档文件

---

**状态**：✅ 所有方案已就绪，等待用户在本地执行构建命令

**推荐方案**：使用Expo官方命令（npx方式）

**预计构建时间**：10-15分钟

**执行位置**：本地电脑
