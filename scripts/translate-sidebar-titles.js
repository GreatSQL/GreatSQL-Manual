#!/usr/bin/env node
/**
 * 将 .vuepress/configs/sidebar-zh.js 中的中文侧边栏标题翻译为英文，
 * 生成 .vuepress/configs/sidebar-en.js（结构、路径、注释保持不变，仅替换 title）。
 *
 * 用法：node scripts/translate-sidebar-titles.js
 *
 * 维护说明：
 *  - 中文侧边栏新增/修改标题时，先在此映射表中补充/调整英文译法，再运行本脚本重新生成。
 *  - 未出现在映射表中的 title 会保留原文并打印告警，便于人工补齐。
 */

const fs = require('fs')
const path = require('path')

const ZH = path.resolve(__dirname, '../.vuepress/configs/sidebar-zh.js')
const EN = path.resolve(__dirname, '../.vuepress/configs/sidebar-en.js')

// ========== 标题翻译映射（中文 -> 英文，共享模块，单一事实来源） ==========
const { TITLES } = require('./zh-en-titles.js')
// ========== 执行替换 ==========
const src = fs.readFileSync(ZH, 'utf8')
const lines = src.split('\n')
let replaced = 0
let untouched = 0
const warnings = new Set()

const out = lines.map((line) => {
  // 匹配 title: 'xxx' 或 'title': 'xxx'（带或不带引号的 key），
  // 兼容同行携带 path 的形式（如 {title: 'sysbench测试', path: '/10-optimize/3-1-benchmark-sysbench'}）
  const m = line.match(/(["']?title["']?:\s*["'])([^"']+)(["'])(.*)$/)
  if (!m) return line
  const zhTitle = m[2]
  const enTitle = TITLES[zhTitle]
  if (!enTitle) {
    // 纯 ASCII 标题（版本号、pt-* 工具名等）无需翻译，保留原文且不告警
    if (!/\u4e00-\u9fff/.test(zhTitle)) return line
    untouched++
    if (!warnings.has(zhTitle)) warnings.add(zhTitle)
    return line
  }
  replaced++
  // 保留匹配点之前的缩进/前缀，以及 title 后的其余内容（, path: ... 等）
  return line.slice(0, m.index) + m[1] + enTitle + m[3] + m[4]
})

const header =
  '// 英文侧边栏（由 scripts/translate-sidebar-titles.js 从 sidebar-zh.js 自动生成，\n' +
  '// 结构与中文版完全一致，仅标题为英文译法；内部路径均带 /en/ 前缀（英文 locale 根））\n'

// 内部路径加上 /en/ 前缀（路径: '/xxx' 或 //path: '/xxx'，不含外链 http）
let prefixed = out.join('\n').replace(
  /(["']?path["']?:\s*["'])(\/[^"']*)/g,
  (m, g1, g2) => (g2.startsWith('/en/') ? m : g1 + '/en' + g2)
)
// 纯字符串侧边栏条目（children 中的裸路径字符串）同样加前缀
prefixed = prefixed.replace(
  /(["'])(\/[^"']+)(["'])(,?)$/gm,
  (m, g1, g2, g3, g4) => (g2.startsWith('/en/') ? m : g1 + '/en' + g2 + g3 + g4)
)

fs.writeFileSync(EN, header + prefixed + '\n')

console.log(`replaced: ${replaced}, unchanged: ${untouched}`)
if (warnings.size) {
  console.log('未翻译（保留原文）的标题：')
  ;[...warnings].forEach((w) => console.log('  - ' + w))
}
