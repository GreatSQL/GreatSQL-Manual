# Oracle兼容-存储过程-TYPE IS RECORD
---
[toc]

## 1. 语法

```sql
1.
SET sql_mode = ORACLE;
TYPE var IS RECORD(columns type [default value]...)

2.
SET sql_mode = ORACLE;
var var_def
```

## 2. 定义和用法

在GreatSQL中支持用 `TYPE IS RECORD()` 方式来自定义数据类型，同时也支持用 `var var_def` 方式自定义数据类型。

## 3. Oracle兼容说明

在GreatSQL中支持用 `TYPE IS RECORD()` 方式来自定义数据类型，同时也支持用 `var var_def` 方式自定义数据类型。该用法如下所述：

1. 支持无限循环嵌套，支持定义时设置默认值，也支持 `RECORD` 和 `TABLE` 混用，比如 `a.b(1).c`。

1. 支持自定义类型时 `DEFAULT` 属性采用表达式，并进行赋值。

1. 支持 `UDT` 类型，包括 `CREATE TYPE AS OBJECT` 和 `CREATE TYPE IS TABLE` 两种方式。支持给 `RECORD` 里的成员变量赋初始值，除了 `RECORD TABLE`类型。

1. 如果在存储过程的定义中用到 `UDT` 类型，在调用存储过程时允许操作这个 `UDT` 类型，包括对其删除、修改等，操作完后再次调用存储过程会重新解析。

1. 支持无限循环嵌套的 `SELECT`、`SET` 赋值。

1. 支持用参数赋值的方法定义 `RECORD` 字段，例如`v1 VARCHAR(20) := v2`，详见下面示例2。如果该参数同为 `RECORD` 内的参数，则赋值失败。

1. 不支持单类型的数组定义，比如 `CREATE TYPE v1 AS VARRAY(10) OF VARCHAR2(80);`。

1. 不支持自定义类型时附加 `NOT NULL` 属性。

1. 不支持 `TABLE` 类型作为 `RECORD` 的类型使用。

1. 不支持 `RECORD%TYPE` 作为默认值，但支持自定义 `RECORD` 类型和 `UDT TABLE` 类型默认赋值。例如：`e stu_record := stu_record(2)`。

1. 不支持 `RECORD` 的成员字段定义为 `%TYPE` 类型。

1. 不支持使用保留关键字作为 `RECORD` 列名，比如 `NAME`、`ANY`、`BULK`、`TABLE` 等。

1. 在存储过程中的 `TYPE` 作为保留关键字，不能用作变量名。


TODO 有以下几点注意事项，直接用示例说明：
```sql
1. 
type stu_record is record(
 id INT := 1,
 name_d  t_air,
 score FLOAT := 0); 

 rec1 stu_record; 

这里rec1.name_d没有赋初始值，因此不能单独给rec1.name_d.id赋值，这个与oracle一致。name_d  t_air_varray与name_d t_air同理。


2. 
type tklist is table of stu_record index by binary_integer;
stu_record_val tklist;

stu_record_val不能赋值为null，这个与oracle一致。


3. 
record的名字与udt名字一致的情况下，在sp里面定义和赋值默认都为udt类型。比如：

type stu_record is record(
id INT := 1,
name_d  t_air,
score FLOAT := 0 );

rec1 t_air ：= t_air(1,'aa'); 这里t_air默认为udt类型而不是自定义的record类型。 
```


## 4. 示例


- 1. 示例1：type is record/type is table

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE record_sp1 AS
TYPE t1_record IS RECORD(
  id INT := 1,
  c1 VARCHAR(20),
  c2 FLOAT := 0
);
TYPE t1_list IS TABLE OF t1_record INDEX BY BINARY_INTEGER;
TYPE t1_record1 IS RECORD(
  v_i INT := 1,
  t1_record_val1 t1_list
);
t1_record_val t1_record1;
BEGIN
  t1_record_val.t1_record_val1(1).id := 1;
  t1_record_val.t1_record_val1(2).c1 := 'row1';
  t1_record_val.t1_record_val1(0).id := 2;
  t1_record_val.t1_record_val1(3).c2 := 3.22;

  SELECT t1_record_val.t1_record_val1(1).id,
    t1_record_val.t1_record_val1(1).c1,
    t1_record_val.t1_record_val1(0).id,
    t1_record_val.t1_record_val1(3).c2;

  SELECT t1_record_val.v_i;
END; //

greatsql> CALL record_sp1() //
+------------------------------------+------------------------------------+------------------------------------+------------------------------------+
| t1_record_val.t1_record_val1(1).id | t1_record_val.t1_record_val1(1).c1 | t1_record_val.t1_record_val1(0).id | t1_record_val.t1_record_val1(3).c2 |
+------------------------------------+------------------------------------+------------------------------------+------------------------------------+
|                                  1 | NULL                               |                                  2 |                               3.22 |
+------------------------------------+------------------------------------+------------------------------------+------------------------------------+
1 row in set (0.00 sec)

+-------------------+
| t1_record_val.v_i |
+-------------------+
|                 1 |
+-------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

更多用法请参考：ora_type_is_table.md

- 2. 示例2：TYPE IS RECORD default value

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE or replace PROCEDURE record_sp2() AS
  v1 VARCHAR(20) := 'v1_str';

  TYPE t1_record IS RECORD(
    v2 VARCHAR(20) := v1
  ); 

  t1_record1 t1_record;
BEGIN
  SELECT t1_record1.v2;
END; //

greatsql> CALL record_sp2() //
+---------------+
| t1_record1.v2 |
+---------------+
| v1_str        |
+---------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)


greatsql> CREATE or replace PROCEDURE record_sp2() AS
  v1 VARCHAR(20) := 'v1_str';

  TYPE t1_record IS RECORD(
    v2 VARCHAR(20) := nullptr
  ); 

  t1_record1 t1_record;
BEGIN
  SELECT t1_record1.v2;
END; //
ERROR 1054 (42S22): Unknown column 'nullptr' in 'field list'



greatsql> CREATE or replace PROCEDURE record_sp1() AS
  TYPE t1_record IS RECORD(
    id INT := 1,
    v1 VARCHAR(20) := 'v1_str'
  );

  TYPE t1_list IS TABLE OF t1_record INDEX BY BINARY_INTEGER;
  v1 t1_list;
BEGIN
  v1(1).id := 100;

  SELECT v1(1).id, v1(1).v1;
END; //

greatsql> CALL record_sp1() //
+----------+----------+
| v1(1).id | v1(1).v1 |
+----------+----------+
|      100 | v1_str   |
+----------+----------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 3. 示例3：TYPE is udt TYPE and set default value

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 VARCHAR(20));
greatsql> CREATE OR REPLACE TYPE udt_t1 AS TABLE OF udt1;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE record_sp1 AS
TYPE t0_record IS RECORD(
  id INT := 1,
  c1 udt_t1,
  c2 FLOAT := 0
);
TYPE t1_record IS RECORD(
  v_i INT := 1,
  t1_record_val1 t0_record := t0_record(3, udt_t1(udt1(3, 'c1_row3')), 1.1)
);
t1_record_val t1_record;

BEGIN
  SELECT t1_record_val.t1_record_val1.c1(1).id, t1_record_val.t1_record_val1.c1(1).c1;

  t1_record_val.t1_record_val1.c1(1).c1 := 'c1_row30';

  SELECT t1_record_val.t1_record_val1.c1(1).c1;
END; //

greatsql> CALL record_sp1() //
+---------------------------------------+---------------------------------------+
| t1_record_val.t1_record_val1.c1(1).id | t1_record_val.t1_record_val1.c1(1).c1 |
+---------------------------------------+---------------------------------------+
|                                     3 | c1_row3                               |
+---------------------------------------+---------------------------------------+
1 row in set (0.00 sec)

+---------------------------------------+
| t1_record_val.t1_record_val1.c1(1).c1 |
+---------------------------------------+
| c1_row30                              |
+---------------------------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 4. 示例4：TYPE IS RECORD TYPE and set default value

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';

greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE record_sp4 AS
TYPE t0_record IS RECORD(
  id INT := 1,
  c1 VARCHAR(20),
  c2 FLOAT := 0
);

TYPE t1_record IS RECORD(
  id INT := 1,
  c1 t0_record,
  c2 FLOAT := 0
);

TYPE t1_record1 IS RECORD(
  v_i INT := 1,
  t1_record_val1 t1_record := t1_record(10, t0_record(10, 'c1_row10', 11), 1.1)
);

t1_record_val t1_record1;

BEGIN
  SELECT t1_record_val.t1_record_val1.id, t1_record_val.t1_record_val1.c1, t1_record_val.t1_record_val1.c2;

  SELECT t1_record_val.t1_record_val1.c1.id, t1_record_val.t1_record_val1.c1.c1, t1_record_val.t1_record_val1.c1.c2;
END; //

greatsql> CALL record_sp4() //
+---------------------------------+---------------------------------+---------------------------------+
| t1_record_val.t1_record_val1.id | t1_record_val.t1_record_val1.c1 | t1_record_val.t1_record_val1.c2 |
+---------------------------------+---------------------------------+---------------------------------+
|                              10 | id:10 | c1:c1_row10 | c2:11     |                             1.1 |
+---------------------------------+---------------------------------+---------------------------------+
1 row in set (0.00 sec)

+------------------------------------+------------------------------------+------------------------------------+
| t1_record_val.t1_record_val1.c1.id | t1_record_val.t1_record_val1.c1.c1 | t1_record_val.t1_record_val1.c1.c2 |
+------------------------------------+------------------------------------+------------------------------------+
|                                 10 | c1_row10                           |                                 11 |
+------------------------------------+------------------------------------+------------------------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 5. 示例5：TYPE is udt table TYPE and set default value

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 VARCHAR(20));
greatsql> CREATE OR REPLACE TYPE udt_t1 AS TABLE OF udt1;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE record_sp5() AS
  rec1 udt_t1 := udt_t1(udt1(1, 'c1_row1'), udt1(2, 'c1_row2'));
BEGIN
  rec1(1).id := 10;
  rec1(1).c1 := 'c1_row10';

  FOR i IN rec1.FIRST .. rec1.LAST LOOP
    SELECT rec1(i).id, rec1(i).c1;
  END LOOP;
END; //

greatsql> CALL record_sp5() //
+------------+------------+
| rec1(i).id | rec1(i).c1 |
+------------+------------+
|         10 | c1_row10   |
+------------+------------+
1 row in set (0.00 sec)

+------------+------------+
| rec1(i).id | rec1(i).c1 |
+------------+------------+
|          2 | c1_row2    |
+------------+------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```


更多关联用法：
- [BULK COLLECT](5-3-easyuse-ora-sp-bulk-collect.md)
- [FORALL LOOP](5-3-easyuse-ora-sp-forall-loop.md)
- [TYPE IS TABLE]()


**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
