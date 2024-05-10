# Oracle兼容-存储过程-CREATE OR REPLACE
---


## 1. 语法

```sql
CREATE OR REPLACE PROCEDURE proc_name ...

CREATE OR REPLACE FUNCTION func_name ...
```

## 2. 定义和用法

GreatSQL支持 `CREATE OR REPLACE` 创建存储过程/存储函数，无论是在 `DEFAULT` 还是 `ORACLE` 模式均支持。

## 3. 示例

```sql
-- 1. DEFAULT模式
greatsql> DELIMITER //
greatsql> SET sql_mode = DEFAULT; //

greatsql> CREATE OR REPLACE PROCEDURE p1()
BEGIN
  SELECT 3306 AS PORT FROM DUAL;
END;//

greatsql> CALL p1()//
+------+
| PORT |
+------+
| 3306 |
+------+

-- 在DEFAULT模式下还支持不带BEGIN ... END语句
greatsql> CREATE OR REPLACE PROCEDURE p1()
  SELECT 3306 AS PORT FROM DUAL; //

greatsql> CALL p1()//
+------+
| PORT |
+------+
| 3306 |
+------+

-- 2. ORACLE模式
greatsql> SET sql_mode = ORACLE; //

greatsql> CREATE OR REPLACE PROCEDURE p2()
AS
BEGIN
  SELECT 3306 AS PORT FROM DUAL;
END; //

greatsql> CALL p2()//
+------+
| PORT |
+------+
| 3306 |
+------+

-- 和DEFAULT模式不同，在ORACLE模式下不支持不带BEGIN ... END语句
greatsql> CREATE OR REPLACE PROCEDURE p2()
AS
  SELECT 3306 AS PORT FROM DUAL;
//
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'SELECT 3306 AS PORT FROM DUAL' at line 3
```



- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
