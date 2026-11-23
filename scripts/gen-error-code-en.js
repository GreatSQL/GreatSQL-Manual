#!/usr/bin/env node
/**
 * Step 33（Phase 2 全量翻译）：脚本化生成英文错误码对照表。
 *
 * 中文源文件 12-dev-guide/12-8-1-error-code-reference.md（11,229 行 / 1,454 个
 * 错误码条目）为 MySQL 官方 Server Error Message Reference 的中文翻译，内容
 * 高度模板化（错误号/符号/SQLSTATE/中文描述），不人工逐条翻译。本脚本：
 *
 *   1. 解析中文源文件条目（错误号/符号/SQLSTATE/报错信息格式）；
 *   2. 以 MySQL 官方英文文档（https://dev.mysql.com/doc/mysql-errors/8.0/en/
 *      server-error-reference.html，符号 ER_xxx 对应条目）替换英文描述：
 *      - Message 行：官方英文错误消息模板（与 errmsg-utf8.txt eng 文本同源）；
 *      - 说明段落：官方英文说明（HTML 转 Markdown，代码块/列表原样保留）；
 *   3. 输出 en/12-dev-guide/12-8-1-error-code-reference.md，保持中文文件的
 *      markdown 结构（H1/H2 分组、条目、</br> 分隔、尾部公众号图片）。
 *
 * 用法：
 *   node scripts/gen-error-code-en.js                        # 自动获取官方 HTML（缓存优先，缺失则联网下载）
 *   node scripts/gen-error-code-en.js --html <path>          # 使用本地官方 HTML（离线可用）
 *   node scripts/gen-error-code-en.js --offline              # 仅用缓存，不联网
 *
 * 幂等性：重复运行覆盖输出文件，结果一致（官方 HTML 版本固定为 MySQL 8.0）。
 */

const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')

const ROOT = path.resolve(__dirname, '..')
const ZH_FILE = path.join(ROOT, '12-dev-guide/12-8-1-error-code-reference.md')
const EN_FILE = path.join(ROOT, 'en/12-dev-guide/12-8-1-error-code-reference.md')

const OFFICIAL_URL =
  'https://dev.mysql.com/doc/mysql-errors/8.0/en/server-error-reference.html'
const CACHE_DIR = '/tmp/greatsql-en-err-cache'
const CACHE_FILE = path.join(CACHE_DIR, 'server-error-reference-8.0.html')

// ========== 1. 获取官方 HTML ==========

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https:') ? https : http
    mod
      .get(url, { headers: { 'User-Agent': 'greatsql-docs-gen-error-code/1.0' } }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`))
          return
        }
        const chunks = []
        res.on('data', (c) => chunks.push(c))
        res.on('end', () => {
          const buf = Buffer.concat(chunks)
          fs.writeFileSync(dest, buf)
          resolve(buf)
        })
      })
      .on('error', reject)
  })
}

function unescapeHtml(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&minus;/g, '−')
    .replace(/&nbsp;/g, ' ')
}

// ========== 2. 解析官方 HTML ==========

/** 解析官方 HTML 条目（<li class="listitem">…</li>）→ Map<symbol, {num, sqlstate, msg, descHtml}> */
function parseOfficialHtml(html) {
  const entries = new Map()
  const liRe = /<li class="listitem">([\s\S]*?)<\/li>/g
  let m
  while ((m = liRe.exec(html)) !== null) {
    const it = m[1]
    const numM = it.match(/Error number:\s*<code class="literal">(\d+)<\/code>/)
    const symM = it.match(/Symbol:\s*.*?<code class="literal">([A-Z0-9_]+)<\/code>/)
    const stM = it.match(/SQLSTATE:\s*(?:<code class="literal">)?([A-Z0-9]+)/)
    const msgM = it.match(/Message:\s*([\s\S]*?)<\/p>/)
    if (!numM || !symM) continue
    const sym = symM[1]
    const msg = msgM
      ? unescapeHtml(msgM[1].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim()
      : ''
    // 说明段落：去掉头部 "Error number…" 与 "Message…" 两个 <p> 块
    const msgEnd = msgM ? msgM.index + msgM[0].length : 0
    const descHtml = it.slice(msgEnd)
    entries.set(sym, { num: numM[1], sqlstate: stM ? stM[1] : '', msg, descHtml })
  }
  return entries
}

// ========== 3. 官方说明段落 HTML → Markdown ==========

/** 官方说明段落 HTML 转 Markdown（保留 <pre> 代码块与列表项） */
function htmlToMd(html) {
  const pres = []
  // 提取 <pre> 代码块
  html = html.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/g, (whole, inner) => {
    let code = unescapeHtml(inner.replace(/<[^>]+>/g, ''))
    const lines = code.split('\n').map((l) => l.replace(/\s+$/, ''))
    while (lines.length && !lines[0].trim()) lines.shift()
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop()
    code = lines.join('\n')
    const langM = whole.match(/language-([a-z0-9]+)/)
    const lang = langM ? langM[1] : ''
    pres.push({ lang, code })
    return '\u0000PRE' + (pres.length - 1) + '\u0000'
  })
  // 列表项
  html = html.replace(/<li[^>]*>\s*<p>/g, '\n- ')
  html = html.replace(/<li[^>]*>/g, '\n- ')
  html = html.replace(/<\/li>/g, '')
  // 块级分隔
  html = html.replace(/<\/p>/g, '\n\n')
  html = html.replace(/<\/(?:div|ul|ol|blockquote)>/g, '\n')
  html = html.replace(/<br\s*\/?>/g, '\n')
  // 剥离剩余标签
  let text = unescapeHtml(html.replace(/<[^>]+>/g, ''))
  // 空白折叠：连续空格→单空格；段落内单换行→空格；空行保留为段落分隔
  text = text.replace(/[ \t]+/g, ' ')
  text = text.replace(/ ?\n ?/g, '\n')
  text = text.replace(/\n- \s*\n/g, '\n- ')
  text = text.replace(/(?<!\n)\n(?!\n)/g, ' ')
  // 恢复代码块
  pres.forEach((p, i) => {
    const fence = '```' + p.lang
    text = text.replace('\u0000PRE' + i + '\u0000', '\n' + fence + '\n' + p.code + '\n```')
  })
  // 组装：去掉空行，代码块围栏前补空行
  const out = text
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''))
    .filter((l) => l.trim())
  const res = []
  out.forEach((l, i) => {
    if (l.startsWith('```') && i > 0) res.push('')
    res.push(l)
  })
  return res.join('\n').trim()
}

// ========== 4. 解析中文源文件 ==========

/** 解析中文源文件 → 条目数组（保持原始顺序）：{num, sym, sqlstate, hasMsg} */
function parseZhFile(content) {
  const entries = []
  const lineRe = /^- 错误号：(\d+); 符号： ([A-Z0-9_]+); SQLSTATE[：:]\s*([A-Z0-9]+)/
  for (const line of content.split('\n')) {
    const m = line.match(lineRe)
    if (m) entries.push({ num: m[1], sym: m[2], sqlstate: m[3], hasMsg: false })
    else if (line.startsWith('报错信息格式') && entries.length) {
      entries[entries.length - 1].hasMsg = true
    }
  }
  return entries
}

// ========== 5. 生成英文 Markdown ==========

function generate(en, zhContent) {
  const out = []
  let curEntry = false // 当前是否处于条目处理（条目行→true，条目后的 </br> 行→false，其余行不变）
  for (const line of zhContent.split('\n')) {
    if (/^# /.test(line)) {
      curEntry = false
      out.push('# Common Error Code Reference')
      continue
    }
    const h2 = line.match(/^## 错误号 (\d+)~(\d+)/)
    if (h2) {
      curEntry = false
      out.push(`## Error Numbers ${h2[1]}~${h2[2]}`)
      continue
    }
    if (line.includes('本节介绍')) {
      curEntry = false
      out.push('This section introduces the common error codes reported by GreatSQL.')
      continue
    }
    if (line.includes('扫码关注')) {
      curEntry = false
      out.push('**Scan the QR code to follow the GreatSQL WeChat official account**')
      continue
    }
    if (line.startsWith('![')) {
      curEntry = false
      out.push(line)
      continue
    }
    const m = line.match(/^- 错误号：(\d+); 符号： ([A-Z0-9_]+); SQLSTATE[：:]\s*([A-Z0-9]+)/)
    if (m) {
      const e = en.get(m[2])
      if (!e) {
        console.error(`[warn] official entry not found for symbol ${m[2]}, keep zh line`)
        out.push(line)
        continue
      }
      curEntry = true
      out.push(`- Error number: ${m[1]}; Symbol: ${m[2]}; SQLSTATE: ${m[3]}`)
      out.push('')
      out.push(`Message: ${e.msg}`)
      const desc = htmlToMd(e.descHtml)
      if (desc) {
        out.push('')
        out.push(desc)
      }
      out.push('')
      out.push('</br>')
      continue
    }
    // 孤立 </br>（H2 分组前后）：条目处理中已输出 </br>，此处跳过避免重复
    if (line.trim() === '</br>') {
      if (!curEntry) out.push('</br>')
      curEntry = false
      continue
    }
    // 其余行（条目中文说明/空行等）跳过：说明段落由官方英文替换，curEntry 保持不变
  }
  return out.join('\n') + '\n'
}

// ========== 6. 校验 ==========

/** 校验：条目数/顺序一致、残留 CJK（剔除代码块）为 0 */
function validate(enText, zhEntries) {
  const enRe = /^- Error number: (\d+); Symbol: ([A-Z0-9_]+); SQLSTATE: ([A-Z0-9]+)/gm
  const enEntries = []
  let m
  while ((m = enRe.exec(enText)) !== null) enEntries.push(m)
  const problems = []
  if (enEntries.length !== zhEntries.length) {
    problems.push(
      `entry count mismatch: zh=${zhEntries.length}, en=${enEntries.length}`
    )
  }
  zhEntries.forEach((z, i) => {
    const e = enEntries[i]
    if (!e || e[2] !== z.sym || e[1] !== z.num) {
      problems.push(`order mismatch at #${i}: zh=${z.sym}, en=${e ? e[2] : '?'}`)
    }
  })
  // 残留中文（剔除代码块）
  const body = enText.replace(/```[\s\S]*?```/g, '')
  const cjk = (body.match(/[\u4e00-\u9fa5]/g) || []).length
  console.log(`validated: ${enEntries.length} entries (zh ${zhEntries.length}), CJK residue: ${cjk}`)
  if (cjk > 0) problems.push(`CJK residue: ${cjk}`)
  return problems
}

// ========== 主流程 ==========

async function main() {
  const args = process.argv.slice(2)
  const htmlArgIdx = args.indexOf('--html')
  const offline = args.includes('--offline')
  let officialHtml

  if (htmlArgIdx !== -1 && args[htmlArgIdx + 1]) {
    // 用户指定本地官方 HTML
    const p = args[htmlArgIdx + 1]
    if (!fs.existsSync(p)) {
      console.error(`[error] official HTML not found: ${p}`)
      process.exit(1)
    }
    officialHtml = fs.readFileSync(p, 'utf8')
    console.log(`[info] using official HTML: ${p}`)
  } else {
    // 缓存优先，缺失则联网下载
    if (fs.existsSync(CACHE_FILE)) {
      officialHtml = fs.readFileSync(CACHE_FILE, 'utf8')
      console.log(`[info] using cached official HTML: ${CACHE_FILE}`)
    } else if (offline) {
      console.error(
        `[error] offline mode but cache missing: ${CACHE_FILE}\n` +
          '       run once online, or pass --html <official-html-path>'
      )
      process.exit(1)
    } else {
      console.log(`[info] downloading official HTML: ${OFFICIAL_URL}`)
      try {
        fs.mkdirSync(CACHE_DIR, { recursive: true })
        await download(OFFICIAL_URL, CACHE_FILE)
        officialHtml = fs.readFileSync(CACHE_FILE, 'utf8')
      } catch (e) {
        console.error(`[error] download failed: ${e.message}`)
        console.error('       retry later, or pass --html <official-html-path>')
        process.exit(1)
      }
    }
  }

  const official = parseOfficialHtml(officialHtml)
  console.log(`[info] parsed ${official.size} official entries`)
  if (official.size < 1000) {
    console.error('[error] official HTML seems incomplete, abort')
    process.exit(1)
  }

  const zhContent = fs.readFileSync(ZH_FILE, 'utf8')
  const zhEntries = parseZhFile(zhContent)
  console.log(`[info] parsed ${zhEntries.length} zh entries`)

  // 官方覆盖检查
  const missing = zhEntries.filter((z) => !official.has(z.sym))
  if (missing.length) {
    console.error(`[error] ${missing.length} symbols missing in official doc: ${missing.slice(0, 10).map((x) => x.sym).join(', ')}`)
    process.exit(1)
  }

  const enText = generate(official, zhContent)
  fs.writeFileSync(EN_FILE, enText)
  console.log(`[info] wrote ${EN_FILE} (${enText.split('\n').length} lines)`)

  const problems = validate(enText, zhEntries)
  if (problems.length) {
    console.error('[error] validation failed:')
    problems.forEach((p) => console.error('  - ' + p))
    process.exit(1)
  }
  console.log('[done] en error-code reference generated & validated OK')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
