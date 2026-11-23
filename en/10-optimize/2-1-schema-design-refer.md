# Schema Design Guidelines Reference
---

This article introduces the Schema development and design guidelines recommended to follow when using and developing business system applications based on the GreatSQL database.

## Naming Guidelines

Adopt unified naming rules and standards for database objects, making the application code more readable and easier for others to read, understand, and maintain.

The following is a reference for database object naming guidelines:
- No naming length should exceed 30 characters.
- Uniformly use one case style, i.e., either all uppercase or all lowercase, and avoid mixed case.
- Use concise and appropriate English words to express business meaning, with words separated by underscores "_".
- Object names should not start or end with an underscore "_".
- Try not to use Chinese pinyin naming.
- Try not to use pure numeric naming.
- Log business type table names should have the "log\_" prefix.
- Data archiving type table names should have the "arch\_" prefix.
- Backup purpose type table names should have the "bak\_" prefix.
- Temporary purpose type table names should have the "tmp\_" prefix.
- For object names using date and time as sharding keys, a date and time suffix can be added, for example: `trans_log_2023`.
- Reserved words and keywords should be avoided. For details, refer to: [Reserved Words & Keywords](../2-about-greatsql/7-greatsql-keywords.md).
- Use `id` as the primary key column name of tables whenever possible. If the primary key index includes multiple columns, each column should also try to include the `_id` keyword, for example: (city_id, user_id).
- Ordinary index names should have the "idx\_" prefix.
- Primary key constraints should have the "pk\+" prefix.
- Unique constraints should have the "uk\_" prefix.
- Foreign key constraints should have the "fk\_" prefix.
- Stored procedures should have the "sp\_" prefix.
- Views should have the "v\_" prefix.
- User-defined functions should have the "udf\_" prefix.
- Triggers should have the "tr\_" prefix.
- Sequences should have the "seq\_" prefix.

The following are some good naming examples:
- user_db
- users
- idx_user_id
- uk_user_id
- fk_city_id
- v_user_detail_info
- seq_user_id

## Schema Development and Design Guidelines
1. All tables use the InnoDB storage engine by default. If a non-transactional storage engine such as MyISAM is needed, the necessity must first be confirmed with the DBA.

1. Each table should have an explicitly declared primary key column. Try to use an auto-increment INT/BIGINT type as the primary key column, and this primary key column has no business purpose. The purpose of this is to avoid excessive fragmentation of InnoDB data pages caused by changes in the primary key column values when inserting, deleting, or updating data in the business.

1. Each table should try to include the `gmt_create` and `gmt_modify` columns, used to represent the **first creation time** and **last update time** of user data. The data in these two columns can also be used for more purposes later, for example, when archiving cold data after a period of time, the judgment can be made based on the `gmt_modify` time.

1. The INT data type (including BIGINT/INT/MEDIUMINT/SMALLINT/TINYINT, etc.) has relatively the best efficiency, so this type is preferred. For example, ENUM/SET can also be represented with INT; in addition, INT types should try to add the UNSIGNED convention to increase the usable range.

1. Unless really necessary, try not to use large object data types such as TEXT/BLOB/JSON.

1. Try not to use floating-point types such as FLOAT/DOUBLE. Switch to the DECIMAL type, which can improve data precision and also facilitate requirements such as verifying source-replica data consistency.

1. Every column definition should have the NOT NULL attribute.

1. Columns with the same business meaning in multiple tables must have consistent column definitions.

1. From the instance level, to the Schema (database), to tables and columns, including stored procedures, triggers, events, and all data objects, use the same character set. The default recommendation is utf8mb4, which has the best compatibility.

1. Columns that may be used for join associations must have consistent data type definitions (including character set and collation), avoiding implicit conversions.

1. Within one instance, the number of data tables (including table partitions) should usually not exceed ten thousand, and the number of data tables in each Schema (database) should usually not exceed one thousand, avoiding excessive metadata management overhead.

1. The table structure design should satisfy the third normal form requirements as much as possible, but it should not be too rigidly and mechanically executed. Instead, it should be guided by achieving the best actual business performance, appropriately storing redundant data, and reducing cross-table join queries to improve business performance. Generally speaking, appropriately redundant data does not include the following situations:
	- Long string types such as VARCHAR/CHAR;
	- Large object types such as TEXT/BLOB;
	- Frequently updated columns.




**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
