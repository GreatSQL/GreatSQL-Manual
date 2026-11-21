# GreatSQL User Manual (English)

> 🌐 **Bilingual site.** This is the English edition of the GreatSQL 8.4.4-5 User Manual.
> The Chinese edition is available at [Chinese User Manual](/).
>
> ✅ **Translation status:** All chapters have been translated into English and are fully
> available on this site. Screenshots in the English pages are shared with the Chinese
> edition (they have not been re-made for English).

Last updated: 2026-11-19.

Documentation applies to: **GreatSQL 8.4.4-5**.

## About GreatSQL

GreatSQL is an **open-source and free** database that meets the requirements of financial-grade
application scenarios on commodity hardware. It features **High Availability**, **High Performance**,
**High Compatibility** and **High Security**, and can serve as an ideal drop-in replacement for
MySQL or Percona Server for MySQL.

![GreatSQL LOGO](../greatsql-logo.png "GreatSQL LOGO")

## Download GreatSQL

- [Download the latest GreatSQL release](https://gitee.com/GreatSQL/GreatSQL/releases/GreatSQL-8.4.4-5)
- [Download historical GreatSQL releases](https://gitee.com/GreatSQL/GreatSQL/releases/)

## Documentation Chapters

| Chapter | Files | Status |
| --- | --- | --- |
| [1. Documentation Introduction](/en/1-docs-intro/1-docs-intro) | 16/16 | ✅ Translated |
| [2. About GreatSQL](/en/2-about-greatsql/0-about-greatsql) | 14/14 | ✅ Translated |
| [3. Quick Start](/en/3-quick-start/3-quick-start) | 6/6 | ✅ Translated |
| [4. Installation Guide](/en/4-install-guide/0-install-guide) | 18/18 | ✅ Translated |
| [5. GreatSQL Enhancements](/en/5-enhance/5-enhance) | 141/141 | ✅ Translated |
| [6. Operations & Maintenance](/en/6-oper-guide/0-oper-guide) | 36/36 | ✅ Translated |
| [7. Migration & Upgrade](/en/7-migrate-and-upgrade/0-migrate-and-upgrade) | 5/5 | ✅ Translated |
| [8. MGR (Group Replication)](/en/8-mgr/0-mgr-fundamentals) | 9/9 | ✅ Translated |
| [9. High Availability Architectures](/en/9-ha/0-ha) | 6/6 | ✅ Translated |
| [10. Performance Optimization](/en/10-optimize/0-optimize) | 17/17 | ✅ Translated |
| [11. FAQ](/en/11-faq/0-faq) | 6/6 | ✅ Translated |
| [12. Application Development](/en/12-dev-guide/12-dev-guide) | 47/47 | ✅ Translated |
| [13. Reference Guide](/en/13-reference/1-index) | 8/8 | ✅ Translated |
| [14. Online Demo](/en/14-greatsql-demo/greatsql-live-demo) | 3/3 | ✅ Translated |
| **Total** | **332/332** | **All chapters translated** |

## Core Features

### High Availability

GreatSQL makes many improvements to MGR (Group Replication) and primary-secondary replication,
including zone tags, arbitrator nodes, dynamic read/write VIP, fast single-primary mode,
smart primary election, and deep optimizations of flow control, transaction certification queue
cleanup, node join/leave, recovery mechanisms, and large transaction transfer compression.

### High Performance

Compared with MySQL and Percona Server for MySQL, GreatSQL delivers more stable and better
performance. It supports the Rapid Engine, Turbo Engine, lock-free transactions, parallel
LOAD DATA, asynchronous large-table drops, thread pool, non-blocking DDL, NUMA affinity
optimization, and more. In TPC-C benchmarks it outperforms MySQL by over 30%.

### High Compatibility (Oracle Compatible)

GreatSQL is highly compatible with Oracle: data types, SQL syntax, functions, and stored
routines, making it easier to migrate from Oracle to GreatSQL.

### High Security

GreatSQL provides mysqldump backup encryption, Clone backup encryption, auditing, GMSSL
national cryptography support, and data masking.

More details: [Chinese User Manual](/).
