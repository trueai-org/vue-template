#!/usr/bin/env node
/**
 * 干净构建脚本：安装依赖 -> 生产构建（含类型检查）。
 * 幂等、可重现，用于每日 CI 与本地复现。
 *
 * 用法：node scripts/build.mjs
 */
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const run = (msg, cmd) => {
  console.log(`\n▶ ${msg}`)
  execSync(cmd, { stdio: 'inherit' })
}

// 首次无 lock 文件时生成，之后用 frozen-lockfile 保证可重现
const installCmd = existsSync('pnpm-lock.yaml')
  ? 'pnpm install --frozen-lockfile'
  : 'pnpm install'

run('安装依赖', installCmd)
run('生产构建（含类型检查）', 'pnpm build')

console.log('\n✓ 构建完成')