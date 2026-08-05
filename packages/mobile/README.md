# 真职 Zjob 跨端移动应用

一套代码，编译到 **iOS / Android / 微信小程序 / 鸿蒙** 四端。

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 框架 | uni-app (Vue 3 + Vite) |
| 语言 | TypeScript + Vue SFC |
| 样式 | SCSS + CSS 变量 |
| API | uni.request（跨端 HTTP） |
| 存储 | uni.setStorageSync（跨端存储） |

## 项目结构

```
mobile/
├── src/
│   ├── manifest.json          # uni-app 配置（含四端配置）
│   ├── pages.json             # 路由 + TabBar 配置
│   ├── App.vue                # 根组件
│   ├── main.ts                # 入口
│   ├── uni.scss               # 全局样式变量
│   ├── pages/
│   │   ├── index/index.vue    # 首页（搜索 + 热门推荐 + 六维说明）
│   │   ├── search/search.vue  # 搜索页（无限滚动）
│   │   ├── company/detail.vue # 公司详情（六维 + 红绿灯 + 时薪 + 口碑）
│   │   ├── compare/compare.vue# 1v1 对比
│   │   ├── profile/profile.vue# 个人中心
│   │   └── login/login.vue    # 登录/注册
│   ├── components/
│   │   └── company-card.vue   # 公司卡片组件
│   ├── utils/
│   │   ├── api.ts             # API 请求层
│   │   ├── types.ts           # TypeScript 类型
│   │   ├── constants.ts       # 常量 & 六维配置
│   │   └── storage.ts         # 跨端存储封装
│   └── static/
│       ├── tabbar/            # TabBar 图标
│       └── logo/              # App 图标
├── index.html                 # H5 模板
├── vite.config.ts             # Vite 配置
├── build.js                   # 构建辅助脚本
├── scripts/build-all.sh       # 一键构建四端
├── .env.development           # 开发环境 API 地址
└── .env.production            # 生产环境 API 地址
```

## 快速开始

### 1. 安装依赖

```bash
cd mobile
npm install
```

### 2. 开发调试

```bash
# H5 开发
npm run dev:h5

# 微信小程序开发
npm run dev:mp-weixin
# 然后用微信开发者工具导入 dist/dev/mp-weixin/

# App 开发（需要 HBuilderX）
npm run dev:app

# 鸿蒙开发（需要 HBuilderX 或 DevEco Studio）
npm run dev:harmony
```

### 3. 一键构建四端

```bash
./scripts/build-all.sh
```

或分别构建：

```bash
npm run build:h5           # H5 → dist/build/h5/
npm run build:mp-weixin    # 微信小程序 → dist/build/mp-weixin/
npm run build:app          # App → dist/build/app/
npm run build:harmony      # 鸿蒙 → dist/build/app-harmony/
```

## 各端打包发布指南

### H5 (Web)

1. `npm run build:h5`
2. 将 `dist/build/h5/` 目录上传到 Web 服务器 / CDN
3. 配置 Nginx 指向该目录即可

### 微信小程序

1. `npm run build:mp-weixin`
2. 打开 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
3. 导入项目，目录选择 `dist/build/mp-weixin/`
4. 在 `manifest.json` 中填写你的小程序 AppID
5. 点击「上传」-> 填写版本号 -> 提交审核
6. 审核通过后在小程序管理后台发布

### iOS App

1. `npm run build:app`
2. 下载安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html)
3. 用 HBuilderX 打开 `dist/build/app/` 目录
4. 菜单：发行 → 原生App-云打包
5. 选择 iOS，填写：
   - Apple ID（开发者账号）
   - 证书文件（.p12）
   - 描述文件（.mobileprovision）
   - Bundle ID（如 com.zjob.app）
6. 点击打包，等待云打包完成，下载 .ipa 文件
7. 上传到 App Store Connect → 提交审核

### Android App

1. `npm run build:app`（与 iOS 共用同一份产出）
2. 用 HBuilderX 打开 `dist/build/app/`
3. 菜单：发行 → 原生App-云打包
4. 选择 Android，填写：
   - 包名（如 com.zjob.app）
   - 签名证书（.keystore 或 .jks）
   - 证书别名和密码
5. 点击打包，等待云打包完成，下载 .apk 文件
6. 上传到各应用商店（应用宝、华为、小米、OPPO、vivo 等）

### 鸿蒙 (HarmonyOS)

1. `npm run build:harmony`
2. 方式一：用 HBuilderX 打开 `dist/build/app-harmony/`，云打包
3. 方式二：用 [DevEco Studio](https://developer.harmonyos.com/cn/develop/deveco-studio/) 导入项目
4. 配置鸿蒙签名证书
5. 构建 .hap 包
6. 上传到华为应用市场

## 配置说明

### API 地址

- 开发环境：`.env.development` → `VITE_API_BASE_URL=http://localhost:8000`
- 生产环境：`.env.production` → `VITE_API_BASE_URL=https://api.zjob.asia`
- 非H5端（小程序/App/鸿蒙）：API 地址在 `src/utils/api.ts` 中硬编码为 `https://api.zjob.asia`

### 小程序 AppID

在 `src/manifest.json` 的 `mp-weixin.appid` 中填写你的微信小程序 AppID。

### App 图标

替换 `src/static/logo/` 下的图标文件为正式设计稿。

## 与 Web 端的关系

本跨端项目从 `web/app/m/` 下的 Next.js 移动端页面移植而来，复用了相同的：
- 六维度数据模型与类型定义
- API 接口层（fetch → uni.request）
- Mock 数据（后端离线时自动降级）
- Emote 色彩体系
- 交互逻辑与业务流程

一套代码编译到四端，业务逻辑与 UI 组件复用率 > 90%。
