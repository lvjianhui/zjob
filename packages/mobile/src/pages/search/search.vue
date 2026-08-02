<template>
  <view class="page">
    <!-- 顶栏 -->
    <view class="topbar">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">&#xe612;</text>
      </view>
      <view class="search-input-bar">
        <text class="search-icon">&#xe610;</text>
        <input
          class="search-input"
          type="text"
          v-model="keyword"
          placeholder="搜索公司名称"
          :placeholder-style="'color: #9898a0'"
          confirm-type="search"
          @confirm="onSearch"
        />
        <text
          v-if="keyword"
          class="clear-btn"
          @tap="clearKeyword"
        >&#xe613;</text>
      </view>
    </view>

    <view class="content">
      <!-- 结果计数 -->
      <text v-if="!loading && results.length > 0" class="result-count">
        {{ keyword ? `「${keyword}」相关公司` : '全部公司' }} · 共 {{ results.length }} 家
      </text>

      <!-- 加载中 -->
      <view v-if="loading" class="skeleton-list">
        <view v-for="i in 5" :key="i" class="skeleton-item" />
      </view>

      <!-- 错误 -->
      <view v-else-if="error" class="empty-state">
        <text class="empty-text">{{ error }}</text>
      </view>

      <!-- 无结果 -->
      <view v-else-if="results.length === 0" class="empty-state">
        <text class="empty-text">未找到相关公司</text>
        <text class="empty-sub">试试其他关键词</text>
      </view>

      <!-- 列表 -->
      <view v-else class="company-list">
        <company-card
          v-for="c in results"
          :key="c.id"
          :company="c"
          :summary="summaryMap[c.id]"
        />

        <!-- 加载更多 -->
        <view v-if="loadingMore" class="load-more">
          <text class="load-more-text">加载中...</text>
        </view>
        <view v-if="!hasMore && results.length > 0" class="load-more">
          <text class="load-more-text">没有更多了</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { searchCompanies, getCompanySummary } from "@/utils/api";
import type { CompanyListItem, CompanySummaryResponse } from "@/utils/types";
import CompanyCard from "@/components/company-card.vue";

const keyword = ref("");
const results = ref<CompanyListItem[]>([]);
const summaryMap = ref<Record<number, CompanySummaryResponse>>({});
const loading = ref(false);
const loadingMore = ref(false);
const hasMore = ref(true);
const error = ref("");
const offset = 0;

const PAGE_SIZE = 20;

async function loadPage(kw: string, off: number, append: boolean) {
  if (append) {
    loadingMore.value = true;
  } else {
    loading.value = true;
  }
  error.value = "";

  try {
    const data = await searchCompanies(kw, PAGE_SIZE, off);
    if (append) {
      const existingIds = new Set(results.value.map((c) => c.id));
      const merged = [...results.value, ...data.filter((c) => !existingIds.has(c.id))];
      results.value = merged;
    } else {
      results.value = data;
    }
    hasMore.value = data.length === PAGE_SIZE;

    const summaries = await Promise.all(
      data.map((c) => getCompanySummary(c.id))
    );
    const next = { ...summaryMap.value };
    for (const s of summaries) {
      if (s) next[s.company_id] = s;
    }
    summaryMap.value = next;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "加载失败";
    if (!append) hasMore.value = false;
  } finally {
    if (append) loadingMore.value = false;
    else loading.value = false;
  }
}

onMounted(() => {
  loadPage("", 0, false);
});

function onSearch() {
  const trimmed = keyword.value.trim();
  loadPage(trimmed, 0, false);
}

function clearKeyword() {
  keyword.value = "";
  loadPage("", 0, false);
}

function goBack() {
  uni.navigateBack({
    fail: () => uni.switchTab({ url: "/pages/index/index" }),
  });
}

// 触底加载更多
import { onReachBottom } from "@dcloudio/uni-app";
onReachBottom(() => {
  if (hasMore.value && !loadingMore.value && !loading.value) {
    loadPage(keyword.value.trim(), results.value.length, true);
  }
});
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #ffffff;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1rpx solid #efeff1;
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 0 32rpx;
  height: 112rpx;
  padding-top: var(--status-bar-height);
}

.back-btn {
  padding: 8rpx 0;
}

.back-icon {
  font-size: 40rpx;
  color: #18181b;
}

.search-input-bar {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f7f7f8;
  border-radius: 999rpx;
  padding: 0 24rpx;
  height: 72rpx;
}

.search-icon {
  font-size: 32rpx;
  color: #72727d;
  margin-right: 12rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #18181b;
  border: none;
  background: transparent;
}

.clear-btn {
  font-size: 32rpx;
  color: #72727d;
}

.content {
  padding: 0 32rpx;
  padding-bottom: 160rpx;
}

.result-count {
  display: block;
  padding: 24rpx 0;
  font-size: 24rpx;
  color: #72727d;
}

.company-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding-top: 16rpx;
}

.skeleton-item {
  height: 128rpx;
  border-radius: 16rpx;
  background: #f7f7f8;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.empty-state {
  padding: 128rpx 0;
  text-align: center;
}

.empty-text {
  display: block;
  font-size: 28rpx;
  color: #72727d;
}

.empty-sub {
  display: block;
  font-size: 24rpx;
  color: #9898a0;
  margin-top: 16rpx;
}

.load-more {
  padding: 32rpx 0;
  text-align: center;
}

.load-more-text {
  font-size: 24rpx;
  color: #72727d;
}
</style>
