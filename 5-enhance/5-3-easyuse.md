# GreatSQL 高兼容
---

GreatSQL 实现 100% 完全兼容 MySQL 及 Percona Server For MySQL 用法，支持大多数常见 Oracle 用法，包括 [数据类型兼容](#数据类型兼容)、[函数兼容](#函数兼容)、[SQL 语法兼容](#sql语法兼容)、[存储程序兼容](#存储程序兼容) 等众多兼容扩展用法。

## Oracle兼容设计思路概述
GreatSQL的Oracle的兼容处理的优先原则如下：
- GreatSQL风格的SQL和存储程序可以直接在默认SQL MODE模式下工作。
- 与GreatSQL风格的SQL和存储程序**不冲突**的Oracle兼容功能也可以直接在默认SQL MODE模式下工作。
- 与GreatSQL风格的SQL和存储程序**存在语法或语义冲突**的功能，需要用户显式切换到Oracle MODE模式下才能工作。

GreatSQL对Oracle的兼容主要通过以下三种不同方案来实现：
- 原生模式：Oracle、GreatSQL都支持或部分支持通用的SQL标准，对于部分简单语句，无需调整即可兼容。
- 兼容扩展：GreatSQL对于部分Oracle独有的函数和语法，在GreatSQL的Server层实现对其扩展，如：`MERGE INTO`、`CONNECT BY`，这写类型的兼容特性无需额外设定SQL MODE，直接使用即可。
- 兼容模式：在GreatSQL中设置 `SET sql_mode = ORACLE;` 即可将当前会话切换到Oracle兼容模式。在该模式下，当Oracle语法与GreatSQL语法存在语法或语义上的冲突时，GreatSQL会自行选择Oracle兼容模式。

更多关于Oracle兼容模式的说明请查看文档：[Oracle mode](./sql-compat/5-3-easyuse-ora-syntax-oraclemode.md)。

## 数据类型兼容

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

## SQL语法兼容

### 扩展兼容支持的 SQL 语法

下面是在 GreatSQL 中无需设定 `sql_mode = ORACLE` 就能支持的SQL语法：
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

### 兼容模式支持的 SQL 语法

下面是在 GreatSQL 中需要先设定 `sql_mode = ORACLE` 才能支持的SQL语法：

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

## 函数兼容

### 扩展兼容支持的函数

下面是在 GreatSQL 中无需设定 `sql_mode = ORACLE` 就能支持的函数：
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

### 兼容模式支持的函数

下面是在 GreatSQL 中需要先设置 `sql_mode = ORACLE` 才能支持的函数：

- [INSTR](./sql-compat/5-3-easyuse-ora-func-instr.md)
- [LENGTH](./sql-compat/5-3-easyuse-ora-func-length.md)
- [LPAD](./sql-compat/5-3-easyuse-ora-func-lpad.md)
- [RPAD](./sql-compat/5-3-easyuse-ora-func-rpad.md)
- [SUBSTR](./sql-compat/5-3-easyuse-ora-func-substr.md)
- [SYSDATE](./sql-compat/5-3-easyuse-ora-func-sysdate.md)
- [TRIM/LTRIM/RTRIM](./sql-compat/5-3-easyuse-ora-func-trim.md)
- 更多 ...

**注意**：以上函数在设定 `sql_mode = ORACLE` 后，行为与Oracle会更加接近；反之则保持GreatSQL的原生行为。


## 存储程序兼容

GreatSQL支持Oracle风格的存储程序使用方式，部分存储程序部分在 `ORACLE` 模式下做了基础结构改造，详见：[存储程序基础结构改造说明](./sql-compat/5-3-easyuse-ora-sp-basic-constructs.md)。

### 扩展兼容支持的存储程序

下面是在 GreatSQL 中，无论 `sql_mode` 采用 *DEFAULT* 还是 *ORACLE*，都能支持 [CREATE OR REPLACE扩展](./sql-compat/5-3-easyuse-ora-sp-create-or-replace.md)，但是在不同模式下的表现也有所区别。

### 兼容模式支持的存储程序

下面是需要先设定 `sql_mode = ORACLE` 才能支持 Oracle 兼容的存储程序用法（部分用法在 `sql_mode = DEFAULT` 模式下也支持，但不具备 Oracle 兼容特性）
- [BULK COLLECT](./sql-compat/5-3-easyuse-ora-sp-bulk-collect.md)
- [CONTINUE](./sql-compat/5-3-easyuse-ora-sp-continue.md)
- [CURSOR](./sql-compat/5-3-easyuse-ora-sp-cursor.md)
- [EXIT/EXIT WHEN](./sql-compat/5-3-easyuse-ora-sp-exit-when.md)
- [FORALL LOOP](./sql-compat/5-3-easyuse-ora-sp-forall-loop.md)
- [FOR LOOP](./sql-compat/5-3-easyuse-ora-sp-for-loop.md)
- [GOTO](./sql-compat/5-3-easyuse-ora-sp-goto-label.md)
- [IF .. ELSIF](./sql-compat/5-3-easyuse-ora-sp-if.md)
- [REF CURSOR, SYS_REFCURSOR](./sql-compat/5-3-easyuse-ora-sp-ref-cursor.md)
- [TRIGGER](./sql-compat/5-3-easyuse-ora-sp-trigger.md)
- [TYPE IS RECORD](./sql-compat/5-3-easyuse-ora-sp-record-type.md)
- [TYPE IS TABLE](./sql-compat/5-3-easyuse-ora-sp-table-type.md)
- [VAR_TYPE](./sql-compat/5-3-easyuse-ora-sp-var-type.md)
- [WHILE...LOOP... END LOOP](./sql-compat/5-3-easyuse-ora-sp-while.md)
- [匿名存储块](./sql-compat/5-3-easyuse-ora-sp-anony-block.md)
- [命名标记法传递参数](./sql-compat/5-3-easyuse-ora-sp-named-parameters.md)
- [存储程序支持默认参数(DEFAULT)](./sql-compat/5-3-easyuse-ora-sp-default-optval.md)
- [存储过程支持使用RETURN](./sql-compat/5-3-easyuse-ora-sp-return.md)
- [异常处理 EXCEPTION HANDLER](./sql-compat/5-3-easyuse-ora-sp-exception-handler.md)
- 更多 ...


示例:

- Oracle环境下的存储程序用法:

```
CREATE OR REPLACE EDITIONABLE FUNCTION f0(delta INT DEFAULT 0) RETURN TIMESTAMP AS
    cnt INT := 10;
BEGIN
    RETURN SYSDATE + delta*cnt;
END;

SELECT f0(2) FROM DUAL ;
SELECT f0() FROM DUAL ;
```

- GreatSQL **原生模式**下的存储程序用法:

```
CREATE OR REPLACE FUNCTION f1(delta INT) RETURNS TIMESTAMP
BEGIN
    DECLARE cnt INT DEFAULT 10;
    SET delta = cnt * delta;
    RETURN DATE_ADD(SYSDATE(), INTERVAL delta DAY);
END;

SELECT f0(2) FROM DUAL ;
```

- GreatSQL **兼容模式** 下存储程序用法:

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

Oracle 兼容常见问题详见：[Oracle 兼容常见问题](./5-3-sql-compat-faq.md)。


**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
