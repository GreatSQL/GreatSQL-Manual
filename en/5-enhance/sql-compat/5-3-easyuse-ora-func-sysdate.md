# Oracle Compatibility - Function - SYSDATE()

---

## 1. Syntax

```sql
SYSDATE
SYSDATE()
```
When calling it, the parentheses indicating the function can be omitted.

## 2. Definition and Usage

`SYSDATE` is implemented as a system keyword. In ORACLE mode, it is equivalent to `NOW(6)`; in DEFAULT mode, it is `SYSDATE()`.

## 3. Examples

```sql
-- Execute in DEFAULT mode first
greatsql> SET sql_mode = DEFAULT;

greatsql> SELECT SYSDATE, SYSDATE() FROM DUAL;
+---------------------+---------------------+
| SYSDATE             | SYSDATE()           |
+---------------------+---------------------+
| 2023-05-11 14:43:52 | 2023-05-11 14:43:52 |
+---------------------+---------------------+

-- Switch to ORACLE mode
greatsql> SET sql_mode = ORACLE;

greatsql> SELECT SYSDATE, SYSDATE() FROM DUAL;
+----------------------------+----------------------------+
| SYSDATE                    | SYSDATE()                  |
+----------------------------+----------------------------+
| 2023-05-11 14:43:52.865664 | 2023-05-11 14:43:52.865664 |
+----------------------------+----------------------------+
```
As can be seen, the output results differ under different `sql_mode` values, and the precision is higher in Oracle mode.

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
