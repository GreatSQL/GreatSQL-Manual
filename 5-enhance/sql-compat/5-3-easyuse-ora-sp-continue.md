# Oracle兼容-存储过程-CONTINUE
------

## 语法

```sql
SET sql_mode = ORACLE;
CONTINUE [ LABEL ] [ WHEN boolean_expression ] ;
```

## 定义和语法
GreatSQL 中支持在存储过程中使用 `CONTINUE` 跳到 `LOOP` 开始处或者 `LOOP` 开始处的 `LABEL` 位置，直接从下一次 `LOOP` 开始继续循环。

该用法只能用在存储过程中的 `LOOP` 循环里，包括 `FOR LOOP`、`WHILE LOOP` 和 `LOOP .. END LOOP`。

提醒：存储过程 `LABEL` 不支持 `EXECUTE, RESTART, SHUTDOWN, ASCII, BYTE, CHARSET, COMMENT, COMPRESSION_DICTIONARY, CONTAINS, LANGUAGE, NO, SIGNED, SLAVE, UNICODE` 这些关键词。

## Oracle 兼容说明

GreatSQL 的 `CONTINUE` 用法和 Oracle 一致。

1. `CONTINUE [ LABEL ]`：如果没有标签，`CONTINUE` 语句将直接跳到下一次循环。如果加上标签，则 `CONTINUE` 语句将跳转到标签标识的下一次循环。

2. `CONTINUE [ LABEL ] WHEN`：如果没有 `WHEN` 子句，`CONTINUE` 语句将直接退出当前循环。如果加上了 `WHEN` 子句，当且仅当 "boolean_expression" 表达式的值为 "TRUE" 时，`CONTINUE` 语句才会退出当前循环。

3. 对于多重嵌套的 `FOR i IN (select_stmt) LOOP` 和 `FOR i IN cursor LOOP` 循环，`CONTINUE` 跳转到之前的任何第 N 层的循环开始处，本层开始到第 N 层之间的 cursor 会执行 `CLOSE cursor` 操作，这样不影响下一次循环。然而对于中间执行过 `OPEN cursor` 的操作不会再执行 `CLOSE cursor` 操作。对于 `OPEN CURSOR FOR sys_refcursor` 也会执行 `CLOSE cursor` 操作，具体见下方[示例1](#示例1)。

4. `CONTINUE` 只能用于 `FOR ... LOOP` 循环中。

## 示例

创建测试表并初始化数据

```sql
greatsql> DROP TABLE IF EXISTS t1, t2;

greatsql> CREATE TABLE IF NOT EXISTS t1(id INT NOT NULL, c1 VARCHAR(100) NOT NULL);
greatsql> INSERT INTO t1 VALUES(1, 'row1'), (2, 'row2'), (3, 'row3');

greatsql> CREATE TABLE IF NOT EXISTS t2(id INT NOT NULL, c1 VARCHAR(100) NOT NULL);
greatsql> INSERT INTO t2 VALUES(10, 'row10'), (20, 'row20'), (30, 'row30');
```

### 示例1：FOR ... CURSOR LOOP

```sql
greatsql> DELIMITER //
greatsql> SET sql_mode = ORACLE;
greatsql> CREATE OR REPLACE PROCEDURE p1() AS
  CURSOR cur1  IS SELECT * FROM t1 WHERE id < 3;
  CURSOR cur21 IS SELECT * FROM t2 WHERE id < 30;
  CURSOR cur22 IS SELECT * FROM t2 WHERE id < 30;
  cur3 sys_refcursor;
begin
  <<label1>>
  FOR i IN cur1 LOOP
    SELECT i;
    <<label2>>
    FOR j IN cur21 LOOP
      SELECT j;
      CONTINUE label1;
      -- 当前的逻辑是跳到 label1 循环开始处，跳出去之前会先 CLOSE cur21，这样不影响下一次执行 label2 循环。
      -- 1. 如果加上 OPEN cur22，那么下一次循环就会报错，因为 cur22 已经被 OPEN 过了（不能被重复 OPEN）。
      -- 2. 如果改成 CONTINUE （不带 LABEL），就会从 label2 继续下一次循环。
      -- 3. 如果改成 CONTINUE label2 WHEN j.id = 2，就会在符合条件的时候跳到 label2 循环开始处。
      SELECT 'AFTER CONTINUE';
    END LOOP;
  END LOOP;
END //
DELIMITER ;
greatsql> CALL p1();
```

### 示例2：`FOR select_stmt LOOP`

```
greatsql> DELIMITER //
greatsql> SET sql_mode = ORACLE;
greatsql> CREATE OR REPLACE PROCEDURE p1() AS
  CURSOR cur1 IS SELECT * FROM t1 WHERE id < 3;
  CURSOR cur2 IS SELECT * FROM t2 WHERE id < 30;
BEGIN
  <<label1>>
  FOR i IN (SELECT * FROM t1 WHERE id < 3) LOOP
    SELECT i;
    <<label2>>
    FOR j IN (SELECT * FROM t2 WHERE id < 30) LOOP
      SELECT j;
      CONTINUE WHEN j.id = 10;
      SELECT 'AFTER CONTINUE';
    END LOOP;
  END LOOP;
END //
DELIMITER ;
greatsql> CALL p1();
```

### 示例3：`FOR i IN ... LOOP`

```sql
greatsql> DELIMITER //
greatsql> SET sql_mode = ORACLE;
greatsql> CREATE OR REPLACE PROCEDURE p1() AS
  ret VARCHAR(100);
BEGIN
  <<label1>>
  FOR i IN 1..2 LOOP
    SELECT i;
    <<label2>>
    FOR j IN 10 .. 12 LOOP
      SELECT j;
      CONTINUE label1;
      SELECT 'AFTER CONTINUE';
    END LOOP;
  END LOOP;
END //
DELIMITER ;
greatsql> CALL p1();
```

### 示例4：`WHILE ... LOOP`

```sql
greatsql> DELIMITER //
greatsql> SET sql_mode = ORACLE;
greatsql> CREATE OR REPLACE PROCEDURE p1() AS
  ret VARCHAR(100);
  c1 INT := 0;
  c2 INT := 0;
BEGIN
  <<label1>>
  WHILE c1<2 LOOP
    c1 := c1 + 1;
    SELECT c1;
    <<label2>>
    WHILE c2 < 4 LOOP
      c2 := c2 + 1;
      SELECT c2;
      CONTINUE WHEN c2 = 2;
      SELECT 'AFTER CONTINUE';
    END LOOP;
  END LOOP;
END //
DELIMITER ;
greatsql> CALL p1();
```

### 示例5：`LOOP ... END LOOP`

```sql
greatsql> DELIMITER //
greatsql> SET sql_mode = ORACLE;
greatsql> CREATE OR REPLACE PROCEDURE p1() AS
  ret VARCHAR(100);
  c1 INT := 0;
  c2 INT := 0;
BEGIN
  <<label1>>
  LOOP
    c1 := c1 + 1;
    SELECT c1;
    EXIT WHEN c1 = 2;
    <<label2>>
    LOOP
      c2 := c2 + 1;
      SELECT c2;
      EXIT WHEN c2 = 3;
      CONTINUE label1 WHEN c2 = 2;
      SELECT 'AFTER CONTINUE';
    END LOOP;
  END LOOP;
END //
DELIMITER ;
greatsql> CALL p1();
```

### 示例6：不用在 `LOOP` 块中，不支持 `CONTINUE` 用法

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //
greatsql> CREATE OR REPLACE PROCEDURE p1() AS
BEGIN
  <<label1>>
  CONTINUE;
END //
SQL Error [1235] [42000]: This version of MySQL doesn't yet support 'CONTINUE clause without loop statement'
```


- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../../greatsql-wx.jpg)
