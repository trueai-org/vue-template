# vue-template

一个自维护的 Vue 脚手架增量层。不替代 `create-vite`，而是在其产物之上，用脚本可重现地注入 Router / Pinia / Axios / UnoCSS，并通过 `sync` 持续追踪官方上游变更。解决的核心问题是：自定义模板如何在不 fork 官方仓库的前提下，保持可重现、可同步、可审计，最终目标：始终保持当前脚手架与官方最新一致稳定高可用。

- **可重现**：`pnpm generate` 用官方命令从零重建等价项目，产出带时间戳的历史快照
- **可同步**：`pnpm sync` 对比官方最新模板，安全吸收上游变更
- **可审计**：`scripts/manifest.mjs` 是文件归属（官方未动 / 官方被接入 / 自定义新增）的单一事实来源

约束：UI 无关、官方推荐接入最小化、模块独立可移除。

## 原则与规则

### 核心原则

1. **官方模板优先** - `npm create vite` 产物原封不动，只新增模块
2. **不手动改动官方文件** - 官方生成的模板内容（`tsconfig`、`style.css`、`components/HelloWorld.vue`、`assets/` 等）不手动修改；必要的接入（`main.ts` / `App.vue` / `vite.config.ts` / `index.html`）只通过 `generate.mjs` 脚本注入
3. **官方指令安装依赖** - 依赖通过 `pnpm add` 安装，不复制固定版本 `package.json`
4. **脚本驱动** - 安装依赖、新增模块、新增页面均通过脚本注入，确保可重现

### 设计约束

1. **官方推荐接入最小化** - 遵循**最小化、模块化、最新、官方推荐**四原则：
   - **最小化**：自定义代码仅做接入（import + 注册），不添加非官方默认配置项（官方文档默认配置中没有的选项不添加，需要自定义时注释说明原因）
   - **模块化**：每个模块独立可移除，不与其他模块耦合
   - **最新**：依赖版本保持最新（除兼容性锁定外），使用官方当前推荐的 API 和配置方式
   - **官方推荐接入**：所有配置遵循官方文档的推荐做法，不引入个人偏好或非官方默认值
   - 同时遵守不过度封装：无 bootstrap、无 http 解包封装、无 UI 组件封装
2. **所有命令遵循官方文档** - 每个命令附官方文档地址

### 模块要求

1. **模块依赖独立可移除** - 新增的任何模块/依赖都必须独立：配置隔离、使用隔离、可单独迁移/测试/替换/移除。每个自定义依赖须在 README 标注「依赖清单」及其移除步骤，删除时不应牵连其他模块
2. **依赖更新** - 默认基础包 `vue/typescript` 等是通过 `npm create vite` 生成的，任何安装的依赖都要兼容此版本，而不是盲目使用最新版本

## 官方命令与文档

| 命令                     | 用途                | 官方文档                                                                       |
| ------------------------ | ------------------- | ------------------------------------------------------------------------------ |
| `npm create vite@latest` | 官方脚手架创建项目  | [https://github.com/vitejs/create-vite](https://github.com/vitejs/create-vite) |
| `pnpm install`           | 安装依赖            | [https://pnpm.io/cli/install](https://pnpm.io/cli/install)                     |
| `pnpm add <pkg>`         | 添加依赖            | [https://pnpm.io/cli/add](https://pnpm.io/cli/add)                             |
| `pnpm update --latest`   | 更新到最新          | [https://pnpm.io/cli/update](https://pnpm.io/cli/update)                       |
| `pnpm dev`               | 开发服务器          | [https://vite.dev/guide/cli.html](https://vite.dev/guide/cli.html)             |
| `pnpm build`             | 类型检查 + 生产构建 | [https://vite.dev/guide/cli.html](https://vite.dev/guide/cli.html)             |
| `pnpm preview`           | 预览构建产物        | [https://vite.dev/guide/cli.html](https://vite.dev/guide/cli.html)             |

依赖官方文档：[Vue](https://vuejs.org) · [Vue Router](https://router.vuejs.org) · [Pinia](https://pinia.vuejs.org) · [Axios](https://axios-http.com) · [UnoCSS](https://unocss.dev)（[Vite](https://unocss.dev/integrations/vite) · [Presets](https://unocss.dev/guide/presets) · [Reset](https://unocss.dev/guide/style-reset)） · [TypeScript](https://www.typescriptlang.org) · [vue-tsc](https://github.com/vuejs/language-tools)

## 快速开始

```bash
pnpm install          # 安装依赖
pnpm dev              # 开发
pnpm build            # 类型检查 + 生产构建（vue-tsc -b && vite build）
pnpm preview          # 预览
pnpm test             # 单元测试（vitest run）
pnpm lint             # ESLint 检查并自动修复
pnpm format           # Prettier 格式化
pnpm analyze          # 构建产物体积分析（生成 stats.html）
```

## 检查更新

```bash
pnpm update-latest    # 等同 pnpm update --latest，更新所有依赖到最新
pnpm build            # 更新后验证构建
```

> **兼容性约束**：vue-tsc 3.x 依赖 typescript 6.x；pinia 4.x 需要 typescript 7。
> 因此 generate 脚本中 pinia 锁定 `^3`、typescript 沿用官方 create-vite 的 `~6.0.2`。
> 其余依赖（vue / vue-router / axios / vite / unocss / @types/node 等）保持最新。
> 待 vue-tsc 适配 typescript 7 后可解除锁定。

## UnoCSS 配置

- [https://unocss.dev/interactive/](https://unocss.dev/interactive/)
- **Preset**：使用 `presetWind3`（`presetUno` 已弃用，见 [Presets](https://unocss.dev/guide/presets)）
- **Style Reset**：使用 `@unocss/reset/tailwind-v4.css` 作为默认样式（见 [Reset](https://unocss.dev/guide/style-reset)），官方 `style.css` 已清空。`border` 等原子类可直接生效
- **Vite 集成**：`plugins: [vue(), UnoCSS()]` + `import '@unocss/reset/tailwind-v4.css'` + `import 'virtual:uno.css'`（见 [Vite](https://unocss.dev/integrations/vite)）
- **图标（独立模块）**：`presetIcons` + `@iconify-json/carbon` 提供 Carbon 图标集，使用原子类 `i-carbon-<name>`（如 `<i class="i-carbon-home" />`）。演示见 `src/views/HomeView.vue` 的「图标类」块。图标查询：[icones.js.org](https://icones.js.org/) · [UnoCSS Icons preset](https://unocss.dev/presets/icons)
- **图标组件（集成层的另一种方案）**：通过 `unplugin-icons` + `unplugin-vue-components` 可把图标当作 Vue 组件使用（如 `<i-carbon-home />`），数据源为 `@iconify/json`（全量图标集）。与上述原子类方案并存、各自独立可移除，详见下方「集成层」

## 模块清单

> 遵循「模块独立可移除」。每个模块标注层级、依赖、配置位置、官网，确保单独移除不牵连其他模块。
> 模块定义的单一事实来源为 `scripts/manifest.mjs` 的 `MODULES`。

| 模块      | 层级 | 依赖                                                                             | 配置位置                                          | 官方文档                                                                                                                                                                                           |
| --------- | ---- | -------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core`    | 必需 | pinia · vue-router                                                               | `src/router` · `src/stores` · `src/main.ts`       | [Pinia](https://pinia.vuejs.org) · [Vue Router](https://router.vuejs.org)                                                                                                                          |
| `utils`   | 默认 | @vueuse/core · dayjs · nprogress                                                 | `src/views/UtilsView.vue` · `src/router/index.ts` | [VueUse](https://vueuse.org) · [Day.js](https://day.js.org) · [NProgress](https://github.com/rstacruz/nprogress)                                                                                   |
| `layer`   | 默认 | unplugin-auto-import · unplugin-vue-components · unplugin-icons · @iconify/json  | `vite.config.ts`                                  | [unplugin-icons](https://github.com/unplugin/unplugin-icons) · [auto-import](https://github.com/unplugin/unplugin-auto-import) · [components](https://github.com/unplugin/unplugin-vue-components) |
| `quality` | 默认 | eslint · @eslint/js · eslint-plugin-vue · typescript-eslint · prettier · globals | `eslint.config.js` · `.prettierrc.json`           | [ESLint](https://eslint.org) · [Prettier](https://prettier.io) · [typescript-eslint](https://typescript-eslint.io)                                                                                 |
| `build`   | 默认 | rollup-plugin-visualizer · vite-plugin-vue-devtools                              | `vite.config.ts`                                  | [visualizer](https://github.com/btd/rollup-plugin-visualizer) · [Vue DevTools](https://devtools.vuejs.org)                                                                                         |
| `test`    | 可选 | vitest · @vue/test-utils · jsdom                                                 | `vitest.config.ts` · `src/__tests__/`             | [Vitest](https://vitest.dev) · [Vue Test Utils](https://test-utils.vuejs.org)                                                                                                                      |

### 模块层级

| 层级             | 含义                       | `generate` 交互行为 |
| ---------------- | -------------------------- | ------------------- |
| 必需（required） | 核心闭环，移除后模板不成立 | 始终安装，不询问    |
| 默认（default）  | 推荐安装，可取消           | 回车安装，`n` 跳过  |
| 可选（optional） | 按需安装                   | 回车跳过，`y` 安装  |

## 同类框架选择组

> 同类框架互斥，每组选一个，有默认值。定义在 `scripts/manifest.mjs` 的 `CHOICE_GROUPS`。

### CSS 方案（`--css=<opt>`）

| 选项             | 依赖                                          | 说明                            | 官网                                |
| ---------------- | --------------------------------------------- | ------------------------------- | ----------------------------------- |
| `unocss`（默认） | unocss · @iconify-json/carbon · @unocss/reset | 原子化引擎，按需生成，体积小    | [UnoCSS](https://unocss.dev)        |
| `tailwind`       | tailwindcss · @tailwindcss/vite               | Tailwind CSS v4，CSS-first 配置 | [Tailwind](https://tailwindcss.com) |
| `none`           | —                                             | 不安装 CSS 框架                 | —                                   |

> postcss 是 Tailwind/UnoCSS 的底层工具而非同级框架，不作为独立选项。

### HTTP 客户端（`--http=<opt>`）

| 选项            | 依赖  | 说明                                 | 官网                                                              |
| --------------- | ----- | ------------------------------------ | ----------------------------------------------------------------- |
| `axios`（默认） | axios | 实例 + 拦截器，生态成熟              | [Axios](https://axios-http.com)                                   |
| `fetch`         | —     | 原生 API，零依赖，薄封装统一 baseURL | [Fetch API](https://developer.mozilla.org/docs/Web/API/Fetch_API) |
| `ky`            | ky    | 基于 fetch 的轻量封装                | [ky](https://github.com/sindresorhus/ky)                          |

> got / undici 是 Node.js 端 HTTP 库，不打浏览器包，故不作为选项。

### 占位与裁剪约定

共享文件中的模块代码用标记注释包裹，`generate.mjs` 按选择裁剪：

- **选中**：保留内容，移除标记行 -> 快照中是干净代码
- **未选中**：移除整块 -> 快照中不存在该代码
- **整文件差异**（如 tailwind 的 style.css / fetch 的 request.ts）：用 `scripts/variants/<group>.<option>/` 下的变体覆盖

```
// TS/JS：    // @module:<name> ... // @end
// Vue 模板： <!-- @module:<name> --> ... <!-- @end -->
// 选择组：   // @option:<group>.<option> ... // @end
```

工作模板 = 全标记块保留的超集（始终可构建）；快照 = 按选择裁剪后的干净项目。

### 移除图标类库（UnoCSS 图标层，独立移除）

```bash
pnpm remove @iconify-json/carbon
```

1. 卸载包：`pnpm remove @iconify-json/carbon`
2. 移除配置：删除 `uno.config.ts` 中的 `presetIcons(...)`（保留 `presetWind3`）
3. 移除使用：删除 `src/views/HomeView.vue` 中带「图标类」注释的 `<div>` 块
4. 验证：`pnpm build`

移除后 UnoCSS 原子类与其他模块不受影响。换用其他图标集（如 `@iconify-json/mdi`）只需替换包名与 `i-mdi-<name>` 类名前缀。

## 集成层模块详解（layer）

> 以下 4 个 `unplugin` 插件构成 `layer` 模块（默认安装，可整体移除），均已在 `vite.config.ts` 中以 `@module:layer` 标记块配置。
> 它们是**编译期** Vite 插件，不影响运行时产物体积（按需编译、Tree-shaking）。

### 一、安装

```bash
pnpm add -D unplugin-icons unplugin-auto-import @iconify/json unplugin-vue-components
```

> 项目使用 pnpm（规则 3），等价于用户给的 `yarn add -D ...`。官方安装文档：[pnpm add](https://pnpm.io/cli/add)

### 二、配置（`vite.config.ts`）

```ts
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    // [可选] API 自动导入
    AutoImport({ imports: ['vue', 'vue-router', 'pinia'], dts: 'src/auto-imports.d.ts' }),
    // [可选] 组件自动导入 + 图标组件解析
    Components({ resolvers: [IconsResolver()], dts: 'src/components.d.ts' }),
    // [可选] 图标按需编译为 Vue 组件
    Icons({ compiler: 'vue3' }),
  ],
})
```

### 三、各模块说明

| 插件                      | 用途                                                                                 | 官方文档                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `unplugin-auto-import`    | 自动导入 `vue` / `vue-router` / `pinia` 的 API，无需手动 `import { ref } from 'vue'` | [README](https://github.com/unplugin/unplugin-auto-import)                                |
| `unplugin-vue-components` | 自动导入 `src/components` 下的组件，并解析图标组件；生成 `components.d.ts`           | [README](https://github.com/unplugin/unplugin-vue-components)                             |
| `unplugin-icons`          | 把图标按需编译为 Vue 组件（`<i-carbon-home />`），配合 `IconsResolver` 自动注册      | [README](https://github.com/unplugin/unplugin-icons) · [可用图标](https://icones.js.org/) |
| `@iconify/json`           | 全量图标数据集，作为 `unplugin-icons` 的数据源（含 200+ 图标集）                     | [Iconify JSON](https://iconify.design/docs/develop/json.html)                             |

### 四、使用示例

**图标组件**（`src/views/HomeView.vue` 已演示，无需 import）：

```vue
<i-carbon-home class="text-green-600" />
<i-carbon-information class="text-blue-600" />
```

- 命名规则：`i-<集合>-<图标名>`，如 `i-carbon-home` → 组件 `<i-carbon-home />`
- 图标查询：[icones.js.org](https://icones.js.org/)
- 与 UnoCSS 原子类图标 `<i class="i-carbon-home" />` 是两种并存方案，互不依赖

**API 自动导入**（可选，本项目源码仍保留显式 import 以保证可移除性）：

```vue
<script setup lang="ts">
// 无需 import { ref } from 'vue'，自动注入
const count = ref(0)
</script>
```

> 本模板源码统一使用显式 `import`，使 `unplugin-auto-import` 可被干净移除而不改动任何业务代码。自动导入仅作为开发便利启用。

### 五、生成的类型声明文件

插件会在 `src/` 下生成两个 `.d.ts`（已提交，供 `vue-tsc` 在 Vite 之前类型检查）：

| 文件                    | 生成者                    | 作用                                                         |
| ----------------------- | ------------------------- | ------------------------------------------------------------ |
| `src/auto-imports.d.ts` | `unplugin-auto-import`    | 声明自动注入的全局 API（`ref` / `computed` / `useRoute` 等） |
| `src/components.d.ts`   | `unplugin-vue-components` | 声明自动解析的全局组件（含图标组件 `ICarbonHome` 等）        |

> `pnpm build` = `vue-tsc -b && vite build`，`vue-tsc` 先于 Vite 运行，故这两个文件需预先存在。首次接入或克隆后若缺失，先执行一次 `npx vite build`（或 `pnpm dev`）即可生成。`generate.mjs` 已将它们复制到历史快照。

### 六、移除（整体移除集成层）

```bash
pnpm remove unplugin-icons unplugin-auto-import @iconify/json unplugin-vue-components
```

1. 卸载 4 个包（见上）
2. 移除配置：删除 `vite.config.ts` 中 `AutoImport` / `Components` / `Icons` / `IconsResolver` 相关 import 与 3 个插件块（保留 `vue()` 与 `UnoCSS()`）
3. 删除生成文件：`src/auto-imports.d.ts`、`src/components.d.ts`
4. 移除使用：删除 `src/views/HomeView.vue` 中带「图标组件」注释的 `<div>` 块
5. 同步脚本清单：删除 `scripts/generate.mjs` 第 4 步的 `pnpm add -D unplugin-...`，并从 `scripts/manifest.mjs` 的 `CUSTOM_FILES` 中移除两个 `.d.ts` 条目
6. 验证：`pnpm build`

移除后核心模板（Vue + Router + Pinia + Axios + UnoCSS）完全不受影响。

> **体积提示**：`@iconify/json` 为全量图标集（约 70MB+，含 200+ 图标集）。若只需少量图标集，可改用按需的 `@iconify-json/<set>`（如已安装的 `@iconify-json/carbon`），并在 `unplugin-icons` 中以离线模式加载，详见 [unplugin-icons 离线模式](https://github.com/unplugin/unplugin-icons#installation)。

## 历史版本生成

### 方式一：一键脚本（推荐）

```bash
pnpm generate                                  # 交互式选择模块（含当前项目验证）
pnpm generate -- --skip-verify                 # 跳过当前验证
pnpm generate -- --all                         # 非交互：安装全部模块（含可选）
pnpm generate -- --minimal                     # 非交互：仅必需模块
pnpm generate -- --yes                         # 非交互：必需+默认模块，选择组用默认值
pnpm generate -- --css=tailwind --http=fetch   # 指定同类框架选择
```

交互式流程：

```
必需模块（自动安装）:
  ✓ core     核心模块（Vue Router + Pinia + 项目骨架）

同类框架选择（每组选一个，回车用默认）:
  CSS 方案:
    1) unocss     UnoCSS 原子化引擎（默认）
    2) tailwind   Tailwind CSS v4
    3) none       不安装 CSS 框架
  选择 [1]:

  HTTP 客户端:
    1) axios      实例 + 拦截器（默认）
    2) fetch      原生 API，零依赖
    3) ky         基于 fetch 的轻量封装
  选择 [1]:

默认模块（回车安装，n 跳过）:
  ? 安装 utils - 运行时工具（VueUse + Day.js + NProgress）(Y/n)
  ? 安装 layer - 集成层（unplugin 自动导入 + 图标组件）(Y/n)
  ...

可选模块（回车跳过，y 安装）:
  ? 安装 test - 单元测试（Vitest + Vue Test Utils）(y/N)
```

生成到 `./releases/vue-template-<stamp>/`，`<stamp>` 为本地时间 `YYYY-MM-DD_HHmmss`（含时分秒，避免同日多次生成冲突）。脚本实现见 `scripts/generate.mjs`。

### 方式二：手动执行流程

> 以下 6 步与 `scripts/generate.mjs` 完全对应，可在任意终端逐条手动执行，效果等同 `pnpm generate`。
> 示例为 **Windows PowerShell**；macOS / Linux 用注释中的等效命令替换复制步骤。

#### 准备：设置路径变量

```powershell
$stamp = Get-Date -Format "yyyy-MM-dd_HHmmss"  # 本地时间，含时分秒避免冲突
$src   = "."                                    # 当前模板根目录
$dst   = ".\releases\vue-template-$stamp"       # 历史版本目标目录
```

- 用途：统一管理时间戳与路径，后续步骤复用。
- 官方文档：[Get-Date](https://learn.microsoft.com/powershell/module/microsoft.powershell.utility/get-date)

---

#### 第 1 步：验证当前项目

```bash
pnpm build
```

- 用途：在模板根目录运行 `vue-tsc -b && vite build`，做 TypeScript 类型检查 + Vite 生产构建，确保模板本身健康后再生成快照。`--skip-verify` 即跳过此步。
- 官方文档：[Vite CLI](https://vite.dev/guide/cli.html) · [vue-tsc](https://github.com/vuejs/language-tools)

---

#### 第 2 步：创建历史目录

```powershell
New-Item -ItemType Directory -Force -Path ".\releases"
if (Test-Path $dst) { Write-Error "目标目录已存在：$dst（不自动删除以免误删），请手动删除后重试"; exit 1 }
```

- 用途：确保 `releases/` 存在；**不执行任何删除**，避免误删导致数据丢失；若目标目录已存在则直接终止。目标目录本身由第 3 步 `npm create vite` 创建，此处不预建。
- 官方文档：[New-Item](https://learn.microsoft.com/powershell/module/microsoft.powershell.management/new-item) · [Test-Path](https://learn.microsoft.com/powershell/module/microsoft.powershell.management/test-path)
- Node 等效：`[fs.mkdirSync](https://nodejs.org/api/fs.html#fsmkdirsyncpath-options-callback)`（脚本所用）

---

#### 第 3 步：官方脚手架创建基础项目

```bash
cd releases
npm create vite@latest "vue-template-<stamp>" -- --template vue-ts --no-install --no-interactive
cd ..
```

- 用途：在 `releases/` 目录下用官方 `create-vite` 生成 `vue-ts` 基础项目，官方文件原封不动。`--` 分隔 npx 参数与传给 create-vite 的参数；`--template vue-ts` 指定 Vue + TypeScript 模板；`--no-install` 跳过安装依赖；`--no-interactive` 禁用所有交互提示（CI/自动化场景）。脚本后续用 `pnpm install` 安装。
- 官方文档：[create-vite](https://github.com/vitejs/create-vite) · [Vite 脚手架指南](https://vite.dev/guide/#scaffolding-your-first-vite-project) · [npm create](https://docs.npmjs.com/cli/v10/commands/npm-init)

---

#### 第 4 步：安装依赖（官方指令，拉取最新版）

> 依赖清单的单一事实来源为 `scripts/manifest.mjs` 的 `MODULES` + `CHOICE_GROUPS`，`generate.mjs` 从此处驱动安装命令。以下手动命令与脚本完全对应。

```bash
cd .\releases\vue-template-<stamp>
pnpm install
pnpm add pinia@^3 vue-router axios
pnpm add -D unocss @iconify-json/carbon @unocss/reset
pnpm add -D unplugin-icons unplugin-auto-import @iconify/json unplugin-vue-components
cd ..\..
```

命令拆解：

| 命令                                 | 用途                                                                   |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `pnpm install`                       | 安装 create-vite 生成的 `package.json` 自带依赖                        |
| `pnpm add pinia@^3 vue-router axios` | 按官方方式添加运行时依赖（pinia 锁 `^3`，见兼容性约束）                |
| `pnpm add -D unocss ...`             | `-D` 表示写入 `devDependencies`：UnoCSS 引擎、Carbon 图标集、CSS Reset |
| `pnpm add -D unplugin-...`           | 集成层：图标组件 + API/组件自动导入（详见「集成层」）                  |

- 官方文档：[pnpm install](https://pnpm.io/cli/install) · [pnpm add](https://pnpm.io/cli/add)

---

#### 第 5 步：覆盖接入文件 + 新增自定义模块

> 不删除任何官方文件，只覆盖 5 个接入文件 + 新增配置与模块目录。

**5.1 覆盖 5 个官方接入文件**（接入 router / pinia / unocss / title）

```powershell
copy /y "$src\src\main.ts"     "$dst\src\main.ts"
copy /y "$src\src\App.vue"     "$dst\src\App.vue"
copy /y "$src\src\style.css"   "$dst\src\style.css"
copy /y "$src\vite.config.ts"  "$dst\vite.config.ts"
copy /y "$src\index.html"      "$dst\index.html"
```

- 用途：`/y` 强制覆盖不提示。分别接入路由/Pinia/UnoCSS、清空官方样式改用 reset、加 UnoCSS 插件、改页面标题。
- 官方文档：[copy](https://learn.microsoft.com/windows-server/administration/windows-commands/copy) · 跨平台等效 `cp`（[coreutils](https://www.gnu.org/software/coreutils/manual/html_node/cp-invocation.html)）

**5.2 新增配置文件**

```powershell
copy /y "$src\uno.config.ts"       "$dst\uno.config.ts"
copy /y "$src\.env"                "$dst\.env"
copy /y "$src\.env.development"    "$dst\.env.development"
```

- 用途：UnoCSS 配置 + Vite 环境变量文件。
- 官方文档：[Vite env variables](https://vite.dev/guide/env-and-mode.html) · [UnoCSS config](https://unocss.dev/guide/config-file)

**5.2.1 复制集成层的类型声明**（`vue-tsc` 先于 Vite 运行，需预先存在）

```powershell
copy /y "$src\src\auto-imports.d.ts"  "$dst\src\auto-imports.d.ts"
copy /y "$src\src\components.d.ts"    "$dst\src\components.d.ts"
```

- 用途：集成层（unplugin 系列）生成的全局类型声明，供 `vue-tsc` 类型检查自动导入的 API 与图标组件。详见「集成层 → 生成的类型声明文件」。
- 官方文档：[unplugin-auto-import dts](https://github.com/unplugin/unplugin-auto-import#typescript) · [unplugin-vue-components dts](https://github.com/unplugin/unplugin-vue-components#typescript)

**5.3 新增模块目录**

```powershell
xcopy /e /i /y /q "$src\src\router"  "$dst\src\router"
xcopy /e /i /y /q "$src\src\stores"  "$dst\src\stores"
xcopy /e /i /y /q "$src\src\api"     "$dst\src\api"
xcopy /e /i /y /q "$src\src\views"   "$dst\src\views"
xcopy /e /i /y /q "$src\scripts"     "$dst\scripts"
xcopy /e /i /y /q "$src\.github"     "$dst\.github"
```

xcopy 参数拆解：

| 参数 | 含义                             |
| ---- | -------------------------------- |
| `/e` | 复制所有子目录，包含空目录       |
| `/i` | 目标不存在时视为目录（避免提示） |
| `/y` | 覆盖时不提示确认                 |
| `/q` | 静默模式，不打印文件名           |

- 官方文档：[xcopy](https://learn.microsoft.com/windows-server/administration/windows-commands/xcopy) · 跨平台等效 `cp -r`（[coreutils](https://www.gnu.org/software/coreutils/manual/html_node/cp-invocation.html)）

---

#### 第 6 步：验证历史版本

```bash
cd .\releases\vue-template-<stamp>
pnpm build
cd ..\..
```

- 用途：在目标目录运行生产构建（`vue-tsc -b && vite build`），验证历史快照可正常编译通过。
- 官方文档：[Vite CLI](https://vite.dev/guide/cli.html)

---

> 完成后历史版本位于 `./releases/vue-template-<stamp>/`，预览：`cd releases\vue-template-<stamp> && pnpm dev`。
> 不删除官方文件，只覆盖 5 个接入文件 + 新增模块。官方 `HelloWorld.vue` / `assets/` 等全部保留不动。

### 方式三：从零手动创建（官方命令逐条）

> 不依赖现有模板文件，完全用官方命令从零搭建一个等价项目。每步附命令说明、用途、官网地址。
> 适合理解每一步在做什么，或在新机器上复刻整套结构。示例目录名 `my-app`，可自行替换。
> 依赖清单的单一事实来源为 `scripts/manifest.mjs` 的 `MODULES` + `CHOICE_GROUPS`，以下命令与该清单对应。

#### 第 1 步：官方脚手架创建基础项目

```bash
npm create vite@latest "my-app" -- --template vue-ts --no-install --no-interactive
cd my-app
```

- **命令说明**：`npm create vite@latest` 等同 `npm init vite@latest`，通过 npx 拉取最新 `create-vite` 执行脚手架；`--` 分隔 npx 与脚手架参数；`--template vue-ts` 指定 Vue + TypeScript 模板；`--no-install` 跳过安装依赖；`--no-interactive` 禁用所有交互提示（CI/自动化场景）。
- **用途**：生成 Vite 官方 vue-ts 基础项目（含 `vite.config.ts`、`tsconfig*.json`、`src/main.ts`、`App.vue`、`HelloWorld.vue` 等），作为起点。
- **官网**：[create-vite](https://cn.vite.dev/guide/) · [Vite 脚手架](https://vite.dev/guide/#scaffolding-your-first-vite-project) / [vue-ts](https://vite.new/vue-ts) · [npm init / create](https://docs.npmjs.com/cli/v10/commands/npm-init)

#### 第 2 步：安装基础依赖

```bash
pnpm install
```

- **命令说明**：`pnpm install` 读取 create-vite 生成的 `package.json` 与 `pnpm-lock.yaml`，安装 `vue`、`vite`、`@vitejs/plugin-vue`、`typescript`、`vue-tsc` 等到 `node_modules`。
- **用途**：让脚手架产物可直接 `pnpm dev` 运行。
- **官网**：[pnpm install](https://pnpm.io/cli/install)

#### 第 3 步：添加运行时依赖

```bash
pnpm add pinia@^3 vue-router axios
```

- **命令说明**：`pnpm add <pkg...>` 将包写入 `dependencies` 并安装。`pinia@^3` 锁定主版本 3（兼容性约束，见下文）。多个包空格分隔一次性添加。
- **用途**：Pinia 状态管理、Vue Router 路由、Axios HTTP 客户端。
- **官网**：[pnpm add](https://pnpm.io/cli/add) · [Pinia](https://pinia.vuejs.org) · [Vue Router](https://router.vuejs.org) · [Axios](https://axios-http.com)

#### 第 4 步：添加开发依赖

```bash
pnpm add -D unocss @iconify-json/carbon @unocss/reset
pnpm add -D unplugin-icons unplugin-auto-import @iconify/json unplugin-vue-components
```

- **命令说明**：`-D` / `--save-dev` 写入 `devDependencies`（仅构建期需要，不进产物）。
- **用途**：
  - 第一行：`unocss` 原子化 CSS 引擎 + Vite 插件；`@iconify-json/carbon` 提供 Carbon 图标集（`presetIcons` 按需加载）；`@unocss/reset` 提供 CSS Reset。
  - 第二行（集成层）：`unplugin-icons` 图标按需编译为组件；`unplugin-auto-import` API 自动导入；`@iconify/json` 全量图标数据源；`unplugin-vue-components` 组件自动导入。详见「集成层」。
- **官网**：[pnpm add](https://pnpm.io/cli/add) · [UnoCSS](https://unocss.dev) · [Icons preset](https://unocss.dev/presets/icons) · [Reset](https://unocss.dev/guide/style-reset) · [unplugin-icons](https://github.com/unplugin/unplugin-icons) · [unplugin-auto-import](https://github.com/unplugin/unplugin-auto-import) · [unplugin-vue-components](https://github.com/unplugin/unplugin-vue-components)

#### 第 5 步：配置 Vite（UnoCSS + 集成层插件）

编辑 `vite.config.ts`：

```ts
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
    // [可选] API 自动导入
    AutoImport({ imports: ['vue', 'vue-router', 'pinia'], dts: 'src/auto-imports.d.ts' }),
    // [可选] 组件自动导入 + 图标组件解析
    Components({ resolvers: [IconsResolver()], dts: 'src/components.d.ts' }),
    // [可选] 图标按需编译为 Vue 组件
    Icons({ compiler: 'vue3' }),
  ],
})
```

- **用途**：注册 `UnoCSS()`（原子类）；集成层注册 `AutoImport` / `Components` / `Icons`，启用 API 自动导入与图标组件。每块独立注释，可单独移除。
- **官网**：[Vite config](https://vite.dev/config/) · [UnoCSS Vite 集成](https://unocss.dev/integrations/vite) · [unplugin-auto-import](https://github.com/unplugin/unplugin-auto-import) · [unplugin-vue-components](https://github.com/unplugin/unplugin-vue-components) · [unplugin-icons](https://github.com/unplugin/unplugin-icons)

#### 第 6 步：新建 UnoCSS 配置文件

新建 `uno.config.ts`：

```ts
import { defineConfig, presetIcons, presetWind3 } from 'unocss'

// https://unocss.dev/
export default defineConfig({
  presets: [
    presetWind3(),
    presetIcons({
      scale: 1.2,
    }),
  ],
})
```

- **用途**：`presetWind3`（Tailwind 兼容原子类，`presetUno` 已弃用）；`presetIcons` 启用图标类（如 `i-carbon-xxx`）。
- **官网**：[UnoCSS config](https://unocss.dev/guide/config-file) · [Presets](https://unocss.dev/guide/presets)

#### 第 7 步：改写 `src/main.ts` 接入 router / pinia / uno.css

```ts
import { createApp } from 'vue'
import '@unocss/reset/tailwind-v4.css'
import './style.css'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import 'virtual:uno.css'

createApp(App).use(pinia).use(router).mount('#app')
```

- **用途**：引入 CSS Reset（替代官方默认 `style.css`）、引入 `virtual:uno.css`（生成原子类）、注册 Pinia 与 Router 插件。
- **官网**：[Vue createApp](https://vuejs.org/api/application.html#createapp) · [Pinia 安装](https://pinia.vuejs.org/getting-started.html) · [Vue Router 安装](https://router.vuejs.org/installation.html) · [UnoCSS Vite 虚拟模块](https://unocss.dev/integrations/vite)

#### 第 8 步：清空 `src/style.css`

```css
/* 已清空：默认样式由 @unocss/reset/tailwind-v4.css 提供 */
```

- **用途**：官方 `style.css` 含默认样式会与 Reset 冲突，清空后由 `@unocss/reset/tailwind-v4.css` 统一接管，原子类（如 `border`）直接生效。
- **官网**：[UnoCSS Reset](https://unocss.dev/guide/style-reset)

#### 第 9 步：改写 `src/App.vue` 为路由出口

```vue
<script setup lang="ts"></script>

<template>
  <div>
    <nav>
      <RouterLink to="/">首页</RouterLink>
      <RouterLink to="/about">关于</RouterLink>
    </nav>
    <RouterView />
  </div>
</template>
```

- **用途**：顶部导航 + `<RouterView />` 路由出口。`RouterLink` / `RouterView` 由 `vue-router` 全局注册。
- **官网**：[Vue Router RouterView](https://router.vuejs.org/api/interfaces/RouterView.html) · [RouterLink](https://router.vuejs.org/api/interfaces/RouterLink.html)

#### 第 10 步：新建路由 `src/router/index.ts`

```ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
    { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
  ],
})

export default router
```

- **用途**：`createWebHistory` HTML5 history 模式；`import.meta.env.BASE_URL` 取 Vite `base` 配置；路由组件懒加载（动态 import）。
- **官网**：[Vue Router 入门](https://router.vuejs.org/guide/) · [动态导入路由](https://router.vuejs.org/guide/essentials/dynamic-matching.html) · [Vite env](https://vite.dev/guide/env-and-mode.html)

#### 第 11 步：新建 Pinia 实例 `src/stores/index.ts`

```ts
import { createPinia } from 'pinia'

const pinia = createPinia()

export default pinia
```

- **用途**：创建 Pinia 实例并默认导出，供 `main.ts` 注册。后续 store 文件用 `defineStore` 定义。
- **官网**：[Pinia 定义 store](https://pinia.vuejs.org/core-concepts/)

#### 第 12 步：新建 Axios 实例 `src/api/request.ts`

```ts
import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASEURL ?? '/api',
  timeout: 15000,
})

// 请求/响应拦截器可在此处按需添加

export default request
```

- **用途**：`axios.create` 工厂创建带统一配置的实例；`baseURL` 从环境变量读取，缺失时回退 `/api`；按需添加拦截器。
- **官网**：[Axios 实例](https://axios-http.com/docs/instance) · [Axios 拦截器](https://axios-http.com/docs/interceptors) · [Vite env](https://vite.dev/guide/env-and-mode.html)

#### 第 13 步：新建页面 `src/views/HomeView.vue` 与 `AboutView.vue`

`src/views/HomeView.vue`：

```vue
<script setup lang="ts"></script>

<template>
  <section class="m-4 p-4 border border-gray-300 rounded-lg">
    <h1 class="text-2xl font-bold text-red-400 mb-2">Vue Template</h1>
    <p class="m-4 text-red-400 border border-gray-300 p-2">
      基于官方 create-vite，UI 无关、模块可替换。
    </p>
    <div class="mt-4 flex gap-2">
      <span class="px-2 py-1 bg-green-500 text-white rounded">UnoCSS</span>
      <span class="px-2 py-1 bg-blue-500 text-white rounded">Vue3</span>
    </div>
    <!-- 图标类（UnoCSS presetIcons）：依赖 @iconify-json/carbon，移除图标库时删除此块即可 -->
    <div class="mt-4 flex items-center gap-3 text-xl">
      <i class="i-carbon-home text-green-600" />
      <i class="i-carbon-information text-blue-600" />
      <i class="i-carbon-logo-github text-gray-800" />
    </div>
    <!-- 图标组件（unplugin-icons + unplugin-vue-components）：依赖 @iconify/json，移除集成层时删除此块即可 -->
    <div class="mt-4 flex items-center gap-3 text-xl">
      <i-carbon-home class="text-green-600" />
      <i-carbon-information class="text-blue-600" />
      <i-carbon-logo-github class="text-gray-800" />
    </div>
  </section>
</template>
```

`src/views/AboutView.vue`：

```vue
<script setup lang="ts"></script>

<template>
  <section>
    <h1>关于</h1>
    <p>Vue3 + Vite + Pinia + Vue Router + Axios + UnoCSS</p>
  </section>
</template>
```

- **用途**：两个路由页面，演示 UnoCSS 原子类（`m-4`、`text-red-400`、`flex` 等）生效；`HomeView` 含两种独立图标方案——「图标类」（UnoCSS，依赖 `@iconify-json/carbon` + 第 6 步 `presetIcons`）与「图标组件」（unplugin-icons，依赖第 4 步 `@iconify/json` + 第 5 步插件）。
- **官网**：[UnoCSS 交互式查询](https://unocss.dev/interactive/) · [Icons preset](https://unocss.dev/presets/icons) · [图标查询 icones](https://icones.js.org/) · [unplugin-icons](https://github.com/unplugin/unplugin-icons)

#### 第 14 步：新建环境变量文件

`.env`：

```dotenv
# 应用配置
VITE_APP_TITLE=Vue Template
VITE_APP_API_BASEURL=http://localhost:3000
VITE_APP_BASE=/
```

`.env.development`：

```dotenv
# 应用配置
VITE_APP_TITLE=Vue Template
VITE_APP_API_BASEURL=/
VITE_APP_BASE=/
```

- **用途**：Vite 环境变量以 `VITE_` 前缀暴露到 `import.meta.env`；`.env` 通用，`.env.development` 仅 `pnpm dev` 生效。
- **官网**：[Vite env and mode](https://vite.dev/guide/env-and-mode.html)

#### 第 15 步：修改 `index.html` 标题（可选）

```html
<title>Vue Template</title>
```

- **用途**：改默认页面标题。其余官方结构不动。
- **官网**：[Vite index.html](https://vite.dev/guide/#index-html-and-project-root)

#### 第 16 步：验证构建

```bash
npx vite build  # 首次：先生成集成层的 .d.ts（auto-imports.d.ts / components.d.ts）
pnpm build      # 类型检查 + 生产构建
pnpm dev        # 启动开发服务器
pnpm preview    # 预览构建产物
```

- **用途**：`pnpm build` 即 `vue-tsc -b && vite build`，先类型检查再构建。因 `vue-tsc` 先于 Vite 运行，集成层（第 5 步）生成的 `.d.ts` 需预先存在，故首次先跑一次 `npx vite build`（或 `pnpm dev`）生成它们。`pnpm dev` 启动 HMR 开发服务器；`pnpm preview` 本地预览 `dist/`。
- **官网**：[Vite CLI](https://vite.dev/guide/cli.html) · [vue-tsc](https://github.com/vuejs/language-tools) · [unplugin-auto-import dts](https://github.com/unplugin/unplugin-auto-import#typescript) · [unplugin-vue-components dts](https://github.com/unplugin/unplugin-vue-components#typescript)

> 从零手动创建完成后，结构与「方式一/二」产物等价。官方 `HelloWorld.vue`、`components/`、`assets/`、`tsconfig*.json`、`.gitignore` 等均保留不动，仅改写/新增上述文件。

## 目录结构

官方 create-vite 产物（保留不改）+ 脚本注入：

```
vue-template/
├── index.html              # 官方（脚本改 title）
├── tsconfig.json           # 官方，不改
├── tsconfig.app.json       # 官方，不改
├── tsconfig.node.json      # 官方，不改
├── vite.config.ts          # 官方（脚本加 UnoCSS + 集成层 unplugin 插件）
├── .gitignore              # 官方（脚本追加 /releases）
├── .env                    # 新增：环境变量
├── .env.development        # 新增：开发环境变量
├── public/                 # 官方，不改
├── src/
│   ├── main.ts             # 官方（脚本加 router + pinia + uno.css 接入）
│   ├── App.vue             # 官方（脚本改为 RouterView + 导航）
│   ├── style.css           # 官方（脚本清空，用 @unocss/reset 替代）
│   ├── components/         # 官方，不改（HelloWorld.vue）
│   ├── assets/             # 官方，不改
│   ├── auto-imports.d.ts   # 新增（集成层生成）：自动导入 API 类型声明
│   ├── components.d.ts     # 新增（集成层生成）：自动解析组件类型声明
│   ├── router/index.ts     # 新增：路由
│   ├── stores/index.ts     # 新增：Pinia 实例
│   ├── api/request.ts      # 新增：Axios 实例
│   └── views/              # 新增：页面（HomeView / AboutView）
├── uno.config.ts           # 新增：UnoCSS 配置
├── scripts/                # 新增（build.mjs / generate.mjs / sync.mjs / manifest.mjs）
├── .github/workflows/      # 新增（daily-build.yml）
└── AGENTS.md               # 新增：AI 协作规则（不进快照）
```

**官方文件仅 6 处由脚本注入修改**：`src/main.ts`、`src/App.vue`、`src/style.css`（清空）、`vite.config.ts`、`index.html`、`.gitignore`（追加 `/releases`）。其余官方文件一律不动。文件分类清单的单一事实来源为 `scripts/manifest.mjs`，`generate.mjs` 与 `sync.mjs` 均从此导入。

## 每日构建

- **CI**：`.github/workflows/daily-build.yml` 每天 UTC 02:00 自动构建 + 发布 GitHub Release（`daily-YYYY-MM-DD` tag + `dist.zip` 产物附件）
- **本地**：`node scripts/build.mjs`

## 同步官方模板

官方 `create-vite` 模板持续演进，`scripts/sync.mjs` 用于将上游变更同步回当前项目。

```bash
pnpm sync              # 预览模式（只显示差异，不修改文件）
pnpm sync -- --apply   # 实际同步（覆盖官方未修改文件 + 验证构建）
```

**文件分类与处理策略**（清单定义见 `scripts/manifest.mjs`，与 `generate.mjs` 共用）：

| 分类         | 文件                                                                                                                                             | 同步策略                 |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| 官方未修改   | `tsconfig*.json`、`.gitignore`、`public/`、`src/components/`、`src/assets/`                                                                      | 有差异时自动覆盖         |
| 官方脚本修改 | `src/main.ts`、`src/App.vue`、`src/style.css`、`vite.config.ts`、`index.html`、`.gitignore`                                                      | 有差异时提示，需人工审查 |
| 自定义       | `src/router/`、`src/stores/`、`src/api/`、`src/views/`、`uno.config.ts`、`scripts/`、`.github/`、`.env*`、`src/*.d.ts`、`README.md`、`AGENTS.md` | 不动                     |

**同步流程**：

1. 在临时目录 `npm create vite@latest` 生成最新官方模板
2. 对比官方文件（未修改类）：有差异则列出，`--apply` 时自动覆盖
3. 对比官方文件（脚本修改类）：有差异则提示，打印新旧路径供手动对比
4. 对比 `package.json` 官方依赖版本与 scripts：列出差异
5. `--apply` 时自动运行 `pnpm build` 验证
6. 清理临时目录

> 脚本修改类文件不会被自动覆盖。如果官方 `main.ts` 等文件结构发生变化，需手动审查并更新自定义版本。
