<template>
  <div class="flex items-center flex-wrap gap-[0.125rem] group">
    <span
      class="min-w-2 h-4 bg-accent/30 transaction-all rounded-[0.125rem]"
      v-for="n in Number(total)"
      :key="n"
      :class="{
        'flex-1 cursor-default': total < 100,
        'bg-green/50 cursor-pointer': n < current,
        'bg-green animate-pulse cursor-pointer': n == current && current != total,
        '!bg-green/80': n % 10 == 0 && n <= current,
        '!animate-[pulse_0.5s_cubic-bezier(0.4,0,.6,1)_infinite]':
          n == current && current > total * 0.9 && current != total,
      }"
      @click="n <= current && $emit('item-click', n - 1)"
    ></span>
  </div>
</template>

<script lang="ts" setup>
  defineProps(['total', 'current']);
</script>

