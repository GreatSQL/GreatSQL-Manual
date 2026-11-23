# High Security
---

GreatSQL supports multiple security enhancement features, including logical backup encryption, Clone backup encryption, auditing, tablespace encryption with national cryptographic algorithms (GM), and sensitive data masking, further protecting business data security and making it more suitable for financial-grade application scenarios.

- Supports [mysqldump logical backup encryption](./5-4-security-mysqldump-encrypt.md), providing secure encryption for logical backups using mysqldump.
- Supports [Clone backup encryption](./5-4-security-clone-encrypt.md), providing secure encryption for physical backups using Clone.
- Supports [auditing](./5-4-security-audit.md), recording and detecting unauthorized or unsafe behaviors in a timely manner.
- Supports [InnoDB tablespace encryption with national cryptographic algorithms](./5-4-security-encrypt-with-gmssl.md), ensuring the encryption security of important data.
- Supports two data masking approaches based on [functions and policies](./5-4-security-data-masking.md), ensuring the confidentiality of query results for sensitive user data.


**Scan the QR code to follow the WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
