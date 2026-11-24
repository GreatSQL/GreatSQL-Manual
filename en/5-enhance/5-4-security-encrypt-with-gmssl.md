# National Cryptographic (GM) Algorithm Encryption Support
---

GreatSQL supports using national cryptographic algorithms for communication encryption and InnoDB tablespace encryption. For this purpose, GreatSQL releases a special GM-enabled binary package. Search for the keyword *binary package supporting national cryptography features* on the [download page](https://gitee.com/GreatSQL/GreatSQL/releases/tag/GreatSQL-8.0.32-26) and download the corresponding binary package.

## Compiling and Installing BabaSSL

Compile and install BabaSSL to support national cryptographic algorithms.

**Tip:** BabaSSL has now been renamed to Tongsuo, project repository address: https://github.com/Tongsuo-Project/Tongsuo.

Tongsuo is an open source basic cryptography library providing modern cryptographic algorithms and secure communication protocols. It provides underlying cryptographic capabilities for many business scenarios such as storage, network, key management, and privacy computing, realizing the privacy, integrity and authenticity of data during transmission, use and storage, and providing protection capabilities for privacy and security in the data lifecycle.

```bash
# Download the source code, compile and install
$ wget https://github.com/Tongsuo-Project/Tongsuo/releases/download/8.3.2/BabaSSL-8.3.2.tar.gz
$ tar zxf BabaSSL-8.3.2.tar.gz
$ cd Tongsuo-8.3.2
$ mkdir bld; cd bld; ../config; make; make install

# Modify /etc/profile
$ vim /etc/profile
export LD_LIBRARY_PATH=/usr/local/lib64:$LD_LIBRARY_PATH

# Exit the current session, re-login via ssh, confirm that BabaSSL is enabled
$ openssl version
BabaSSL 8.3.2
OpenSSL 1.1.1h  22 Sep 2020

# Confirm support for national cryptographic algorithms
# Note the SM3 and SM4 strings
$ openssl ciphers|grep SM
TLS_AES_256_GCM_SHA384:TLS_AES_128_GCM_SHA256:TLS_CHACHA20_POLY1305_SHA256:TLS_SM4_GCM_SM3:TLS_SM4_CCM_SM3...
```

## Enabling National Cryptographic Encryption for Communications

Modify the `my.cnf` configuration file and add the following communication national cryptography encryption support options in the `[mysqld]` section:
```ini
[mysqld]
#enable openssl & SM
require_secure_transport = ON
tls_ciphersuites = "TLS_SM4_GCM_SM3:TLS_SM4_CCM_SM3"
tls_version = 'TLSv1.3'
```

If GreatSQL is started with systemd, modify the service file:
```bash
$ vim /lib/systemd/system/greatsql.service

...
Environment=LD_LIBRARY_PATH=/usr/local/lib64
```

If GreatSQL is started manually from the command line, ensure that BabaSSL is enabled and then restart the GreatSQL service.

::: tip Tip
Reminder again: you need to download the specific GreatSQL binary package to support the national cryptographic encryption algorithm.
:::

## Login Test
Log in to GreatSQL again to confirm that the national cryptography support has taken effect:
```sql
-- Log in with the tcp protocol to confirm that the national cryptographic algorithm takes effect
-- mysql -hxx -uxx -pxx --protocol=tcp -P3306
greatsql> status;
...
SSL:                    Cipher in use is TLS_SM4_GCM_SM3

-- Confirm the correctness of the related configuration options
greatsql> SELECT * FROM performance_schema.global_variables WHERE variable_name IN ('require_secure_transport', 'tls_ciphersuites', 'tls_version');
+--------------------------+---------------------------------+
| VARIABLE_NAME            | VARIABLE_VALUE                  |
+--------------------------+---------------------------------+
| require_secure_transport | ON                              |
| tls_ciphersuites         | TLS_SM4_GCM_SM3:TLS_SM4_CCM_SM3 |
| tls_version              | TLSv1.3                         |
+--------------------------+---------------------------------+
```

## Encrypting Tablespaces with National Cryptographic Algorithms
Before starting to set encryption for database objects, a master keyring file must be generated first.

Create a new directory dedicated to storing the GreatSQL master keyring file (note: it cannot be placed in the datadir directory), and modify the corresponding owner and permission mode:
```bash
# datadir is /data/GreatSQL, keep them separate
mkdir /opt/GreatSQL/keyring
chown -R mysql:mysql /opt/GreatSQL/keyring
chmod -R 750 /opt/GreatSQL/keyring
```

Modify the `my.cnf` configuration file and configure the related options in the `[mysqld]` section:
```ini
[mysqld]
loose-plugin-load=keyring_file.so
keyring_file_data=/opt/GreatSQL/keyring/master_keyring
```

You can also execute the following command online to enable the keyring_file plugin:
```sql
INSTALL PLUGIN keyring_file soname 'keyring_file.so';
```

Restart GreatSQL and confirm that this plugin is enabled and the related options are also in effect:
```sql
greatsql> SELECT * FROM information_schema.PLUGINS WHERE plugin_name = 'keyring_file'\G
*************************** 1. row ***************************
           PLUGIN_NAME: keyring_file
        PLUGIN_VERSION: 1.0
         PLUGIN_STATUS: ACTIVE
           PLUGIN_TYPE: KEYRING
   PLUGIN_TYPE_VERSION: 1.1
        PLUGIN_LIBRARY: keyring_file.so
PLUGIN_LIBRARY_VERSION: 1.10
         PLUGIN_AUTHOR: Oracle Corporation
    PLUGIN_DESCRIPTION: store/fetch authentication data to/from a flat file
        PLUGIN_LICENSE: GPL
           LOAD_OPTION: ON
           
greatsql> SELECT * FROM performance_schema.global_variables WHERE variable_name IN ('keyring_file_data');
+-------------------+--------------------------------------+
| VARIABLE_NAME     | VARIABLE_VALUE                       |
+-------------------+--------------------------------------+
| keyring_file_data | /opt/GreatSQL/keyring/master_keyring |
+-------------------+--------------------------------------+
```

The master key is still an empty file right after initialization, so a new one needs to be generated:
```sql
greatsql> system ls -la /opt/GreatSQL/keyring/master_keyring
-rw-r----- 1 mysql mysql 0 Apr 21 16:35 /opt/GreatSQL/keyring/master_keyring

# Update the master key
greatsql> ALTER INSTANCE ROTATE INNODB MASTER KEY;

greatsql> system ls -la /opt/GreatSQL/keyring/master_keyring
-rw-r----- 1 mysql mysql 187 Apr 21 16:36 /opt/GreatSQL/keyring/master_keyring
```

Next, you can set whether to encrypt multiple database objects (database, table, tablespace).
```sql
-- Set tables newly created in this database to be encrypted by default
greatsql> ALTER DATABASE test encryption = 'Y';

greatsql> SHOW CREATE DATABASE test\G
*************************** 1. row ***************************
       Database: test
Create Database: CREATE DATABASE `test` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='Y' */

greatsql> CREATE TABLE t1(id INT PRIMARY KEY) ENCRYPTION='Y';

greatsql> SHOW CREATE TABLE t1\G
*************************** 1. row ***************************
       Table: t1
Create Table: CREATE TABLE `t1` (
  `id` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ENCRYPTION='Y'

-- Cancel encryption
greatsql> ALTER TABLE t1 ENCRYPTION='N';
```
**Note:** The keyring file needs to be backed up. If it is accidentally deleted, modified or moved, the encrypted database objects cannot be read correctly. At this time, you can restore the backup file.

## Viewing Metadata
You can view encryption-related metadata information in `performance_schema` and `information_schema`:

```sql
-- View the current master key
greatsql> SELECT * FROM performance_schema.keyring_keys;
+--------------------------------------------------+-----------+----------------+
| KEY_ID                                           | KEY_OWNER | BACKEND_KEY_ID |
+--------------------------------------------------+-----------+----------------+
| INNODBKey-c72ac980-7612-11ed-bd22-00155d064000-3 |           |                |
+--------------------------------------------------+-----------+----------------+

-- View which tablespace files are encrypted
greatsql> SELECT SPACE, NAME, SPACE_TYPE, ENCRYPTION FROM information_schema.INNODB_TABLESPACES WHERE ENCRYPTION='Y';
+-------+---------+------------+------------+
| SPACE | NAME    | SPACE_TYPE | ENCRYPTION |
+-------+---------+------------+------------+
|     6 | test/t1 | Single     | Y          |
+-------+---------+------------+------------+

-- View which tables are encrypted
greatsql> SELECT TABLE_SCHEMA, TABLE_NAME, CREATE_OPTIONS FROM information_schema.TABLES WHERE CREATE_OPTIONS LIKE '%ENCRYPTION%'; -- table
+--------------+------------+----------------+
| TABLE_SCHEMA | TABLE_NAME | CREATE_OPTIONS |
+--------------+------------+----------------+
| test         | t1         | ENCRYPTION='Y' |
+--------------+------------+----------------+

-- View which databases are encrypted
SELECT SCHEMA_NAME, DEFAULT_ENCRYPTION FROM information_schema.SCHEMATA WHERE DEFAULT_ENCRYPTION='YES';
+-------------+--------------------+
| SCHEMA_NAME | DEFAULT_ENCRYPTION |
+-------------+--------------------+
| test        | YES                |
+-------------+--------------------+
```

For more details, see the MySQL documentation:
- [https://dev.mysql.com/doc/refman/8.0/en/keyring.html](https://dev.mysql.com/doc/refman/8.0/en/keyring.html)
- [https://dev.mysql.com/doc/refman/8.0/en/innodb-data-encryption.html](https://dev.mysql.com/doc/refman/8.0/en/innodb-data-encryption.html)


**Scan the QR code to follow our WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
