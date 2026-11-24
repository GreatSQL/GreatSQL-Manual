#!/usr/bin/env node
/**
 * 翻译完整性校验：统计 en/ 下 md 文件正文的残留中文字符数。
 * 剔除围栏代码块、行内代码与 URL（按翻译保护规则「URL 不译」，
 * URL 内中文锚点亦不计入）后统计 CJK 字符（\u4e00-\u9fa5），作为每个
 * 翻译批次（Phase 2 Step 3~33）的验收工具：某批文件残留中文应为 0。
 *
 * 用法：
 *   node scripts/check-translation.js                    # 全站扫描 en/
 *   node scripts/check-translation.js 9-ha               # 按章节目录过滤（en/9-ha）
 *   node scripts/check-translation.js 5-enhance/sql-compat  # 按子目录过滤
 *   node scripts/check-translation.js en/9-ha/0-ha.md    # 单文件
 *   node scripts/check-translation.js 9-ha/0-ha.md       # 单文件（省略 en/ 前缀）
 *   node scripts/check-translation.js --codeblocks       # 代码块内 CJK 统计（正文盲区补充）
 *
 * 输出：每文件残留 CJK 数（>0 才列出）+ 汇总统计。
 *
 * 说明（校验盲区）：主统计跳过代码块，无法发现代码块内中文注释被翻译/删除；
 * 翻译规则已明确「代码块内注释文字可译、代码/命令/数据不译」，因此代码块内的
 * CJK 应为测试数据/字符串值（如 SELECT '测试'），不应是注释。--codeblocks 模式
 * 单独列出代码块内 CJK 行供人工复核（注释残留或数据误删均可暴露）。
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const EN_DIR = path.join(ROOT, 'en')
const CJK_RE = /[\u4e00-\u9fa5]/g

/** 统计单文件正文残留 CJK 字符数（剔除围栏代码块与行内代码） */
function countCJK(file) {
  let content = fs.readFileSync(file, 'utf8')
  // 剔除围栏代码块（``` 或 ~~~，含语言标识）
  content = content.replace(/```[\s\S]*?```/g, '')
  content = content.replace(/~~~[\s\S]*?~~~/g, '')
  // 剔除行内代码 `...`
  content = content.replace(/`[^`\n]*`/g, '')
  // 剔除 markdown 链接的 URL 部分 [text](url)（URL 不译，含中文锚点亦不统计）
  content = content.replace(/\[[^\]]*\]\(([^)\s]+)\)/g, (m, url) => m.replace(url, ''))
  // 剔除裸 URL
  content = content.replace(/https?:\/\/[^\s<)]+/g, '')
  const m = content.match(CJK_RE)
  return m ? m.length : 0
}

function collectFiles(target) {
  if (!fs.existsSync(target)) {
    console.error(`path not found: ${target}`)
    process.exit(1)
  }
  const stat = fs.statSync(target)
  if (stat.isFile()) return [target]
  const files = []
  ;(function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.md')) files.push(full)
    }
  })(target)
  return files.sort()
}

// ========== 解析过滤参数 ==========
const args = process.argv.slice(2)
const codeblocksMode = args.includes('--codeblocks')
const pathArg = args.filter((a) => !a.startsWith('--'))[0]
let scanTarget
if (!pathArg) {
  scanTarget = EN_DIR
} else {
  const normalized = pathArg.replace(/\\/g, '/').replace(/^\.\//, '')
  if (normalized.endsWith('.md')) {
    // 单文件：接受 en/xxx.md 或 xxx.md 两种写法
    scanTarget = normalized.startsWith('en/')
      ? path.join(ROOT, normalized)
      : path.join(EN_DIR, normalized)
  } else {
    // 目录：接受 en/9-ha 或 9-ha 两种写法
    scanTarget = normalized.startsWith('en/')
      ? path.join(ROOT, normalized)
      : path.join(EN_DIR, normalized)
  }
}

const files = collectFiles(scanTarget)
const results = []
let total = 0

// ========== --codeblocks 模式：统计代码块内 CJK（区分注释行与数据行） ==========
if (codeblocksMode) {
  let cbFiles = 0
  let commentLines = 0
  let dataLines = 0
  for (const file of files) {
    const lines = fs.readFileSync(file, 'utf8').split('\n')
    let inBlock = false
    let fileCJK = 0
    let fileComments = 0
    for (const line of lines) {
      const t = line.trim()
      if (/^```|^~~~/.test(t)) { inBlock = !inBlock; continue }
      if (!inBlock || !CJK_RE.test(line)) continue
      fileCJK += (line.match(CJK_RE) || []).length
      if (/^(--|#|\/\*|\*)\s*[\u4e00-\u9fa5]|(--|#|\/\*|\*\/)\s+[\u4e00-\u9fa5]/.test(t)) {
        fileComments++
        console.log(`${String(fileComments).padStart(4)}  ${path.relative(ROOT, file).replace(/\\/g, '/')}:${lines.indexOf(line) + 1}  ${t.slice(0, 110)}`)
      } else {
        dataLines++
      }
    }
    if (fileCJK > 0) cbFiles++
    commentLines += fileComments
  }
  console.log('----------------------------------------')
  console.log(`codeblocks mode: files with in-block CJK: ${cbFiles}, comment-like lines: ${commentLines} (should be 0), data lines: ${dataLines}`)
  console.log('comment-like lines = 残留中文注释；data lines = 测试数据/字符串值（允许保留）')
  process.exit(0)
}

for (const file of files) {
  const count = countCJK(file)
  total += count
  if (count > 0) {
    results.push({ rel: path.relative(ROOT, file).replace(/\\/g, '/'), count })
  }
}
// 按残留数降序输出
results.sort((a, b) => b.count - a.count)
results.forEach((r) => console.log(`${String(r.count).padStart(4)}  ${r.rel}`))

console.log('----------------------------------------')
console.log(`files scanned: ${files.length}, files with CJK residue: ${results.length}, total CJK chars: ${total}`)
