# 防范误操作
---

本文介绍如何避免误删库、删表等误操作，以及如何提高数据库的安全性。

##  常见危险误操作
在线上生产环境中的任何操作都要十分谨慎，可能因为微小疏忽造成无法挽回的巨大损失。

比较常见的线上误操作有几种：
- 想要删除当前目录下的文件，却不小心执行了 `rm -fr /`，把整个系统中的所有文件都给强行删了。 
- 误以为是测试环境，想要删除某个数据对象，却把线上生产环境的数据库、表等数据对象给删除了。
- 误以为是测试环境，想要关闭或重启数据库实例，甚至是关闭或重启主机操作系统。
- 服务器更换硬盘等热插拔操作，现场工程师搞错信息，把正常的服务器给插拔了。
- 只想更新或删除部分数据，但由于还没来得及写好WHERE条件，不小心按下了回车键，导致全表被更新或删除。

可以防范的方法有几个：
1. 总是确认每个数据库是否有可靠的备份策略，以及备份文件的有效性。
1. 配置好一个延迟复制实例，避免在主节点上误操作删除数据后，还可以在从节点上实现快速恢复。
1. 避免层层跳转的服务器连接方式，每跳转一次，就多了一分误操作的可能性。
1. 完成操作后立即退出生产业务服务器，减少犯错误的机会。
1. 经常性确认服务器、数据库和路径标示，并且在每次操作前都要反复确认服务器信息。
1. 每个服务器主机系统上都要设置唯一的主机名，提高辨识度。
1. 生产环境和测试环境要物理隔绝开，使之不能相互连接。
1. 连接生产环境使用专门的操作机或必须先拨VPN等，多加一道防护门槛。
1. 避免同时打开多个终端或操作窗口，这非常容易导致犯错。
1. 所有重要操作执行前，都先在文档中写清楚，并逐一检查确认无误。
1. 每个数据库的账号只授予必要的权限，避免权限过高而有了更多破坏的机会。
1. 不要在生产环境执行删除操作，而是改成RENAME操作，先改名，确认无误后再删除，而不是直接删除。
1. 在数据库中设置 `sql_safe_updates=1`，尽量避免被全表更新、删除的风险。

万一发生误删数据或者误操作大面积更新数据，可以参考下面几种方法进行闪回或挽救：

1. [MySQL数据误删除的总结](https://mp.weixin.qq.com/s/zMtgC24j7iIJ9xwbNo6AYQ)
1. [MySQL闪回工具binlog2sql](https://mp.weixin.qq.com/s/hEE12-LeCUsC1zKH48hcag)
1. [my2sql工具之快速入门](https://mp.weixin.qq.com/s/APgBs7MvJuxJvLwg5i7N_w)
1. [Slave被误写入数据如何恢复到主库](https://mp.weixin.qq.com/s/yoUNEehE6eOBQ7uFqSR48A)
1. [延迟从库加上MASTER_DELAY，主库宕机后如何快速恢复服务](https://mp.weixin.qq.com/s/qlAhbJq_ZPB5OXDd_zTQNw)
1. [一个延迟库恢复的案例](https://mp.weixin.qq.com/s/i8cvftodUhkcejswuLSQ3w)
1. [浅谈MySQL闪回的实现](https://mp.weixin.qq.com/s/ZuXS2UcgGS2p2x3p9mTwQg)

##  数据安全维护建议

为了让GreatSQL数据库运行更安全，建议遵循以下几点规范：

- 在应用端，所有用户请求及输入数据都要做预处理，不能直接提交到数据库，避免被SQL注入。
- 定期扫描应用端用户请求日志，扫描异常请求并及时处理。
- 应用服务器端部署防火墙，阻断用户非法请求。
- 应用程序上线前，都需要进行必要安全扫描，避免常见SQL注入等风险。
- 数据库端定期扫描请求特征，判断是否有符合安全隐患的请求，及时阻断处理。
- 数据库端启用审计（AUDIT）、SQL防火墙等组件，及时发现并阻断非法请求。
- 数据库中存储的敏感数据，务必先进行单向加密，避免被破解、信息泄漏。
- 生产环境中的数据，导入开发测试环境前，要先进行转码脱敏操作，避免信息泄漏。
- 做好连接请求检测和监控，发现有异常频繁请求时，及时阻断处理。


**参考资料：**
- [MySQL数据安全策略](https://mp.weixin.qq.com/s/E1TcnHXf0E-mowiQ-JcdqQ)
- [我猜你一定达不到要求的《MySQL安全策略》](https://mp.weixin.qq.com/s/TKqG5eQ4gSwNn6M5UaKaRw)
- [简单几招提高MySQL安全性](https://mp.weixin.qq.com/s/UrTXWtPMl8UQFDp-BHKsQw)
- [一种MySQL备份恢复设计思路](https://mp.weixin.qq.com/s/EThZLUV8AediGkRzYZPGjQ)
- [部署MySQL延迟从库的几个好处](https://mp.weixin.qq.com/s/HSjbrZx5fNMbzxhDc4u6cQ)
- [利用MySQL主从复制延迟拯救误删数据](https://mp.weixin.qq.com/s/UhmlZMPDn9k5LmFnEm1glQ)
- [《叶问》34期，延迟从库加上MASTER_DELAY，主库宕机后如何快速恢复服务](https://mp.weixin.qq.com/s/7ejpu9ysQhbYB2j_4-WtRQ)



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
