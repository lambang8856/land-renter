import { defineStore } from 'pinia';

interface AppStore {}

const useAppStore = defineStore('appStore', (): AppStore => {
  return {};
});

export default useAppStore;

