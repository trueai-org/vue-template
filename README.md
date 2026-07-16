# vue-template

基于官方 `npm create vite` vue-ts 模板，新增最小自定义模块。UI 无关、不过度封装、可重现。

## 原则与规则

1. **官方模板优先** - `npm create vite` 产物原封不动，只新增模块
2. **不手动改动官方文件** - 官方生成的模板内容（`tsconfig`、`style.css`、`components/HelloWorld.vue`、`assets/` 等）不手动修改；必要的接入（`main.ts` / `App.vue` / `vite.config.ts` / `index.html`）只通过 `generate.mjs` 脚本注入
3. **官方指令安装依赖** - 依赖通过 `pnpm add` 安装，不复制固定版本 `package.json`
4. **脚本驱动** - 安装依赖、新增模块、新增页面均通过脚本注入，确保可重现
5. **不过度封装** - 无 bootstrap、无 http 解包封装、无 UI 组件封装
6. **所有命令遵循官方文档** - 每个命令附官方文档地址

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



## 历史版本生成

```bash
pnpm generate                  # 完整流程（含当前项目验证）
pnpm generate -- --skip-verify # 跳过当前验证
```

生成到 `../releases/vue-template-<date>/`。完整流程（每步命令均打印，遵循官方文档）：

```bash
# 第 1 步：验证当前项目
pnpm build                          # https://vite.dev/guide/cli.html

# 第 2 步：创建历史目录（Node mkdirSync）

# 第 3 步：官方脚手架创建基础项目（在 releases/ 下执行）
npm create vite@latest "vue-template-<date>" -- --template vue-ts
                                    # https://github.com/vitejs/create-vite

# 第 4 步：安装依赖（官方指令，拉取最新版）
pnpm install                        # https://pnpm.io/cli/install
pnpm add pinia@^3 vue-router axios  # https://pnpm.io/cli/add
pnpm add -D unocss @iconify-json/carbon @unocss/reset

# 第 5 步：通过脚本注入接入文件 + 新增自定义模块（不手动改官方文件）
copy /y src/main.ts     target/src/main.ts      # 接入 router/pinia/unocss
copy /y src/App.vue     target/src/App.vue      # 改为 RouterView
copy /y src/style.css   target/src/style.css     # 清空，用 @unocss/reset 替代
copy /y vite.config.ts  target/vite.config.ts   # 加 UnoCSS 插件
copy /y index.html      target/index.html        # 改 title
copy /y uno.config.ts   target/uno.config.ts     # 新增
xcopy /e /i /y /q src/router   target/src/router  # 新增模块
xcopy /e /i /y /q src/stores   target/src/stores  # 新增模块
xcopy /e /i /y /q src/api      target/src/api     # 新增模块
xcopy /e /i /y /q src/views    target/src/views   # 新增页面
xcopy /e /i /y /q scripts      target/scripts     # 新增脚本
xcopy /e /i /y /q .github      target/.github     # 新增 CI

# 第 6 步：验证历史版本
pnpm build                          # https://vite.dev/guide/cli.html
```

> 不删除官方文件，只通过脚本覆盖 4 个接入文件 + 新增模块。官方 `HelloWorld.vue` / `style.css` / `assets/` 等全部保留不动。



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

