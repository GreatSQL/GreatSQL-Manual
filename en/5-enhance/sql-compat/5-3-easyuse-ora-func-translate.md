# Oracle Compatibility - Function - TRANSLATE()

---

## 1. Syntax

```
TRANSLATE(string, from_chr, to_chr)
```

## 2. Definition and Usage

The `TRANSLATE()` function traverses the string `string` and converts each single character into another character one by one. Characters in the source string that are not in `from_chr` are deleted, characters in the target string that exceed the mapping are ignored, and there is no restriction on the order of multiple character conversions.

## 3. Examples

```
- Replacement rules:
- G => g
- 数 => d
- 据 => b
- 3 => N
- 库 => delete
- '' => delete
greatsql> SELECT TRANSLATE('GreatSQL数据库''$%^2023', 'G数据3库''', 'gdbN');
+-----------------------------------------------------------------+
| TRANSLATE('GreatSQL数据库''$%^2023', 'G数据3库''', 'gdbN')       |
+-----------------------------------------------------------------+
| greatSQLdb$%^202N                                               |
+-----------------------------------------------------------------+
```

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../../greatsql-wx.jpg)
