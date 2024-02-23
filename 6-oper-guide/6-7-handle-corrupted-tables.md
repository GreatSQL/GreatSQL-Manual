# 终止空闲事务

---

此功能限制所有事务存储引擎的空闲事务的期限。达到指定限制时终止任何空闲事务。此限制可防止用户错误地阻止 InnoDB 清除。

## 新增系统参数

### kill_idle_transaction

| System Variable Name | kill_idle_transaction |
| -------------------- | --------------------- |
| Config file          | YES                   |
| Variable Scope       | Global                |
| Dynamic Variable     | YES                   |
| Data type            | Integer               |
| Default              | 0 (disabled)          |
| Range                | Seconds               |

> 建议将此参数设置为300，既自动杀掉超过5分钟不活跃事务，避免行锁被长时间持有

## 问题反馈

- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
