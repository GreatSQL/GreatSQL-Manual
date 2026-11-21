# Others
---

GreatSQL supports online full hot backup and incremental backup using Clone, as well as Clone backup compression and other security enhancement features, further protecting the reliability of business data and making it more suitable for financial-grade application scenarios.

1. Supports online full hot backup, incremental backup and restore using Clone (similar to Xtrabackup). Combined with Binlog, data can be restored to a specified point in time. In addition, Clone backup also supports compression. For details, see: [Clone Backup](./5-5-clone-compressed-and-incrment-backup.md).
2. InnoDB Page Compression (transparent page compression) now supports the Zstd algorithm, which can further improve the page compression ratio, especially when a table contains a large amount of repeated character-type data. For details, see: [InnoDB Page Compression](./5-5-innodb-page-compression.md).

**Scan the QR code to follow the WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
