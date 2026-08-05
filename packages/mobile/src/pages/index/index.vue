<template>
  <view class="page" :style="{ '--status-bar-height': statusBarHeight + 'px', '--tabbar-height': tabbarHeight + 'px' }">
    <!-- Hero + 搜索框 -->
    <view class="hero-section">
      <text class="hero-title">入职前，先看清楚这家公司</text>
      <text class="hero-subtitle">六维交叉验证 · 红绿灯预警 · 真实时薪</text>

      <view class="search-bar" @tap="goSearch">
        <Icon name="search" :size="36" color="#72727d" style="margin-right: 16rpx" />
        <text class="search-placeholder">搜索公司名称，如 特斯拉、立讯精密</text>
        <view class="search-btn">
          <text class="search-btn-text">搜索</text>
        </view>
      </view>
    </view>

    <!-- 热门公司推荐 -->
    <view class="section">
      <view class="section-header">
        <Icon name="fire" :size="36" color="#f59e0b" />
        <text class="section-title">热门公司推荐</text>
        <text
          v-if="results.length > 0"
          class="section-more"
          @tap="goSearch"
        >查看更多 ></text>
      </view>

      <view v-if="loading" class="skeleton-list">
        <view v-for="i in 4" :key="i" class="skeleton-item" />
      </view>

      <view v-else-if="results.length > 0" class="company-list">
        <company-card
          v-for="c in results"
          :key="c.id"
          :company="c"
          :summary="summaryMap[c.id]"
        />
      </view>

      <view v-else class="empty-state">
        <text class="empty-text">暂无推荐公司</text>
      </view>
    </view>

    <!-- 六维亮点说明 -->
    <view class="section">
      <text class="section-title">六维亮点说明</text>
      <view class="dim-grid">
        <view
          v-for="meta in DIMENSIONS_META"
          :key="meta.key"
          class="dim-card"
        >
          <view class="dim-card-header">
            <view
              class="dim-icon-box"
              :style="{
                backgroundColor: getAccentBg(meta.accent),
              }"
            >
              <text
                class="dim-icon-text-lg"
                :style="{ color: getAccentText(meta.accent) }"
              >{{ meta.label.charAt(0) }}</text>
            </view>
            <view class="dim-card-title-area">
              <text class="dim-card-title">{{ meta.label }}</text>
              <text class="dim-card-oneliner">{{ meta.oneLiner }}</text>
            </view>
          </view>
          <text class="dim-card-desc">{{ meta.decisionMeaning }}</text>
        </view>
      </view>
    </view>
    <TabBar current="index" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { searchCompanies, getCompanySummary } from "@/utils/api";
import type { CompanyListItem, CompanySummaryResponse } from "@/utils/types";
import { DIMENSIONS_META, DIMENSION_ACCENT, getSystemLayout } from "@/utils/constants";
import CompanyCard from "@/components/company-card.vue";

const { statusBarHeight, tabbarHeight } = getSystemLayout();
const results = ref<CompanyListItem[]>([]);
const summaryMap = ref<Record<number, CompanySummaryResponse>>({});
const loading = ref(true);

async function loadData() {
  loading.value = true;
  try {
    const data = await searchCompanies("", 20, 0);
    results.value = data;
    const summaries = await Promise.all(
      data.map((c) => getCompanySummary(c.id))
    );
    const next: Record<number, CompanySummaryResponse> = {};
    for (const s of summaries) {
      if (s) next[s.company_id] = s;
    }
    summaryMap.value = next;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});

onShow(() => {
  uni.hideTabBar();
  if (results.value.length === 0) {
    loadData();
  }
});

function goSearch() {
  uni.navigateTo({ url: "/pages/search/search" });
}

function getAccentBg(accent: string): string {
  return DIMENSION_ACCENT[accent]?.bg || "#efeff1";
}

function getAccentText(accent: string): string {
  return DIMENSION_ACCENT[accent]?.text || "#414149";
}
</script>

<style lang="scss" scoped>
.page {
  padding: 0 32rpx;
  padding-bottom: var(--tabbar-height);
}

.hero-section {
  padding: calc(var(--status-bar-height) + 80rpx) 0 64rpx;
  text-align: center;
}

.hero-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #18181b;
  margin-bottom: 16rpx;
}

.hero-subtitle {
  display: block;
  font-size: 26rpx;
  color: #72727d;
  margin-bottom: 48rpx;
}

.search-bar {
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1rpx solid #e4e4e7;
  border-radius: 999rpx;
  padding: 0 8rpx 0 40rpx;
  height: 96rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.search-icon {
  font-size: 36rpx;
  color: #72727d;
  margin-right: 16rpx;
}

.search-placeholder {
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  color: #9898a0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-btn {
  height: 72rpx;
  padding: 0 40rpx;
  border-radius: 999rpx;
  background: #18181b;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn-text {
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 600;
}

.section {
  padding: 48rpx 0 16rpx;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.section-icon {
  font-size: 36rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #18181b;
}

.section-more {
  margin-left: auto;
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
}

.skeleton-item {
  height: 128rpx;
  border-radius: 16px;
  background: #efeff1;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.empty-state {
  padding: 96rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #72727d;
}

.dim-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24rpx;
}

.dim-card {
  width: calc(50% - 12rpx);
  background: #ffffff;
  border: 1rpx solid #e4e4e7;
  border-radius: 16px;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.dim-card-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 16rpx;
}

.dim-icon-box {
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dim-icon-text-lg {
  font-size: 32rpx;
  font-weight: 600;
}

.dim-card-title-area {
  flex: 1;
  min-width: 0;
}

.dim-card-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #18181b;
}

.dim-card-oneliner {
  display: block;
  font-size: 22rpx;
  color: #72727d;
  margin-top: 4rpx;
}

.dim-card-desc {
  font-size: 24rpx;
  color: #72727d;
  line-height: 1.6;
}
</style>
