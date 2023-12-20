# Oracle兼容-存储过程-TYPE IS TABLE
---


## 1. 语法

```sql
1. TYPE type IS 
   { assoc_array_type_def
   | nested_table_type_def
   } ;
   
assoc_array_type_def：
    TABLE OF datatype
    INDEX BY { PLS_INTEGER | BINARY_INTEGER | VARCHAR ( v_size )}
    
nested_table_type_def：
    TABLE OF datatype
    
datatype:
     { record_type
     | rowtype_attribute
     | type_attribute
     }
rowtype_attribute: db_table_or_view %ROWTYPE

2. var var_def

3. collection.{ COUNT
           | FIRST
           | LAST
           }
4. var(row) := record_value

5. record_value := var(row)

6. var(row) := var1(row)

7. SELECT var(row)

8. SELECT var(row) INTO var

9. TYPE(row => RECORD(value_list) , row => ..)
```

## 2. 定义和用法

在GreatSQL中支持用 `TYPE IS TABLE` 方式来自定义数据类型，支持以下几种用法：

- 1. 用 `TYPE IS TABLE OF` 自定义 `TABLE` 类型。

- 2. 用 `var var_def` 进行该自定义类型参数的定义。

- 3. 用 `var.COUNT` 获取自定义 `TABLE` 表的行数。

- 4. 用 `var(roW) := record_value` 给自定义 `TABLE` 某一行赋值。

- 5. 用 `record_value := var(row)` 从自定义 `TABLE` 某一行给 `RECORD` 类型参数赋值。

- 6. 用 `var(row) := var1(row)` 从自定义 `TABLE` 某一行给另一个自定义 `TABLE` 某一行赋值。

- 7. 用 `SELECT var(row)` 查询 `TABLE` 某一行。

- 8. 用 `SELECT var(row) INTO VAR` 从自定义 `TABLE` 某一行给 `RECORD` 类型参数赋值。

- 9. 用 `RECORD TABLE` 带 `INDEX BY ..` 的类型允许用 `=>` 方式赋默认值。


## 3. Oracle兼容说明

在GreatSQL中支持用 `TYPE IS TABLE` 方式来自定义数据类型，该用法如下所述：

1. 在 `TYPE IS TABLE OF .. INDEX BY BINARY_INTEGER` 定义中支持自增长形式的整数型，不支持如手动指定方式的整数型用法。

2. 支持无限循环嵌套表，支持用 `RECORD` 类型数据赋默认值，也支持 `RECORD` 和 `TABLE` 两种类型混用，比如 `a.b(1).c`。

3. 支持用 `%ROWTYPE` 方式定义 `TABLE` 类型，比如 `TYPE udt_type IS TABLE OF udt_table%ROWTYPE`。

4. 支持无限循环嵌套表的 `SELECT` 或 `SET` 赋值。

5. 支持用 `NO_DATA_FOUND` 判断无法查找到数据的 `EXCEPTION` 状态。详见下方示例3。

6. 支持不同行和列的 `RECORD TABLE` 赋值。赋值后 `TABLE` 行数与源 `RECORD TABLE` 一致。并支持 `RECORD TABLE` 类型赋默认值。如果该 `RECORD TABLE` 是 `INDEX BY` 的，那么赋默认值时候必须要同时加上行数，比如 `v1 record_table := record_table(1, udt_table(1 => udt_type(1, 'row1')))`，这里的 `1=>` 表示第1行。如果该 `RECORD TABLE` 不是 `INDEX BY`的，那么赋默认值时候就不能加上行号标记。

7. 不支持单类型的数组定义，比如 `CREATE TYPE v_list_attrs AS VARRAY(10) OF VARCHAR2(80)`。

8. 不支持 `TABLE` 类型作为 `RECORD` 类型使用，不支持类似用法 `table_type employees%ROWTYPE`。

9. 在 `FOR i IN udt_table.FIRST .. udt_table.LAST LOOP` 循环中的 `i` 是整数型，因此 `udt_table` 的行号值不能是非整数型，否则无法正常赋值。如果该 `udt_table` 是空的，不会报错而是直接跳出循环，Oracle则会报错。`udt_table.FIRST` 是 `udt_table` 行号的最小值，`udt_table.LAST` 是行号的最大值。

10. 当指定 `INDEX BY BINARY_INTEGER` 属性时，则不支持非数字的字符类型行号标记用法，例如 `TABLE('a')`，但支持数值型的字符类型行号，比如 `TABLE('1') / TABLE('-1')`。指定 `INDEX BY VARCHAR` 属性时，允许行号参数为字符类型，例如 `TABLE('a')`。此外，指定 `INDEX BY VARCHAR` 时行号会按ASCII码排序，而 `INDEX BY BINARY_INTEGER` 则会按照整数型排序。

11. 在 `SELECT var(row)` 中，如果 `var(row)` 里有自定义类型数据，将返回 `NULL`。详见下方示例10。

12. 在 `SELECT var.COUNT` 中，如果变量名 `var` 与 `TABLE` 名重复，会优先被解析为 `RECORD TABLE` 名，所以 `var.COUNT` 会返回 `TABLE` 的行数。

13. 当 `TYPE IS TABLE OF` 后面不带 `INDEX BY` 时，这个自定义数据类型必须要初始化才能使用。初始化时定义最大行数后就不能再发生变化，后面只支持 `UPDATE` 操作而不支持 `INSERT` 操作。例外情况是在 `SELECT BULK COLLECT INTO var` 时，可以不需要初始化就能直接使用，因为 `BULK COLLECT` 操作会进行初始化和插入数据操作。暂不支持Oracle中用 `EXTEND()` 函数来扩容 `TABLE` 类型。

14. 在 `TYPE IS TABLE OF INDEX BY VARCHAR(v_size)` 定义中，Oracle里参数 `v_size` 的范围是 [1, 32676]，GreatSQL中支持的范围是 [1, 16383]，二者不同。

15. 不支持使用保留关键字作为 `TABLE` 列名，比如 `NAME`、`ANY`、`BULK`、`TABLE` 等。

16. 在存储过程中的 `TYPE` 作为保留关键字，不能用作变量名。



## 4. 示例


- 1. 示例1：`TYPE IS RECORD/TYPE IS TABLE`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp1 AS
TYPE t1_record IS RECORD(
  id INT := 1,
  c1 VARCHAR(20),
  c2 FLOAT := 33.06
);

TYPE t1_list IS TABLE OF t1_record INDEX BY BINARY_INTEGER;

TYPE t2_record IS RECORD(
  v_i INT := 1,
  t1_record_v1 t1_list
);
t1_record_val t2_record;

BEGIN
  t1_record_val.t1_record_v1(1).id := 1;
  t1_record_val.t1_record_v1(2).c1 := 'row1';
  t1_record_val.t1_record_v1(0).id := 2;
  t1_record_val.t1_record_v1(3).c2 := 3.306;

  SELECT t1_record_val.t1_record_v1(1).id,
    t1_record_val.t1_record_v1(1).c1,
    t1_record_val.t1_record_v1(0).id,
    t1_record_val.t1_record_v1(3).c2;

  SELECT t1_record_val.v_i;
END; //

greatsql> CALL record_sp1() //
+----------------------------------+----------------------------------+----------------------------------+----------------------------------+
| t1_record_val.t1_record_v1(1).id | t1_record_val.t1_record_v1(1).c1 | t1_record_val.t1_record_v1(0).id | t1_record_val.t1_record_v1(3).c2 |
+----------------------------------+----------------------------------+----------------------------------+----------------------------------+
|                                1 | NULL                             |                                2 |                            3.306 |
+----------------------------------+----------------------------------+----------------------------------+----------------------------------+
1 row in set (0.00 sec)

+-------------------+
| t1_record_val.v_i |
+-------------------+
|                 1 |
+-------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 2. 示例2：`TYPE IS TABLE OF %ROWTYPE`

```sql
greatsql> SET sql_mode = ORACLE;

greatsql> CREATE TABLE t1(a INT, b CHAR(50));
greatsql> INSERT INTO t1 VALUES(1, 'row1'), (2, 'row2');

greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp2() AS
  TYPE udt_t1 IS TABLE OF t1%ROWTYPE INDEX BY BINARY_INTEGER;
  udt_t2 udt_t1;
BEGIN
  SELECT * BULK COLLECT INTO udt_t2 FROM t1;

  FOR i IN udt_t2.FIRST .. udt_t2.LAST LOOP
    SELECT udt_t2(i).a, udt_t2(i).b;
  END LOOP;
END; //

greatsql> CALL table_sp2() //
+-------------+-------------+
| udt_t2(i).a | udt_t2(i).b |
+-------------+-------------+
|           1 | row1        |
+-------------+-------------+
1 row in set (0.00 sec)

+-------------+-------------+
| udt_t2(i).a | udt_t2(i).b |
+-------------+-------------+
|           2 | row2        |
+-------------+-------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 3. 示例3：`EXCEPTION WHEN NO_DATA_FOUND`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp3() AS
 TYPE t1_record IS RECORD(
    id INT := 1
  );

  TYPE t1_table IS TABLE OF t1_record INDEX BY BINARY_INTEGER;  
  v1 t1_table;
BEGIN
  v1(0).id := 3306;
  SELECT v1(0).id;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN SELECT 'The row does not exist!' AS ret;
END; //

greatsql> CALL table_sp3() //
+----------+
| v1(0).id |
+----------+
|     3306 |
+----------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 4. 示例4：对 `RECORD / TABLE` 类型数据赋值

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp4() AS
TYPE t1_record IS RECORD(
  id INT := 1,
  c1  VARCHAR(20) := 'row1',
  c2 FLOAT := 33.06
);

TYPE t1_list IS TABLE OF t1_record INDEX BY BINARY_INTEGER;

t_record_v1 t1_list;
t_record_v2 t1_list;

BEGIN
 t_record_v1(0).id := 2;
 t_record_v1(0).c2 := 3.306;
 t_record_v2(10).id := 20;

 t_record_v2 := t_record_v1;

 SELECT t_record_v1(0).id, t_record_v1(0).c1, t_record_v1(0).c2;

 SELECT t_record_v2(0).id, t_record_v2(0).c1, t_record_v2(0).c2;
END; //

greatsql> CALL table_sp4() //
+--------------------+--------------------+--------------------+
|  t_record_v1(0).id |  t_record_v1(0).c1 |  t_record_v1(0).c2 |
+--------------------+--------------------+--------------------+
|                  2 | row1               |              3.306 |
+--------------------+--------------------+--------------------+
1 row in set (0.00 sec)

+--------------------+--------------------+--------------------+
|  t_record_v2(0).id |  t_record_v2(0).c1 |  t_record_v2(0).c2 |
+--------------------+--------------------+--------------------+
|                  2 | row1               |              3.306 |
+--------------------+--------------------+--------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 5. 示例5：`table.COUNT`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp5() AS
TYPE t1_list IS TABLE OF VARCHAR(20) INDEX BY BINARY_INTEGER;
t_record_v1 t1_list;
id INT := 1;

BEGIN
 t_record_v1(id) := 1;
 t_record_v1(3) := 1;

 SELECT t_record_v1(id), t_record_v1(3);

 SELECT t_record_v1.COUNT;
END; //

greatsql> CALL table_sp5() //
+------------------+-----------------+
|  t_record_v1(id) |  t_record_v1(3) |
+------------------+-----------------+
| 1                | 1               |
+------------------+-----------------+
1 row in set (0.00 sec)

+--------------------+
| t_record_v1.COUNT |
+--------------------+
|                  2 |
+--------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 6. 示例6： `TYPE IS TABLE OF TYPE INDEX BY VARCHAR`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp6() AS
TYPE t1_list IS TABLE OF VARCHAR(20) INDEX BY VARCHAR(20);
t_record_v1 t1_list;
id VARCHAR(20) := 'row1';

BEGIN
 t_record_v1(id) := 10;
 t_record_v1(1) := 1;

 SELECT t_record_v1(id), t_record_v1(1);
 SELECT t_record_v1.COUNT;
END; //

greatsql> CALL table_sp6() //
+------------------+-----------------+
|  t_record_v1(id) |  t_record_v1(1) |
+------------------+-----------------+
| 10               | 1               |
+------------------+-----------------+
1 row in set (0.00 sec)

+--------------------+
|  t_record_v1.COUNT |
+--------------------+
|                  2 |
+--------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

```

- 7. 示例7： `TYPE IS TABLE OF RECORD INDEX BY VARCHAR`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 VARCHAR(20));
greatsql> CREATE TABLE udt_t1(id INT, c2 udt1);

greatsql> INSERT INTO udt_t1 VALUES(1, udt1(10, 'c2_row10'));
greatsql> INSERT INTO udt_t1 VALUES(2, udt1(20, 'c2_row20'));

greatsql> CREATE OR REPLACE PROCEDURE table_sp7() AS
  TYPE udt_t2 IS TABLE OF udt_t1%ROWTYPE index by INT;
  udt_t3 udt_t2;
BEGIN
  SELECT * BULK COLLECT INTO udt_t3 FROM udt_t1;

  FOR i IN 1 .. udt_t3.COUNT LOOP
    SELECT udt_t3(i).id, udt_t3(i).c2;
  END LOOP;
END; //

greatsql> CALL table_sp7() //
+--------------+---------------------+
| udt_t3(i).id | udt_t3(i).c2        |
+--------------+---------------------+
|            1 | id:10 | c1:c2_row10 |
+--------------+---------------------+
1 row in set (0.01 sec)

+--------------+---------------------+
| udt_t3(i).id | udt_t3(i).c2        |
+--------------+---------------------+
|            2 | id:20 | c1:c2_row20 |
+--------------+---------------------+
1 row in set (0.01 sec)

Query OK, 0 rows affected (0.01 sec)
```

- 8. 示例8：`var(row) := record_value`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp8() AS
TYPE t1_list IS TABLE OF VARCHAR(20) INDEX BY VARCHAR2(30);
v_array t1_list;

TYPE t1_record IS RECORD(
  c1 VARCHAR(20) := 'c1_row1',
  c2 VARCHAR(20) := 'c2_row1'
);

TYPE t2_list IS TABLE OF t1_record INDEX BY pls_integer;
t3_list t2_list;

v_c1 VARCHAR(10) := 'b';

BEGIN
 t3_list(1) := t1_record(v_c1, 'c2_row1');
 t3_list(2) := t1_record('b', 'c2_row2');

 FOR i IN 1 .. t3_list.COUNT LOOP
   v_array(t3_list(i).c1) := t3_list(i).c2;

   SELECT v_array(t3_list(i).c1);
 END LOOP;
END; //

greatsql> CALL table_sp8() //
+------------------------+
| v_array(t3_list(i).c1) |
+------------------------+
| c2_row1                |
+------------------------+
1 row in set (0.00 sec)

+------------------------+
| v_array(t3_list(i).c1) |
+------------------------+
| c2_row2                |
+------------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 9. 示例9： `record_value := var(row)`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp9() AS
  TYPE t1_record IS RECORD(
    id INT := 1,
    c1  VARCHAR(20) := 'row1',
    c2 FLOAT := 33.06
  );

  TYPE t1_list IS TABLE OF t1_record INDEX BY BINARY_INTEGER;
  t_record_v1 t1_list;
  t_record_v2 t1_record;

BEGIN
  t_record_v1(1).id := 10;
  t_record_v1(2).id := 20;
  t_record_v2 := t_record_v1(2);
  
  SELECT t_record_v1(1), t_record_v2;
  
  SELECT t_record_v1.COUNT;
  
  t_record_v1(2).id := 30;
  SELECT t_record_v1(2), t_record_v1(1);
END; //

greatsql> CALL table_sp9() //
+----------------------------+----------------------------+
|  t_record_v1(1)            |  t_record_v2               |
+----------------------------+----------------------------+
| id:10 | c1:row1 | c2:33.06 | id:20 | c1:row1 | c2:33.06 |
+----------------------------+----------------------------+
1 row in set (0.00 sec)

+--------------------+
| t_record_v1.COUNT |
+--------------------+
|                  2 |
+--------------------+
1 row in set (0.00 sec)

+----------------------------+----------------------------+
|  t_record_v1(2)            |  t_record_v1(1)            |
+----------------------------+----------------------------+
| id:30 | c1:row1 | c2:33.06 | id:10 | c1:row1 | c2:33.06 |
+----------------------------+----------------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 10. 示例10： `SELECT var(row)`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp10() AS
  TYPE t1_record IS RECORD (
    a VARCHAR(30) := 'a',
    b VARCHAR(30) := 'b',
    c VARCHAR(30) := 'c'
  ); 

  TYPE t2_record IS RECORD (
    v_t1 t1_record,  
    d VARCHAR(30) := 'd'
  );

  TYPE t3 IS TABLE OF t2_record INDEX BY VARCHAR2(30);
  t4 t3;

  TYPE udt_t2 IS TABLE OF t1_record INDEX BY VARCHAR2(30);
  udt_t3 udt_t2;

BEGIN
  t4(1).d := 'e';
  SELECT t4(1), t4(1).v_t1;

  udt_t3(1) := t4(1).v_t1;
  SELECT udt_t3(1);
END; //

greatsql> CALL table_sp10() //
+-----------------+-----------------+
| t4(1)           | t4(1).v_t1      |
+-----------------+-----------------+
| v_t1:NULL | d:e | a:a | b:b | c:c |
+-----------------+-----------------+
1 row in set (0.00 sec)

+-----------------+
| udt_t3(1)       |
+-----------------+
| a:a | b:b | c:c |
+-----------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 11. 示例11：`var(row) := var1(row)`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp11() AS
TYPE t1_record IS RECORD(
  id INT := 1,
  c1 VARCHAR(20) := 'c1',
  c2 FLOAT := 33.06
);
TYPE t1_list IS TABLE OF t1_record INDEX BY BINARY_INTEGER;
t_record_v1 t1_list;
t_record_v2 t1_list;
BEGIN
 t_record_v1(1).id := 10;
 SELECT t_record_v1;

 t_record_v1(2).id := 20;
 t_record_v1(3).c1 := 'c1_30';
 t_record_v1(4) := t_record_v1(2);

 SELECT t_record_v1(1), t_record_v1(2), t_record_v1(3), t_record_v1(4), t_record_v1;

 SELECT t_record_v1.COUNT;

 t_record_v2(2) := t_record_v1(2);

 SELECT t_record_v2(2);

 SELECT t_record_v1(1).id, t_record_v1(2).id, t_record_v1(3).id, t_record_v1(4).id, t_record_v1;
END; //

greatsql> CALL table_sp11() //
+---------------------------------+
|  t_record_v1                    |
+---------------------------------+
| t1_list(t1_record(10,c1,33.06)) |
+---------------------------------+
1 row in set (0.00 sec)

+-------------------+-------------------+-------------------+-------------------+--------------------------------------------------------------------------------------------------------+
| t_record_v1(1).id | t_record_v1(2).id | t_record_v1(3).id | t_record_v1(4).id | t_record_v1
            |
+-------------------+-------------------+-------------------+-------------------+--------------------------------------------------------------------------------------------------------+
|                10 |                20 |                 1 |                20 | t1_list(t1_record(10,c1,33.06),t1_record(20,c1,33.06),t1_record(1,c1_30,33.06),t1_record(20,c1,33.06)) |
+-------------------+-------------------+-------------------+-------------------+--------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

+--------------------+
|  t_record_v1.COUNT |
+--------------------+
|                  4 |
+--------------------+
1 row in set (0.00 sec)

+--------------------------+
| t_record_v2(2)          |
+--------------------------+
| id:20 | c1:c1 | c2:33.06 |
+--------------------------+
1 row in set (0.00 sec)

+-------------------+-------------------+-------------------+-------------------+--------------------------------------------------------------------------------------------------------+
| t_record_v1(1).id | t_record_v1(2).id | t_record_v1(3).id | t_record_v1(4).id | t_record_v1                                                                                            |
+-------------------+-------------------+-------------------+-------------------+--------------------------------------------------------------------------------------------------------+
|                10 |                20 |                 1 |                20 | t1_list(t1_record(10,c1,33.06),t1_record(20,c1,33.06),t1_record(1,c1_30,33.06),t1_record(20,c1,33.06)) |
+-------------------+-------------------+-------------------+-------------------+--------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 12. 示例12： `SELECT var(row) INTO var`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp12() AS
TYPE t1_record IS RECORD(
  id INT := 1,
  c1 VARCHAR(20) := 'c1_1',
  c2 FLOAT := 33.06
);
TYPE t1_list IS TABLE OF t1_record INDEX BY BINARY_INTEGER;
t_record_v1 t1_list;
t_record_v2 t1_record;
BEGIN
 t_record_v1(2) := t1_record(10, 'c1_10', 43.06);

 SELECT t_record_v1(2) INTO t_record_v2;

 SELECT t_record_v2;
END; //

greatsql> CALL table_sp12() //
+-----------------------------+
|  t_record_v2                |
+-----------------------------+
| id:10 | c1:c1_10 | c2:43.06 |
+-----------------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 13. 示例13：`TYPE IS TABLE OF RECORD`中不含 `INDEX BY`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp13() AS
TYPE t1_record IS RECORD(
  id INT := 1,
  c1  VARCHAR(20) := 'c1_1',
  c2 FLOAT := 33.06
);
-- 这里可以不初始化，到后面再赋值进行初始化。
TYPE t1_list IS TABLE OF t1_record;

t_record_v1 t1_list := t1_list(t1_record(11, 'c1_11', 44.06), NULL);
t_record_v2 t1_record;

BEGIN
 -- 如果前面没有初始化，这里还可以进行赋值，如下所示
 -- t_record_v1 := t1_list(t1_record(11, 'c1_11', 44.06), NULL);

 t_record_v1(1).id := 10;
 t_record_v1(2).id := 20;
 t_record_v2 := t_record_v1(2);

 SELECT t_record_v1(1), t_record_v2;

 SELECT t_record_v1.COUNT;

 t_record_v1(2).id := 30;
 SELECT t_record_v1(2), t_record_v1(1);
END; //

greatsql> CALL table_sp13() //
+-----------------------------+---------------------------+
|  t_record_v1(1)             |  t_record_v2              |
+-----------------------------+---------------------------+
| id:10 | c1:c1_11 | c2:44.06 | id:20 | c1:NULL | c2:NULL |
+-----------------------------+---------------------------+
1 row in set (0.00 sec)

+--------------------+
|  t_record_v1.COUNT |
+--------------------+
|                  2 |
+--------------------+
1 row in set (0.00 sec)

+---------------------------+-----------------------------+
|  t_record_v1(2)           |  t_record_v1(1)             |
+---------------------------+-----------------------------+
| id:30 | c1:NULL | c2:NULL | id:10 | c1:c1_11 | c2:44.06 |
+---------------------------+-----------------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 14. 示例14： `TYPE IS TABLE OF RECORD` 包含 `INDEX BY` 以及默认值

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE table_sp14 AS
TYPE t1_record IS RECORD(
  id INT := 1,
  c1 VARCHAR(20),
  c2 FLOAT := 33.06
);
TYPE t1_list IS TABLE OF t1_record INDEX BY BINARY_INTEGER;

TYPE t2_record IS RECORD(
  id INT := 1,
  c1 t1_list,
  c2 FLOAT := 33.06
);

TYPE t3_record IS RECORD(
  v_i INT := 1,
  t_record_v1 t2_record := t2_record(10, t1_list(1=>t1_record(1, 'c1_row1', 34.06)), 43.06)
);
t_record_v2 t3_record;

BEGIN
 SELECT t_record_v2.t_record_v1.c1(1).c1;
END; //

greatsql> CALL table_sp14() //
+----------------------------------+
| t_record_v2.t_record_v1.c1(1).c1 |
+----------------------------------+
| c1_row1                          |
+----------------------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 15. 示例15： `table.FIRST / table.LAST`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(id INT, c1 VARCHAR(20));
greatsql> CREATE TABLE udt_t1(id INT, c2 udt1);

greatsql> CREATE OR REPLACE PROCEDURE table_sp15() AS
  TYPE udt_t2 IS TABLE OF udt_t1%ROWTYPE INDEX BY BINARY_INTEGER;
  udt_t3 udt_t2 := udt_t2(1=>NULL, -1=>NULL);
BEGIN
  udt_t3(0).id := 10;
  udt_t3(1).id := 20;
  FOR i IN REVERSE udt_t3.FIRST .. udt_t3.LAST LOOP
    SELECT i, udt_t3.FIRST, udt_t3.LAST, udt_t3(i);
  END LOOP;
END; //

greatsql> CALL table_sp15() //
+------+--------------+-------------+-----------------+
| i    | udt_t3.FIRST | udt_t3.LAST | udt_t3(i)       |
+------+--------------+-------------+-----------------+
|    1 | -1           | 1           | id:20 | c2:NULL |
+------+--------------+-------------+-----------------+
1 row in set (0.00 sec)

+------+--------------+-------------+-----------------+
| i    | udt_t3.FIRST | udt_t3.LAST | udt_t3(i)       |
+------+--------------+-------------+-----------------+
|    0 | -1           | 1           | id:10 | c2:NULL |
+------+--------------+-------------+-----------------+
1 row in set (0.00 sec)

+------+--------------+-------------+-------------------+
| i    | udt_t3.FIRST | udt_t3.LAST | udt_t3(i)         |
+------+--------------+-------------+-------------------+
|   -1 | -1           | 1           | id:NULL | c2:NULL |
+------+--------------+-------------+-------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```



更多关联用法：
- [BULK COLLECT](./5-3-easyuse-ora-sp-bulk-collect.md)
- [FORALL LOOP](./5-3-easyuse-ora-sp-forall-loop.md)
- [TYPE IS RECORD](./5-3-easyuse-ora-sp-record-type.md)




**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../../greatsql-wx.jpg)
