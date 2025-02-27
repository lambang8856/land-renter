<template>
  <div class="flex items-center gap-4 flex-wrap">
    <div class="flex flex-wrap gap-2 items-center" v-for="(option, index) in options" :key="index">
      <RadioBox
        :active="option.value === value"
        :label="option.label"
        :value="option.value"
        @click="$emit('update:value', option.value)"
      ></RadioBox>
      <Popover v-if="option.info" placement="right">
        <template #content>
          {{ option.info }}
        </template>
        <font-awesome-icon
          icon="fa-regular fa-question-circle"
          class="cursor-default"
        ></font-awesome-icon>
      </Popover>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Popover } from 'ant-design-vue';
  defineProps(['options', 'value']);
</script>

