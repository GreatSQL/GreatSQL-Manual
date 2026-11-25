/* ============================================================
 * GreatSQL 文档站全文检索 Worker
 * 本文件由 fulltext-search-async 插件在构建时与 flexsearch.min.js
 * 拼接为 .vuepress/public/search-worker.js（本模板追加在 flexsearch 之后）。
 * 运行于 Web Worker 全局作用域（self）。
 * 逻辑移植自 vuepress-plugin-fulltext-search 的 flexsearchSvc.js，
 * 仅去掉 lodash / ES module 依赖，改为纯 JS。
 *
 * 消息协议（语言感知排序，2026-11-25 新增）：
 *   init: data 为页面数组；可携带可选 locale（'zh' | 'en'，缺省 'zh'）
 *   locale: { type: 'locale', locale } 仅更新语言标志，不重建索引（两站索引内容相同）
 *   query: 检索结果按当前 locale 稳定分区（当前语言在前）+ 按 limit 截断
 * ============================================================ */

// flexsearch.min.js 是 UMD：浏览器 Worker 中挂到 self.FlexSearch；
// Node worker_threads 中走 CommonJS 分支（module.exports 即 Flexsearch 类）。
const Flexsearch =
  (typeof FlexSearch !== 'undefined' && FlexSearch) ||
  (typeof module !== 'undefined' && typeof module.exports === 'function' && module.exports) ||
  (typeof self !== 'undefined' && self.FlexSearch) ||
  null

if (!Flexsearch) {
  self.postMessage({ type: 'error', message: 'flexsearch library failed to load in worker' })
}

/* ---------------- 常量与工具 ---------------- */

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/**
 * CJK 二元组分词器（三个检索字段统一使用）
 *
 * 为什么不用官方插件的 tokenize:'full' + split:/\s+/ 方案：
 *   该方案对无空格中文内容做“全子串”索引（O(n²)），674 页建索引约需 33 秒，
 *   索引体积膨胀到超出 JS 字符串上限；
 * 二元组（bigram）方案：
 *   - 中文段滑动生成 2 字窗口（“安装部署” -> 安装/装部/部署），
 *     检索时同样生成二元组，≥2 字的查询天然支持子串匹配；
 *   - 拉丁段按单词切分（支持 \p{L} 字母、数字、下划线，含西里尔文）；
 *   - 实测 674 页建索引约 0.6s，检索毫秒级。
 */
function cjkBigramTokenizer(str) {
  const tokens = []
  const cjkChar = /[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u30FF\uAC00-\uD7AF]/
  let cur = ''
  let curIsCjk = null
  const flush = () => {
    if (!cur) return
    if (curIsCjk) {
      for (let j = 0; j + 2 <= cur.length; j++) tokens.push(cur.substr(j, 2))
      if (cur.length === 1) tokens.push(cur)
    } else {
      const words = cur.toLowerCase().match(/[\p{L}\p{N}_]+/gu)
      if (words) for (const w of words) tokens.push(w)
    }
    cur = ''
  }
  for (const ch of String(str || '')) {
    if (/\s/.test(ch)) {
      flush()
      continue
    }
    const isCjk = cjkChar.test(ch)
    if (curIsCjk === null) {
      curIsCjk = isCjk
      cur = ch
    } else if (isCjk === curIsCjk) {
      cur += ch
    } else {
      flush()
      cur = ch
      curIsCjk = isCjk
    }
  }
  flush()
  return tokens
}

function findLastIndex(arr, predicate, fromIndex) {
  if (!arr || !arr.length) return -1
  let i = fromIndex == null ? arr.length - 1 : Math.min(fromIndex, arr.length - 1)
  if (i < 0) return -1
  for (; i >= 0; i--) {
    if (predicate(arr[i])) return i
  }
  return -1
}

/* ---------------- 索引构建 ---------------- */

let index = null
let pagesByPath = null

/* ---------------- 语言状态（语言感知重排） ---------------- */

// 当前站语言：'zh'（默认，与无前缀页面默认语言一致）或 'en'。
// 两站共用同一份索引，切语言仅改此标志、不重建索引。
let locale = 'zh'

async function buildIndex(pages, options) {
  const indexSettings = {
    encode: 'icase',
    split: /\s+/,
    async: false,
    doc: {
      id: 'key',
      field: {
        title: { tokenize: cjkBigramTokenizer, encode: false },
        headersStr: { tokenize: cjkBigramTokenizer, encode: false },
        content: { tokenize: cjkBigramTokenizer, encode: false },
      },
    },
  }

  // 为每页补充检索所需的派生字段
  pages.forEach(p => {
    // flexsearch 0.6.32 doc 模式必须提供 id 字段（此处用 path），
    // 否则 add() 静默跳过所有文档，索引为空（官方插件在 0.6.32 下检索即因此失效）
    p.key = p.path
    p.normalizedContent = normalizeText(p.content)
    p.headersStr = (p.headers || []).map(h => h.title).join(' ')
    // 防御性计算：若数据里缺失增强字段（normalizedTitle/charIndex）则在此补齐
    ;(p.headers || []).forEach(h => {
      if (typeof h.normalizedTitle !== 'string') h.normalizedTitle = normalizeText(h.title)
      if (h.charIndex == null) {
        const idx = p.content ? p.content.indexOf(h.title) : -1
        h.charIndex = idx === -1 ? null : idx
      }
    })
  })

  index = new Flexsearch(indexSettings)
  await index.add(pages)

  pagesByPath = {}
  pages.forEach(p => {
    pagesByPath[p.path] = p
  })
}

/* ---------------- 检索与结果格式化（移植自 flexsearchSvc.js） ---------------- */

async function match(queryString, queryTerms, limit) {
  const searchParams = [
    { field: 'title', query: queryString, limit, boost: 10 },
    { field: 'headersStr', query: queryString, limit, boost: 7 },
    { field: 'content', query: queryString, limit },
  ]

  const searchResult1 = await index.search(searchParams)
  const searchResult2 = []
  const searchResult3 = []

  // uniqBy(path)
  const seen = new Set()
  const merged = []
  for (const item of [...searchResult1, ...searchResult2, ...searchResult3]) {
    if (item && item.path && !seen.has(item.path)) {
      seen.add(item.path)
      merged.push(item)
    }
  }

  // ---- 语言感知重排（稳定分区 + 截断） ----
  // localeMatch：唯一判断口径，仅依赖 path 前缀（/en/ 前缀归英文，其余归中文）
  const localeMatch = p => (locale === 'en' ? p.path.startsWith('/en/') : !p.path.startsWith('/en/'))
  // 稳定分区：当前语言结果保持原相关度顺序在前，另一语言结果在后；不增删结果
  const reordered = [...merged.filter(localeMatch), ...merged.filter(p => !localeMatch(p))]
  // 按 limit 截断：同语言优先填满，不足由异语言按原顺序补齐
  const truncated = reordered.slice(0, limit)

  const result = truncated.map(page => ({
    ...page,
    parentPageTitle: getParentPageTitle(page),
    ...getAdditionalInfo(page, normalizeString(queryString), queryTerms),
  }))

  // groupBy(parentPageTitle)：每组首个保留父标题，其余置空
  const byParent = {}
  for (const item of result) {
    const key = item.parentPageTitle
    if (!byParent[key]) byParent[key] = []
    byParent[key].push(item)
  }
  const grouped = []
  for (const arr of Object.values(byParent)) {
    arr.forEach((x, i) => {
      grouped.push(i === 0 ? x : { ...x, parentPageTitle: null })
    })
  }
  return grouped
}

function getParentPageTitle(page) {
  const pathParts = page.path.split('/')
  let parentPagePath = '/'
  if (pathParts[1]) parentPagePath = '/' + pathParts[1] + '/'

  const parentPage = pagesByPath[parentPagePath] || page
  return parentPage.title
}

function getAdditionalInfo(page, queryString, queryTerms) {
  const query = queryString.toLowerCase()
  const match = getMatch(page, query, queryTerms)
  if (!match) {
    return {
      ...getFullHeading(page),
      slug: '',
      contentStr: null,
    }
  }

  if (match.headerIndex != null) {
    // header match
    return {
      ...getFullHeading(page, match.headerIndex, match),
      slug: '#' + page.headers[match.headerIndex].slug,
      contentStr: null,
    }
  }

  // content match
  let headerIndex = findLastIndex(page.headers || [], h => h.charIndex != null && h.charIndex < match.charIndex, null)
  if (headerIndex === -1) headerIndex = null

  return {
    ...getFullHeading(page, headerIndex),
    slug: headerIndex == null ? '' : '#' + page.headers[headerIndex].slug,
    ...getContentStr(page, match),
  }
}

function getFullHeading(page, headerIndex, match) {
  if (headerIndex == null) return { headingStr: page.title }

  const headersPath = []
  while (headerIndex != null) {
    const header = page.headers[headerIndex]
    headersPath.unshift(header)
    headerIndex = findLastIndex(page.headers, h => h.level === header.level - 1, headerIndex - 1)
    if (headerIndex === -1) headerIndex = null
  }

  const headingStr = headersPath.map(h => h.title).join(' > ')
  const prefixPath = headersPath.slice(0, -1)
  const prefixLength = prefixPath.reduce((sum, p) => sum + (p.title || '').length, 0) + prefixPath.length * 3
  const headingHighlight = match && match.headerIndex != null && [match.charIndex + prefixLength, match.termLength]
  return { headingStr, headingHighlight }
}

function getMatch(page, query, terms) {
  const matches = terms
    .map(t => getHeaderMatch(page, t) || getContentMatch(page, t))
    .filter(m => m)
  if (matches.length === 0) return null

  if (matches.every(m => m.headerIndex != null)) {
    return getHeaderMatch(page, query) || matches[0]
  }
  return getContentMatch(page, query) || matches.find(m => m.headerIndex == null)
}

function getHeaderMatch(page, term) {
  if (!page.headers) return null
  for (let i = 0; i < page.headers.length; i++) {
    const h = page.headers[i]
    const charIndex = h.normalizedTitle.indexOf(term)
    if (charIndex === -1) continue
    return { headerIndex: i, charIndex, termLength: term.length }
  }
  return null
}

function getContentMatch(page, term) {
  if (!page.normalizedContent) return null
  const charIndex = page.normalizedContent.indexOf(term)
  if (charIndex === -1) return null
  return { headerIndex: null, charIndex, termLength: term.length }
}

function getContentStr(page, match) {
  const snippetLength = 120
  const { charIndex, termLength } = match

  let lineStartIndex = page.content.lastIndexOf('\n', charIndex)
  let lineEndIndex = page.content.indexOf('\n', charIndex)

  if (lineStartIndex === -1) lineStartIndex = 0
  if (lineEndIndex === -1) lineEndIndex = page.content.length

  const line = page.content.slice(lineStartIndex, lineEndIndex)
  const lineCharIndex = charIndex - lineStartIndex
  const contentHighlight = [lineCharIndex, termLength]

  if (snippetLength >= line.length) return { contentStr: line, contentHighlight }

  const additionalCharactersFromStart = Math.round((snippetLength - termLength) / 2)
  const snippetStart = Math.max(lineCharIndex - additionalCharactersFromStart, 0)
  const snippetEnd = Math.min(snippetStart + snippetLength, line.length)
  let contentStr = line.slice(snippetStart, snippetEnd)
  contentHighlight[0] = contentHighlight[0] - snippetStart

  if (snippetStart > 0) {
    contentStr = '...' + contentStr
    contentHighlight[0] = contentHighlight[0] + 3
  }
  if (snippetEnd < line.length) contentStr = contentStr + '...'
  return { contentStr, contentHighlight }
}

function normalizeString(str) {
  if (!str) return str
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/* ---------------- 消息协议 ---------------- */

let seq = 0

self.onmessage = async e => {
  const msg = e.data
  try {
    if (msg.type === 'init') {
      await buildIndex(msg.data, msg.options || {})
      // init 携带可选 locale（'zh' | 'en'，缺省 'zh'）
      const initLocale = msg.locale
      if (initLocale === 'en' || initLocale === 'zh') locale = initLocale
      self.postMessage({ type: 'ready' })
    } else if (msg.type === 'locale') {
      // 仅更新语言标志，不重建索引（两站索引内容完全相同）；无效值忽略
      if (msg.locale === 'en' || msg.locale === 'zh') locale = msg.locale
    } else if (msg.type === 'query') {
      const results = await match(msg.query, msg.queryTerms, msg.limit)
      self.postMessage({ type: 'result', id: msg.id, results })
    } else if (msg.type === 'terminate') {
      self.close && self.close()
    }
  } catch (err) {
    self.postMessage({ type: 'error', id: msg && msg.id, message: String((err && err.stack) || err) })
  }
}
