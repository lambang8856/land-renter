<template>
  <div
    class="v-btn"
    :disabled="loading || disabled"
    :class="{
      loading,
      frame,
      disabled,
    }"
    @click.stop="clickHandler"
  >
    <font-awesome-icon
      icon="fa-solid fa-spinner"
      class="animate-spin"
      v-if="loading"
    ></font-awesome-icon>
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
  import ButtonSound from '@/assets/sounds/Button.mp3';
  const audio = new Audio(ButtonSound);
  audio.volume = 0.1;

  const props = defineProps({
    disabled: Boolean,
    loading: Boolean,
    frame: Boolean,
    silence: Boolean,
  });
  const emits = defineEmits(['click']);

  const clickHandler = () => {
    if (props.disabled || props.loading) return;
    if (!props.silence) audio.play();
    emits('click');
  };
</script>

<style lang="less" scoped>
  .v-btn {
    @apply flex items-center justify-center gap-4;
    @apply w-fit text-black cursor-pointer;
    @apply p-4 py-2 transition-all;
    @apply bg-white rounded-2 select-none;
    font-size: initial;

    box-shadow: 4px 4px 0 0 var(--primary);

    &.frame {
      box-shadow: 4px 4px 0 0 var(--secondary);

      &:hover {
        @apply bg-secondary text-white;
        box-shadow: 0 0;
      }
    }

    &:hover {
      @apply lg:bg-primary lg:text-white lg:shadow-none;
    }

    &:active {
      box-shadow: 0 0;
      transform: translate(4px, 4px);
    }

    &.loading,
    &.disabled {
      @apply cursor-not-allowed;
      box-shadow: 0 0;
      filter: contrast(0.5);
    }
  }
</style>

