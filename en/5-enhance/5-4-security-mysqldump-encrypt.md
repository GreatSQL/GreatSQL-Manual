# mysqldump Backup Encryption
---

Starting from [GreatSQL 8.0.32-25](../1-docs-intro/relnotes/changes-greatsql-8-0-32-25-20231228.md), encrypted backup files can be generated when performing logical backups with `mysqldump`, and encrypted backup files can also be decrypted for import.

The specific usage is described below.

First, use `openssl` to generate a key file:
```bash
# Use a random function to generate a plaintext password string
echo $RANDOM | sha256sum | awk '{print $1}' > /data/backup/dumpkey.txt

# Use openssl to encrypt and generate a key file
openssl enc -aes-256-cbc -K 215869594 -iv 1814916769 -in /data/backup/dumpkey.txt -out /data/backup/dumpkey.enc
```
**Note**: Occasionally, the generated key file may not be usable when specifying encryption in a later backup, and an error `Invalid encrypt key file.` is reported. In this case, simply change the plaintext password and regenerate it (re-execute the two steps above).

Encrypted export
```bash
# Perform a logical backup with encryption enabled
mysqldump --encrypt=aes-256-cbc --encrypt-key-file=/data/backup/dumpkey.enc --encrypt-iv=2132180222132180 -B test > /data/backup/test-enc.sql
```
This completes the logical backup and encrypts it.

**Notes**:
- `--encrypt` specifies the encryption/decryption algorithm.
- `--encrypt-key-file` specifies the key file.
- `--encrypt-iv` specifies the initialization vector. Some encryption algorithms do not require it and ignore this option; this parameter must be 16 characters in length.

If necessary, the exported file can be decrypted to view the backup file contents:
```
# Decrypt the exported file
mysqldump --decrypt=aes-256-cbc --decrypt-key-file=/data/backup/dumpkey.enc --decrypt-iv=2132180222132180 --decrypt-file=/data/backup/test-enc.sql > /data/backup/test.sql
```

You can also import the encrypted file directly in the mysql client (decrypting during import):
```bash
mysql -e "source_decrypt decrypt-mode aes-256-cbc decrypt-key-file /data/backup/dumpkey.enc decrypt-iv 2132180222132180 decrypt-file /data/backup/test-enc.sql"
```

**Notes**:
Here `--decrypt` specifies the encryption/decryption algorithm, `--decrypt-key-file` specifies the key file, and `--decrypt-iv` specifies the initialization vector. Some encryption algorithms do not require it and ignore this option.

**Usage Help**
For more `mysqldump` encryption/decryption related parameters, add `--help` to view them. The following are available:
```bash
$ ./bin/mysqldump --help | grep -i cryp

...
  --encrypt=name      Encrypt mysqldump mode .
  --encrypt-key=name  Encrypt mysqldump key.
  --encrypt-iv=name   Encrypt mysqldump iv.
  --encrypt-key-file=name
                      Encrypt mysqldump key file.
  --decrypt=name      Decrypt mysqldump mode.
  --decrypt-key=name  Decrypt mysqldump key.
  --decrypt-iv=name   Decrypt mysqldump iv.
  --decrypt-key-file=name
                      Decrypt mysqldump key file.
  --decrypt-file=name Decrypt mysqldump file.
```
The parameter names and their purposes are self-explanatory.


**Scan the QR code to follow the WeChat official account**

![greatsql-wx](../greatsql-wx.jpg)
