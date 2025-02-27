import '@unocss/reset/tailwind.css';
import 'ant-design-vue/dist/reset.css';
import 'uno.css';

import setIcon from '@/components/Icons';
import '@/style.less';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

const app = createApp(App);

setIcon(app);
app.use(router).mount('#app');

