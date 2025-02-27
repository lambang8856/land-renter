import {
  defineConfig,
  presetAttributify,
  presetUno,
  presetWind,
  transformerDirectives,
} from 'unocss';

export default defineConfig({
  presets: [presetUno(), presetAttributify(), presetWind()],
  transformers: [transformerDirectives()],
  shortcuts: [
    ['wh-full', 'w-full h-full'],
    ['flex-center', 'flex justify-center items-center'],
    ['flex-col', 'flex flex-col'],
    ['flex-row', 'flex flex-row'],
    ['flex-col-center', 'flex flex-col justify-center items-center'],
    ['text-ellipsis', 'truncate'],
    ['text-standard', 'text-sm md:text-base'],
    ['text-standard-small', 'text-xs md:text-sm'],
    ['text-standard-big', 'text-base md:text-5'],
  ],
  rules: [],
  theme: {
    colors: {
      text: '#1f0304',
      background: '#fef4f4',
      primary: '#e81c18',
      secondary: '#f3cd88',
      accent: '#eecb54',
    },
  },
});

