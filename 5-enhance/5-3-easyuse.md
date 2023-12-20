# GreatSQL高兼容之Oracle兼容
---

从GreatSQL 8.0.32-25版本开始，在Oracle兼容方面有了巨大提升，除了OCI、DBlink、包之外，几乎支持绝大多数常用的Oracle语法、数据类型、函数、存储过程等功能。

## 1. Oracle兼容设计思路概述
GreatSQL的Oracle的兼容处理的优先原则如下：
1. GreatSQL风格的SQL和存储过程可以直接在默认SQL MODE模式下工作。
2. 与GreatSQL风格的SQL和存储过程**不冲突**的Oracle兼容功能也可以直接在默认SQL MODE模式下工作。
3. 与GreatSQL风格的SQL和存储过程**存在语法或语义冲突**的功能，需要用户显式切换到Oracle MODE模式下才能工作。

GreatSQL对Oracle的兼容主要通过以下三种不同方案来实现：
- 原生模式：Oracle、GreatSQL都支持或部分支持通用的SQL标准，对于部分简单语句，无需调整即可兼容。
- 兼容扩展：GreatSQL对于部分Oracle独有的函数和语法，在GreatSQL的Server层实现对其扩展，如：`MERGE INTO`、`CONNECT BY`，这写类型的兼容特性无需额外设定SQL MODE，直接使用即可。
- 兼容模式：在GreatSQL中设置 `SET sql_mode = ORACLE;` 即可将当前会话切换到Oracle兼容模式。在该模式下，当Oracle语法与GreatSQL语法存在语法或语义上的冲突时，GreatSQL会自行选择Oracle兼容模式。

更多关于Oracle兼容模式的说明请查看文档：[Oracle mode](./sql-compat/5-3-easyuse-ora-syntax-oraclemode.md)。

## 2. 数据类型兼容

在GreatSQL中，采用映射方式实现数据类型兼容，这属于 **扩展兼容(无需设定 `sql_mode`)** 方案。具体实现方式为：简单别名，即：在解析阶段将关键词进行替换。例如：如果使用CLOB创建的表，在系统内会被转换成LONGTEXT。

具体实现的映射包括：

| Oracle类型    | GreatSQL类型 | 兼容程度 |
| ----------- | --------- | ---- |
| CLOB        | LONGTEXT  | 简单别名 |
| NUMBER      | DECIMAL   | 简单别名 |
| VARCHAR2    | VARCHAR   | 简单别名 |
| PLS_INTEGER | INT       | 简单别名 |


示例：

```
greatsql> CREATE TABLE t1(
id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, 
c1 CLOB NOT NULL DEFAULT '', 
c2 VARCHAR2(30) NOT NULL DEFAULT '');
ERROR 1101 (42000): BLOB, TEXT, GEOMETRY or JSON column 'c1' can't have a default value

greatsql> CREATE TABLE t1(
id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, 
c1 CLOB NOT NULL, 
c2 VARCHAR2(30) NOT NULL DEFAULT '');
Query OK, 0 rows affected (0.25 sec)

greatsql> SHOW CREATE TABLE t1\G
*************************** 1. row ***************************
       Table: t1
Create Table: CREATE TABLE `t1` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `c1` longtext NOT NULL,
  `c2` varchar(30) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
1 row in set (0.01 sec)
```

更详细信息请参考 [数据类型兼容](./sql-compat/5-3-easyuse-ora-datatypes.md)。

## 3. SQL语法兼容

### 3.1 扩展兼容(无需设定 `sql_mode`)支持的SQL语法
- [ANY, ALL](./sql-compat/5-3-easyuse-ora-syntax-any-all.md)
- [CREATE FORCE VIEW](./sql-compat/5-3-easyuse-ora-syntax-createforceview.md)
- [Hierarchical Query(分层查询)](./sql-compat/5-3-easyuse-ora-syntax-hierarchical-query.md)
- [DATETIME INTERVAL](./sql-compat/5-3-easyuse-ora-syntax-datetime-interval.md)
- [EXECUTE IMMEDIATE](./sql-compat/5-3-easyuse-ora-syntax-execute-immediate.md)
- [EXPLAIN PLAN FOR](./sql-compat/5-3-easyuse-ora-syntax-explain-plan-for.md)
- [EXTERNAL TABLE](./sql-compat/5-3-easyuse-ora-syntax-external-table.md)
- [FULL JOIN](./sql-compat/5-3-easyuse-ora-syntax-full-join.md)
- [INSERT ALL INTO](./sql-compat/5-3-easyuse-ora-syntax-insert-all.md)
- [KEEP FIRST/LAST](./sql-compat/5-3-easyuse-ora-syntax-keep.md)
- [MERGE INTO](./sql-compat/5-3-easyuse-ora-syntax-merge-into.md)
- [MINUS](./sql-compat/5-3-easyuse-ora-syntax-minus.md)
- [ORACLE HINT](./sql-compat/5-3-easyuse-ora-syntax-hint.md)
- [ROWNUM](./sql-compat/5-3-easyuse-ora-syntax-rownum.md)
- [SELECT...FOR UPDATE OF COLUMNS](./sql-compat/5-3-easyuse-ora-syntax-forupdate-ofcolumn.md)
- [SELECT...OFFSET...FETCH](./sql-compat/5-3-easyuse-ora-syntax-offset-fetch.md)
- [SEQUENCE](./sql-compat/5-3-easyuse-ora-syntax-sequence.md)
- [(+) 外连接](./sql-compat/5-3-easyuse-ora-syntax-oracle-plus.md)
- [子查询无别名](./sql-compat/5-3-easyuse-ora-syntax-subquery-without-alias.md)
- [空串''与NULL等价开关](./sql-compat/5-3-easyuse-ora-syntax-empstr-equal-null.md)
- [字符串列设置CURRENT_TIMESTAMP默认值](./sql-compat/5-3-easyuse-ora-syntax-default-val-curtime.md)
- [移除指定sql_mode](./sql-compat/5-3-easyuse-ora-syntax-shrinkmode.md)
- 更多 ...

### 3.2 兼容模式(需设定 `sql_mode`)支持的SQL语法
- [CREATE TYPE](./sql-compat/5-3-easyuse-ora-syntax-create-type.md)
- [CREATE TABLE OF TYPE](./sql-compat/5-3-easyuse-ora-syntax-table-oftype.md)
- [DATETIME加减运算](./sql-compat/5-3-easyuse-ora-syntax-datetime-arithmetic.md)
- [DELETE语句支持不带FROM](./sql-compat/5-3-easyuse-ora-syntax-delete-without-from.md)
- [EXEC](./sql-compat/5-3-easyuse-ora-syntax-oracle-exec.md)
- [ORDER BY兼容](./sql-compat/5-3-easyuse-ora-syntax-order-by.md)
- [PIVOT](./sql-compat/5-3-easyuse-ora-syntax-pivot.md)
- [RATIO_TO_REPORT](./sql-compat/5-3-easyuse-ora-syntax-ratiotoreport.md)
- [SELECT...FOR UPDATE WAIT N](./sql-compat/5-3-easyuse-ora-syntax-forupdate-waitn.md)
- [SQLCODE_SQLERRM_FUNCTION](./sql-compat/5-3-easyuse-ora-func-sqlcode-sqlerrm.md)
- [SYSDATE_IS_NOW模式](./sql-compat/5-3-easyuse-ora-syntax-sysdateisnow.md)
- [TABLE FUNCTION](./sql-compat/5-3-easyuse-ora-syntax-table-func.md)
- [TABLE UDT](./sql-compat/5-3-easyuse-ora-syntax-table-udt.md)
- [UPDATE SET多字段更新](./sql-compat/5-3-easyuse-ora-syntax-update-set.md)
- [WITH FUNCTION](./sql-compat/5-3-easyuse-ora-syntax-with-func.md)
- [全局临时表](./sql-compat/5-3-easyuse-ora-syntax-global-temptable.md)
- [带双引号的存储过程创建](./sql-compat/5-3-easyuse-ora-syntax-psname-quotes.md)
- [Oracle注释风格](./sql-compat/5-3-easyuse-ora-syntax-oracle-comment.md)
- [索引中NULL视为相同值](./sql-compat/5-3-easyuse-ora-syntax-oraclemode-nullequal.md)
- 更多 ...

## 4. 函数兼容

### 4.1 扩展兼容(无需设定 `sql_mode`)支持的函数
- [ADD_MONTHS](./sql-compat/5-3-easyuse-ora-func-addmonths.md)
- [CAST](./sql-compat/5-3-easyuse-ora-func-cast.md)
- [CHR](./sql-compat/5-3-easyuse-ora-func-chr.md)
- [CURRENT_TIMESTAMP](./sql-compat/5-3-easyuse-ora-func-currenttimestamp.md)
- [DECODE](./sql-compat/5-3-easyuse-ora-func-decode.md)
- [DUMP](./sql-compat/5-3-easyuse-ora-func-dump.md)
- [INITCAP](./sql-compat/5-3-easyuse-ora-func-initcap.md)
- [INSTRB](./sql-compat/5-3-easyuse-ora-func-instrb.md)
- [LENGTHB](./sql-compat/5-3-easyuse-ora-func-lengthb.md)
- [LIST_AGG](./sql-compat/5-3-easyuse-ora-func-listagg.md)
- [MONTHS_BETWEEN](./sql-compat/5-3-easyuse-ora-func-monthsbetween.md)
- [NCHR](./sql-compat/5-3-easyuse-ora-func-nchr.md)
- [NVL](./sql-compat/5-3-easyuse-ora-func-nvl.md)
- [NVL2](./sql-compat/5-3-easyuse-ora-func-nvl2.md)
- [RAWTOHEX](./sql-compat/5-3-easyuse-ora-func-rawtohex.md)
- [REGEXP_COUNT](./sql-compat/5-3-easyuse-ora-func-regexpcount.md)
- [REGEXP_REPLACE](./sql-compat/5-3-easyuse-ora-func-regexpreplace.md)
- [REPLACE](./sql-compat/5-3-easyuse-ora-func-replace.md)
- [SUBSTRB](./sql-compat/5-3-easyuse-ora-func-substrb.md)
- [SYS_GUID](./sql-compat/5-3-easyuse-ora-func-sysguid.md)
- [SYSTIMESTAMP](./sql-compat/5-3-easyuse-ora-func-systimestamp.md)
- [TO_CHAR](./sql-compat/5-3-easyuse-ora-func-tochar.md)
- [TO_CLOB](./sql-compat/5-3-easyuse-ora-func-toclob.md)
- [TO_DATE](./sql-compat/5-3-easyuse-ora-func-todate.md)
- [TO_NUMBER](./sql-compat/5-3-easyuse-ora-func-tonumber.md)
- [TO_TIMESTAMP](./sql-compat/5-3-easyuse-ora-func-totimestamp.md)
- [TRANSLATE](./sql-compat/5-3-easyuse-ora-func-translate.md)
- [TRUNC](./sql-compat/5-3-easyuse-ora-func-trunc.md)
- [VSIZE](./sql-compat/5-3-easyuse-ora-func-vsize.md)
- [WM_CONCAT](./sql-compat/5-3-easyuse-ora-func-wmconcat.md)
- 更多 ...

### 4.2 兼容模式(需设定 `sql_mode`)支持的函数
- [INSTR](./sql-compat/5-3-easyuse-ora-func-instr.md)
- [LENGTH](./sql-compat/5-3-easyuse-ora-func-length.md)
- [LPAD](./sql-compat/5-3-easyuse-ora-func-lpad.md)
- [RPAD](./sql-compat/5-3-easyuse-ora-func-rpad.md)
- [SUBSTR](./sql-compat/5-3-easyuse-ora-func-substr.md)
- [SYSDATE](./sql-compat/5-3-easyuse-ora-func-sysdate.md)
- [TRIM/LTRIM/RTRIM](./sql-compat/5-3-easyuse-ora-func-trim.md)
- 更多 ...

**注意**：以上函数在设定 `sql_mode = ORACLE` 后，行为与Oracle会更加接近；反之则保持GreatSQL的原生行为。


## 5. 存储过程/函数兼容

GreatSQL支持Oracle风格的存储过程使用方式，部分存储过程/函数部分在 `ORACLE` 模式下做了基础结构改造，详见：[存储过程基础结构改造说明](./sql-compat/5-3-easyuse-ora-sp-basic-constructs.md)。

### 5.1 扩展兼容(无需设定 `sql_mode`)支持的存储过程/函数用法
- [CREATE OR REPLACE扩展](./sql-compat/5-3-easyuse-ora-sp-create-or-replace.md)
- 更多 ...

### 4.2 扩展兼容(无需设定 `sql_mode`)支持的存储过程/函数用法GreatSQL实现的兼容模式(需设定 `sql_mode = ORACLE`)，包括：
- [CURSOR](./sql-compat/5-3-easyuse-ora-sp-cursor.md)
- [EXIT/EXIT WHEN](./sql-compat/5-3-easyuse-ora-sp-exit-when.md)
- [FORALL LOOP](./sql-compat/5-3-easyuse-ora-sp-forall-loop.md)
- [FOR LOOP](./sql-compat/5-3-easyuse-ora-sp-for-loop.md)
- [GOTO](./sql-compat/5-3-easyuse-ora-sp-goto-label.md)
- [IF .. ELSIF](./sql-compat/5-3-easyuse-ora-sp-if.md)
- [REF CURSOR, SYS_REFCURSOR](./sql-compat/5-3-easyuse-ora-sp-ref-cursor.md)
- [BULK COLLECT](./sql-compat/5-3-easyuse-ora-sp-bulk-collect.md)
- [TRIGGER](./sql-compat/5-3-easyuse-ora-sp-trigger.md)
- [TYPE IS RECORD](./sql-compat/5-3-easyuse-ora-sp-record-type.md)
- [TYPE IS TABLE](./sql-compat/5-3-easyuse-ora-sp-table-type.md)
- [VAR_TYPE](./sql-compat/5-3-easyuse-ora-sp-var-type.md)
- [WHILE...LOOP... END LOOP](./sql-compat/5-3-easyuse-ora-sp-while.md)
- [匿名存储块](./sql-compat/5-3-easyuse-ora-sp-anony-block.md)
- [命名标记法传递参数](./sql-compat/5-3-easyuse-ora-sp-named-parameters.md)
- [存储过程/函数支持默认参数(DEFAULT)](./sql-compat/5-3-easyuse-ora-sp-default-optval.md)
- [存储过程支持使用RETURN](./sql-compat/5-3-easyuse-ora-sp-return.md)
- [异常处理 EXCEPTION HANDLER](./sql-compat/5-3-easyuse-ora-sp-exception-handler.md)
- 更多 ...


示例:

- Oracle环境下的存储过程用法:

```
CREATE OR REPLACE EDITIONABLE FUNCTION f0(delta INT DEFAULT 0) RETURN TIMESTAMP AS
    cnt INT := 10;
BEGIN
    RETURN SYSDATE + delta*cnt;
END;

SELECT f0(2) FROM DUAL ;
SELECT f0() FROM DUAL ;
```

- GreatSQL **原生模式**下的存储过程用法:

```
CREATE OR REPLACE FUNCTION f1(delta INT) RETURNS TIMESTAMP
BEGIN
    DECLARE cnt INT DEFAULT 10;
    SET delta = cnt * delta;
    RETURN DATE_ADD(SYSDATE(), INTERVAL delta DAY);
END;

SELECT f0(2) FROM DUAL ;
```

- GreatSQL **兼容模式** 下存储过程用法:

```
SET sql_mode = ORACLE;

CREATE OR REPLACE FUNCTION f0(delta INT DEFAULT 0) RETURN TIMESTAMP AS
    cnt INT := 10;
BEGIN
    RETURN SYSDATE + delta*cnt;
END;

SELECT f0(2) FROM DUAL ;
SELECT f0() FROM DUAL ;
```


## 6. Oracle兼容常见问题

### 6.1 可以不显式使用 `sql_mode = ORACLE` 来触发 **兼容模式** 吗

- 在GreatSQL配置文件my.cnf中添加 `sql_mode = ORACLE` 修改默认 `sql_mode` 值将导致GreatSQL功能异常，因为**GreatSQL所依赖的基础存储过程并没有被执行兼容改造**。
- 在GreatSQL初始化完成后，在配置文件my.cnf中添加 `sql_mode = ORACLE` 后并重启GreatSQL，新建的连接默认都会切换到Oracle兼容模式下。
- 在GreatSQL数据库进行时，修改全局设置 `SET GLOBAL sql_mode = ORACLE` 后，新建的连接默认都会切换到Oracle兼容模式下。GreatSQL重启后该默认行为失效，如果想要让这个设置持久化，可以改成 `SET PERSIST sql_mode = ORACLE`。
- 还可以在连接会话配置中固化设置 `sql_mode = ORACLE`。例如，在JDBC连接串中添加 `session_variables = "sql_mode = ORACLE"`，这样连接中SQL就无需显式设定兼容模式。

### 6.2 可以在存储过程内切换兼容模式吗

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

### 6.3 可以在触发器（trigger）和事件（event）中切换SQL兼容模式吗

在GreatSQL中，定义触发器前设定SQL兼容模式或修改`sql_mode`将影响触发器内SQL语法或函数的兼容风格。



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
