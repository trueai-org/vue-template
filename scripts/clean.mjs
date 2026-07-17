#!/usr/bin/env node
/**
 * 清理 releases/ 目录下的历史快照
 * 使用 rimraf 跨平台删除（Windows 长路径 / 只读文件也能处理）
 *
 * 用法：node scripts/clean.mjs
 */
import { rimrafSync } from 'rimraf'
import { existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const releasesDir = path.resolve(__dirname, '..', 'releases')

if (!existsSync(releasesDir)) {
  console.log('releases/ 不存在，无需清理')
  process.exit(0)
}

const entries = readdirSync(releasesDir)
if (entries.length === 0) {
  console.log('releases/ 为空，无需清理')
  process.exit(0)
}

console.log(`清理 releases/（${entries.length} 个快照）:`)
for (const entry of entries) {
  console.log(`  - ${entry}`)
}

rimrafSync(releasesDir)
console.log(`\n✓ 已清理 ${entries.length} 个快照`)
