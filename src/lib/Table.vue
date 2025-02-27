<template>
  <div class="overflow-auto rounded-3 shadow-lg">
    <table>
      <thead>
        <tr>
          <th
            v-for="(col, index) in columns"
            :key="index"
            :style="{
              minWidth: col.minWidth ? col.minWidth : 'fit-content',
              maxWidth: col.maxWidth ? col.maxWidth : 'fit-content',
              width: col.width ? col.width : 'auto',
              position: col.sticky ? 'sticky' : 'relative',
            }"
          >
            <span class="flex gap-2 w-full justify-center items-center">
              {{ col.label }}
              <Popover v-if="col.labelInfo" placement="right">
                <template #content>
                  <span v-html="col.labelInfo" v-if="typeof col.labelInfo == 'string'"></span>
                  <component
                    :is="col.labelInfo"
                    v-if="typeof col.labelInfo == 'object'"
                  ></component>
                </template>
                <font-awesome-icon
                  icon="fa-regular fa-question-circle"
                  class="cursor-default"
                ></font-awesome-icon>
              </Popover>
              <div
                class="flex-col span gap-[2px] cursor-pointer"
                v-if="col.sortable"
                @click="sortBy(col.field)"
              >
                <span
                  class="w-0 border-5 border-solid border-transparent border-b-primary/30"
                  :class="{
                    'border-b-primary/80': order[col.field] == 'desc',
                  }"
                ></span>
                <span
                  class="w-0 border-5 border-solid border-transparent border-t-primary/30"
                  :class="{
                    'border-t-primary/80': order[col.field] == 'asc',
                  }"
                ></span>
              </div>
            </span>
          </th>
        </tr>
      </thead>
      <tbody class="hidden lg:table-row-group">
        <tr
          ref="row"
          :class="{
            'cursor-pointer': !!rowClick,
          }"
          v-for="(data, index) in tableData"
          :key="index"
          @click="() => rowClick?.(data)"
        >
          <td
            :style="{
              minWidth: col.minWidth ? col.minWidth : 'fit-content',
              width: col.width ? col.width : 'auto',
            }"
            v-for="(col, index) in columns"
            :key="index"
          >
            <slot
              :name="col?.field"
              :index="index"
              :col="col"
              :record="data"
              :value="toRaw(data?.[col.field])"
            >
              {{ data?.[col.field] }}
            </slot>
          </td>
        </tr>
      </tbody>
      <tbody class="table-row-group lg:hidden">
        <tr v-for="(data, index) in tableData" :key="index" @click="() => rowClick?.(data)">
          <td>
            <slot name="mobile-td" :index="index" :record="data"></slot>
          </td>
        </tr>
      </tbody>
    </table>

    <Spiner class="mx-auto my-10" v-if="loading"></Spiner>

    <div
      class="flex gap-2 justify-center my-4 flex-wrap px-4"
      v-if="pagination?.size && pagination?.total"
    >
      <span
        class="pagination-item"
        :class="{
          active: page == n,
        }"
        v-for="n in totalPage"
        :key="n"
        @click="$emit('update:page', n)"
        v-if="totalPage < 7"
      >
        {{ n }}
      </span>

      <template v-else>
        <span
          class="pagination-item"
          :class="{
            active: page == 1,
          }"
          @click="$emit('update:page', 1)"
        >
          1
        </span>
        <span
          class="pagination-item"
          :class="{
            active: page == n,
          }"
          v-for="n in [2, 3, 4, 5]"
          :key="n"
          @click="$emit('update:page', n)"
          v-if="page <= 4"
        >
          {{ n }}
        </span>

        <span class="min-w-8 aspect-1 flex-center" v-if="page > 4 && page <= totalPage - 4">
          ...
        </span>
        <span
          class="pagination-item"
          :class="{
            active: page == n,
          }"
          v-for="n in [page - 1, page, page + 1]"
          :key="n"
          @click="$emit('update:page', n)"
          v-if="page > 4 && page <= totalPage - 4"
        >
          {{ n }}
        </span>

        <span class="min-w-8 aspect-1 flex-center">...</span>

        <span
          class="pagination-item"
          :class="{
            active: page == n,
          }"
          v-for="n in [totalPage - 4, totalPage - 3, totalPage - 2, totalPage - 1]"
          :key="n"
          @click="$emit('update:page', n)"
          v-if="page > totalPage - 4"
        >
          {{ n }}
        </span>

        <span
          class="pagination-item"
          :class="{
            active: page == totalPage,
          }"
          @click="$emit('update:page', totalPage)"
        >
          {{ totalPage }}
        </span>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Popover } from 'ant-design-vue';
  import { toRaw } from 'vue';
  const props = defineProps(['datas', 'columns', 'rowClick', 'page', 'pagination', 'loading']);

  const tableData = ref<any[]>(props.datas);
  const totalPage = computed(() => {
    if (!props.pagination?.size || !props.pagination?.total) return 1;
    return Math.ceil(props.pagination?.total / props.pagination?.size);
  });

  const order = ref<any>({});

  const dataBeforeSort = ref<any[]>([...(tableData.value || [])]);

  const row = ref();

  const sortBy = (field: string) => {
    if (order.value[field] == undefined) {
      dataBeforeSort.value = [...tableData.value];
      order.value = {};
    }

    switch (order.value[field]) {
      case undefined:
        order.value[field] = 'asc';
        break;
      case 'asc':
        order.value[field] = 'desc';
        break;
      case 'desc':
        order.value[field] = undefined;
        break;
    }

    if (order.value[field] == undefined) {
      tableData.value = [...dataBeforeSort.value];
      return;
    }

    tableData.value = tableData.value.sort((a, b) => {
      if (order.value[field] == 'desc') {
        return a[field] < b[field] ? -1 : 1;
      }
      if (order.value[field] == 'asc') {
        return a[field] > b[field] ? -1 : 1;
      }
      return 0;
    });
  };

  watch(
    () => props.datas,
    (newVal) => {
      tableData.value = newVal;
    },
  );

  const scrollToRow = (index: number) => {
    row.value?.[index]?.scrollIntoView({ behavior: 'smooth' });
  };

  defineExpose({
    scrollToRow,
  });
</script>

<style lang="less" scoped>
  table {
    @apply w-full text-text;
    table-layout: fixed;

    thead {
      @apply hidden lg:table-header-group;
      @apply bg-primary/30 border-b-primary/20 border-b-1 border-b-solid;
    }

    th {
      @apply py-3 uppercase font-semibold;
      @apply px-2 text-accent;
    }

    tr {
      @apply hover:bg-primary/10 even:bg-primary/5 transition-all;
    }

    td {
      @apply text-center py-5 px-2;
    }
  }

  .pagination-item {
    @apply min-w-8 aspect-1 flex-center border-1 border-solid border-accent/40 rounded-2 cursor-pointer hover:bg-accent/10 transition-all;

    &.active {
      @apply bg-accent/10;
    }
  }
</style>

