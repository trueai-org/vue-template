#!/usr/bin/env node
/**
 * 每日历史版本生成器
 * 从官方 vite 脚手架开始，注入 vue-template 自定义模块，生成可重现的历史快照。
 *
 * 用法：
 *   node scripts/generate.mjs            # 完整流程（含当前项目验证）
 *   node scripts/generate.mjs --skip-verify  # 跳过当前项目验证
 *
 * 流程：
 *   1. 验证当前 vue-template 完整最新（typecheck + build）
 *   2. 创建历史目录 releases/vue-template-<date>/
 *   3. npm create vite 生成官方基础项目
 *   4. 清理 create vite 默认文件
 *   5. 复制依赖配置（package.json / lock / .npmrc）
 *   6. pnpm install --frozen-lockfile（保证版本一致）
 *   7. 复制业务模块与配置（src / 配置 / scripts / .github）
 *   8. 验证历史版本（typecheck + build）
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

// 平台化命令构造（Windows: xcopy/copy/rmdir/del  Unix: cp/rm）
const sh = {
  rmDir: d => isWin ? `rmdir /s /q "${d}"` : `rm -rf "${d}"`,
  rmFile: f => isWin ? `del /q /f "${f}"` : `rm -f "${f}"`,
  cpDir: (s, d) => isWin ? `xcopy /e /i /y /q "${s}" "${d}"` : `cp -r "${s}" "${d}"`,
  cpFile: (s, d) => isWin ? `copy /y "${s}" "${d}" >nul` : `cp "${s}" "${d}"`,
}

function run(label, command, cwd) {
  console.log(`\n▶ ${label}`)
  console.log(`  ${command}`)
  execSync(command, { stdio: 'inherit', cwd })
}

// ===== 第 1 步：验证当前 vue-template 完整最新 =====
if (!skipVerify) {
  console.log('\n===== 第 1 步：验证当前 vue-template 完整最新 =====')
  run('类型检查', 'pnpm typecheck', templateRoot)
  run('生产构建', 'pnpm build', templateRoot)
}
else {
  console.log('\n===== 第 1 步：已跳过当前项目验证（--skip-verify） =====')
}

// ===== 第 2 步：创建历史目录 =====
console.log('\n===== 第 2 步：创建历史目录 =====')
mkdirSync(releasesRoot, { recursive: true })
if (existsSync(target))
  run('清理已存在的历史目录', sh.rmDir(target))
console.log(`  目标目录: ${target}`)

// ===== 第 3 步：官方脚手架创建基础项目 =====
console.log('\n===== 第 3 步：官方脚手架创建基础项目 =====')
run('npm create vite (vue-ts 模板)', `npm create vite@latest "vue-template-${date}" -- --template vue-ts`, releasesRoot)

// ===== 第 4 步：清理 create vite 默认文件 =====
console.log('\n===== 第 4 步：清理 create vite 默认文件 =====')
for (const d of ['src', 'public', '.vscode']) {
  const p = path.join(target, d)
  if (existsSync(p))
    run(`删除 ${d}/`, sh.rmDir(p), target)
}
for (const f of ['vite.config.ts', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json', 'package.json', 'index.html', 'README.md', '.gitignore', 'env.d.ts', 'vite-env.d.ts', 'eslint.config.js', 'tsconfig.vitest.json']) {
  const p = path.join(target, f)
  if (existsSync(p))
    run(`删除 ${f}`, sh.rmFile(p), target)
}

// ===== 第 5 步：复制依赖配置 =====
console.log('\n===== 第 5 步：复制依赖配置 =====')
for (const f of ['package.json', 'pnpm-lock.yaml', '.npmrc', '.nvmrc'])
  run(`复制 ${f}`, sh.cpFile(path.join(templateRoot, f), path.join(target, f)))

// ===== 第 6 步：安装依赖（frozen lockfile 保证可重现） =====
console.log('\n===== 第 6 步：安装依赖 =====')
run('pnpm install --frozen-lockfile', 'pnpm install --frozen-lockfile', target)

// ===== 第 7 步：复制业务模块与配置 =====
console.log('\n===== 第 7 步：复制业务模块与配置 =====')
for (const d of ['src', 'public', 'scripts', '.github'])
  run(`复制 ${d}/`, sh.cpDir(path.join(templateRoot, d), path.join(target, d)))
for (const f of ['vite.config.ts', 'uno.config.ts', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json', 'env.d.ts', 'index.html', '.env', '.env.development', '.gitignore', 'README.md'])
  run(`复制 ${f}`, sh.cpFile(path.join(templateRoot, f), path.join(target, f)))

// ===== 第 8 步：验证历史版本 =====
console.log('\n===== 第 8 步：验证历史版本 =====')
run('类型检查', 'pnpm typecheck', target)
run('生产构建', 'pnpm build', target)

console.log('\n✓ 历史版本已生成并验证通过')
console.log(`  路径: ${target}`)
console.log(`  预览: cd "${target}" && pnpm dev`)