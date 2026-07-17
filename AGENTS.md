# AGENTS.md

AI 辅助维护本仓库时的约束规则。所有规则与 README「原则与规则」一致，此处按可执行性重新组织。

## 项目定位

本仓库是一个自维护的 Vue 脚手架增量层，不替代 `create-vite`，而是在其产物之上用脚本可重现地注入自定义模块。核心闭环：`manifest.mjs`（单一事实来源）-> `generate.mjs`（生成快照）+ `sync.mjs`（同步上游）。

## 文件分类（来自 `scripts/manifest.mjs`，修改时改此处）

| 分类                           | 含义                                                                                               | AI 可否修改                                    |
| ------------------------------ | -------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `OFFICIAL_MODIFIED`            | 官方文件，脚本覆盖接入（main.ts / App.vue / style.css / vite.config.ts / index.html / .gitignore） | **禁止手动编辑**，只通过 generate.mjs 逻辑维护 |
| 官方未修改                     | tsconfig*.json / public/ / src/components/ / src/assets/                                           | **禁止修改**，由 sync.mjs 自动同步             |
| `MODULES`                      | 自定义模块清单（依赖 + 文件 + 脚本 + 层级）                                                        | 可修改，是依赖与文件归属的单一事实来源         |
| `CHOICE_GROUPS`                | 同类框架选择组（互斥，有默认值）                                                                   | 可修改                                         |
| `CUSTOM_DIRS` / `CUSTOM_FILES` | sync.mjs 用的自定义路径全集（从 MODULES 派生）                                                     | **勿直接修改**，由 MODULES 计算                |
| `CUSTOM_DOCS`                  | README.md / AGENTS.md                                                                              | 可修改                                         |

## 模块系统

### 模块层级（tier）

| 层级       | 含义                   | 交互行为                              |
| ---------- | ---------------------- | ------------------------------------- |
| `required` | 必需，移除后模板不成立 | 始终安装，不询问                      |
| `default`  | 默认安装               | 交互中可取消；`--yes` / 非 TTY 时安装 |
| `optional` | 可选，默认不安装       | 交互中可选择；`--all` 时全部安装      |

### 当前模块清单

| 模块      | 层级     | 内容                          |
| --------- | -------- | ----------------------------- |
| `core`    | required | Vue Router + Pinia + 项目骨架 |
| `utils`   | default  | VueUse + Day.js + NProgress   |
| `layer`   | default  | unplugin 自动导入 + 图标组件  |
| `quality` | optional | ESLint + Prettier             |
| `build`   | default  | 产物分析 + Vue DevTools       |
| `test`    | optional | Vitest + Vue Test Utils       |

### 同类框架选择组（CHOICE_GROUPS）

| 选择组 | 选项                     | 默认   |
| ------ | ------------------------ | ------ |
| `css`  | unocss / tailwind / none | unocss |
| `http` | axios / fetch / ky       | axios  |

> got / undici 是 Node.js 端 HTTP 库，不打浏览器包，故不作为 http 选项。

## 核心约束

### 1. 禁止手动编辑官方文件

以下文件由 `generate.mjs` 脚本注入，**不可手动修改**：

- `src/main.ts` / `src/App.vue` / `src/style.css` / `vite.config.ts` / `index.html` / `.gitignore`

这些文件可包含 `@module` / `@option` 标记块（见占位约定），标记块是注释，不破坏工作模板的可构建性。修改这些文件 = 修改 generate.mjs 的覆盖源。

以下文件为官方产物，**不可修改**：tsconfig*.json / public/ / src/components/ / src/assets/

### 2. 依赖管理通过 manifest 驱动

- 新增/移除依赖时，修改 `scripts/manifest.mjs` 的 `MODULES` 或 `CHOICE_GROUPS`，不手动编辑 `package.json`
- `generate.mjs` 从 `MODULES` + `CHOICE_GROUPS` 自动聚合 `pnpm add` 命令
- 工作模板 = 全模块 + 全选择组超集，须安装所有出现在共享文件 import 中的依赖
- 版本锁定原因须在 `MODULES` 注释中说明（如 `pinia@^3` 的兼容性约束）

### 3. 脚本驱动一切变更

- 新增自定义模块 -> 在 `MODULES` 中添加条目（deps / dirs / files / scripts / tier）
- 新增同类框架选择 -> 在 `CHOICE_GROUPS` 中添加条目
- 新增页面 -> 在 `src/views/` 创建 + `src/router/index.ts` 注册路由
- 所有变更须保证 `pnpm generate` 能完整复现

### 4. 官方推荐接入最小化

遵循**最小化、模块化、最新、官方推荐**四原则：

- **最小化**：自定义代码仅做接入（import + 注册），不添加非官方默认配置项。判断标准：官方文档快速开始 / 默认配置中没有的选项，不添加；需要自定义时在注释中说明原因
- **模块化**：每个模块独立可移除（见规则 5），不与其他模块耦合
- **最新**：依赖版本保持最新（除兼容性锁定外），使用官方当前推荐的 API 和配置方式（如 `presetWind3` 而非已弃用的 `presetUno`）
- **官方推荐接入**：所有配置遵循官方文档的推荐做法，不引入个人偏好或非官方默认值（如 `presetIcons({ scale: 1.2 })` 是个人偏好，应使用 `presetIcons()`）

同时遵守不过度封装：无 bootstrap / layout 组件、无 HTTP 响应解包拦截器封装、无 UI 组件库封装。

### 5. 模块独立可移除

每个自定义模块须满足：配置隔离、使用隔离、可追溯（README 标注）、可验证（移除后 `pnpm build` 通过）。

### 6. 占位约定（模块注入机制）

共享文件中的模块代码用标记注释包裹，`generate.mjs` 按选择裁剪：

```
// TS/JS：
// @module:<name>
模块代码...
// @end

// Vue 模板：
<!-- @module:<name> -->
模块代码...
<!-- @end -->

// 同类框架选择组：
// @option:<group>.<option>
选择组代码...
// @end
```

- **选中**：保留内容，移除标记行 -> 干净代码
- **未选中**：移除整块（含标记行）-> 不存在的代码
- 工作模板 = 全标记块保留的超集（始终可构建）
- 整文件差异用变体覆盖：`scripts/variants/<group>.<option>/` 下的文件覆盖默认文件

### 7. 依赖兼容性

- `vue` / `typescript` / `vue-tsc` 等基础包版本由 `create-vite` 决定
- 新增依赖须兼容当前基础包版本，不盲目使用最新版
- 版本冲突时在 `MODULES` 中锁定并注释原因

## 禁止操作清单

| 操作                                           | 原因                                        |
| ---------------------------------------------- | ------------------------------------------- |
| 手动编辑 `OFFICIAL_MODIFIED` 中的文件          | 破坏可重现性                                |
| 手动编辑 `package.json` 的依赖版本             | 依赖须通过 `MODULES` / `CHOICE_GROUPS` 管理 |
| 手动修改 `tsconfig*.json` 等官方文件           | 由 `sync.mjs` 自动同步                      |
| 添加 bootstrap / HTTP 拦截器封装 / UI 组件封装 | 违反不过度封装                              |
| 删除 `releases/` 目录下的历史快照              | 不可逆操作，须用户手动确认                  |
| 使用 `npm` / `yarn` 代替 `pnpm`                | 项目锁定 pnpm                               |
| 手动修改 `CUSTOM_DIRS` / `CUSTOM_FILES`        | 由 `MODULES` 派生，改 `MODULES` 即可        |

## 变更检查清单

1. `pnpm build` 通过（类型检查 + 生产构建）
2. 如果修改了 `manifest.mjs`，确认 `generate.mjs` 和 `sync.mjs` 的引用一致
3. 如果新增了依赖，确认 `MODULES` / `CHOICE_GROUPS` 已更新且 `package.json` 与之一致
4. 如果新增了文件/目录，确认 `MODULES` 的 `files` / `dirs` 已更新
5. 如果修改了官方接入文件，确认变更是通过标记块/变体而非破坏文件结构
6. 如果新增了模块，确认共享文件中已用 `@module` 标记块包裹接入代码

## 常用命令

| 命令                                           | 用途                                |
| ---------------------------------------------- | ----------------------------------- |
| `pnpm dev`                                     | 开发服务器                          |
| `pnpm build`                                   | 类型检查 + 生产构建                 |
| `pnpm typecheck`                               | 仅类型检查（不构建）                |
| `pnpm test`                                    | 运行单元测试                        |
| `pnpm lint`                                    | ESLint 检查并自动修复               |
| `pnpm format`                                  | Prettier 格式化                     |
| `pnpm analyze`                                 | 构建产物体积分析（生成 stats.html） |
| `pnpm generate`                                | 交互式生成历史快照                  |
| `pnpm generate -- --all`                       | 非交互：安装全部模块                |
| `pnpm generate -- --minimal`                   | 非交互：仅必需模块                  |
| `pnpm generate -- --yes`                       | 非交互：必需+默认模块               |
| `pnpm generate -- --css=tailwind --http=fetch` | 指定同类框架选择                    |
| `pnpm clean`                                   | 清理 releases/ 下的历史快照         |
| `pnpm sync`                                    | 预览官方模板差异                    |
| `pnpm sync -- --apply`                         | 实际同步官方变更                    |
| `pnpm update-latest`                           | 更新所有依赖到最新                  |
