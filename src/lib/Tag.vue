<template>
  <span
    class="v-tag"
    :class="[
      type,
      {
        '!text-sm': size == 'large',
      },
    ]"
  >
    <slot></slot>
  </span>
</template>

<script lang="ts" setup>
  defineProps<{
    type: 'success' | 'failed' | '';
    size?: 'small' | 'large';
  }>();
</script>

<style lang="less" scoped>
  .v-tag {
    @apply w-fit py-1 px-2 rounded-2 flex-center text-xs font-semibold;
    @apply border-1 border-solid border-accent/50 text-accent bg-accent/10;

    &.success {
      @apply border-green bg-green/10 text-green;
    }

    &.failed {
      @apply border-red bg-red/10 text-red;
    }
  }
</style>

