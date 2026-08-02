<template>
  <view class="company-card" @tap="goDetail">
    <!-- Logo -->
    <view class="card-logo">
      <text class="icon-building">&#xe609;</text>
    </view>

    <!-- 信息区 -->
    <view class="card-info">
      <view class="card-title-row">
        <text class="card-title">{{ company.name }}</text>
        <text v-if="score != null" class="card-score-badge">
          {{ (score / 10).toFixed(1) }}
        </text>
      </view>
      <text class="card-subtitle">
        {{ company.industry || '未知行业' }} · {{ company.scale || '未知规模' }}
      </text>

      <!-- 六维图标 -->
      <view v-if="summary" class="dim-icons">
        <view
          v-for="dim in summary.dimensions"
          :key="dim.key"
          class="dim-icon"
          :style="{
            backgroundColor: getDimColor(dim.level) + '22',
            color: getDimColor(dim.level),
          }"
        >
          <text class="dim-icon-text">{{ getDimLabel(dim.key) }}</text>
        </view>
      </view>
    </view>

    <!-- 收藏按钮 -->
    <view
      class="fav-btn"
      :class="{ 'fav-active': favorited }"
      @tap.stop="onToggleFav"
    >
      <text class="fav-icon" :class="{ 'fav-filled': favorited }">&#xe60a;</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { CompanyListItem, CompanySummaryResponse } from "@/utils/types";
import { LEVEL_COLORS, DIMENSIONS_META } from "@/utils/constants";
import { checkFavorite, toggleFavorite } from "@/utils/api";
import {
  hasToken,
  isLocalFav,
  toggleLocalFav,
} from "@/utils/storage";

const props = defineProps<{
  company: CompanyListItem;
  summary?: CompanySummaryResponse;
}>();

const favorited = ref(false);
const busy = ref(false);
const score = props.summary?.overall_score;

onMounted(async () => {
  if (hasToken()) {
    try {
      const res = await checkFavorite(props.company.id);
      favorited.value = !!res.favorited;
    } catch {
      favorited.value = isLocalFav(props.company.id);
    }
  } else {
    favorited.value = isLocalFav(props.company.id);
  }
});

function getDimColor(level: string): string {
  return LEVEL_COLORS[level as keyof typeof LEVEL_COLORS]?.hex || "#bdbdc2";
}

function getDimLabel(key: string): string {
  const meta = DIMENSIONS_META.find((m) => m.key === key);
  return meta ? meta.label.charAt(0) : "?";
}

function goDetail() {
  uni.navigateTo({
    url: `/pages/company/detail?id=${props.company.id}`,
  });
}

async function onToggleFav() {
  if (busy.value) return;
  busy.value = true;
  const optimistic = !favorited.value;
  favorited.value = optimistic;

  let nextFavorited = optimistic;

  if (hasToken()) {
    try {
      const res = await toggleFavorite(props.company.id);
      nextFavorited = !!res.favorited;
    } catch {
      nextFavorited = toggleLocalFav(props.company);
    }
  } else {
    nextFavorited = toggleLocalFav(props.company);
  }

  if (nextFavorited !== optimistic) {
    favorited.value = nextFavorited;
  }
  busy.value = false;
}
</script>

<style lang="scss" scoped>
.company-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  background: #ffffff;
  border: 1rpx solid #efeff1;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.card-logo {
  width: 72rpx;
  height: 72rpx;
  border-radius: 12rpx;
  background: #f7f7f8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-building {
  font-size: 32rpx;
  color: #72727d;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 4rpx;
}

.card-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #18181b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.card-score-badge {
  font-size: 20rpx;
  font-weight: 700;
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
  background: #dcfce7;
  color: #14532d;
  flex-shrink: 0;
}

.card-subtitle {
  font-size: 24rpx;
  color: #72727d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 12rpx;
}

.dim-icons {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.dim-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dim-icon-text {
  font-size: 20rpx;
  font-weight: 600;
}

.fav-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.fav-icon {
  font-size: 48rpx;
  color: #72727d;
}

.fav-active {
  background: #fff1f2;
}

.fav-filled {
  color: #f43f5e;
}
</style>
