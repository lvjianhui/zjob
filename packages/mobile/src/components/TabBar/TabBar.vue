<template>
  <view
    class="z-tabbar"
    :style="{
      height: tabbarHeight + 'px',
      paddingBottom: safeBottom + 'px',
    }"
  >
    <view
      v-for="tab in tabs"
      :key="tab.key"
      class="z-tabbar-item"
      :class="{ active: current === tab.key }"
      @click="onTap(tab)"
    >
      <Icon
        :name="tab.icon"
        :size="56"
        :color="current === tab.key ? '#18181b' : '#72727d'"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import Icon from "@/components/Icon/Icon.vue";
import { getSystemLayout } from "@/utils/constants";

interface Tab {
  key: string;
  path: string;
  icon: string;
}

const props = defineProps<{
  current?: string;
}>();

const { tabbarHeight, safeBottom } = getSystemLayout();

const tabs: Tab[] = [
  { key: "index", path: "/pages/index/index", icon: "home" },
  { key: "compare", path: "/pages/compare/compare", icon: "scale" },
  { key: "profile", path: "/pages/profile/profile", icon: "user" },
];

function onTap(tab: Tab) {
  if (tab.key === props.current) return;
  uni.switchTab({ url: tab.path });
}
</script>

<style lang="scss" scoped>
.z-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  box-sizing: border-box;
  background: #ffffff;
  border-top: 1rpx solid #efeff1;
  z-index: 999;
}

.z-tabbar-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
