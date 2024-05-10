# Oracle兼容-语法-WITH FUNCTION
---


## 1. 语法

```sql
WITH FUNCTION
  <func_name> {<function...>}
  SELECT(query_block)
```

## 2. 定义和用法

通过 `WITH FUNCTION` 子句，可以把很多原本需要存储过程来实现的复杂逻辑用一句SQL来进行表达，使用起来更方便。

相关使用说明如下：

1. 定义的函数的作用域为所在的查询表达式内。 

2. 定义的存储函数对象不会存储到系统表中；

3. 定义的存储函数比模式对象的存储函数拥有更高的优先级；

4. 定义的存储函数比本地函数优先级低；

5. 定义函数时不需要 `CREATE FUNCTION` 权限；

6. 无需要求 `sql_mode = ORACLE`，只要创建函数时的语法不报错即可；

7. 不支持 `PREPARE STMT`；

8. 函数名不支持 `schema_name.func_name` 这种格式，只能在当前Schema中创建函数；

9. 只支持SELECT子句，不支持其他子句，例如 `DELET/UPDATE/MERGE` 等。

备注：9点的功能是存储过程中，需清楚地看到函数定义，避免ddl操作开销的需求，暂时未支持，需收集具体使用场景后再进行适配开发
   

## 3. 示例

```sql
-- 先切换到ORACLE模式
greatsql> SET sql_mode = ORACLE;

greatsql> DELIMITER //

-- 1. 创建函数
greatsql> WITH
FUNCTION f1(c INT) RETURN INT
AS
BEGIN
  RETURN c * 10;
END;
SELECT f1(3306) FROM DUAL; //
+----------+
| f1(3306) |
+----------+
|    33060 |
+----------+
1 row in set (0.00 sec)

-- 2. 创建同名函数
greatsql> SELECT LENGTH('GreatSQL') FROM DUAL //
+--------------------+
| LENGTH('GreatSQL') |
+--------------------+
|                  8 |
+--------------------+
1 row in set (0.00 sec)

-- 可以创建重名函数，但本地函数优先，可以看到结果并非返回6而是8
greatsql> WITH
FUNCTION LENGTH(c VARCHAR2(50)) RETURN INT
AS
BEGIN
  RETURN 6;
END;
SELECT LENGTH('GreatSQL'), INSTR('Hello GreatSQL', 'G') FROM DUAL; //
+--------------------+------------------------------+
| LENGTH('GreatSQL') | INSTR('Hello GreatSQL', 'G') |
+--------------------+------------------------------+
|                  8 |                            7 |
+--------------------+------------------------------+
1 row in set, 1 warning (0.00 sec)

-- 提示重名
greatsql> SHOW WARNINGS; //
+-------+------+---------------------------------------------------------------+
| Level | Code | Message                                                       |
+-------+------+---------------------------------------------------------------+
| Note  | 1585 | This function 'LENGTH' has the same name as a native function |
+-------+------+---------------------------------------------------------------+
1 row in set (0.00 sec)
 
-- 3. 创建不同名函数
-- 可以返回函数中的固定值16
greatsql> WITH
FUNCTION LENGTH_tmp(c VARCHAR2(50)) RETURN INT
AS
BEGIN
  RETURN 16;
END; 
SELECT LENGTH_tmp('GreatSQL') FROM DUAL; //

-- 4. 切换到DEFAULT模式，在DEFAULT模式下创建函数
greatsql> SET sql_mode = DEFAULT; //

greatsql> WITH FUNCTION f2() RETURNS INT
BEGIN
  DECLARE c, s INT;
  DROP TEMPORARY TABLE IF EXISTS t1;
  CREATE TEMPORARY TABLE t1(id INT);
  INSERT INTO t1 VALUES (1), (2), (3);

  SET c:= (SELECT COUNT(*) FROM t1);
  SET s:= (SELECT SUM(id) FROM t1);

  RETURN c * s;
END;
SELECT f2() FROM DUAL; //
+------+
| f2() |
+------+
|   18 |
+------+
1 row in set (0.00 sec)
```



- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
