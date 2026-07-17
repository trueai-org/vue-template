/**
 * 模板文件分类清单 —— 单一事实来源
 * generate.mjs（生成历史快照）与 sync.mjs（同步官方上游）共用的分类定义。
 * 新增/移除自定义模块、调整官方文件覆盖范围时，只需修改本文件。
 *
 * 分类：
 * - OFFICIAL_MODIFIED：create-vite 产物中被自定义版本覆盖的官方文件
 * - CUSTOM_DIRS / CUSTOM_FILES：官方模板没有、脚本新增的模块（进快照）
 * - CUSTOM_DOCS：自定义但不进快照的文档（快照保留 create-vite 生成的 README）
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

// generate.mjs 复制到快照的接入文件
// = OFFICIAL_MODIFIED 排除 .gitignore（快照沿用 create-vite 生成的 .gitignore）
export const SNAPSHOT_OVERRIDE_FILES = OFFICIAL_MODIFIED.filter(f => f !== '.gitignore')

// 自定义模块目录（sync 不动，generate 复制到快照）
export const CUSTOM_DIRS = [
  'src/router',
  'src/stores',
  'src/api',
  'src/views',
  'scripts',
  '.github',
]

// 自定义模块文件（sync 不动，generate 复制到快照）
export const CUSTOM_FILES = [
  'uno.config.ts',
  '.env',
  '.env.development',
  'src/auto-imports.d.ts', // 集成层生成：vue-tsc 先于 Vite 运行，需预先存在
  'src/components.d.ts', // 同上
]

// 自定义但不进快照：文档类文件，快照保留 create-vite 生成的版本
export const CUSTOM_DOCS = [
  'README.md',
  'AGENTS.md',
]

// 自定义依赖清单（generate.mjs 安装命令的单一事实来源）
// 新增/移除依赖时只需修改此处，generate.mjs 自动生成安装命令
// 分类与 README「自定义依赖清单」表对应：
// - runtime：运行时依赖（pnpm add）
// - devCore：核心开发依赖（pnpm add -D），UnoCSS 引擎 + 图标集 + Reset
// - devLayer：集成层开发依赖（pnpm add -D），可整体移除（见 README「可移除集成层」）
export const CUSTOM_DEPS = {
  runtime: ['pinia@^3', 'vue-router', 'axios'],
  devCore: ['unocss', '@iconify-json/carbon', '@unocss/reset'],
  devLayer: ['unplugin-icons', 'unplugin-auto-import', '@iconify/json', 'unplugin-vue-components'],
}

// 官方依赖键（create-vite 生成的 package.json 中的依赖），sync.mjs 对比用
export const OFFICIAL_DEP_KEYS = {
  dependencies: ['vue'],
  devDependencies: ['@vitejs/plugin-vue', '@vue/tsconfig', 'typescript', 'vite', 'vue-tsc', '@types/node'],
}