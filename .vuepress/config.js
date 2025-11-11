// .vuepress/config.js

module.exports = {
  title: '',
  base: '/docs/community/',
  debug: false,
  head: [["script",
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
  ],
  markdown: {
    lineNumbers: true,
    anchor: { permalink: true, permalinkBefore: true, permalinkSymbol: '§' },
  },
  themeConfig: {
    logo: 'https://greatsql.cn/template/greatdb/images/logo.png',
    displayAllHeaders: false,  // 显示所有页面的标题链接
    activeHeaderLinks: false,  // 显示活动的标题链接
    nextLinks: false,
    prevLinks: false,
    smoothScroll: true,
    search: true,
    searchMaxSuggestions: 10,
    branch: 'community',
    sidebar: [
      {
        title: '参与贡献',
        path: '/',
      },
      {
        title: '社区行为守则',
        path: '2-community-rules',
      },
      {
        title: '社区治理',
        path: '3-community-toc',
      },
      {
        title: '培训认证',
        path: '4-greatsql-certified',
      },
      {
        title: '兼容性列表',
        path: '5-greatsql-adaptation',
      },
      {
        title: '致谢',
        path: '6-thanks',
      },
    ],
    nav: [
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
