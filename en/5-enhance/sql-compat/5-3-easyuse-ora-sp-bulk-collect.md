# Oracle Compatibility - Stored Procedure - BULK COLLECT
---


## 1. Syntax

```sql
[SELECT|FETCH] .. BULK COLLECT INTO
```

## 2. Definition and Usage

GreatSQL stored procedures support using `SELECT|FETCH .. BULK COLLECT INTO` to fetch multiple rows of data. The usage is as follows:

- 1. The `SELECT .. BULK COLLECT INTO` syntax is supported to fetch multiple rows of data from a table and assign them to a `TABLE` type variable.

- 2. The `FETCH .. BULK COLLECT INTO .. LIMIT n` syntax is supported to fetch multiple rows of data from a cursor and assign them to a `TABLE` type variable.

## 3. Oracle Compatibility Notes

In `ORACLE` mode, GreatSQL stored procedures support the `[SELECT|FETCH] .. BULK COLLECT INTO` usage. The usage is as follows:

1. In `[SELECT|FETCH] .. BULK COLLECT INTO var`, the variable `var` only supports a one-level table type, such as `var`; variable types like `a.b.var` are not supported.

2. In `FETCH .. BULK COLLECT INTO var`, if the `LIMIT n` clause is not specified, at most `@@select_bulk_into_batch` rows are read at a time by default. Its optional range is [1, 65535] and the default value is 10000. If the `LIMIT n` clause is specified but `n > @@select_bulk_into_batch`, the error `ER_WRONG_BATCH_FOR_BULK_INTO` is raised, to prevent memory overflow.

3. Description of the new system option `select_bulk_into_batch`:

| Parameter | Description |
| ---------------- | ------------------------------------------------------------ |
| Parameter name | select_bulk_into_batch |
| Parameter description | Maximum number of rows read at a time in `FETCH .. BULK COLLECT INTO var` |
| Parameter type | INT |
| Value range (rows) | [1, 65535] |
| Default value (rows) | 10000 |
| Recommended best value (rows) | 1000 |
| Usage example | SET @@select_bulk_into_batch = n;<br />SHOW VARIABLES LIKE 'select_bulk_into_batch'; |

## 4. Examples

Set the `sql_generate_invisible_primary_key` option because the tables created in the following examples have no explicit primary key; disabling this option avoids automatically creating the implicit primary key `my_row_id`, which might affect the following examples.
```sql
greatsql> SET SESSION sql_generate_invisible_primary_key = 0;
```

Create test tables and initialize data
```sql
greatsql> CREATE TABLE t1 (a INT NOT NULL, b VARCHAR(20) NOT NULL);
greatsql> INSERT INTO t1 VALUES(1, 'row1'), (2, 'row2'), (3,'row3') ;

greatsql> CREATE TABLE t2 (a INT NOT NULL, b VARCHAR(20) NOT NULL);
```

- 1. Example 1: `SELECT BULK COLLECT`

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

- 2. Example 2: `FETCH BULK COLLECT`

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

  -- Here only two rows are actually fetched, while LIMIT is set to 3; no error is raised
  FETCH c BULK COLLECT  INTO t1_record_val LIMIT 3;

  -- Currently, FORALL only supports INSERT operations
  FORALL i IN t1_record_val.FIRST .. t1_record_val.LAST 
    INSERT INTO t2 VALUES t1_record_val(i);

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

- 3. Example 3: `FETCH BULK COLLECT INTO batch`

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

    -- Because FETCH is executed only twice, the third time can exit.
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


More related usages:
- 1. [TYPE IS RECORD](./5-3-easyuse-ora-sp-record-type.md)
- 2. [FORALL LOOP](./5-3-easyuse-ora-sp-forall-loop.md)




**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
