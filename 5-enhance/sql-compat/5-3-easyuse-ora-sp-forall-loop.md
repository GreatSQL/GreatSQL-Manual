# Oracle兼容-存储过程-FORALL LOOP
---


## 1. 语法

```sql
FORALL var IN expr1 .. expr2 INSERT INTO .. VALUES var(n)

-- OR
FORALL var IN expr1..expr2 INSERT INTO .. VALUES var(n)
```

## 2. 定义和用法

在 GreatSQL 中支持用 `FORALL .. LOOP` 循环读取 `expr1` 和 `expr2` 之间的所有值，并再赋值给变量 `var`，之后再执行 `INSERT INTO .. VALUES var(i)` 写入数据。在 `FORALL ... LOOP` 中，支持前后两个参数表达式和中间的点号连接在一起，例如：`FORALL .. IN expr1..expr2 LOOP`；或者只和一个参数连接，例如：`FORALL .. IN expr1.. expr2 LOOP` 及 `FORALL .. IN expr1 ..expr2 LOOP` 都是可以的。

## 3. Oracle兼容说明

在 `ORACLE` 模式下，GreatSQL存储过程支持 `FORALL .. LOOP` 用法。该用法如下所述：

1. 在 `FORALL .. LOOP` 后面语句目前只支持 `INSERT`，别的用法未来版本中会增加支持。

2. 支持用参数获取表中指定的数据，比如 `n := 100; SELECT dr_table(n).col_name`，同时还支持用表达式获取数据，比如 `SELECT dr_table(n+1).col_name`。

3. 对于含有 `UDT` 字段的表，可以采用类似 `t1%ROWTYPE` 作为TABLE，此时可以单独查询 `UDT` 字段中的某个子列。

4. 在 `FORALL var IN expr` 中的表达式 `expr`如果是 `RECORD TABLE` 那么必须 `INDEX BY INT` 这种数值类型的，如果是 `INDEX BY VARCHAR` 这种字符串类型就会报错。

5. 在 `FORALL` 后面的变量 `var` 在其后的 `INSERT` 子句中必须作为 `TABLE` 类型变量的行数索引键值，否则会报错。


## 4. 示例

修改 `sql_generate_invisible_primary_key` 选项设定，因为下面案例中创建的表没有显式主键，关闭该选项可以避免自动创建隐式主键 `my_row_id`，可能会对下面的案例造成影响。
```sql
greatsql> SET SESSION sql_generate_invisible_primary_key = 0;
```

创建测试表并初始化数据
```sql
greatsql> CREATE TABLE t1 (a INT NOT NULL, b VARCHAR(20) NOT NULL);
greatsql> CREATE TABLE t2 (a INT NOT NULL, b VARCHAR(20) NOT NULL);

greatsql> INSERT INTO t1 VALUES(1, 't1_row1'), (2, 't1_row2'), (3,'t1_row3') ;
greatsql> INSERT INTO t2 VALUES(1, 't2_row1'), (2, 't2_row2'), (3,'t2_row3') ;
```

- 1. 示例1：`FORALL LOOP`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1() AS
  TYPE udt1 IS TABLE OF t1%ROWTYPE INDEX BY BINARY_INTEGER;
  udt_t1 udt1;
begin
  udt_t1(100).a := 100;
  udt_t1(100).b := 'udt_t1_row100';

  SELECT  udt_t1(100).a, udt_t1(100).b;

  -- 这里udt_t1.FIRST和udt_t1.LAST可以被替换成别的表达式，只要是数值类型并且 udt_t1(i) 有数据就可以
  FORALL i IN udt_t1.FIRST .. udt_t1.LAST INSERT INTO t2 VALUES udt_t1 (i);
END; //

greatsql> CALL p1() //
+---------------+---------------+
| udt_t1(100).a | udt_t1(100).b |
+---------------+---------------+
|           100 | udt_t1_row100 |
+---------------+---------------+
1 row in set (0.00 sec)

Query OK, 1 row affected (0.00 sec)

greatsql> SELECT * FROM t2; //
+-----+---------------+
| a   | b             |
+-----+---------------+
|   1 | t2_row1       |
|   2 | t2_row2       |
|   3 | t2_row3       |
| 100 | udt_t1_row100 |
+-----+---------------+
4 rows in set (0.00 sec)
```

- 2. 示例2：`BULK COLLECT INTO AND FORALL`

```sql
-- 在示例1的基础上继续
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1(v_a INT) AS
  TYPE t1_record IS RECORD(
    c1 INT := 1,
    c2 VARCHAR(20)
  );
  TYPE t1_list IS TABLE OF t1_record INDEX BY BINARY_INTEGER;
  t1_record_val t1_list;
  CURSOR cur1(v_a INT) IS SELECT a, b FROM t1 WHERE a = v_a;
BEGIN
  t1_record_val(1).c1 := 100;
  SELECT t1_record_val(1).c1;

  OPEN cur1(v_a);
  FETCH cur1 BULK COLLECT INTO t1_record_val LIMIT 3;
  FORALL i IN t1_record_val.FIRST .. t1_record_val.LAST 
    INSERT INTO t2 VALUES t1_record_val(i);
  SELECT t1_record_val(1).c1;
  CLOSE cur1;
END; //

greatsql> CALL p1(1) //
+---------------------+
| t1_record_val(1).c1 |
+---------------------+
|                 100 |
+---------------------+
1 row in set (0.00 sec)

+---------------------+
| t1_record_val(1).c1 |
+---------------------+
|                   2 |
+---------------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)

greatsql> SELECT * FROM t2 //
+-----+---------------+
| a   | b             |
+-----+---------------+
|   1 | t2_row1       |
|   2 | t2_row2       |
|   3 | t2_row3       |
| 100 | udt_t1_row100 |
|   2 | t1_row2       |
+-----+---------------+
5 rows in set (0.00 sec)
```


更多关联用法：
- 1. [TYPE IS RECORD](./5-3-easyuse-ora-sp-record-type.md)
- 2. [BULK COLLECT](./5-3-easyuse-ora-sp-bulk-collect.md)


- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
