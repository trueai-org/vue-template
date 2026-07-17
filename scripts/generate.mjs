#!/usr/bin/env node
/**
 * 历史版本生成器（交互式模块装配）
 *
 * 在 npm create vite 官方产物之上，按用户选择的模块与同类框架，注入自定义代码，
 * 生成可重现的历史快照。工作模板 = 全模块超集（始终可构建）；快照 = 按选择裁剪后的干净项目。
 *
 * 模块选择：
 * - required（必需）：始终安装，不询问
 * - default（默认）：交互中可取消；--yes / 非 TTY 时安装
 * - optional（可选）：默认不安装，交互中可选择；--all 时全部安装
 *
 * 同类框架选择组（CHOICE_GROUPS）：互斥，每组选一个，有默认值。
 * 共享文件中的模块代码用 @module / @option 标记块包裹，本脚本按选择裁剪，标记行一并移除。
 * 整文件差异用 scripts/variants/ 下的变体覆盖。
 *
 * 用法：
 *   node scripts/generate.mjs                            # 交互式选择（含当前项目验证）
 *   node scripts/generate.mjs --skip-verify              # 跳过当前项目验证
 *   node scripts/generate.mjs --yes                      # 非交互：必需+默认模块，选择组用默认值
 *   node scripts/generate.mjs --all                      # 非交互：安装全部模块（含可选）
 *   node scripts/generate.mjs --minimal                  # 非交互：仅必需模块
 *   node scripts/generate.mjs --css=tailwind --http=fetch  # 指定同类框架选择（可与其他标志组合）
 *   node scripts/generate.mjs --skip-verify --yes --output /tmp/snapshot  # 指定输出目录（CI 友好）
 */
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { MODULES, CHOICE_GROUPS, SNAPSHOT_OVERRIDE_FILES } from './manifest.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const templateRoot = path.resolve(__dirname, '..')
const releasesRoot = path.resolve(templateRoot, 'releases')
const now = new Date()
const p = (n) => String(n).padStart(2, '0')
const stamp = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}_${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`

// ===== 命令行标志 =====
const argv = process.argv.slice(2)
// --output 支持两种形式：--output=<dir> 和 --output <dir>
const outputEq = argv.find((a) => a.startsWith('--output='))
const outputIdx = argv.indexOf('--output')
const outputArg = outputEq
  ? outputEq.split('=')[1]
  : outputIdx >= 0 && argv[outputIdx + 1]
    ? argv[outputIdx + 1]
    : null
const target = outputArg
  ? path.resolve(outputArg)
  : path.join(releasesRoot, `vue-template-${stamp}`)
const flags = {
  skipVerify: argv.includes('--skip-verify'),
  all: argv.includes('--all'),
  minimal: argv.includes('--minimal'),
  yes: argv.includes('--yes') || argv.includes('-y'),
}

// ===== 工具函数 =====
function run(label, command, cwd) {
  console.log(`\n▶ ${label}\n  ${command}`)
  execSync(command, { stdio: 'inherit', cwd })
}

// @module / @option 标记块裁剪：keys = 已选模块名 + "group.option" 选择组键
// 选中 -> 保留内容、移除标记行；未选中 -> 移除整块（含标记行）
function render(content, keys) {
  const lines = content.split('\n')
  const out = []
  let state = 'normal' // 'normal' | 'keeping' | 'skipping'
  for (const line of lines) {
    const m = line.match(/@(?:module|option):([\w.-]+)/)
    if (m) {
      state = keys.has(m[1]) ? 'keeping' : 'skipping'
      continue // 标记行始终移除
    }
    if (state !== 'normal' && /^\s*(\/\/\s*@end|<!--\s*@end\s*-->)/.test(line)) {
      state = 'normal'
      continue // 结束标记行始终移除
    }
    if (state !== 'skipping') out.push(line)
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n')
}

const RENDER_EXTS = new Set(['.ts', '.tsx', '.vue', '.js', '.css', '.html', '.json'])
const hasMarker = (s) => s.includes('@module:') || s.includes('@option:')

function copyFileRendered(src, dest, keys) {
  mkdirSync(path.dirname(dest), { recursive: true })
  const content = readFileSync(src, 'utf-8')
  const ext = path.extname(src)
  const out = RENDER_EXTS.has(ext) && hasMarker(content) ? render(content, keys) : content
  writeFileSync(dest, out)
}

function copyDirRendered(srcDir, destDir, keys) {
  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    const s = path.join(srcDir, entry.name)
    const d = path.join(destDir, entry.name)
    if (entry.isDirectory()) copyDirRendered(s, d, keys)
    else copyFileRendered(s, d, keys)
  }
}

// ===== 交互式提示 =====
async function askChoice(rl, groupKey, group) {
  const keys = Object.keys(group.options)
  console.log(`\n  ${group.label}:`)
  keys.forEach((k, i) => console.log(`    ${i + 1}) ${k.padEnd(8)} ${group.options[k].label}`))
  const defIdx = keys.indexOf(group.default) + 1
  const ans = (await rl.question(`  选择 [${defIdx}]: `)).trim()
  if (!ans) return group.default
  const idx = Number(ans)
  if (idx >= 1 && idx <= keys.length) return keys[idx - 1]
  if (keys.includes(ans)) return ans
  console.log(`  无效输入，使用默认 ${group.default}`)
  return group.default
}

async function askYN(rl, prompt, defYes) {
  const ans = (await rl.question(`${prompt} (${defYes ? 'Y/n' : 'y/N'}) `)).trim().toLowerCase()
  if (!ans) return defYes
  return ans.startsWith('y')
}

// ===== 模块与选择组确定 =====
function parseChoiceFlags() {
  const choices = {}
  for (const g of Object.keys(CHOICE_GROUPS)) {
    const arg = argv.find((a) => a.startsWith(`--${g}=`))
    if (arg) {
      const v = arg.split('=')[1]
      if (!CHOICE_GROUPS[g].options[v]) {
        throw new Error(
          `--${g} 无效值 "${v}"，可选：${Object.keys(CHOICE_GROUPS[g].options).join(' / ')}`,
        )
      }
      choices[g] = v
    }
  }
  return choices
}

async function selectModulesAndChoices() {
  const moduleKeys = Object.keys(MODULES)
  const required = moduleKeys.filter((k) => MODULES[k].tier === 'required')
  const defaults = moduleKeys.filter((k) => MODULES[k].tier === 'default')
  const optional = moduleKeys.filter((k) => MODULES[k].tier === 'optional')
  const flagChoices = parseChoiceFlags()

  let modules
  const choices = { ...flagChoices }

  if (flags.all) {
    modules = new Set(moduleKeys)
  } else if (flags.minimal) {
    modules = new Set(required)
  } else if (flags.yes || !process.stdin.isTTY) {
    modules = new Set([...required, ...defaults])
  } else {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    rl.on('SIGINT', () => process.exit(0))

    console.log('\n必需模块（自动安装）:')
    for (const k of required) console.log(`  ✓ ${k.padEnd(8)} ${MODULES[k].label}`)

    console.log('\n同类框架选择（每组选一个，回车用默认）:')
    for (const [g, group] of Object.entries(CHOICE_GROUPS)) {
      if (flagChoices[g]) {
        console.log(`  ${group.label}: ${flagChoices[g]}（命令行指定）`)
      } else {
        choices[g] = await askChoice(rl, g, group)
      }
    }

    modules = new Set(required)
    console.log('\n默认模块（回车安装，n 跳过）:')
    for (const k of defaults) {
      if (await askYN(rl, `  ? 安装 ${k} - ${MODULES[k].label}？`, true)) modules.add(k)
    }

    console.log('\n可选模块（回车跳过，y 安装）:')
    for (const k of optional) {
      if (await askYN(rl, `  ? 安装 ${k} - ${MODULES[k].label}？`, false)) modules.add(k)
    }

    rl.close()
  }

  // 选择组缺省值
  for (const [g, group] of Object.entries(CHOICE_GROUPS)) {
    choices[g] ??= group.default
  }

  // requires：hooks 依赖 quality 等，自动补齐
  for (const k of [...modules]) {
    for (const req of MODULES[k].requires ?? []) {
      if (!modules.has(req)) {
        console.log(`  ⓘ ${k} 依赖 ${req}，已自动加入`)
        modules.add(req)
      }
    }
  }

  return { modules, choices }
}

// ===== 主流程（async）=====
async function main() {
  // 第 1 步：验证当前项目
  if (flags.skipVerify) {
    console.log('\n===== 第 1 步：已跳过验证（--skip-verify）=====')
  } else {
    console.log('\n===== 第 1 步：验证当前项目 =====')
    run('生产构建（含类型检查）', 'pnpm build', templateRoot)
  }

  // 第 2 步：模块选择
  console.log('\n===== 第 2 步：模块选择 =====')
  const { modules, choices } = await selectModulesAndChoices()
  const moduleList = [...modules]
  console.log('\n已选模块:')
  for (const k of moduleList) console.log(`  ✓ ${k.padEnd(8)} ${MODULES[k].label}`)
  console.log('同类框架选择:')
  for (const [g, o] of Object.entries(choices)) console.log(`  • ${g.padEnd(6)} ${o}`)

  // 渲染键 = 模块名 + "group.option"
  const renderKeys = new Set([
    ...moduleList,
    ...Object.entries(choices).map(([g, o]) => `${g}.${o}`),
  ])

  // 第 3 步：创建历史目录
  console.log('\n===== 第 3 步：创建历史目录 =====')
  mkdirSync(path.dirname(target), { recursive: true })
  if (existsSync(target)) {
    throw new Error(
      `目标目录已存在，已终止（不自动删除以免误删）：${target}\n如确需覆盖请手动删除后重试。`,
    )
  }
  console.log(`  目标: ${target}`)

  // 第 4 步：官方脚手架创建基础项目
  console.log('\n===== 第 4 步：官方脚手架创建基础项目 =====')
  run(
    'npm create vite (vue-ts)',
    `npm create vite@latest "${path.basename(target)}" -- --template vue-ts --no-install --no-interactive`,
    path.dirname(target),
  )

  // 第 5 步：安装依赖（按选择聚合，分 runtime / dev 两条命令）
  console.log('\n===== 第 5 步：安装依赖 =====')
  run('pnpm install', 'pnpm install', target)

  const runtime = new Set()
  const dev = new Set()
  const addDeps = (d) => {
    d?.runtime?.forEach((x) => runtime.add(x))
    d?.dev?.forEach((x) => dev.add(x))
  }
  for (const k of moduleList) addDeps(MODULES[k].deps)
  for (const [g, o] of Object.entries(choices)) addDeps(CHOICE_GROUPS[g].options[o].deps)

  if (runtime.size > 0) {
    console.log(`  运行时: ${[...runtime].join(', ')}`)
    run('安装运行时依赖', `pnpm add ${[...runtime].join(' ')}`, target)
  }
  if (dev.size > 0) {
    console.log(`  开发: ${[...dev].join(', ')}`)
    run('安装开发依赖', `pnpm add -D ${[...dev].join(' ')}`, target)
  }

  // 第 6 步：注入 npm scripts（按已选模块合并到快照 package.json）
  console.log('\n===== 第 6 步：注入 npm scripts =====')
  const pkgPath = path.join(target, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
  pkg.scripts ??= {}
  for (const k of moduleList) {
    Object.assign(pkg.scripts, MODULES[k].scripts ?? {})
  }
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  console.log(`  scripts: ${Object.keys(pkg.scripts).join(', ')}`)

  // 第 7 步：覆盖接入文件 + 新增模块（按选择裁剪标记块）
  console.log('\n===== 第 7 步：覆盖接入文件 + 新增模块 =====')

  // 7.1 官方接入文件（裁剪后覆盖）
  for (const f of SNAPSHOT_OVERRIDE_FILES) {
    copyFileRendered(path.join(templateRoot, f), path.join(target, f), renderKeys)
    console.log(`  覆盖 ${f}`)
  }

  // 7.2 模块专属目录与文件
  for (const k of moduleList) {
    const mod = MODULES[k]
    for (const d of mod.dirs ?? []) {
      copyDirRendered(path.join(templateRoot, d), path.join(target, d), renderKeys)
      console.log(`  复制 ${d}/`)
    }
    for (const f of mod.files ?? []) {
      copyFileRendered(path.join(templateRoot, f), path.join(target, f), renderKeys)
      console.log(`  复制 ${f}`)
    }
  }

  // 7.3 同类框架选择组的专属文件（如 uno.config.ts）
  for (const [g, o] of Object.entries(choices)) {
    for (const f of CHOICE_GROUPS[g].options[o].files ?? []) {
      copyFileRendered(path.join(templateRoot, f), path.join(target, f), renderKeys)
      console.log(`  复制 ${f}（${g}=${o}）`)
    }
  }

  // 7.4 变体覆盖（整文件差异，如 tailwind 的 style.css / fetch 的 request.ts）
  for (const [g, o] of Object.entries(choices)) {
    for (const v of CHOICE_GROUPS[g].options[o].variants ?? []) {
      const vdir = path.join(templateRoot, 'scripts', 'variants', v)
      copyDirRendered(vdir, target, renderKeys)
      console.log(`  变体覆盖 ${v}/`)
    }
  }

  // 第 8 步：验证历史版本
  console.log('\n===== 第 8 步：验证历史版本 =====')
  run('生产构建（含类型检查）', 'pnpm build', target)

  console.log('\n✓ 历史版本已生成并验证通过')
  console.log(`  路径: ${target}`)
  console.log(`  模块: ${moduleList.join(', ')}`)
  console.log(
    `  选择: ${Object.entries(choices)
      .map(([g, o]) => `${g}=${o}`)
      .join(', ')}`,
  )
  console.log(`  预览: cd "${target}" && pnpm dev`)
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`)
  process.exit(1)
})
