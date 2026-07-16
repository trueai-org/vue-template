# vue-template

一个干净、UI 无关、模块可替换的 Vue3 模板。每日构建发布稳定版本。

## 设计原则

1. **只使用官方指令** — 仅依赖 `vite` / `vue-tsc` 等官方 CLI
2. **与 UI 框架无关** — 暂不接入任何 UI 框架，纯 UnoCSS + 原生 HTML；未来需要时整体重写 `ui/` 目录
3. **模块化单一职责** — 每个业务模块自包含（api + store + view + route），可整体替换/迁移
4. **可重现** — 锁定依赖版本 + lock 文件 + Node 版本约束，任意时间都能跑通
5. **简单清晰** — 目录结构一目了然，无 monorepo 额外复杂度

## 技术栈

| 依赖 | 版本 | 说明 |
| --- | --- | --- |
| Vue | ^3.5 | 视图层 |
| Vue Router | ^5.1 | 官方路由 |
| Pinia | ^3.0 | 官方状态管理 |
| Axios | ^1.18 | 网络请求 |
| Vite | ^8.1 | 构建工具（Rolldown） |
| TypeScript | ^6.0 | 类型系统 |
| UnoCSS | ^66.7 | 原子化样式 |
| pnpm | >=11 | 包管理器 |

## 快速开始

```bash
# 需要 Node ^22.18 || ^24，pnpm >=11
pnpm install
pnpm dev       # 开发
pnpm build     # 类型检查 + 生产构建
pnpm preview   # 预览构建产物
pnpm typecheck # 仅类型检查
```

## 目录结构

```
vue-template/
├── .github/workflows/daily-build.yml  # 每日构建 CI
├── scripts/build.mjs                  # 可重现构建脚本
├── src/
│   ├── app/                # 应用入口与组装（main → bootstrap → App）
│   ├── api/                # Axios 实例 + 拦截器 + http 封装
│   ├── components/         # 通用组件（UnoCSS + 原生 HTML）
│   ├── composables/        # 组合式函数（useRequest 等）
│   ├── layouts/            # 布局（DefaultLayout + Header/Sidebar）
│   ├── modules/            # 业务模块（每个自包含、可替换）
│   │   ├── home/           #   api + store + view + route + index
│   │   └── about/
│   ├── router/             # 路由聚合 + 守卫
│   ├── stores/             # Pinia（app 级状态）
│   ├── styles/             # 全局样式（CSS 变量驱动主题）
│   ├── types/              # 类型声明（RouteMeta 等）
│   └── utils/              # 纯函数工具（无框架依赖）
├── uno.config.ts           # UnoCSS 配置（presets + shortcuts）
├── vite.config.ts          # Vite 配置
└── tsconfig.json           # TypeScript（project references）
```

## 模块化约定

每个业务模块位于 `src/modules/<name>/`，自包含：

```
modules/home/
├── api.ts      # 接口定义
├── store.ts    # Pinia store
├── route.ts    # 路由片段（default export）
├── views/      # 页面组件
└── index.ts    # 模块统一出口
```

新增模块只需：
1. 在 `modules/` 下创建模块目录
2. 在 `router/routes.ts` 的 `children` 中 import 其 `route.ts`

菜单自动从路由 `meta` 派生，无需手动维护。

## 可替换性

| 层 | 替换方式 |
| --- | --- |
| UI 样式 | 改 `uno.config.ts` 与 `styles/main.css`；接入 UI 框架时整体重写 `components/` |
| 网络请求 | 改 `api/request.ts`，业务层 `http` 接口不变 |
| 状态管理 | 改 `stores/`，模块 store 自包含可单独替换 |
| 布局 | 替换 `layouts/`，路由引用的是 `DefaultLayout.vue` |
| 业务模块 | 整个 `modules/<name>/` 目录可删除/替换 |

## 每日构建

- **CI**：`.github/workflows/daily-build.yml` 每天 UTC 02:00 自动 `install → typecheck → build`，并打 `daily-YYYY-MM-DD` tag、上传构建产物
- **本地复现**：`node scripts/build.mjs` 执行相同的可重现流程
- **手动触发**：GitHub Actions 页面 `workflow_dispatch`

> 将本目录作为独立仓库使用时，CI 即生效。

## 历史版本生成

从官方 `npm create vite` 脚手架开始，注入当前项目的自定义模块，生成带日期标签的历史快照。每步命令均打印，完全可重现。

```bash
pnpm generate                  # 完整流程（先验证当前项目，再生成历史版本）
pnpm generate -- --skip-verify # 跳过当前项目验证
```

生成到 `../releases/vue-template-<date>/`，流程：

1. 验证当前 vue-template 完整最新（typecheck + build）
2. 创建历史目录 `releases/vue-template-<date>/`
3. `npm create vite@latest` 官方脚手架创建基础项目
4. 清理 create vite 默认文件
5. 复制依赖配置（package.json / pnpm-lock.yaml / .npmrc）
6. `pnpm install --frozen-lockfile`（版本与源项目完全一致）
7. 复制业务模块与配置（src / 配置 / scripts / .github）
8. 验证历史版本（typecheck + build）