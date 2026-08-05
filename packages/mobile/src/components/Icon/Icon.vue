<template>
  <image
    class="z-icon"
    :style="{ width: size + 'rpx', height: size + 'rpx' }"
    :src="dataUri"
    mode="aspectFit"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { iconMap } from "./iconMap";

const props = withDefaults(
  defineProps<{
    name: string;
    size?: number;
    color?: string;
  }>(),
  {
    size: 40,
    color: "#6b6b73",
  }
);

const dataUri = computed(() => {
  const icon = iconMap[props.name];
  if (!icon) return "";

  const c = props.color;
  let svg: string;

  const paths = icon.paths.join('');
  if (icon.filled) {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${c}" stroke="none">${paths}</svg>`;
  } else {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  }

  return "data:image/svg+xml," + encodeURIComponent(svg);
});
</script>

<style>
.z-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  /* 对应设计稿 --radius-md: 12px，SVG 透明底，圆角裁剪 */
  border-radius: 12px;
  overflow: hidden;
}
</style>
