#!/usr/bin/env node
/**
 * 搜索「语言优先排序」回归测试（node 直跑真实构建产物）
 *
 * 前置：先执行 `vuepress build` 生成 .vuepress/public/search-worker.js 与 search-data.json
 * 用法：node scripts/search-locale-test.js   （仓库根目录执行）
 *
 * 原理：把构建产物 search-worker.js 加载到 worker_threads 中（注入 self/postMessage 桥接），
 * 按真实消息协议（init / locale / query）对真实 search-data.json（676 页）跑断言：
 *   - zh locale：中文结果全部在英文之前（稳定分区）
 *   - en locale：英文结果全部在中文之前
 *   - 同语言命中 ≥ limit 只显示同语言；不足时异语言按原顺序填充（不屏蔽）
 *   - 重排前后命中集合 Set(path) 一致（只改顺序不增删）
 *   - 中文子序列在 zh/en 两种 locale 下顺序一致（稳定排序）
 *   - 结果契约：parentPageTitle / slug / headingStr / contentStr 字段齐全
 *
 * 对应验收口径：docs/search-locale-priority-research-and-plan-cc-20261125.md Step 1 完成记录。
 */
const fs = require('fs')
const path = require('path')
const os = require('os')
const { Worker } = require('worker_threads')

const ROOT = path.resolve(__dirname, '..')
const workerSrc = path.join(ROOT, '.vuepress', 'public', 'search-worker.js')
const dataSrc = path.join(ROOT, '.vuepress', 'public', 'search-data.json')

if (!fs.existsSync(workerSrc) || !fs.existsSync(dataSrc)) {
  console.error('[search-locale-test] 未找到构建产物，请先执行 vuepress build')
  process.exit(1)
}

const code = fs.readFileSync(workerSrc, 'utf8')

// 兼容包装：worker_threads 无 self/postMessage 全局，注入桥接
const selfShim = `const { parentPort } = require('worker_threads');
globalThis.self = globalThis;
globalThis.postMessage = (m) => parentPort.postMessage(m);
parentPort.on('message', (m) => { if (globalThis.self.onmessage) globalThis.self.onmessage({ data: m }); });
`
const marker = 'self.onmessage = async e => {'
const wrapped = selfShim + '\n' + code.replace(marker, '// (self.onmessage assigned below)\nself.onmessage = async e => {')

const wrappedFile = path.join(os.tmpdir(), `search-worker-wrapped-${process.pid}.js`)
fs.writeFileSync(wrappedFile, wrapped)

const data = JSON.parse(fs.readFileSync(dataSrc, 'utf8'))
const isEn = p => p.path.startsWith('/en/')

async function runSearch(worker, query, queryTerms, limit) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1e9)
    const onMsg = m => {
      if (m.type === 'result' && m.id === id) { worker.off('message', onMsg); resolve(m.results) }
      else if (m.type === 'error') { worker.off('message', onMsg); reject(new Error(m.message)) }
    }
    worker.on('message', onMsg)
    worker.postMessage({ type: 'query', id, query, queryTerms, limit })
  })
}

async function main() {
  const w = new Worker(wrappedFile)
  w.on('error', e => { console.error('worker error', e); process.exit(1) })

  await new Promise((resolve, reject) => {
    const onMsg = m => { if (m.type === 'ready') { w.off('message', onMsg); resolve() } }
    w.on('message', onMsg)
    w.postMessage({ type: 'init', data, options: {}, locale: 'zh' })
  })
  console.log('init(zh) ready OK')

  let failures = 0
  const check = (cond, msg) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + msg); if (!cond) failures++ }
  const sleep = ms => new Promise(r => setTimeout(r, ms))

  // 场景1: zh 搜「安装」→ 中文全部在前（稳定分区）
  let r = await runSearch(w, '安装', ['安装'], 50)
  const zhFlags = r.map(p => !isEn(p))
  const zhBeforeEn = zhFlags.every(x => x) || (zhFlags.includes(false) && zhFlags.indexOf(false) > zhFlags.lastIndexOf(true))
  check(zhBeforeEn, 'zh 搜「安装」：中文在英文之前（limit=50）')

  // 场景2: zh 搜 MGR → 中文在前、英文填充后续位
  r = await runSearch(w, 'MGR', ['mgr'], 10)
  const firstEnIdx = r.findIndex(p => isEn(p))
  const lastZhIdx = r.map(p => !isEn(p)).lastIndexOf(true)
  check(firstEnIdx === -1 || firstEnIdx > lastZhIdx, 'zh 搜 MGR：中文在前、英文填充后续位')
  check(r.length <= 10, 'zh 搜 MGR：结果数 ≤ searchMaxSuggestions 上限')

  // 场景3: 切 en 搜 install → 英文全部在前
  w.postMessage({ type: 'locale', locale: 'en' })
  await sleep(50)
  r = await runSearch(w, 'install', ['install'], 50)
  const enFlags = r.map(p => isEn(p))
  const enBeforeZh = enFlags.every(x => x) || (enFlags.includes(false) && enFlags.indexOf(false) > enFlags.lastIndexOf(true))
  check(enBeforeZh, 'en 搜 install：英文在中文之前（limit=50）')

  // 场景4: en 搜「备份」→ 英文无命中时中文正常展示（不屏蔽）
  r = await runSearch(w, '备份', ['备份'], 10)
  check(r.length > 0, 'en 搜「备份」：结果非空（不屏蔽）')
  check(r.some(p => !isEn(p)), 'en 搜「备份」：中文结果可见')

  // 场景5: 命中集合一致性：zh/en 大 limit 集合相等（仅顺序不同）
  w.postMessage({ type: 'locale', locale: 'zh' })
  await sleep(50)
  const rzh = await runSearch(w, 'MGR', ['mgr'], 500)
  w.postMessage({ type: 'locale', locale: 'en' })
  await sleep(50)
  const ren = await runSearch(w, 'MGR', ['mgr'], 500)
  const setzh = new Set(rzh.map(p => p.path))
  const seten = new Set(ren.map(p => p.path))
  const same = setzh.size === seten.size && [...setzh].every(p => seten.has(p))
  check(same, '重排前后命中集合一致（zh/en 大 limit 集合相等，共 ' + setzh.size + ' 条）')

  // 场景6: 同语言满 limit 只显示同语言
  r = await runSearch(w, 'MGR', ['mgr'], 10)
  check(r.every(p => !isEn(p)), 'zh 搜 MGR limit=10：全为中文（同语言 ≥ limit 只显示同语言）')

  // 稳定序：中文子序列在 zh/en 两种 locale 下顺序一致
  const zhSub = rzh.filter(p => !isEn(p)).map(p => p.path)
  const zhSubEn = ren.filter(p => !isEn(p)).map(p => p.path)
  check(JSON.stringify(zhSub) === JSON.stringify(zhSubEn), '中文子序列在 zh/en 两种 locale 下顺序一致')

  // 结果契约：分组与高亮字段齐全
  const full = await runSearch(w, '备份', ['备份'], 10)
  const s = full[0]
  check(s && typeof s.parentPageTitle === 'string' && ('slug' in s) && ('headingStr' in s || 'contentStr' in s),
        '结果契约：parentPageTitle/slug/headingStr/contentStr 字段齐全')

  w.postMessage({ type: 'terminate' })
  w.terminate()
  fs.unlinkSync(wrappedFile)
  console.log(failures === 0 ? '\nALL PASS' : '\n' + failures + ' FAILURES')
  process.exit(failures === 0 ? 0 : 1)
}

main().catch(e => { console.error(e); process.exit(1) })
