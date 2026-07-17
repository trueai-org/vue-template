# AGENTS.md

AI 辅助维护本仓库时的约束规则。所有规则与 README「原则与规则」一致，此处按可执行性重新组织。

## 项目定位

本仓库是一个自维护的 Vue 脚手架增量层，不替代 `create-vite`，而是在其产物之上用脚本可重现地注入自定义模块。核心闭环：`manifest.mjs`（单一事实来源）→ `generate.mjs`（生成快照）+ `sync.mjs`（同步上游）。

## 文件分类（来自 `scripts/manifest.mjs`，修改文件分类时改此处）

| 分类 | 含义 | AI 可否修改 |
|------|------|------------|
| `OFFICIAL_MODIFIED` | 官方文件，脚本覆盖接入（main.ts / App.vue / style.css / vite.config.ts / index.html / .gitignore） | **禁止手动编辑**，只通过 generate.mjs 逻辑维护 |
| 官方未修改 | tsconfig*.json / public/ / src/components/ / src/assets/ | **禁止修改**，由 sync.mjs 自动同步 |
| `CUSTOM_DIRS` | 脚本新增目录（router / stores / api / views / scripts / .github） | 可修改，但须保持模块独立性 |
| `CUSTOM_FILES` | 脚本新增文件（uno.config.ts / .env* / *.d.ts） | 可修改 |
| `CUSTOM_DOCS` | README.md / AGENTS.md | 可修改 |
| `CUSTOM_DEPS` | 依赖清单（runtime / devCore / devLayer） | 新增/移除依赖时修改此处，generate.mjs 自动适配 |

## 核心约束

### 1. 禁止手动编辑官方文件

以下文件由 `generate.mjs` 脚本注入，**不可手动修改**：

- `src/main.ts` — 接入 router / pinia / uno.css
- `src/App.vue` — 路由出口
- `src/style.css` — 已清空，由 `@unocss/reset` 替代
- `vite.config.ts` — UnoCSS + 集成层插件
- `index.html` — 仅改 title
- `.gitignore` — 仅追加 `/releases`

以下文件为官方产物，**不可修改**：

- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json`
- `public/` 目录
- `src/components/HelloWorld.vue`
- `src/assets/` 目录

如需修改官方文件的内容，更新 `generate.mjs` 中的覆盖逻辑，而非直接编辑文件。

### 2. 依赖管理通过 manifest 驱动

- 新增/移除依赖时，修改 `scripts/manifest.mjs` 的 `CUSTOM_DEPS`，不手动编辑 `package.json`
- `generate.mjs` 从 `CUSTOM_DEPS` 自动生成 `pnpm add` 命令
- 依赖分三类：`runtime`（运行时）、`devCore`（核心开发）、`devLayer`（集成层，可整体移除）
- 版本锁定原因须在 `CUSTOM_DEPS` 注释中说明（如 `pinia@^3` 的兼容性约束）

### 3. 脚本驱动一切变更

- 新增自定义模块 → 同步更新 `manifest.mjs`（`CUSTOM_DIRS` / `CUSTOM_FILES`）+ `generate.mjs` 复制逻辑
- 新增依赖 → 修改 `manifest.mjs` 的 `CUSTOM_DEPS`
- 新增页面 → 在 `src/views/` 创建 + `src/router/index.ts` 注册路由
- 所有变更须保证 `pnpm generate` 能完整复现

### 4. 不过度封装

- 无 bootstrap / layout 组件
- 无 HTTP 响应解包拦截器封装（`src/api/request.ts` 只创建实例，不封装业务逻辑）
- 无 UI 组件库封装
- 自定义代码保持最小化，仅做接入

### 5. 模块独立可移除

每个自定义模块须满足：

- **配置隔离**：模块配置不与其他模块耦合
- **使用隔离**：移除模块后不影响其他模块编译
- **可追溯**：在 README「自定义依赖清单」表中标注配置位置、使用位置、移除步骤
- **可验证**：移除后 `pnpm build` 仍通过

集成层（`devLayer`）作为整体可移除，移除步骤见 README「可移除集成层 → 六、移除」。

### 6. 依赖兼容性

- `vue` / `typescript` / `vue-tsc` 等基础包版本由 `create-vite` 决定
- 新增依赖须兼容当前基础包版本，不盲目使用最新版
- 版本冲突时在 `CUSTOM_DEPS` 中锁定并注释原因

## 禁止操作清单

| 操作 | 原因 |
|------|------|
| 手动编辑 `OFFICIAL_MODIFIED` 中的文件 | 破坏可重现性（规则 1-2） |
| 手动编辑 `package.json` 的依赖版本 | 依赖须通过 `pnpm add` 或 `manifest.mjs` 管理（规则 3） |
| 手动修改 `tsconfig*.json` 等官方未修改文件 | 由 `sync.mjs` 自动同步（规则 1） |
| 添加 bootstrap / HTTP 拦截器封装 / UI 组件封装 | 违反不过度封装（规则 5） |
| 删除 `releases/` 目录下的历史快照 | 不可逆操作，须用户手动确认 |
| 使用 `npm` / `yarn` 代替 `pnpm` | 项目锁定 pnpm（规则 3） |

## 变更检查清单

完成修改后，AI 须自行验证：

1. `pnpm build` 通过（类型检查 + 生产构建）
2. 如果修改了 `manifest.mjs`，确认 `generate.mjs` 和 `sync.mjs` 的引用一致
3. 如果新增了依赖，确认 `CUSTOM_DEPS` 已更新且 `package.json` 与之一致
4. 如果新增了文件/目录，确认 `manifest.mjs` 的 `CUSTOM_FILES` / `CUSTOM_DIRS` 已更新
5. 如果修改了官方接入文件，确认变更是通过脚本逻辑而非手动编辑

## 常用命令

| 命令 | 用途 |
|------|------|
| `pnpm dev` | 开发服务器 |
| `pnpm build` | 类型检查 + 生产构建 |
| `pnpm generate` | 生成历史快照（含验证） |
| `pnpm generate -- --skip-verify` | 跳过验证生成快照 |
| `pnpm sync` | 预览官方模板差异 |
| `pnpm sync -- --apply` | 实际同步官方变更 |
| `pnpm update-latest` | 更新所有依赖到最新 |