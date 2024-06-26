# Oracle兼容-存储过程-%TYPE
---


## 1. 语法

```sql
var_name (ref_var_name | table_name.column_name | ref_rowtype)%TYPE [:= init_val]
```

## 2. 定义和用法

在GreatSQL中支持用 `%TYPE` 来声明变量类型，利用 `%TYPE` 声明可使得变量的数据类型与其他某个变量或列的数据类型相同。

可以被 `%TYPE` 应用的变量类型有：

- 普通变量
- 表中某列
- `%ROWTYPE`类型
- `%ROWTYPE`类型中某列

## 3. Oracle兼容说明

在 `ORACLE` 模式下，GreatSQL支持用 `%TYPE` 来声明变量类型。该用法如下所述：

1. 支持所有已兼容的数据类型。

2. 不支持引用临时表中的列。

3. 不支持事务（`VIEW`），包括 `view%TYPE` 和 `view%ROWTYPE`。 

4. 不支持复用自己类型的用法，例如 `x x%TYPE`。

## 4. 示例

修改 `sql_generate_invisible_primary_key` 选项设定，因为下面案例中创建的表没有显式主键，关闭该选项可以避免自动创建隐式主键 `my_row_id`，可能会对下面的案例造成影响。
```sql
greatsql> SET SESSION sql_generate_invisible_primary_key = 0;
```

创建测试表并初始化数据
```sql
greatsql> CREATE TABLE t1 (a INT NOT NULL, b VARCHAR(20) NOT NULL);
greatsql> INSERT INTO t1 VALUES(1, 'row1'), (2, 'row2'), (3,'row3') ;
```

- 1. 示例1

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE vtype_sp1() AS
  v_id t1.a%TYPE;
  v_vchar VARCHAR(100) := 'varchar_type';

  v3 v_vchar%TYPE;
  v4 v3%TYPE;
BEGIN
  v_id := 1;
  v_vchar := 'v_vchar_type';
  v3 := 'v3_varchar';
  v4 := 'v4_varchar';

  SELECT v_id, v_vchar, v3, v4;
END; //

greatsql> CALL vtype_sp1() //
+------+--------------+------------+------------+
| v_id | v_vchar      | v3         | v4         |
+------+--------------+------------+------------+
|    1 | v_vchar_type | v3_varchar | v4_varchar |
+------+--------------+------------+------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 2. 示例2

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE vtype_sp2() AS
  CURSOR cur1 (v_a INT) IS SELECT * FROM t1 WHERE a = v_a;
  rec1 cur1%ROWTYPE;
  rec2 rec1%TYPE;
BEGIN
  FOR rec2 IN cur1(1)
  LOOP
    SELECT rec2.b;
  END LOOP;
END; //

greatsql> CALL vtype_sp2() //
+--------+
| rec2.b |
+--------+
| row1   |
+--------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 3. 示例3

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> DECLARE
  rec t1.a%TYPE;
BEGIN
  rec := ROUND(RAND()*10240);

  SELECT rec;
END; //
+------+
| rec  |
+------+
| 8473 |
+------+
1 row in set (0.01 sec)

Query OK, 0 rows affected (0.01 sec)
```

- 4. 示例4

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET udt_format_result = 'DBA';

greatsql> CREATE OR REPLACE TYPE udt1 AS OBJECT(a INT, b VARCHAR(20));
greatsql> CREATE TABLE udt_t1(a INT, b udt1);
greatsql> INSERT INTO udt_t1 VALUES(1, udt1(1, 'c1_row1'));
greatsql> INSERT INTO udt_t1 VALUES(2, udt1(2, 'c1_row2'));
greatsql> INSERT INTO udt_t1 VALUES(3, udt1(3, 'c1_row3'));

greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE vtype_sp3() AS
  vt1 udt_t1.b%TYPE;
  vt2 udt1;
BEGIN
  SELECT b INTO vt1 FROM udt_t1 WHERE a = 2;
  SELECT vt1.a, vt1.b;

  SELECT b INTO vt2 FROM udt_t1 WHERE a = 3;
  SELECT vt2.a, vt2.b;

  SELECT vt1 INTO vt2;
  SELECT vt2.a, vt2.b;
END; //

greatsql> CALL vtype_sp3() //
+-------+---------+
| vt1.a | vt1.b   |
+-------+---------+
|     2 | c1_row2 |
+-------+---------+
1 row in set (0.00 sec)

+-------+---------+
| vt2.a | vt2.b   |
+-------+---------+
|     3 | c1_row3 |
+-------+---------+
1 row in set (0.00 sec)

+-------+---------+
| vt2.a | vt2.b   |
+-------+---------+
|     2 | c1_row2 |
+-------+---------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 5. 示例5

```
-- 在示例4的基础上继续
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE vtype_sp4() AS
  vt1 udt_t1%ROWTYPE;
BEGIN
  vt1.b := udt1(10, 'c1_row10');

  SELECT vt1, vt1.a, vt1.b.a, vt1.b.b;
END; //

greatsql> CALL vtype_sp4() //
+------------------------------+-------+---------+----------+
| vt1                          | vt1.a | vt1.b.a | vt1.b.b  |
+------------------------------+-------+---------+----------+
| a:NULL | b:a:10 | b:c1_row10 |  NULL |      10 | c1_row10 |
+------------------------------+-------+---------+----------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```





**扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
