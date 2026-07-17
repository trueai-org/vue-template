# vue-template

基于官方 `npm create vite` vue-ts 模板，新增最小自定义模块。UI 无关、不过度封装、可重现。

## 原则与规则

1. **官方模板优先** - `npm create vite` 产物原封不动，只新增模块
2. **不手动改动官方文件** - 官方生成的模板内容（`tsconfig`、`style.css`、`components/HelloWorld.vue`、`assets/` 等）不手动修改；必要的接入（`main.ts` / `App.vue` / `vite.config.ts` / `index.html`）只通过 `generate.mjs` 脚本注入
3. **官方指令安装依赖** - 依赖通过 `pnpm add` 安装，不复制固定版本 `package.json`
4. **脚本驱动** - 安装依赖、新增模块、新增页面均通过脚本注入，确保可重现
5. **不过度封装** - 无 bootstrap、无 http 解包封装、无 UI 组件封装
6. **所有命令遵循官方文档** - 每个命令附官方文档地址
7. **模块依赖独立可移除** - 新增的任何模块/依赖都必须独立：配置隔离、使用隔离、可单独迁移/测试/替换/移除。每个自定义依赖须在 README 标注「依赖清单」及其移除步骤，删除时不应牵连其他模块

## 官方命令与文档


| 命令                       | 用途          | 官方文档                                                                           |
| ------------------------ | ----------- | ------------------------------------------------------------------------------ |
| `npm create vite@latest` | 官方脚手架创建项目   | [https://github.com/vitejs/create-vite](https://github.com/vitejs/create-vite) |
| `pnpm install`           | 安装依赖        | [https://pnpm.io/cli/install](https://pnpm.io/cli/install)                     |
| `pnpm add <pkg>`         | 添加依赖        | [https://pnpm.io/cli/add](https://pnpm.io/cli/add)                             |
| `pnpm update --latest`   | 更新到最新       | [https://pnpm.io/cli/update](https://pnpm.io/cli/update)                       |
| `pnpm dev`               | 开发服务器       | [https://vite.dev/guide/cli.html](https://vite.dev/guide/cli.html)             |
| `pnpm build`             | 类型检查 + 生产构建 | [https://vite.dev/guide/cli.html](https://vite.dev/guide/cli.html)             |
| `pnpm preview`           | 预览构建产物      | [https://vite.dev/guide/cli.html](https://vite.dev/guide/cli.html)             |


依赖官方文档：[Vue](https://vuejs.org) · [Vue Router](https://router.vuejs.org) · [Pinia](https://pinia.vuejs.org) · [Axios](https://axios-http.com) · [UnoCSS](https://unocss.dev)（[Vite](https://unocss.dev/integrations/vite) · [Presets](https://unocss.dev/guide/presets) · [Reset](https://unocss.dev/guide/style-reset)） · [TypeScript](https://www.typescriptlang.org) · [vue-tsc](https://github.com/vuejs/language-tools)

## 快速开始

```bash
pnpm install          # 安装依赖
pnpm dev              # 开发
pnpm build            # 类型检查 + 生产构建（vue-tsc -b && vite build）
pnpm preview          # 预览
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
- **图标（独立模块）**：`presetIcons` + `@iconify-json/carbon` 提供 Carbon 图标集，使用原子类 `i-carbon-<name>`（如 `i-carbon-home`）。演示见 `src/views/HomeView.vue` 的图标块。图标查询：[icones.js.org](https://icones.js.org/) · [UnoCSS Icons preset](https://unocss.dev/presets/icons)



## 自定义依赖清单与移除步骤

> 遵循「规则 7：模块依赖独立可移除」。每个自定义依赖标注其配置位置、使用位置、移除步骤，确保单独移除不牵连其他模块。

| 依赖 | 类型 | 配置位置 | 使用位置 | 官方文档 |
| --- | --- | --- | --- | --- |
| `pinia` | 运行时 | `src/stores/index.ts`（实例） | `src/main.ts` 注册 | [Pinia](https://pinia.vuejs.org) |
| `vue-router` | 运行时 | `src/router/index.ts` | `src/main.ts` 注册 · `src/App.vue` 出口 | [Vue Router](https://router.vuejs.org) |
| `axios` | 运行时 | `src/api/request.ts` | 按需 import | [Axios](https://axios-http.com) |
| `unocss` | 开发 | `uno.config.ts` · `vite.config.ts` 插件 | `src/main.ts` 引入 reset + virtual | [UnoCSS](https://unocss.dev) |
| `@unocss/reset` | 开发 | `src/main.ts` 引入 `tailwind-v4.css` | `src/style.css` 已清空 | [Reset](https://unocss.dev/guide/style-reset) |
| `@iconify-json/carbon` | 开发 | `uno.config.ts` 的 `presetIcons` | `src/views/HomeView.vue` 图标块 | [Icons preset](https://unocss.dev/presets/icons) |

### 移除图标库（示例：独立移除一个模块）

```bash
pnpm remove @iconify-json/carbon
```

1. 卸载包：`pnpm remove @iconify-json/carbon`
2. 移除配置：删除 `uno.config.ts` 中的 `presetIcons(...)`（保留 `presetWind3`）
3. 移除使用：删除 `src/views/HomeView.vue` 中带「图标演示」注释的 `<div>` 块
4. 验证：`pnpm build`

移除后 UnoCSS 原子类与其他模块不受影响。换用其他图标集（如 `@iconify-json/mdi`）只需替换包名与 `i-mdi-<name>` 类名前缀。



## 历史版本生成

### 方式一：一键脚本（推荐）

```bash
pnpm generate                  # 完整流程（含当前项目验证）
pnpm generate -- --skip-verify # 跳过当前验证
```

生成到 `./releases/vue-template-<date>/`。脚本实现见 `scripts/generate.mjs`。

### 方式二：手动执行流程

> 以下 6 步与 `scripts/generate.mjs` 完全对应，可在任意终端逐条手动执行，效果等同 `pnpm generate`。
> 示例为 **Windows PowerShell**；macOS / Linux 用注释中的等效命令替换复制步骤。

#### 准备：设置路径变量

```powershell
$date = Get-Date -Format "yyyy-MM-dd"
$src  = "."                              # 当前模板根目录
$dst  = ".\releases\vue-template-$date"  # 历史版本目标目录
```

- 用途：统一管理日期与路径，后续步骤复用。
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
if (Test-Path $dst) { Remove-Item -Recurse -Force $dst }
New-Item -ItemType Directory -Path $dst
```

- 用途：确保 `releases/` 存在；若同日期目标目录已存在则先清理；最后新建当日目标目录。
- 官方文档：[New-Item](https://learn.microsoft.com/powershell/module/microsoft.powershell.management/new-item) · [Remove-Item](https://learn.microsoft.com/powershell/module/microsoft.powershell.management/remove-item) · [Test-Path](https://learn.microsoft.com/powershell/module/microsoft.powershell.management/test-path)
- Node 等效：[`fs.mkdirSync`](https://nodejs.org/api/fs.html#fsmkdirsyncpath-options-callback)（脚本所用）

---

#### 第 3 步：官方脚手架创建基础项目

```bash
cd releases
npm create vite@latest "vue-template-<date>" -- --template vue-ts
cd ..
```

- 用途：在 `releases/` 目录下用官方 `create-vite` 生成 `vue-ts` 基础项目，官方文件原封不动。`--` 分隔 npx 参数与传给 create-vite 的参数；`--template vue-ts` 指定 Vue + TypeScript 模板。
- 官方文档：[create-vite](https://github.com/vitejs/create-vite) · [Vite 脚手架指南](https://vite.dev/guide/#scaffolding-your-first-vite-project) · [npm create](https://docs.npmjs.com/cli/v10/commands/npm-init)

---

#### 第 4 步：安装依赖（官方指令，拉取最新版）

```bash
cd .\releases\vue-template-<date>
pnpm install
pnpm add pinia@^3 vue-router axios
pnpm add -D unocss @iconify-json/carbon @unocss/reset
cd ..\..
```

命令拆解：

| 命令 | 用途 |
| --- | --- |
| `pnpm install` | 安装 create-vite 生成的 `package.json` 自带依赖 |
| `pnpm add pinia@^3 vue-router axios` | 按官方方式添加运行时依赖（pinia 锁 `^3`，见兼容性约束） |
| `pnpm add -D unocss ...` | `-D` 表示写入 `devDependencies`：UnoCSS 引擎、Carbon 图标集、CSS Reset |

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

| 参数 | 含义 |
| --- | --- |
| `/e` | 复制所有子目录，包含空目录 |
| `/i` | 目标不存在时视为目录（避免提示） |
| `/y` | 覆盖时不提示确认 |
| `/q` | 静默模式，不打印文件名 |

- 官方文档：[xcopy](https://learn.microsoft.com/windows-server/administration/windows-commands/xcopy) · 跨平台等效 `cp -r`（[coreutils](https://www.gnu.org/software/coreutils/manual/html_node/cp-invocation.html)）

---

#### 第 6 步：验证历史版本

```bash
cd .\releases\vue-template-<date>
pnpm build
cd ..\..
```

- 用途：在目标目录运行生产构建（`vue-tsc -b && vite build`），验证历史快照可正常编译通过。
- 官方文档：[Vite CLI](https://vite.dev/guide/cli.html)

---

> 完成后历史版本位于 `./releases/vue-template-<date>/`，预览：`cd releases\vue-template-<date> && pnpm dev`。
> 不删除官方文件，只覆盖 5 个接入文件 + 新增模块。官方 `HelloWorld.vue` / `assets/` 等全部保留不动。

### 方式三：从零手动创建（官方命令逐条）

> 不依赖现有模板文件，完全用官方命令从零搭建一个等价项目。每步附命令说明、用途、官网地址。
> 适合理解每一步在做什么，或在新机器上复刻整套结构。示例目录名 `my-app`，可自行替换。

#### 第 1 步：官方脚手架创建基础项目

```bash
npm create vite@latest "my-app" -- --template vue-ts
cd my-app
```

- **命令说明**：`npm create vite@latest` 等同 `npm init vite@latest`，通过 npx 拉取最新 `create-vite` 执行脚手架；`--` 分隔 npx 与脚手架参数；`--template vue-ts` 指定 Vue + TypeScript 模板。
- **用途**：生成 Vite 官方 vue-ts 基础项目（含 `vite.config.ts`、`tsconfig*.json`、`src/main.ts`、`App.vue`、`HelloWorld.vue` 等），作为起点。
- **官网**：[create-vite](https://github.com/vitejs/create-vite) · [Vite 脚手架](https://vite.dev/guide/#scaffolding-your-first-vite-project) · [npm init / create](https://docs.npmjs.com/cli/v10/commands/npm-init)

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
```

- **命令说明**：`-D` / `--save-dev` 写入 `devDependencies`（仅构建期需要，不进产物）。
- **用途**：`unocss` 原子化 CSS 引擎 + Vite 插件；`@iconify-json/carbon` 提供 Carbon 图标集（`presetIcons` 按需加载）；`@unocss/reset` 提供 CSS Reset。
- **官网**：[pnpm add](https://pnpm.io/cli/add) · [UnoCSS](https://unocss.dev) · [Icons preset](https://unocss.dev/presets/icons) · [Reset](https://unocss.dev/guide/style-reset)

#### 第 5 步：配置 Vite 接入 UnoCSS 插件

编辑 `vite.config.ts`：

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), UnoCSS()],
})
```

- **用途**：在 Vite 插件链注册 `UnoCSS()`，使 `virtual:uno.css` 虚拟模块与原子类扫描生效。
- **官网**：[Vite config](https://vite.dev/config/) · [UnoCSS Vite 集成](https://unocss.dev/integrations/vite)

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
<script setup lang="ts">
</script>

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
<script setup lang="ts">
</script>

<template>
  <section class="m-4 p-4 border border-gray-300 rounded-lg">
    <h1 class="text-2xl font-bold text-red-400 mb-2">
      Vue Template
    </h1>
    <p class="m-4 text-red-400 border border-gray-300 p-2">
      基于官方 create-vite，UI 无关、模块可替换。
    </p>
    <div class="mt-4 flex gap-2">
      <span class="px-2 py-1 bg-green-500 text-white rounded">UnoCSS</span>
      <span class="px-2 py-1 bg-blue-500 text-white rounded">Vue3</span>
    </div>
    <!-- 图标演示：依赖 @iconify-json/carbon + uno.config.ts 的 presetIcons，移除图标库时删除此块即可 -->
    <div class="mt-4 flex items-center gap-3 text-xl">
      <i class="i-carbon-home text-green-600" />
      <i class="i-carbon-information text-blue-600" />
      <i class="i-carbon-logo-github text-gray-800" />
    </div>
  </section>
```

`src/views/AboutView.vue`：

```vue
<script setup lang="ts">
</script>

<template>
  <section>
    <h1>关于</h1>
    <p>Vue3 + Vite + Pinia + Vue Router + Axios + UnoCSS</p>
  </section>
</template>
```

- **用途**：两个路由页面，演示 UnoCSS 原子类（`m-4`、`text-red-400`、`flex` 等）生效；`HomeView` 内含独立图标演示块（`i-carbon-home` 等），依赖第 4 步的 `@iconify-json/carbon` 与第 6 步的 `presetIcons`。
- **官网**：[UnoCSS 交互式查询](https://unocss.dev/interactive/) · [Icons preset](https://unocss.dev/presets/icons) · [图标查询 icones](https://icones.js.org/)

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
pnpm build      # 类型检查 + 生产构建
pnpm dev        # 启动开发服务器
pnpm preview    # 预览构建产物
```

- **用途**：`pnpm build` 即 `vue-tsc -b && vite build`，先类型检查再构建；`pnpm dev` 启动 HMR 开发服务器；`pnpm preview` 本地预览 `dist/`。
- **官网**：[Vite CLI](https://vite.dev/guide/cli.html) · [vue-tsc](https://github.com/vuejs/language-tools)

> 从零手动创建完成后，结构与「方式一/二」产物等价。官方 `HelloWorld.vue`、`components/`、`assets/`、`tsconfig*.json`、`.gitignore` 等均保留不动，仅改写/新增上述文件。



## 目录结构

官方 create-vite 产物（保留不改）+ 脚本注入：

```
vue-template/
├── index.html              # 官方（脚本改 title）
├── tsconfig.json           # 官方，不改
├── tsconfig.app.json       # 官方，不改
├── tsconfig.node.json      # 官方，不改
├── vite.config.ts          # 官方（脚本加 UnoCSS 插件）
├── .gitignore              # 官方，不改
├── .env                    # 新增：环境变量
├── .env.development        # 新增：开发环境变量
├── public/                 # 官方，不改
├── src/
│   ├── main.ts             # 官方（脚本加 router + pinia + uno.css 接入）
│   ├── App.vue             # 官方（脚本改为 RouterView + 导航）
│   ├── style.css           # 官方（脚本清空，用 @unocss/reset 替代）
│   ├── components/         # 官方，不改（HelloWorld.vue）
│   ├── assets/             # 官方，不改
│   ├── router/index.ts     # 新增：路由
│   ├── stores/index.ts     # 新增：Pinia 实例
│   ├── api/request.ts      # 新增：Axios 实例
│   └── views/              # 新增：页面（HomeView / AboutView）
├── uno.config.ts           # 新增：UnoCSS 配置
├── scripts/                # 新增（build.mjs / generate.mjs）
└── .github/workflows/      # 新增（daily-build.yml）
```

**官方文件仅 5 处由脚本注入修改**：`src/main.ts`、`src/App.vue`、`src/style.css`（清空）、`vite.config.ts`、`index.html`。其余官方文件一律不动。

## 每日构建

- **CI**：`.github/workflows/daily-build.yml` 每天 UTC 02:00 自动构建 + 打 `daily-YYYY-MM-DD` tag
- **本地**：`node scripts/build.mjs`

