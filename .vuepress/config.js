// .vuepress/config.js

module.exports = {
  title: 'GreatSQL用户手册',
  base: '/docs/8.0.32-27/',
  debug: false,
  // 关闭 VuePress 默认对所有路由 chunk 的 prefetch：
  // 页面 chunk（合计约 20MB+）不再在首页空闲时被全部下载，首屏关键资源不再被抢带宽
  shouldPrefetch: () => false,
  // 多语言站点元信息（HTML lang、站点标题、描述按 locale 区分）
  locales: {
    '/': {
      lang: 'zh-CN',
      title: 'GreatSQL用户手册',
      description: 'GreatSQL用户手册',
    },
    '/en/': {
      lang: 'en-US',
      title: 'GreatSQL User Manual',
      description: 'GreatSQL User Manual',
    },
  },
  head: [
    // 首帧设置配色主题，避免页面刷新时白屏闪烁（light/dark/auto 三态）
    ["script",
      {},
      `(function(){
        var m = 'auto';
        try { m = localStorage.getItem('greatsql-theme-mode') || 'auto'; } catch(e) {}
        if (['light','dark','auto'].indexOf(m) < 0) { m = 'auto'; }
        var t = (m === 'auto')
          ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : m;
        document.documentElement.setAttribute('data-theme', t);
        document.documentElement.setAttribute('data-theme-mode', m);
      })();`,
    ],
    ["script",
      {},
	  `var _hmt = _hmt || [];
	  (function() {
	    var hm = document.createElement("script");
	    hm.async = true; // 异步加载百度统计，不阻塞首屏渲染
	    hm.src = "https://hm.baidu.com/hm.js?764bde358e08c602c0d5f94f7b05eda4";
	    document.head.appendChild(hm);
	  })();`,
  ]],
  description: "GreatSQL User Manual",
  devServer: {
    overlay: {
      warnings: true,
      errors: true,
      hot: true
    }
  },
  plugins: [ 
      ['@vuepress/back-to-top'],
      ['@vuepress/nprogress'],
      // 全文搜索：由官方 vuepress-plugin-fulltext-search 改造为异步/Worker 加载版
      // （搜索数据不再打进 app.js 主包，改为首次使用搜索时懒加载 search-data.json + Web Worker 建索引）
      [
        require('./plugins/fulltext-search-async.js'),
        {
          tokenize: 'full',
          split: /\s+/,
          encode: 'icase'
        }
      ],
      'vuepress-plugin-right-anchor',{
        showDepth: 3,
        ignore: [
          '/',
          // 英文站点首页/占位页不显示右侧锚点目录
          '/en/',
	  '/14-greatsql-demo/greatsql-live-sql',
	  '/en/14-greatsql-demo/greatsql-live-sql',
	  '/14-greatsql-demo/greatsql-live-mgr',
	  '/en/14-greatsql-demo/greatsql-live-mgr',
        ],
        expand: {
          trigger: 'click',  //'hover' | 'click'
          clickModeDefaultOpen: true
        },
        customClass: 'your-customClass',
        disableGlobalUI: false,
      },
      '@vuepress/medium-zoom', {
        selector: 'img.zoom-custom-imgs',
        options: {
          margin: 16
	}
      },
      '@vuepress/active-header-links', {
        sidebarLinkSelector: '.sidebar-link',
        headerAnchorSelector: '.header-anchor'
      },
      'vuepress-plugin-copy-code',{
        selector: 'div[class*="language-"] pre',
        align: 'top',
      },
  ],
  markdown: {
    lineNumbers: true,
    anchor: { permalink: true, permalinkBefore: true, permalinkSymbol: '§' },
  },
  themeConfig: {
    logo: 'https://greatsql.cn/template/greatdb/images/logo.png',
    displayAllHeaders: false,  // 显示所有页面的标题链接
    activeHeaderLinks: false,  // 显示活动的标题链接
    nextLinks: true,
    prevLinks: true,
    smoothScroll: true,
    search: true,
    searchMaxSuggestions: 10,
//    algolia: {
//      apiKey: 'a316247f7329baf1440e6ba87989e266',
//      indexName: 'greatsql',
//      appId: '06SDKTERMM'
//    },
    lastUpdated: true, 
    repo: 'https://gitee.com/GreatSQL/GreatSQL',
    branch: 'greatsql-8.0.32-27',
    docsRepo: 'https://gitee.com/GreatSQL/GreatSQL-Manual',
    docsBranch: 'greatsql-8.0.32-27',
    editLinks: true,
    sidebar: require('./configs/sidebar-zh.js'),
    nav: require('./configs/nav-zh.js'),
    // ========== 多语言（i18n）配置 ==========
    // 中英文双站：/（中文，源文件在仓库根目录）+ /en/（英文，源文件在 en/ 目录）
    // 导航栏语言切换下拉由 VuePress 默认主题根据 locales 自动渲染
    locales: {
      '/': {
        label: '简体中文',
        selectText: '语言',
        ariaLabel: '选择语言',
        editLinkText: '帮助我们改善此页面',
        repoLabel: '查看源码',
        nav: require('./configs/nav-zh.js'),
        sidebar: require('./configs/sidebar-zh.js'),
      },
      '/en/': {
        label: 'English',
        selectText: 'Languages',
        ariaLabel: 'Select language',
        editLinkText: 'Help us improve this page',
        repoLabel: 'Source code',
        nav: require('./configs/nav-en.js'),
        sidebar: require('./configs/sidebar-en.js'),
      },
    },
    footer: {
        copyright: '©2023 GreatSQL All Rights Reserved. ( 京ICP备06057874号 )'
    }
  }
}
