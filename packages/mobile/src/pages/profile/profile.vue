<template>
  <view class="page" :style="{ '--status-bar-height': statusBarHeight + 'px', '--tabbar-height': tabbarHeight + 'px' }">
    <!-- 用户信息卡 -->
    <view class="user-section">
      <view class="user-card">
        <!-- 未登录 -->
        <view v-if="!isLoggedIn" class="not-logged-in">
          <view class="avatar-placeholder">
            <Icon name="user" :size="64" color="#9333ea" />
          </view>
          <view class="login-prompt">
            <text class="login-prompt-title">开启你的求职决策</text>
            <text class="login-prompt-desc">登录后同步收藏、对比与浏览记录</text>
          </view>
        </view>

        <!-- 已登录 -->
        <view v-else class="logged-in">
          <view class="avatar-box">
            <view class="avatar-inner">
              <text class="avatar-text">{{ username.charAt(0) || 'Z' }}</text>
            </view>
          </view>
          <view class="user-info">
            <view class="user-name-row">
              <text class="user-name">{{ username }}</text>
              <view class="vip-badge">
                <text class="vip-text">VIP</text>
              </view>
            </view>
            <text class="user-bio">{{ bio || '欢迎回来 · 用好六维决策更聪明' }}</text>
          </view>
        </view>

        <!-- 登录按钮 -->
        <view v-if="!isLoggedIn" class="login-actions">
          <view class="login-btn" @tap="goLogin">
            <text class="login-btn-text">登录 / 注册</text>
          </view>
          <view class="browse-btn" @tap="goHome">
            <text class="browse-btn-text">随便看看</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 我的工具（登录态） -->
    <view v-if="isLoggedIn" class="tools-section">
      <text class="section-label">我的工具</text>
      <view class="tools-grid">
        <view class="tool-item" @tap="showComingSoon">
          <Icon name="star" :size="44" color="#15803d" />
          <text class="tool-value">{{ favCount }}</text>
          <text class="tool-label">收藏</text>
        </view>
        <view class="tool-item" @tap="goCompare">
          <Icon name="scale" :size="44" color="#0369a1" />
          <text class="tool-value">0</text>
          <text class="tool-label">对比</text>
        </view>
        <view class="tool-item" @tap="showComingSoon">
          <Icon name="clipboard" :size="44" color="#b45309" />
          <text class="tool-value">{{ historyCount }}</text>
          <text class="tool-label">浏览</text>
        </view>
        <view class="tool-item" @tap="showComingSoon">
          <Icon name="edit" :size="44" color="#9333ea" />
          <text class="tool-value">{{ reviewCount }}</text>
          <text class="tool-label">评价</text>
        </view>
      </view>
    </view>

    <!-- 菜单 -->
    <view class="menu-section">
      <text class="section-label">账号</text>
      <view class="menu-card">
        <view class="menu-item" @tap="showComingSoon">
          <view class="menu-icon-box" style="background: #e0f2fe">
            <Icon name="lock" :size="32" color="#0369a1" />
          </view>
          <text class="menu-label">账号安全</text>
          <text class="menu-value">未绑定</text>
          <text class="menu-arrow">></text>
        </view>
      </view>
    </view>

    <view class="menu-section">
      <text class="section-label">偏好与帮助</text>
      <view class="menu-card">
        <view class="menu-item" @tap="showComingSoon">
          <view class="menu-icon-box" style="background: #efeff1">
            <Icon name="moon" :size="32" color="#55555e" />
          </view>
          <text class="menu-label">深色模式</text>
          <text class="menu-value">跟随系统</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item border-top" @tap="showComingSoon">
          <view class="menu-icon-box" style="background: #fef3c7">
            <Icon name="bell" :size="32" color="#b45309" />
          </view>
          <text class="menu-label">消息通知</text>
          <text class="menu-value">已开启</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item border-top" @tap="showComingSoon">
          <view class="menu-icon-box" style="background: #dcfce7">
            <Icon name="info" :size="32" color="#15803d" />
          </view>
          <text class="menu-label">关于真职</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item border-top" @tap="showComingSoon">
          <view class="menu-icon-box" style="background: #f3e8ff">
            <Icon name="chat" :size="32" color="#9333ea" />
          </view>
          <text class="menu-label">帮助与反馈</text>
          <text class="menu-arrow">></text>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view v-if="isLoggedIn" class="menu-section">
      <view class="menu-card">
        <view class="menu-item" @tap="handleLogout">
          <view class="menu-icon-box" style="background: #fff1f2">
            <Icon name="logout" :size="32" color="#e11d48" />
          </view>
          <text class="menu-label" style="color: #e11d48">退出登录</text>
        </view>
      </view>
    </view>

    <!-- Toast -->
    <view v-if="toast" class="toast">
      <text class="toast-text">{{ toast }}</text>
    </view>
    <TabBar current="profile" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { getFavorites, getMe } from "@/utils/api";
import {
  hasToken,
  removeToken,
  Storage,
} from "@/utils/storage";
import { getSystemLayout } from "@/utils/constants";

const { statusBarHeight, tabbarHeight } = getSystemLayout();
const isLoggedIn = ref(false);
const username = ref("");
const bio = ref("");
const favCount = ref(0);
const historyCount = ref(0);
const reviewCount = ref(0);
const toast = ref("");

function loadLocalCounts() {
  const favs = Storage.getJSON<any[]>("zjob_favorites", []);
  favCount.value = Array.isArray(favs) ? favs.length : 0;
  const history = Storage.getJSON<any[]>("zjob_view_history", []);
  historyCount.value = Array.isArray(history) ? history.length : 0;
  const reviews = Storage.getJSON<any[]>("zjob_reviews", []);
  reviewCount.value = Array.isArray(reviews) ? reviews.length : 0;
}

onMounted(() => {
  checkLogin();
});

onShow(() => {
  uni.hideTabBar();
  checkLogin();
  if (isLoggedIn.value) {
    loadFavorites();
  } else {
    loadLocalCounts();
  }
});

function checkLogin() {
  isLoggedIn.value = hasToken();
  if (!isLoggedIn.value) {
    loadLocalCounts();
    return;
  }
  const savedName = Storage.get("zjob_nickname") || "";
  if (savedName) username.value = savedName;
  getMe()
    .then((profile) => {
      username.value = profile.nickname || profile.username;
      if (profile.bio) bio.value = profile.bio;
    })
    .catch(() => {
      const role = Storage.get("zjob_role");
      username.value = Storage.get("zjob_nickname") || (role === "admin" ? "运营同学" : "真职用户");
    });
}

async function loadFavorites() {
  try {
    const items = await getFavorites();
    favCount.value = Array.isArray(items) ? items.length : 0;
  } catch {
    loadLocalCounts();
  }
}

function handleLogout() {
  removeToken();
  isLoggedIn.value = false;
  showToast("已退出登录");
}

function goLogin() {
  uni.navigateTo({ url: "/pages/login/login" });
}

function goHome() {
  uni.switchTab({ url: "/pages/index/index" });
}

function goCompare() {
  uni.switchTab({ url: "/pages/compare/compare" });
}

function showComingSoon() {
  showToast("功能即将上线，敬请期待");
}

function showToast(msg: string) {
  toast.value = msg;
  setTimeout(() => {
    toast.value = "";
  }, 2000);
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f7f7f8;
  padding-bottom: var(--tabbar-height);
}

.user-section { padding: calc(var(--status-bar-height) + 40rpx) 32rpx 16rpx; }

.user-card {
  background: #ffffff;
  border: 1rpx solid #e4e4e7;
  border-radius: 16px;
  padding: 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.not-logged-in { display: flex; align-items: center; gap: 32rpx; }
.avatar-placeholder {
  width: 128rpx; height: 128rpx; border-radius: 50%;
  background: #f3e8ff; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.avatar-icon { font-size: 64rpx; color: #9333ea; }
.login-prompt { flex: 1; }
.login-prompt-title { display: block; font-size: 32rpx; font-weight: 600; color: #18181b; }
.login-prompt-desc { display: block; font-size: 24rpx; color: #72727d; margin-top: 8rpx; line-height: 1.5; }

.logged-in { display: flex; align-items: center; gap: 32rpx; }
.avatar-box {
  width: 128rpx; height: 128rpx; border-radius: 50%;
  background: linear-gradient(135deg, #d8b4fe, #9333ea, #7e22ce);
  padding: 4rpx; flex-shrink: 0;
}
.avatar-inner {
  width: 100%; height: 100%; border-radius: 50%;
  background: #dcfce7; display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.avatar-text { font-size: 48rpx; font-weight: 700; color: #15803d; }
.user-info { flex: 1; min-width: 0; }
.user-name-row { display: flex; align-items: center; gap: 16rpx; }
.user-name { font-size: 32rpx; font-weight: 600; color: #18181b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vip-badge {
  padding: 4rpx 16rpx; border-radius: 999rpx;
  background: linear-gradient(90deg, #a855f7, #7e22ce);
}
.vip-text { font-size: 18rpx; font-weight: 700; color: #ffffff; }
.user-bio { display: block; font-size: 24rpx; color: #72727d; margin-top: 8rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.login-actions { display: flex; gap: 16rpx; margin-top: 32rpx; }
.login-btn {
  flex: 1; height: 80rpx; border-radius: 16rpx;
  background: #0284c7; display: flex; align-items: center; justify-content: center;
}
.login-btn-text { color: #ffffff; font-size: 28rpx; font-weight: 600; }
.browse-btn {
  height: 80rpx; padding: 0 32rpx; border-radius: 16rpx;
  border: 1rpx solid #e4e4e7; display: flex; align-items: center; justify-content: center;
}
.browse-btn-text { color: #18181b; font-size: 28rpx; font-weight: 500; }

.tools-section { padding: 16rpx 32rpx; }
.section-label { display: block; font-size: 24rpx; font-weight: 600; color: #72727d; padding: 0 8rpx 16rpx; }
.tools-grid {
  display: flex; justify-content: space-around;
  background: #ffffff; border: 1rpx solid #e4e4e7; border-radius: 16px;
  padding: 32rpx 16rpx; box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}
.tool-item { display: flex; flex-direction: column; align-items: center; gap: 8rpx; flex: 1; }
.tool-icon { font-size: 40rpx; }
.tool-value { font-size: 32rpx; font-weight: 700; color: #18181b; }
.tool-label { font-size: 20rpx; color: #72727d; }

.menu-section { padding: 16rpx 32rpx; }
.menu-card {
  background: #ffffff; border: 1rpx solid #e4e4e7; border-radius: 16px;
  overflow: hidden; box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}
.menu-item {
  display: flex; align-items: center; gap: 24rpx;
  padding: 28rpx 32rpx;
}
.border-top { border-top: 1rpx solid #efeff1; }
.menu-icon-box {
  width: 72rpx; height: 72rpx; border-radius: 16rpx;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.menu-icon { font-size: 32rpx; }
.menu-label { flex: 1; font-size: 28rpx; font-weight: 500; color: #18181b; }
.menu-value { font-size: 24rpx; color: #72727d; }
.menu-arrow { font-size: 28rpx; color: #9898a0; }

.toast {
  position: fixed; bottom: calc(var(--tabbar-height) + 40rpx); left: 50%; transform: translateX(-50%);
  padding: 16rpx 32rpx; border-radius: 16rpx;
  background: #2a2a2f; z-index: 999;
}
.toast-text { color: #ffffff; font-size: 28rpx; }
</style>
