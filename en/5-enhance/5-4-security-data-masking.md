# Data Masking

Data masking helps prevent unauthorized users from accessing sensitive data, thereby limiting the exposure of sensitive data. Data masking provides a way to create versions of data without using real data, such as for demos, sales presentations, or software testing. Data masking changes data values while using the same format, making reverse engineering impossible. Data masking makes data useless externally, thereby reducing the risk of data leakage.

GreatSQL supports two data masking working modes:

- Function-based data masking;
- Policy-based data masking.

## Function-Based Data Masking

Common data masking methods include the following two types:

| Technique | Description |
| ------------ | ------------------------------------------------------------ |
| Custom string | Replaces sensitive data with a specific string, for example replacing phone numbers with XXX-XXX-XXXX |
| Data substitution | Replaces sensitive data with actual substitute values, for example replacing a city name with another name from a dictionary |

### Enabling and Disabling

#### Enabling

Execute the following commands to install the `data_masking` plugin and enable the data masking feature:

```sql
greatsql> INSTALL PLUGIN data_masking SONAME 'data_masking.so';
Query OK, 0 rows affected (0.01 sec)

greatsql> SHOW PLUGINS;
......
| data_masking                     | ACTIVE   | DAEMON             | data_masking.so | GPL     |
+----------------------------------+----------+--------------------+-----------------+---------+
```

You can see that the status of the `data_masking` plugin is *ACTIVE*, indicating that the plugin has been installed successfully.

#### Disabling

Use the `UNINSTALL PLUGIN` statement and the `DROP FUNCTION` statement to disable and uninstall the plugin, and then drop the functions, thereby disabling the data masking feature.

```sql
greatsql> UNINSTALL PLUGIN data_masking;
Query OK, 0 rows affected (0.01 sec)
```

### Using Data Masking

Data masking provides a set of functions to hide and modify content of sensitive data. Data masking can have any of the following characteristics:

- Generate random data, such as email addresses
- Eliminate data identification by transforming the data to hide its content

The data masking functions fall into the following categories:

- Common scenarios
- Special scenarios
- Generating random data with defined characteristics
- Generating random terms using dictionaries

#### 1.2.1 Common Scenarios

The commonly used data masking functions are as follows:

| Function | Description |
| -------------------------------------------------- | ------------------------------------------------------------ |
| mask_inner(string, margin1, margin2 [, character]) | Returns a result with only the inner part of the string masked. A different masking character can be specified. |
| mask_outer(string, margin1, margin2 [, character]) | Masks the outer part of the string. The inner part is not masked. A different masking character can be specified. |

Examples of `mask_inner()`:

```sql
greatsql> SELECT mask_inner('123456789', 1, 2);
+-------------------------------+
| mask_inner('123456789', 1, 2) |
+-------------------------------+
| 1XXXXXX89                     |
+-------------------------------+
1 row in set (0.00 sec)

# Mask from the 1st character until the last 2 characters, replacing them with "*" (the default masking character is 'X')
greatsql> SELECT mask_inner('GreatSQL is good', 1, 2, "*");
+-------------------------------------------+
| mask_inner('GreatSQL is good', 1, 2, "*") |
+-------------------------------------------+
| G*************od                          |
+-------------------------------------------+
1 row in set (0.00 sec)
```

Examples of `mask_outer()`:

```sql
greatsql> SELECT mask_outer('123456789', 2, 2); 
+-------------------------------+
| mask_outer('123456789', 2, 2) |
+-------------------------------+
| XX34567XX                     |
+-------------------------------+
1 row in set (0.00 sec)
```

#### 1.2.2 Special Scenarios

The data masking functions for special scenarios are as follows:

| Scope | Description |
| ------------------------ | ------------------------------------------------------------ |
| mask_pan(str [,mask_char])           | Masks the primary account number of a payment card. |
| mask_pan_relaxed(str [,mask_char])   | Partially masks the primary account number of a payment card. |
| mask_ssn(str [,mask_char])           | Masks a US Social Security number. |
| mask_canada_sin(str [,mask_char])    | Masks a Canadian Social Insurance number. |
| mask_iban(str [,mask_char])          | Masks an international bank account number. |
| mask_uk_nin(str [,mask_char])        | Masks a UK National Insurance number. |
| mask_uuid(str [,mask_char])          | Masks a UUID. |

Example of `mask_pan()`:

- `gen_rnd_pan()` is a built-in function in GreatSQL used to generate a random PAN (Primary Account Number).

```sql
greatsql> SELECT mask_pan (gen_rnd_pan());
+--------------------------+
| mask_pan (gen_rnd_pan()) |
+--------------------------+
| XXXXXXXXXXXX0472         |
+--------------------------+
1 row in set (0.01 sec)
```

Example of `mask_pan_relaxed()`:

```sql
greatsql> SELECT mask_pan_relaxed(gen_rnd_pan());
+---------------------------------+
| mask_pan_relaxed(gen_rnd_pan()) |
+---------------------------------+
| 349133XXXXX1292                 |
+---------------------------------+
1 row in set (0.00 sec)
```

Example of `mask_ssn()`:

```sql
greatsql> SELECT mask_ssn('555-55-5555');
+-------------------------+
| mask_ssn('555-55-5555') |
+-------------------------+
| ***-**-5555             |
+-------------------------+
1 row in set (0.00 sec)
```

#### 1.2.3 Generating Random Data for Specific Requirements

These functions generate random values that meet specific requirements.

| Scope | Description |
| ------------------------------ | ------------------------------------------------------------ |
| gen_range(lower, upper)        | Generates a random number within a selected range and supports negative numbers. |
| gen_rnd_email([name_size, surname_size, domain])                | Generates a random email address.<br/>**name_size**: specifies the number of characters in the name part. The default is five. The minimum is 1 and the maximum is 1024.<br/>**surname_size**: specifies the number of characters in the surname part. The default is seven. The minimum is 1 and the maximum is 1024.<br/>**domain**: specifies the domain name to use, default is example.com. |
| gen_rnd_pan()                  | Generates a random primary account number. This function can only be used for testing purposes. |
| gen_rnd_us_phone()             | Generates a random US phone number. The generated number adds the 1 dialing code and belongs to the 555 area code. |
| gen_rnd_ssn()                  | Generates a random value in the AAA-BBB-CCCC format. This function can only be used for testing purposes. |
| gen_rnd_canada_sin()           | Generates a Canadian Social Insurance number. |
| gen_rnd_iban([country, size])  | Generates an international bank account number.<br/>**country**: a two-character country code, for example: CN, default is ZZ.<br/>**number of characters**: the number of characters.|
| gen_rnd_uk_nin()               | Generates a UK National Insurance number. |
| gen_rnd_uuid()                 | Generates a UUID. |

Example of `gen_range(lower, upper)`:

```sql
greatsql> SELECT gen_range(10, 100);
+--------------------+
| gen_range(10, 100) |
+--------------------+
|                 31 |
+--------------------+
1 row in set (0.01 sec)
```

Example of `gen_range(lower, upper)` with negative numbers:

```sql
greatsql> SELECT gen_range(-100,-80);
+---------------------+
| gen_range(-100,-80) |
+---------------------+
|                 -97 |
+---------------------+
1 row in set (0.00 sec)
```

Example of `gen_rnd_email()`:

```sql
greatsql> SELECT gen_rnd_email();
+---------------------------+
| gen_rnd_email()           |
+---------------------------+
| oojxo.vpsikrt@example.com |
+---------------------------+
1 row in set (0.00 sec)

greatsql> SELECT gen_rnd_email(4, 5, 'greatsql.cn');
+------------------------------------+
| gen_rnd_email(4, 5, 'greatsql.cn') |
+------------------------------------+
| bnqf.drkuf@greatsql.cn             |
+------------------------------------+
1 row in set (0.01 sec)
```

Example of `mask_pan(gen_rnd_pan())`:

```sql
greatsql> SELECT mask_pan(gen_rnd_pan());
+-------------------------+
| mask_pan(gen_rnd_pan()) |
+-------------------------+
| XXXXXXXXXXXX3883        |
+-------------------------+
1 row in set (0.00 sec)
```

Example of `gen_rnd_us_phone()`:

```sql
greatsql> SELECT gen_rnd_us_phone();
+--------------------+
| gen_rnd_us_phone() |
+--------------------+
| 1-555-405-9656     |
+--------------------+
1 row in set (0.00 sec)
```

Example of `gen_rnd_ssn()`:

```sql
greatsql> SELECT gen_rnd_ssn();
+---------------+
| gen_rnd_ssn() |
+---------------+
| 971-51-1394   |
+---------------+
1 row in set (0.00 sec)
```

#### 1.2.4 Generating Random Terms Using Dictionaries

Generate random terms using selected dictionaries. The dictionary must be loaded from a file with the following characteristics:

- Plain text
- One term per line
- Must contain at least one item

Copy the dictionary file to a directory that GreatSQL can access. GreatSQL uses the `secure-file-priv` option of `gen_dictionary_load()` to enable this. The `secure-file-priv` option defines the directory from which `gen_dictionary_load()` loads dictionary files.

| Scope | Description |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| gen_blocklist(str, from_dictionary_name, to_dictionary_name) | Replaces a term in a dictionary.<br/>**term**: the term to be replaced.<br/>**from_dictionary_name**: the dictionary that stores the term.<br/>**to_dictionary_name**: the dictionary that stores the replacement term. |
| gen_dictionary(dictionary_name)                              | Randomly draws a term from `dictionary_name`; returns NULL if `dictionary_name` does not exist. |
| masking_dictionaries_flush()                                 | Re-synchronizes the internal dictionary term cache. |
| masking_dictionary_remove(dictionary_name)                   | Removes a dictionary. |
| masking_dictionary_term_add(dictionary_name, term_name)      | Adds a term to the masking dictionary. |
| masking_dictionary_term_remove(dictionary_name, term_name)   | Removes a term from the masking dictionary. |

The function `gen_blocklist()` replaces a term in one dictionary with a term randomly selected from another dictionary.


A term is randomly selected from the dictionary in `to_dictionary_name` to replace the selected term. If the selected term is not listed in `from_dictionary_name`, or the dictionary is missing, the term itself is returned. If `to_dictionary_name` does not exist, NULL is returned. The character set of the returned value is the same as that of the term parameter.

If the function is called with NULL as a parameter, NULL is returned.

```sql
greatsql> SELECT gen_blocklist('apple', 'fruit', 'nut');
+-----------------------------------------+
| gen_blocklist('apple', 'fruit', 'nut')  |
+-----------------------------------------+
| walnut                                  |
+-----------------------------------------+
```

## Policy-Based Data Masking

### Preparation

Policy-based data masking takes effect only when the global system variable `enable_data_masking` is TRUE (default is FALSE).

Before getting started, the `sys_masking.sql` SQL script file needs to be imported to complete the related configuration:
```sql
SOURCE %basedir%/share/sys_masking.sql;
```
Here, "%basedir%" represents the GreatSQL installation directory.

### Configuring Masking Policies

Stored procedure name | Description | 
---- | ---- |
sys_masking.create_label | Creates a label for the masked field 
sys_masking.create_policy | Creates a masking policy 
sys_masking.policy_add_label | Adds the relationship between the masking policy and the corresponding label
sys_masking.policy_add_user | Adds special accounts excluded from the policy
sys_masking.policy_enable | Enables or disables the policy 
sys_masking.drop_policy| Drops a policy
sys_masking.policy_delete_label | Deletes the relationship between the policy and the label
sys_masking.policy_delete_user | Deletes the relationship between the policy and the account
sys_masking.drop_label_by_id| Deletes a masking label by label ID
sys_masking.drop_label_by_name | Deletes a masking label by label name


### Usage Reference

- 1. Set a label for the data object to be masked

```sql
CALL sys_masking.create_label('greatsql', 't1', 'c3', 'mask_greatsql_t1_c3');
```

Call the `sys_masking.create_label()` function to add the "mask_greatsql_t1_c3" label to the column `greatsql.t1.c3` (the `c3` column in the `greatsql.t1` table).

- 2. Create a masking policy

```sql
CALL sys_masking.create_policy('policy1', 'maskall', '*' );
```

Call the `sys_masking.create_policy()` function to create a policy named "policy1". The behavior of this policy is to call the `maskall()` function to replace all data with the character "*".

- 3. Add the specified label to the masking policy to make it effective

```sql
CALL sys_masking.policy_add_label('policy1', 'mask_greatsql_t1_c3');
```

Call the `sys_masking.policy_add_label()` function to add the specified label "mask_greatsql_t1_c3" to the policy "policy1", so that all data objects under this label are masked in query results, for example:

```sql
greatsql> SELECT c1, c2, c3 FROM greatsql.t1 LIMIT 1;
+----+--------+-------------------+--------------------+
| id | c1     | c2                | c3                 |
+----+--------+-------------------+--------------------+
|  1 | 280638 | 991512.2317965257 | ****************** |
+----+--------+-------------------+--------------------+
```

::: tip Tip
At this point, you need to connect and query as an ordinary user, because the masking rules do not take effect by default for accounts with administrative privileges.
:::

- 4. Set the authorized account "user2@%" individually to be exempt from the masking policy "policy1", that is, masking is not applied to queries from the "user2@%" account, for example:

```sql
CALL sys_masking.policy_add_user('policy1', 'user2@%');
```

```sql
-- Switch to log in as the user2@% account
-- The currently logged-in account is user2@127.0.0.1, that is, the user2 account logged in from 127.0.0.1
greatsql> SELECT USER();
+-----------------+
| user()          |
+-----------------+
| user2@127.0.0.1 |
+-----------------+

-- The corresponding authorized account is user2@%, which allows user2 to log in from any address via TCP/IP
greatsql> SELECT CURRENT_USER();
+----------------+
| current_user() |
+----------------+
| user2@%        |
+----------------+

-- Execute the query again to confirm that the masking policy does not take effect
greatsql> SELECT * FROM t1 LIMIT 1;
+----+--------+-------------------+--------------------+
| id | c1     | c2                | c3                 |
+----+--------+-------------------+--------------------+
|  1 | 280638 | 991512.2317965257 | 0.9644671762031197 |
+----+--------+-------------------+--------------------+
```

### Constraints and Limitations

- 1. Only fields queried with `SELECT` are supported for masking. If a function or additional operation is used when querying the field, the masking policy does not take effect.

```sql
-- When a function is used on the c3 column, masking is not supported
greatsql> SELECT id, c3, LEFT(c3, 5) FROM t1 LIMIT 1;
+----+--------------------+-------------+
| id | c3                 | left(c3, 5) |
+----+--------------------+-------------+
|  1 | ****************** | 0.964       |
+----+--------------------+-------------+

-- When an additional operation is used on the c3 column, masking is not supported
greatsql> SELECT id, c3, c3 + 1 FROM t1 LIMIT 1;
+----+--------------------+--------------------+
| id | c3                 | c3 + 1             |
+----+--------------------+--------------------+
|  1 | ****************** | 1.9644671762031196 |
+----+--------------------+--------------------+
```

- 2. The data type of the returned result for masked data columns is always converted to a string type.

- 3. Only columns in base tables (views are not included) are supported, and masking is only supported for results in the outermost query. Masking of columns in inner subqueries is not supported.

```sql
greatsql> SELECT * FROM t1 WHERE id <= 3;
+----+--------+-------------------+---------------------+
| id | c1     | c2                | c3                  |
+----+--------+-------------------+---------------------+
|  1 | 280638 | 991512.2317965257 | ******************  |
|  2 |  19646 | 195692.9542456688 | ******************* |
+----+--------+-------------------+---------------------+

greatsql> SELECT id, c3 FROM (SELECT * FROM t1) t WHERE id <= 3;
+----+---------------------+
| id | c3                  |
+----+---------------------+
|  1 | 0.9644671762031197  |
|  2 | 0.45393493906961285 |
+----+---------------------+
```

- 4. For `INSERT ... SELECT` or `REPLACE INTO ... SELECT` operations, if the source table contains masked columns, the data inserted by these operations is the masked value, and it cannot be restored.

- 5. The administrator account configuring the masking policies needs to have privileges such as `EXECUTE, INSERT, DELETE, UPDATE, RELOAD` on the `sys_masking` database (it is best to open the management privilege of this database only to administrators).

- 6. By default, masking policies apply to all accounts, except for accounts configured in `sys_masking.masking_policy_users` and accounts with the SUPER privilege.

Execute the following SQL command to view the list of all accounts excluded from masking policies:

```sql
greatsql> SELECT CONCAT(user, '@', host) AS masking_skip_users FROM mysql.user WHERE super_priv = 'y'
  UNION ALL 
  SELECT user_name AS masking_skip_users FROM sys_masking.masking_policy_users;
+-------------------------+
| masking_skip_users      |
+-------------------------+
| mysql.session@localhost |
| root@localhost          |
| user2@%                 |
+-------------------------+
```

- 7. If the `GROUP BY` clause in a query contains masked fields, a Warning is raised.

```sql
greatsql> SELECT c3, count(*) AS c FROM t1 WHERE id <= 3 GROUP BY c3 ORDER BY c;
+---------------------+---+
| c3                  | c |
+---------------------+---+
| ******************  | 1 |
| ******************* | 1 |
+---------------------+---+
2 rows in set, 1 warning (0.00 sec)

greatsql> SHOW WARNINGS;
+---------+------+---------------------------------------------+
| Level   | Code | Message                                     |
+---------+------+---------------------------------------------+
| Warning | 1052 | Column 'c3' in group statement is ambiguous |
+---------+------+---------------------------------------------+
```

- 8. If the query contains `UNION / UNION ALL`, the masked values "***" in the query results will be deduplicated according to the masked results, rather than the original values; subsequent `GROUP BY / ORDER BY` will also group and sort according to the masked results.

```sql
-- This query contains the id column, hence this result
greatsql> SELECT id, c3 FROM t1 WHERE id <= 4 UNION SELECT id, c3 FROM t2 WHERE id <= 4;
+----+---------------------+
| id | c3                  |
+----+---------------------+
|  1 | ******************  |
|  2 | ******************* |
|  4 | ******************* |
|  1 | 0.9644671762031197  |
|  2 | 0.45393493906961285 |
|  4 | 0.37627319747234994 |
+----+---------------------+
6 rows in set (0.00 sec)

-- When only the c3 column is queried, deduplication is performed according to the masked results
greatsql> SELECT c3 FROM t1 WHERE id <= 4 UNION SELECT c3 FROM t2 WHERE id <= 4;
+---------------------+
| c3                  |
+---------------------+
| ******************  |
| ******************* |
| 0.9644671762031197  |
| 0.45393493906961285 |
| 0.37627319747234994 |
+---------------------+
5 rows in set (0.00 sec)

-- Sort according to the masked results
greatsql> SELECT c3 FROM t1 WHERE id <= 4 UNION SELECT c3 FROM t2 WHERE id <= 4 ORDER BY c3 DESC;
+---------------------+
| c3                  |
+---------------------+
| 0.9644671762031197  |
| 0.45393493906961285 |
| 0.37627319747234994 |
| ******************* |
| ******************  |
+---------------------+
```

### Masking Policy Configuration Interface Description
#### 2.5.1 Masking Policy Control Stored Procedures

- 1. Create a label

```sql
sys_masking.create_label('db_name', 'table_name', 'field_name', 'label_name'); 
```

Function: creates a new label and adds the fields to be masked. The field names configured in the label are case-insensitive, and multiple fields are allowed to use the same label name, but the same column cannot be added repeatedly to a label.

Parameters:
- db_name, the database name, case-insensitive, cannot be empty.
- table_name, the table name, case-insensitive, cannot be empty.
- field_name, the field name, case-insensitive, cannot be empty.
- label_name, the label name, case-insensitive, cannot be empty, and must be at least 3 characters long.
- All the parameter names above must be quoted, otherwise an error is reported.

As shown in the following example, create the label "label1" for the data object `greatsql.t1.c1` (database.table.column):

```sql
CALL sys_masking.create_label('greatsql', 't1', 'c3', 'label1') ;
```

- 2. Create a masking policy 

```sql
sys_masking.create_policy('policy_name', 'mask_function', 'args')
```

Function: adds the desired masking policy, specifying which masking function to use and its corresponding parameters. If the parameters are misconfigured, the policy does not take effect and the corresponding error is recorded in the log.

After adding the masking policy, apply the policy to the specified label to make it effective. By default, masking policies apply to all accounts, except for accounts configured in `sys_masking.masking_policy_users` and accounts with the SUPER privilege.

Parameters:
- policy_name, the policy name, case-insensitive, cannot be empty, and must be at least 3 characters long.
- mask_function, the masking function name, valid values are `[maskall | mask_inside]`.
- args, the remaining parameters are passed as parameters of the "mask_function" function. If there are multiple parameters, they can be separated by commas ",". If set to empty or written as NULL (note: NULL and 'NULL' are different) or '', the default parameters are used.
- All the parameter names above must be quoted, otherwise an error is reported.

As shown in the following example, create a policy named "policy1" whose behavior is to call the `mask_inside()` function to replace characters from position 0 to position 5 in the query results with "#":

```sql
CALL sys_masking.create_policy('policy1', 'mask_inside', '0,5,#') ;
```

Or as shown in the following example, create a policy named "policy1" whose behavior is to call the `maskall()` function to replace all data with the character "*":

```sql
CALL sys_masking.create_policy('policy1', 'maskall', '*') ;
```

- 3. Apply the masking policy to the specified label
```sql
sys_masking.policy_add_label('policy_name', 'label_name')
```

Function: applies the masking policy to the specified label and makes it effective immediately. A label can only be applied with one policy; otherwise, an error is reported with the message `ERROR 1644 (45000): label has already bind policy`.

Parameters: 
- policy_name, the policy name, case-insensitive, cannot be empty, and must be at least 3 characters long.
- label_name, the label name, case-insensitive, cannot be empty, and must be at least 3 characters long.
- All the parameter names above must be quoted, otherwise an error is reported.

As shown in the following example, apply the policy "policy1" to the label "label1":

```sql
CALL sys_masking.policy_add_label('policy1', 'label1') 
```

- 4. Add special accounts excluded from the policy (optional operation, not required)

```sql
sys_masking.policy_add_user('policy_name', 'user_name')
```

Function: adds special accounts excluded from the policy. The masking policy does not take effect for "accounts configured with the exclusion policy" and "accounts with the SUPER privilege".
       
Parameters:
- policy_name, the policy name, case-insensitive, cannot be empty, and must be at least 3 characters long.
- user_name, the authorized account name, case-insensitive, cannot be empty, in the format "user@host", and must correspond to the authorized account name in `mysql.user`; otherwise, it may not take effect correctly.
- All the parameter names above must be quoted, otherwise an error is reported.

As shown in the following example, add an exclusion rule for the policy "policy1" against the account "user2@%".

```sql
CALL sys_masking.policy_add_user('policy1', 'user2@%');
```

- 5. Enable/disable a masking policy

```sql
sys_masking.policy_enable('policy_name', policy_enabled)
```

Function: sets the specified policy to the enabled/disabled state. The policy takes effect immediately by default after creation. This function allows a policy to be made ineffective without deleting it, which is convenient for later reuse.

Parameters:
- policy_name, the policy name, case-insensitive, cannot be empty, and must be at least 3 characters long; the policy name parameter must be quoted, otherwise an error is reported.
- policy_enabled, the switch for whether the policy is enabled, default is "1", meaning the policy is enabled; if set to "0", the policy is disabled.

As shown in the following example, execute the SQL command to set the state of the policy "policy1" to enabled/disabled:

```sql
-- Enable the policy
CALL sys_masking.policy_enable('policy1', 1);

-- Disable the policy
CALL sys_masking.policy_enable('policy1', 0);
```

- 6. Drop a policy

```sql
sys_masking.drop_policy('policy_name')
```

Function: drops a policy and deletes the associated relationships such as excluded user rules and label applications corresponding to the policy. Note: this cascading deletion does not provide a second confirmation but directly deletes.

Parameters:  
- policy_name, the policy name, case-insensitive, cannot be empty, and must be at least 3 characters long; the policy name parameter must be quoted, otherwise an error is reported.

As shown in the following example, drop the policy "policy1":

```sql
CALL sys_masking.drop_policy('policy1');
```

- 7. Delete the relationship between the policy and the label

```sql
sys_masking.policy_delete_label('policy_name', 'label_name')
```

Function: deletes the relationship between the policy and the label, so that the policy no longer applies to that label.

Parameters:
- policy_name, the policy name, case-insensitive, cannot be empty, and must be at least 3 characters long.
- label_name, the label name, case-insensitive, cannot be empty, and must be at least 3 characters long.
- All the parameter names above must be quoted, otherwise an error is reported.

As shown in the following example, delete the relationship between the policy "policy1" and the label "label1":

```sql
CALL sys_masking.policy_delete_label('policy1', 'label1');
```

- 8. Delete special users excluded from a policy

```sql
sys_masking.policy_delete_user('policy_name', 'user_name')
```

Function: deletes the exclusion relationship between the policy and the account.

Parameters:
- policy_name, the policy name, case-insensitive, cannot be empty, and must be at least 3 characters long.
- user_name, the authorized account name, case-insensitive, cannot be empty, in the format "user@host", and must correspond to the authorized account name in `mysql.user`; otherwise, it may not take effect correctly.
- All the parameter names above must be quoted, otherwise an error is reported.

As shown in the following example, delete the exclusion relationship between the policy "policy1" and the account "user2@%".

```sql
-- Delete the special user excluded from the policy
CALL sys_masking.policy_delete_user('policy1', 'user2@%');
```

- 9. Delete a label by name

```sql
sys_masking.drop_label_by_name(label)
```

Function: deletes a masking label by label name.

Parameters: 
- label_name, the label name, case-insensitive, cannot be empty, and must be at least 3 characters long.

As shown in the following example, delete the label "label1":

```sql
CALL sys_masking.drop_label_by_name('label1');
```

- 10. Delete a label by ID

```sql
sys_masking.drop_label_by_id(label_id)
```

Function: deletes a label by the specified ID. 

Parameters:
- label_id, the ID corresponding to the label name, cannot be empty, and must be an integer value.
  

As shown in the following example, delete the label with id = 1.
```sql
-- Use an account with administrative privileges to query the label to obtain the corresponding id value
greatsql> SELECT label_id, label_name FROM sys_masking.masking_label WHERE label_name = 'label1';
+----------+---------------+
| label_id | label_name    |
+----------+---------------+
|        2 | label1        |
+----------+---------------+

-- Delete the label by its id value
greatsql> CALL sys_masking.drop_label_by_id(2);
```

#### 2.5.2 Masking Functions

- 1. `maskall(str, [, mask_char] )`

This function masks the entire string, replacing it with the specified character.

Parameters
- str, the data object to be passed in.
- mask_char, the character used for replacement, default is "x". If the parameter is a string, only the first character is taken; if the parameter is "\0", it is parsed as the default character "x". 

The function `maskall()` works as shown in the following examples:

```sql
greatsql> SELECT maskall('GreatSQL 数据库') AS c1, 
                 maskall('GreatSQL 数据库', 'a') AS c2,
		 maskall('GreatSQL 数据库', '赞喔') AS c3,
		 maskall('GreatSQL 数据库', '\0') AS c4 FROM DUAL;
+-------------+-------------+-----------------------------------+-------------+
| c1          | c2          | c3                                | c4          |
+-------------+-------------+-----------------------------------+-------------+
| xxxxxxxxxxx | aaaaaaaaaaa | 赞赞赞赞赞赞赞赞赞赞赞                | xxxxxxxxxxx |
+-------------+-------------+-----------------------------------+-------------+
```

- 2. `mask_inside(str, margin1, margin2 [, mask_char])`

This function masks only part of the string content.

Parameters
- margin1, specifies the starting character position for masking, default is 0; if a negative number is specified, it is still treated as 0.
- margin2, specifies the ending character position for masking, default is INT32_MAX; if a negative number is specified, it is still treated as INT32_MAX.
- mask_char, specifies the character to replace with, default is "x"; if the parameter is a string, only the first character is taken; if the parameter is "\0", it is parsed as the default character "x". 
- If margin1 == margin2, and both margin1 and margin2 are integers, it means no masking replacement is performed.

```sql
greatsql> SELECT mask_inside('GreatSQL 数据库', 1, 3) AS c1,
	         mask_inside('GreatSQL 数据库', 0, 4) AS c2,
		 mask_inside('GreatSQL 数据库', 1, 3, '*#') AS c3,
		 mask_inside('GreatSQL 数据库', 0, 4, '#*') AS c4,
		 mask_inside('GreatSQL 数据库', 1, 3, '赞喔') AS c5,
		 mask_inside('GreatSQL 数据库', 1, 2, '\0') AS c6,
		 mask_inside('GreatSQL 数据库', 0, -1, '\0')  AS c7 FROM DUAL;
+-------------------+-------------------+-------------------+-------------------+-----------------------+-------------------+-------------+
| c1                | c2                | c3                | c4                | c5                    | c6                | c7          |
+-------------------+-------------------+-------------------+-------------------+-----------------------+-------------------+-------------+
| GxxatSQL数据库    | xxxxtSQL数据库    | G**atSQL数据库    | ####tSQL数据库    | G赞赞atSQL数据库      | GxeatSQL数据库    | xxxxxxxxxxx |
+-------------------+-------------------+-------------------+-------------------+-----------------------+-------------------+-------------+
```

#### 2.5.3 Viewing Policy Views 

All metadata related to masking policies is stored in the `sys_masking` database.

- 1. Table `masking_policy`, stores masking policy rules

Column name |    |    
----  | ------ |
polname  | Policy name
maskaction| Masking function
optinal| Parameters of the masking function (optional)
polenabled|Whether the policy is effective
create_time|Creation time
update_time|Modification time

- 2. Table `masking_policy_users`, stores the relationship between masking policies and excluded accounts

 Column name |  |
 --- | -----
polname |Policy name
user_name | Account name
create_time| Creation time

- 3. Table `masking_policy_labels`, stores the relationship between masking policies and labels

Column name| |
--- | --- 
polname| Policy name
label_name| Label name
create_time| Creation time

A policy can be applied to multiple labels.

- 4. Table `masking_label`, stores masking labels

Column name |     |
 ---- | --- |
label_id | Label ID
label_name| Label name
db_name|Database name
table_name| Table name
field_name| Field name
create_time| Creation time

Multiple fields can be associated in the same label.

### System Variables

The masking policy takes effect only when the `enable_data_masking` global variable is set to "ON":

```sql
SET GLOBAL enable_data_masking = ON;
```

If the administrator manually modifies data in the `sys_masking` metadata database, it may cause incorrect policy application and also raise errors when executing `FLUSH PRIVILEGES`. Detailed records can be found in the error log.

### 2.7 Installation and Uninstallation

- 1. Installation

Execute the `sys_masking.sql` script to initialize the `sys_masking` metadata database and enable the policy-based masking feature:

```sql
SOURCE %basedir%/share/sys_masking.sql;
```
Here, "%basedir%" represents the GreatSQL installation directory.

The above operations take effect under the default configuration, but if the system default configuration is modified, such as changing the default character set or default collation, the feature may become unavailable.

For example, when modifying the collation setting `collation_server = utf8mb4_bin`, it may affect policy rule matching, causing the masking policy to fail to take effect.

- 2. Uninstallation

Execute the following commands to uninstall and disable the policy-based masking feature:

```sql
SET GLOBAL enable_data_masking = OFF;
DROP DATABASE sys_masking;
DROP TABLESPACE gdb_sys_masking;
FLUSH PRIVILEGES;
```

Recommended related reading: [Data masking in MySQL Enterprise Edition](https://mp.weixin.qq.com/s/74pUYuPRUp-BkvjI0ysoCg).



**Scan the QR code to follow the WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
