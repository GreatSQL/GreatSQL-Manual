# Oracle Compatibility - Function - SYS_GUID()

---

## 1. Syntax

```sql
SYS_GUID()
```

## 2. Definition and Usage

The `SYS_GUID()` function generates a globally unique 32-digit serial number based on the current time and the machine code. The 32 characters are divided into five segments, with lengths of 8, 4, 4, 4, and 12 respectively. The first three segments (8, 4, 4) are generated based on the current time, and the last two segments (4, 12) are generated based on the machine code. The function returns a string of 32 characters in length, including `0-9` and lowercase `a-f`.

## 3. Oracle Compatibility Notes

In GreatSQL, the 32-digit random value returned by the `SYS_GUID()` function includes some lowercase English characters, while the return value in Oracle may contain uppercase English characters. In addition, the return value type differs across Oracle versions, such as returning the `raw` type, while the return value in GreatSQL is always of the `VARCHAR` type.

## 4. Examples

```
greatsql> SELECT SYS_GUID();
+----------------------------------+
| SYS_GUID()                       |
+----------------------------------+
| 82ef5040fd4511ed836ed08e7908bcb1 |
+----------------------------------+

greatsql> SELECT SYS_GUID();
+----------------------------------+
| SYS_GUID()                       |
+----------------------------------+
| 865d9600fd4511ed836ed08e7908bcb1 |
+----------------------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
