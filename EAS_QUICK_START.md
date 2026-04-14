# EAS云构建 - 一键执行命令

## 最简单的方法（3行命令）

```bash
cd /workspace/projects/client
npx eas-cli@latest init --id f05dfeb3-bc5b-42c0-b267-5084f48f7014
npx eas-cli@latest build --platform android --profile preview
```

## 执行前准备

### 1. 确保已安装Node.js

```bash
node --version
# 如果显示版本号，说明已安装
# 如果提示命令不存在，请访问 https://nodejs.org/ 下载安装
```

### 2. 注册Expo账号（如果没有）

- 访问：https://expo.dev/signup
- 注册免费账号

### 3. 登录Expo

```bash
npx eas-cli@latest login
# 在浏览器中打开链接，登录并授权
```

## 完整执行流程

### 步骤1：打开终端（命令行）

**Windows**：
- 按 `Win + R`
- 输入 `cmd` 或 `powershell`
- 按 Enter

**macOS / Linux**：
- 打开 Terminal

### 步骤2：进入项目目录

```bash
cd /workspace/projects/client
```

### 步骤3：连接项目到Expo

```bash
npx eas-cli@latest init --id f05dfeb3-bc5b-42c0-b267-5084f48f7014
```

**预期输出**：
```
✔ Would you like to automatically create an EAS project? … yes
✔ Linked project @username/your-project
```

### 步骤4：构建APK

```bash
npx eas-cli@latest build --platform android --profile preview
```

**预期输出**：
```
› Building Android (apk) on Expo...
› Upload started (attempt 1 of 2)
› Uploaded successfully
› Build started
```

### 步骤5：等待构建完成

- 浏览器会自动打开构建页面
- 显示构建进度
- 预计10-15分钟

### 步骤6：下载APK

- 在构建页面点击"Download"按钮
- APK会下载到您的电脑

## 使用自动化脚本（推荐新手）

如果您不熟悉命令行，可以使用自动化脚本：

```bash
cd /workspace/projects
bash scripts/eas-build-local.sh
```

脚本会自动执行所有步骤，并提示您确认。

## 快速检查清单

- [ ] 已安装Node.js
- [ ] 已注册Expo账号
- [ ] 已登录Expo
- [ ] 已进入项目目录
- [ ] 已连接项目到Expo
- [ ] 已启动构建
- [ ] 已等待构建完成
- [ ] 已下载APK

## 常见命令

### 查看构建状态

```bash
# 查看所有构建
eas build:list

# 查看特定构建
eas build:view [BUILD_ID]
```

### 取消构建

```bash
eas build:cancel [BUILD_ID]
```

### 重新登录

```bash
eas logout
eas login
```

## 构建信息

- **应用名称**：智慧记AI进销存
- **版本号**：1.0.0
- **项目ID**：f05dfeb3-bc5b-42c0-b267-5084f48f7014
- **构建时间**：10-15分钟
- **APK大小**：约50-80MB

## 获取帮助

如果遇到问题：

1. **查看详细文档**：`EAS_BUILD_LOCAL_GUIDE.md`
2. **查看构建日志**：浏览器构建页面
3. **Expo文档**：https://docs.expo.dev/build/introduction/
4. **社区论坛**：https://forums.expo.dev/

## 预期结果

构建成功后，您会得到：

1. ✅ APK文件（app-debug.apk）
2. ✅ 可以安装到Android设备
3. ✅ 可以进行功能测试

## 下一步

下载APK后：

1. **安装到手机**
   - 通过USB连接手机
   - 使用`adb install app-debug.apk`
   - 或直接在手机上打开APK文件

2. **测试应用**
   - 启动应用
   - 测试所有功能
   - 验证各个模块

3. **分享给他人**
   - 发送APK文件
   - 其他人可以直接安装

---

**重要提示**：
- 这些命令必须在您的**本地电脑**执行
- 确保网络连接稳定
- 构建需要10-15分钟，请耐心等待

**立即执行**：
```bash
cd /workspace/projects/client
npx eas-cli@latest init --id f05dfeb3-bc5b-42c0-b267-5084f48f7014
npx eas-cli@latest build --platform android --profile preview
```

祝您构建成功！🎉
