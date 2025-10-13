# GreatSQL 高安全
---

GreatSQL 支持逻辑备份加密、CLONE 备份加密、审计、表空间国密加密、敏感数据脱敏等多个安全提升特性，进一步保障业务数据安全，更适用于金融级应用场景。

- 支持 [mysqldump 逻辑备份加密](./5-4-security-mysqldump-encrypt.md)，提供了利用 mysqldump 逻辑备份的安全加密需求。
- 支持 [Clone 备份加密](./5-4-security-clone-encrypt.md)，提供了利用 Clone 物理备份的安全加密需求。
- 支持 [审计功能](./5-4-security-audit.md)，及时记录和发现未授权或不安全行为。
- 支持 [InnoDB 表空间国密加密算法](./5-4-security-encrypt-with-gmssl.md)，确保重要数据的加密安全。
- 支持 [基于函数和策略的两种数据脱敏](./5-4-security-data-masking.md) 工作方式，保障敏感用户数据查询结果保密性。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
