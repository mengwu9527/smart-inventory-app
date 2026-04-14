# 在本地执行EAS云构建 - 详细指南

## 重要说明

⚠️ **本指南必须在您的本地电脑上执行，不能在云端沙箱中执行**

云端沙箱无法完成长时间的构建任务，必须使用EAS云构建。

## 前提条件

### 1. 安装Node.js

确保您的本地电脑已安装Node.js（推荐v18或更高版本）：

**检查是否已安装**：
```bash
node --version
npm --version
```

**如果没有安装**：
- 访问：https://nodejs.org/
- 下载并安装LTS版本

### 2. 安装Git（可选）

如果您需要克隆项目：

**检查是否已安装**：
```bash
git --version
```

**如果没有安装**：
- Windows: https://git-scm.com/download/win
- macOS: `brew install git`
- Linux: `sudo apt install git`

## 步骤1：获取项目代码

### 方法A：如果项目已经在本地

```bash
cd /workspace/projects
```

### 方法B：如果需要克隆项目

```bash
git clone <项目仓库地址>
cd <项目目录>
```

## 步骤2：安装EAS CLI

### 方法A：全局安装（推荐）

```bash
npm install -g eas-cli
```

**验证安装**：
```bash
eas --version
```

**预期输出**：
```
EAS CLI vX.Y.Z
```

### 方法B：使用npx（无需安装）

```bash
npx eas-cli@latest --version
```

## 步骤3：登录Expo账号

### 注册账号（如果没有）

1. 访问：https://expo.dev/signup
2. 填写邮箱和密码
3. 验证邮箱
4. 完成注册

### 登录账号

```bash
eas login
```

**登录流程**：
1. 命令会显示一个URL
2. 在浏览器中打开URL
3. 登录您的Expo账号
4. 授权EAS CLI访问
5. 返回命令行，看到"Success"消息

**示例输出**：
```
Log in to Expo
Visit https://auth.expo.dev/activate?token=xxx
Press Enter when you're ready
✓ Success! Logged in as your-email@example.com
```

## 步骤4：连接项目到Expo

### 进入项目目录

```bash
cd /workspace/projects/client
```

### 连接项目

```bash
npx eas-cli@latest init --id f05dfeb3-bc5b-42c0-b267-5084f48f7014
```

**命令说明**：
- `npx`：npm包运行器
- `eas-cli@latest`：使用最新版本的EAS CLI
- `init`：初始化命令，连接项目
- `--id`：指定项目ID

**预期输出**：
```
✔ Would you like to automatically create an EAS project for @username/your-project? … yes
✔ Linked project @username/your-project
```

### 验证连接

检查是否生成了`eas.json`文件：
```bash
cat eas.json
```

**预期内容**：
```json
{
  "cli": {
    "version": ">= 7.1.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

## 步骤5：构建APK

### 构建命令

```bash
npx eas-cli@latest build --platform android --profile preview
```

**命令说明**：
- `--platform android`：只构建Android版本
- `--profile preview`：使用preview配置

### 构建过程

构建开始后，EAS CLI会：

1. **上传代码**（1-2分钟）
   - 上传项目代码到Expo服务器
   - 显示"Building..."消息

2. **打开浏览器**（自动）
   - 自动打开EAS构建页面
   - 显示构建进度

3. **配置环境**（2-3分钟）
   - 配置Android SDK
   - 下载依赖

4. **编译代码**（4-6分钟）
   - 编译React Native代码
   - 编译Android原生代码
   - 编译Native库

5. **打包APK**（1-2分钟）
   - 打包资源
   - 生成APK文件

6. **完成**（自动）
   - 显示"Build succeeded"
   - 提供下载链接

### 查看构建进度

**方法1：浏览器页面**
- 构建开始后自动打开的页面
- 实时显示构建日志
- 显示预计完成时间

**方法2：命令行**
```bash
# 查看所有构建
eas build:list

# 查看特定构建
eas build:view [BUILD_ID]
```

**方法3：EAS网站**
- 访问：https://expo.dev/accounts/[username]/projects/[project]/builds
- 查看所有构建历史

### 构建时间

- **总时间**：10-15分钟
- **上传代码**：1-2分钟
- **配置环境**：2-3分钟
- **编译代码**：4-6分钟
- **打包APK**：1-2分钟

## 步骤6：下载APK

### 方法1：浏览器下载（推荐）

1. 在构建页面找到"Download"按钮
2. 点击下载
3. APK会下载到您的下载文件夹

### 方法2：命令行下载

```bash
# 查看构建列表
eas build:list

# 获取BUILD_ID（例如：12345678-1234-1234-1234-123456789abc）

# 查看构建详情
eas build:view 12345678-1234-1234-1234-123456789abc

# 在浏览器中打开下载链接
```

### APK文件信息

- **文件名**：`app-debug.apk`
- **大小**：约50-80MB
- **类型**：Debug版本
- **最小SDK**：24 (Android 7.0)
- **目标SDK**：36 (Android 14)

## 使用自动化脚本

如果您想使用自动化脚本，执行以下命令：

```bash
cd /workspace/projects
bash scripts/eas-build-local.sh
```

脚本会自动：
1. 检查环境
2. 安装EAS CLI
3. 登录Expo账号
4. 连接项目
5. 构建APK
6. 提供下载指引

## 完整命令序列

### 一键构建（推荐）

```bash
cd /workspace/projects/client
npx eas-cli@latest init --id f05dfeb3-bc5b-42c0-b267-5084f48f7014
npx eas-cli@latest build --platform android --profile preview
```

### 分步执行

```bash
# 1. 安装EAS CLI
npm install -g eas-cli

# 2. 登录Expo
eas login

# 3. 进入项目目录
cd /workspace/projects/client

# 4. 连接项目
eas init --id f05dfeb3-bc5b-42c0-b267-5084f48f7014

# 5. 构建APK
eas build --platform android --profile preview
```

## 常见问题

### Q1: 构建失败怎么办？

**A**:
1. 查看浏览器中的构建日志
2. 检查错误信息
3. 常见错误：
   - 依赖冲突：检查`package.json`
   - 配置错误：检查`eas.json`
   - 网络问题：重试构建

### Q2: 如何查看构建历史？

**A**:
```bash
eas build:list
```

或访问：https://expo.dev/

### Q3: 如何取消构建？

**A**:
```bash
eas build:cancel [BUILD_ID]
```

### Q4: 构建需要多长时间？

**A**:
- 首次构建：10-15分钟
- 后续构建：8-12分钟（使用缓存）

### Q5: 可以构建多个平台吗？

**A**:
```bash
# 同时构建Android和iOS
eas build --platform all --profile preview

# 只构建iOS
eas build --platform ios --profile preview
```

### Q6: 如何生成Release版本？

**A**:
```bash
eas build --platform android --profile production
```

但需要配置签名。

## 故障排除

### 错误1：未找到Node.js

**解决方案**：
```bash
# 下载并安装Node.js
# 访问：https://nodejs.org/
```

### 错误2：EAS CLI安装失败

**解决方案**：
```bash
# 使用sudo
sudo npm install -g eas-cli

# 或使用npx（无需安装）
npx eas-cli@latest
```

### 错误3：登录失败

**解决方案**：
```bash
# 重新登录
eas logout
eas login

# 或使用环境变量
export EXPO_TOKEN=your-token-here
```

### 错误4：构建超时

**解决方案**：
- 检查网络连接
- 等待构建完成（可能需要更长时间）
- 查看构建日志确认状态

### 错误5：依赖下载失败

**解决方案**：
```bash
# 清理缓存
npm cache clean --force

# 重新安装依赖
npm install

# 重新构建
eas build --platform android --profile preview
```

## 费用说明

### EAS云构建

- **免费账号**：每月15次构建
- **个人账号**：每月60次构建
- **组织账号**：根据套餐

### 检查额度

```bash
eas build:list
```

## 技术支持

- **Expo官网**：https://expo.dev/
- **EAS文档**：https://docs.expo.dev/build/introduction/
- **构建问题**：https://forums.expo.dev/
- **Discord社区**：https://chat.expo.dev/

## 下一步

构建完成后：

1. **下载APK**
   - 从浏览器页面下载
   - 或使用命令行

2. **安装到设备**
   ```bash
   adb install app-debug.apk
   ```
   或直接在手机上打开APK文件

3. **测试应用**
   - 启动应用
   - 验证功能
   - 测试各个模块

4. **发布应用**
   - 如需发布，使用production配置
   - 配置签名
   - 提交到应用商店

## 总结

✅ **5步完成构建**：
1. 安装Node.js
2. 安装EAS CLI
3. 登录Expo账号
4. 连接项目
5. 构建APK

✅ **10-15分钟完成**
✅ **稳定可靠**
✅ **无需本地环境**

---

**重要提示**：
- 所有命令必须在您的**本地电脑**执行
- 确保网络连接稳定
- 首次构建可能需要更长时间

**项目信息**：
- 项目ID：`f05dfeb3-bc5b-42c0-b267-5084f48f7014`
- 应用名称：智慧记AI进销存
- 版本号：1.0.0
