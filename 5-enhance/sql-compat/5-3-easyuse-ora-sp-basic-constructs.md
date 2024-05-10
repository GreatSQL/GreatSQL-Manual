# Oracle兼容-存储过程-基础结构改造说明
---



GreatSQL支持Oracle风格的存储过程使用方式，部分存储过程/函数部分在 `ORACLE` 模式下做了基础结构改造，主要包括以下几点。

## 1. 以 `AS/IS` 关键词来标记函数体的开始

要求创建存储过程（`PROCEDURE`）或存储函数（ `FUNCTION`）时，使用 `AS` 或 `IS` 关键词来标记函数体的开始。如下例所示：

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

-- CREATE FUNCTION
greatsql> CREATE OR REPLACE FUNCTION f1() RETURN NUMBER
AS
BEGIN
  RETURN 3306;
END; //

-- CREATE PROCEDURE
greatsql> CREATE OR REPLACE PROCEDURE p1()
AS
BEGIN
  SELECT 3306;
END; //

greatsql> SELECT f1() //
+------+
| f1() |
+------+
| 3306 |
+------+

greatsql> CALL p1() //
+------+
| 3306 |
+------+
| 3306 |
+------+
```

## 2. 变量声明

在 `DEFAULT` 模式下，存储过程/函数变量声明是放在 `BEGIN ... END` 语句块之间的，每个语句块可以包含多条 `DECLARE` 语句。如下例所示：

```sql
greatsql> SET sql_mode = DEFAULT;
greatsql> DELIMITER //

-- CREATE PROCEDURE
greatsql> CREATE OR REPLACE PROCEDURE p1()
BEGIN
  DECLARE a INT;
  DECLARE b VARCHAR(10);
  SET a = 3306;
  
  SELECT a;
END; //

greatsql> CALL p1() //
+------+
| a    |
+------+
| 3306 |
+------+
```

当切换到 `ORACLE` 模式下，有以下几点要注意的：

- 1、在作为存储函数/过程的变量声明时，`VARCHAR/VARCHAR2` 等数据类型变量时需要指定字符串长度，这点与在 `DEFAULT` 模式下要求一样。但在作为存储函数/过程的参数或函数的返回值类型时，则不需要指定其最大长度。

  - 1. 最大可用长度取决于 `character_set_server` 选项指定的字符集，长度计算规则为：`65535 / 字符集的maxlen值`，结果向下取整。例如：当 `character_set_server = utf8mb4`时，`VARCHAR/VARCHAR2` 类型的最大可用长度为：`65535 / 4 = 16383`。

  - 2. 数据类型 `VARBINARY` 和使用 `national` 字符集的类型 `NCHAR/NVARCHAR` 同理。`VARBINARY` 使用的是 `binary` 字符集，所以最大长度为 65535，而 `national` 字符集为 `utf8`，所以最大长度为（65535/3=）21845。

几个示例：

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

-- 作为返回类型时，无需指定长度；作为变量时必须指定长度
-- CREATE PROCEDURE
greatsql> CREATE OR REPLACE FUNCTION f(str VARCHAR) RETURN VARCHAR
AS
  x VARCHAR(16383);
BEGIN
  x := str;
  RETURN x;
END; //

greatsql> CALL p1() //
+------+
| a    |
+------+
| 3306 |
+------+

-- CREATE FUNCTION
greatsql> CREATE OR REPLACE PROCEDURE p(str VARCHAR)
AS
  x VARCHAR(16383);
BEGIN
  x := str;
  SELECT x;
END;

greatsql> SELECT f1() //
+------+
| f1() |
+------+
| 3306 |
+------+
```

- 2、变量声明可以被放在 `BEGIN ... END` 语句块前面。变量声明为可选项，但如果已指定 `DECLARE`，则必须至少写下一条声明语句。如下例所示：

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> DECLARE 
  a INT;
  b INT;
BEGIN
  a := 3306;
  SELECT a;
END; //
+------+
| a    |
+------+
| 3306 |
+------+
```

注意：在顶层的语句块中，变量声明的部分是直接放在 `AS/IS` 关键词之后的，无 `DECLARE` 作为标记：

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1()
AS
  a INT;
  b VARCHAR(10);
BEGIN
  a := 3306;
  SELECT a;
END;

greatsql> CALL p1() //
+------+
| a    |
+------+
| 3306 |
+------+
```

- 3、支持用 `:=` 的方式为声明的变量赋初始值

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> DECLARE 
  a INT := 3306;
BEGIN
  SELECT a;
END; //
+------+
| a    |
+------+
| 3306 |
+------+
```

- 4、游标（`CURSOR`）声明时需要加上 `IS` 关键字

在 `DEFAULT` 模式下，`CURSOR` 的声明方式如下例：

```sql
DECLARE c1 CURSOR FOR SELECT * FROM t1;
```

在 `ORACLE` 模式下，`CURSOR` 的声明方式如下例：

```sql
CURSOR c1 IS SELECT * FROM t1;
```

## 3. 参数 `IN/OUT` 标记方式不同

在 `DEFAULT` 模式下，存储过程参数的标记方式为: `IN/OUT/INOUT`, 例如:

```sql
greatsql> SET sql_mode = DEFAULT;
greatsql> DELIMITER //

CREATE OR REPLACE PROCEDURE p1(IN a INT, INOUT b INT, OUT c INT)
BEGIN
  SET b = a + b;
  SET c = a + b;
  SELECT a, b, c;
END; //

greatsql> SELECT 1,3,5 INTO @a,@b,@c //

greatsql> CALL p1(@a, @b, @c) //
+------+------+------+
| a    | b    | c    |
+------+------+------+
|    1 |    4 |    5 |
+------+------+------+

greatsql> SELECT @a, @b, @c //
+------+------+------+
| @a   | @b   | @c   |
+------+------+------+
|    1 |    4 |    5 |
+------+------+------+
```

在 `ORACLE` 模式下，存储过程参数的标记方式为: `IN/OUT/IN OUT`（不是`INOUT`）, 例如:
```sql
greatsql> SET sql_mode = DEFAULT;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1(a IN INT, b IN OUT INT, c OUT INT) AS
BEGIN
  b := a + b;
  c := a + b;
  SELECT a, b, c FROM DUAL;
END;

greatsql> SELECT 1,3,5 INTO @a,@b,@c //

greatsql> CALL p1(@a, @b, @c) //
+------+------+------+
| a    | b    | c    |
+------+------+------+
|    1 |    4 |    5 |
+------+------+------+

greatsql> SELECT @a, @b, @c //
+------+------+------+
| @a   | @b   | @c   |
+------+------+------+
|    1 |    4 |    5 |
+------+------+------+
```

总结几点区别：

- 在 `DEFAULT` 模式下，采用 `INOUT` 标记输入输出参数；在 `ORACLE` 模式下，采用 `IN OUT` 标识输入输出参数。

- 不支持在存储函数（`FUNCTION`）中使用 `IN/OUT/IN OUT/INOUT` 等标识参数。

- 在 `DEFAULT` 模式下，参数标识应置于变量名之前；在 `ORACLE` 模式下，参数标记应置于变量名之后、声明类型之前。

## 4. 变量赋值方式不同

在 `ORACLE` 模式下，同时支持GreatSQL和Oracle两种不同风格的变量赋值方式，例如：

```sql
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1()
AS
  v1 INT;
  v2 INT;
BEGIN
  set v1 = 3306;  -- GreatSQL风格
  v2 := 3306;     -- Oracle风格
  SELECT v1, v2;
END; //

greatsql> CALL p1() //
+------+------+
| v1   | v2   |
+------+------+
| 3306 | 3306 |
+------+------+
```

## 5. 支持无参数存储过程或函数

在 `ORACLE` 模式下，支持不带参数的存储过程或函数，创建时可以去掉名字后的括号，例如：

```SQL
greatsql> SET sql_mode = ORACLE;
greatsql> DELIMITER //

greatsql> CREATE OR REPLACE PROCEDURE p1
AS
BEGIN
  SELECT 3306;
END; //

greatsql> CALL p1 //
+------+
| 3306 |
+------+
| 3306 |
+------+
```





- **[问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)**

- **扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
