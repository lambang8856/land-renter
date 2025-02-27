<template>
  <div
    class="flex items-center gap-2 cursor-pointer hover:text-accent transition-all"
    :class="{
      'text-accent': active,
    }"
    @click="audio.play"
  >
    <div class="w-4 h-4 rounded-full bg-primary/10 flex-center flex-shrink-0">
      <div
        class="w-3 h-3 rounded-full bg-secondary/50 transition-all"
        :class="{
          '!bg-accent': active,
        }"
      ></div>
    </div>
    <span>{{ label }}</span>
  </div>
</template>

<script lang="ts" setup>
  import RadioButtonSound from '@/assets/sounds/RadioButton.mp3';
  const audio = new Audio(RadioButtonSound);

  defineProps(['label', 'value', 'active']);
</script>

