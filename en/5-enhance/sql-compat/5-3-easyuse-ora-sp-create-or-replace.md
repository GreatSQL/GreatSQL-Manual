# Oracle Compatibility - Stored Procedure - CREATE OR REPLACE
---


## 1. Syntax

```sql
CREATE OR REPLACE PROCEDURE proc_name ...

CREATE OR REPLACE FUNCTION func_name ...
```

## 2. Definition and Usage

GreatSQL supports `CREATE OR REPLACE` for creating stored procedures/stored functions, in both `DEFAULT` and `ORACLE` modes.

## 3. Examples

```sql
-- 1. DEFAULT mode
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

-- In DEFAULT mode, statements without BEGIN ... END are also supported
greatsql> CREATE OR REPLACE PROCEDURE p1()
  SELECT 3306 AS PORT FROM DUAL; //

greatsql> CALL p1()//
+------+
| PORT |
+------+
| 3306 |
+------+

-- 2. ORACLE mode
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

-- Unlike DEFAULT mode, statements without BEGIN ... END are not supported in ORACLE mode
greatsql> CREATE OR REPLACE PROCEDURE p2()
AS
  SELECT 3306 AS PORT FROM DUAL;
//
ERROR 1064 (42000): You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'SELECT 3306 AS PORT FROM DUAL' at line 3
```




**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
