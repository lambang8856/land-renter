<template>
  <div class="flex gap-2 p-2 rounded-3 bg-primary/10 w-fit">
    <div
      class="v-tab-btn-switch-item"
      :class="{ active: value === option.value || value === option }"
      v-for="option in options"
      :key="option"
      @click="emits('update:value', option.value || option)"
    >
      {{ option.label || option }}
    </div>
  </div>
</template>

<script lang="ts" setup>
  defineProps(['value', 'options']);
  const emits = defineEmits(['update:value']);
</script>

<style lang="less" scoepd>
  .v-tab-btn-switch-item {
    @apply cursor-pointer;
    @apply text-center;
    @apply text-sm;
    @apply font-semibold;
    @apply py-2;
    @apply px-4;
    @apply rounded-2;
    @apply bg-primary/10;
    @apply hover:bg-primary/20;
    @apply transition-colors;
    @apply select-none;
    @apply whitespace-nowrap;
    @apply flex-1;
    @apply flex;
    @apply items-center;
    @apply justify-center;

    &.active {
      @apply bg-primary;
      @apply text-white;
    }
  }
</style>

