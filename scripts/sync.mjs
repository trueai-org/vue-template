#!/usr/bin/env node
/**
 * 官方模板同步器
 * 以 npm create vite@latest 生成的最新官方模板为基准，对比并同步到当前项目。
 * 默认 dry-run（只显示差异），--apply 才实际执行。
 *
 * 文件分类（与 generate.mjs 一致）：
 * - 官方未修改文件：安全覆盖（tsconfig、.gitignore、public/、components/、assets/）
 * - 官方脚本修改文件：有变更时提示，需人工审查（main.ts、App.vue、style.css、vite.config.ts、index.html）
 * - 自定义文件：不动（router/、stores/、api/、views/、uno.config.ts、scripts/、.github/、.env*）
 *
 * 用法：
 *   node scripts/sync.mjs            # 预览模式
 *   node scripts/sync.mjs --apply    # 实际同步
 */
import { execSync } from 'node:child_process'
import { mkdirSync, readFileSync, readdirSync, statSync, rmSync, copyFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const templateRoot = path.resolve(__dirname, '..')
const apply = process.argv.includes('--apply')

// ===== 文件分类（与 generate.mjs 一致）=====

// 官方文件（脚本修改）：当前项目中的自定义版本覆盖了官方版本
const OFFICIAL_MODIFIED = new Set([
  'src/main.ts',
  'src/App.vue',
  'src/style.css',
  'vite.config.ts',
  'index.html',
  '.gitignore', // 脚本追加 /releases
])

// 自定义文件/目录：同步时不动
const CUSTOM_PATHS = new Set([
  'src/router',
  'src/stores',
  'src/api',
  'src/views',
  'src/auto-imports.d.ts',
  'src/components.d.ts',
  'uno.config.ts',
  'scripts',
  '.github',
  '.env',
  '.env.development',
  'README.md',
  'pnpm-lock.yaml',
  'releases',
  'node_modules',
  'dist',
  '.git',
])

// 官方依赖（create-vite 生成的 package.json 中的依赖）
const OFFICIAL_DEP_KEYS = {
  dependencies: ['vue'],
  devDependencies: ['@vitejs/plugin-vue', '@vue/tsconfig', 'typescript', 'vite', 'vue-tsc', '@types/node'],
}

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'releases'])
const SKIP_FILES = new Set(['package.json', 'pnpm-lock.yaml', 'package-lock.json', 'yarn.lock'])

// ===== 工具函数 =====

function isCustom(relPath) {
  const norm = relPath.split(path.sep).join('/')
  for (const c of CUSTOM_PATHS) {
    if (norm === c || norm.startsWith(c + '/')) return true
  }
  return false
}

// 读取文件并统一换行符，避免 Windows/Unix 换行差异导致误报
function readText(filePath) {
  try {
    return readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n')
  } catch {
    return null
  }
}

function walkFiles(dir, base = dir) {
  const results = []
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...walkFiles(full, base))
    } else {
      results.push(path.relative(base, full))
    }
  }
  return results
}

// ===== 主流程 =====

console.log(apply ? '\n===== 同步模式（--apply）=====' : '\n===== 预览模式（dry-run，使用 --apply 实际执行）=====')

// 第 1 步：生成最新官方模板
const tmpParent = path.join(tmpdir(), `vite-sync-${Date.now()}`)
const tmpProject = path.join(tmpParent, 'vue-ts-fresh')
mkdirSync(tmpParent, { recursive: true })

console.log('\n▶ 第 1 步：生成最新官方模板')
try {
  execSync('npm create vite@latest vue-ts-fresh -- --template vue-ts', { stdio: 'inherit', cwd: tmpParent })
} catch {
  console.error('✗ npm create vite 失败，请检查网络连接')
  rmSync(tmpParent, { recursive: true, force: true })
  process.exit(1)
}

try {
  // 第 2 步：对比官方文件
  console.log('\n▶ 第 2 步：对比官方文件')
  const freshFiles = walkFiles(tmpProject)
  const freshFileSet = new Set(freshFiles.map(f => f.split(path.sep).join('/')))

  const autoApply = []    // 官方未修改文件，可安全覆盖
  const manualReview = [] // 官方脚本修改文件，需人工审查
  const newFiles = []     // 官方新增文件

  for (const relPath of freshFiles) {
    const norm = relPath.split(path.sep).join('/')
    if (isCustom(relPath) || SKIP_FILES.has(norm)) continue

    const freshContent = readText(path.join(tmpProject, relPath))
    const currentContent = readText(path.join(templateRoot, relPath))

    if (freshContent === currentContent) continue

    if (currentContent === null) {
      newFiles.push(relPath)
    } else if (OFFICIAL_MODIFIED.has(norm)) {
      manualReview.push(relPath)
    } else {
      autoApply.push(relPath)
    }
  }

  // 检查官方已删除的文件
  const currentFiles = walkFiles(templateRoot)
  const deletedFiles = []
  for (const relPath of currentFiles) {
    const norm = relPath.split(path.sep).join('/')
    if (isCustom(relPath) || SKIP_FILES.has(norm)) continue
    if (!freshFileSet.has(norm)) {
      deletedFiles.push(norm)
    }
  }

  let hasChanges = false

  if (autoApply.length > 0) {
    hasChanges = true
    console.log(`\n  [可安全覆盖] 官方文件有更新（${autoApply.length} 个）:`)
    for (const f of autoApply) console.log(`    ~ ${f.split(path.sep).join('/')}`)
  }

  if (newFiles.length > 0) {
    hasChanges = true
    console.log(`\n  [官方新增] 新文件（${newFiles.length} 个）:`)
    for (const f of newFiles) console.log(`    + ${f.split(path.sep).join('/')}`)
  }

  if (deletedFiles.length > 0) {
    hasChanges = true
    console.log(`\n  [官方已删除] 文件（${deletedFiles.length} 个）:`)
    for (const f of deletedFiles) console.log(`    - ${f}`)
  }

  if (manualReview.length > 0) {
    hasChanges = true
    console.log(`\n  [需人工审查] 官方文件有更新（脚本修改类，${manualReview.length} 个）:`)
    for (const f of manualReview) {
      const norm = f.split(path.sep).join('/')
      console.log(`    ! ${norm}`)
      console.log(`      官方新版: ${path.join(tmpProject, f)}`)
      console.log(`      当前自定义: ${path.join(templateRoot, f)}`)
    }
    console.log('\n  请手动对比上述文件，决定是否需要更新自定义版本。')
  }

  if (!hasChanges) {
    console.log('  ✓ 官方文件无变化')
  }

  // 第 3 步：对比 package.json 依赖与脚本
  console.log('\n▶ 第 3 步：对比依赖与脚本')
  const freshPkg = JSON.parse(readFileSync(path.join(tmpProject, 'package.json'), 'utf-8'))
  const currentPkg = JSON.parse(readFileSync(path.join(templateRoot, 'package.json'), 'utf-8'))

  let pkgChanged = false

  for (const [depType, deps] of Object.entries(OFFICIAL_DEP_KEYS)) {
    for (const dep of deps) {
      const freshVer = freshPkg[depType]?.[dep]
      const currentVer = currentPkg[depType]?.[dep]
      if (freshVer && currentVer && freshVer !== currentVer) {
        pkgChanged = true
        hasChanges = true
        console.log(`  ~ ${dep}: ${currentVer} → ${freshVer}`)
      }
    }
  }

  const officialScripts = ['dev', 'build', 'preview']
  for (const s of officialScripts) {
    const freshCmd = freshPkg.scripts?.[s]
    const currentCmd = currentPkg.scripts?.[s]
    if (freshCmd && currentCmd && freshCmd !== currentCmd) {
      pkgChanged = true
      hasChanges = true
      console.log(`  ~ script "${s}": "${currentCmd}" → "${freshCmd}"`)
    }
  }

  if (!pkgChanged) {
    console.log('  ✓ 官方依赖与脚本无变化')
  }

  // 第 4 步：应用变更（--apply 模式）
  if (apply && (autoApply.length > 0 || newFiles.length > 0)) {
    console.log('\n▶ 第 4 步：应用官方文件更新')
    for (const relPath of [...autoApply, ...newFiles]) {
      const src = path.join(tmpProject, relPath)
      const dst = path.join(templateRoot, relPath)
      mkdirSync(path.dirname(dst), { recursive: true })
      copyFileSync(src, dst)
      console.log(`  ✓ ${relPath.split(path.sep).join('/')}`)
    }
  }

  // 第 5 步：验证（--apply 模式）
  if (apply && hasChanges) {
    console.log('\n▶ 第 5 步：验证构建')
    try {
      execSync('pnpm build', { stdio: 'inherit', cwd: templateRoot })
      console.log('\n✓ 同步完成，构建验证通过')
    } catch {
      console.error('\n✗ 构建验证失败，请检查同步后的代码')
      process.exitCode = 1
    }
  } else if (!hasChanges) {
    console.log('\n✓ 当前项目已与官方最新模板一致')
  } else {
    console.log('\n===== 预览完成 =====')
    console.log('使用 --apply 实际应用官方文件更新')
    if (manualReview.length > 0) {
      console.log('注意：脚本修改类文件需手动审查，不会被自动覆盖')
    }
  }
} finally {
  // 清理临时目录
  rmSync(tmpParent, { recursive: true, force: true })
}