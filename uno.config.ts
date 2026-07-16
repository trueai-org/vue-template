import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { createRequire } from 'node:module'

// 显式加载图标集，避免 presetIcons 自动解析在部分环境失效
const require = createRequire(import.meta.url)
const carbon = require('@iconify-json/carbon/icons.json')

// https://unocss.dev/
export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
      collections: {
        carbon: () => carbon,
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  theme: {
    colors: {
      primary: 'var(--c-primary)',
      'primary-fg': 'var(--c-primary-fg)',
    },
  },
  shortcuts: {
    'btn': 'inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded text-sm cursor-pointer transition-opacity select-none',
    'btn-primary': 'btn bg-primary text-primary-fg hover:opacity-90',
    'btn-ghost': 'btn hover:bg-[var(--c-fill)]',
    'card': 'rounded-lg border border-[var(--c-border)] bg-[var(--c-bg)] p-4',
    'input': 'px-3 py-1.5 rounded text-sm border border-[var(--c-border)] bg-transparent outline-none focus:border-primary',
  },
})