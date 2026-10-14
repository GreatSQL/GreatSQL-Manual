// 配色模式相关常量
const THEME_KEY = 'greatsql-theme-mode' // 'light' | 'dark' | 'auto'
const MODES = ['light', 'dark', 'auto']

const MODE_LABEL = {
  light: '白天模式',
  dark: '黑夜模式',
  auto: '自动模式'
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
    btn.title = MODE_LABEL[currentMode] + '（点击切换）'
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
  router.afterEach(placeBtn)
  window.addEventListener('load', placeBtn)
  placeBtn() // 首次渲染兜底（导航栏可能尚未挂载，no-op）
}
