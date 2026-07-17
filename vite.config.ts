import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),

    // ===== 可选集成（独立可移除，见 README「可选集成」）=====

    // [可选] API 自动导入：vue / vue-router / pinia 的 API 无需手动 import
    // 依赖：unplugin-auto-import；移除：删除本块 + src/auto-imports.d.ts
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),

    // [可选] 组件自动导入 + 图标组件解析
    // 依赖：unplugin-vue-components + unplugin-icons + @iconify/json
    // 移除：删除本块与下方 Icons() + src/components.d.ts
    Components({
      resolvers: [IconsResolver()],
      dts: 'src/components.d.ts',
    }),

    // [可选] 图标按需编译为 Vue 组件（数据源 @iconify/json）
    Icons({
      compiler: 'vue3',
    }),
  ],
})
