# EAS云构建快速开始

## 重要说明

⚠️ **云端沙箱环境限制**：云端环境会定期清理长时间运行的进程和工具链（Java、Android SDK等），导致本地构建无法完成。**EAS云构建是当前唯一可行的快速方案**。

## 快速开始（3步完成）

### 1. 安装EAS CLI（本地操作）

在你的本地电脑执行：

```bash
npm install -g eas-cli
```

### 2. 登录Expo账号

```bash
eas login
```

如果没有账号，请先注册：https://expo.dev/signup（免费）

### 3. 构建APK

**方法A：使用快速脚本（推荐）**

```bash
cd /workspace/projects
bash scripts/build-with-eas.sh
```

**方法B：手动构建**

```bash
cd /workspace/projects/client
eas build --platform android --profile preview
```

## 构建时间

- **EAS云构建**：10-15分钟 ✅
- **本地构建**：30-60分钟（在云端会被清理）❌

## 查看构建进度

构建开始后，浏览器会自动打开构建页面，可以实时查看：
- 构建状态
- 构建日志
- 预计完成时间

## 下载APK

构建完成后：
1. 在浏览器页面点击下载
2. 或使用命令：`eas build:view [BUILD_ID]`

## 构建配置

项目已配置好EAS构建（`client/eas.json`）：
- 构建**Debug版本**APK
- 10-15分钟完成
- 无需签名配置

## 详细文档

查看完整构建指南：`EAS_BUILD_GUIDE.md`

## 常见问题

### Q: 必须使用EAS吗？
A: 强烈推荐。云端沙箱无法完成长时间构建，EAS云构建快速稳定。

### Q: EAS构建免费吗？
A: 免费账号每月15次构建，个人账号每月60次，足够日常使用。

### Q: 构建失败怎么办？
A: 查看浏览器中的构建日志，或参考`EAS_BUILD_GUIDE.md`中的故障排除。

---

**提示**：所有构建命令都需要在你的**本地电脑**执行，而不是云端沙箱。
