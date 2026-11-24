// 配色模式相关常量
const THEME_KEY = 'greatsql-theme-mode' // 'light' | 'dark' | 'auto'
const MODES = ['light', 'dark', 'auto']

const MODE_LABEL = {
  light: '白天模式',
  dark: '黑夜模式',
  auto: '自动模式'
}

// 英文环境下的配色模式文案（i18n）
const MODE_LABEL_EN = {
  light: 'Light mode',
  dark: 'Dark mode',
  auto: 'Auto mode'
}

// 各模式按钮图标（SVG，随当前文字颜色渲染）
const MODE_ICON = {
  light:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
  dark:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  auto:
    // 白天太阳基础上，中心叠加字母 A（表示 Auto），与纯太阳的白天模式区分开；
    // A 用矢量路径绘制（粗体、带镂空），不依赖字体，任意浏览器渲染一致
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/><path d="M12 7.6 L7.9 16.4 L16.1 16.4 Z M12 10.1 L10.35 14.5 L13.65 14.5 Z M10.7 12.5 L13.3 12.5 L13.3 13.9 L10.7 13.9 Z" fill="currentColor" stroke="none" fill-rule="evenodd"/></svg>'
}

// 获取系统偏好主题
function getSystemTheme() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

// 应用主题：mode 为 light/dark/auto
function applyTheme(mode) {
  const theme = mode === 'auto' ? getSystemTheme() : mode
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.setAttribute('data-theme-mode', mode)
}

// 读取 localStorage 中保存的模式
function readSavedMode() {
  let mode = 'auto'
  try {
    mode = localStorage.getItem(THEME_KEY) || 'auto'
  } catch (e) { /* ignore */ }
  return MODES.indexOf(mode) >= 0 ? mode : 'auto'
}

export default ({ Vue, router }) => {
  // 当前是否为英文站点（/en/ 路径前缀）
  const isEnLocale = () =>
    router.currentRoute && router.currentRoute.path.indexOf('/en/') === 0
  // 根据当前 locale 选择文案：L('中文', 'English')
  const L = (zh, en) => (isEnLocale() ? en : zh)

  // 路由切换事件处理（保留原有百度 PV 统计）
  router.beforeEach((to, from, next) => {
    if (typeof _hmt != "undefined") {
      if (to.path) {
        _hmt.push(["_trackPageview", to.fullPath]);
      }
    }
    next();
  });

  // ========== 配色模式切换（SSR 环境跳过） ==========
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  let currentMode = readSavedMode()
  applyTheme(currentMode)

  // auto 模式下监听系统主题变化
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null
  const onSystemChange = () => {
    if ((document.documentElement.getAttribute('data-theme-mode') || 'auto') === 'auto') {
      applyTheme('auto')
    }
  }
  if (mq) {
    if (mq.addEventListener) mq.addEventListener('change', onSystemChange)
    else if (mq.addListener) mq.addListener(onSystemChange)
  }

  // 悬浮切换按钮：白天 -> 黑夜 -> 自动 循环
  const btn = document.createElement('button')
  btn.className = 'theme-switch-btn'
  btn.type = 'button'
  btn.setAttribute('aria-label', '切换配色模式')

  const updateBtn = () => {
    btn.innerHTML = MODE_ICON[currentMode] || MODE_ICON.auto
    btn.title = isEnLocale()
      ? MODE_LABEL_EN[currentMode] + ' (click to switch)'
      : MODE_LABEL[currentMode] + '（点击切换）'
    btn.setAttribute('aria-label', L('切换配色模式', 'Switch color mode'))
  }

  btn.addEventListener('click', () => {
    const idx = MODES.indexOf(currentMode)
    currentMode = MODES[(idx + 1) % MODES.length]
    try {
      localStorage.setItem(THEME_KEY, currentMode)
    } catch (e) { /* ignore */ }
    applyTheme(currentMode)
    updateBtn()
  })

  updateBtn()

  // 将切换按钮放入导航栏最右侧（"查看源码"右侧，避免与右上角目录按钮重叠）
  // Vue 重渲染导航栏时可能移除 DOM 节点，这里在路由切换/页面加载时兜底重新插入
  const placeBtn = () => {
    const host = document.querySelector('.navbar .links')
    if (host && btn.parentNode !== host) {
      host.appendChild(btn)
    }
  }
  router.afterEach(() => { placeBtn(); updateBtn() })
  window.addEventListener('load', placeBtn)
  placeBtn() // 首次渲染兜底（导航栏可能尚未挂载，no-op）

  // ========== 语言切换（中/英一键直切，替代默认主题的「语言」下拉菜单） ==========
  // 默认主题 NavLinks 会自动把「语言」下拉追加到导航栏最右侧（标题为 语言/Languages），
  // 这里将其移除，改为注入一个按钮：中文站显示 English，英文站显示 简体中文，
  // 点击优先跳转当前页面对应的另一语言页面，目标页不存在时回退到语言首页。
  const langBtn = document.createElement('button')
  langBtn.type = 'button'
  langBtn.className = 'lang-switch-btn'

  // 隐藏 NavLinks 渲染的语言下拉（仅匹配标题为 语言/Languages 的 dropdown-wrapper，
  // 避免误删「8.4.4-5」等版本切换下拉）。
  // 注意：不能用 item.remove() 直接删除该节点 —— 该节点仍存在于 Vue 的 vnode 树中，
  // NavLinks 重渲染时 Vue 会尝试重建被删除的节点，由于 DOM 已被手动改动，patch 会把
  // 新节点 appendChild 到文本节点上抛 HierarchyRequestError，导致 Vue 渲染中断，
  // 出现「语言切换后页面不更新」「侧边栏无法展开」等连锁故障。
  // 改为仅隐藏（display:none 是行内样式，Vue 的 patch 不会清除无 style 数据的节点样式），
  // 保持 DOM 与 vnode 树一致，避免破坏 Vue 的 diff 流程。
  const removeLangDropdown = () => {
    const host = document.querySelector('.navbar .nav-links')
    if (!host) return
    host.querySelectorAll('.dropdown-wrapper').forEach(w => {
      const title = w.querySelector('.dropdown-title .title')
      if (title) {
        const t = title.textContent.trim()
        if (t === '语言' || t === 'Languages') {
          const item = w.closest('.nav-item')
          if (item) item.style.display = 'none'
        }
      }
    })
  }

  // 计算目标语言页面：站内路径 + 用于探测静态文件是否存在的完整 URL
  // 注意：vuepress 1.x 的页面路由 path 带 .html 后缀（如 /5-enhance/xxx.html），
  // 首页为 '/' 或 '/en/'，探测 URL 直接从 path 推导即可
  const langTarget = () => {
    const path = router.currentRoute.path
    const en = path === '/en/' || path.indexOf('/en/') === 0
    const targetPath = en
      ? (path === '/en/' ? '/' : path.replace(/^\/en/, ''))
      : (path === '/' ? '/en/' : '/en' + path)
    // 从当前 URL 推断站点 base（如 /docs/8.4.4-5/），再拼目标页面静态文件地址
    const P = window.location.pathname
    const base = P.endsWith(path)
      ? P.slice(0, P.length - path.length)
      : P.slice(0, P.lastIndexOf('/') + 1)
    const baseUrl = base.endsWith('/') ? base : base + '/'
    const pathPart = targetPath === '/' ? '' : targetPath.replace(/^\//, '')
    return { targetPath, probeUrl: baseUrl + pathPart }
  }

  const updateLangBtn = () => {
    langBtn.textContent = isEnLocale() ? '简体中文' : 'English'
    const label = L('切换至英文版', 'Switch to Chinese version')
    langBtn.setAttribute('aria-label', label)
    langBtn.title = label
  }

  langBtn.addEventListener('click', () => {
    const { targetPath, probeUrl } = langTarget()
    const fallback = isEnLocale() ? '/' : '/en/'
    fetch(probeUrl, { method: 'HEAD', cache: 'no-store' })
      .then(res => router.push(res.ok ? targetPath : fallback))
      .catch(() => router.push(fallback))
  })

  // 将按钮插入到导航链接之后（原语言下拉所在区域）。路由切换后 Vue 可能重建
  // NavLinks，语言下拉会再次出现，因此每次路由切换都重新移除+兜底插入
  const ensureLangSwitch = () => {
    removeLangDropdown()
    const host = document.querySelector('.navbar .links')
    if (!host) return
    if (langBtn.parentNode === host) return
    const navLinks = host.querySelector('.nav-links')
    host.insertBefore(langBtn, navLinks ? navLinks.nextSibling : null)
  }
  router.afterEach(() => { ensureLangSwitch(); updateLangBtn() })
  window.addEventListener('load', ensureLangSwitch)
  ensureLangSwitch()
  updateLangBtn()
  // Vue 挂载(SSR hydrate)后可能重建导航栏 DOM，语言下拉会再次出现，延迟再兜底一次
  setTimeout(ensureLangSwitch, 200)

  // ========== 代码块折行 / 取消折行 ==========
  // 在每个 ``` / ```bash / ```sql / ```sh 等围栏代码块右上角注入一个"折行"切换按钮，
  // 点击后在代码块容器上切换 wrapped 类，由 index.styl 控制 pre 内的代码自动换行，
  // 避免超宽代码需要左右横向滚动才能阅读（参考 PingCAP TiDB 文档体验）。
  const CODE_WRAP_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19h6v-2H4v2zM20 5H4v2h16V5zm-3 6H4v2h13.25c1.1 0 2 .9 2 2s-.9 2-2 2H15v-2l-3 3 3 3v-2h2c2.21 0 4-1.79 4-4s-1.79-4-4-4z"/></svg>'

  const injectCodeWrapButtons = () => {
    document.querySelectorAll('div[class*="language-"]').forEach(block => {
      // 已注入过的不重复处理（路由切换/组件更新时兜底调用）
      if (block.querySelector('.code-wrap-btn')) return
      const pre = block.querySelector('pre')
      if (!pre) return

      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'code-wrap-btn'
      const wrapLabel = L('代码折行显示', 'Wrap long lines')
      btn.setAttribute('aria-label', wrapLabel)
      btn.setAttribute('aria-pressed', 'false')
      btn.title = wrapLabel
      btn.innerHTML = CODE_WRAP_ICON

      btn.addEventListener('click', () => {
        const on = block.classList.toggle('wrapped')
        btn.classList.toggle('is-wrapped', on)
        const label = on ? L('取消代码折行', 'Unwrap long lines') : L('代码折行显示', 'Wrap long lines')
        btn.setAttribute('aria-pressed', on ? 'true' : 'false')
        btn.setAttribute('aria-label', label)
        btn.title = label
      })

      block.appendChild(btn)
    })
  }

  router.afterEach(() => setTimeout(injectCodeWrapButtons, 50))
  Vue.mixin({ updated() { setTimeout(injectCodeWrapButtons, 120) } })
  window.addEventListener('load', () => setTimeout(injectCodeWrapButtons, 50))
  setTimeout(injectCodeWrapButtons, 100) // 首屏兜底
}
