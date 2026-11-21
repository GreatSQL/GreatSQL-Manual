# Changes in GreatSQL 8.0.25-17 (2023-3-13)

**GreatSQL 8.0.25-17** is a minor improvement version, mainly fixing the problem in GreatSQL where InnoDB parallel query could cause queries to hang or even crash. Everything else is the same as GreatSQL 8.0.25-16.

We recommend this [**my.cnf configuration reference**](https://gitee.com/GreatSQL/GreatSQL-Doc/blob/master/docs/my.cnf-example-greatsql-8.0.25-17).

## New Features

## Stability Improvements

## Other Adjustments


## Bug Fixes
01. Fixed the problem in GreatSQL where InnoDB parallel query could cause queries to hang or even crash.

## GreatSQL VS MySQL Community Edition

| Feature | GreatSQL 8.0.25-17| MySQL 8.0.25 Community Edition |
|---| --- | --- |
| Voting node/Arbitrator node | ✅ | ❎ |
| Fast single-primary mode | ✅ | ❎ |
| Zone tags | ✅ | ❎ |
| New flow control algorithm | ✅ | ❎ |
| InnoDB parallel query optimization | ✅ | ❎ |
| Thread Pool | ✅ | ❎ |
|Auditing| ✅ | ❎ |
| InnoDB transaction lock optimization | ✅ | ❎ |
|SEQUENCE_TABLE(N) function|✅ | ❎ |
|InnoDB corrupted table exception handling|✅ | ❎ |
|Force InnoDB engine tables only|✅ | ❎ |
|Kill idle transactions to avoid long lock waits|✅ | ❎ |
|Data Masking|✅ | ❎ |
|InnoDB fragmented page statistics enhancement|✅ | ❎ |
|MyRocks engine support|✅ | ❎ |
| InnoDB I/O performance |  ⭐️⭐️⭐️⭐️⭐️ | ⭐️⭐️ | 
| Network partition exception handling |  ⭐️⭐️⭐️⭐️⭐️ | ⭐️ | 
| Improved abnormal node exit handling |   ⭐️⭐️⭐️⭐️⭐️ | ⭐️ | 
| Consistent read performance |   ⭐️⭐️⭐️⭐️⭐️ | ⭐️ | 
| Improved MGR throughput |⭐️⭐️⭐️⭐️⭐️ | ⭐️ | 
| Statistics enhancement |⭐️⭐️⭐️⭐️⭐️ | ⭐️ | 
| Slow Query Log enhancement |⭐️⭐️⭐️⭐️⭐️ | ⭐️ | 
| Large transaction handling |   ⭐️⭐️⭐️⭐️ | ⭐️ | 
| Fixed risk of data loss in multi-write mode | ⭐️⭐️⭐️⭐️⭐️ | /  | 
| Fixed risk of data loss during primary switchover in single-primary mode | ⭐️⭐️⭐️⭐️⭐️ | / | 
|  MGR cluster startup efficiency improvement | ⭐️⭐️⭐️⭐️⭐️ |  / | 
| Handling of full cluster node disks |   ⭐️⭐️⭐️⭐️⭐️ | /  | 
| Fixed TCP self-connect problem| ⭐️⭐️⭐️⭐️⭐️ | / | 
| PROCESSLIST enhancement | ⭐️⭐️⭐️⭐️⭐️ | /  | 


## GreatSQL Release Notes
### GreatSQL 8.0
- [Changes in GreatSQL 8.0.32-25 (2023-12-28)](changes-greatsql-8-0-32-25-20231228.md)
- [Changes in GreatSQL 8.0.32-24 (2023-6-5)](changes-greatsql-8-0-32-24-20230605.md)
- [Changes in GreatSQL 8.0.25-17 (2023-3-13)](changes-greatsql-8-0-25-17-20230313.md)
- [Changes in GreatSQL 8.0.25-16 (2022-5-16)](changes-greatsql-8-0-25-16-20220516.md)
- [Changes in GreatSQL 8.0.25-15 (2021-8-26)](changes-greatsql-8-0-25-20210820.md)

### GreatSQL 5.7
- [Changes in GreatSQL 5.7.36-39 (2022-4-7)](changes-greatsql-5-7-36-20220407.md)




**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../../greatsql-wx.jpg)
