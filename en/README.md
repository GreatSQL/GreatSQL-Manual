# GreatSQL User Manual (English)

> 🌐 **Bilingual site.** This is the English edition of the GreatSQL 8.4.4-5 User Manual.
> The Chinese edition is available at [GreatSQL用户手册](/).
>
> 🚧 **Translation status:** The English documentation is being translated progressively.
> Chapters marked as *placeholder* are not translated yet — please read the [Chinese version](/)
> for now. This placeholder page will be replaced as translations are published.

Last updated: 2026-10-20.

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

| Chapter | Status |
| --- | --- |
| [1. Documentation Introduction](/en/1-docs-intro/) | Placeholder |
| [2. About GreatSQL](/en/2-about-greatsql/) | Placeholder |
| [3. Quick Start](/en/3-quick-start/) | Placeholder |
| [4. Installation Guide](/en/4-install-guide/) | Placeholder |
| [5. GreatSQL Enhancements](/en/5-enhance/) | Placeholder |
| [6. Operations & Maintenance](/en/6-oper-guide/) | Placeholder |
| [7. Migration & Upgrade](/en/7-migrate-and-upgrade/) | Placeholder |
| [8. MGR (Group Replication)](/en/8-mgr/) | Placeholder |
| [9. High Availability Architectures](/en/9-ha/) | Placeholder |
| [10. Performance Optimization](/en/10-optimize/) | Placeholder |
| [11. FAQ](/en/11-faq/) | Placeholder |
| [12. Application Development](/en/12-dev-guide/) | Placeholder |
| [13. Reference Guide](/en/13-reference/) | Placeholder |
| [14. Online Demo](/en/14-greatsql-demo/) | Placeholder |

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
