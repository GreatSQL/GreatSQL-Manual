# Oracle Compatibility - Function - SUBSTR()

---

## 1. Syntax

```sql
SUBSTR(string, pos [, substring_length] )
```

## 2. Definition and Usage

The `SUBSTR()` function returns a portion of the character argument `string`. The portion starts at the `pos`-th character of `string` and takes `substring_length` characters.

- If `pos` is 0, it is treated as 1, meaning `string` starts from the 1st character.
- If `pos` is positive, it starts from the `pos`-th character of `string`.
- If `pos` is negative, it starts from the `pos`-th character from the end of `string`.
- If `pos` is '' (empty), it is treated as 1 in Oracle mode.
- If `substring_length` is not specified, characters are taken up to the last character of `string`.
- If `substring_length` is less than or equal to 0, an empty character is returned.
- If any of `string`, `pos`, or `substring_length` is NULL, NULL is returned.
- When `string` contains escape characters (for example: `\0`, `\'`, `''`, `\"`, `\\`, `\b`, `\B`, `\n`, `\N`, `\r`, `\R`, `\t`, `\T`, `\z`, `\Z`), they are not treated as 2 characters but as 1 character.

## 3. Oracle Compatibility Notes

Since GreatSQL natively supports the `SUBSTR()` function, to use the extended `SUBSTR()` function in GreatSQL, you need to run `SET sql_mode = ORACLE;` first to activate Oracle compatibility mode.

In Oracle compatibility mode, there are two differences from the native GreatSQL `SUBSTR()` function:
- When the parameter `pos` is 0, it is treated as 1 in Oracle compatibility mode; while the native GreatSQL function still treats it as 0, and the return result is always empty ('').
- When the return result is empty (''), Oracle compatibility mode returns NULL; while the native GreatSQL function still returns empty ('').

The native GreatSQL `SUBSTR()` function is an alias of the `SUBSTRING()` function, with the following usages:
```
SUBSTRING(str,pos)
SUBSTRING(str FROM pos)
SUBSTRING(str,pos,len)
SUBSTRING(str FROM pos FOR len)
```
More details about the native `SUBSTR()` function are not repeated here.

## 4. Examples
```
-- Switch to Oracle mode
greatsql> SET sql_mode = ORACLE;

-- When pos=0, it is treated as pos=1
greatsql> SELECT SUBSTR('GreatSQL', 0, 1);
+--------------------------+
| SUBSTR('GreatSQL', 0, 1) |
+--------------------------+
| G                        |
+--------------------------+

greatsql> SELECT SUBSTR('GreatSQL', 1, 1);
+--------------------------+
| SUBSTR('GreatSQL', 1, 1) |
+--------------------------+
| G                        |
+--------------------------+

-- When the result is empty, NULL is returned
greatsql> SELECT SUBSTR('GreatSQL', 9, 1);
+--------------------------+
| SUBSTR('GreatSQL', 9, 1) |
+--------------------------+
| NULL                     |
+--------------------------+

-- Escape characters are treated as 1 character
greatsql> SELECT SUBSTR('\"GreatSQL', 1);
+-------------------------+
| SUBSTR('\"GreatSQL', 1) |
+-------------------------+
| "GreatSQL               |
+-------------------------+

-- Switch to DEFAULT mode
-- When pos=0, the return value is always empty
greatsql> SELECT SUBSTR('GreatSQL', 0, 1);
+--------------------------+
| SUBSTR('GreatSQL', 0, 1) |
+--------------------------+
|                          |
+--------------------------+

-- When the result is empty, '' is explicitly displayed instead of NULL
greatsql> SELECT SUBSTR('GreatSQL', 9, 1);
+--------------------------+
| SUBSTR('GreatSQL', 9, 1) |
+--------------------------+
|                          |
+--------------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
