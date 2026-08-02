<template>
  <view class="page">
    <!-- 顶栏 -->
    <view class="topbar" @tap="goBack">
      <text class="back-text">‹ 返回</text>
    </view>

    <!-- 品牌区 -->
    <view class="brand-section">
      <view class="brand-logo">
        <text class="brand-logo-text">Z</text>
      </view>
      <text class="brand-title">真职 Zjob</text>
      <text class="brand-subtitle">入职前，先看清楚这家公司</text>
    </view>

    <!-- 表单区 -->
    <view class="form-section">
      <!-- Tab 切换 -->
      <view class="tab-bar">
        <view
          class="tab-item"
          :class="{ 'tab-active': mode === 'login' }"
          @tap="switchMode('login')"
        >
          <text class="tab-text" :class="{ 'tab-text-active': mode === 'login' }">登录</text>
        </view>
        <view
          class="tab-item"
          :class="{ 'tab-active': mode === 'register' }"
          @tap="switchMode('register')"
        >
          <text class="tab-text" :class="{ 'tab-text-active': mode === 'register' }">注册</text>
        </view>
      </view>

      <!-- 用户名 -->
      <view class="input-group">
        <view class="input-box">
          <text class="input-icon">&#xe61a;</text>
          <input
            class="input-field"
            type="text"
            v-model="username"
            placeholder="用户名"
            :placeholder-style="'color: #9898a0'"
          />
        </view>
      </view>

      <!-- 密码 -->
      <view class="input-group">
        <view class="input-box">
          <text class="input-icon">&#xe61b;</text>
          <input
            class="input-field"
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            :placeholder="mode === 'register' ? '密码（至少 6 位）' : '密码'"
            :placeholder-style="'color: #9898a0'"
          />
          <text class="input-eye" @tap="showPassword = !showPassword">
            {{ showPassword ? '🙈' : '👁' }}
          </text>
        </view>
      </view>

      <!-- 确认密码（注册） -->
      <view v-if="mode === 'register'" class="input-group">
        <view class="input-box">
          <text class="input-icon">&#xe61b;</text>
          <input
            class="input-field"
            :type="showPassword ? 'text' : 'password'"
            v-model="confirmPassword"
            placeholder="确认密码"
            :placeholder-style="'color: #9898a0'"
          />
        </view>
      </view>

      <!-- 错误提示 -->
      <text v-if="error" class="error-text">{{ error }}</text>

      <!-- 提交按钮 -->
      <view
        class="submit-btn"
        :class="{ 'submit-btn-disabled': loading || !username || !password }"
        @tap="handleSubmit"
      >
        <text class="submit-btn-text">
          {{ loading ? (mode === 'login' ? '登录中...' : '注册中...') : (mode === 'login' ? '登录' : '注册') }}
        </text>
      </view>

      <!-- 辅助链接 -->
      <view class="helper-link">
        <text class="helper-text">
          {{ mode === 'login' ? '还没有账号？' : '已有账号？' }}
        </text>
        <text
          class="helper-action"
          @tap="switchMode(mode === 'login' ? 'register' : 'login')"
        >
          {{ mode === 'login' ? '立即注册' : '去登录' }}
        </text>
      </view>
    </view>

    <!-- 底部 -->
    <view class="footer">
      <text class="footer-link" @tap="goHome">先随便看看 →</text>
      <text class="footer-notice">
        注册即代表同意《用户协议》和《隐私政策》
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { login, register } from "@/utils/api";
import { setToken, Storage } from "@/utils/storage";

const mode = ref<"login" | "register">("login");
const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const error = ref("");
const loading = ref(false);

function switchMode(next: "login" | "register") {
  mode.value = next;
  error.value = "";
  password.value = "";
  confirmPassword.value = "";
}

async function handleSubmit() {
  error.value = "";

  if (password.value.length < 6) {
    error.value = "密码至少 6 位";
    return;
  }
  if (mode.value === "register" && password.value !== confirmPassword.value) {
    error.value = "两次输入的密码不一致";
    return;
  }

  loading.value = true;
  try {
    const res =
      mode.value === "login"
        ? await login({ username: username.value, password: password.value })
        : await register({ username: username.value, password: password.value });

    setToken(res.access_token);
    Storage.set("zjob_role", res.role);

    uni.showToast({ title: mode.value === "login" ? "登录成功" : "注册成功", icon: "success" });

    setTimeout(() => {
      uni.navigateBack({
        fail: () => uni.switchTab({ url: "/pages/profile/profile" }),
      });
    }, 1000);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "操作失败";
    if (msg.includes("409")) {
      error.value = "该用户名已被注册";
    } else if (msg.includes("401")) {
      error.value = "用户名或密码错误";
    } else {
      error.value = msg;
    }
  } finally {
    loading.value = false;
  }
}

function goBack() {
  uni.navigateBack({
    fail: () => uni.switchTab({ url: "/pages/index/index" }),
  });
}

function goHome() {
  uni.switchTab({ url: "/pages/index/index" });
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

.topbar {
  padding: 80rpx 32rpx 32rpx;
}

.back-text {
  font-size: 28rpx;
  color: #72727d;
}

.brand-section {
  padding: 32rpx 48rpx 64rpx;
  text-align: center;
}

.brand-logo {
  width: 128rpx; height: 128rpx; border-radius: 32rpx;
  background: #22c55e; margin: 0 auto 32rpx;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(34, 197, 94, 0.2);
}

.brand-logo-text {
  font-size: 56rpx; font-weight: 700; color: #ffffff;
}

.brand-title {
  display: block; font-size: 40rpx; font-weight: 700; color: #18181b;
  margin-bottom: 8rpx;
}

.brand-subtitle {
  display: block; font-size: 26rpx; color: #72727d;
}

.form-section {
  flex: 1; padding: 0 48rpx;
}

.tab-bar {
  display: flex; background: #f7f7f8; border-radius: 999rpx;
  padding: 8rpx; margin-bottom: 48rpx;
}

.tab-item {
  flex: 1; height: 72rpx; border-radius: 999rpx;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.3s;
}

.tab-active {
  background: #ffffff; box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.tab-text {
  font-size: 28rpx; font-weight: 600; color: #72727d;
}

.tab-text-active {
  color: #18181b;
}

.input-group {
  margin-bottom: 32rpx;
}

.input-box {
  display: flex; align-items: center;
  height: 96rpx; padding: 0 32rpx;
  border: 1rpx solid #efeff1; border-radius: 16rpx;
  background: #ffffff;
}

.input-icon {
  font-size: 36rpx; color: #72727d; margin-right: 16rpx;
}

.input-field {
  flex: 1; font-size: 28rpx; color: #18181b;
  border: none; background: transparent;
}

.input-eye {
  font-size: 36rpx;
}

.error-text {
  display: block; font-size: 26rpx; color: #e11d48;
  margin-bottom: 16rpx;
}

.submit-btn {
  height: 96rpx; border-radius: 16rpx;
  background: #18181b; display: flex; align-items: center; justify-content: center;
  margin-top: 16rpx;
}

.submit-btn-disabled {
  opacity: 0.4;
}

.submit-btn-text {
  color: #ffffff; font-size: 30rpx; font-weight: 600;
}

.helper-link {
  display: flex; justify-content: center; align-items: center;
  gap: 8rpx; margin-top: 48rpx;
}

.helper-text {
  font-size: 28rpx; color: #72727d;
}

.helper-action {
  font-size: 28rpx; color: #0284c7; font-weight: 500;
}

.footer {
  padding: 32rpx 48rpx 64rpx; text-align: center;
}

.footer-link {
  display: block; font-size: 28rpx; color: #72727d;
}

.footer-notice {
  display: block; font-size: 22rpx; color: #9898a0;
  margin-top: 32rpx;
}
</style>
