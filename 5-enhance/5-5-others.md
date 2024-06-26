# GreatSQL 其他增强
---

GreatSQL 支持采用 Clone 实现在线全量热备和增备，以及 Clone 备份压缩等多个安全提升特性，进一步保障业务数据可靠性，更适用于金融级应用场景。

1. 支持采用 Clone 实现在线全量热备和增备以及恢复（类似 Xtrabackup），结合 Binlog 可实现恢复到指定时间点。此外，Clone 备份还支持压缩功能。详见：[Clone 备份](./5-5-clone-compressed-and-incrment-backup.md)。



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
