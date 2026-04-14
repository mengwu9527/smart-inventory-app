# 智慧记AI进销存 - APK构建指南

## 快速开始（推荐方式）

根据Expo官方推荐，使用npx命令构建APK：

```bash
# 1. 进入项目目录
cd /workspace/projects/client

# 2. 连接项目到Expo（第一次需要）
npx eas-cli@latest init --id f05dfeb3-bc5b-42c0-b267-5084f48f7014

# 3. 构建Android APK
npx eas-cli@latest build --platform android --profile preview

# 4. 等待10-15分钟，在浏览器中下载APK
```

## 为什么使用EAS云构建？

### 云端环境限制

云端沙箱环境会定期清理：
- 长时间运行的进程（Java、Gradle）
- 工具链（Android SDK、NDK）
- WebSocket连接

这导致本地构建无法完成（需要30-60分钟，会被清理）。

### EAS云构建优势

✅ **快速**：10-15分钟完成
✅ **稳定**：云端运行，不会中断
✅ **可视**：浏览器实时查看进度
✅ **自动**：自动处理SDK和签名

## 构建方案

### 方案1：使用npx命令（推荐）

```bash
cd /workspace/projects/client
npx eas-cli@latest init --id f05dfeb3-bc5b-42c0-b267-5084f48f7014
npx eas-cli@latest build --platform android --profile preview
```

**优势**：
- 无需预先安装
- 自动使用最新版本
- 简单快捷

### 方案2：使用构建脚本

```bash
cd /workspace/projects
bash scripts/build-with-npx.sh
```

**优势**：
- 自动化程度高
- 包含错误检查
- 适合不熟悉命令行的用户

### 方案3：使用全局EAS CLI

```bash
npm install -g eas-cli
eas login
cd /workspace/projects/client
eas build --platform android --profile preview
```

**优势**：
- 多次使用更方便
- 适合频繁构建

## 构建配置

### EAS配置（eas.json）

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

## 项目信息

- **应用名称**：智慧记AI进销存
- **版本号**：1.0.0
- **代码更新**：2024年4月12日
- **项目ID**：`f05dfeb3-bc5b-42c0-b267-5084f48f7014`
- **最小SDK**：24 (Android 7.0)
- **目标SDK**：36 (Android 14)

## 构建结果

### APK信息

- **文件名**：`app-debug.apk`
- **大小**：约50-80MB
- **类型**：Debug版本

### 下载位置

构建完成后：
1. 浏览器自动打开EAS构建页面
2. 点击下载按钮获取APK
3. 或使用命令：`eas build:view [BUILD_ID]`

## 文档索引

### 快速指南

1. **BUILD_SUMMARY.md** - 构建方案总结
2. **BUILD_WITH_EAS.md** - 3步快速开始
3. **EXP_OFFICIAL_COMMANDS.md** - 官方命令详解

### 详细指南

1. **EAS_BUILD_GUIDE.md** - 完整构建指南
2. **BUILD_SOLUTION.md** - 解决方案说明

### 其他文档

- **BUILD.md** - 原始构建文档
- **BUILD_FINAL.md** - 最终构建文档
- **BUILD_MONITOR.md** - 构建监控指南

## 构建脚本

- **scripts/build-with-npx.sh** - 使用npx命令（推荐）
- **scripts/build-with-eas.sh** - 使用全局EAS CLI
- **scripts/build-apk-local.sh** - 本地构建脚本（不推荐）

## 常见问题

### Q1: 必须在本地执行吗？

**A**: 是的。云端沙箱无法完成长时间构建，必须在本地电脑执行。

### Q2: 构建需要多长时间？

**A**: EAS云构建10-15分钟，本地构建30-60分钟（会被清理）。

### Q3: EAS构建免费吗？

**A**: 免费账号每月15次构建，个人账号每月60次构建。

### Q4: 构建失败怎么办？

**A**:
1. 查看构建日志（浏览器页面）
2. 检查网络连接
3. 验证项目配置
4. 参考`EAS_BUILD_GUIDE.md`

### Q5: 可以生成Release版本吗？

**A**: 可以。修改命令为：
```bash
eas build --platform android --profile production
```

但需要配置签名。

## 费用说明

### EAS云构建

- **免费账号**：每月15次构建
- **个人账号**：每月60次构建
- **组织账号**：根据套餐

对于日常开发，免费额度完全够用。

## 技术支持

- **Expo官网**：https://expo.dev/
- **EAS文档**：https://docs.expo.dev/build/introduction/
- **构建问题**：https://forums.expo.dev/

## 项目结构

```
/workspace/projects/
├── client/                 # Expo客户端项目
│   ├── android/           # Android原生代码
│   ├── eas.json           # EAS构建配置
│   └── app.json           # 应用配置
├── scripts/               # 构建脚本
│   ├── build-with-npx.sh   # npx方式构建
│   └── build-with-eas.sh   # EAS CLI构建
├── BUILD_SUMMARY.md       # 构建方案总结
├── BUILD_WITH_EAS.md      # 快速开始指南
├── EXP_OFFICIAL_COMMANDS.md  # 官方命令说明
└── EAS_BUILD_GUIDE.md     # 详细构建指南
```

## 更新日志

### 2024-04-13
- ✅ 添加Expo官方npx命令支持
- ✅ 创建详细的构建文档
- ✅ 配置EAS构建环境
- ✅ 提供多种构建方案

---

**重要提示**：所有构建命令必须在**本地电脑**执行，不能在云端沙箱中执行。

**推荐方案**：使用Expo官方npx命令

**预计构建时间**：10-15分钟

**状态**：✅ 所有配置已完成，等待执行构建命令
