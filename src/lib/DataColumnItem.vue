<template>
  <div
    class="flex-row items-center gap-1 justify-between text-sm sm:text-base hover:bg-primary/10 transition-all py-1 sm:p-2 rounded-2"
  >
    <slot name="title">
      <span class="font-semibold text-text/60">{{ title }}</span>
    </slot>
    <slot name="value">
      <span class="break-all" :class="valueClass">{{ value }}</span>
    </slot>
  </div>
</template>

<script lang="ts" setup>
  defineProps(['title', 'value', 'valueClass']);
</script>

