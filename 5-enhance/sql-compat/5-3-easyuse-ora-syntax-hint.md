# Oracle兼容-语法-Oracle HINT
---
[toc]


## 1. 语法

在SQL语句中，`HINT` 语法采用 `/*+ ... */` 包含起来，有以下几种不同用法。

- 1. 在DML语句的前部

```sql
SELECT /*+ hint_name */ ...
INSERT /*+ hint_name */ ...
UPDATE /*+ hint_name */ ...
DELETE /*+ hint_name */ ...
REPLACE /*+ hint_name */ ...
```

- 2. 在查询块的前部
```sql
(SELECT /*+ hint_name */ ... )
(SELECT ... ) UNION (SELECT /*+ hint_name */ ... )
(SELECT /*+ hint_name */ ... ) UNION (SELECT /*+ hint_name */ ... )
UPDATE ... WHERE x IN (SELECT /*+ hint_name */ ...)
INSERT ... SELECT /*+ hint_name */ ...
```

- 3. 在 `EXPLAIN` 里
```sql
EXPLAIN SELECT /*+ hint_name */ ...
EXPLAIN UPDATE ... WHERE x IN (SELECT /*+ hint_name */ ...)
```

## 2. 定义和用法

在GreatSQL中支持数个Oracle风格的HINT语法。

|序号    | GreatSQL                   | Oracle                                    |
| ---- | -------------------------- | ----------------------------------------- |
| 1    | HASH_JOIN, NO_HASH_JOIN   | USE_HASH(TABLE),NO_USE_HASH               |
| 2    | INDEX, NO_INDEX           | INDEX(TABLE INDEX_NAME), NO_INDEX         |
| 3    | INDEX_MERGE                | ADD_EQUAL TABLE INDEX_NAM1,INDEX_NAM2,... |
| 4    | JOIN_INDEX, NO_JOIN_INDEX | INDEX_JOIN(TABLE INDEX_NAME)              |
| 5    | JOIN_PREFIX                | LEADING(TABLE)                            |
| 6    | MERGE, NO_MERGE            | MERGE(TABLE), NO_MERGE(TABLE)           |
| 7    | ORDER_INDEX                | INDEX_ASC(TABLE INDEX_NAME)               |
| 8    | SEMIJOIN, NO_SEMIJOIN     | SEMIJOIN, NO_SEMIJOIN                     |
| 9    | SKIP_SCAN, NO_SKIP_SCAN   | INDEX_SS, NO_INDEX_SS                     |


GreatSQL与Oracle同名对应 `HINT` 有序号 2（`INDEX`、`NO_INDEX`）、6（`MERGE`、`NO_MERGE`）、8（`SEMIJOIN`、`NO_SEMIJOIN`）三个，其余的名字虽然不同或接近，但功能是一样的。

## 3. 示例

### 3.1 构造测试环境

- 1. 初始化测试表

```sql
greatsql> CREATE TABLE t0 (
  c1 BIGINT NOT NULL AUTO_INCREMENT,
  c2 VARCHAR(500) DEFAULT NULL,
  c3 VARCHAR(500) DEFAULT NULL,
  c4 VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (c1),
  KEY idx1 (c1),
  KEY idx2 (c2),
  KEY idx3 (c3),
  KEY idx4 (c4)
) ENGINE=InnoDB;
```

- 2. 创建随机字符串函数用于生成测试数据

```sql
greatsql> DELIMITER //
greatsql> CREATE FUNCTION `randStr`(n INT) RETURNS VARCHAR(255) CHARSET utf8mb4
 DETERMINISTIC
 BEGIN
 DECLARE chars_str varchar(100) DEFAULT 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
 DECLARE return_str VARCHAR(255) DEFAULT '';
 DECLARE i INT DEFAULT 0;

 WHILE i < n DO
  SET return_str = concat(return_str, substring(chars_str, FLOOR(1 + RAND() * 62), 1));
  SET i = i + 1;
 END WHILE;

 RETURN return_str;
 END; //
```

- 3. 创建填充测试数据存储过程

```sql
greatsql> DELIMITER //
greatsql> CREATE PROCEDURE `fill_t0`(IN n INT)  
BEGIN    
  DECLARE i INT DEFAULT 1;  

  WHILE (i <= n ) DO  
    INSERT INTO t0 (c2,c3,c4) VALUES(ROUND(RAND() * 5444000000000 + 0), randStr(ROUND(RAND() * 8 + 8)), randStr(ROUND(RAND() * 10 + 10))); 
    set i=i+1;  
  END WHILE;   
END; //

greatsql> DELIMITER ;
```

- 4. 填充测试数据

```sql
greatsql> CALL fill_t0(10000);
```

- 5. 建测试测试表t1,t2,t3,并插入数据

```sql
greatsql> CREATE TABLE t1 (t1_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, t1_val INT UNSIGNED, t1_str VARCHAR(300));
greatsql> CREATE TABLE t2 (t2_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, t2_val INT UNSIGNED, t2_str VARCHAR(300));
greatsql> CREATE TABLE t3 (t3_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, t3_val INT UNSIGNED, t3_str VARCHAR(300));

greatsql> SET SESSION cte_max_recursion_depth = 10000;

greatsql> INSERT INTO t1 (t1_val) WITH RECURSIVE digits(i) AS (SELECT 1 UNION ALL SELECT i+1 FROM digits WHERE i<10000) SELECT FLOOR(RAND()*100) FROM digits;
greatsql> INSERT INTO t2 (t2_val) WITH RECURSIVE digits(i) AS (SELECT 1 UNION ALL SELECT i+1 FROM digits WHERE i<10000) SELECT FLOOR(RAND()*100) FROM digits;
greatsql> INSERT INTO t3 (t3_val) WITH RECURSIVE digits(i) AS (SELECT 1 UNION ALL SELECT i+1 FROM digits WHERE i<10000) SELECT FLOOR(RAND()*50) FROM digits;

greatsql> CREATE INDEX idx_t3_val ON t3(t3_val);
```


### 3.2 测试用例

- 1. `INDEX_MERGE` 对应 `ADD_EQUAL`

说明：通过对比执行计划结果中的相关信息可知是否有效，如：`"key": "union(idx2,idx3,idx4)"`。

```sql
greatsql> EXPLAIN FORMAT=JSON SELECT * FROM t0 WHERE c2='1' OR c3='SCBd' OR c4='dafeiiEIGWJdfsdfsdfI'\G
...
      "access_type": "index_merge",
      "possible_keys": [
        "idx2",
        "idx3",
        "idx4"
      ],
      "key": "union(idx2,idx3,idx4)",
      "key_length": "2003,2003,2003",
      "rows_examined_per_scan": 3,
      "rows_produced_per_join": 3,
      "filtered": "100.00",
...

greatsql> EXPLAIN FORMAT=JSON SELECT /*+ INDEX_MERGE(idx2,idx3,idx4) */ * FROM t0 WHERE c2='1' OR c3='SCBd' OR c4='dafeiiEIGWJdfsdfsdfI'\G 
...
      "access_type": "index_merge",
      "possible_keys": [
        "idx2",
        "idx3",
        "idx4"
      ],
      "key": "union(idx2,idx3,idx4)",
      "key_length": "2003,2003,2003",
      "rows_examined_per_scan": 3,
      "rows_produced_per_join": 3,
      "filtered": "100.00",
...

greatsql> EXPLAIN FORMAT=JSON SELECT /*+ ADD_EQUAL(idx2,idx3,idx4) */ * FROM t0 WHERE c2='1' OR c3='SCBd' OR c4='dafeiiEIGWJdfsdfsdfI'\G
...
      "access_type": "index_merge",
      "possible_keys": [
        "idx2",
        "idx3",
        "idx4"
      ],
      "key": "union(idx2,idx3,idx4)",
      "key_length": "2003,2003,2003",
      "rows_examined_per_scan": 3,
      "rows_produced_per_join": 3,
      "filtered": "100.00",
...
```

- 2. `JOIN_INDEX` 对应 `INDEX_JOIN` 

说明：通过对比执行计划结果中的相关信息可知是否有效，如：`possible_keys` 和 `key`。

```sql
greatsql> EXPLAIN PLAN FOR SELECT * FROM t0 WHERE c2='1593923265629';
+----+-------------+-------+------------+------+---------------+------+---------+-------+------+----------+-------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref   | rows | filtered | Extra |
+----+-------------+-------+------------+------+---------------+------+---------+-------+------+----------+-------+
|  1 | SIMPLE      | t0    | NULL       | ref  | idx2          | idx2 | 2003    | const |    1 |   100.00 | NULL  |
+----+-------------+-------+------------+------+---------------+------+---------+-------+------+----------+-------+

greatsql> EXPLAIN PLAN FOR SELECT /*+ JOIN_INDEX(t0 idx2) */ * FROM t0 WHERE c2='1593923265629'; 
+----+-------------+-------+------------+------+---------------+------+---------+-------+------+----------+-------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref   | rows | filtered | Extra |
+----+-------------+-------+------------+------+---------------+------+---------+-------+------+----------+-------+
|  1 | SIMPLE      | t0    | NULL       | ref  | idx2          | idx2 | 2003    | const |    1 |   100.00 | NULL  |
+----+-------------+-------+------------+------+---------------+------+---------+-------+------+----------+-------+

greatsql> EXPLAIN PLAN FOR SELECT /*+ NO_JOIN_INDEX(t0 idx2) */ * FROM t0 WHERE c2='1593923265629'; 
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra       |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------------+
|  1 | SIMPLE      | t0    | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 9834 |     0.01 | Using where |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------------+

greatsql> EXPLAIN PLAN FOR SELECT /*+ INDEX_JOIN(t0 idx2) */ * FROM t0 WHERE c2='1593923265629'; 
+----+-------------+-------+------------+------+---------------+------+---------+-------+------+----------+-------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref   | rows | filtered | Extra |
+----+-------------+-------+------------+------+---------------+------+---------+-------+------+----------+-------+
|  1 | SIMPLE      | t0    | NULL       | ref  | idx2          | idx2 | 2003    | const |    1 |   100.00 | NULL  |
+----+-------------+-------+------------+------+---------------+------+---------+-------+------+----------+-------+
```

- 3. `JOIN_PREFIX` 对应 `LEADING(TABLE)`

说明：通过对比执行计划结果中的相关信息可知是否有效，如：`Table scan on t3 (cost=1005.00 rows=10000)`。

```sql
greatsql> EXPLAIN FORMAT=tree SELECT * FROM t1, t2,t3 WHERE t2.t2_val=t1.t1_val AND t1.t1_val=t3.t3_val\G
*************************** 1. row ***************************
EXPLAIN: -> Nested loop inner join  (cost=360001029.65 rows=2000000030)
    -> Inner hash join (t2.t2_val = t1.t1_val)  (cost=10001024.44 rows=10000000)
        -> Table scan on t2  (cost=0.01 rows=10000)
        -> Hash
            -> Filter: (t1.t1_val is not null)  (cost=1005.00 rows=10000)
                -> Table scan on t1  (cost=1005.00 rows=10000)
    -> Index lookup on t3 using idx_t3_val (t3_val=t1.t1_val)  (cost=15.00 rows=200)

greatsql> EXPLAIN FORMAT=tree SELECT /*+ JOIN_PREFIX(t3) */ * FROM t1, t2,t3 WHERE t2.t2_val=t1.t1_val AND t1.t1_val=t3.t3_val\G
*************************** 1. row ***************************
EXPLAIN: -> Inner hash join (t2.t2_val = t3.t3_val)  (cost=10010030050.94 rows=10000000298)
    -> Table scan on t2  (cost=0.00 rows=10000)
    -> Hash
        -> Inner hash join (t1.t1_val = t3.t3_val)  (cost=10001024.44 rows=10000000)
            -> Table scan on t1  (cost=0.01 rows=10000)
            -> Hash
                -> Table scan on t3  (cost=1005.00 rows=10000)

greatsql> EXPLAIN FORMAT=tree SELECT /*+ LEADING(t3) */ * FROM t1, t2,t3 WHERE t2.t2_val=t1.t1_val AND t1.t1_val=t3.t3_val\G
*************************** 1. row ***************************
EXPLAIN: -> Inner hash join (t2.t2_val = t3.t3_val)  (cost=10010030050.94 rows=10000000298)
    -> Table scan on t2  (cost=0.00 rows=10000)
    -> Hash
        -> Inner hash join (t1.t1_val = t3.t3_val)  (cost=10001024.44 rows=10000000)
            -> Table scan on t1  (cost=0.01 rows=10000)
            -> Hash
                -> Table scan on t3  (cost=1005.00 rows=10000)
```

- 4. `ORDER_INDEX` 对应 `INDEX_ASC(TABLE INDEX_NAME)`

说明：通过对比执行计划结果中的相关信息可知是否有效，如：`possible_keys` 和 `key`。

```sql
greatsql> EXPLAIN SELECT * FROM t0 WHERE c2='1593923265629' AND c3='asdfaldsjdfSDFASD' ORDER BY c1; 
+----+-------------+-------+------------+------+---------------+------+---------+-------+------+----------+-------------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref   | rows | filtered | Extra       |
+----+-------------+-------+------------+------+---------------+------+---------+-------+------+----------+-------------+
|  1 | SIMPLE      | t0    | NULL       | ref  | idx2,idx3     | idx2 | 2003    | const |    1 |     5.00 | Using where |
+----+-------------+-------+------------+------+---------------+------+---------+-------+------+----------+-------------+

greatsql> EXPLAIN SELECT /*+ ORDER_INDEX(t0 idx3,idx2) */ * FROM t0 WHERE c2='1593923265629' AND c3='asdfaldsjdfSDFASD' ORDER BY c1;
+----+-------------+-------+------------+------+---------------+------+---------+------+-------+----------+-----------------------------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows  | filtered | Extra                       |
+----+-------------+-------+------------+------+---------------+------+---------+------+-------+----------+-----------------------------+
|  1 | SIMPLE      | t0    | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 10095 |     0.01 | Using where; Using filesort |
+----+-------------+-------+------------+------+---------------+------+---------+------+-------+----------+-----------------------------+

greatsql> EXPLAIN SELECT /*+ ORDER_INDEX(t0 idx1,idx2) */ * FROM t0 WHERE c2='1593923265629' AND c3='asdfaldsjdfSDFASD' ORDER BY c1;
+----+-------------+-------+------------+-------+---------------+------+---------+------+-------+----------+-------------+
| id | select_type | table | partitions | type  | possible_keys | key  | key_len | ref  | rows  | filtered | Extra       |
+----+-------------+-------+------------+-------+---------------+------+---------+------+-------+----------+-------------+
|  1 | SIMPLE      | t0    | NULL       | index | NULL          | idx1 | 8       | NULL | 10095 |     1.00 | Using where |
+----+-------------+-------+------------+-------+---------------+------+---------+------+-------+----------+-------------+

greatsql> EXPLAIN SELECT /*+ INDEX_ASC(t0 idx1,idx2) */ * FROM t0 WHERE c2='1593923265629' AND c3='asdfaldsjdfSDFASD' ORDER BY c1;
+----+-------------+-------+------------+-------+---------------+------+---------+------+-------+----------+-------------+
| id | select_type | table | partitions | type  | possible_keys | key  | key_len | ref  | rows  | filtered | Extra       |
+----+-------------+-------+------------+-------+---------------+------+---------+------+-------+----------+-------------+
|  1 | SIMPLE      | t0    | NULL       | index | NULL          | idx1 | 8       | NULL | 10095 |     1.00 | Using where |
+----+-------------+-------+------------+-------+---------------+------+---------+------+-------+----------+-------------+
```



**问题反馈**
---
- [问题反馈 gitee](https://gitee.com/GreatSQL/GreatSQL-Manual/issues)


**联系我们**
---

扫码关注微信公众号

![greatsql-wx](../greatsql-wx.jpg)
