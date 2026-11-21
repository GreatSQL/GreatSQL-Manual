# Oracle Compatibility - Function - INSTR()

---

## 1. Syntax

```
INSTR( string1, string2 [, start_position [, nth_appearance ] ] )
```

## 2. Definition and Usage

The `INSTR()` function returns the position of a substring within a source string. That is, it searches for `string2` in `string1`, starting from the offset given by `start_position`, and returns the position of the `nth_appearance` occurrence of `string2`.

## 3. Oracle Compatibility Notes

In GreatSQL, the usage of the `INSTR()` function is the same as in Oracle.

GreatSQL already has a native `INSTR()` function, with the following usage:

```sql
INSTR(str,substr)
```

In GreatSQL, it is extended to the following usage:

```sql
INSTR( string1, string2 [, start_position [, nth_appearance ] ] )
```

That is: `INSTR(source_string, target_string, start_position, match_index)`.

**Note**: Since GreatSQL already has a native `INSTR()` function, to use the extended `INSTR()` function, you need to run `SET sql_mode = ORACLE` first to switch to `ORACLE` mode.

The differences between the `INSTR()` function in GreatSQL and Oracle include: when the `nth_appearance` argument is a decimal, the result differs from Oracle (Oracle performs special conversion processing). See the examples below for details.

## 4. Examples

The following cases demonstrate the different behaviors and return results that may occur between GreatSQL and Oracle:

```
-- Returns 1 in both GreatSQL and Oracle
> SELECT INSTR('0.3333', '0.3') FROM DUAL;

-- Returns 1 in both GreatSQL and Oracle
> SELECT INSTR(0.3333, 0.3) FROM DUAL;

-- Returns 1 in GreatSQL
-- Returns 2 in Oracle
> SELECT INSTR('0.3333', 0.3) FROM DUAL;
```

The following are test cases in GreatSQL:

```
-- Switch to ORACLE mode first
greatsql> SET sql_mode = ORACLE;

-- Returns: 3, the position of the first occurrence of "l"
greatsql> SELECT INSTR('helloworld','l') FROM DUAL;
+-------------------------+
| INSTR('helloworld','l') |
+-------------------------+
|                       3 |
+-------------------------+

-- Returns: 4, i.e., "lo" appears together, the position of the first letter "l"
greatsql> SELECT INSTR('helloworld','lo') FROM DUAL;
+--------------------------+
| INSTR('helloworld','lo') |
+--------------------------+
|                        4 |
+--------------------------+

-- Returns: 4, starting from the offset of the 2nd character (character "e") in "helloworld", find the position of the second occurrence of "l"
greatsql> SELECT INSTR('helloworld','l',2,2) FROM DUAL;
+-----------------------------+
| INSTR('helloworld','l',2,2) |
+-----------------------------+
|                           4 |
+-----------------------------+

-- Returns: 9, starting from the 1st character from the end (character "d") of "helloworld", search backward for the position of the first occurrence of "l"
greatsql> SELECT INSTR('helloworld','l',-1,1) FROM DUAL;
+------------------------------+
| INSTR('helloworld','l',-1,1) |
+------------------------------+
|                            9 |
+------------------------------+

-- Returns: 22, i.e., the fourth segment of the final IP address
greatsql> SELECT SUBSTR('192.168.0.22', INSTR('192.168.0.22', '.', 1, 3) +1) FROM DUAL;
+-------------------------------------------------------------+
| SUBSTR('192.168.0.22', INSTR('192.168.0.22', '.', 1, 3) +1) |
+-------------------------------------------------------------+
| 22                                                          |
+-------------------------------------------------------------+
```

You can test the following cases yourself and think about whether the results meet expectations:

```
SET sql_mode = ORACLE;
SELECT INSTR('a','A') FROM DUAL;
SELECT INSTR('thisisatestsentence','t',1,'')  FROM DUAL;
SELECT INSTR('thisisatestsentence','t','',1)  FROM DUAL;
SELECT INSTR('thisisatestsentence','t',1,2.1)  FROM DUAL;
SELECT INSTR('thisisatestsentence','t',1,2.5)  FROM DUAL;
SELECT INSTR('thisisatestsentence','t',0.1,1)  FROM DUAL;
SELECT INSTR('thisisatestsentence','t',0.5,1)  FROM DUAL;
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
