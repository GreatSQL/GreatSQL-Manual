/**
 * 异步全文搜索插件（本地改造版，替代 vuepress-plugin-fulltext-search 的同步加载方案）
 *
 * 性能问题背景：
 *   vuepress-plugin-fulltext-search 的 extendPageData 会把每个页面的全文正文
 *   （content / normalizedContent / headersStr / charsets）写入 $page 可序列化字段，
 *   而 VuePress 会把所有页面数据序列化进 app.js（siteData），
 *   导致主包膨胀到 7MB+（本仓库 352 个页面、236MB 文档）。
 *
 * 本插件改造方案：
 *   1. extendPageData 只计算搜索数据并收集到插件内存（不写入 $page 可序列化字段），
 *      app.js 不再包含全文，体积回归正常（约 1.5MB）。
 *   2. ready 阶段把全部搜索数据写成 search-data.json 到 .vuepress/public/，
 *      由静态服务器发布，浏览器端**首次使用搜索时**才 fetch（懒加载）。
 *   3. 同时生成 search-worker.js（flexsearch.min.js + 检索逻辑），
 *      在 Web Worker 中异步建索引与检索，不阻塞主线程。
 *   4. @SearchBox 别名指向自定义组件（.vuepress/components/SearchBox.vue）。
 *
 * 用法（config.js）：
 *   plugins: [
 *     [require('./plugins/fulltext-search-async.js'), {
 *       tokenize: 'full', split: /\s+/, encode: 'icase',
 *       hooks: null, // 可选，与官方插件同语义
 *     }],
 *   ]
 */
const path = require('path')
const fs = require('fs')
const { htmlToText } = require('html-to-text')

let collected = null
let customTitles = null

module.exports = (options, ctx) => {
  return {
    /**
     * 计算单页搜索数据，仅收集到内存（不写入 $page，避免进入 app.js siteData）
     */
    extendPageData($page) {
      try {
        const { html } = $page._context.markdown.render($page._strippedContent || '')
        if (!customTitles) customTitles = getCustomTitles(ctx)

        const plaintext = htmlToText(html, {
          wordwrap: null,
          hideLinkHrefIfSameAsText: true,
          ignoreImage: true,
          ignoreHref: true,
          uppercaseHeadings: false,
          tables: true,
        })

        // 增强标题（带归一化文本与正文中的字符位置），供结果高亮使用
        const headers = ($page.headers || []).map(h => {
          const titlePlaintext = $page._context.markdown.renderInline(h.title)
          const normalizedTitle = normalizeText(titlePlaintext)
          const charIndex = plaintext.indexOf(titlePlaintext)
          return {
            level: h.level,
            title: h.title,
            slug: h.slug,
            children: h.children,
            normalizedTitle,
            charIndex: charIndex === -1 ? null : charIndex,
          }
        })

        // 与官方插件一致：frontmatter.search === false 的页面不参与检索
        if ($page.frontmatter && $page.frontmatter.search === false) return

        if (!collected) collected = []
        collected.push({
          path: $page.path,
          title: $page.title || customTitles[normalizePath($page.path)] || $page.path,
          headers,
          content: plaintext,
        })
      } catch (e) {
        console.error('[fulltext-search-async] Error while processing page:', e)
      }
    },

    /**
     * 所有页面处理完后：生成 search-data.json 与 search-worker.js 到 .vuepress/public/
     */
    ready() {
      if (!collected) collected = []
      const publicDir = path.join(ctx.sourceDir, '.vuepress', 'public')
      fs.mkdirSync(publicDir, { recursive: true })

      const dataFile = path.join(publicDir, 'search-data.json')
      fs.writeFileSync(dataFile, JSON.stringify(collected))

      // 拼接 flexsearch 库 + Worker 检索逻辑（flexsearch.min.js 为 UMD，Worker 全局可用）
      let flexSource = ''
      try {
        flexSource = fs.readFileSync(require.resolve('flexsearch/dist/flexsearch.min.js'), 'utf8')
      } catch (e) {
        console.error('[fulltext-search-async] flexsearch.min.js not found, search worker disabled:', e.message)
      }
      const workerTemplate = fs.readFileSync(path.join(__dirname, 'search-worker.template.js'), 'utf8')
      fs.writeFileSync(path.join(publicDir, 'search-worker.js'), flexSource + '\n' + workerTemplate)

      const sizeMB = (fs.statSync(dataFile).size / 1024 / 1024).toFixed(2)
      console.log(
        `[fulltext-search-async] 已生成 search-data.json (${collected.length} 页, ${sizeMB}MB) 与 search-worker.js`
      )
    },

    // 覆盖默认搜索框组件为懒加载 + Worker 版
    alias: {
      '@SearchBox': path.resolve(__dirname, '../components/SearchBox.vue'),
    },

    // 与官方插件一致的 hooks 动态模块（未配置时为空对象，保持兼容）
    clientDynamicModules() {
      return {
        name: 'hooks.js',
        content: options.hooks || 'export default {}',
      }
    },

    define() {
      return { OPTIONS: options }
    },
  }
}

/* ---------------- 以下工具函数与官方插件保持一致 ---------------- */

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function getCustomTitles(appCtx) {
  try {
    const sidebarConfig = appCtx.themeConfig && appCtx.themeConfig.sidebar
    if (!sidebarConfig) return {}

    let sidebars = [sidebarConfig]
    if (typeof sidebarConfig === 'object' && !Array.isArray(sidebarConfig)) {
      sidebars = Object.values(sidebarConfig)
    }

    sidebars = sidebars.filter(sb => Array.isArray(sb))

    const result = {}
    for (const sb of sidebars) {
      for (const page of sb) {
        if (Array.isArray(page)) {
          const [pathWithExtension, title] = page
          const normalizedPath = normalizePath(pathWithExtension)
          if (normalizedPath && title) result[normalizedPath] = title
          continue
        }
        if (typeof page !== 'object' || page === null) continue

        if (page.path && page.title) {
          const normalizedPath = normalizePath(page.path)
          if (normalizedPath) result[normalizedPath] = page.title
        }
        if (page.children) {
          for (const c of page.children) {
            if (Array.isArray(c)) {
              const [pathWithExtension, title] = c
              const normalizedPath = normalizePath(pathWithExtension)
              if (normalizedPath && title) result[normalizedPath] = title
            }
          }
        }
      }
    }
    return result
  } catch (e) {
    console.error('[fulltext-search-async] Error while getting sidebar paths:', e)
    return {}
  }
}

function normalizePath(rawPath) {
  if (!rawPath) return null
  try {
    const parsedPath = path.parse(rawPath)
    return path.join(parsedPath.dir, parsedPath.name)
  } catch (e) {
    console.error(`[fulltext-search-async] Error while normalizing path ${rawPath}:`, e)
    return null
  }
}
