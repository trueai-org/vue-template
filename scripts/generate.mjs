#!/usr/bin/env node
/**
 * 每日历史版本生成器
 * 基于 npm create vite 官方模板，新增自定义模块，生成可重现的历史快照。
 * 不删除官方文件，只覆盖必要接入文件 + 新增模块。
 * 不删除历史目录，避免删错，目录名含时分秒，正常不冲突。
 * 
 * 用法：
 *   node scripts/generate.mjs                # 完整流程（含当前项目验证）
 *   node scripts/generate.mjs --skip-verify  # 跳过当前项目验证
 */
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { CUSTOM_DIRS, CUSTOM_FILES, CUSTOM_DEPS, SNAPSHOT_OVERRIDE_FILES } from './manifest.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const templateRoot = path.resolve(__dirname, '..')
const releasesRoot = path.resolve(templateRoot, 'releases')
// 目录名含时分秒，避免同日多次生成冲突
const now = new Date()
const p = n => String(n).padStart(2, '0')
const stamp = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}_${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`
const target = path.join(releasesRoot, `vue-template-${stamp}`)
const skipVerify = process.argv.includes('--skip-verify')
const isWin = process.platform === 'win32'

const sh = {
  cpDir: (s, d) => isWin ? `xcopy /e /i /y /q "${s}" "${d}"` : `cp -r "${s}" "${d}"`,
  cpFile: (s, d) => isWin ? `copy /y "${s}" "${d}" >nul` : `cp "${s}" "${d}"`,
}

function run(label, command, cwd) {
  console.log(`\n▶ ${label}\n  ${command}`)
  execSync(command, { stdio: 'inherit', cwd })
}

// ===== 第 1 步：验证当前项目 =====
if (!skipVerify) {
  console.log('\n===== 第 1 步：验证当前项目 =====')
  run('生产构建（含类型检查）', 'pnpm build', templateRoot)
}
else {
  console.log('\n===== 第 1 步：已跳过验证（--skip-verify）=====')
}

// ===== 第 2 步：创建历史目录 =====
console.log('\n===== 第 2 步：创建历史目录 =====')
mkdirSync(releasesRoot, { recursive: true })
// 不执行任何删除操作，避免误删；目录已含时分秒，正常不冲突，若已存在则直接终止
if (existsSync(target))
  throw new Error(`目标目录已存在，已终止（不自动删除以免误删）：${target}\n如确需覆盖请手动删除后重试。`)
console.log(`  目标: ${target}`)

// ===== 第 3 步：官方脚手架创建基础项目 =====
console.log('\n===== 第 3 步：官方脚手架创建基础项目 =====')
run('npm create vite (vue-ts)', `npm create vite@latest "vue-template-${stamp}" -- --template vue-ts`, releasesRoot)

// ===== 第 4 步：安装依赖（官方指令，拉取最新版）=====
// 依赖清单从 manifest.mjs 的 CUSTOM_DEPS 驱动，新增/移除依赖只需改 manifest
console.log('\n===== 第 4 步：安装依赖 =====')
run('pnpm install', 'pnpm install', target)
const runtimeCmd = `pnpm add ${CUSTOM_DEPS.runtime.join(' ')}`
const devCoreCmd = `pnpm add -D ${CUSTOM_DEPS.devCore.join(' ')}`
const devLayerCmd = `pnpm add -D ${CUSTOM_DEPS.devLayer.join(' ')}`

run(`安装运行时依赖 (${CUSTOM_DEPS.runtime.join(', ')})`, runtimeCmd, target)
run(`安装核心开发依赖 (${CUSTOM_DEPS.devCore.join(', ')})`, devCoreCmd, target)
run(`安装集成层依赖 (${CUSTOM_DEPS.devLayer.join(', ')})`, devLayerCmd, target)

// ===== 第 5 步：覆盖接入文件 + 新增自定义模块 =====
console.log('\n===== 第 5 步：覆盖接入文件 + 新增自定义模块 =====')
// 覆盖官方接入文件（最小接入：router / pinia / unocss / title，清单见 manifest.mjs）
for (const f of SNAPSHOT_OVERRIDE_FILES)
  run(`覆盖 ${f}`, sh.cpFile(path.join(templateRoot, f), path.join(target, f)))
// 新增自定义文件（uno 配置 / 环境变量 / 集成层生成的类型声明）
for (const f of CUSTOM_FILES)
  run(`复制 ${f}`, sh.cpFile(path.join(templateRoot, f), path.join(target, f)))
// 新增自定义目录
for (const d of CUSTOM_DIRS)
  run(`复制 ${d}/`, sh.cpDir(path.join(templateRoot, d), path.join(target, d)))

// ===== 第 6 步：验证历史版本 =====
console.log('\n===== 第 6 步：验证历史版本 =====')
run('生产构建（含类型检查）', 'pnpm build', target)

console.log('\n✓ 历史版本已生成并验证通过')
console.log(`  路径: ${target}`)
console.log(`  预览: cd "${target}" && pnpm dev`)