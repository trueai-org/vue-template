/**
 * 模板文件与模块清单 —— 单一事实来源
 * generate.mjs（生成历史快照）与 sync.mjs（同步官方上游）共用的分类定义。
 * 新增/移除自定义模块、调整官方文件覆盖范围时，只需修改本文件。
 *
 * 结构：
 * - OFFICIAL_MODIFIED：create-vite 产物中被自定义版本覆盖的官方文件
 * - MODULES：自定义模块清单（依赖 + 文件 + 脚本 + 安装层级），generate.mjs 据此按需安装
 * - CHOICE_GROUPS：同类框架选择组（每组互斥，只选一个，有默认值）
 * - CUSTOM_DIRS / CUSTOM_FILES / CUSTOM_DOCS：sync.mjs 用的自定义路径全集（从 MODULES 派生）
 *
 * 模块层级（tier）：
 * - required：必需，始终安装，不询问（核心闭环，移除后模板不成立）
 * - default：默认安装，交互中可取消；--yes / 非 TTY 时安装
 * - optional：可选，默认不安装，交互中可选择；仅 --all 或显式选择时安装
 *
 * 占位与裁剪约定（模块注入机制）：
 * - 整文件模块：文件归属模块（MODULES.*.files/dirs），未选中则不复制
 * - 共享文件中的模块代码块：用标记注释包裹，generate.mjs 按选择裁剪，标记行本身也会被移除：
 *     TS/JS：  // @module:<name>  ...  // @end
 *     Vue 模板：<!-- @module:<name> --> ... <!-- @end -->
 * - 同类框架选择组：共享文件中用 @option:<group>.<option> 标记块；
 *   整文件差异用变体覆盖（scripts/variants/<group>.<option>/ 下的文件覆盖默认文件）
 * - 工作模板 = 全模块 + 默认选择组的超集，始终可构建；快照 = 按选择裁剪后的干净项目
 */

// 官方文件（脚本修改）
// sync.mjs：上游有变更时提示人工审查，不自动覆盖
// generate.mjs：除 .gitignore 外复制到快照（见 SNAPSHOT_OVERRIDE_FILES）
export const OFFICIAL_MODIFIED = [
  'src/main.ts',
  'src/App.vue',
  'src/style.css',
  'vite.config.ts',
  'index.html',
  '.gitignore', // 脚本追加 /releases
]

// generate.mjs 复制到快照的接入文件（复制时按选择裁剪 @module/@option 标记块）
// = OFFICIAL_MODIFIED 排除 .gitignore（快照沿用 create-vite 生成的 .gitignore）
export const SNAPSHOT_OVERRIDE_FILES = OFFICIAL_MODIFIED.filter((f) => f !== '.gitignore')

/**
 * 同类框架选择组（互斥，每组只选一个，交互式菜单呈现）
 * 每个选择组：
 * - label：中文名（交互菜单标题）
 * - default：默认选项 key（回车 / --yes / --all / --minimal / 非 TTY 时使用）
 * - options.<key>：
 *   - label：选项说明
 *   - deps.runtime / deps.dev：该选项的依赖
 *   - files：仅选中时复制的文件
 *   - variants：scripts/variants/<name>/ 目录名，选中时用其下文件覆盖默认文件
 *
 * 注意：got / undici 是 Node.js 端 HTTP 库，不打浏览器包，故 http 组不提供；
 * postcss 是 Tailwind/UnoCSS 的底层工具而非同级框架，不作为独立选项。
 */
export const CHOICE_GROUPS = {
  css: {
    label: 'CSS 方案',
    default: 'unocss',
    options: {
      unocss: {
        label: 'UnoCSS 原子化引擎（按需生成，默认）',
        deps: {
          dev: [
            'unocss',
            '@iconify-json/carbon', // presetIcons 图标类数据源（i-carbon-*）
            '@unocss/reset',
          ],
        },
        files: ['uno.config.ts'],
      },
      tailwind: {
        label: 'Tailwind CSS v4（@tailwindcss/vite，CSS-first 配置）',
        deps: { dev: ['tailwindcss', '@tailwindcss/vite'] },
        variants: ['css.tailwind'], // 覆盖 src/style.css 为 @import "tailwindcss"
      },
      none: {
        label: '不安装 CSS 框架（保留清空的 style.css）',
      },
    },
  },
  http: {
    label: 'HTTP 客户端',
    default: 'axios',
    options: {
      axios: {
        label: 'axios（实例 + 拦截器，生态成熟，默认）',
        deps: { runtime: ['axios'] },
      },
      fetch: {
        label: '原生 fetch（零依赖，薄封装统一 baseURL）',
        variants: ['http.fetch'], // 覆盖 src/api/request.ts
      },
      ky: {
        label: 'ky（基于 fetch 的轻量封装，prefixUrl/timeout）',
        deps: { runtime: ['ky'] },
        variants: ['http.ky'], // 覆盖 src/api/request.ts
      },
    },
  },
}

/**
 * 自定义模块清单（generate.mjs 安装与复制的单一事实来源）
 * 每个模块：
 * - label：中文名（交互提示 + 日志 + README 表格用）
 * - tier：required / default / optional
 * - deps.runtime：运行时依赖（pnpm add），进生产产物
 * - deps.dev：开发依赖（pnpm add -D）
 * - dirs / files：模块专属文件（仅选中该模块时复制到快照）
 * - scripts：注入快照 package.json 的 npm scripts（仅选中该模块时注入）
 * - requires：依赖的其他模块 key（选中时自动补齐）
 */
export const MODULES = {
  core: {
    label: '核心模块（Vue Router + Pinia + 项目骨架）',
    tier: 'required',
    deps: {
      runtime: [
        'pinia@^3', // 锁定主版本 3：pinia 4.x 需 typescript 7，当前 ts ~6.0.2 不兼容
        'vue-router',
      ],
    },
    dirs: ['src/router', 'src/stores', 'src/api'],
    files: ['.env', '.env.development', 'src/views/HomeView.vue', 'src/views/AboutView.vue'],
    scripts: {
      typecheck: 'vue-tsc -b --noEmit',
    },
  },

  utils: {
    label: '运行时工具（VueUse + Day.js + NProgress）',
    tier: 'default',
    deps: {
      runtime: [
        '@vueuse/core', // Vue 组合式工具集（useDark / useStorage / useEventListener 等）
        'dayjs', // 轻量日期处理（替代 moment.js，2KB vs 67KB）
        'nprogress', // 页面加载进度条（路由切换 / 请求等待）
      ],
      dev: ['@types/nprogress'],
    },
    files: ['src/views/UtilsView.vue'],
  },

  layer: {
    label: '集成层（unplugin 自动导入 + 图标组件）',
    tier: 'default',
    deps: {
      dev: [
        'unplugin-auto-import', // API 自动导入（vue / vue-router / pinia）
        'unplugin-vue-components', // 组件自动导入 + 图标组件解析
        'unplugin-icons', // 图标按需编译为 Vue 组件
        '@iconify/json', // unplugin-icons 全量图标数据源
      ],
    },
    files: [],
  },

  quality: {
    label: '代码质量（ESLint + Prettier）',
    tier: 'optional',
    deps: {
      dev: [
        'eslint', // 代码规范检查（flat config，ESLint 9+）
        '@eslint/js', // eslint.config.js 直接 import，pnpm 严格模式需显式声明
        'globals', // eslint.config.js 中提供 Node / 浏览器全局变量定义
        'eslint-plugin-vue', // Vue SFC 规则（.vue 文件解析 + Vue 专属规则）
        'typescript-eslint', // TypeScript 解析器 + 规则（封装了 @typescript-eslint/*）
        'prettier', // 代码格式化（与 ESLint 分工：格式归 Prettier，逻辑归 ESLint）
      ],
    },
    files: [
      'eslint.config.js',
      '.prettierrc.json',
      '.prettierignore',
      '.vscode/extensions.json', // 编辑器推荐扩展
      '.vscode/settings.json', // 编辑器配置（保存时格式化等）
    ],
    scripts: {
      lint: 'eslint . --fix',
      format: 'prettier --write .',
    },
  },

  build: {
    label: '构建增强（产物分析 + Vue DevTools）',
    tier: 'optional',
    deps: {
      dev: [
        'rollup-plugin-visualizer', // 构建产物体积可视化分析（pnpm analyze 生成 stats.html）
        'vite-plugin-vue-devtools', // Vue DevTools 浏览器集成（开发期组件树 / 状态 / 路由检查）
      ],
    },
    scripts: {
      analyze: 'vite build', // pnpm 运行时设置 npm_lifecycle_event=analyze，vite.config 据此启用 visualizer
    },
  },

  test: {
    label: '单元测试（Vitest + Vue Test Utils）',
    tier: 'optional',
    deps: {
      dev: [
        'vitest', // Vite 原生单元测试框架（与 vite 配置/转换管线一致）
        '@vue/test-utils', // Vue 组件挂载与断言工具
        'jsdom', // 浏览器 DOM 模拟环境（组件渲染测试用）
      ],
    },
    dirs: ['src/__tests__'],
    files: ['vitest.config.ts'],
    scripts: {
      test: 'vitest run',
      'test:watch': 'vitest',
    },
  },
}

// ===== 以下为派生导出（sync.mjs 兼容层，勿直接修改，由 MODULES / CHOICE_GROUPS 计算）=====

const ALL_OPTION_FILES = Object.values(CHOICE_GROUPS).flatMap((g) =>
  Object.values(g.options).flatMap((o) => o.files ?? []),
)

// 自定义模块目录全集（sync 不动，generate 按模块选择复制）
// 注意：src/views 整体视为自定义（其下文件按模块归属，见 MODULES.*.files）
export const CUSTOM_DIRS = [
  ...new Set([
    ...Object.values(MODULES).flatMap((m) => m.dirs ?? []),
    'src/views', // 视图目录整体自定义，文件级归属见各模块 files
    'scripts', // 脚手架工具（sync 不动，不复制到快照）
    '.github', // CI 工作流（sync 不动，不复制到快照）
  ]),
]

// 自定义模块文件全集（sync 不动，generate 按模块选择复制）
export const CUSTOM_FILES = [
  ...new Set([...Object.values(MODULES).flatMap((m) => m.files ?? []), ...ALL_OPTION_FILES]),
]

// 自定义但不进快照：文档类文件，快照保留 create-vite 生成的版本
export const CUSTOM_DOCS = ['README.md', 'AGENTS.md']

// 官方依赖键（create-vite 生成的 package.json 中的依赖），sync.mjs 对比用
export const OFFICIAL_DEP_KEYS = {
  dependencies: ['vue'],
  devDependencies: [
    '@vitejs/plugin-vue',
    '@vue/tsconfig',
    'typescript',
    'vite',
    'vue-tsc',
    '@types/node',
  ],
}
