# APK构建监控指南

## 📊 当前构建状态

**开始时间**: 2024-04-12 23:16
**已运行时间**: 约10分钟
**预计剩余时间**: 20-50分钟
**总预计时间**: 30-60分钟

### ✅ 进程状态

```bash
# 构建进程运行中
ps aux | grep gradle | grep -v grep

# 输出：2个Java进程
# - Gradle守护进程（1.1GB内存，CPU 9.5%）
# - Gradle客户端进程
```

### 📝 日志状态

```bash
# 日志文件
/tmp/apk-final-build.log
# 大小：21KB
# 行数：337行（持续增加）

# 查看日志
tail -50 /tmp/apk-final-build.log
```

### 🔄 当前编译任务

- ✅ 资源文件编译完成
- ✅ BuildConfig生成完成
- 🔄 Kotlin代码编译中
- 🔄 Java代码编译中

## 🎯 持续监控方法

### 方法1：实时监控（推荐）

```bash
# 实时查看构建日志
tail -f /tmp/apk-final-build.log
```

### 方法2：定时检查

```bash
# 每60秒检查一次
watch -n 60 'tail -50 /tmp/apk-final-build.log'
```

### 方法3：检查构建进程

```bash
# 检查构建是否还在运行
ps aux | grep gradle | grep -v grep

# 如果没有输出，说明构建已完成或失败
```

### 方法4：检查APK是否生成

```bash
# 查找APK文件
find /workspace/projects/client/android -name "*.apk" -type f

# 检查输出目录
ls -la /workspace/projects/client/android/app/build/outputs/apk/debug/
```

## ⏱️ 预期时间线

| 时间 | 阶段 | 状态 |
|------|------|------|
| 23:16 | 构建启动 | ✅ 完成 |
| 23:16-23:26 | 资源编译 | ✅ 完成 |
| 23:26-23:46 | Kotlin编译 | 🔄 进行中 |
| 23:46-00:06 | Java编译 | ⏳ 待开始 |
| 00:06-00:16 | 打包APK | ⏳ 待开始 |
| 00:16 | **完成** | ⏳ 待开始 |

## ✅ 构建完成后的操作

### 1. 验证APK文件

```bash
# 查找APK
find /workspace/projects/client/android -name "*.apk" -type f

# 应该找到：
# /workspace/projects/client/android/app/build/outputs/apk/debug/app-debug.apk
```

### 2. 查看APK信息

```bash
# 查看文件大小
ls -lh /workspace/projects/client/android/app/build/outputs/apk/debug/app-debug.apk

# 预期大小：50-60MB
```

### 3. 复制APK到项目根目录

```bash
# 生成带日期的文件名
DATE=$(date +%Y%m%d)
APK_SOURCE="/workspace/projects/client/android/app/build/outputs/apk/debug/app-debug.apk"
APK_DEST="/workspace/projects/智慧记AI进销存-v1.0.0-$DATE.apk"

# 复制APK
cp "$APK_SOURCE" "$APK_DEST"

# 验证
ls -lh "$APK_DEST"
```

### 4. 验证APK完整性

```bash
# 使用aapt检查APK
export ANDROID_HOME=/root/android-sdk
$ANDROID_HOME/build-tools/34.0.0/aapt dump badging 智慧记AI进销存-v1.0.0-$DATE.apk

# 应该看到：
# package: name='com.free.jxc.app'
# versionCode='1'
# versionName='1.0.0'
```

### 5. 安装到设备测试

```bash
# 连接设备
adb devices

# 安装APK
adb install 智慧记AI进销存-v1.0.0-$DATE.apk

# 查看日志
adb logcat | grep "expo"
```

## 🚨 如果构建失败

### 检查错误

```bash
# 查看错误信息
tail -100 /tmp/apk-final-build.log | grep -i "error\|failed"

# 查看完整的错误上下文
tail -200 /tmp/apk-final-build.log
```

### 常见错误处理

**内存不足**:
```bash
# 停止构建
pkill -9 gradle

# 增加内存并重新构建
export GRADLE_OPTS="-Xmx4g -XX:MaxMetaspaceSize=1g"
cd /workspace/projects/client/android
./gradlew assembleDebug --no-daemon
```

**磁盘空间不足**:
```bash
# 清理缓存
rm -rf ~/.gradle/caches
rm -rf ~/.android/cache

# 重新构建
cd /workspace/projects/client/android
./gradlew clean
./gradlew assembleDebug
```

**构建超时**:
如果构建在云端环境超时，建议使用EAS云构建：
```bash
cd /workspace/projects/client
eas build --platform android --profile preview
```

## 📞 快速参考

### 监控命令

```bash
# 查看构建进度
tail -50 /tmp/apk-final-build.log

# 检查构建进程
ps aux | grep gradle | grep -v grep

# 检查APK
find /workspace/projects/client/android -name "*.apk" -type f
```

### 完成后命令

```bash
# 复制APK
DATE=$(date +%Y%m%d)
cp /workspace/projects/client/android/app/build/outputs/apk/debug/app-debug.apk \
   /workspace/projects/智慧记AI进销存-v1.0.0-$DATE.apk

# 验证
ls -lh /workspace/projects/智慧记AI进销存-v1.0.0-$DATE.apk
```

## 📈 构建进度跟踪表

检查时请记录以下信息：

| 检查时间 | 日志行数 | 进程数量 | 当前进度 | 状态 |
|----------|----------|----------|----------|------|
| 23:26 | 337行 | 2个 | Kotlin编译 | 🔄 进行中 |
| ___ | ___ | ___ | ___ | ___ |
| ___ | ___ | ___ | ___ | ___ |

填写示例：
```
23:36 | 800行 | 2个 | Java编译 | 🔄 进行中
23:46 | 1200行 | 2个 | 打包APK | 🔄 进行中
00:06 | 1500行 | 0个 | 完成 | ✅ 成功
```

## 🎉 预期结果

构建成功后，您将获得：

1. **APK文件**：
   - 位置：`/workspace/projects/智慧记AI进销存-v1.0.0-YYYYMMDD.apk`
   - 大小：约50-60MB
   - 版本：1.0.0
   - 包名：com.free.jxc.app

2. **功能特性**：
   - ✅ 完整的商品管理（多单位、多规格）
   - ✅ 库存管理（入库、出库、盘点）
   - ✅ 销售开单（扫码、赊账、退货）
   - ✅ 客户/供应商管理
   - ✅ 统计分析
   - ✅ 完全离线可用

## 💡 提示

- 构建需要30-60分钟，请耐心等待
- 可以定期检查构建进度
- 如果长时间无进度，请检查是否有错误
- 构建完成后，APK可以安装在任何Android 10+设备上

## 📚 相关文档

- [BUILD_FINAL.md](./BUILD_FINAL.md) - 构建状态文档
- [QUICK_START.md](./QUICK_START.md) - 快速开始指南
- [AUTO_BUILD_GUIDE.md](./AUTO_BUILD_GUIDE.md) - 自动构建指南
- [USER_GUIDE.md](./USER_GUIDE.md) - 用户使用手册

---

**构建进行中，请持续监控或等待完成！** 🚀
