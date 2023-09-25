# 备份恢复
---

本文介绍GreatSQL数据库的几种不同备份恢复方法，主要包括：

1. 逻辑备份恢复
 - 1.1 [mysqldump逻辑备份恢复](./4-1-mysqldump.md)
 - 1.2 [OUTFILE逻辑备份恢复](./4-2-outfile.md)
 - 1.3 [MySQL Shell util逻辑备份恢复](./4-3-shell-util.md)
2. 物理备份恢复
 - 2.1 [物理备份恢复、xtrabackup备份恢复](./4-4-physical-backup.md)
3. CLONE备份恢复

- 3.1 [CLONE备份恢复](./4-5-clone.md)

可以根据实际情况和业务需要，选择定制不同的备份恢复策略。

**重要提醒：**任何时候、任何数据库（包括测试环境）都请记住要配置好合适的备份策略，以及检查备份有效性。避免因为误操作删除数据时，又因为没有备份或备份失效不可用导致无法恢复，影响业务和生产。

**参考资料：**

- [The Clone Plugin](https://dev.mysql.com/doc/refman/8.0/en/clone-plugin.html)
- [mysqldump](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html)
- [mysqlpump](https://dev.mysql.com/doc/refman/8.0/en/mysqlpump.html)
- [mydumper](https://github.com/mydumper/mydumper)
- [如何从mysqldump全量备份中抽取部分库表用于恢复](https://imysql.com/2010/06/01/mysql-faq-how-to-extract-data-from-dumpfile.html)
- [XtraBackup](https://docs.percona.com/percona-xtrabackup/latest/manual.html)


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
