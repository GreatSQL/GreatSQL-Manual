#!/usr/bin/env node
/**
 * en/ 内部链接与锚点检查（8.0.32-27 英文文档站验收工具，Phase C Step 22 复用）。
 *
 * 检查项：
 * 1. 相对链接目标文件是否存在（断链）；
 * 2. 站内 # 锚点链接目标标题是否存在（锚点失效）；
 * 3. 指向 8.4.4-5 独有文件（本版本不存在的 9 个文件）的链接；
 * 4. 绝对内部链接跨语言检查（en/ 内绝对链接必须指向 /en/ 或 /，否则会跳到中文页）。
 *
 * 用法：
 *   node scripts/check-links.js            # 全站检查 en/
 *
 * 说明（VuePress 1.9.x 锚点规则）：
 * - 英文标题 slug：小写、非词字符转 '-'、标题内反引号（代码标记）移除；
 * - 数字开头的标题 slug 自动加 '_' 前缀（构建产物实测确认，如 `## 1. xxx` → `#_1-xxx`）；
 * - 图片链接的 `#pic_center` 为 VuePress 图片居中语法，不视为锚点（跳过）。
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const EN_DIR = path.join(ROOT, 'en')

// 8.4.4-5 独有、本版本不存在的 9 个文档文件
const KNOWN_MISSING = [
  '1-docs-intro/relnotes/changes-greatsql-8444.md',
  '1-docs-intro/relnotes/changes-greatsql-8445.md',
  '14-greatsql-demo/greatsql-live-demo.md',
  '5-enhance/5-2-ha-repl-interface-cmd.md',
  '5-enhance/5-1-highperf-parallel-replica.md',
  '5-enhance/5-1-highperf-binlog-flush-opt-large-trx.md',
  '5-enhance/5-1-highperf-execplan-baseline.md',
  '5-enhance/5-1-highperf-vector-search.md',
  '10-optimize/3-7-benchmark-greatsql-vs-mysql-tpcc-wh1000-report.md',
]

/** VuePress 1.x slugify（数字开头加 '_' 前缀、移除标题内反引号） */
function slugify(h) {
  let s = h.trim().replace(/`/g, '')
  s = s.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/-+/g, '-')
  if (/^[0-9]/.test(s)) s = '_' + s
  return s
}

function collectHeadings(file) {
  const set = new Set()
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^#{1,4}\s+(.*)/)
    if (m) set.add(slugify(m[1]))
  }
  return set
}

const files = []
;(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name)
    if (e.isDirectory()) walk(f)
    else if (e.name.endsWith('.md')) files.push(f)
  }
})(EN_DIR)

let broken = 0
let missingAnchor = 0
let checked = 0
let anchors = 0

for (const file of files) {
  const rel = path.relative(EN_DIR, file).replace(/\\/g, '/')
  const dir = path.dirname(file)
  const content = fs.readFileSync(file, 'utf8')
  const re = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
  let m
  while ((m = re.exec(content))) {
    let target = m[1]
    if (/^(https?:|mailto:|#|\/)/.test(target)) continue
    // 图片（含 #pic_center 居中语法）：先切锚点再判扩展名，避免 `xxx.png#pic_center` 被误判为锚点失效
    const hi = target.indexOf('#')
    if (/\.(png|jpg|jpeg|gif|webp)$/i.test(target.slice(0, hi >= 0 ? hi : undefined))) continue
    let anchor = ''
    if (hi >= 0) { anchor = target.slice(hi + 1); target = target.slice(0, hi) }
    if (!target) continue
    if (target.startsWith('.')) {
      checked++
      const abs = path.resolve(dir, target)
      if (!fs.existsSync(abs)) {
        broken++
        console.log(`BROKEN LINK: ${rel} -> ${target}`)
        continue
      }
      if (anchor) {
        anchors++
        let dec
        try { dec = decodeURIComponent(anchor) } catch (e) { dec = anchor }
        if (!collectHeadings(abs).has(slugify(dec))) {
          missingAnchor++
          console.log(`ANCHOR MISS: ${rel} -> ${target}#${anchor}`)
        }
      }
    }
  }
}

// 指向 8.4.4-5 独有文件的链接
for (const file of files) {
  const rel = path.relative(EN_DIR, file).replace(/\\/g, '/')
  const content = fs.readFileSync(file, 'utf8')
  for (const km of KNOWN_MISSING) {
    if (content.includes(km)) {
      console.log(`KNOWN-8444 LINK: ${rel} -> ${km}`)
      broken++
    }
  }
}

// 绝对内部链接跨语言检查：en/ 内的绝对链接必须指向 /en/（英文站）或 /（中文首页，
// 仅 en/README.md 的「Chinese edition」链接使用）；其余 /xxx 绝对链接会跳到中文页，
// 视为跨语言错误链接（如 /6-oper-guide/11-gt-checksum.md 缺 /en/ 前缀）。
for (const file of files) {
  const rel = path.relative(EN_DIR, file).replace(/\\/g, '/')
  const content = fs.readFileSync(file, 'utf8')
  const absRe = /\[[^\]]*\]\((\/[^)\s]+)(?:\s+"[^"]*")?\)/g
  let m
  while ((m = absRe.exec(content))) {
    const target = m[1]
    if (target.startsWith('/en/') || target === '/') continue
    if (/\.(png|jpg|jpeg|gif|webp)$/i.test(target)) continue
    broken++
    console.log(`CROSS-LOCALE LINK: ${rel} -> ${target}`)
  }
}

console.log('----------------------------------------')
console.log(`links checked: ${checked}, broken: ${broken}`)
console.log(`anchors checked: ${anchors}, missing: ${missingAnchor}`)
