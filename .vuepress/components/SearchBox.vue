<template>
  <div class="search-box">
    <input
      ref="input"
      aria-label="Search"
      :value="query"
      :class="{ focused: focused }"
      :placeholder="placeholder"
      autocomplete="off"
      spellcheck="false"
      @input="query = $event.target.value"
      @focus="onFocus"
      @blur="focused = false"
      @keyup.enter="go(focusIndex)"
      @keyup.up="onUp"
      @keyup.down="onDown"
    />
    <ul v-if="showSuggestions" class="suggestions" :class="{ 'align-right': alignRight }" @mouseleave="unfocus">
      <li
        v-for="(s, i) in suggestions"
        :key="i"
        class="suggestion"
        :class="{ focused: i === focusIndex }"
        @mousedown="go(i)"
        @mouseenter="focus(i)"
      >
        <a :href="s.path + s.slug" @click.prevent>
          <div v-if="s.parentPageTitle" class="parent-page-title" v-html="s.parentPageTitle" />
          <div class="suggestion-row">
            <div class="page-title">{{ s.title || s.path }}</div>
            <div class="suggestion-content">
              <!-- prettier-ignore -->
              <div v-if="s.headingStr" class="header">
                {{ s.headingDisplay.prefix }}<span class="highlight">{{ s.headingDisplay.highlightedContent }}</span>{{ s.headingDisplay.suffix }}
              </div>
              <!-- prettier-ignore -->
              <div v-if="s.contentStr">
                {{ s.contentDisplay.prefix }}<span class="highlight">{{ s.contentDisplay.highlightedContent }}</span>{{ s.contentDisplay.suffix }}
              </div>
            </div>
          </div>
        </a>
      </li>
    </ul>
    <ul v-if="focused && status === 'loading'" class="suggestions" :class="{ 'align-right': alignRight }">
      <li class="suggestion status-row">正在加载全文搜索索引…</li>
    </ul>
    <ul v-if="focused && status === 'error'" class="suggestions" :class="{ 'align-right': alignRight }">
      <li class="suggestion status-row">搜索索引加载失败，请稍后重试。</li>
    </ul>
  </div>
</template>

<script>
// 懒加载 + Web Worker 版全文搜索框
// 与官方 vuepress-plugin-fulltext-search 的 SearchBox 差异：
//   - mounted 时不再同步构建 flexsearch 索引（避免阻塞主线程、避免首页下载索引数据）
//   - 首次聚焦/输入时才懒加载 search-data.json 与 search-worker.js，
//     索引构建与检索全部在 Web Worker 中进行
// 数据来源：/docs/<版本>/search-data.json（由 fulltext-search-async 插件构建期生成）

/* global OPTIONS */
import hooks from '@dynamic/hooks'

export default {
  name: 'SearchBox',
  data() {
    return {
      query: '',
      focused: false,
      focusIndex: 0,
      placeholder: undefined,
      suggestions: null,
      status: 'idle', // idle | loading | ready | error
      worker: null,
      pendingResolvers: new Map(),
      seq: 0,
    }
  },
  computed: {
    queryTerms() {
      if (!this.query) return []
      const result = this.normalizeString(this.query)
        .split(/[^\p{L}\p{N}_]+/iu)
        .filter(t => t)
      return result
    },
    showSuggestions() {
      return this.focused && this.suggestions && this.suggestions.length
    },
    alignRight() {
      const navCount = (this.$site.themeConfig.nav || []).length
      const repo = this.$site.repo ? 1 : 0
      return navCount + repo <= 2
    },
  },
  watch: {
    query() {
      this.getSuggestions()
    },
  },
  mounted() {
    this.placeholder = this.$site.themeConfig.searchPlaceholder || ''
    document.addEventListener('keydown', this.onHotkey)

    // set query from URL
    const params = this.urlParams()
    if (params) {
      const query = params.get('query')
      if (query) {
        this.query = decodeURI(query)
        this.focused = true
        this.lazyInit()
      }
    }
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.onHotkey)
    if (this.worker) {
      this.worker.postMessage({ type: 'terminate' })
      this.worker.terminate()
      this.worker = null
    }
  },
  methods: {
    /** 首次聚焦时懒加载 Worker 与索引数据（只执行一次） */
    onFocus() {
      this.focused = true
      this.lazyInit()
    },
    async lazyInit() {
      if (this.status !== 'idle') return
      this.status = 'loading'
      try {
        const base = this.$site.base || '/'
        this.worker = new Worker(base + 'search-worker.js')
        this.worker.onmessage = e => this.onWorkerMessage(e)
        this.worker.onerror = err => {
          this.status = 'error'
          console.error('[SearchBox] worker error:', err)
        }
        const resp = await fetch(base + 'search-data.json')
        if (!resp.ok) throw new Error(`search-data.json 加载失败 (HTTP ${resp.status})`)
        const data = await resp.json()
        if (!Array.isArray(data)) throw new Error('search-data.json 格式错误')
        this.worker.postMessage({ type: 'init', data, options: OPTIONS || {} })
      } catch (err) {
        console.error('[SearchBox] 搜索索引初始化失败:', err)
        this.status = 'error'
      }
    },
    onWorkerMessage(e) {
      const msg = e.data
      if (msg.type === 'ready') {
        this.status = 'ready'
        // 若等待期间已有输入，立即补一次检索
        if (this.query && this.queryTerms.length) this.getSuggestions()
      } else if (msg.type === 'result') {
        const resolve = this.pendingResolvers.get(msg.id)
        if (resolve) {
          this.pendingResolvers.delete(msg.id)
          resolve(msg.results)
        }
      } else if (msg.type === 'error') {
        console.error('[SearchBox] worker 错误:', msg.message)
        this.status = 'error'
      }
    },
    async getSuggestions() {
      if (!this.query || !this.queryTerms.length) {
        this.suggestions = []
        return
      }
      if (this.status !== 'ready') {
        // 索引尚未就绪：保持空结果（loading 状态由模板提示）
        this.suggestions = []
        return
      }
      const id = ++this.seq
      const limit = this.$site.themeConfig.searchMaxSuggestions || 5
      let suggestions
      try {
        suggestions = await new Promise((resolve, reject) => {
          this.pendingResolvers.set(id, resolve)
          this.worker.postMessage({
            type: 'query',
            id,
            query: this.query,
            queryTerms: this.queryTerms,
            limit,
          })
        })
      } catch (e) {
        console.error('[SearchBox] 检索失败:', e)
        suggestions = []
      }
      if (id !== this.seq) return // 丢弃过期结果
      if (hooks.processSuggestions) {
        suggestions = await hooks.processSuggestions(suggestions, this.query, this.queryTerms)
      }
      this.suggestions = suggestions.map(s => ({
        ...s,
        headingDisplay: highlight(s.headingStr, s.headingHighlight),
        contentDisplay: highlight(s.contentStr, s.contentHighlight),
      }))
    },
    onHotkey(event) {
      if (event.srcElement === document.body && ['s', '/'].includes(event.key)) {
        this.$refs.input.focus()
        event.preventDefault()
      }
    },
    onUp() {
      if (this.showSuggestions) {
        if (this.focusIndex > 0) {
          this.focusIndex--
        } else {
          this.focusIndex = this.suggestions.length - 1
        }
      }
    },
    onDown() {
      if (this.showSuggestions) {
        if (this.focusIndex < this.suggestions.length - 1) {
          this.focusIndex++
        } else {
          this.focusIndex = 0
        }
      }
    },
    go(i) {
      if (!this.showSuggestions) {
        return
      }
      if (hooks.onGoToSuggestion) {
        const result = hooks.onGoToSuggestion(i, this.suggestions[i], this.query, this.queryTerms)
        if (result === true) return
      }
      if (this.suggestions[i].external) {
        window.open(this.suggestions[i].path + this.suggestions[i].slug, '_blank')
      } else {
        this.$router.push(this.suggestions[i].path + this.suggestions[i].slug)
        this.query = ''
        this.focusIndex = 0
        this.focused = false

        // reset query param
        const params = this.urlParams()
        if (params) {
          params.delete('query')
          const paramsString = params.toString()
          const newState = window.location.pathname + (paramsString ? `?${paramsString}` : '')
          history.pushState(null, '', newState)
        }
      }
    },
    focus(i) {
      this.focusIndex = i
    },
    unfocus() {
      this.focusIndex = -1
    },
    urlParams() {
      if (!window.location.search) {
        return null
      }
      return new URLSearchParams(window.location.search)
    },
    normalizeString(str) {
      if (!str) return str
      return str
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    },
  },
}

function highlight(str, strHighlight) {
  if (!str) return {}
  if (!strHighlight) return { prefix: str }
  const [start, length] = strHighlight
  const end = start + length

  const prefix = str.slice(0, start)
  const highlightedContent = str.slice(start, end)
  const suffix = str.slice(end)
  return { prefix, highlightedContent, suffix }
}
</script>

<style lang="stylus">
.search-box
  display inline-block
  position relative
  margin-right 1rem
  input
    cursor text
    width 10rem
    height: 2rem
    color lighten($textColor, 25%)
    display inline-block
    border 1px solid darken($borderColor, 10%)
    border-radius 2rem
    font-size 0.9rem
    line-height 2rem
    padding 0 0.5rem 0 2rem
    outline none
    transition all .2s ease
    background #fff url(../assets/search.svg) 0.6rem 0.5rem no-repeat
    background-size 1rem
    &:focus
      cursor auto
      border-color $accentColor
  .suggestions
    background #fff
    min-width 500px
    max-width 700px
    position absolute
    top 2 rem
    border 1px solid darken($borderColor, 10%)
    border-radius 6px
    padding 0.4rem
    list-style-type none
    &.align-right
      right 0
  .suggestion
    line-height 1.4
    // padding 0.4rem 0.6rem
    border-radius 4px
    cursor pointer
    width 100%
    a
      display block
      white-space normal
      color lighten($textColor, 15%)
      width 100%
      .parent-page-title
        color white
        font-weight 600
        background-color $accentColor
        padding 5px

      .suggestion-row
        border-collapse collapse
        width 100%
        display table
        .page-title
          width: 35%
          border 1px solid $borderColor
          background: #f5f5f5
          border-left none
          display table-cell
          text-align right
          padding 5px
          font-weight 600
        .suggestion-content
          .highlight
            text-decoration: underline
          border 1px solid $borderColor
          font-weight 400
          border-right none
          width: 65%
          display table-cell
          padding 5px
          .header
            font-weight 600

    &.focused
      background-color #f3f4f5
  .status-row
    padding 0.6rem 0.8rem
    color lighten($textColor, 25%)
    font-size 0.85rem
    text-align center
@media (max-width: $MQNarrow)
  .search-box
    input
      cursor pointer
      width 0
      border-color transparent
      position relative
      &:focus
        cursor text
        left 0
        width 10rem
// Match IE11
@media all and (-ms-high-contrast: none)
  .search-box input
    height 2rem
@media (max-width: $MQNarrow) and (min-width: $MQMobile)
  .search-box
    .suggestions
      left 0
@media (max-width: $MQMobile)
  .search-box
    margin-right 0
    input
      left 1rem
    .suggestions
      right 0
@media (max-width: $MQMobileNarrow)
  .search-box
    .suggestions
      width calc(100vw - 4rem)
    input:focus
      width 8rem
</style>
