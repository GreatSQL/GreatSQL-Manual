# 改进对损坏表的处理

---

当服务器子系统试图访问损坏的表时，服务器可能会崩溃。如果遇到损坏的表时不希望出现这种结果，可将新系统 `innodb_corrupt_table_action` 变量设置为一个能让正在进行的操作继续而不会导致服务器崩溃的值。

服务器错误日志会记录试图访问损坏的表页的情况

## 与 innodb_force_recovery 变量交互

`innodb_corrupt_table_action` 变量可以与 `innodb_force_recovery` 变量配合使用，从而大大降低 InnoDB 子系统在后台运行的影响。

如果 `innodb_force_recovery` 选项小于 4，则会丢失损坏的页面，服务器可能会因为 `innodb_corrupt_table_action` 变量的非默认值而继续运行。

并且此功能添加了一个新的系统变量

## 系统变量

### innodb_corrupt_table_action

| System Variable Name | innodb_corrupt_table_action |
| -------------------- | --------------------------- |
| Command-line         | YES                         |
| Config file          | YES                         |
| Variable Scope       | Global                      |
| Dynamic Variable     | YES                         |
| Data type            | ULONG                       |
| Default              | assert                      |
| Range                | assert, warn, salvage       |

启用 `innodb_file_per_table` 并使用断言值会导致断言失败，从而导致 InnoDB 故意使服务器崩溃。在检测单表表空间中的损坏数据时，预计会出现这种情况。

启用 `innodb_file_per_table` 并使用警告值会导致 InnoDB 将表损坏作为表损坏，而不是导致服务器崩溃。检测到文件损坏后，除了删除操作外，该数据文件的文件I/O也会失效。

启用 `innodb_file_per_table` 并使用 salvage 值会导致 InnoDB 允许读取损坏的表空间，但忽略任何损坏的页面。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
