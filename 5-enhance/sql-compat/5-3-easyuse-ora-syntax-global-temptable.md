# Oracle兼容-语法-GLOBAL|PRIVATE TEMPORARY TABLE
---


## 1. 语法

```sql
SET sql_mode = ORACLE;

create_temporary_table:
	create_global_temporary | create_private_temporary

create_global_temporary:
	CREATE GLOBAL TEMPORARY TABLE 
	[ schema . ] table_ident [ ( relational_properties ) ]
	[ ON COMMIT { DELETE | PRESERVE } ROWS ]
	table_properties

create_private_temporary:
	CREATE PRIVATE TEMPORARY TABLE 
	[ schema . ] table_ident [ ( relational_properties ) ]
	[ ON COMMIT { DROP | PRESERVE } DEFINITION ]
	table_properties
```
需要先切换到 `ORACLE` 模式下才能支持本语法。


## 2. 定义和用法

GreatSQL中支持创建 `GLOBAL|PRIVATE` 两种不同的临时表。

- 1. 创建`GLOBAL TEMPORARY TABLE`。
  - 会立即创建一个临时表定义，但不会立即创建临时表实体。
  - 具体创建时机为SQL语句有插入的操作时。若创建后，在当时的SQL没有插入任何记录，则会在该SQL结束时，删除该临时表实例。
  - `ON COMMIT` 子句指定 `DELETE ROWS` 时，表示在当前事务结束时，会删除该临时表实例；
  - `ON COMMIT` 子句指定 `PRESERVE ROWS` 时，则在当前事务结束时，会保留该临时表实例及内容。
  - 当省略 `ON COMMIT` 子句时，默认为 `DELETE ROWS`。
  - 当前连接会话结束时，会删除该临时表实例。
  - 执行 `TRUNCATE` 语句也会删除该临时表实例。
  - 当系统内有任何该临时表的实例创建时，不可以对该临时表进行DDL操作，例如：`ALTER TABLE`, `CREATE INDEX`等操作。
  - 执行 `DROP TABLE` 可以立即删除当前会话该临时表实例（若存在的话）及临时表定义。若是由其他会话创建该临时表的实例时，则只会删除当前会话的临时表实例，并会在删除临时表定义时报错。
  - 执行 `SHOW CREATE TABLE` 可以显示当前会话是否已经创建临时表实例。若当前会话存在该临时表实例时（例如：对该表有写入数据）, 此时会显示为 `CREATE TEMPORARY TABLE`，不带 ``GLOBAL` 标识。

- 2. 创建`PRIVATE TEMPORARY TABLE`。
  - 会立即创建一个临时表。
  - `ON COMMIT` 子句指定 `DROP DEFINITION` 时，表示在当前事务结束时，会删除该临时表
  - `ON COMMIT` 子句指定 `PRESERVE DEFINITION` 时，则在当前事务结束时，会保留该临时表。
  - 当省略 `ON COMMIT` 子句时，默认为 `DROP DEFINITION`。
  - 当前会话结束时，会删除该临时表。
  - 执行 `DROP TABLE` 会删除该临时表。


## 3. Oracle兼容说明

1. 临时表的维护及使用，是基于GreatSQL的临时表。因此任一临时表都只能在当前语句中被引用一次。例如：t1是临时表，则 `SELECT * FROM t1 UNION SELECT * FROM t1` 会报错，见下方详细案例。
2. 在MGR环境中，其中一个节点创建临时表实例时，在其他节点的DDL操作并不会被锁阻塞，只会依照目前MGR环境中的DDL操作规则，对临时表定义进行操作。
3. 与GreatSQL临时表相同，`SHOW TABLES` 命令不会显示已创建的 `GLOBAL|PRIVATE TEMPORARY TABLE` 临时表实例。
4. 如果同时使用GreatSQL原生的 `TEMPORARY TABLE` 创建同名的 `GLOBAL TEMPORARY TABLE`，会让后续SQL语句以原生的 `TEMPORARY TABLE` 为主。
5. 与GreatSQL常规临时表支持的数据类型一致，当临时表中包含 `BLOB` 类型列时不会报错。
6. 不支持对 `GLOBAL TEMPORARY TABLE` 创建触发器。但触发器及视图内可以引用 `GLOBAL TEMPORARY TABLE`。
7. 执行 `RENAME TABLE` 与 `ALTER TABLE .. RENAME` 语句时，必须当时没有 `GLOBAL TEMPORARY TABLE` 临时表同名实例(Oracle 沒有這個限制)。
8. 每个 `GLOBAL TEMPORARY TABLE` 实例的 `AUTO_INCREMENT` 字段都一律由1开始（Oracle没这个约束）。
9. 当创建临时表实例后，在任何会话中删除 `GLOBAL TEMPORARY TABLE` 所在的数据库时，该临时表实例会继续存在。若之后继续创建同名的数据库及同名的 `GLOBAL TEMPORARY TABLE`，并不会对已经生成的临时表实例有影响。
10. 由于在 `PRIVATE TEMPORARY TABLE` 中是不支持指定主键的，因此在创建 `PRIVATE TEMPORARY TABLE` 时不能显式指定主键，也必须设置 `sql_generate_invisible_primary_key=0`，避免隐式创建主键，否则会提示不支持该用法。
11. 执行 `TRUNCATE` 语句会终止当前事务，会对当前事务中创建的临时表有影响。


## 4. 示例

```sql
greatsql> SET sql_mode = ORACLE;

greatsql> CREATE TEMPORARY TABLE t1 (id INT);
Query OK, 0 rows affected (0.01 sec)

greatsql> INSERT INTO t1 VALUES (1);
Query OK, 1 row affected (0.00 sec)

-- 1. 普通临时表在同一个SQL语句中，只能被引用一次
greatsql> SELECT * FROM t1 UNION SELECT * FROM t1;
ERROR 1137 (HY000): Can not reopen table: 't1'

greatsql> SELECT * FROM t1;
+------+
| id   |
+------+
|    1 |
+------+
1 row in set (0.01 sec)

-- 2. 创建GLOBAL TEMPORARY TABLE，指定不同的ON COMMIT子句

-- 先切换到ORACLE模式下
greatsql> SET sql_mode = ORACLE;

greatsql> CREATE GLOBAL TEMPORARY TABLE gtt1 (
 id INT PRIMARY KEY,
 c1 VARCHAR(16));

-- 不指定ON COMMIT子句，默认为DELETE ROWS
greatsql> SHOW CREATE TABLE gtt1\G
*************************** 1. row ***************************
       Table: gtt1
Create Table: CREATE GLOBAL TEMPORARY TABLE "gtt1" (
  "id" int NOT NULL,
  "c1" varchar(16) DEFAULT NULL,
  PRIMARY KEY ("id")
) ON COMMIT DELETE ROWS ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

-- 指定ON COMMIT PRESERVE ROWS
greatsql> CREATE GLOBAL TEMPORARY TABLE gtt2 (
  id INT PRIMARY KEY,
  c1 VARCHAR(16)
) ON COMMIT PRESERVE ROWS;

greatsql> SHOW CREATE TABLE gtt2\G
*************************** 1. row ***************************
       Table: gtt2
Create Table: CREATE GLOBAL TEMPORARY TABLE "gtt2" (
  "id" int NOT NULL,
  "c1" varchar(16) DEFAULT NULL,
  PRIMARY KEY ("id")
) ON COMMIT PRESERVE ROWS ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

greatsql> INSERT INTO gtt1 SELECT 1, 'c11' FROM DUAL;
Query OK, 0 rows affected (0.40 sec)
Records: 1  Duplicates: 0  Warnings: 0

-- 上面的SQL中未显式启用事务，SQL执行结束后等于事务也结束了，所以查询不到数据
greatsql> SELECT * FROM gtt1;
Empty set (0.00 sec)

greatsql> INSERT INTO gtt2 SELECT 1, 'c12' FROM DUAL;
Query OK, 0 rows affected (0.04 sec)
Records: 1  Duplicates: 0  Warnings: 0

-- SQL语句执行结束后还能查询到数据
greatsql> SELECT * FROM gtt2;
+----+------+
| id | c1   |
+----+------+
|  1 | c12  |
+----+------+
1 row in set (0.00 sec)

-- 再次查看DDL，gtt1不变
greatsql> SHOW CREATE TABLE gtt1\G
*************************** 1. row ***************************
       Table: gtt1
Create Table: CREATE GLOBAL TEMPORARY TABLE "gtt1" (
  "id" int NOT NULL,
  "c1" varchar(16) DEFAULT NULL,
  PRIMARY KEY ("id")
) ON COMMIT DELETE ROWS ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
1 row in set (0.00 sec)

-- 再次查看DDL，gtt2变成了普通临时表
greatsql> SHOW CREATE TABLE gtt2\G
*************************** 1. row ***************************
       Table: gtt2
Create Table: CREATE TEMPORARY TABLE "gtt2" (
  "id" int NOT NULL,
  "c1" varchar(16) DEFAULT NULL,
  PRIMARY KEY ("id")
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
1 row in set (0.00 sec)

-- 3. 显式开启事务测试
greatsql> DELETE FROM gtt1;
greatsql> DELETE FROM gtt2;

greatsql> BEGIN; 
greatsql> INSERT INTO gtt1 SELECT 1, 'c11' FROM DUAL;
greatsql> INSERT INTO gtt2 SELECT 1, 'c12' FROM DUAL;

-- 此时事务尚未提交，gtt1表能查询到数据
greatsql> SELECT * FROM gtt1;
+----+------+
| id | c1   |
+----+------+
|  1 | c11  |
+----+------+
1 row in set (0.00 sec)

greatsql> SELECT * FROM gtt2;
+----+------+
| id | c1   |
+----+------+
|  1 | c12  |
+----+------+
1 row in set (0.00 sec)

-- 再次查看DDL，发现都变成了普通临时表
greatsql> SHOW CREATE TABLE gtt1\G
*************************** 1. row ***************************
       Table: gtt1
Create Table: CREATE TEMPORARY TABLE "gtt1" (
  "id" int NOT NULL,
  "c1" varchar(16) DEFAULT NULL,
  PRIMARY KEY ("id")
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
1 row in set (0.00 sec)

greatsql> SHOW CREATE TABLE gtt2\G
*************************** 1. row ***************************
       Table: gtt2
Create Table: CREATE TEMPORARY TABLE "gtt2" (
  "id" int NOT NULL,
  "c1" varchar(16) DEFAULT NULL,
  PRIMARY KEY ("id")
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
1 row in set (0.00 sec)

-- 提交事务后再次查询数据，发现gtt1表被清空
greatsql> COMMIT;

greatsql> SELECT * FROM gtt1;
Empty set (0.00 sec)

greatsql> SELECT * FROM gtt2;
+----+------+
| id | c1   |
+----+------+
|  1 | c12  |
+----+------+
1 row in set (0.00 sec)

-- 再次查看DDL，gtt1恢复成GLOBAL TEMPORARY TABLE，gtt2继续保持普通临时表
greatsql> SHOW CREATE TABLE gtt1\G
*************************** 1. row ***************************
       Table: gtt1
Create Table: CREATE GLOBAL TEMPORARY TABLE "gtt1" (
  "id" int NOT NULL,
  "c1" varchar(16) DEFAULT NULL,
  PRIMARY KEY ("id")
) ON COMMIT DELETE ROWS ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

greatsql> SHOW CREATE TABLE gtt2\G
*************************** 1. row ***************************
       Table: gtt2
Create Table: CREATE TEMPORARY TABLE "gtt2" (
  "id" int NOT NULL,
  "c1" varchar(16) DEFAULT NULL,
  PRIMARY KEY ("id")
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci


-- 3. 创建PRIVATE TEMPORARY TABLE，指定不同的ON COMMIT子句，
-- 3.1 指定PRESERVE DEFINITION子句
greatsql> SET sql_mode = ORACLE;
greatsql> CREATE PRIVATE TEMPORARY TABLE ora$ptt_s1(
id INT,
c1 VARCHAR(30)
)ON COMMIT PRESERVE DEFINITION;

greatsql> INSERT INTO ora$ptt_s1 VALUES (1, 'ora$ptt_s1-1');
greatsql> INSERT INTO ora$ptt_s1 VALUES (2, 'ora$ptt_s1-2');

-- 查看table
greatsql> SHOW CREATE TABLE ora$ptt_s1\G
*************************** 1. row ***************************
       Table: ora$ptt_s1
Create Table: CREATE PRIVATE TEMPORARY TABLE "ora$ptt_s1" (
  "id" int DEFAULT NULL,
  "c1" varchar(30) DEFAULT NULL
) ON COMMIT PRESERVE DEFINITION ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

-- 查询数据
greatsql> SELECT * FROM ora$ptt_s1;
+------+--------------+
| id   | c1           |
+------+--------------+
|    1 | ora$ptt_s1-1 |
|    2 | ora$ptt_s1-2 |
+------+--------------+
2 rows in set (0.00 sec)

-- 3.2 指定DROP DEFINITION子句

-- 开始事务
greatsql> BEGIN;
-- 不指定ON COMMIT子句默认使用DROP DEFINITION
greatsql> CREATE PRIVATE TEMPORARY TABLE ora$ptt_t0(
id INT,
c1 VARCHAR(30)
);

greatsql> CREATE PRIVATE TEMPORARY TABLE ora$ptt_t1(
id INT,
c1 VARCHAR(30)
) ON COMMIT DROP DEFINITION;

-- 写入数据
greatsql> INSERT INTO ora$ptt_t0 VALUES (10, 'ora$ptt_t0-10');
greatsql> INSERT INTO ora$ptt_t0 VALUES (20, 'ora$ptt_t0-20');
greatsql> INSERT INTO ora$ptt_t1 VALUES (100, 'ora$ptt_t1-100');
greatsql> INSERT INTO ora$ptt_t1 VALUES (200, 'ora$ptt_t1-200');

-- 查看表DDL
greatsql> SHOW CREATE TABLE ora$ptt_t0\G
*************************** 1. row ***************************
       Table: ora$ptt_t0
Create Table: CREATE PRIVATE TEMPORARY TABLE "ora$ptt_t0" (
  "id" int DEFAULT NULL,
  "c1" varchar(30) DEFAULT NULL
) ON COMMIT DROP DEFINITION ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

greatsql> SHOW CREATE TABLE ora$ptt_t1\G
*************************** 1. row ***************************
       Table: ora$ptt_t1
Create Table: CREATE PRIVATE TEMPORARY TABLE "ora$ptt_t1" (
  "id" int DEFAULT NULL,
  "c1" varchar(30) DEFAULT NULL
) ON COMMIT DROP DEFINITION ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

-- 查询数据
greatsql> SELECT * FROM ora$ptt_t1;
+------+----------------+
| id   | c1             |
+------+----------------+
|  100 | ora$ptt_t1-100 |
|  200 | ora$ptt_t1-200 |
+------+----------------+
2 rows in set (0.00 sec)

-- 提交事务
greatsql> COMMIT;

-- 查询数据
greatsql> SELECT * FROM ora$ptt_s1;
+------+--------------+
| id   | c1           |
+------+--------------+
|    1 | ora$ptt_s1-1 |
|    2 | ora$ptt_s1-2 |
+------+--------------+
2 rows in set (0.00 sec)

-- 事务提交后，PRIVATE TEMPORARY TABLE会被删除
greatql> SELECT * FROM ora$ptt_t0;
ERROR 1146 (42S02): Table 'greatsql.ora$ptt_t0' doesn't exist

greatsql> SELECT * FROM ora$ptt_t1;
ERROR 1146 (42S02): Table 'greatsql.ora$ptt_t1' doesn't exist

-- 显式指定PRIMARY KEY，或者当sql_generate_invisible_primary_key=1时会报告不支持
greatsql> CREATE PRIVATE TEMPORARY TABLE ora$ptt_t1(
id INT,
c1 VARCHAR(30),
PRIMARY KEY(id));
ERROR 7561 (HY000): unsupported feature with temporary table

greatsql> SET sql_generate_invisible_primary_key = 1;
greatsql> CREATE PRIVATE TEMPORARY TABLE ora$ptt_t1(
id INT,
c1 VARCHAR(30));
ERROR 7561 (HY000): unsupported feature with temporary table
```


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](/greatsql-wx.jpg)
