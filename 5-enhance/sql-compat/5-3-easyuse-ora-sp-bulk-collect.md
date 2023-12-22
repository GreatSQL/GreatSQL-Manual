# Oracle兼容-存储过程-BULK COLLECT
---


## 1. 语法

```sql
[SELECT|FETCH] .. BULK COLLECT INTO
```

## 2. 定义和用法

GreatSQL存储过程中支持用 `SELECT|FETCH .. BULK COLLECT INTO` 获取多行数据。该用法如下所述：

- 1. 支持用 `SELECT .. BULK COLLECT INTO` 语法取表中多行数据，并赋值给 `TABLE` 类型变量。

- 2. 支持用 `FETCH .. BULK COLLECT INTO .. LIMIT n` 语法取游标中的多行数据，并赋值给 `TABLE` 类型变量。

## 3. Oracle兼容说明

在 `ORACLE` 模式下，GreatSQL存储过程支持 `[SELECT|FETCH] .. BULK COLLECT INTO` 用法。该用法如下所述：

1. 在 `[SELECT|FETCH] .. BULK COLLECT INTO var` 中的变量 `var` 只支持一层表类型，比如 `var`，不支持 `a.b.var` 这种变量类型。

2. 在 `FETCH .. BULK COLLECT INTO var` 中如果不加 `LIMIT n` 子句，则默认一次性最多读取 `@@select_bulk_into_batch` 行数据，其可选范围 [1, 65535]，默认值为 10000。如果制定了 `LIMIT n` 子句，但 `n > @@select_bulk_into_batch` 时，会提示错误：`ER_WRONG_BATCH_FOR_BULK_INTO`，这是为了保证不发生内存溢出。

3. 新增系统选项 `select_bulk_into_batch` 使用说明：

| 参数             | 说明                                                         |
| ---------------- | ------------------------------------------------------------ |
| 参数名称         | select_bulk_into_batch                                       |
| 参数解释         | `FETCH .. BULK COLLECT INTO var` 时一次性最多读取的行数限制 |
| 参数类型         | INT                                                          |
| 参数取值范围(行) | [1, 65535]                                                     |
| 默认值(行)       | 10000                                                        |
| 建议最佳数值(行) | 1000                                                         |
| 使用示例         | SET @@select_bulk_into_batch = n;<br />SHOW VARIABLES LIKE 'select_bulk_into_batch'; |

## 4. 示例

修改 `sql_generate_invisible_primary_key` 选项设定，因为下面案例中创建的表没有显式主键，关闭该选项可以避免自动创建隐式主键 `my_row_id`，可能会对下面的案例造成影响。
```sql
greatsql> SET SESSION sql_generate_invisible_primary_key = 0;
```

创建测试表并初始化数据
```sql
greatsql> CREATE TABLE t1 (a INT NOT NULL, b VARCHAR(20) NOT NULL);
greatsql> INSERT INTO t1 VALUES(1, 'row1'), (2, 'row2'), (3,'row3') ;

greatsql> CREATE TABLE t2 (a INT NOT NULL, b VARCHAR(20) NOT NULL);
```

- 1. 示例1：`SELECT BULK COLLECT`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

CREATE OR REPLACE PROCEDURE bulk_sp1() AS
  TYPE udtt IS TABLE OF t1%ROWTYPE INDEX BY BINARY_INTEGER;
  udtt_t1 udtt;
BEGIN
  SELECT * BULK COLLECT INTO udtt_t1 FROM t1;
  FOR i IN udtt_t1.FIRST .. udtt_t1.LAST LOOP
    SELECT udtt_t1(i).a, udtt_t1(i).b;
  END LOOP;
END; //

greatsql> CALL bulk_sp1() //
+--------------+--------------+
| udtt_t1(i).a | udtt_t1(i).b |
+--------------+--------------+
|            1 | row1         |
+--------------+--------------+
1 row in set (0.00 sec)

+--------------+--------------+
| udtt_t1(i).a | udtt_t1(i).b |
+--------------+--------------+
|            2 | row2         |
+--------------+--------------+
1 row in set (0.00 sec)

+--------------+--------------+
| udtt_t1(i).a | udtt_t1(i).b |
+--------------+--------------+
|            3 | row3         |
+--------------+--------------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```

- 2. 示例2：`FETCH BULK COLLECT`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE bulk_sp2(v_a INT) AS
  TYPE t1_record IS RECORD(
    id INT := 1,
    name_d VARCHAR(20)
  );
  TYPE t1_list IS TABLE OF t1_record INDEX BY BINARY_INTEGER;
  t1_record_val t1_list;

  CURSOR c(v_a INT) IS SELECT a, b FROM t1 WHERE a = v_a;
BEGIN
  OPEN c(v_a);

  -- 这里实际只获取到两行数据，而LIMIT限定为3，不会报错
  FETCH c BULK COLLECT  INTO t1_record_val LIMIT 3;

  -- 目前FORALL后面只支持INSERT操作
  FORALL i IN t1_record_val.FIRST .. t1_record_val.LAST 
    INSERT INTO t2 values t1_record_val(i);

  CLOSE c;
END; //

greatsql> CALL bulk_sp2(1) //
Query OK, 1 row affected (0.00 sec)

greatsql> SELECT * FROM t2 //
+---+------+
| a | b    |
+---+------+
| 1 | row1 |
+---+------+
1 row in set (0.01 sec)
```

- 3. 示例3：`FETCH BULK COLLECT INTO batch`

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> SET select_bulk_into_batch = 5;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE bulk_sp3() AS
  CURSOR cur1 IS SELECT * FROM t1;
  TYPE udtt IS TABLE OF t1%ROWTYPE INDEX BY BINARY_INTEGER;
  udtt_t1 udtt;
  v_i INT := 0;
BEGIN
  OPEN cur1;
  LOOP
    SELECT v_i;

    -- 因为fetch只会执行2次，因此第三次就可以退出了。
    EXIT WHEN v_i % @@select_bulk_into_batch > 1;

    FETCH cur1 BULK COLLECT INTO udtt_t1;

    FOR i IN udtt_t1.FIRST .. udtt_t1.LAST LOOP
      SELECT udtt_t1(i).a, udtt_t1(i).b;

    END LOOP;

    v_i := v_i + 1;
  END LOOP;
  CLOSE cur1;
END; //

greatsql> CALL bulk_sp3() //
+------+
| v_i  |
+------+
|    0 |
+------+
1 row in set (0.00 sec)

+--------------+--------------+
| udtt_t1(i).a | udtt_t1(i).b |
+--------------+--------------+
|            1 | row1         |
+--------------+--------------+
1 row in set (0.00 sec)

+--------------+--------------+
| udtt_t1(i).a | udtt_t1(i).b |
+--------------+--------------+
|            2 | row2         |
+--------------+--------------+
1 row in set (0.00 sec)

+--------------+--------------+
| udtt_t1(i).a | udtt_t1(i).b |
+--------------+--------------+
|            3 | row3         |
+--------------+--------------+
1 row in set (0.00 sec)

+------+
| v_i  |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

+------+
| v_i  |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

Query OK, 0 rows affected (0.00 sec)
```


更多关联用法：
- 1. [TYPE IS RECORD](./5-3-easyuse-ora-sp-record-type.md)
- 2. [FORALL LOOP](./5-3-easyuse-ora-sp-forall-loop.md)



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../../greatsql-wx.jpg)
