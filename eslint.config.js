import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import globals from 'globals'

// https://eslint.org/docs/latest/use/configure/configuration-files
// https://typescript-eslint.io/getting-started
// https://eslint.vuejs.org/
export default [
  // 忽略目录
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'releases/**',
      'auto-imports.d.ts',
      'components.d.ts',
    ],
  },

  // JS 基础规则
  js.configs.recommended,

  // TypeScript 规则（类型感知）
  ...tseslint.configs.recommended,

  // Vue 规则（SFC 解析 + Vue 专属规则）
  ...pluginVue.configs['flat/recommended'],

  // Node.js 环境：scripts/*.mjs / 配置文件
  {
    files: ['**/*.mjs', 'eslint.config.js', 'commitlint.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },

  // 浏览器环境：src/ 下的 .ts / .vue
  {
    files: ['src/**/*.{ts,vue}'],
    languageOptions: {
      globals: globals.browser,
    },
  },

  // 项目定制：Vue SFC 中使用 TypeScript
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },

  // 规则覆盖
  {
    rules: {
      // Vue：允许单词组件名（如 HomeView）
      'vue/multi-word-component-names': 'off',
      // TS：未使用变量报错但允许下划线前缀豁免
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // TS：允许 any（脚手架阶段不强制 no-explicit-any）
      '@typescript-eslint/no-explicit-any': 'off',
      // TS 已处理未定义变量检查，no-undef 对 .ts/.vue 冗余
      'no-undef': 'off',
    },
  },
]
