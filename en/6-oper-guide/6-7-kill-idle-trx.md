# Terminating Idle Transactions

---

This feature limits the duration of idle transactions of all transactional storage engines. Any idle transaction is terminated when the specified limit is reached. This limit prevents users from mistakenly blocking InnoDB purging.

## New System Parameter

### kill_idle_transaction

| System Variable Name | kill_idle_transaction |
| -------------------- | --------------------- |
| Config file          | YES                   |
| Variable Scope       | Global                |
| Dynamic Variable     | YES                   |
| Data type            | Integer               |
| Default              | 0 (disabled)          |
| Range                | Seconds               |

::: tip Tip
It is recommended to set this parameter to 300, which automatically kills inactive transactions exceeding 5 minutes, avoiding row locks being held for a long time.
:::


**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
