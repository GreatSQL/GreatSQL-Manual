# Schema 设计优化
---

本节介绍如何在 GreatSQL 中优化 Schema 模式开发设计。

## 基本原则

在进行数据库 Schema 开发设计时，有两个很重要的原则：

### 数据表中存储的**数据量越少越好**

最好是只存储应用程序经常读取的热数据即可，把更多的冷数据归档存储在另外的表里，这样可以有效降低每次 SQL 读取扫描的总数据量。

有时候，我们可能存在一个误区，以为在数据库中存储越多数据越显得这个数据库更强，显得 DBA 或架构师更厉害。

不过我们认为更理智的做法是，核心业务数据库中的热点数据表存储的热数据越少越好。数据库在其有限的内存缓冲区（在 GreatSQL 中，由 `innodb_buffer_pool_size` 选项定义其大小）里存储频繁访问的活跃数据，如果经常读取的热数据都能加载到内存缓冲区中，那很明显可以避免或减少物理读发生的次数；如果热数据太多，没办法全部加载到内存缓冲区中，当业务应用中需要读取的数据不在其中时，就需要进行物理读，将这些数据读取到缓冲区，这很明显效率更低。

可以考虑以下几种架构设计方法：
- 物理级冷热数据分离，也即用一个热表存储热数据，冷数据归档到其他物理表中，可以利用 `pt-archiver` 之类的的工具实现定期自动归档。此外，还可以利用主从复制或 MGR 架构，实现读写分离，即在主节点读写热数据表，而对冷数据的请求都分发到从节点去，想尽一切办法降低对 **主节点**、**热数据表** 的读写请求压力。
- 利用表分区（partition）进行冷热数据分区，热数据放在一个独立分区，冷数据放在其他分区，利用 **[event scheduler](https://dev.mysql.com/doc/refman/8.0/en/events-configuration.html)** 实现定期自动创建、删除分区，以及将热数据分区的数据归档到冷数据分区。
- 在数据库前端更加缓存服务，让应用请求先发送到缓存服务上，只有缓存里没有相应的数据时，才会到后端数据库节点读取。在这个方案中，缓存服务可以考虑采用分布式以降低单点故障风险，并且进行多级封装以降低单层故障风险对后端数据库的雪崩式冲击。

### 数据表中每条记录的**宽度越窄越好**

也可以换个说法，就是每条记录里存储的内容越短越好，这么做的好处是内存缓冲区中可以存储更多热数据，可以减少物理 I/O 读取发生的次数。

在存储数据时，应尽量压缩要写入的数据大小、长度，例如用 `VARCHAR` 字符串 `'one', 'two'` 表示某种状态时，就可以改用 `TINYINT` 数据类型，这么做数据存储长度更小，且新的数据类型也更高效。还可以对要写入的字符串进行哈希压缩处理。

有些情况下，确实需要在数据库中存储长文本、字符串等较大数据对象时，可以将这些大对象数据内容从主表中分离出来，存储在另外的数据表中。也即把原来的一个大宽表，拆分成两个或多个子表，把跟应用业务关系最紧密的数据放在主表中，其他关联度没那么紧密的放在其他表中。这样做的好处也很明显，可以让更多需要被高频访问的热数据加载到内存缓冲区中，提高应用业务的访问效率。

## Schema 设计优化

在进行 GreatSQL Schema 开发设计时，建议遵循以下规范及优化思路：
- 使用规范化的数据库模式，尽量遵循第三范式或 BC 范式，减少数据冗余，提高数据一致性和完整性。不过，如果适度的冗余能减少在应用开发中的 JOIN 频率，也是值得的，需要综合平衡。
- 根据存储需求选择合适的数据类型，避免使用过大或不必要的数据类型，节省存储空间和提高查询效率。例如上面提到的，能用 `INT` 的就不用 `VARCHAR`；日期时间及 IPv4 地址不要用 `VARCHAR` 而用 `DATETIME` 或 `INT` 来存储；一些需要用 `ENUM`、`SET` 的场合，考虑改用 `TINYINT` 类型。
- 对于大型数据表，可以考虑使用表分区，将数据分散到多个物理存储上，提高查询效率和管理性能。
- 根据业务需求进行垂直拆分（Vertical Partitioning）和水平拆分（Horizontal Partitioning），将数据分散到不同的表或数据库中，提高性能和扩展性。
- 从数据库实例，到数据库模式（Schema），再到数据表和列，包括存储过程、触发器、events等所有数据对象，以及应用连接和查询结果，都全部采用同一个字符集（校验集），可以避免发生乱码以及因为字符集（校验集）不一致造成类型隐式转换风险。
- 尽量少用 `FLOAT`、`DOUBLE` 数据类型，一方面它存储的不是精确值，一般不能用于等值查询判断；另外，数据库系统对 `FLOAT` 数据类型的处理效率通常也较低。
- 尽量少用 `TEXT`、`BLOB` 等大对象类型，它们的存储效率较低，也更容易造成严重的表空间碎片。
- 尽量避免存储 NULL 值并且定义时加上 `NOT NULL` 约束，因为 NULL 是个特殊的数据，不能直接用于等值查询判断，数据库系统对 NULL 的处理效率通常也较低。
- 每个表都有自增 INT 列作为主键，以及表示创建时间（gmt_create）、最后更新时间（gmt_modify）的两个列，这对后续维护数据表很有帮助。
- 在一个数据库实例内，数据表（包含表分区在内）数量通常不要超过一万个，每个 Schema（数据库）内数据表的数量通常不要超过一千个，避免元数据管理开销太高。



**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)