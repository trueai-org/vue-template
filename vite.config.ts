import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// @option:css.unocss
import UnoCSS from 'unocss/vite'
// @end
// @option:css.tailwind
import tailwindcss from '@tailwindcss/vite'
// @end
// @module:layer
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
// @end
// @module:build
import { visualizer } from 'rollup-plugin-visualizer'
import VueDevTools from 'vite-plugin-vue-devtools'
// @end

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // @option:css.unocss
    UnoCSS(),
    // @end
    // @option:css.tailwind
    tailwindcss(),
    // @end

    // @module:layer
    // ===== 集成层（默认安装，独立可移除，见 README「模块清单」）=====

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
    // @end

    // @module:build
    // ===== 构建增强（默认安装，独立可移除，见 README「模块清单」）=====

    // [可选] Vue DevTools：开发期浏览器集成（组件树 / Pinia / Router 检查）
    // 依赖：vite-plugin-vue-devtools；移除：删除本块
    // 仅 dev 模式生效，不进生产产物
    VueDevTools(),

    // [可选] 构建产物体积可视化分析，生成 stats.html
    // 依赖：rollup-plugin-visualizer；移除：删除本块
    // 仅 pnpm analyze 时启用（npm_lifecycle_event 检测），避免每次构建都生成
    process.env.npm_lifecycle_event === 'analyze'
      ? visualizer({
          open: true,
          filename: 'stats.html',
          gzipSize: true,
          brotliSize: true,
        })
      : null,
    // @end
  ].filter(Boolean),
})
