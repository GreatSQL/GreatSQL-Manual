# Clone Backup Encryption
---

Starting from GreatSQL 8.0.32-25, Clone backup supports encrypting backup files during backup, as well as decrypting encrypted backup files.

## CLONE Backup Encryption
Before performing Clone, execute the following SQL command to set the option `clone_encrypt_key_path` first to enable encryption.

```sql
SET GLOBAL clone_encrypt_key_path = 'PATH/mysql_encrypt_key'
```

The content of the `mysql_encrypt_key` key file is similar to the following:

```bash
$ cat mysql_encrypt_key

aes-128-cbc
Jmfyvubtms66kIcHwHco8XeOYPA6GiQb86U
1234567890123456
```

This file has three lines in total:
- First line, encryption mode: `aes-128-cbc`, indicating encryption using a 128-bit key length and CBC mode.
- Second line, encryption key: `Jmfyvubtms66kIcHwHco8XeOYPA6GiQb86U`. Permitted key lengths are 128, 192 and 256, and permitted modes are ECB, CBC, CFB1, CFB8, CFB128 and OFB.
- Third line, encryption vector: `1234567890123456`, which must be 16 characters in length.

Next, you can perform CLONE encrypted backup. CLONE supports several different backup modes: backing up data from a remote instance or a local instance to local storage, or backing up data from a remote instance and overwriting the local instance.

To perform a CLONE backup, the running user must be granted at least the `BACKUP_ADMIN` privilege, for example:

```sql
CREATE USER bkuser IDENTIFIED BY 'bkuser';
GRANT SELECT, BACKUP_ADMIN ON *.* TO bkuser;
```

To back up a remote instance, you also need to set the option `clone_valid_donor_list` first (not required when performing a CLONE backup of a local instance to local storage), for example:

```sql
SET GLOBAL clone_valid_donor_list = '172.17.140.10:3306';
```

Then set the key file path (make sure the GreatSQL database process has permission to access this key file):

```sql
SET GLOBAL clone_encrypt_key_path = '/data/backup/mysql_encrypt_key';
```

Next, you can perform the CLONE backup, for example:

```sql
-- Back up the local instance to local storage
CLONE LOCAL DATA DIRECTORY = '/data/backup/20230515';

-- Or back up a remote instance to local storage
CLONE INSTANCE FROM bkuser@172.17.140.10:3306 IDENTIFIED BY 'bkuser' DATA DIRECTORY = '/data/backup/20230515';
```

View the encrypted backup files:

```bash
# Enter the data backup directory
$ cd /data/backup/20230515

# View the backup files
$ ls -a

...
 .   '#clone'    ib_buffer_pool.xbcrypt  '#innodb_redo'   mysql.ibd.xbcrypt   sys_audit.ibd.xbcrypt   test               undo_002.xbcrypt
 ..   greatsql   ibdata1.xbcrypt          mysql           sys                 sys_mac.ibd.xbcrypt     undo_001.xbcrypt
```

As you can see, whether it is user tablespace files, system tablespace, Redo Log, Undo Log or other files, all data files have the ".xbcrypt" suffix added, indicating they are all encrypted files.

## Decrypting Clone Encrypted Backup Files

When a Clone encrypted backup is stored locally, the backup file names all have the ".xbcrypt" suffix. Before importing the encrypted data backup files, they must be decrypted first.

In GreatSQL, a new decryption tool named `mysqldecrypt` is added, which can be used to decrypt data files.

The decryption process is demonstrated below.

### Decrypting the Entire Data Backup Directory

Encapsulate the decryption work in the script file `/data/backup/clone_decrypt_files.sh`:

```ini
# Call the mysqldecrypt tool to decrypt the entire directory
#!/bin/sh
export PATH=$PATH:/usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin
cd /data/backup

# Perform a full backup first
cp -rfp /data/backup/20230515 /data/backup/20230515-orig

cd /data/backup/20230515
mysqldecrypt --clone-decrypt \
 --clone-decrypt-key=/data/backup/mysql_encrypt_key \
 --clone-decrypt-dir=./ --remove-original=true
```

The parameter `--remove-original=true` determines whether to delete the original encrypted files after decryption: `true` means delete, `false` means keep. Since a full backup has already been made, it is safe to delete them. In addition, this parameter only takes effect when decrypting the entire data directory; it does not take effect when decrypting a single file.

### Decrypting a Single Encrypted Tablespace File

Sometimes, only a single table needs to be restored rather than the entire database. `mysqldecrypt` supports decrypting only the specified file, which can meet this requirement.

Similarly, encapsulate the decryption work in the script file `/data/backup/clone_decrypt_dir.sh`:

```ini
# Call the mysqldecrypt tool to decrypt encrypted files one by one
#!/bin/sh
export PATH=$PATH:/usr/local/GreatSQL-8.0.32-25-Linux-glibc2.28-x86_64/bin
cd /data/backup

# Perform a full backup first
cp -rfp /data/backup/20230515 /data/backup/20230515-orig

cd /data/backup/20230515
for f in `find . -iname "*\.xbcrypt"`
do
 mysqldecrypt --clone-decrypt \
 --clone-decrypt-key=/data/backup/mysql_encrypt_key \
 --clone-decrypt-file=$f > $(dirname $f)/$(basename $f .xbcrypt) && rm -f $f;
done
```

**Note**: When decrypting a single tablespace file, specifying the parameter `--remove-original=true` does not take effect, so the encrypted file is deleted at the same time after decryption. Before doing this, be sure to confirm whether a full backup needs to be made first.

After decryption is completed, data recovery can proceed: either a full restore of the entire instance, or restoring only a specific data table.

## Usage Help

For more `mysqldecrypt` parameters, add `--help` to view them. The following are available:
- `--help`, view help.
- `--clone-decrypt`, declares whether to decrypt, options FALSE|TRUE, default FALSE.
- `--clone-decrypt-key`, sets the key file path.
- `--clone-decrypt-file`, sets the path of the single file to decrypt.
- `--clone-decrypt-dir`, sets the backup file directory to decrypt.
- `--remove-original`, sets whether to delete the original files after decryption, options FALSE|TRUE, default FALSE.


**Scan the QR code to follow the WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
