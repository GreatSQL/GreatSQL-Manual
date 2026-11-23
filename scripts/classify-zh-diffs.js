#!/usr/bin/env node
/**
 * 中英文档差异分类脚本（8.4.4-4 英文版移植专用）
 *
 * 对比本仓库（8.4.4-4）与参考仓库（~/gitee/8.4.4-5）的中文 md 文件，
 * 按真实内容差异（LC_ALL=C diff -w，忽略空白）将每个文件分类，输出到
 * docs/zh-diff-classification.md，作为后续「en/ 复制 + diff 驱动修补」步骤
 * （Step 4 ~ Step 12）的执行驱动清单。
 *
 * 分类规则：
 *   [identical]       字节完全相同                → copy-as-is，en 直接复制
 *   [formatting-only] 仅空白/排版差异（diff -w 无输出）→ copy-as-is，en 直接复制
 *   [small-patch]     diff -w 真实差异 ≤ 10 行      → patch，多为版本号/错别字，en 抽查即可
 *   [medium-patch]     diff -w 真实差异 11~50 行    → patch，按 diff 修补 en
 *   [large-patch]      diff -w 真实差异 > 50 行     → patch，重点修补 en
 *   [new-translate]   仅 8.4.4-4 有（8.4.4-5 无同名）→ 需新译 en
 *   [skip-8445-only]  仅 8.4.4-5 有（8.4.4-4 无同名）→ Out of scope，跳过
 *
 * 内容基准 = 本仓库（8.4.4-4）中文文件。脚本幂等，可重复运行。
 *
 * 用法：
 *   node scripts/classify-zh-diffs.js          # 全量分类，写入 docs/zh-diff-classification.md
 *   node scripts/classify-zh-diffs.js 6-oper-guide   # 仅分类指定目录（调试用，仍写全量文件）
 */

const fs = require('fs')
const path = require('path')
const os = require('os')
const { execFileSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..')
const REF = path.join(os.homedir(), 'gitee/8.4.4-5') // 参考仓库（8.4.4-5）
const OUT = path.join(ROOT, 'docs', 'zh-diff-classification.md')

// 参考仓库必须存在：若缺失，所有文件会被静默误分类为 new-translate，
// 输出误导性的全量新译清单，必须在入口处显式失败，避免下游误操作。
if (!fs.existsSync(REF)) {
  console.error(`[ERROR] 参考仓库（8.4.4-5）不存在: ${REF}`)
  console.error('请先克隆 8.4.4-5 仓库到该路径，或修改脚本顶部 REF 变量指向正确位置。')
  process.exit(1)
}

// 14 个中文章节目录（与 en/ 镜像对齐）
const CHAPTERS = [
  '1-docs-intro', '2-about-greatsql', '3-quick-start', '4-install-guide',
  '5-enhance', '6-oper-guide', '7-migrate-and-upgrade', '8-mgr', '9-ha',
  '10-optimize', '11-faq', '12-dev-guide', '13-reference', '14-greatsql-demo',
]

/** 收集目录下全部 md 文件（相对 base 的路径，排序） */
function collectMd(dir, base) {
  if (!fs.existsSync(dir)) return []
  const files = []
  ;(function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.md')) files.push(path.relative(base, full).replace(/\\/g, '/'))
    }
  })(dir)
  return files.sort()
}

/** 用 LC_ALL=C diff -w 比较两文件，返回真实差异行数（diff 总输出行数，含上下文/块头）
 * 空输出（0 行）→ 仅排版差异；阈值：≤10 小差异、11~50 中差异、>50 大差异 */
function realDiffLines(zhFile, refFile) {
  let out = ''
  try {
    out = execFileSync('diff', ['-w', refFile, zhFile], {
      env: { ...process.env, LC_ALL: 'C' },
      encoding: 'utf8',
    })
  } catch (e) {
    // diff 退出码 1 = 有差异；2 = 出错
    if (e.status === 1) out = String(e.stdout || '')
    else throw e
  }
  if (out.trim() === '') return 0
  // 总输出行数（含上下文与 @@ 块头）——与调研口径一致（8.4.4-5 zh 做过中英文空格格式化，
  // 上下文行多；仅数 < > 行会低估差异规模）
  return out.split('\n').length
}

/** 分类单个文件 */
function classify(rel) {
  const zhFile = path.join(ROOT, rel)
  const refFile = path.join(REF, rel)
  if (!fs.existsSync(refFile)) return 'new-translate' // 8.4.4-5 无同名 → 新译
  // 字节完全相同
  if (fs.readFileSync(zhFile).equals(fs.readFileSync(refFile))) return 'identical'
  // 忽略空白后相同 → 仅排版差异
  const n = realDiffLines(zhFile, refFile)
  if (n === 0) return 'formatting-only'
  if (n <= 10) return 'small-patch'
  if (n <= 50) return 'medium-patch'
  return 'large-patch'
}

// ========== 收集文件 ==========
let files = []
for (const ch of CHAPTERS) files = files.concat(collectMd(path.join(ROOT, ch), ROOT))
// 根 README.md（中文根页）一并参与分类
if (fs.existsSync(path.join(ROOT, 'README.md'))) files.push('README.md')

// 8.4.4-5 独有文件（Out of scope，跳过）
const refOnly = []
for (const ch of CHAPTERS) {
  for (const rel of collectMd(path.join(REF, ch), REF)) {
    if (!fs.existsSync(path.join(ROOT, rel))) refOnly.push(rel)
  }
}
refOnly.sort()

// ========== 分类 ==========
const groups = {
  identical: [], 'formatting-only': [], 'small-patch': [],
  'medium-patch': [], 'large-patch': [], 'new-translate': [],
}
for (const rel of files) groups[classify(rel)].push(rel)

// 8.4.4-5 独有文件（Out of scope，跳过）归入分组
groups['skip-8445-only'] = refOnly

// 可选目录过滤（调试用）：只保留指定目录前缀
const filterArg = process.argv[2]
if (filterArg) {
  for (const g of Object.keys(groups)) {
    groups[g] = groups[g].filter((rel) => rel.startsWith(filterArg + '/') || rel === filterArg)
  }
}

// ========== 输出 markdown 报告 ==========
const CATEGORY_META = {
  identical:        { name: '相同（copy-as-is）',            desc: '字节完全相同，en 直接复制，零改动' },
  'formatting-only':{ name: '仅排版差异（copy-as-is）',      desc: '8.4.4-5 做过「中英文间空格格式化」，diff -w 无差异，en 直接复制，零改动' },
  'small-patch':    { name: '小差异（patch，≤10 行）',       desc: '多为版本号（8.4.4-5→8.4.4-4）/错别字修复，英文译文不受影响，抽查核验即可' },
  'medium-patch':   { name: '中差异（patch，11~50 行）',      desc: '内容有小幅增删/改写，需对照 diff 修补 en（Step 8/9）' },
  'large-patch':    { name: '大差异（patch，>50 行）',        desc: '多 OS 安装命令、引擎特性、迁移等，重点修补 en（Step 10/11/12）' },
  'new-translate':  { name: '需新译（new-translate）',        desc: '8.4.4-4 独有文件，8.4.4-5/en 无对应译文，全文新译（Step 13）' },
  'skip-8445-only': { name: '8.4.4-5 独有（跳过）',           desc: 'Out of scope：8.4.4-5 新增特性/发行说明，不纳入本仓库' },
}
const ORDER = ['identical', 'formatting-only', 'small-patch', 'medium-patch', 'large-patch', 'new-translate', 'skip-8445-only']

const lines = []
lines.push('# 8.4.4-4 中文文件差异分类清单（zh-diff-classification）')
lines.push('')
lines.push('> 生成：`node scripts/classify-zh-diffs.js`（幂等，可重复运行）')
lines.push(`> 对比基准：本仓库（8.4.4-4，内容唯一基准） vs 参考仓库（${REF.replace(os.homedir(), '~')}）`)
lines.push('> 分类方法：`LC_ALL=C diff -w`（忽略空白）；`<` 行 = 8.4.4-5 独有（en 需删除对应译文），`>` 行 = 8.4.4-4 独有（en 需补译）')
lines.push('')
lines.push('## 一、汇总')
lines.push('')
lines.push('| 类别 | 数量 | 处理方式 |')
lines.push('|---|---|---|')
for (const g of ORDER) {
  lines.push(`| ${CATEGORY_META[g].name} | **${groups[g].length}** | ${CATEGORY_META[g].desc} |`)
}
const copyCount = groups.identical.length + groups['formatting-only'].length
const patchCount = groups['small-patch'].length + groups['medium-patch'].length + groups['large-patch'].length
lines.push(`| **合计** | **${files.length}** | copy-as-is ${copyCount} + patch ${patchCount} + new-translate ${groups['new-translate'].length} |`)
lines.push('')
lines.push('## 二、分类明细')
lines.push('')
for (const g of ORDER) {
  lines.push(`### ${g}（${groups[g].length}）`)
  lines.push('')
  if (groups[g].length === 0) {
    lines.push('（无）')
    lines.push('')
    continue
  }
  for (const rel of groups[g]) lines.push(`- \`${rel}\``)
  lines.push('')
}
lines.push('## 三、说明')
lines.push('')
lines.push('- 内容基准 = 本仓库（8.4.4-4）中文文件；8.4.4-5/en 译文仅在「与 8.4.4-4 中文一致」的前提下复用；')
lines.push('- copy-as-is 两类：en 从 8.4.4-5/en 按同名路径直接复制；')
lines.push('- patch 三类：以 `diff -w 8.4.4-5/zh 8.4.4-4/zh` 为输入逐文件修补 en（`>` 行补译、`<` 行删除、改动行改写）；')
lines.push('- new-translate：`6-oper-guide/11-gt-checksum.md` 全文新译（Step 13）；')
lines.push('- skip-8445-only：6 个 8.4.4-5 新增特性/发行说明文件，不纳入本仓库（Out of scope）。')
lines.push('')

fs.writeFileSync(OUT, lines.join('\n'))
console.log(`classification written: ${OUT}`)
console.log(`total md: ${files.length}  (copy-as-is ${copyCount} + patch ${patchCount} + new-translate ${groups['new-translate'].length})`)
for (const g of ORDER) {
  console.log(`  ${g.padEnd(16)} ${String(groups[g].length).padStart(3)}`)
}
if (refOnly.length) {
  console.log(`skip-8445-only files: ${refOnly.join(', ')}`)
}
