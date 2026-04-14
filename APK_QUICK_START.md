# APK 快速使用指南

## 当前可用版本

**智慧记AI进销存 v1.0.0**

- **文件位置**: `/workspace/projects/智慧记AI进销存-v1.0.0.apk`
- **文件大小**: 46 MB
- **签名方式**: Debug 签名

## 获取 APK

### 方法一：直接下载（如果在云端环境）

1. 通过文件管理器或FTP工具访问项目目录
2. 下载 `智慧记AI进销存-v1.0.0.apk` 文件
3. 传输到安卓设备

### 方法二：使用 scp 命令

```bash
# 从远程服务器复制到本地
scp user@server:/workspace/projects/智慧记AI进销存-v1.0.0.apk ./
```

### 方法三：使用 ADB 安装

```bash
# 连接安卓设备
adb devices

# 安装 APK
adb install 智慧记AI进销存-v1.0.0.apk
```

## 安装步骤

1. **允许安装未知来源**
   - 进入 Android 设置 → 安全 → 允许安装未知来源应用
   - 或者在安装时直接授权

2. **安装应用**
   - 在文件管理器中找到 APK 文件
   - 点击安装
   - 按提示完成安装

3. **首次启动**
   - 打开应用
   - 允许所需权限（相机、存储、蓝牙）
   - 系统自动初始化数据库
   - 开始使用

## 重新构建 APK

如需重新构建新版本，请执行以下步骤：

### 前置要求

- Node.js 20+
- pnpm 8+
- Java 17 JDK
- Android SDK (API 34)

### 快速构建

```bash
# 方式一：使用构建脚本（推荐）
./build-apk.sh

# 方式二：手动构建
cd client
npx expo prebuild --platform android --clean
cd android
./gradlew assembleDebug
```

### 使用 EAS 云构建（推荐）

```bash
# 安装 EAS CLI
npm install -g eas-cli

# 登录 Expo
eas login

# 构建 APK
cd client
eas build --profile preview --platform android
```

## 版本信息

| 项目 | 值 |
|------|-----|
| 应用名称 | 智慧记AI进销存 |
| 包名 | com.free.jxc.app |
| 版本号 | 1.0.0 |
| 最低安卓版本 | Android 10 (API 29) |
| 目标安卓版本 | Android 14 (API 34) |
| 签名 | Debug |

## 注意事项

1. **Debug 签名限制**
   - Debug 签名的 APK 不能直接发布到应用商店
   - 如需发布，需要重新配置 Release 签名

2. **数据安全**
   - 所有数据存储在设备本地
   - 建议定期使用应用内的备份功能
   - 卸载应用会丢失所有数据

3. **权限说明**
   - 相机：扫码功能
   - 存储：数据导入导出
   - 蓝牙：打印机连接
   - 网络：可选功能

## 问题排查

### 安装失败
- 确保安卓版本 ≥ 10
- 允许安装未知来源
- 检查存储空间是否充足

### 扫码不工作
- 确保已授予相机权限
- 检查相机是否能正常打开

### 打印不工作
- 确保已授予蓝牙权限
- 检查打印机是否已配对
- 确认打印机支持 ESC/POS 指令

## 技术支持

- 详细文档：[README.md](./README.md)
- 构建指南：[BUILD.md](./BUILD.md)
- 使用指南：[USER_GUIDE.md](./USER_GUIDE.md)
- 发布说明：[RELEASE.md](./RELEASE.md)
