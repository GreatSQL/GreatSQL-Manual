# GreatSQL高易用性
---

GreatSQL支持多个SQL兼容特性，包括CLOB、VARCHAR2数据类型，DATETIME运算、ROWNUM、子查询无别名、EXPLAIN PLAN FOR等语法，以及ADD_MONTHS()、CAST()、DECODE()等17个函数，使用GreatSQL可以降低迁移改造成本和工作量，方便业务方更快改造适配，满足业务应用开发的高易用性及兼容性。

## 1. 数据类型
- CLOB，这是LONGTEXT的同义词，直接使用即可。
- VARCHAR2，这是VARCHAR的同义词，直接使用即可。

示例：
```
greatsql> create table t1(
id int unsigned not null auto_increment primary key, 
c1 clob not null default '', 
c2 varchar2(30) not null default '');
ERROR 1101 (42000): BLOB, TEXT, GEOMETRY or JSON column 'c1' can't have a default value

greatsql> create table t1(
id int unsigned not null auto_increment primary key, 
c1 clob not null, 
c2 varchar2(30) not null default '');
Query OK, 0 rows affected (0.25 sec)

greatsql>show create table t1\G
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

## 2. SQL语法
- [DATETIME 运算](./5-3-easyuse-sql-compat-syntax-datetime-arithmetic.md)
- [ROWNUM](./5-3-easyuse-sql-compat-syntax-rownum.md)
- [子查询无别名](./5-3-easyuse-sql-compat-syntax-subquery-without-alias.md)
- [EXPLAIN PLAN FOR](./5-3-easyuse-sql-compat-syntax-explain-plan-for.md)

## 3. 函数
- [ADD_MONTHS()](./5-3-easyuse-sql-compat-func-addmonths.md)
- [CAST()](./5-3-easyuse-sql-compat-func-cast.md)
- [DECODE()](./5-3-easyuse-sql-compat-func-decode.md)
- [INSTR()](./5-3-easyuse-sql-compat-func-instr.md)
- [LENGTH()](./5-3-easyuse-sql-compat-func-length.md)
- [LENGTHB()](./5-3-easyuse-sql-compat-func-lengthb.md)
- [MONTHS_BETWEEN()](./5-3-easyuse-sql-compat-func-monthsbetween.md)
- [NVL()](./5-3-easyuse-sql-compat-func-nvl.md)
- [SUBSTRB()](./5-3-easyuse-sql-compat-func-substrb.md)
- [SYSDATE()](./5-3-easyuse-sql-compat-func-sysdate.md)
- [TO_CHAR()](./5-3-easyuse-sql-compat-func-tochar.md)
- [TO_DATE()](./5-3-easyuse-sql-compat-func-todate.md)
- [TO_NUMBER()](./5-3-easyuse-sql-compat-func-tonumber.md)
- [TO_TIMESTAMP()](./5-3-easyuse-sql-compat-func-totimestamp.md)
- [TRANSLATE()](./5-3-easyuse-sql-compat-func-translate.md)
- [TRUNC()](./5-3-easyuse-sql-compat-func-trunc.md)
- [SYS_GUID()](./5-3-easyuse-sql-compat-func-sysguid.md)


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
