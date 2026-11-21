// 英文侧边栏（由 scripts/translate-sidebar-titles.js 从 sidebar-zh.js 自动生成，
// 结构与中文版完全一致，仅标题为英文译法；内部路径均带 /en/ 前缀（英文 locale 根））
// 中文侧边栏（从 .vuepress/config.js 抽取，结构/路径保持不变）
module.exports = [
      {
        title: 'Basic Information',
        //path: '/en/1-docs-intro/1-1-notes-to-users',
        collapsable: true,
        sidebarDepth: 0,
	initialOpenGroupIndex: -1,
        children: [
          '/en/1-docs-intro/1-1-notes-to-users',
	  {
            title: 'Release History',
	    //path: '/en/1-docs-intro/relnotes/changes-greatsql-8-0-32-26-20240805',
            children: [
	      {
                title: 'GreatSQL 8.4',
	        sidebarDepth: 0,
	        children: [
                  {
                    title: '8.4.4-5',
		    path: '/en/1-docs-intro/relnotes/changes-greatsql-8445',
                  },
                  {
                    title: '8.4.4-4',
		    path: '/en/1-docs-intro/relnotes/changes-greatsql-8444',
                  },
		],
	      },
	      {
                title: 'GreatSQL 8.0',
	        sidebarDepth: 0,
                //path: '/en/1-docs-intro/relnotes/changes-greatsql-8-0-32-26-20240805',
	        children: [
                  {
                    title: '8.0.32-27',
                    path: '/en/1-docs-intro/relnotes/changes-greatsql-8-0-32-27',
                  },
                  {
                    title: '8.0.32-26',
                    path: '/en/1-docs-intro/relnotes/changes-greatsql-8-0-32-26-20240805',
                  },
                  {
                    title: '8.0.32-25',
                    path: '/en/1-docs-intro/relnotes/changes-greatsql-8-0-32-25-20231228',
                  },
                  {
                    title: '8.0.32-24',
                    path: '/en/1-docs-intro/relnotes/changes-greatsql-8-0-32-24-20230605',
                  },
                  {
                    title: '8.0.25-17',
                    path: '/en/1-docs-intro/relnotes/changes-greatsql-8-0-25-17-20230313',
                  },
                  {
                    title: '8.0.25-16',
                    path: '/en/1-docs-intro/relnotes/changes-greatsql-8-0-25-16-20220516',
                  },
                  {
                    title: '8.0.25-15',
                    path: '/en/1-docs-intro/relnotes/changes-greatsql-8-0-25-20210820',
                  },
		],
	      },
	      {
                title: 'GreatSQL 5.7',
                path: '/en/1-docs-intro/relnotes/changes-greatsql-5-7-36-20220407',
	      },
            ]
	  },
          '/en/1-docs-intro/1-3-greatsql-features',
          '/en/1-docs-intro/1-4-issues-known',
          '/en/1-docs-intro/1-5-glossary',
        ]
      },
      {
        'title': 'About GreatSQL',
        collapsable: true,
        sidebarDepth: 0,
        //path: '/en/2-about-greatsql/1-greatsql-brief-intro',
        children: [
          '/en/2-about-greatsql/1-greatsql-brief-intro',
          '/en/2-about-greatsql/2-greatsql-product-positioning',
          '/en/2-about-greatsql/3-greatsql-arch',
	  {
            title: 'GreatSQL Logs',
	    sidebarDepth: 0,
            //path: '/en/2-about-greatsql/4-greatsql-log',
            children: [
              {
	        title: 'Error Log',
	        path: '/en/2-about-greatsql/4-1-greatsql-error-log',
	      },
              {
	        title: 'Slow Query Log',
	        path: '/en/2-about-greatsql/4-2-greatsql-slow-log',
	      },
              {
	        title: 'Binary Log',
	        path: '/en/2-about-greatsql/4-3-greatsql-binary-log',
	      },
              {
	        title: 'Relay Log',
	        path: '/en/2-about-greatsql/4-4-greatsql-relay-log',
	      },
              {
	        title: 'Redo Log',
	        path: '/en/2-about-greatsql/4-5-greatsql-redo-log',
	      },
              {
	        title: 'Undo Log',
	        path: '/en/2-about-greatsql/4-6-greatsql-undo-log',
	      },
              {
	        title: 'General Log',
	        path: '/en/2-about-greatsql/4-7-greatsql-general-log',
	      },
	    ],
	  },
          '/en/2-about-greatsql/5-greatsql-limitations',
          '/en/2-about-greatsql/7-greatsql-keywords'
        ]
      },
      {
        'title': 'Quick Start',
        collapsable: true,
        sidebarDepth: 0,
        //path: '/en/3-quick-start/3-1-quick-start-with-rpm',
        children: [
          '/en/3-quick-start/3-1-quick-start-with-rpm',
          '/en/3-quick-start/3-2-quick-start-with-tarball',
          '/en/3-quick-start/3-3-quick-start-with-docker',
	  '/en/3-quick-start/3-4-quick-start-with-cnf',
          '/en/3-quick-start/3-5-quick-start-dbrw'
        ]
      },
      {
        'title': 'Application Development',
        collapsable: true,
        sidebarDepth: 0,
        //path: '/en/12-dev-guide/12-dev-guide',
        children: [
	  {
            title: 'Connecting to GreatSQL',
            //path: '/en/12-dev-guide/12-1-1-cw-cli',
	    sidebarDepth: 0,
            children: [
	      {
                title: 'Connect via GreatSQL Client',
                path: '/en/12-dev-guide/12-1-1-cw-cli',
	      },
	      {
                title: 'Connect via GUI Client',
                path: '/en/12-dev-guide/12-1-2-cw-gui',
	      },
	      {
                title: 'Choosing a Driver',
                path: '/en/12-dev-guide/12-1-3-cw-drive',
	      },
	      {
                title: 'Thread Pool & Connection Parameters',
                path: '/en/12-dev-guide/12-1-4-cw-threadpool',
	      },
	      {
                title: 'Character Sets & Collations',
                path: '/en/12-dev-guide/12-1-5-cw-charset',
	      },
	      {
                title: 'sql_mode (SQL Mode)',
                path: '/en/12-dev-guide/12-1-6-sql-mode',
	      },
            ]
	  },
	  {
            title: 'Schema Design & Development',
	    path: '/en/12-dev-guide/12-2-1-dp-guide',
	    sidebarDepth: 0,
            children: [
	      {
                title: 'Schema/Database Management',
                path: '/en/12-dev-guide/12-2-2-dp-schema',
	      },
	      {
                title: 'Table Management',
                path: '/en/12-dev-guide/12-2-3-dp-table',
	      },
	      {
                title: 'Index Management',
                path: '/en/12-dev-guide/12-2-4-dp-index',
	      },
	      {
                title: 'Views',
                path: '/en/12-dev-guide/12-2-5-dp-view',
	      },
	      {
                title: 'Stored Routines',
                path: '/en/12-dev-guide/12-2-6-dp-stored-routines',
	      },
	      {
                title: 'Triggers',
                path: '/en/12-dev-guide/12-2-7-dp-trigger',
	      },
	      {
                title: 'Event Scheduler',
                path: '/en/12-dev-guide/12-2-8-dp-event',
	      },
	      {
                title: 'PARTITION',
                path: '/en/12-dev-guide/12-2-9-dp-partition',
	      },
	      {
                title: 'Data Types',
                path: '/en/12-dev-guide/12-2-10-datatype',
	      },
            ]
	  },
	  {
            title: 'Data Write & Modification',
            //path: '/en/12-dev-guide/12-3-1-data-insert',
	    sidebarDepth: 0,
            children: [
	      {
                title: 'INSERT',
                path: '/en/12-dev-guide/12-3-1-data-insert',
	      },
	      {
                title: 'UPDATE',
                path: '/en/12-dev-guide/12-3-2-data-update',
	      },
	      {
                title: 'DELETE',
                path: '/en/12-dev-guide/12-3-3-data-delete',
	      },
	      {
                title: 'REPLACE',
                path: '/en/12-dev-guide/12-3-4-data-replace',
	      },
	      {
                title: 'PREPARE Statements',
                path: '/en/12-dev-guide/12-3-5-data-prepare',
	      },
	      {
                title: 'Generating Random Test Data',
                path: '/en/12-dev-guide/12-3-6-gen-random-data',
	      },
	      {
                title: 'Generating Test Data with sysbench',
                path: '/en/12-dev-guide/12-3-7-gen-sysbench-data',
	      },
            ]
	  },
	  {
            title: 'Data Query',
            //path: '/en/12-dev-guide/12-4-1-data-select-single-table',
	    sidebarDepth: 0,
            children: [
	      {
                title: 'Single-Table Query',
                path: '/en/12-dev-guide/12-4-1-data-select-single-table',
	      },
	      {
                title: 'Multi-Table Join Query',
                path: '/en/12-dev-guide/12-4-2-data-select-multi-table',
	      },
	      {
                title: 'Subqueries',
                path: '/en/12-dev-guide/12-4-3-data-select-subquery',
	      },
	      {
                title: 'Supported Functions',
                path: '/en/12-dev-guide/12-4-4-functions',
	      },
	      {
                title: 'Window Functions',
                path: '/en/12-dev-guide/12-4-5-window-funcs',
	      },
            ]
	  },
	  {
            title: 'High Compatibility (Oracle Compatible)',
            path: '/en/5-enhance/5-3-easyuse',
	    sidebarDepth: 0,
            children: [
	      {
                title: 'Data Type Compatibility',
                path: 'https://greatsql.cn/docs/8.4.4-5/5-enhance/5-3-easyuse.html#%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B%E5%85%BC%E5%AE%B9',
	      },
	      {
                title: 'SQL Syntax Compatibility',
                path: 'https://greatsql.cn/docs/8.4.4-5/5-enhance/5-3-easyuse.html#sql%E8%AF%AD%E6%B3%95%E5%85%BC%E5%AE%B9',
	      },
	      {
                title: 'Function Compatibility',
                path: 'https://greatsql.cn/docs/8.4.4-5/5-enhance/5-3-easyuse.html#%E5%87%BD%E6%95%B0%E5%85%BC%E5%AE%B9',
	      },
	      {
                title: 'Stored Routine Compatibility',
                path: 'https://greatsql.cn/docs/8.4.4-5/5-enhance/5-3-easyuse.html#%E5%AD%98%E5%82%A8%E7%A8%8B%E5%BA%8F%E5%85%BC%E5%AE%B9',
	      },
	      {
                title: 'Oracle Compatibility FAQ',
                path: '/en/5-enhance/5-3-sql-compat-faq',
	      },
            ]
	  },
	  {
            title: 'Transaction Control',
	    sidebarDepth: 0,
            //path: '/en/12-dev-guide/12-6-trx-overview',
            children: [
	      {
                title: 'Transaction Overview',
                path: '/en/12-dev-guide/12-6-trx-overview',
	      },
	      {
                title: 'Transaction Management',
                path: '/en/12-dev-guide/12-6-1-trx-control',
	      },
	      {
                title: 'Transaction Isolation Levels',
                path: '/en/12-dev-guide/12-6-2-trx-isolation',
	      },
	      {
                title: 'Transaction Concurrency & Locking',
                path: '/en/12-dev-guide/12-6-3-trx-mvcc-and-locking',
	      },
	      {
                title: 'Transaction Error Handling',
                path: '/en/12-dev-guide/12-6-4-trx-troubleshoot',
	      },
            ]
	  },
	  {
            title: 'Optimizing SQL Performance',
	    sidebarDepth: 0,
            path: '/en/12-dev-guide/12-7-sql-optimize-overview',
            children: [
	      {
                title: 'Schema Design Optimization',
                path: '/en/12-dev-guide/12-7-1-sql-optimize-schema-design',
	      },
	      {
                title: 'SQL Development Optimization',
                path: '/en/12-dev-guide/12-7-2-sql-optimize-sql-dev',
	      },
	      {
                title: 'Storage Engine Selection',
                path: '/en/12-dev-guide/12-7-3-sql-optimize-engines',
	      },
	      {
                title: 'Slow Query Analysis & Optimization',
                path: '/en/12-dev-guide/12-7-4-sql-optimize-slowsql',
	      },
            ]
	  },
	  {
            title: 'Common Errors',
            //path: '/en/12-dev-guide/12-8-2-error-connection-failure',
	    sidebarDepth: 0,
            children: [
	      {
                title: 'Database Connection Failures',
                path: '/en/12-dev-guide/12-8-2-error-connection-failure',
	      },
	      {
                title: 'Database Read/Write Failures',
                path: '/en/12-dev-guide/12-8-3-error-create-write',
	      },
	      {
                title: 'Database Query Failures',
                path: '/en/12-dev-guide/12-8-4-error-select',
	      },
	      {
                title: 'Other Common Error Handling',
                path: '/en/12-dev-guide/12-8-5-error-other',
	      },
	      {
                title: 'Common Error Code Reference',
                path: '/en/12-dev-guide/12-8-1-error-code-reference',
	      },
            ]
	  },
        ]
      },
      {
        'title': 'Installation Guide',
        collapsable: true,
        sidebarDepth: 0,
        //path: '/en/4-install-guide/1-install-prepare',
        children: [
          '/en/4-install-guide/1-install-prepare',
          '/en/4-install-guide/2-install-with-rpm',
	  {
            title: 'Binary Tarball Installation',
	    sidebarDepth: 0,
            //path: '/en/4-install-guide/3-install-with-tarball',
            children: [
	      {
	        title: 'Install on CentOS',
	        path: '/en/4-install-guide/3-1-centos-install',
	      },
	      {
	        title: 'Install on Ubuntu',
	        path: '/en/4-install-guide/3-2-ubuntu-install',
	      },
	      {
	        title: 'Install on openEuler',
	        path: '/en/4-install-guide/3-3-openeuler-install',
	      },
	      {
	        title: 'Install on UnionTech UOS',
	        path: '/en/4-install-guide/3-4-uos-install',
	      },
	      {
	        title: 'Install on Anolis OS',
	        path: '/en/4-install-guide/3-5-anolis-install',
	      },
	      {
	        title: 'Install on Kylin',
	        path: '/en/4-install-guide/3-6-kylin-install',
	      },
	      {
	        title: 'Install on Arch Linux',
	        path: '/en/4-install-guide/3-7-arch-install',
	      },
	    ],
	  },
          '/en/4-install-guide/4-install-with-docker',
	  '/en/4-install-guide/5-install-with-ansible',
          '/en/4-install-guide/6-install-with-source-code',
          '/en/4-install-guide/7-load-sampledb',
          '/en/4-install-guide/8-greatsql-with-systemd',
          '/en/4-install-guide/9-custom-cnf-file-path',
          '/en/4-install-guide/10-uninstall-greatsql',
        ]
      },
      {
        'title': 'GreatSQL Enhancements',
        collapsable: true,
        sidebarDepth: 0,
        //path: '/en/5-enhance/5-2-ha',
        children: [
	  {
            title: 'High Availability',
            path: '/en/5-enhance/5-2-ha',
	    sidebarDepth: 0,
            children: [
	      {
                title: 'MGR Zone Tags',
                path: '/en/5-enhance/5-2-ha-mgr-zoneid',
	      },
	      {
                title: 'MGR Built-in Dynamic VIP',
                path: '/en/5-enhance/5-2-ha-mgr-vip',
	      },
	      {
                title: 'Disconnecting App Connections After MGR Primary Switchover',
                path: '/en/5-enhance/5-2-ha-mgr-kill-conn-after-switch',
	      },
	      {
                title: 'MGR Arbitrator Node',
                path: '/en/5-enhance/5-2-ha-mgr-arbitrator',
	      },
	      {
                title: 'MGR Fast Single-Primary Mode',
                path: '/en/5-enhance/5-2-ha-mgr-fast-mode',
	      },
	      {
                title: 'MGR Smart Primary Election',
                path: '/en/5-enhance/5-2-ha-mgr-election-mode',
	      },
	      {
                title: 'MGR New Flow Control Algorithm',
                path: '/en/5-enhance/5-2-ha-mgr-new-fc',
	      },
	      {
                title: 'MGR Network Overhead Threshold',
                path: '/en/5-enhance/5-2-ha-mgr-request-time',
	      },
	      {
                title: 'Loop Prevention in Primary-Primary Replication',
                path: '/en/5-enhance/5-2-ha-repl-server-mode',
	      },
	      {
                title: 'Binlog Read Rate Limiting',
                path: '/en/5-enhance/5-2-ha-binlog-speed-limit',
	      },
	      {
                title: 'Restoring Compatible Replication Interfaces',
                path: '/en/5-enhance/5-2-ha-repl-interface-cmd',
	      },
	      {
                title: 'Other High Availability Improvements',
                path: '/en/5-enhance/5-2-ha-mgr-improved',
	      }
	    ],
	  },
	  {
            title: 'High Performance',
            path: '/en/5-enhance/5-1-highperf',
	    sidebarDepth: 0,
            children: [
	      {
                title: 'Turbo Engine',
                path: '/en/5-enhance/5-1-highperf-turbo-engine',
	      },
	      {
                title: 'Turbo Engine Vector Similarity Search',
                path: '/en/5-enhance/5-1-highperf-vector-search',
	      },
	      {
                title: 'Rapid Engine',
                path: '/en/5-enhance/5-1-highperf-rapid-engine',
	      },
	      {
                title: 'Large Transaction Binlog Independent Flush Optimization',
                path: '/en/5-enhance/5-1-highperf-binlog-flush-opt-large-trx',
	      },
	      {
                title: 'Parallel Replication Replay Optimization',
                path: '/en/5-enhance/5-1-highperf-parallel-replica',
	      },
	      {
                title: 'Execution Plan Drift Detection',
                path: '/en/5-enhance/5-1-highperf-execplan-baseline',
	      },
	      {
                title: 'Parallel LOAD DATA',
                path: '/en/5-enhance/5-1-highperf-parallel-load',
	      },
	      {
                title: 'Asynchronous Drop of Large Tables',
                path: '/en/5-enhance/5-1-highperf-async-purge-big-table',
	      },
	      {
                title: 'Non-Blocking DDL',
                path: '/en/5-enhance/5-1-highperf-nonblocking-ddl',
	      },
	      {
                title: 'NUMA Affinity Optimization',
                path: '/en/5-enhance/5-1-highperf-numa-affinity',
	      },
	      {
                title: 'Thread Pool',
                path: '/en/5-enhance/5-1-highperf-thread-pool',
	      },
	    ],
	  },
	  {
            title: 'High Compatibility (Oracle Compatible)',
            path: '/en/5-enhance/5-3-easyuse',
	    sidebarDepth: 0,
            children: [
	      {
                title: 'Data Type Compatibility',
                path: 'https://greatsql.cn/docs/8.4.4-5/5-enhance/5-3-easyuse.html#%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B%E5%85%BC%E5%AE%B9',
	      },
	      {
                title: 'SQL Syntax Compatibility',
                path: 'https://greatsql.cn/docs/8.4.4-5/5-enhance/5-3-easyuse.html#sql%E8%AF%AD%E6%B3%95%E5%85%BC%E5%AE%B9',
	      },
	      {
                title: 'Function Compatibility',
                path: 'https://greatsql.cn/docs/8.4.4-5/5-enhance/5-3-easyuse.html#%E5%87%BD%E6%95%B0%E5%85%BC%E5%AE%B9',
	      },
	      {
                title: 'Stored Routine Compatibility',
                path: 'https://greatsql.cn/docs/8.4.4-5/5-enhance/5-3-easyuse.html#%E5%AD%98%E5%82%A8%E7%A8%8B%E5%BA%8F%E5%85%BC%E5%AE%B9',
	      },
	      {
                title: 'Oracle Compatibility FAQ',
                path: '/en/5-enhance/5-3-sql-compat-faq',
	      },
            ]
	  },
	  {
            title: 'High Security',
            path: '/en/5-enhance/5-4-security',
	    sidebarDepth: 0,
            children: [
	      {
                title: 'mysqldump Backup Encryption',
                path: '/en/5-enhance/5-4-security-mysqldump-encrypt',
	      },
	      {
                title: 'Clone Backup Encryption',
                path: '/en/5-enhance/5-4-security-clone-encrypt',
	      },
	      {
                title: 'Auditing',
                path: '/en/5-enhance/5-4-security-audit',
	      },
	      {
                title: 'GMSSL (National Cryptography) Support',
                path: '/en/5-enhance/5-4-security-encrypt-with-gmssl',
	      },
	      {
                title: 'Data Masking',
                path: '/en/5-enhance/5-4-security-data-masking',
	      },
	    ],
	  },
	  {
            title: 'Others',
            path: '/en/5-enhance/5-5-others',
	    sidebarDepth: 0,
            children: [
	      {
                title: 'Clone Compression & Incremental Backup',
                path: '/en/5-enhance/5-5-clone-compressed-and-incrment-backup',
	      },
	      {
                title: 'InnoDB Page Compression',
                path: '/en/5-enhance/5-5-innodb-page-compression',
	      },
	    ],
	  },

        ]
      },
      {
        'title': 'Operations & Maintenance',
        collapsable: true,
        sidebarDepth: 0,
        //path: '/en/6-oper-guide/1-basic-oper',
        children: [
          '/en/6-oper-guide/1-basic-oper',
          '/en/6-oper-guide/2-oper-rw-splitting',
          '/en/6-oper-guide/3-monitoring-and-alerting',
	  {
            title: 'Backup & Restore',
            path: '/en/6-oper-guide/4-backup-and-restore',
	    sidebarDepth: 0,
            children: [
	      {
                title: 'Logical Backup & Restore',
                path: '/en/6-oper-guide/4-1-mysqldump',
	        sidebarDepth: 0,
	        children: [
		  {
		    title: 'mysqldump Backup & Restore',
		    path: '/en/6-oper-guide/4-1-mysqldump',
		  },
		  {
		    title: 'OUTFILE Backup & Restore',
		    path: '/en/6-oper-guide/4-2-outfile',
		  },
		  {
		    title: 'MySQL Shell Backup & Restore',
		    path: '/en/6-oper-guide/4-3-shell-util',
		  },
		],
	      },
	      {
                title: 'Physical Backup & Restore',
                path: '/en/6-oper-guide/4-4-physical-backup',
	      },
	      {
                title: 'Clone Backup & Restore',
                path: '/en/6-oper-guide/4-5-clone',
	      },
	    ],
	  },
          '/en/6-oper-guide/5-multi-instances',
	  {
            title: 'Operations Feature Enhancements',
            path: '/en/6-oper-guide/6-feature-enhancement',
	    sidebarDepth: 0,
            children: [
	      {
	        title: 'User Statistics',
	        path: '/en/6-oper-guide/6-1-user-statistics',
	        sidebarDepth: 0,
                children: [
		  {
		    title: 'Client Statistics',
		    path: '/en/6-oper-guide/6-1-1-client-statistics',
		  },
		  {
		    title: 'Index Statistics',
		    path: '/en/6-oper-guide/6-1-2-index-statistics',
		  },
		  {
		    title: 'Table Statistics',
		    path: '/en/6-oper-guide/6-1-3-table-statistics',
		  },
		  {
		    title: 'Thread Statistics',
		    path: '/en/6-oper-guide/6-1-4-thread-statistics',
		  },
		  {
		    title: 'User Statistics',
		    path: '/en/6-oper-guide/6-1-5-user-statistics',
		  },
		],
	      },
	      '/en/6-oper-guide/6-2-procfs-plugin',
	      '/en/6-oper-guide/6-3-compressed-columns',
	      '/en/6-oper-guide/6-4-extended-innodb-status',
	      '/en/6-oper-guide/6-5-extended-show-grants',
	      '/en/6-oper-guide/6-6-handle-corrupted-tables',
	      '/en/6-oper-guide/6-7-kill-idle-trx',
	      '/en/6-oper-guide/6-8-other-tables',
	    ],
	  },
          '/en/6-oper-guide/7-avoid-mistakes',
          '/en/6-oper-guide/8-troubleshooting',
          '/en/6-oper-guide/9-daily-health-check',
	  {
	    title: 'Percona Toolkit',
	    path: '/en/6-oper-guide/10-percona-toolkit',
	    sidebarDepth: 0,
	    children: [
	      {
	        title: 'Utility Tools',
	        path: '/en/6-oper-guide/10-1-pt-practical',
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
	        title: 'Configuration Tools',
	        path: '/en/6-oper-guide/10-2-pt-configuration',
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
	        title: 'Monitoring Tools',
	        path: '/en/6-oper-guide/10-3-pt-monitoring',
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
	        title: 'System Tools',
	        path: '/en/6-oper-guide/10-4-pt-system',
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
	        title: 'Development Tools',
	        path: '/en/6-oper-guide/10-5-pt-development',
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
	        title: 'Replication Tools',
	        path: '/en/6-oper-guide/10-6-pt-replication',
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
	        title: 'Performance Tools',
	        path: '/en/6-oper-guide/10-7-pt-performance',
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
        'title': 'Migration & Upgrade',
        collapsable: true,
        sidebarDepth: 0,
        //path: '/en/7-migrate-and-upgrade/1-upgrade-to-greatsql8',
        children: [
          '/en/7-migrate-and-upgrade/1-upgrade-to-greatsql8',
          '/en/7-migrate-and-upgrade/2-migrate-from-mysql-togreatsql',
          '/en/7-migrate-and-upgrade/3-migrate-from-percona-to-greatsql',
          '/en/7-migrate-and-upgrade/4-migrate-from-mariadb-to-greatsql'
        ]
      },
      {
        'title': 'MGR (Group Replication)',
        collapsable: true,
        sidebarDepth: 0,
        //path: '/en/8-mgr/1-mgr-introduction',
        children: [
          '/en/8-mgr/1-mgr-introduction',
          '/en/8-mgr/2-mgr-install-deploy',
          '/en/8-mgr/3-mgr-maintain-admin',
          '/en/8-mgr/4-mgr-status-monitor',
          '/en/8-mgr/5-mgr-readwrite-split',
          '/en/8-mgr/6-mgr-data-security',
          '/en/8-mgr/7-mgr-performance-tuning',
          '/en/8-mgr/8-mgr-best-practices'
        ]
      },
      {
        'title': 'High Availability Architectures',
        collapsable: true,
        sidebarDepth: 0,
        //path: '/en/9-ha/1-ha-single-machine-multi-instance',
        children: [
          '/en/9-ha/1-ha-single-machine-multi-instance',
          '/en/9-ha/5-ha-single-vlan',
          '/en/9-ha/2-ha-single-idc',
          '/en/9-ha/3-ha-same-city-multi-idc',
          '/en/9-ha/4-ha-multi-city-multi-idc'
        ]
      },
      {
        'title': 'Performance Optimization',
        collapsable: true,
        sidebarDepth: 0,
        //path: '/en/10-optimize/0-optimize',
        children: [
          '/en/10-optimize/1-hardware-and-os-optimize',
	  {
            title: 'GreatSQL Optimization',
            path: '/en/10-optimize/2-greatsql-optimize',
	    sidebarDepth: 0,
            children: [
	      '/en/10-optimize/2-1-schema-design-refer',
	      '/en/10-optimize/2-2-sql-develop-refer',
	      '/en/12-dev-guide/12-7-4-sql-optimize-slowsql',
	      '/en/10-optimize/2-4-slow-update-diag',
	      '/en/10-optimize/2-5-rowlock-diag',
	      '/en/10-optimize/2-6-deadlock-diag',
	      '/en/10-optimize/2-7-mdllock-diag',
	    ],
	  },
	  {
            title: 'Performance Benchmarking',
            path: '/en/10-optimize/3-performance-benchmark',
	    sidebarDepth: 0,
            children: [
	      {title: 'sysbench Benchmark', path: '/en/10-optimize/3-1-benchmark-sysbench'},
	      {title: 'BenchmarkSQL Benchmark', path: '/en/10-optimize/3-4-benchmarksql'},
	      {title: 'TPC-H Benchmark', path: '/en/10-optimize/3-2-benchmark-tpch'},
	    ],
	  },
        ]
      },
      {
        'title': 'Reference Guide',
        collapsable: true,
        sidebarDepth: 0,
        //path: '/en/13-reference/1-index',
        children: [
	  {title: 'Index', path: '/en/13-reference/1-index'},
	  {title: 'Reserved Words & Keywords', path: '/en/2-about-greatsql/7-greatsql-keywords'},
	  {title: 'System & Status Variables', path: '/en/13-reference/3-variables'},
	  {title: 'Key Features', path: '/en/1-docs-intro/1-3-greatsql-features'},
	  {title: 'SQL Compatibility', path: '/en/5-enhance/5-3-easyuse'},
	  {title: 'Application Development', path: '/en/12-dev-guide/12-dev-guide'},
	  {title: 'Why Upgrade to GreatSQL 8.4', path: '/en/7-migrate-and-upgrade/1-upgrade-to-greatsql8'},
	  {title: 'Certifications & Honors', path: '/en/13-reference/8-credential-and-honor'},
        ]
      },
      {
        'title': 'FAQ',
        collapsable: true,
        sidebarDepth: 0,
        //path: '/en/11-faq/1-faq-greatsql',
        children: [
          '/en/11-faq/1-faq-greatsql',
          '/en/11-faq/2-faq-mgr-oper',
          '/en/11-faq/3-faq-mgr-arch',
          '/en/11-faq/4-faq-mgr-monitor',
          '/en/11-faq/5-faq-others'
        ]
      },
]

