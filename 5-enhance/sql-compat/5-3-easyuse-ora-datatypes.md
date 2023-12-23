# Oracle兼容-数据类型
---


在GreatSQL中，除了原生的数据类型外，还支持包括CLOB、VARCHAR2、NUMBER、PLS_INTEGER等Oracle兼容数据类型。

在GreatSQL中，采用映射方式实现数据类型兼容，这属于 **扩展兼容（无需设定 `sql_mode`）** 方案。具体实现方式为：简单别名，即：在解析阶段将关键词进行替换。例如：如果使用CLOB创建的表，
在系统内会被转换成LONGTEXT。

具体实现的映射包括：

| Oracle类型    | GreatSQL类型 | 兼容程度 |
| ----------- | --------- | ---- |
| CLOB        | LONGTEXT  | 简单别名 |
| NUMBER      | DECIMAL   | 简单别名 |
| VARCHAR2    | VARCHAR   | 简单别名 |
| PLS_INTEGER | INT       | 简单别名 |

## 1. CLOB
`CLOB` 是 `LONGTEXT` 的同义词，直接使用即可。

示例：
```
greatsql> CREATE TABLE t_clob(
id INT UNSIGNED NOT NULL AUTO_INCREMENT,
c1 CLOB NOT NULL,
PRIMARY KEY(id)
);

greatsql> SHOW CREATE TABLE t_clob\G
*************************** 1. row ***************************
       Table: t_clob
Create Table: CREATE TABLE `t_clob` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `c1` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## 2. VARCHAR2
`VARCHAR2` 是 `VARCHAR` 的同义词，直接使用即可。

示例：
```
greatsql> CREATE TABLE t_varchar2(
id INT UNSIGNED NOT NULL AUTO_INCREMENT,
c1 VARCHAR2(30) NOT NULL DEFAULT '',
PRIMARY KEY(id)
);

greatsql> SHOW CREATE TABLE t_varchar2\G
*************************** 1. row ***************************
Create Table: CREATE TABLE `t_varchar2` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `c1` varchar(30) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

## 3. PLS_INTEGER

`PLS_INTEGER` 是 `INT` 类型的别名，直接用即可。

示例：
```
greatsql> CREATE TABLE t_pls_integer(
id PLS_INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
c1 PLS_INTEGER unsigned NOT NULL DEFAULT 0,
PRIMARY KEY(id)
);

greatsql> SHOW CREATE TABLE t_pls_integer\G
*************************** 1. row ***************************
       Table: t_pls_integer
Create Table: CREATE TABLE `t_pls_integer` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `c1` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

可以看到，`PLS_INTEGER` 和 `INT` 类型一样，也支持设置 `AUTO_INCREMENT` 特性。

## 4. NUMBER
#### 4.1 语法
`NUMBER` 类型是 `decimal` 的同义词，直接使用即可。

- 1. `NUMBER(P,D)`：指定精度和小数位
  - P是表示有效数字数的精度。 P范围为1〜65。
  - D是表示小数点后的位数。 D的范围是0~30。D小于或等于(<=)P。

- 2. `NUMBER`：不指定有效数字精度和小数位数，此时P默认为最大长度65，D默认为最大长度30。

- 3. `NUMBER(*,D)`：不指定有效数字精度时P默认长度为38。

#### 4.2 定义和用法

GreatSQL原生类型 `DECIMAL` 不指定有效数字精度和小数时默认最大长度为10，而 `NUMBER` 默认最大长度为65，小数位最大长度为30。

#### 4.3 Oracle兼容说明

- 在ORACLE中的 `NUMBRE` 类型精度 P 范围为 [1, 38]，小数位数 D 范围为 [-84, 127]；在GreatSQL 中 P 和 D 的范围分别为 [1, 38] 和 [0, 30]，且 D 不能大于 P。
- 在ORACLE中使用 `NUMBER` 类型数据时会自动去除小数部分最后的 "0"，而GreatSQL中在 `DEFAULT` 模式下会保留小数部分的后缀 "0"，在 `ORACLE` 模式下只有返回值类型为 `NUMBER`/`DECIMAL` 时会自动去除小数部分的后缀 "0"。

| 输入                                            | Oracle返回 | GreatSQL返回（ORACLEM模式下） |
| ----------------------------------------------- | ---------- | -----------  |
| CAST(123 AS NUMBER(6,3))                        | 123        | 123          |
| CAST(CAST(123 AS NUMBER(6,3)) AS VARCHAR(1024)) | 123        | 123.000      |

#### 4.4 示例
```sql
greatsql> SET sql_mode = ORACLE;

greatsql> CREATE TABLE t_number(
id INT UNSIGNED NOT NULL AUTO_INCREMENT,
c1 NUMBER UNSIGNED NOT NULL,
c2 NUMBER(6,3) UNSIGNED NOT NULL,
c3 NUMBER(*,3) UNSIGNED NOT NULL,
PRIMARY KEY(id)
);

greatsql> SHOW CREATE TABLE t_number\G
*************************** 1. row ***************************
       Table: t_number
Create Table: CREATE TABLE "t_number" (
  "id" int unsigned NOT NULL AUTO_INCREMENT,
  "c1" decimal(65,30) unsigned NOT NULL,
  "c2" decimal(6,3) unsigned NOT NULL,
  "c3" decimal(38,3) unsigned NOT NULL,
  PRIMARY KEY ("id")
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

greatsql> INSERT INTO t_number SELECT 0, 3306.3306, 3306.3306, 3306.3306;
ERROR 1264 (22003): Out of range value for column 'c2' at row 1

greatsql> INSERT INTO t_number SELECT 0, 3306.3306, 336.336, 3306.3306;
Query OK, 1 row affected, 1 warning (0.00 sec)
Records: 1  Duplicates: 0  Warnings: 1

greatsql> SHOW WARNINGS;
+-------+------+-----------------------------------------+
| Level | Code | Message                                 |
+-------+------+-----------------------------------------+
| Note  | 1265 | Data truncated for column 'c3' at row 1 |
+-------+------+-----------------------------------------+

greatsql> SELECT * FROM t_number;
+----+-----------+---------+----------+
| id | c1        | c2      | c3       |
+----+-----------+---------+----------+
|  1 | 3306.3306 | 336.336 | 3306.331 |
+----+-----------+---------+----------+

-- 注意和ORACLE模式下的不同
greatsql> SET sql_mode = DEFAULT;

greatsql> SELECT * FROM t_number;
+----+-------------------------------------+---------+----------+
| id | c1                                  | c2      | c3       |
+----+-------------------------------------+---------+----------+
|  1 | 3306.330600000000000000000000000000 | 336.336 | 3306.331 |
+----+-------------------------------------+---------+----------+
```



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../../greatsql-wx.jpg)
