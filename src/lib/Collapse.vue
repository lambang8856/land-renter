<template>
  <div class="flex-col gap-4">
    <slot name="header"></slot>
    <div
      class="max-h-0 transition-all duration-500 delay-0 ease-in-out overflow-hidden"
      :class="[
        defaultClass,
        {
          '!max-h-400': active,
        },
      ]"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
  defineProps(['active', 'defaultClass']);
</script>

