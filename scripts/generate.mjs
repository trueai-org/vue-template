#!/usr/bin/env node
/**
 * 每日历史版本生成器
 * 基于 npm create vite 官方模板，新增自定义模块，生成可重现的历史快照。
 * 不删除官方文件，只覆盖必要接入文件 + 新增模块。
 *
 * 用法：
 *   node scripts/generate.mjs                # 完整流程（含当前项目验证）
 *   node scripts/generate.mjs --skip-verify  # 跳过当前项目验证
 */
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const templateRoot = path.resolve(__dirname, '..')
const releasesRoot = path.resolve(templateRoot, '..', 'releases')
const date = new Date().toISOString().slice(0, 10)
const target = path.join(releasesRoot, `vue-template-${date}`)
const skipVerify = process.argv.includes('--skip-verify')
const isWin = process.platform === 'win32'

const sh = {
  rmDir: d => isWin ? `rmdir /s /q "${d}"` : `rm -rf "${d}"`,
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
if (existsSync(target))
  run('清理旧目录', sh.rmDir(target))
console.log(`  目标: ${target}`)

// ===== 第 3 步：官方脚手架创建基础项目 =====
console.log('\n===== 第 3 步：官方脚手架创建基础项目 =====')
run('npm create vite (vue-ts)', `npm create vite@latest "vue-template-${date}" -- --template vue-ts`, releasesRoot)

// ===== 第 4 步：安装依赖（官方指令，拉取最新版）=====
console.log('\n===== 第 4 步：安装依赖 =====')
run('pnpm install', 'pnpm install', target)
run('pnpm add pinia@^3 vue-router axios', 'pnpm add pinia@^3 vue-router axios', target)
run('pnpm add -D unocss @iconify-json/carbon', 'pnpm add -D unocss @iconify-json/carbon', target)

// ===== 第 5 步：覆盖接入文件 + 新增自定义模块 =====
console.log('\n===== 第 5 步：覆盖接入文件 + 新增自定义模块 =====')
// 覆盖官方 4 个文件（最小接入：router / pinia / unocss / title）
for (const f of ['src/main.ts', 'src/App.vue', 'vite.config.ts', 'index.html'])
  run(`覆盖 ${f}`, sh.cpFile(path.join(templateRoot, f), path.join(target, f)))
// 新增文件
run('复制 uno.config.ts', sh.cpFile(path.join(templateRoot, 'uno.config.ts'), path.join(target, 'uno.config.ts')))
// 新增目录
for (const d of ['src/router', 'src/stores', 'src/api', 'src/views', 'scripts', '.github'])
  run(`复制 ${d}/`, sh.cpDir(path.join(templateRoot, d), path.join(target, d)))

// ===== 第 6 步：验证历史版本 =====
console.log('\n===== 第 6 步：验证历史版本 =====')
run('生产构建（含类型检查）', 'pnpm build', target)

console.log('\n✓ 历史版本已生成并验证通过')
console.log(`  路径: ${target}`)
console.log(`  预览: cd "${target}" && pnpm dev`)