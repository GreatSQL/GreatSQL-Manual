# Improved Handling of Corrupted Tables

---

When a server subsystem tries to access a corrupted table, the server may crash. If this result is not desired when encountering a corrupted table, the new system `innodb_corrupt_table_action` variable can be set to a value that allows ongoing operations to continue without causing the server to crash.

The server error log records attempts to access corrupted table pages.

## Interaction with the innodb_force_recovery Variable

The `innodb_corrupt_table_action` variable can be used in conjunction with the `innodb_force_recovery` variable, greatly reducing the impact of InnoDB subsystems running in the background.

If the `innodb_force_recovery` option is less than 4, corrupted pages are lost, and the server may continue running because of the non-default value of the `innodb_corrupt_table_action` variable.

And this feature adds a new system variable.

## System Variable

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

Enabling `innodb_file_per_table` and using the assert value causes an assertion failure, which makes InnoDB deliberately crash the server. This situation is expected when detecting corrupted data in single-table tablespaces.

Enabling `innodb_file_per_table` and using the warn value causes InnoDB to treat table corruption as table corruption rather than crashing the server. After file corruption is detected, file I/O of this data file is also invalidated, except for delete operations.

Enabling `innodb_file_per_table` and using the salvage value causes InnoDB to allow reading the corrupted tablespace, but ignore any corrupted pages.


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
