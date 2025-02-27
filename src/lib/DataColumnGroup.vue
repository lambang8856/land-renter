<template>
  <div
    class="flex-col w-full gap-1 sm:gap-2"
    :class="{
      '!gap-0': narrow,
    }"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
  withDefaults(
    defineProps<{
      narrow?: boolean;
    }>(),
    { narrow: false },
  );
</script>

