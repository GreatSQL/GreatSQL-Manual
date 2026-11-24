# High Compatibility (Oracle Compatible)
---

GreatSQL is 100% fully compatible with MySQL and Percona usage, and supports most common Oracle usage, including [Data Type Compatibility](#data-type-compatibility), [Function Compatibility](#function-compatibility), [SQL Syntax Compatibility](#sql-syntax-compatibility), [Stored Routine Compatibility](#stored-routine-compatibility), and many other compatible extension usages.

## Overview of Oracle Compatibility Design

The priority principles of GreatSQL's Oracle compatibility handling are as follows:
- GreatSQL-style SQL and stored routines can work directly in the default SQL MODE.
- Oracle compatibility features that do **not conflict** with GreatSQL-style SQL and stored routines can also work directly in the default SQL MODE.
- Features that have **syntax or semantic conflicts** with GreatSQL-style SQL and stored routines require the user to explicitly switch to Oracle MODE before they can work.

GreatSQL's Oracle compatibility is mainly implemented through the following three different approaches:
- Native mode: Oracle and GreatSQL both support or partially support common SQL standards. For some simple statements, compatibility is achieved without any adjustment.
- Compatible extension: For some functions and syntax that are unique to Oracle, GreatSQL implements extensions at the GreatSQL Server layer, such as `MERGE INTO` and `CONNECT BY`. These types of compatibility features can be used directly without setting an additional SQL MODE.
- Compatible mode: Setting `SET sql_mode = ORACLE;` in GreatSQL switches the current session to Oracle compatible mode. In this mode, when Oracle syntax conflicts with GreatSQL syntax in syntax or semantics, GreatSQL automatically chooses the Oracle compatible mode.

For more information about the Oracle compatible mode, please see the document: [Oracle mode](./sql-compat/5-3-easyuse-ora-syntax-oraclemode.md).

## Data Type Compatibility

In GreatSQL, data type compatibility is implemented through mapping, which belongs to the **extended compatibility (no need to set `sql_mode`)** approach. The specific implementation method is simple aliasing, i.e., replacing keywords at the parsing stage. For example, if a table created with CLOB is used, it will be converted to LONGTEXT in the system.

The specific mappings implemented include:

| Oracle type    | GreatSQL type | Compatibility level |
| ----------- | --------- | ---- |
| CLOB        | LONGTEXT  | Simple alias |
| NUMBER      | DECIMAL   | Simple alias |
| VARCHAR2    | VARCHAR   | Simple alias |
| PLS_INTEGER | INT       | Simple alias |

Example:

```sql
greatsql> CREATE TABLE t1(
id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, 
c1 CLOB NOT NULL DEFAULT '', 
c2 VARCHAR2(30) NOT NULL DEFAULT '');
ERROR 1101 (42000): BLOB, TEXT, GEOMETRY or JSON column 'c1' can't have a default value

greatsql> CREATE TABLE t1(
id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, 
c1 CLOB NOT NULL, 
c2 VARCHAR2(30) NOT NULL DEFAULT '');
Query OK, 0 rows affected (0.25 sec)

greatsql> SHOW CREATE TABLE t1\G
*************************** 1. row ***************************
       Table: t1
Create Table: CREATE TABLE `t1` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `c1` longtext NOT NULL,
  `c2` varchar(30) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
1 row in set (0.01 sec)
```

For more details, please refer to [Data Type Compatibility](./sql-compat/5-3-easyuse-ora-datatypes.md).

## SQL Syntax Compatibility

### SQL Syntax Supported by Extended Compatibility

The following SQL syntax is supported in GreatSQL without setting `sql_mode = ORACLE`:
- [ANY, ALL](./sql-compat/5-3-easyuse-ora-syntax-any-all.md)
- [CREATE FORCE VIEW](./sql-compat/5-3-easyuse-ora-syntax-createforceview.md)
- [Hierarchical Query](./sql-compat/5-3-easyuse-ora-syntax-hierarchical-query.md)
- [DATETIME INTERVAL](./sql-compat/5-3-easyuse-ora-syntax-datetime-interval.md)
- [EXECUTE IMMEDIATE](./sql-compat/5-3-easyuse-ora-syntax-execute-immediate.md)
- [EXPLAIN PLAN FOR](./sql-compat/5-3-easyuse-ora-syntax-explain-plan-for.md)
- [EXTERNAL TABLE](./sql-compat/5-3-easyuse-ora-syntax-external-table.md)
- [FULL JOIN](./sql-compat/5-3-easyuse-ora-syntax-full-join.md)
- [INSERT ALL INTO](./sql-compat/5-3-easyuse-ora-syntax-insert-all.md)
- [KEEP FIRST/LAST](./sql-compat/5-3-easyuse-ora-syntax-keep.md)
- [MERGE INTO](./sql-compat/5-3-easyuse-ora-syntax-merge-into.md)
- [MINUS](./sql-compat/5-3-easyuse-ora-syntax-minus.md)
- [ORACLE HINT](./sql-compat/5-3-easyuse-ora-syntax-hint.md)
- [ROWNUM](./sql-compat/5-3-easyuse-ora-syntax-rownum.md)
- [SELECT...FOR UPDATE OF COLUMNS](./sql-compat/5-3-easyuse-ora-syntax-forupdate-ofcolumn.md)
- [SELECT...OFFSET...FETCH](./sql-compat/5-3-easyuse-ora-syntax-offset-fetch.md)
- [SEQUENCE](./sql-compat/5-3-easyuse-ora-syntax-sequence.md)
- [(+) Outer Join](./sql-compat/5-3-easyuse-ora-syntax-oracle-plus.md)
- [Subquery Without Alias](./sql-compat/5-3-easyuse-ora-syntax-subquery-without-alias.md)
- [Empty String '' Equivalent to NULL Switch](./sql-compat/5-3-easyuse-ora-syntax-empstr-equal-null.md)
- [Setting CURRENT_TIMESTAMP as the Default Value for String Columns](./sql-compat/5-3-easyuse-ora-syntax-default-val-curtime.md)
- [Removing a Specified sql_mode](./sql-compat/5-3-easyuse-ora-syntax-shrinkmode.md)
- More ...

### SQL Syntax Supported in Compatible Mode

The following SQL syntax is supported in GreatSQL only after setting `sql_mode = ORACLE`:

- [CREATE TYPE](./sql-compat/5-3-easyuse-ora-syntax-create-type.md)
- [CREATE TABLE OF TYPE](./sql-compat/5-3-easyuse-ora-syntax-table-oftype.md)
- [DATETIME Arithmetic Operations](./sql-compat/5-3-easyuse-ora-syntax-datetime-arithmetic.md)
- [DELETE Statement Without FROM](./sql-compat/5-3-easyuse-ora-syntax-delete-without-from.md)
- [EXEC](./sql-compat/5-3-easyuse-ora-syntax-oracle-exec.md)
- [ORDER BY Compatibility](./sql-compat/5-3-easyuse-ora-syntax-order-by.md)
- [PIVOT](./sql-compat/5-3-easyuse-ora-syntax-pivot.md)
- [RATIO_TO_REPORT](./sql-compat/5-3-easyuse-ora-syntax-ratiotoreport.md)
- [SELECT...FOR UPDATE WAIT N](./sql-compat/5-3-easyuse-ora-syntax-forupdate-waitn.md)
- [SQLCODE_SQLERRM_FUNCTION](./sql-compat/5-3-easyuse-ora-func-sqlcode-sqlerrm.md)
- [SYSDATE_IS_NOW Mode](./sql-compat/5-3-easyuse-ora-syntax-sysdateisnow.md)
- [TABLE FUNCTION](./sql-compat/5-3-easyuse-ora-syntax-table-func.md)
- [TABLE UDT](./sql-compat/5-3-easyuse-ora-syntax-table-udt.md)
- [UPDATE SET Multi-Field Update](./sql-compat/5-3-easyuse-ora-syntax-update-set.md)
- [WITH FUNCTION](./sql-compat/5-3-easyuse-ora-syntax-with-func.md)
- [Global Temporary Table](./sql-compat/5-3-easyuse-ora-syntax-global-temptable.md)
- [Creating Stored Procedures with Double Quotes](./sql-compat/5-3-easyuse-ora-syntax-psname-quotes.md)
- [Oracle Comment Style](./sql-compat/5-3-easyuse-ora-syntax-oracle-comment.md)
- [NULL Treated as the Same Value in Indexes](./sql-compat/5-3-easyuse-ora-syntax-oraclemode-nullequal.md)
- More ...

## Function Compatibility

### Functions Supported by Extended Compatibility

The following functions are supported in GreatSQL without setting `sql_mode = ORACLE`:
- [ADD_MONTHS](./sql-compat/5-3-easyuse-ora-func-addmonths.md)
- [CAST](./sql-compat/5-3-easyuse-ora-func-cast.md)
- [CHR](./sql-compat/5-3-easyuse-ora-func-chr.md)
- [CURRENT_TIMESTAMP](./sql-compat/5-3-easyuse-ora-func-currenttimestamp.md)
- [DECODE](./sql-compat/5-3-easyuse-ora-func-decode.md)
- [DUMP](./sql-compat/5-3-easyuse-ora-func-dump.md)
- [INITCAP](./sql-compat/5-3-easyuse-ora-func-initcap.md)
- [INSTRB](./sql-compat/5-3-easyuse-ora-func-instrb.md)
- [LENGTHB](./sql-compat/5-3-easyuse-ora-func-lengthb.md)
- [LIST_AGG](./sql-compat/5-3-easyuse-ora-func-listagg.md)
- [MONTHS_BETWEEN](./sql-compat/5-3-easyuse-ora-func-monthsbetween.md)
- [NCHR](./sql-compat/5-3-easyuse-ora-func-nchr.md)
- [NVL](./sql-compat/5-3-easyuse-ora-func-nvl.md)
- [NVL2](./sql-compat/5-3-easyuse-ora-func-nvl2.md)
- [RAWTOHEX](./sql-compat/5-3-easyuse-ora-func-rawtohex.md)
- [REGEXP_COUNT](./sql-compat/5-3-easyuse-ora-func-regexpcount.md)
- [REGEXP_REPLACE](./sql-compat/5-3-easyuse-ora-func-regexpreplace.md)
- [REPLACE](./sql-compat/5-3-easyuse-ora-func-replace.md)
- [SUBSTRB](./sql-compat/5-3-easyuse-ora-func-substrb.md)
- [SYS_GUID](./sql-compat/5-3-easyuse-ora-func-sysguid.md)
- [SYSTIMESTAMP](./sql-compat/5-3-easyuse-ora-func-systimestamp.md)
- [TO_CHAR](./sql-compat/5-3-easyuse-ora-func-tochar.md)
- [TO_CLOB](./sql-compat/5-3-easyuse-ora-func-toclob.md)
- [TO_DATE](./sql-compat/5-3-easyuse-ora-func-todate.md)
- [TO_NUMBER](./sql-compat/5-3-easyuse-ora-func-tonumber.md)
- [TO_TIMESTAMP](./sql-compat/5-3-easyuse-ora-func-totimestamp.md)
- [TRANSLATE](./sql-compat/5-3-easyuse-ora-func-translate.md)
- [TRUNC](./sql-compat/5-3-easyuse-ora-func-trunc.md)
- [VSIZE](./sql-compat/5-3-easyuse-ora-func-vsize.md)
- [WM_CONCAT](./sql-compat/5-3-easyuse-ora-func-wmconcat.md)
- More ...

### Functions Supported in Compatible Mode

The following functions are supported in GreatSQL only after setting `sql_mode = ORACLE`:

- [INSTR](./sql-compat/5-3-easyuse-ora-func-instr.md)
- [LENGTH](./sql-compat/5-3-easyuse-ora-func-length.md)
- [LPAD](./sql-compat/5-3-easyuse-ora-func-lpad.md)
- [RPAD](./sql-compat/5-3-easyuse-ora-func-rpad.md)
- [SUBSTR](./sql-compat/5-3-easyuse-ora-func-substr.md)
- [SYSDATE](./sql-compat/5-3-easyuse-ora-func-sysdate.md)
- [TRIM/LTRIM/RTRIM](./sql-compat/5-3-easyuse-ora-func-trim.md)
- More ...

**Note**: After setting `sql_mode = ORACLE`, the behavior of the above functions becomes closer to Oracle; otherwise, the native GreatSQL behavior is maintained.

## Stored Routine Compatibility

GreatSQL supports Oracle-style stored routine usage. Some stored routines have undergone basic structural modifications in `ORACLE` mode. For details, see: [Stored Routine Basic Structural Modifications](./sql-compat/5-3-easyuse-ora-sp-basic-constructs.md).

### Stored Routines Supported by Extended Compatibility

In GreatSQL, regardless of whether `sql_mode` is *DEFAULT* or *ORACLE*, the [CREATE OR REPLACE extension](./sql-compat/5-3-easyuse-ora-sp-create-or-replace.md) is supported, but the behavior differs in different modes.

### Stored Routines Supported in Compatible Mode

The following Oracle-compatible stored routine usages require setting `sql_mode = ORACLE` first (some usages are also supported in `sql_mode = DEFAULT` mode, but do not have Oracle compatibility features):
- [BULK COLLECT](./sql-compat/5-3-easyuse-ora-sp-bulk-collect.md)
- [CONTINUE](./sql-compat/5-3-easyuse-ora-sp-continue.md)
- [CURSOR](./sql-compat/5-3-easyuse-ora-sp-cursor.md)
- [EXIT/EXIT WHEN](./sql-compat/5-3-easyuse-ora-sp-exit-when.md)
- [FORALL LOOP](./sql-compat/5-3-easyuse-ora-sp-forall-loop.md)
- [FOR LOOP](./sql-compat/5-3-easyuse-ora-sp-for-loop.md)
- [GOTO](./sql-compat/5-3-easyuse-ora-sp-goto-label.md)
- [IF .. ELSIF](./sql-compat/5-3-easyuse-ora-sp-if.md)
- [REF CURSOR, SYS_REFCURSOR](./sql-compat/5-3-easyuse-ora-sp-ref-cursor.md)
- [TRIGGER](./sql-compat/5-3-easyuse-ora-sp-trigger.md)
- [TYPE IS RECORD](./sql-compat/5-3-easyuse-ora-sp-record-type.md)
- [TYPE IS TABLE](./sql-compat/5-3-easyuse-ora-sp-table-type.md)
- [VAR_TYPE](./sql-compat/5-3-easyuse-ora-sp-var-type.md)
- [WHILE...LOOP... END LOOP](./sql-compat/5-3-easyuse-ora-sp-while.md)
- [Anonymous Block](./sql-compat/5-3-easyuse-ora-sp-anony-block.md)
- [Named Notation for Passing Parameters](./sql-compat/5-3-easyuse-ora-sp-named-parameters.md)
- [Stored Routines Supporting Default Parameters (DEFAULT)](./sql-compat/5-3-easyuse-ora-sp-default-optval.md)
- [Stored Procedures Supporting RETURN](./sql-compat/5-3-easyuse-ora-sp-return.md)
- [Exception Handling EXCEPTION HANDLER](./sql-compat/5-3-easyuse-ora-sp-exception-handler.md)
- More ...

Example:

- Stored routine usage in the Oracle environment:

```sql
CREATE OR REPLACE EDITIONABLE FUNCTION f0(delta INT DEFAULT 0) RETURN TIMESTAMP AS
    cnt INT := 10;
BEGIN
    RETURN SYSDATE + delta*cnt;
END;

SELECT f0(2) FROM DUAL ;
SELECT f0() FROM DUAL ;
```

- Stored routine usage in GreatSQL **native mode**:

```sql
CREATE OR REPLACE FUNCTION f1(delta INT) RETURNS TIMESTAMP
BEGIN
    DECLARE cnt INT DEFAULT 10;
    SET delta = cnt * delta;
    RETURN DATE_ADD(SYSDATE(), INTERVAL delta DAY);
END;

SELECT f0(2) FROM DUAL ;
```

- Stored routine usage in GreatSQL **compatible mode**:

```sql
SET sql_mode = ORACLE;

CREATE OR REPLACE FUNCTION f0(delta INT DEFAULT 0) RETURN TIMESTAMP AS
    cnt INT := 10;
BEGIN
    RETURN SYSDATE + delta*cnt;
END;

SELECT f0(2) FROM DUAL ;
SELECT f0() FROM DUAL ;
```

For common questions about Oracle compatibility, see: [Oracle Compatibility FAQ](./5-3-sql-compat-faq.md).

**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
