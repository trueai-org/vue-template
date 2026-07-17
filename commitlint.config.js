// https://commitlint.js.org/reference/configuration.html
// 规则集：@commitlint/config-conventional（Conventional Commits 规范）
// 格式：<type>(<scope>): <description>
// type 可选值见下方枚举
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // type 枚举：在 conventional 基础上补充 中文项目常用的 type
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复 bug
        'docs', // 文档变更
        'style', // 代码格式（不影响功能）
        'refactor', // 重构（非 feat / fix）
        'perf', // 性能优化
        'test', // 测试
        'build', // 构建系统或外部依赖变更
        'ci', // CI 配置
        'chore', // 杂项（不修改 src 或 test）
        'revert', // 回滚
      ],
    ],
    // header 最大长度
    'header-max-length': [2, 'always', 120],
  },
}
