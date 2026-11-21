# Oracle Compatibility - Function - ADD_MONTHS()

---

## 1. Syntax

```sql
ADD_MONTHS(date, n)
```

## 2. Definition and Usage

The `ADD_MONTHS()` function operates on date values, increasing the date by a number of months during data queries. The return type of `ADD_MONTHS()` is `DATETIME`.

## 3. Oracle Compatibility Notes

In GreatSQL, the `ADD_MONTHS(date, n)` function differs somewhat from Oracle in terms of parameter input format checking and output results. The differences are described in the table below:

| Description | Example | Oracle return value | GreatSQL return value |
| ---------------------------------------------------------- | -------------------- | --------------- | ------------------------------------------------------------ |
| Different supported date format ranges | `ADD_MONTHS('03-MAR-97', 1)`; | 03-APR-97 | Returns NULL with the warning `Warning:Incorrect datetime value: '03-MAR-97'` |
| Different handling when the computed date exceeds the system-supported range | `ADD_MONTHS('2022-02-28', 95746)` | Raises ORA-01841 error | Returns NULL with the warning `Warning:datetime field overflow` |

## 4. Examples

```sql
greatsql> SELECT NOW(), ADD_MONTHS(SYSDATE(), -2), ADD_MONTHS(SYSDATE(), +2);
+---------------------+---------------------------+---------------------------+
| NOW()               | ADD_MONTHS(SYSDATE(), -2) | ADD_MONTHS(SYSDATE(), +2) |
+---------------------+---------------------------+---------------------------+
| 2023-05-18 09:06:38 | 2023-03-18 09:06:38       | 2023-07-18 09:06:38       |
+---------------------+---------------------------+---------------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
