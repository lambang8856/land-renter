<template>
  <div
    class="flex-col items-center gap-1 group"
    :class="{
      'flex-row-reverse gap-4': line,
    }"
  >
    <span
      class="text-xs font-semibold flex-shrink-0 w-fit text-accent"
      :class="{
        'text-accent': percent > 0,
        'text-green': percent == 100,
        '!text-base': size == 'large',
      }"
    >
      {{ percent || 0 }} %
    </span>
    <div
      class="w-full bg-secondary/40 group-hover:bg-secondary transition-all duration-500 h-1 rounded-1"
      :class="{
        '!h-2': size == 'large',
      }"
    >
      <div
        class="bg-accent h-1 rounded-1 transition-all"
        :class="{
          '!h-2': size == 'large',
          '!bg-green': percent == 100,
        }"
        :style="{
          width: `${percent || 0}%`,
        }"
      ></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  defineProps(['percent', 'size', 'line']);
</script>

