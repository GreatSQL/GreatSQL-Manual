# InnoDB异步删除大表特性
---

## 功能说明

在删除InnoDB大表（通常是指超过10G的表）时，由于InnoDB引擎的I/O操作会受到OS层删除文件的影响，进而导致InnoDB的稳定性出现波动。

为了避免此问题，解决思路是启动一个后台线程来异步缓慢地清理数据文件。

此外，在删除InnoDB表时，会将对应的数据文件先重命名为临时文件，并使用DDL LOG保证crash safe，删除表空间操作立即返回结果，清除线程将异步、缓慢地清理临时文件。

目前只有InnoDB引擎支持异步删除大表特性。

通过修改系统变量的方式开启异步删除大表的功能。

通过查询系统表展示临时文件清理进度。

## 新增系统选项

- `innodb_data_file_async_purge`

| Property            | Value                            |
| ------------------- | -------------------------------- |
| Command-Line Format | innodb_data_file_async_purge[={OFF\|ON}] |
| System Variable     | innodb_data_file_async_purge     |
| Scope               | Global, Session                  |
| Dynamic             | Yes                              |
| Type                | bool                             |
| Default value       | OFF                              |

是否启用异步清除策略，可在session、global级别进行设置。

- `innodb_data_file_async_purge_all_at_shutdown`

| Property            | Value                                            |
| ------------------- | ------------------------------------------------ |
| Command-Line Format | innodb_data_file_async_purge_all_at_shutdown[={OFF\|ON}] |
| System Variable     | innodb_data_file_async_purge_all_at_shutdown     |
| Scope               | Global                                           |
| Dynamic             | Yes                                              |
| Type                | bool                                             |
| Default value       | OFF                                              |

正常关机时等待清理线程清理完所有的临时文件。

- `innodb_data_file_async_purge_error_retry_count`

| Property            | Value                                            |
| ------------------- | ------------------------------------------------ |
| Command-Line Format | innodb_data_file_async_purge_error_retry_count=N |
| System Variable     | innodb_data_file_async_purge_error_retry_count   |
| Scope               | Global                                           |
| Dynamic             | Yes                                              |
| Type                | unsigned int                                     |
| Default value       | 10                                               |
| Min value           | 0                                                |
| Max value           | 4294967295                                       |

清理临时文件时发生文件系统相关异常时的重试次数，如果达到重试次数仍旧未清理成功过，临时文件无法自动清理，需要手动删除，检索error日志中“file must be manually deleted”相关记录，手动删除对应的文件，为0时表示不进行重试。

- `innodb_data_file_async_purge_interval`

| Property            | Value                                            |
| ------------------- | ------------------------------------------------ |
| Command-Line Format | innodb_data_file_async_purge_interval=N          |
| System Variable     | innodb_data_file_async_purge_interval            |
| Scope               | Global                                           |
| Dynamic             | Yes                                              |
| Type                | unsigned int                                     |
| Default value       | 10                                               |
| Min value           | 0                                                |
| Max value           | 10000                                            |

清理时间间隔，单位：ms，为0表示两次清理之间没有间隔。

- `innodb_data_force_async_purge_file_size`

| Property            | Value                                            |
| ------------------- | ------------------------------------------------ |
| Command-Line Format | innodb_data_force_async_purge_file_size=N        |
| System Variable     | innodb_data_force_async_purge_file_size          |
| Scope               | Global                                           |
| Dynamic             | Yes                                              |
| Type                | unsigned long long                               |
| Default value       | 10737418240                                      |
| Min value           | 1                                                |
| Max value           | 18446744073709551615                             |

文件大小超过此值，强制启用异步清除策略，单位：byte。

- `innodb_data_file_async_purge_max_size`

| Property            | Value                                            |
| ------------------- | ------------------------------------------------ |
| Command-Line Format | innodb_data_file_async_purge_max_size=N          |
| System Variable     | innodb_data_file_async_purge_max_size            |
| Scope               | Global                                           |
| Dynamic             | Yes                                              |
| Type                | unsigned long long                               |
| Default value       | 268435456                                        |
| Min value           | 1                                                |
| Max value           | 18446744073709551615                             |

每次清理单个文件大小的最大值，单位：byte。

## 开启异步删除大表特性

开启异步清理功能，需要同时满足以下要求，否则直接删除文件：
1. SESSION级别 `innodb_data_file_async_purge=ON` 或者文件大小达到 `innodb_data_force_async_purge_file_size`；
2. 要清理的表为独立表空间；
3. 表为InnoDB 引擎；
4. 不是TEMPORARY table。

满足以上要求，支持异步清理的操作有：`drop table`、`drop partition`、`truncate table`、`truncate partition`、`drop database`。

## 临时文件存放目录

为保证临时文件与数据文件在同一磁盘同一分区，临时文件目录为 `datadir` 的子目录，在初始化数据库时在 `datadir` 下创建 `#file_purge` 目录作为临时文件目录，如果创建 `#file_purge` 目录失败，则直接使用 `datadir` 作为临时文件目录。

临时文件命名格式：**#FP_进程启动时间戳_程序启动后递增的序列号**，例如：`#FP_1683256209_0`。

## 查询异步清理进度

新增系统表 `information_schema.innodb_async_purge_files`，展示临时文件清理进度。

```
# 表结构
CREATE TEMPORARY TABLE `INNODB_ASYNC_PURGE_FILES` (
  `log_id` bigint(21) unsigned NOT NULL DEFAULT '0',
  `start_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `original_path` varchar(1025) DEFAULT NULL,
  `original_size` bigint(21) unsigned NOT NULL DEFAULT '0',
  `temporary_path` varchar(1025) DEFAULT NULL,
  `current_size` bigint(21) unsigned NOT NULL DEFAULT '0'
) ENGINE=MEMORY;
```

**表结构说明**
- `log_id`：DDL LOG id
- `start_time`：将临时文件放入后台线程清理队列时的时间
- `original_path`：临时文件对应的原始ibd文件路径
- `original_size`：原始ibd文件大小，单位byte
- `temporary_path`：临时文件目录
- `current_size`：当前临时文件大小
- `message`：文件清理详细信息，如果未出错，值为NULL；如果出错，展示第几次重试和上一次的错误码




**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
