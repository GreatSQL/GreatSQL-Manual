# Oracle兼容-函数-RAWTOHEX()函数
---


## 1. 语法

```sql
RAWTOHEX(expr)
```

## 2. 定义和用法
`RAWTOHEX()` 函数的作用是将 `expr` 转换为用十六进制表示的字符值。

`RAWTOHEX()` 函数只接受 `CHAR`、`VARCHAR`、`BINARY`、`VARBINARY`、`BLOB`、`TEXT`、`ENUM`、`SET`、`RAW`、`VARCHAR2` 等数据类型的参数。

函数返回一个字符串，由构成原始值字节的十六进制表示，即每个字节由两个十六进制数字表示。

## 3. Oracle兼容说明

在Oracle中，`expr`参数支持的类型为除 `LONG,LONG RAW,CLOB,NCLOB,BLOB,BFILE` 之外的任何标量数据类型，而GreatSQL中仅支持上面提到的几个数据类型。

| RAWTOHEX 输入     | ORACLE           | GreatSQL                                                                     |
| ----------------- | ---------------- | ---------------------------------------------------------------------------- |
| RAWTOHEX(1)       | C102             | ERROR 3064 (HY000): Incorrect type for argument args 0 in function rawtohex. |
| RAWTOHEX(sysdate) | E7070B06081C2300 | ERROR 3064 (HY000): Incorrect type for argument args 0 in function rawtohex. |


本函数在只允许用于存储程序的语句中时与在可以独立执行的SQL语句中时的工作方式不同。前者在函数转换为十六进制值之前执行隐式转换，这可能会导致本函数在不同场景返回不同的值。例如：
```sql
DECLARE
  a varchar2(8);
BEGIN
  a := rawtohex('AB');
  SELECT a;
  SELECT RAWTOHEX('AB') INTO a FROM DUAL;
  SELECT a;
END;
```
输出结果为：
```sql
+------+
| a    |
+------+
| AB   |
+------+
1 row in set (0.00 sec)

+------+
| a    |
+------+
| 4142 |
+------+
1 row in set (0.00 sec)
```

产生差异的原因是在只允许用于存储程序的语句中时将'AB'隐式转换为`RAW`类型（即将 'AB' 视为等于 0xAB 的单个字节），然后再传递给 `RAWTOHEX()` 进行转换，所以返回字符串 'AB'。然而，在可以独立执行的 SQL 语句中时并没有进行这种隐式转换，此时 'AB' 已经是 2 字节的 RAW，所以返回 4142。

## 4. 示例

```
greatsql> SELECT RAWTOHEX(NULL) FROM DUAL;
+----------------+
| RAWTOHEX(NULL) |
+----------------+
| NULL           |
+----------------+

greatsql> SELECT RAWTOHEX('A') FROM DUAL;
+---------------+
| RAWTOHEX('A') |
+---------------+
| 41            |
+---------------+

greatsql> SELECT RAWTOHEX(UNHEX('A')) FROM DUAL;
+----------------------+
| RAWTOHEX(UNHEX('A')) |
+----------------------+
| 0A                   |
+----------------------+
```



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../../greatsql-wx.jpg)
