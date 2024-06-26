# 已知问题
---
- 在 GreatSQL 5.7.36-39 版本中，不支持 InnoDB 并行查询特性。
- 在 GreatSQL 8.0.32-25 以前的版本中，InnoDB 并行查询特性不支持 TPC-H 中的 Q21。
- 在 GreatSQL 8.0.* 版本中，InnoDB 并行查询特性不支持子查询。
- 在 GreatSQL 8.0.32-25 以前的版本中，不支持 Rapid 引擎。
- 从 GreatSQL 8.0.32-26 开始，不再推荐使用 InnoDB 并行查询特性（同时会删除用户手册中的入口链接）。
- Rapid引擎不支持表分区、外键。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
