# GreatSQL高安全
---

GreatSQL支持逻辑备份加密、CLONE备份加密、审计日志入表、表空间国密加密等多个安全提升特性，进一步保障业务数据安全，更适用于金融级应用场景。

1. 支持在mysqldump进行逻辑备份时产生加密备份文件，提升备份文件安全性，避免备份文件被盗或泄漏时造成损失。更详细内容参考：[mysqldump备份加密](5-4-security-mysqldump-encrypt.md)。
2. 支持在利用CLONE备份时同步进行加密操作，提升备份文件安全性，避免备份文件被盗或泄漏时造成损失。更详细内容参考：[CLONE备份加密](5-4-security-clone-encrypt.md)。
3. 支持将审计日志写入数据表中，并且设置审计日志入表规则，以便达到不同的审计需求。更详细内容参考：[审计日志入表](5-4-security-audit-log-in-table.md)。
4. 支持在MySQL原有keyring架构下，通过国密算法，增强GreatSQL的安全性。更详细内容参考：[InnoDB表空间国密加密](5-4-security-innodb-tablespace-encrypt.md)。

**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![输入图片说明](https://images.gitee.com/uploads/images/2021/0802/141935_2ea2c196_8779455.jpeg "greatsql社区-wx-qrcode-0.5m.jpg")
