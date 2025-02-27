<template>
  <div
    class="v-input"
    :class="{
      disabled,
    }"
  >
    <!-- suffix -->
    <div class="prefix" v-if="prefix">
      <slot name="prefix"></slot>
    </div>
    <input
      v-bind="$attrs"
      :disabled="disabled"
      :type="type"
      :step="type == 'number' ? new BigNumber(1).shiftedBy(-1 * precision).toString() : undefined"
      v-model="currentValue"
      @input="inputHanlder"
      @blur="blurHandler"
    />
    <!-- suffix -->
    <div class="suffix" v-if="suffix">
      <slot name="suffix">
        {{ suffix }}
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import BigNumber from 'bignumber.js';
  BigNumber.config({ EXPONENTIAL_AT: 1e9 });

  const props = defineProps([
    'modelValue',
    'prefix',
    'suffix',
    'precision',
    'type',
    'min',
    'max',
    'disabled',
    'uppercase',
    'lowercase',
  ]);
  const emits = defineEmits(['update:modelValue']);
  const currentValue = ref('');

  const inputHanlder = (evt: any) => {
    let value = evt.target.value;

    if (props.uppercase) {
      value = value.toUpperCase();
    } else if (props.lowercase) {
      value = value.toLowerCase();
    }

    if (value != currentValue.value) {
      currentValue.value = value?.toString();
    }

    emits('update:modelValue', value);
  };

  const blurHandler = (evt: any) => {
    let value = evt.target.value;

    if (props.type == 'number') {
      if (!value || isNaN(value)) {
        value = '';
      } else if (!isNaN(props.precision)) {
        value = new BigNumber(new BigNumber(value).shiftedBy(props.precision).toFixed(0))
          .shiftedBy(-props.precision)
          .toString();
      }
    }

    if (props.min && BigNumber(value).isLessThan(props.min)) {
      value = new BigNumber(props.min).toString();
    }

    if (props.max && BigNumber(value).isGreaterThan(props.max)) {
      value = new BigNumber(props.max).toString();
    }
    currentValue.value = value;
    emits('update:modelValue', value);
  };

  watch(
    () => props.modelValue,
    () => {
      currentValue.value = props.modelValue;
    },
    {
      immediate: true,
    },
  );
</script>

<style lang="less" scoped>
  .v-input {
    @apply rounded-3 transition-all flex items-center overflow-hidden;
    @apply bg-accent/10 border-transparent border-2 p-2 px-3;

    &:focus-within {
      @apply border-accent;
    }

    &.disabled > * {
      @apply !cursor-not-allowed pointer-event-none;
      filter: contrast(0);
    }
  }

  input {
    @apply bg-transparent w-full;
  }

  .prefix,
  .suffix {
    @apply h-full px-1 flex-shrink-0;
  }

  .suffix {
    @apply ml-auto;
  }

  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type='number'] {
    -moz-appearance: textfield;
  }
</style>

