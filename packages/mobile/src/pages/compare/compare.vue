<template>
  <view class="page">
    <!-- 选择模式 -->
    <template v-if="mode === 'select'">
      <view class="topbar">
        <view class="back-btn" @tap="goHome">
          <text class="back-icon">&#xe612;</text>
        </view>
        <text class="topbar-title">公司对比</text>
        <view class="topbar-right" />
      </view>

      <view class="content">
        <view class="intro">
          <text class="intro-title">1v1 对比</text>
          <text class="intro-desc">从下方选择 2 家公司，查看六维横向对比与真实时薪</text>
        </view>

        <!-- 已选公司 chips -->
        <view v-if="selectedCompanies.length > 0" class="chips">
          <view
            v-for="c in selectedCompanies"
            :key="c.id"
            class="chip"
          >
            <text class="chip-text">{{ c.short_name || c.name }}</text>
            <text class="chip-close" @tap="removeSelected(c.id)">&#xe613;</text>
          </view>
          <text v-if="selectedIds.length < MAX_COMPARE" class="chip-hint">
            再选 {{ MAX_COMPARE - selectedIds.length }} 家
          </text>
        </view>

        <!-- 公司列表 -->
        <view v-if="loading" class="skeleton-list">
          <view v-for="i in 5" :key="i" class="skeleton-item" />
        </view>

        <view v-else class="company-list">
          <view
            v-for="c in results"
            :key="c.id"
            class="select-card"
            :class="{ 'select-card-active': selectedIds.includes(c.id) }"
            @tap="toggleSelect(c.id)"
          >
            <view class="select-card-info">
              <text class="select-card-name">{{ c.name }}</text>
              <text class="select-card-meta">
                {{ c.industry || '未知行业' }} · {{ c.scale || '未知规模' }}
              </text>
            </view>
            <view
              class="select-btn"
              :class="{ 'select-btn-active': selectedIds.includes(c.id) }"
            >
              <text class="select-btn-icon">{{ selectedIds.includes(c.id) ? '✓' : '+' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部操作栏 -->
      <view class="action-bar safe-area-bottom">
        <text class="action-count">
          已选 <text class="action-count-num">{{ selectedIds.length }}</text> / {{ MAX_COMPARE }}
        </text>
        <view
          class="action-btn"
          :class="{ 'action-btn-disabled': selectedIds.length !== 2 }"
          @tap="startCompare"
        >
          <text class="action-btn-text">开始 1v1 对比</text>
        </view>
      </view>
    </template>

    <!-- 对比模式 -->
    <template v-else>
      <view class="topbar">
        <view class="back-btn" @tap="backToSelect">
          <text class="back-icon">&#xe612;</text>
        </view>
        <text class="topbar-title">1v1 对比</text>
        <view class="topbar-right" />
      </view>

      <view v-if="compareLoading" class="skeleton-area">
        <view class="skeleton-block" style="height: 200rpx" />
        <view class="skeleton-block" style="height: 500rpx" />
      </view>

      <view v-else-if="compareData && compareData.companies.length === 2" class="compare-content">
        <!-- VS 头卡 -->
        <view class="vs-section">
          <view
            v-for="c in compareData.companies"
            :key="c.company_id"
            class="vs-card"
          >
            <text class="vs-card-name">{{ c.short_name || c.name }}</text>
            <view class="vs-card-score">
              <text class="vs-score-num">{{ (c.overall_score / 10).toFixed(1) }}</text>
            </view>
          </view>
          <view class="vs-badge">
            <text class="vs-badge-text">VS</text>
          </view>
        </view>

        <!-- 六维对比 -->
        <view class="card">
          <text class="card-title">六维度逐项对比</text>
          <view
            v-for="dimKey in DIMENSION_ORDER"
            :key="dimKey"
            class="compare-row"
          >
            <view class="compare-dim-label">
              <text class="compare-dim-text">{{ getDimLabel(dimKey) }}</text>
            </view>
            <view class="compare-scores">
              <view
                v-for="c in compareData.companies"
                :key="c.company_id"
                class="compare-score-item"
              >
                <text class="compare-score-name">{{ c.short_name || c.name }}</text>
                <view class="compare-score-bar-row">
                  <view class="compare-score-bar">
                    <view
                      class="compare-score-fill"
                      :style="{
                        width: `${getDimScore(c, dimKey)}%`,
                        backgroundColor: getDimColor(c, dimKey),
                      }"
                    />
                  </view>
                  <text class="compare-score-num">{{ (getDimScore(c, dimKey) / 10).toFixed(1) }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 真实时薪对比 -->
        <view v-if="hasWageData" class="card">
          <text class="card-title">真实时薪对比</text>
          <view class="wage-compare">
            <view
              v-for="c in compareData.companies"
              :key="c.company_id"
              class="wage-compare-item"
            >
              <text class="wage-compare-name">{{ c.short_name || c.name }}</text>
              <template v-if="analysisMap[c.company_id]?.real_hourly_wage">
                <view class="wage-compare-main">
                  <text class="wage-compare-amount">¥{{ analysisMap[c.company_id]!.real_hourly_wage.hourly_wage.toFixed(0) }}</text>
                  <text class="wage-compare-unit">/小时</text>
                </view>
                <view class="wage-compare-bar">
                  <view
                    class="wage-compare-fill"
                    :style="{
                      width: `${getWageHeight(c.company_id)}%`,
                      backgroundColor: getWageColor(c.company_id),
                    }"
                  />
                </view>
                <text class="wage-compare-meta">
                  月到手 ¥{{ (analysisMap[c.company_id]!.real_hourly_wage.monthly_take_home / 1000).toFixed(1) }}k
                </text>
              </template>
              <text v-else class="wage-no-data">暂无时薪数据</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="empty-state">
        <text class="empty-text">对比数据加载失败，请重试</text>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { onShow } from "@dcloudio/uni-app";
import {
  searchCompanies,
  getCompanySummary,
  compareCompanies,
  getCompanyAnalysis,
} from "@/utils/api";
import type {
  CompanyListItem,
  CompanySummaryResponse,
  CompareResponse,
  CompanyAnalysisResponse,
  DimensionKey,
} from "@/utils/types";
import {
  DIMENSION_ORDER,
  DIMENSION_LABELS,
  LEVEL_COLORS,
} from "@/utils/constants";
import { getCompareIds, setCompareIds } from "@/utils/storage";

const MAX_COMPARE = 2;
const mode = ref<"select" | "compare">("select");
const selectedIds = ref<number[]>([]);
const results = ref<CompanyListItem[]>([]);
const summaryMap = ref<Record<number, CompanySummaryResponse>>({});
const loading = ref(true);

const compareData = ref<CompareResponse | null>(null);
const analysisMap = ref<Record<number, CompanyAnalysisResponse>>({});
const compareLoading = ref(false);

const selectedCompanies = computed(() =>
  selectedIds.value
    .map((id) => results.value.find((c) => c.id === id))
    .filter((c): c is CompanyListItem => !!c)
);

const hasWageData = computed(() => {
  if (!compareData.value) return false;
  return compareData.value.companies.some(
    (c) => analysisMap.value[c.company_id]?.real_hourly_wage?.hourly_wage > 0
  );
});

async function loadCompanies() {
  loading.value = true;
  try {
    const list = await searchCompanies("", 50, 0);
    results.value = list;
    const summaries = await Promise.all(
      list.map((c) => getCompanySummary(c.id))
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
  selectedIds.value = getCompareIds();
  loadCompanies();
});

onShow(() => {
  selectedIds.value = getCompareIds();
});

function toggleSelect(id: number) {
  const idx = selectedIds.value.indexOf(id);
  if (idx >= 0) {
    selectedIds.value = selectedIds.value.filter((x) => x !== id);
  } else if (selectedIds.value.length >= MAX_COMPARE) {
    selectedIds.value = [...selectedIds.value.slice(1), id];
  } else {
    selectedIds.value = [...selectedIds.value, id];
  }
  setCompareIds(selectedIds.value);
}

function removeSelected(id: number) {
  selectedIds.value = selectedIds.value.filter((x) => x !== id);
  setCompareIds(selectedIds.value);
}

async function startCompare() {
  if (selectedIds.value.length !== 2) return;
  mode.value = "compare";
  compareLoading.value = true;
  try {
    const res = await compareCompanies(selectedIds.value);
    if (res) {
      compareData.value = res;
      const analyses = await Promise.all(
        res.companies.map((c) => getCompanyAnalysis(c.company_id))
      );
      const next: Record<number, CompanyAnalysisResponse> = {};
      for (let i = 0; i < res.companies.length; i++) {
        if (analyses[i]) {
          next[res.companies[i].company_id] = analyses[i]!;
        }
      }
      analysisMap.value = next;
    }
  } finally {
    compareLoading.value = false;
  }
}

function backToSelect() {
  mode.value = "select";
  compareData.value = null;
  analysisMap.value = {};
}

function goHome() {
  uni.switchTab({ url: "/pages/index/index" });
}

function getDimLabel(key: string): string {
  return DIMENSION_LABELS[key as DimensionKey] || key;
}

function getDimScore(company: any, dimKey: string): number {
  const dim = company.dimensions.find((d: any) => d.key === dimKey);
  return dim ? dim.score : 0;
}

function getDimColor(company: any, dimKey: string): string {
  const dim = company.dimensions.find((d: any) => d.key === dimKey);
  if (!dim) return "#bdbdc2";
  return LEVEL_COLORS[dim.level as keyof typeof LEVEL_COLORS]?.hex || "#bdbdc2";
}

function getWageHeight(companyId: number): number {
  const wages = Object.values(analysisMap.value)
    .map((a) => a?.real_hourly_wage?.hourly_wage || 0)
    .filter((w) => w > 0);
  const maxWage = Math.max(...wages, 1);
  const wage = analysisMap.value[companyId]?.real_hourly_wage?.hourly_wage || 0;
  return maxWage > 0 ? (wage / maxWage) * 100 : 0;
}

function getWageColor(companyId: number): string {
  const wage = analysisMap.value[companyId]?.real_hourly_wage?.hourly_wage || 0;
  const p50 = analysisMap.value[companyId]?.real_hourly_wage?.industry_p50_hourly || 0;
  return p50 > 0 && wage >= p50 ? "#22c55e" : "#f59e0b";
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #ffffff;
  padding-bottom: 200rpx;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1rpx solid #efeff1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  height: 112rpx;
  padding-top: var(--status-bar-height);
}

.back-btn { padding: 8rpx 0; }
.back-icon { font-size: 40rpx; color: #18181b; }
.topbar-title { font-size: 32rpx; font-weight: 600; color: #18181b; }
.topbar-right { width: 60rpx; }

.content { padding: 32rpx; }

.intro { padding: 32rpx 0; }
.intro-title { display: block; font-size: 36rpx; font-weight: 600; color: #18181b; }
.intro-desc { display: block; font-size: 24rpx; color: #72727d; margin-top: 8rpx; }

.chips { display: flex; flex-wrap: wrap; align-items: center; gap: 16rpx; margin-bottom: 24rpx; }
.chip {
  display: flex; align-items: center; gap: 12rpx;
  padding: 12rpx 20rpx; border-radius: 999rpx;
  background: #18181b; color: #ffffff;
}
.chip-text { font-size: 24rpx; font-weight: 500; }
.chip-close { font-size: 28rpx; color: rgba(255,255,255,0.7); }
.chip-hint { font-size: 24rpx; color: #72727d; }

.company-list { display: flex; flex-direction: column; gap: 16rpx; }

.select-card {
  display: flex; align-items: center; gap: 24rpx;
  padding: 24rpx; border: 2rpx solid #efeff1; border-radius: 16rpx;
  background: #ffffff;
}
.select-card-active { border-color: #18181b; }
.select-card-info { flex: 1; min-width: 0; }
.select-card-name { display: block; font-size: 28rpx; font-weight: 600; color: #18181b; margin-bottom: 4rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.select-card-meta { display: block; font-size: 24rpx; color: #72727d; }
.select-btn {
  width: 80rpx; height: 80rpx; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: #f7f7f8; flex-shrink: 0;
}
.select-btn-active { background: #18181b; }
.select-btn-icon { font-size: 36rpx; font-weight: 700; color: #72727d; }
.select-btn-active .select-btn-icon { color: #ffffff; }

.action-bar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;
  display: flex; align-items: center; justify-content: space-between;
  padding: 24rpx 32rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1rpx solid #efeff1;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}
.action-count { font-size: 24rpx; color: #72727d; }
.action-count-num { font-weight: 700; color: #18181b; }
.action-btn {
  padding: 0 48rpx; height: 80rpx; border-radius: 16rpx;
  background: #18181b; display: flex; align-items: center; justify-content: center;
}
.action-btn-disabled { opacity: 0.4; }
.action-btn-text { color: #ffffff; font-size: 28rpx; font-weight: 600; }

.skeleton-list { display: flex; flex-direction: column; gap: 16rpx; }
.skeleton-item { height: 128rpx; border-radius: 16rpx; background: #f7f7f8; animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
.skeleton-area { padding: 32rpx; display: flex; flex-direction: column; gap: 24rpx; }
.skeleton-block { border-radius: 24rpx; background: #f7f7f8; animation: pulse 1.5s ease-in-out infinite; }

.compare-content { padding: 32rpx; }

.vs-section { position: relative; display: flex; gap: 16rpx; margin-bottom: 32rpx; }
.vs-card {
  flex: 1; padding: 24rpx; border: 1rpx solid #efeff1; border-radius: 16rpx;
  background: #ffffff; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
}
.vs-card-name { display: block; font-size: 24rpx; font-weight: 700; color: #18181b; margin-bottom: 8rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vs-score-num { font-size: 48rpx; font-weight: 800; color: #18181b; }
.vs-badge {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
  width: 64rpx; height: 64rpx; border-radius: 50%;
  background: #18181b; display: flex; align-items: center; justify-content: center;
  border: 4rpx solid #ffffff;
}
.vs-badge-text { font-size: 20rpx; font-weight: 800; color: #ffffff; }

.card {
  background: #ffffff; border: 1rpx solid #efeff1; border-radius: 24rpx;
  padding: 32rpx; margin-top: 32rpx; box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
}
.card-title { display: block; font-size: 32rpx; font-weight: 600; color: #18181b; margin-bottom: 24rpx; }

.compare-row { display: flex; align-items: center; gap: 24rpx; padding: 16rpx 0; border-top: 1rpx solid #efeff1; }
.compare-row:first-of-type { border-top: none; }
.compare-dim-label { width: 180rpx; flex-shrink: 0; }
.compare-dim-text { font-size: 24rpx; font-weight: 600; color: #18181b; }
.compare-scores { flex: 1; display: flex; flex-direction: column; gap: 12rpx; }
.compare-score-item { display: flex; flex-direction: column; gap: 4rpx; }
.compare-score-name { font-size: 20rpx; color: #72727d; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.compare-score-bar-row { display: flex; align-items: center; gap: 12rpx; }
.compare-score-bar { flex: 1; height: 12rpx; border-radius: 999rpx; background: #f7f7f8; overflow: hidden; }
.compare-score-fill { height: 100%; border-radius: 999rpx; }
.compare-score-num { font-size: 24rpx; font-weight: 700; color: #18181b; width: 56rpx; text-align: right; }

.wage-compare { display: flex; gap: 24rpx; }
.wage-compare-item { flex: 1; padding: 24rpx; border-radius: 16rpx; background: #f7f7f8; display: flex; flex-direction: column; gap: 12rpx; }
.wage-compare-name { font-size: 22rpx; font-weight: 600; color: #18181b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.wage-compare-main { display: flex; align-items: baseline; gap: 8rpx; }
.wage-compare-amount { font-size: 48rpx; font-weight: 800; color: #18181b; }
.wage-compare-unit { font-size: 24rpx; color: #72727d; }
.wage-compare-bar { height: 16rpx; border-radius: 999rpx; background: #ffffff; overflow: hidden; }
.wage-compare-fill { height: 100%; border-radius: 999rpx; }
.wage-compare-meta { font-size: 20rpx; color: #72727d; }
.wage-no-data { font-size: 24rpx; color: #72727d; text-align: center; padding: 48rpx 0; }

.empty-state { padding: 160rpx 32rpx; text-align: center; }
.empty-text { font-size: 28rpx; color: #72727d; }
</style>
