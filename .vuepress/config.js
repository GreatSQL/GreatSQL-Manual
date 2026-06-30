// .vuepress/config.js

module.exports = {
  title: 'GreatSQL用户手册',
  base: '/docs/8.4.4-5/',
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
      'vuepress-plugin-right-anchor',{
        showDepth: 3,
        ignore: [
          '/',
	  '/14-greatsql-demo/greatsql-live-demo',
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
    lastUpdated: true, 
    repo: 'https://gitee.com/GreatSQL/GreatSQL',
    branch: 'greatsql-8.4.4-5',
    repoLabel: '查看源码',
    docsRepo: 'https://gitee.com/GreatSQL/GreatSQL-Manual',
    docsBranch: 'greatsql-8.4.4-5',
    editLinks: true,
    editLinkText: '帮助我们改善此页面',
    sidebar: [
      {
        title: '基础信息',
        //path: '/1-docs-intro/1-1-notes-to-users',
        collapsable: true,
        sidebarDepth: 0,
	initialOpenGroupIndex: -1,
        children: [
          '/1-docs-intro/1-1-notes-to-users',
	  {
            title: '版本历史',
	    //path: '/1-docs-intro/relnotes/changes-greatsql-8-0-32-26-20240805',
            children: [
	      {
                title: 'GreatSQL 8.4',
	        sidebarDepth: 0,
	        children: [
                  {
                    title: '8.4.4-5',
		    path: '/1-docs-intro/relnotes/changes-greatsql-8445',
                  },
                  {
                    title: '8.4.4-4',
		    path: '/1-docs-intro/relnotes/changes-greatsql-8444',
                  },
		],
	      },
	      {
                title: 'GreatSQL 8.0',
	        sidebarDepth: 0,
                //path: '/1-docs-intro/relnotes/changes-greatsql-8-0-32-26-20240805',
	        children: [
                  {
                    title: '8.0.32-27',
                    path: '/1-docs-intro/relnotes/changes-greatsql-8-0-32-27',
                  },
                  {
                    title: '8.0.32-26',
                    path: '/1-docs-intro/relnotes/changes-greatsql-8-0-32-26-20240805',
                  },
                  {
                    title: '8.0.32-25',
                    path: '/1-docs-intro/relnotes/changes-greatsql-8-0-32-25-20231228',
                  },
                  {
                    title: '8.0.32-24',
                    path: '/1-docs-intro/relnotes/changes-greatsql-8-0-32-24-20230605',
                  },
                  {
                    title: '8.0.25-17',
                    path: '/1-docs-intro/relnotes/changes-greatsql-8-0-25-17-20230313',
                  },
                  {
                    title: '8.0.25-16',
                    path: '/1-docs-intro/relnotes/changes-greatsql-8-0-25-16-20220516',
                  },
                  {
                    title: '8.0.25-15',
                    path: '/1-docs-intro/relnotes/changes-greatsql-8-0-25-20210820',
                  },
		],
	      },
	      {
                title: 'GreatSQL 5.7',
                path: '/1-docs-intro/relnotes/changes-greatsql-5-7-36-20220407',
	      },
            ]
	  },
          '/1-docs-intro/1-3-greatsql-features',
          '/1-docs-intro/1-4-issues-known',
          '/1-docs-intro/1-5-glossary',
        ]
      },
      {
        'title': '关于 GreatSQL',
        collapsable: true,
        sidebarDepth: 0,
        //path: '/2-about-greatsql/1-greatsql-brief-intro',
        children: [
          '/2-about-greatsql/1-greatsql-brief-intro',
          '/2-about-greatsql/2-greatsql-product-positioning',
          '/2-about-greatsql/3-greatsql-arch',
	  {
            title: 'GreatSQL日志',
	    sidebarDepth: 0,
            //path: '/2-about-greatsql/4-greatsql-log',
            children: [
              {
	        title: '错误日志（Error Log）',
	        path: '/2-about-greatsql/4-1-greatsql-error-log',
	      },
              {
	        title: '慢查询日志（Slow Query Log）',
	        path: '/2-about-greatsql/4-2-greatsql-slow-log',
	      },
              {
	        title: '二进制日志（Binary Log）',
	        path: '/2-about-greatsql/4-3-greatsql-binary-log',
	      },
              {
	        title: '中继日志（Relay Log）',
	        path: '/2-about-greatsql/4-4-greatsql-relay-log',
	      },
              {
	        title: '重做日志（Redo Log）',
	        path: '/2-about-greatsql/4-5-greatsql-redo-log',
	      },
              {
	        title: '撤销日志（Undo Log）',
	        path: '/2-about-greatsql/4-6-greatsql-undo-log',
	      },
              {
	        title: '通用日志（General Log）',
	        path: '/2-about-greatsql/4-7-greatsql-general-log',
	      },
	    ],
	  },
          '/2-about-greatsql/5-greatsql-limitations',
          '/2-about-greatsql/7-greatsql-keywords'
        ]
      },
      {
        'title': '快速上手',
        collapsable: true,
        sidebarDepth: 0,
        //path: '/3-quick-start/3-1-quick-start-with-rpm',
        children: [
          '/3-quick-start/3-1-quick-start-with-rpm',
          '/3-quick-start/3-2-quick-start-with-tarball',
          '/3-quick-start/3-3-quick-start-with-docker',
	  '/3-quick-start/3-4-quick-start-with-cnf',
          '/3-quick-start/3-5-quick-start-dbrw'
        ]
      },
      {
        'title': '应用开发',
        collapsable: true,
        sidebarDepth: 0,
        //path: '/12-dev-guide/12-dev-guide',
        children: [
	  {
            title: '连接到 GreatSQL',
            //path: '/12-dev-guide/12-1-1-cw-cli',
	    sidebarDepth: 0,
            children: [
	      {
                title: '通过GreatSQL客户端连接',
                path: '/12-dev-guide/12-1-1-cw-cli',
	      },
	      {
                title: '通过GUI客户端连接',
                path: '/12-dev-guide/12-1-2-cw-gui',
	      },
	      {
                title: '选择驱动连接',
                path: '/12-dev-guide/12-1-3-cw-drive',
	      },
	      {
                title: '线程池 & 连接参数',
                path: '/12-dev-guide/12-1-4-cw-threadpool',
	      },
	      {
                title: '字符集、校验集',
                path: '/12-dev-guide/12-1-5-cw-charset',
	      },
	      {
                title: 'sql_mode（SQL模式）',
                path: '/12-dev-guide/12-1-6-sql-mode',
	      },
            ]
	  },
	  {
            title: '模式开发设计',
	    path: '/12-dev-guide/12-2-1-dp-guide',
	    sidebarDepth: 0,
            children: [
	      {
                title: 'Schema/库管理',
                path: '/12-dev-guide/12-2-2-dp-schema',
	      },
	      {
                title: 'Table/表管理',
                path: '/12-dev-guide/12-2-3-dp-table',
	      },
	      {
                title: 'Index/索引管理',
                path: '/12-dev-guide/12-2-4-dp-index',
	      },
	      {
                title: 'View/视图',
                path: '/12-dev-guide/12-2-5-dp-view',
	      },
	      {
                title: 'Stored Routines/存储程序',
                path: '/12-dev-guide/12-2-6-dp-stored-routines',
	      },
	      {
                title: 'Trigger/触发器',
                path: '/12-dev-guide/12-2-7-dp-trigger',
	      },
	      {
                title: 'Event Scheduler/事件调度器',
                path: '/12-dev-guide/12-2-8-dp-event',
	      },
	      {
                title: 'PARTITION/分区',
                path: '/12-dev-guide/12-2-9-dp-partition',
	      },
	      {
                title: '数据类型',
                path: '/12-dev-guide/12-2-10-datatype',
	      },
            ]
	  },
	  {
            title: '数据写入&修改',
            //path: '/12-dev-guide/12-3-1-data-insert',
	    sidebarDepth: 0,
            children: [
	      {
                title: 'INSERT插入数据',
                path: '/12-dev-guide/12-3-1-data-insert',
	      },
	      {
                title: 'UPDATE更新数据',
                path: '/12-dev-guide/12-3-2-data-update',
	      },
	      {
                title: 'DELETE删除数据',
                path: '/12-dev-guide/12-3-3-data-delete',
	      },
	      {
                title: 'REPLACE替换数据',
                path: '/12-dev-guide/12-3-4-data-replace',
	      },
	      {
                title: 'PREPARE预处理语句',
                path: '/12-dev-guide/12-3-5-data-prepare',
	      },
	      {
                title: '生成随机测试数据',
                path: '/12-dev-guide/12-3-6-gen-random-data',
	      },
	      {
                title: '使用sysbench生成测试数据',
                path: '/12-dev-guide/12-3-7-gen-sysbench-data',
	      },
            ]
	  },
	  {
            title: '数据查询',
            //path: '/12-dev-guide/12-4-1-data-select-single-table',
	    sidebarDepth: 0,
            children: [
	      {
                title: '单表查询',
                path: '/12-dev-guide/12-4-1-data-select-single-table',
	      },
	      {
                title: '多表关联查询',
                path: '/12-dev-guide/12-4-2-data-select-multi-table',
	      },
	      {
                title: '子查询',
                path: '/12-dev-guide/12-4-3-data-select-subquery',
	      },
	      {
                title: '支持的函数',
                path: '/12-dev-guide/12-4-4-functions',
	      },
	      {
                title: '窗口函数',
                path: '/12-dev-guide/12-4-5-window-funcs',
	      },
            ]
	  },
	  {
            title: '高兼容（Oracle兼容）',
            path: '/5-enhance/5-3-easyuse',
	    sidebarDepth: 0,
            children: [
	      {
                title: '数据类型兼容',
                path: 'https://greatsql.cn/docs/8.4.4-5/5-enhance/5-3-easyuse.html#%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B%E5%85%BC%E5%AE%B9',
	      },
	      {
                title: 'SQL语法兼容',
                path: 'https://greatsql.cn/docs/8.4.4-5/5-enhance/5-3-easyuse.html#sql%E8%AF%AD%E6%B3%95%E5%85%BC%E5%AE%B9',
	      },
	      {
                title: '函数兼容',
                path: 'https://greatsql.cn/docs/8.4.4-5/5-enhance/5-3-easyuse.html#%E5%87%BD%E6%95%B0%E5%85%BC%E5%AE%B9',
	      },
	      {
                title: '存储程序兼容',
                path: 'https://greatsql.cn/docs/8.4.4-5/5-enhance/5-3-easyuse.html#%E5%AD%98%E5%82%A8%E7%A8%8B%E5%BA%8F%E5%85%BC%E5%AE%B9',
	      },
	      {
                title: 'Oracle兼容常见问题',
                path: '/5-enhance/5-3-sql-compat-faq',
	      },
            ]
	  },
	  {
            title: '事务控制',
	    sidebarDepth: 0,
            //path: '/12-dev-guide/12-6-trx-overview',
            children: [
	      {
                title: '事务概述',
                path: '/12-dev-guide/12-6-trx-overview',
	      },
	      {
                title: '事务管理',
                path: '/12-dev-guide/12-6-1-trx-control',
	      },
	      {
                title: '事务隔离级别',
                path: '/12-dev-guide/12-6-2-trx-isolation',
	      },
	      {
                title: '事务并发及锁机制',
                path: '/12-dev-guide/12-6-3-trx-mvcc-and-locking',
	      },
	      {
                title: '事务错误处理',
                path: '/12-dev-guide/12-6-4-trx-troubleshoot',
	      },
            ]
	  },
	  {
            title: '优化SQL性能',
	    sidebarDepth: 0,
            path: '/12-dev-guide/12-7-sql-optimize-overview',
            children: [
	      {
                title: 'Schema设计优化',
                path: '/12-dev-guide/12-7-1-sql-optimize-schema-design',
	      },
	      {
                title: 'SQL开发优化',
                path: '/12-dev-guide/12-7-2-sql-optimize-sql-dev',
	      },
	      {
                title: '存储引擎选择',
                path: '/12-dev-guide/12-7-3-sql-optimize-engines',
	      },
	      {
                title: '慢查询SQL分析优化',
                path: '/12-dev-guide/12-7-4-sql-optimize-slowsql',
	      },
            ]
	  },
	  {
            title: '常见报错',
            //path: '/12-dev-guide/12-8-2-error-connection-failure',
	    sidebarDepth: 0,
            children: [
	      {
                title: '数据库连接失败',
                path: '/12-dev-guide/12-8-2-error-connection-failure',
	      },
	      {
                title: '数据库读写失败',
                path: '/12-dev-guide/12-8-3-error-create-write',
	      },
	      {
                title: '数据库查询失败',
                path: '/12-dev-guide/12-8-4-error-select',
	      },
	      {
                title: '其他常见报错处理',
                path: '/12-dev-guide/12-8-5-error-other',
	      },
	      {
                title: '常见错误码对照表',
                path: '/12-dev-guide/12-8-1-error-code-reference',
	      },
            ]
	  },
        ]
      },
      {
        'title': '安装指南',
        collapsable: true,
        sidebarDepth: 0,
        //path: '/4-install-guide/1-install-prepare',
        children: [
          '/4-install-guide/1-install-prepare',
          '/4-install-guide/2-install-with-rpm',
	  {
            title: '二进制包安装',
	    sidebarDepth: 0,
            //path: '/4-install-guide/3-install-with-tarball',
            children: [
	      {
	        title: 'CentOS环境安装',
	        path: '/4-install-guide/3-1-centos-install',
	      },
	      {
	        title: 'Ubuntu环境安装',
	        path: '/4-install-guide/3-2-ubuntu-install',
	      },
	      {
	        title: 'openEuler环境安装',
	        path: '/4-install-guide/3-3-openeuler-install',
	      },
	      {
	        title: '统信UOS环境中安装',
	        path: '/4-install-guide/3-4-uos-install',
	      },
	      {
	        title: '龙蜥Anolis环境安装',
	        path: '/4-install-guide/3-5-anolis-install',
	      },
	      {
	        title: '麒麟Kylin环境安装',
	        path: '/4-install-guide/3-6-kylin-install',
	      },
	      {
	        title: 'Arch Linux环境安装',
	        path: '/4-install-guide/3-7-arch-install',
	      },
	    ],
	  },
          '/4-install-guide/4-install-with-docker',
          '/4-install-guide/5-install-with-ansible',
          '/4-install-guide/6-install-with-source-code',
          '/4-install-guide/7-load-sampledb',
          '/4-install-guide/8-greatsql-with-systemd',
          '/4-install-guide/9-custom-cnf-file-path.md',
          '/4-install-guide/10-uninstall-greatsql',
        ]
      },
      {
        'title': 'GreatSQL增强',
        collapsable: true,
        sidebarDepth: 0,
        //path: '/5-enhance/5-2-ha',
        children: [
	  {
            title: '高可用',
            path: '/5-enhance/5-2-ha',
	    sidebarDepth: 0,
            children: [
	      {
                title: 'MGR地理标签',
                path: '/5-enhance/5-2-ha-mgr-zoneid',
	      },
	      {
                title: 'MGR内置动态VIP',
                path: '/5-enhance/5-2-ha-mgr-vip',
	      },
	      {
                title: 'MGR切主后断开应用连接',
                path: '/5-enhance/5-2-ha-mgr-kill-conn-after-switch',
	      },
	      {
                title: 'MGR仲裁节点',
                path: '/5-enhance/5-2-ha-mgr-arbitrator',
	      },
	      {
                title: 'MGR快速单主模式',
                path: '/5-enhance/5-2-ha-mgr-fast-mode',
	      },
	      {
                title: 'MGR智能选主',
                path: '/5-enhance/5-2-ha-mgr-election-mode',
	      },
	      {
                title: 'MGR全新流控算法',
                path: '/5-enhance/5-2-ha-mgr-new-fc',
	      },
	      {
                title: 'MGR网络开销阈值',
                path: '/5-enhance/5-2-ha-mgr-request-time',
	      },
	      {
                title: '主主复制防止回路',
                path: '/5-enhance/5-2-ha-repl-server-mode',
	      },
	      {
                title: 'Binlog读取限速',
                path: '/5-enhance/5-2-ha-binlog-speed-limit',
	      },
	      {
                title: '恢复部分主从复制兼容接口',
                path: '/5-enhance/5-2-ha-repl-interface-cmd',
	      },
	      {
                title: '其他高可用优化提升',
                path: '/5-enhance/5-2-ha-mgr-improved',
	      }
	    ],
	  },
	  {
            title: '高性能',
            path: '/5-enhance/5-1-highperf',
	    sidebarDepth: 0,
            children: [
	      {
                title: 'Turbo引擎',
                path: '/5-enhance/5-1-highperf-turbo-engine',
	      },
	      {
                title: 'Turbo 引擎向量相似度查询',
                path: '/5-enhance/5-1-highperf-vector-search',
	      },
	      {
                title: 'Rapid引擎',
                path: '/5-enhance/5-1-highperf-rapid-engine',
	      },
	      {
                title: '大事务 binlog 独立落盘优化',
                path: '/5-enhance/5-1-highperf-binlog-flush-opt-large-trx',
	      },
	      {
                title: '并行复制回放优化',
                path: '/5-enhance/5-1-highperf-parallel-replica',
	      },
	      {
                title: '执行计划变更异常捕获',
                path: '/5-enhance/5-1-highperf-execplan-baseline',
	      },
	      {
                title: '并行LOAD DATA',
                path: '/5-enhance/5-1-highperf-parallel-load',
	      },
	      {
                title: '异步删除大表',
                path: '/5-enhance/5-1-highperf-async-purge-big-table',
	      },
	      {
                title: '非阻塞式 DDL',
                path: '/5-enhance/5-1-highperf-nonblocking-ddl',
	      },
	      {
                title: 'NUMA亲和性优化',
                path: '/5-enhance/5-1-highperf-numa-affinity',
	      },
	      {
                title: '线程池',
                path: '/5-enhance/5-1-highperf-thread-pool',
	      },
	    ],
	  },
	  {
            title: '高兼容（Oracle兼容）',
            path: '/5-enhance/5-3-easyuse',
	    sidebarDepth: 0,
            children: [
	      {
                title: '数据类型兼容',
                path: 'https://greatsql.cn/docs/8.4.4-5/5-enhance/5-3-easyuse.html#%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B%E5%85%BC%E5%AE%B9',
	      },
	      {
                title: 'SQL语法兼容',
                path: 'https://greatsql.cn/docs/8.4.4-5/5-enhance/5-3-easyuse.html#sql%E8%AF%AD%E6%B3%95%E5%85%BC%E5%AE%B9',
	      },
	      {
                title: '函数兼容',
                path: 'https://greatsql.cn/docs/8.4.4-5/5-enhance/5-3-easyuse.html#%E5%87%BD%E6%95%B0%E5%85%BC%E5%AE%B9',
	      },
	      {
                title: '存储程序兼容',
                path: 'https://greatsql.cn/docs/8.4.4-5/5-enhance/5-3-easyuse.html#%E5%AD%98%E5%82%A8%E7%A8%8B%E5%BA%8F%E5%85%BC%E5%AE%B9',
	      },
	      {
                title: 'Oracle兼容常见问题',
                path: '/5-enhance/5-3-sql-compat-faq',
	      },
            ]
	  },
	  {
            title: '高安全',
            path: '/5-enhance/5-4-security',
	    sidebarDepth: 0,
            children: [
	      {
                title: 'mysqldump备份加密',
                path: '/5-enhance/5-4-security-mysqldump-encrypt',
	      },
	      {
                title: 'Clone备份加密',
                path: '/5-enhance/5-4-security-clone-encrypt',
	      },
	      {
                title: '审计',
                path: '/5-enhance/5-4-security-audit',
	      },
	      {
                title: '国密支持',
                path: '/5-enhance/5-4-security-encrypt-with-gmssl',
	      },
	      {
                title: '数据脱敏',
                path: '/5-enhance/5-4-security-data-masking',
	      },
	    ],
	  },
	  {
            title: '其他',
            path: '/5-enhance/5-5-others',
	    sidebarDepth: 0,
            children: [
	      {
                title: 'Clone压缩及增量备份',
                path: '/5-enhance/5-5-clone-compressed-and-incrment-backup',
	      },
	      {
                title: 'InnoDB Page压缩',
                path: '/5-enhance/5-5-innodb-page-compression',
	      },
	    ],
	  },

        ]
      },
      {
        'title': '运维管理',
        collapsable: true,
        sidebarDepth: 0,
        //path: '/6-oper-guide/1-basic-oper',
        children: [
          '/6-oper-guide/1-basic-oper',
          '/6-oper-guide/2-oper-rw-splitting',
          '/6-oper-guide/3-monitoring-and-alerting',
	  {
            title: '备份恢复',
            path: '/6-oper-guide/4-backup-and-restore',
	    sidebarDepth: 0,
            children: [
	      {
                title: '逻辑备份恢复',
                path: '/6-oper-guide/4-1-mysqldump',
	        sidebarDepth: 0,
	        children: [
		  {
		    title: 'mysqldump备份恢复',
		    path: '/6-oper-guide/4-1-mysqldump',
		  },
		  {
		    title: 'OUTFILE备份恢复',
		    path: '/6-oper-guide/4-2-outfile',
		  },
		  {
		    title: 'MySQL Shell备份恢复',
		    path: '/6-oper-guide/4-3-shell-util',
		  },
		],
	      },
	      {
                title: '物理备份恢复',
                path: '/6-oper-guide/4-4-physical-backup',
	      },
	      {
                title: 'Clone备份恢复',
                path: '/6-oper-guide/4-5-clone',
	      },
	    ],
	  },
          '/6-oper-guide/5-multi-instances',
	  {
            title: '运维特性增强',
            path: '/6-oper-guide/6-feature-enhancement',
	    sidebarDepth: 0,
            children: [
	      {
	        title: '用户统计',
	        path: '/6-oper-guide/6-1-user-statistics',
	        sidebarDepth: 0,
                children: [
		  {
		    title: '客户端统计',
		    path: '/6-oper-guide/6-1-1-client-statistics',
		  },
		  {
		    title: '索引统计',
		    path: '/6-oper-guide/6-1-2-index-statistics',
		  },
		  {
		    title: '表统计',
		    path: '/6-oper-guide/6-1-3-table-statistics',
		  },
		  {
		    title: '线程统计',
		    path: '/6-oper-guide/6-1-4-thread-statistics',
		  },
		  {
		    title: '用户统计',
		    path: '/6-oper-guide/6-1-5-user-statistics',
		  },
		],
	      },
	      '/6-oper-guide/6-2-procfs-plugin',
	      '/6-oper-guide/6-3-compressed-columns',
	      '/6-oper-guide/6-4-extended-innodb-status',
	      '/6-oper-guide/6-5-extended-show-grants',
	      '/6-oper-guide/6-6-handle-corrupted-tables',
	      '/6-oper-guide/6-7-kill-idle-trx',
	      '/6-oper-guide/6-8-other-tables',
	    ],
	  },
          '/6-oper-guide/7-avoid-mistakes',
          '/6-oper-guide/8-troubleshooting',
          '/6-oper-guide/9-daily-health-check',
	  {
	    title: 'Percona Toolkit',
	    path: '/6-oper-guide/10-percona-toolkit',
	    sidebarDepth: 0,
	    children: [
	      {
	        title: '实用类',
	        path: '/6-oper-guide/10-1-pt-practical',
	        sidebarDepth: 0,
	        children: [
                  {
		    title: 'pt-archiver',
		    path: 'http://greatsql.cn/docs/8.4.4-5/6-oper-guide/10-1-pt-practical.html#pt-archiver',
		  },
                  {
		    title: 'pt-kill',
		    path: 'http://greatsql.cn/docs/8.4.4-5/6-oper-guide/10-1-pt-practical.html#pt-kill',
		  },
		],
	      },
	      {
	        title: '配置类',
	        path: '/6-oper-guide/10-2-pt-configuration',
	        sidebarDepth: 0,
	        children: [
                  {
		    title: 'pt-config-diff',
		    path: 'http://greatsql.cn/docs/8.4.4-5/6-oper-guide/10-2-pt-configuration.html#pt-config-diff',
		  },
                  {
		    title: 'pt-mysql-summary',
		    path: 'http://greatsql.cn/docs/8.4.4-5/6-oper-guide/10-2-pt-configuration.html#pt-mysql-summary',
		  },
                  {
		    title: 'pt-variable-advisor',
		    path: 'http://greatsql.cn/docs/8.4.4-5/6-oper-guide/10-2-pt-configuration.html#pt-variable-advisor',
		  },
		],
	      },
	      {
	        title: '监控类',
	        path: '/6-oper-guide/10-3-pt-monitoring',
	        sidebarDepth: 0,
	        children: [
                  {
		    title: 'pt-query-digest',
		    path: 'http://greatsql.cn/docs/8.4.4-5/6-oper-guide/10-3-pt-monitoring.html#pt-query-digest',
		  },
                  {
		    title: 'pt-mext',
		    path: 'http://greatsql.cn/docs/8.4.4-5/6-oper-guide/10-3-pt-monitoring.html#pt-mext',
		  },
		],
	      },
	      {
	        title: '系统类',
	        path: '/6-oper-guide/10-4-pt-system',
	        sidebarDepth: 0,
	        children: [
                  {
		    title: 'pt-diskstats',
		    path: 'http://greatsql.cn/docs/8.4.4-5/6-oper-guide/10-4-pt-system.html#pt-diskstats',
		  },
                  {
		    title: 'pt-stalk',
		    path: 'http://greatsql.cn/docs/8.4.4-5/6-oper-guide/10-4-pt-system.html#pt-stalk',
		  },
                  {
		    title: 'pt-summary',
		    path: 'http://greatsql.cn/docs/8.4.4-5/6-oper-guide/10-4-pt-system.html#pt-summary',
		  },
		],
	      },
	      {
	        title: '开发类',
	        path: '/6-oper-guide/10-5-pt-development',
	        sidebarDepth: 0,
	        children: [
                  {
		    title: 'pt-online-schema-change',
		    path: 'http://greatsql.cn/docs/8.4.4-5/6-oper-guide/10-5-pt-development.html#pt-online-schema-change',
		  },
                  {
		    title: 'pt-show-grants',
		    path: 'http://greatsql.cn/docs/8.4.4-5/6-oper-guide/10-5-pt-development.html#pt-show-grants',
		  },
		],
	      },
	      {
	        title: '复制类',
	        path: '/6-oper-guide/10-6-pt-replication',
	        sidebarDepth: 0,
	        children: [
                  {
		    title: 'pt-table-checksum',
		    path: 'http://greatsql.cn/docs/8.4.4-5/6-oper-guide/10-6-pt-replication.html#pt-table-checksum',
		  },
                  {
		    title: 'pt-table-sync',
		    path: 'http://greatsql.cn/docs/8.4.4-5/6-oper-guide/10-6-pt-replication.html#pt-table-sync',
		  },
		],
	      },
	      {
	        title: '性能类',
	        path: '/6-oper-guide/10-7-pt-performance',
	        sidebarDepth: 0,
	        children: [
                  {
		    title: 'pt-pmp',
		    path: 'http://greatsql.cn/docs/8.4.4-5/6-oper-guide/10-7-pt-performance.html#pt-pmp',
		  },
		],
	      },
	    ],
	  },
	  {title: 'gt-checksum', path: 'https://gitee.com/GreatSQL/gt-checksum/blob/master/gt-checksum-manual.md'},
        ]
      },
      {
        'title': '迁移升级',
        collapsable: true,
        sidebarDepth: 0,
        //path: '/7-migrate-and-upgrade/1-upgrade-to-greatsql8',
        children: [
          '/7-migrate-and-upgrade/1-upgrade-to-greatsql8',
          '/7-migrate-and-upgrade/2-migrate-from-mysql-togreatsql',
          '/7-migrate-and-upgrade/3-migrate-from-percona-to-greatsql',
          '/7-migrate-and-upgrade/4-migrate-from-mariadb-to-greatsql'
        ]
      },
      {
        'title': 'MGR（组复制）',
        collapsable: true,
        sidebarDepth: 0,
        //path: '/8-mgr/1-mgr-introduction',
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
        collapsable: true,
        sidebarDepth: 0,
        //path: '/9-ha/1-ha-single-machine-multi-instance',
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
        collapsable: true,
        sidebarDepth: 0,
        //path: '/10-optimize/0-optimize',
        children: [
          '/10-optimize/1-hardware-and-os-optimize',
	  {
            title: 'GreatSQL优化',
            path: '/10-optimize/2-greatsql-optimize',
	    sidebarDepth: 0,
            children: [
	      '/10-optimize/2-1-schema-design-refer',
	      '/10-optimize/2-2-sql-develop-refer',
	      '/12-dev-guide/12-7-4-sql-optimize-slowsql',
	      '/10-optimize/2-4-slow-update-diag',
	      '/10-optimize/2-5-rowlock-diag',
	      '/10-optimize/2-6-deadlock-diag',
	      '/10-optimize/2-7-mdllock-diag',
	    ],
	  },
	  {
            title: '性能测试',
            path: '/10-optimize/3-performance-benchmark',
	    sidebarDepth: 0,
            children: [
	      {title: 'sysbench测试', path: '/10-optimize/3-1-benchmark-sysbench'},
	      {title: 'BenchmarkSQL测试', path: '/10-optimize/3-4-benchmarksql'},
	      {title: 'TPC-H测试', path: '/10-optimize/3-2-benchmark-tpch'},
	    ],
	  },
        ]
      },
      {
        'title': '参考指南',
        collapsable: true,
        sidebarDepth: 0,
        //path: '/13-reference/1-index',
        children: [
	  {title: '索引', path: '/13-reference/1-index'},
	  {title: '保留字、关键字', path: '/2-about-greatsql/7-greatsql-keywords'},
	  {title: '系统参数变量、状态变量', path: '/13-reference/3-variables'},
	  {title: '优势特性', path: '/1-docs-intro/1-3-greatsql-features'},
	  {title: 'SQL兼容性', path: '/5-enhance/5-3-easyuse'},
	  {title: '应用开发', path: '/12-dev-guide/12-dev-guide'},
	  {title: '为什么升级到GreatSQL 8.4', path: '/7-migrate-and-upgrade/1-upgrade-to-greatsql8'},
	  {title: '认证资质与荣誉', path: '/13-reference/8-credential-and-honor'},
        ]
      },
      {
        'title': '常见问题/FAQ',
        collapsable: true,
        sidebarDepth: 0,
        //path: '/11-faq/1-faq-greatsql',
        children: [
          '/11-faq/1-faq-greatsql',
          '/11-faq/2-faq-mgr-oper',
          '/11-faq/3-faq-mgr-arch',
          '/11-faq/4-faq-mgr-monitor',
          '/11-faq/5-faq-others'
        ]
      },
    ],
    nav: [
      { text: '8.4.4-5', 
        items: [
        {text: '8.4.4-5',   link: 'https://greatsql.cn/docs/8.4.4-5/',   target: '_self'},
        {text: '8.4.4-4',   link: 'https://greatsql.cn/docs/8.4.4-4/',   target: '_self'},
        {text: '8.0.32-27', link: 'https://greatsql.cn/docs/8.0.32-27/', target: '_self'},
        {text: '8.0.32-26', link: 'https://greatsql.cn/docs/8.0.32-26/', target: '_self'},
        {text: '8.0.32-25', link: 'https://greatsql.cn/docs/8.0.32-25/', target: '_self'},
        {text: '8.0.32-24', link: 'https://greatsql.cn/docs/8.0.32-24/', target: '_self'},
        {text: '8.0.25-17', link: 'https://greatsql.cn/docs/8.0.25-17/', target: '_self'},
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
