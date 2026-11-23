# Asynchronous Drop of Large Tables
---

## Feature Description

When dropping a large InnoDB table (usually a table larger than 10G), InnoDB's I/O operations are affected by file deletion at the OS layer, which can cause InnoDB stability fluctuations.

To avoid this problem, the solution is to start a background thread to asynchronously and slowly delete the data file.

In addition, when dropping an InnoDB table, the corresponding data file is first renamed to a temporary file, and the DDL LOG is used to ensure crash safety. The tablespace drop operation returns immediately, and the purge thread deletes the temporary file asynchronously and slowly.

The asynchronous large table drop feature is enabled by modifying system options, and the temporary file purge progress can be displayed by querying system tables.

Currently, only the InnoDB engine supports the asynchronous large table drop feature.

## New System Options

- `innodb_data_file_async_purge`

| Property            | Value                            |
| ------------------- | -------------------------------- |
| Command-Line Format | innodb_data_file_async_purge[={OFF\|ON}] |
| System Variable     | innodb_data_file_async_purge     |
| Scope               | Global, Session                  |
| Dynamic             | Yes                              |
| Type                | bool                             |
| Default value       | OFF                              |

Whether to enable the asynchronous purge strategy; it can be set at the session and global levels.

- `innodb_data_file_async_purge_all_at_shutdown`

| Property            | Value                                            |
| ------------------- | ------------------------------------------------ |
| Command-Line Format | innodb_data_file_async_purge_all_at_shutdown[={OFF\|ON}] |
| System Variable     | innodb_data_file_async_purge_all_at_shutdown     |
| Scope               | Global                                           |
| Dynamic             | Yes                                              |
| Type                | bool                                             |
| Default value       | OFF                                              |

Whether to wait for the purge thread to clean up all temporary files on normal shutdown.

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

The number of retries when a file system-related exception occurs while cleaning up temporary files. If cleanup still fails after reaching the retry count, the temporary file cannot be cleaned up automatically and must be deleted manually. Search the error log for records containing "file must be manually deleted" and manually delete the corresponding file. A value of 0 means no retry.

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

The purge interval, in ms; 0 means there is no interval between two purges.

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

The asynchronous purge thread purges large files in a loop; the size purged each time is specified by `innodb_data_file_async_purge_max_size`, in bytes, default 256MB.

If the physical I/O capacity is low, you can appropriately lower this option value to reduce the impact on system load during purging.

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

When the size of the InnoDB tablespace file to be deleted exceeds this value, the asynchronous purge strategy is forcibly enabled even if `innodb_data_file_async_purge = OFF`. Unit: bytes, default 10GB. That is, when the tablespace file to be deleted is larger than the `innodb_data_force_async_purge_file_size` option value, the asynchronous purge strategy is always used.


## Enabling the Asynchronous Large Table Drop Feature

To enable the asynchronous drop feature, all of the following requirements must be met; otherwise, the file is deleted directly:
1. SESSION-level `innodb_data_file_async_purge=ON`, or the file size reaches `innodb_data_force_async_purge_file_size`;
2. The table to be dropped uses a standalone tablespace;
3. The table is an InnoDB engine table;
4. It is not a TEMPORARY TABLE.

If the above requirements are met, the operations supporting asynchronous drop are: `DROP TABLE`, `DROP PARTITION`, `TRUNCATE TABLE`, `TRUNCATE PARTITION`, `DROP DATABASE`.

## Temporary File Storage Directory

To ensure that temporary files are on the same disk and partition as the data files, the temporary file directory is a subdirectory of `datadir`. When the database is initialized, the `#file_purge` directory is created under `datadir` as the temporary file directory. If creating the `#file_purge` directory fails, `datadir` is used directly as the temporary file directory.

Temporary file naming format: **#FP_<process start timestamp>_<incrementing sequence number since program start>**, for example: `#FP_1683256209_0`.

## Querying Asynchronous Purge Progress

A new system table `information_schema.INNODB_ASYNC_PURGE_FILES` is added to display temporary file purge progress.

```sql
# table structure
CREATE TEMPORARY TABLE `INNODB_ASYNC_PURGE_FILES` (
  `log_id` bigint(21) unsigned NOT NULL DEFAULT '0',
  `start_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `original_path` varchar(1025) DEFAULT NULL,
  `original_size` bigint(21) unsigned NOT NULL DEFAULT '0',
  `temporary_path` varchar(1025) DEFAULT NULL,
  `current_size` bigint(21) unsigned NOT NULL DEFAULT '0'
) ENGINE=MEMORY;
```

**Table structure description**
- `log_id`: DDL LOG id
- `start_time`: the time when the temporary file was placed in the background thread purge queue
- `original_path`: the original ibd file path corresponding to the temporary file
- `original_size`: the original ibd file size, in bytes
- `temporary_path`: the temporary file directory
- `current_size`: the current temporary file size
- `message`: detailed file purge information; if there is no error, the value is NULL; if an error occurs, it displays the retry count and the last error code


**Scan the QR code to follow the WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
