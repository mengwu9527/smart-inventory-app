# 使用Expo官方命令构建APK

## 根据Expo平台截图的命令

根据您展示的Expo平台界面，以下是官方推荐的构建命令。

## 命令详解

### 命令1：连接项目到Expo

```bash
npx eas-cli@latest init --id f05dfeb3-bc5b-42c0-b267-5084f48f7014
```

**参数说明**：
- `npx`：npm包运行器，自动下载最新版本的包
- `eas-cli@latest`：使用最新版本的EAS CLI
- `init`：初始化命令，将项目连接到Expo
- `--id`：指定项目ID（Expo平台提供的唯一标识）

**项目ID**：`f05dfeb3-bc5b-42c0-b267-5084f48f7014`

**作用**：
- 生成`eas.json`配置文件
- 在Expo平台注册项目
- 配置构建环境

### 命令2：构建应用

```bash
npx eas-cli@latest build --platform all --auto-submit
```

**参数说明**：
- `build`：构建命令
- `--platform all`：构建所有平台（Android + iOS）
- `--auto-submit`：自动提交到应用商店

**注意事项**：
- 这个命令会构建Android和iOS两个版本
- `--auto-submit`需要配置应用商店账号
- 对于简单测试，建议只构建Android

## 推荐的执行步骤

### 步骤1：进入项目目录

```bash
cd /workspace/projects/client
```

### 步骤2：连接项目到Expo

```bash
npx eas-cli@latest init --id f05dfeb3-bc5b-42c0-b267-5084f48f7014
```

**系统提示**：
- 需要登录Expo账号（如果没有会自动提示）
- 需要选择构建配置（development/preview/production）

**推荐选择**：
- `preview`：预览版本，用于内部测试
- `production`：生产版本，用于发布

### 步骤3：构建Android APK

```bash
npx eas-cli@latest build --platform android --profile preview
```

**为什么修改命令**：
- 将`--platform all`改为`--platform android`：只构建Android
- 添加`--profile preview`：使用preview配置
- 移除`--auto-submit`：不需要自动提交

**构建过程**：
1. 上传代码到Expo服务器
2. 配置Android SDK
3. 下载依赖
4. 编译React Native代码
5. 构建Android原生代码
6. 打包生成APK
7. 提供下载链接

**预计时间**：10-15分钟

## 使用自动化脚本

我们提供了自动化脚本，简化操作流程：

```bash
cd /workspace/projects
bash scripts/build-with-npx.sh
```

脚本会自动：
1. 检查Node.js环境
2. 连接项目到Expo
3. 构建Android APK
4. 提供下载指引

## 命令对比

| 命令 | 用途 | 推荐场景 |
|------|------|----------|
| `npx eas-cli@latest init --id [ID]` | 连接项目 | 第一次使用EAS |
| `npx eas-cli@latest build --platform android` | 构建Android | 只需要Android APK |
| `npx eas-cli@latest build --platform all` | 构建所有平台 | 需要Android + iOS |
| `npx eas-cli@latest build --platform android --auto-submit` | 构建并提交 | 准备发布到应用商店 |

## 常见问题

### Q1: 为什么使用npx而不是全局安装？

**A**: `npx`的优势：
- 自动使用最新版本
- 无需全局安装
- 临时使用，不占用空间

**全局安装方式**（如果需要）：
```bash
npm install -g eas-cli
eas build --platform android
```

### Q2: 项目ID是从哪里来的？

**A**: 项目ID来源：
1. Expo平台自动生成
2. 项目创建时分配
3. 在Expo项目设置中查看

您的项目ID：`f05dfeb3-bc5b-42c0-b267-5084f48f7014`

### Q3: init命令会做什么？

**A**: init命令执行以下操作：
1. 生成`eas.json`配置文件
2. 询问构建配置选择
3. 连接到Expo平台
4. 注册项目信息

### Q4: 如果已有eas.json还需要init吗？

**A**: 不需要。如果项目已经有：
- `eas.json`配置文件
- 正确的项目ID

可以跳过init，直接执行build命令。

### Q5: --auto-submit需要什么配置？

**A**: --auto-submit需要：
- Google Play开发者账号（Android）
- Apple开发者账号（iOS）
- 应用商店API密钥

**建议**：先测试构建，暂不使用--auto-submit

## 构建配置说明

### Preview配置（推荐）

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

**特点**：
- 生成Debug APK
- 快速构建
- 用于内部测试
- 无需签名

### Production配置

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

**特点**：
- 生成Release APK
- 需要签名
- 用于正式发布
- 更大的APK体积

## 构建结果

### 成功构建后

1. **浏览器自动打开**构建页面
2. **实时查看**构建进度
3. **构建完成**后显示下载链接
4. **点击下载**APK文件

### APK位置

- **EAS平台**：构建页面中的下载链接
- **本地下载**：浏览器下载文件夹
- **命令行**：`eas build:view [BUILD_ID]`

## 查看构建状态

### 查看所有构建

```bash
npx eas-cli@latest build:list
```

### 查看特定构建

```bash
npx eas-cli@latest build:view [BUILD_ID]
```

### 取消构建

```bash
npx eas-cli@latest build:cancel [BUILD_ID]
```

## 构建日志

### 查看构建日志

1. **浏览器**：构建页面实时显示
2. **命令行**：构建开始时自动显示

### 常见构建错误

1. **依赖冲突**：检查`package.json`
2. **配置错误**：检查`eas.json`
3. **网络问题**：重试构建
4. **SDK问题**：EAS自动处理

## 费用说明

### EAS构建费用

- **免费额度**：
  - 免费账号：每月15次构建
  - 个人账号：每月60次构建

- **构建类型**：
  - Android：免费
  - iOS：免费（需要Apple开发者账号）

## 快速开始总结

```bash
# 1. 进入项目目录
cd /workspace/projects/client

# 2. 连接项目到Expo（如果是第一次）
npx eas-cli@latest init --id f05dfeb3-bc5b-42c0-b267-5084f48f7014

# 3. 构建Android APK
npx eas-cli@latest build --platform android --profile preview

# 4. 等待构建完成（10-15分钟）
# 5. 在浏览器中下载APK
```

## 参考资源

- **EAS官方文档**：https://docs.expo.dev/build/introduction/
- **构建指南**：https://docs.expo.dev/build/building-an-apk/
- **问题排查**：https://docs.expo.dev/troubleshooting/build-errors/

---

**重要提示**：
- 所有命令都需要在**本地电脑**执行
- 确保网络连接稳定
- 首次构建需要登录Expo账号
- 构建过程10-15分钟，请耐心等待

**项目信息**：
- 项目ID：`f05dfeb3-bc5b-42c0-b267-5084f48f7014`
- 应用名称：智慧记AI进销存
- 版本号：1.0.0
