#!/bin/bash
# ============================================================
# 真职 Zjob 跨端一键构建脚本
# 编译 H5 / 微信小程序 / App(iOS+Android) / 鸿蒙
# ============================================================
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
NODE_BIN="${NODE_BIN:-node}"
NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=4096}"

cd "$PROJECT_DIR"

echo "=========================================="
echo "  真职 Zjob 跨端构建"
echo "=========================================="
echo ""

# 1. 检查依赖
if [ ! -d "node_modules" ]; then
  echo "[1/6] 安装依赖..."
  npm install
  echo ""
fi

# 2. 构建 H5
echo "[2/6] 构建 H5 (Web)..."
NODE_OPTIONS="$NODE_OPTIONS" $NODE_BIN build.js build -p h5 2>&1 | grep -v "DEPRECATION WARNING\|More info\|legacy-js-api\|not exported by"
echo "  -> 产出: dist/build/h5/"
echo ""

# 3. 构建微信小程序
echo "[3/6] 构建微信小程序..."
NODE_OPTIONS="$NODE_OPTIONS" $NODE_BIN build.js build -p mp-weixin 2>&1 | grep -v "DEPRECATION WARNING\|More info\|legacy-js-api\|not exported by"
echo "  -> 产出: dist/build/mp-weixin/"
echo ""

# 4. 构建 App (iOS + Android)
echo "[4/6] 构建 App (iOS + Android)..."
NODE_OPTIONS="$NODE_OPTIONS" $NODE_BIN build.js build -p app 2>&1 | grep -v "DEPRECATION WARNING\|More info\|legacy-js-api\|not exported by"
echo "  -> 产出: dist/build/app/"
echo ""

# 5. 构建鸿蒙
echo "[5/6] 构建鸿蒙 (HarmonyOS)..."
NODE_OPTIONS="$NODE_OPTIONS" $NODE_BIN build.js build -p app-harmony 2>&1 | grep -v "DEPRECATION WARNING\|More info\|legacy-js-api\|not exported by"
echo "  -> 产出: dist/build/app-harmony/"
echo ""

# 6. 汇总
echo "[6/6] 构建完成！"
echo ""
echo "=========================================="
echo "  构建产物汇总"
echo "=========================================="
echo ""
echo "1. H5 (Web)"
echo "   路径: dist/build/h5/"
echo "   部署: 上传到任意 Web 服务器 / CDN"
echo "   预览: open dist/build/h5/index.html"
echo ""
echo "2. 微信小程序"
echo "   路径: dist/build/mp-weixin/"
echo "   打包: 用微信开发者工具导入此目录"
echo "         点击「上传」-> 提交审核 -> 发布"
echo ""
echo "3. App (iOS + Android)"
echo "   路径: dist/build/app/"
echo "   打包: 用 HBuilderX 打开 dist/build/app/ 目录"
echo "         菜单: 发行 -> 原生App-云打包"
echo "         选择 iOS/Android -> 填写证书 -> 打包"
echo ""
echo "4. 鸿蒙 (HarmonyOS)"
echo "   路径: dist/build/app-harmony/"
echo "   打包: 用 HBuilderX 打开此目录"
echo "         或用 DevEco Studio 导入构建"
echo "=========================================="
