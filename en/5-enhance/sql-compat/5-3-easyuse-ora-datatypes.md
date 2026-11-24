# Oracle Compatibility - Data Type
---


In addition to native data types, GreatSQL also supports Oracle-compatible data types including CLOB, VARCHAR2, NUMBER, PLS_INTEGER, etc.

In GreatSQL, data type compatibility is implemented through mapping, which belongs to the **extended compatibility (no need to set `sql_mode`)** scheme. The specific implementation is simple aliases: keywords are replaced during the parsing phase. For example, if a table is created with CLOB, it is converted to LONGTEXT internally.

The specific mapping implemented includes:

| Oracle type | GreatSQL type | Compatibility level |
| ----------- | --------- | ---- |
| CLOB        | LONGTEXT  | simple alias |
| NUMBER      | DECIMAL   | simple alias |
| VARCHAR2    | VARCHAR   | simple alias |
| PLS_INTEGER | INT       | simple alias |

## 1. CLOB
`CLOB` is a synonym for `LONGTEXT` and can be used directly.

Example:
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
`VARCHAR2` is a synonym for `VARCHAR` and can be used directly.

Example:
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

`PLS_INTEGER` is an alias of the `INT` type and can be used directly.

Example:
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

It can be seen that, like the `INT` type, `PLS_INTEGER` also supports the `AUTO_INCREMENT` attribute.

## 4. NUMBER
#### 4.1 Syntax
The `NUMBER` type is a synonym for `decimal` and can be used directly.

- 1. `NUMBER(P,D)`: specifies precision and scale
  - P is the precision, representing the number of significant digits. P ranges from 1 to 65.
  - D is the scale, representing the number of digits after the decimal point. D ranges from 0 to 30. D is less than or equal to (<=) P.

- 2. `NUMBER`: without specifying precision and scale, P defaults to the maximum length 65 and D defaults to the maximum length 30.

- 3. `NUMBER(*,D)`: when precision is not specified, P defaults to 38.

#### 4.2 Definition and Usage

The GreatSQL native type `DECIMAL`, without specifying precision and scale, defaults to a maximum length of 10, while `NUMBER` defaults to a maximum length of 65 and a maximum scale of 30.

#### 4.3 Oracle Compatibility Notes

- In Oracle, the precision P range of the `NUMBER` type is [1, 38] and the scale D range is [-84, 127]; in GreatSQL, the ranges of P and D are [1, 38] and [0, 30] respectively, and D cannot be greater than P.
- In Oracle, when using `NUMBER` type data, the trailing "0" in the fractional part is automatically removed; in GreatSQL, in `DEFAULT` mode the trailing "0" in the fractional part is retained, while in `ORACLE` mode the trailing "0" in the fractional part is automatically removed only when the return value type is `NUMBER`/`DECIMAL`.

| Input                                            | Oracle return | GreatSQL return (in ORACLE mode) |
| ----------------------------------------------- | ---------- | -----------  |
| CAST(123 AS NUMBER(6,3))                        | 123        | 123          |
| CAST(CAST(123 AS NUMBER(6,3)) AS VARCHAR(1024)) | 123        | 123.000      |

#### 4.4 Examples
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

-- Note the difference from ORACLE mode
greatsql> SET sql_mode = DEFAULT;

greatsql> SELECT * FROM t_number;
+----+-------------------------------------+---------+----------+
| id | c1                                  | c2      | c3       |
+----+-------------------------------------+---------+----------+
|  1 | 3306.330600000000000000000000000000 | 336.336 | 3306.331 |
+----+-------------------------------------+---------+----------+
```




**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
