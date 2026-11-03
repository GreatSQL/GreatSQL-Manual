// .vuepress/config.js
module.exports = {
  title: 'GreatSQL用户手册',
  base: '/docs/8.0.32-24/',
  debug: false,
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
	    hm.src = "https://hm.baidu.com/hm.js?764bde358e08c602c0d5f94f7b05eda4";
	    var s = document.getElementsByTagName("script")[0]; 
	    s.parentNode.insertBefore(hm, s);
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
      [
        'fulltext-search',
        {
          tokenize: 'full',
          split: /\s+/,
          encode: 'icase'
        }
      ],
      'vuepress-plugin-right-anchor',
      {
        showDepth: 2,
        ignore: [
          '/',
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
    //displayAllHeaders: true,
    displayAllHeaders: false,  // 显示所有页面的标题链接
    activeHeaderLinks: false,  // 显示活动的标题链接
    nextLinks: true,
    prevLinks: true,
    smoothScroll: true,
    search: true,
    searchMaxSuggestions: 10,
    lastUpdated: true, 
    repo: 'https://gitee.com/GreatSQL/GreatSQL',
    branch: 'greatsql-8.0.32-24',
    repoLabel: '查看源码',
    docsRepo: 'https://gitee.com/GreatSQL/GreatSQL-Manual',
    docsBranch: 'greatsql-8.0.32-24',
    editLinks: true,
    editLinkText: '帮助我们改善此页面',
    sidebar: [
      {
        'title': '发行说明',
        collapsable: false,
        sidebarDepth: 0,
        path: '/1-docs-intro/1-docs-intro',
        children: [
          '/1-docs-intro/1-1-notes-to-users',
          '/1-docs-intro/1-2-release-history',
          '/1-docs-intro/1-3-greatsql-features',
          '/1-docs-intro/1-4-issues-known',
          '/1-docs-intro/1-5-contribute-to-greatsql',
          '/1-docs-intro/1-6-community-rules',
          '/1-docs-intro/1-8-community-toc',
          '/1-docs-intro/1-7-thanks'
        ]
      },
      {
        'title': '关于GreatSQL',
        collapsable: false,
        sidebarDepth: 0,
        path: '/2-about-greatsql/0-about-greatsql',
        children: [
          '/2-about-greatsql/1-greatsql-brief-intro',
          '/2-about-greatsql/2-greatsql-product-positioning',
          '/2-about-greatsql/3-greatsql-arch',
          '/2-about-greatsql/4-greatsql-log',
          '/2-about-greatsql/5-greatsql-limitations',
          '/2-about-greatsql/6-greatsql-glossary',
          '/2-about-greatsql/7-greatsql-keywords'
        ]
      },
      {
        'title': '快速上手',
        collapsable: false,
        sidebarDepth: 0,
        path: '/3-quick-start/3-quick-start',
        children: [
          '/3-quick-start/3-1-quick-start-with-rpm',
          '/3-quick-start/3-2-quick-start-with-tarball',
          '/3-quick-start/3-3-quick-start-with-docker',
          '/3-quick-start/3-4-quick-start-dbrw'

        ]
      },
      {
        'title': '安装指南',
        collapsable: false,
        sidebarDepth: 0,
        path: '/4-install-guide/0-install-guide',
        children: [
          '/4-install-guide/1-install-prepare',
          '/4-install-guide/2-install-with-rpm',
          '/4-install-guide/3-install-with-tarball',
          '/4-install-guide/4-install-with-docker',
          '/4-install-guide/5-install-with-ansible',
          '/4-install-guide/6-install-with-source-code',
          '/4-install-guide/7-load-sampledb'
        ]
      },
      {
        'title': 'GreatSQL增强',
        collapsable: false,
        sidebarDepth: 0,
        path: '/5-enhance/5-enhance',
        children: [
          '/5-enhance/5-1-highperf',
          '/5-enhance/5-2-ha',
          '/5-enhance/5-3-easyuse',
          '/5-enhance/5-4-security'
        ]
      },
      {
        'title': '运维管理',
        collapsable: false,
        sidebarDepth: 0,
        path: '/6-oper-guide/0-oper-guide',
        children: [
          '/6-oper-guide/1-basic-oper',
          '/6-oper-guide/2-oper-rw-splitting',
          '/6-oper-guide/3-monitoring-and-alerting',
          '/6-oper-guide/4-backup-and-restore',
          '/6-oper-guide/5-multi-instances',
          '/6-oper-guide/6-avoid-mistakes'
        ]
      },
      {
        'title': '迁移升级',
        collapsable: false,
        sidebarDepth: 0,
        path: '/7-migrate-and-upgrade/0-migrate-and-upgrade',
        children: [
          '/7-migrate-and-upgrade/1-upgrade-to-greatsql8',
          '/7-migrate-and-upgrade/2-migrate-from-mysql-togreatsql',
          '/7-migrate-and-upgrade/3-migrate-from-percona-to-greatsql'
        ]
      },
      {
        'title': 'MGR基础',
        collapsable: false,
        sidebarDepth: 0,
        path: '/8-mgr/0-mgr-fundamentals',
        children: [
          '/8-mgr/1-mgr-introduction',
          '/8-mgr/2-mgr-install-deploy',
          '/8-mgr/3-mgr-maintain-admin',
          '/8-mgr/4-mgr-status-monitor',
          '/8-mgr/5-mgr-readwrite-split',
          '/8-mgr/6-mgr-data-security',
          '/8-mgr/7-mgr-performance-tuning',
          '/8-mgr/8-mgr-best-practices'
        ]
      },
      {
        'title': '高可用架构',
        collapsable: false,
        sidebarDepth: 0,
        path: '/9-ha/0-ha',
        children: [
          '/9-ha/1-ha-single-machine-multi-instance',
          '/9-ha/5-ha-single-vlan',
          '/9-ha/2-ha-single-idc',
          '/9-ha/3-ha-same-city-multi-idc',
          '/9-ha/4-ha-multi-city-multi-idc'
        ]
      },
      {
        'title': '性能优化',
        collapsable: false,
        sidebarDepth: 0,
        path: '/10-optimze/0-optimze',
        children: [
          '/10-optimze/1-hardware-and-os-optimze',
          '/10-optimze/2-greatsql-optimze',
          '/10-optimze/3-performance-benchmark'
        ]
      },
      {
        'title': '常见问题/FAQ',
        collapsable: false,
        sidebarDepth: 0,
        path: '/11-faq/0-faq',
        children: [
          '/11-faq/1-faq-greatsql',
          '/11-faq/2-faq-mgr-oper',
          '/11-faq/3-faq-mgr-arch',
          '/11-faq/4-faq-mgr-monitor',
          '/11-faq/5-faq-others'
        ]
      },
      {
        'title': '联系我们',
        collapsable: false,
        sidebarDepth: 0,
        path: 'docs/contact'
      },
    ],
    nav: [
      { text: '8.0.32-24', 
        items: [
        {text: '8.4.4-5',   link: 'https://greatsql.cn/docs/8.4.4-5/',   target: '_self'},
        {text: '8.4.4-4',   link: 'https://greatsql.cn/docs/8.4.4-4/index.html',  target: '_self'},
        {text: '8.0.32-27', link: 'http://greatsql.cn/docs/8.0.32-27/index.html', target: '_self'},
        {text: '8.0.32-26', link: 'http://greatsql.cn/docs/8.0.32-26/index.html', target: '_self'},
        {text: '8.0.32-25', link: 'http://greatsql.cn/docs/8.0.32-25/index.html', target: '_self'},
        {text: '8.0.32-24', link: 'http://greatsql.cn/docs/8.0.32-24/index.html', target: '_self'},
        {text: '8.0.25-17', link: 'http://greatsql.cn/docs/8.0.25-17/index.html', target: '_self'},
            ]
      },
      { text: 'GreatSQL社区', link: 'https://greatsql.cn/' },
      { text: 'Gitee', link: 'https://gitee.com/GreatSQL/GreatSQL' },
      { text: 'Github', link: 'https://github.com/GreatSQL/GreatSQL' },
      { text: '错误反馈', link: 'https://greatsql.cn/forum-39-1.html' },
    ],
    footer: {
        copyright: '©2023 GreatSQL All Rights Reserved. ( 京ICP备06057874号 )'
    }
  }
}
