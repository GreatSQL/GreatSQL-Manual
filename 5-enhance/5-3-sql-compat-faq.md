# Oracle 兼容常见问题
---

## 可以不显式使用 `sql_mode = ORACLE` 来触发 **兼容模式** 吗

- 在GreatSQL配置文件my.cnf中添加 `sql_mode = ORACLE` 修改默认 `sql_mode` 值将导致GreatSQL功能异常，因为**GreatSQL所依赖的基础存储过程并没有被执行兼容改造**。
- 在GreatSQL初始化完成后，在配置文件my.cnf中添加 `sql_mode = ORACLE` 后并重启GreatSQL，新建的连接默认都会切换到Oracle兼容模式下。
- 在GreatSQL数据库进行时，修改全局设置 `SET GLOBAL sql_mode = ORACLE` 后，新建的连接默认都会切换到Oracle兼容模式下。GreatSQL重启后该默认行为失效，如果想要让这个设置持久化，可以改成 `SET PERSIST sql_mode = ORACLE`。
- 还可以在连接会话配置中固化设置 `sql_mode = ORACLE`。例如，在JDBC连接串中添加 `session_variables = "sql_mode = ORACLE"`，这样连接中SQL就无需显式设定兼容模式。

## 可以在存储过程内切换兼容模式吗

在GreatSQL中，**兼容模式** 或者说 **sql mode** 是存储过程的固有属性，决定了该存储过程如何被解析和运行。在存储过程中修改 `sql_mode` 可以改变当前的兼容模式，但当该存储过程运行结束返回后，上层上下文当中的兼容模式会被还原（与存储过程运行前一致）。

举例说明：

```
-- sql mode演示代码

SET sql_mode = DEFAULT;

DROP PROCEDURE mode_test;

DELIMITER $ ;
CREATE PROCEDURE mode_test() BEGIN
 SELECT LENGTH('测试'), @@sql_mode;
 SET sql_mode = ORACLE;
 SELECT LENGTH('测试'), @@sql_mode;
END ;
$

DELIMITER ; $

SET sql_mode = DEFAULT;
SELECT 'before test 1', LENGTH('测试'), @@sql_mode;
CALL mode_test();
SELECT 'after test 1', LENGTH('测试'), @@sql_mode;
```

该存储过程运行结果如下：

```
greatsql> SET sql_mode = DEFAULT;

-- 执行测试前调用LENGTH，输出按照GreatSQL默认行为，显示字符字节长度=6
greatsql> SELECT 'before test 1', LENGTH('测试'), @@sql_mode;
| before test 1 | LENGTH('测试')   | @@sql_mode | 
| before test 1 |                6 | ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO NO_ENGINE_SUBSTITUTION |

greatsql> CALL mode_test();
-- 存储过程中，前调用LENGTH，输出按照GreatSQL默认行为，显示字符字节长度=6
| LENGTH('测试')   | @@sql_mode  |
|                6 | ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION |

-- 存储过程中，设定Oracle兼容模式，调用LENGTH，输出按照Oracle兼容行为，显示字符字节长度=2  
| LENGTH('测试')   | @@sql_mode                                                     |
|                2 | PIPES_AS_CONCAT,ANSI_QUOTES,IGNORE_SPACE,ORACLE,SYSDATE_IS_NOW |


greatsql> SELECT 'after test 1', LENGTH('测试'), @@sql_mode;
-- 返回存储过程后，调用LENGTH，输出按照GreatSQL默认行为，显示字符字节长度=6
| before test 1 |                6 | ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO NO_ENGINE_SUBSTITUTION |
```

## 可以在触发器（trigger）和事件（event）中切换SQL兼容模式吗

在GreatSQL中，定义触发器前设定SQL兼容模式或修改`sql_mode`将影响触发器内SQL语法或函数的兼容风格。

## 为什么有些案例结果不同或无法运行通过

有可能是因为个别选项参数或`sql_mode`设置不同，导致结果不同，甚至无法运行通过。

例如在某个存储过程中，可能用到了 `RAND()` 函数，它的输出结果是随机值，那么结果可能就不同了。

又或者在[存储过程REF CURSOR, SYS_REFCURSOR用法](./sql-compat/5-3-easyuse-ora-sp-ref-cursor.md)案例中，需要确保先设置 `sql_generate_invisible_primary_key = 0`，否则可能导致存储过程运行异常，报告类似下面的错误：
```
greatsql> CALL p1()//
ERROR 1328 (HY000): Incorrect number of FETCH variables
```

可以通过执行 `SELECT @@sql_mode`、`SHOW CREATE TABLE ...` 或 `SHOW CREATE PROCEDURE ...` 来确认 `sql_mode`、表结构、存储过程、触发器、视图等的定义是否和手册中的案例一致。



- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
