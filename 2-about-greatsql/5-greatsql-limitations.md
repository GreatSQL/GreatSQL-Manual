# 使用限制
---

在使用GreatSQL的时候，有以下几条注意事项：

- MGR最多只支持9个节点。
- 每个节点都要启用binlog，且都要转存binlog，即设置 `log_slave_updates=1`。
- binlog format务必是row模式，即 `binlog_format=ROW`。
- 每个节点的 `server_id` 及 `server_uuid` 不能相同。
- 在8.0.20之前，要求 `binlog_checksum=NONE`，但是从8.0.20后，可以设置 `binlog_checksum=CRC32`。
- 要求启用 GTID，即设置 `gtid_mode=ON` 和 `enforce_gtid_consistency = ON`。
- 要求 `master_info_repository=TABLE` 及 `relay_log_info_repository=TABLE`，不过从MySQL 8.0.23开始，这两个选项已经默认设置TABLE，因此无需再单独设置。
- 所有节点上的表名大小写参数 `lower_case_table_names` 设置要求一致。
- 所有表必须是InnoDB引擎。可以创建非InnoDB引擎表，但无法写入数据，在利用Clone构建新节点时也会报错。
- 所有表最好都要有主键(建议全局设置选项 `sql_require_primary_key=ON`)。同上，能创建没有主键的表，但无法写入数据，在利用Clone构建新节点时也会报错（例外情况：在创建表之前，设置选项 `sql_generate_invisible_primary_key=ON`，这样InnoDB就会自动为该表创建一个不可见主键，详见：[Generated Invisible Primary Keys](https://dev.mysql.com/doc/refman/8.0/en/create-table-gipks.html)）。
- 不要使用大事务，默认地，事务超过150MB会报错，最大可支持2GB的事务。
- 如果是从旧版本进行升级，则不能选择 MINIMAL 模式升级，建议选择 AUTO 模式，即 `upgrade=AUTO`。
- 由于MGR的事务认证线程不支持 gap lock，因此建议把所有节点的事务隔离级别都改成 READ COMMITTED。基于相同的原因，MGR集群中也不要使用 table lock 及 name lock（即 GET_LOCK() 函数 ）。
- 在多主（multi-primary）模式下不支持串行（SERIALIZABLE）隔离级别。
- 不支持在不同的MGR节点上，对同一个表分别执行DML和DDL，可能会造成数据丢失或节点报错退出（剧透：在GreatSQL未来的版本中有望得到解决）。
- 在多主（multi-primary）模式下不支持多层级联外键表。另外，为了避免因为使用外键造成MGR报错，建议设置 `group_replication_enforce_update_everywhere_checks=ON`。
- 在多主（multi-primary）模式下，如果多个节点都执行 SELECT ... FOR UPDATE 后提交事务会造成死锁，有必要的话，被判定为死锁的那个事务可以再重试提交。
- 不支持复制过滤（Replication Filters）设置。


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
