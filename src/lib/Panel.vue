<template>
  <div class="v-panel">
    <slot name="title">
      <div
        class="flex flex-col sm:flex-row gap-4 justify-between pb-4"
        :class="{
          'border-b-1 border-b-solid border-b-accent/20': !borderless,
        }"
        v-if="title"
      >
        <span class="text-6 font-bold">
          {{ title }}
          <slot name="after-title"></slot>
        </span>

        <slot name="title-op"></slot>
      </div>
    </slot>

    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
  defineProps(['title', 'borderless']);
</script>

<style lang="less" scoped>
  .v-panel {
    @apply rounded-4 bg-primary/10 p-4 sm:p-6 border-1 border-solid border-accent/20;
    @apply flex-col gap-5;
  }
</style>

