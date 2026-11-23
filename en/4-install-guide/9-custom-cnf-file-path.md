# Customizing the GreatSQL Configuration File Path

This document introduces how to customize the path of the GreatSQL configuration file (my.cnf) in different environments.

## Customizing the my.cnf File Path When Installing GreatSQL with the RPM Package

After successfully installing GreatSQL with the RPM package, systemd is used to manage the GreatSQL database service by default, and the default configuration file path is `/etc/my.cnf`. If a configuration file with a custom path is needed, it can be achieved by modifying the systemd service configuration file.

Taking the CentOS system environment as an example, the following explains how to customize the my.cnf file path.

- 1. View the current systemd service configuration file

```bash
cat /lib/systemd/system/mysqld.service
```

- 2. Edit this service configuration file

```bash
vi /lib/systemd/system/mysqld.service
```

- 3. Add the `--defaults-file` option in the `ExecStart` parameter to specify the custom configuration file path

```ini
# The custom configuration file path is /opt/my.cnf
ExecStart=/usr/sbin/mysqld --defaults-file=/opt/my.cnf $MYSQLD_OPTS
```

- 4. Save and exit the editor

- 5. Reload the systemd configuration

```bash
systemctl daemon-reload
```

- 6. Restart the GreatSQL service to make the configuration take effect

```bash
systemctl restart mysqld
```

View the GreatSQL log file to confirm that the custom configuration file takes effect and starts correctly.

## Customizing the my.cnf File Path When Installing GreatSQL with the Binary Package

### Customizing the Configuration File Path When Starting with the systemd Method

- 1. View or create the systemd service configuration file of GreatSQL

```bash
cat /usr/lib/systemd/system/greatsql.service
```

If the file does not exist, a new configuration file can be created. For details, refer to: [Managing GreatSQL with systemd](./8-greatsql-with-systemd.md).

- 2. Edit this service configuration file and add the `--defaults-file` option in the `ExecStart` parameter

```ini
# The custom configuration file path is /opt/my.cnf
ExecStart=/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=/opt/my.cnf $MYSQLD_OPTS
```

- 3. Save and exit the editor

- 4. Reload the systemd configuration

```bash
systemctl daemon-reload
```

- 5. Restart the GreatSQL service

```bash
systemctl restart greatsql
```

View the GreatSQL log file to confirm that the custom configuration file takes effect and starts correctly.

### Customizing the Configuration File Path When Starting with the Command Line Method

When starting GreatSQL directly with the command line, the `--defaults-file` option can be used to specify the custom configuration file path:

```bash
# The custom configuration file path is /opt/my.cnf
/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=/opt/my.cnf &
```

The `mysqld_safe` command can also be used:

```bash
# The custom configuration file path is /opt/my.cnf
/usr/local/GreatSQL-8.4.4-4-Linux-glibc2.28-x86_64/bin/mysqld_safe --defaults-file=/opt/my.cnf &
```

View the GreatSQL log file to confirm that the custom configuration file takes effect and starts correctly.

## Customizing the External my.cnf File Path in a Docker Container

In the Docker environment, by default, the GreatSQL container uses the configuration file bundled inside the container. If an external custom configuration file is needed, it can be achieved through Docker's volume mounting feature.

### Method 1: Directly Replace the Container's Default Configuration File

The custom configuration file can also be directly mounted to replace the default configuration file in the container:

```bash
# The custom configuration file path is /opt/my.cnf
docker run -d \
  --name greatsql \
  -v /opt/my.cnf:/etc/my.cnf \
  greatsql/greatsql
```

### Method 2: Use docker-compose to Mount the Configuration File

If docker-compose is used to manage the container, volume mounting configuration can be added in the docker-compose.yml file:

```yaml
version: '2'
services:
  greatsql:
    image: greatsql/greatsql
    container_name: greatsql
    volumes:
      - /opt/my.cnf:/etc/my.cnf
```

Then use the following command to start the container:

```bash
docker-compose -f docker-compose.yml up -d
```

### Notes

1. Ensure that the path of the custom configuration file on the host machine is correct and the file has appropriate permissions;
2. Parameters in the custom configuration file override parameters with the same name in the container's default configuration file;
3. If the container cannot start with the custom configuration file, execute `docker logs greatsql` to view the error information, and then solve the corresponding problem based on the error prompt.

If you need to customize the default `/etc/my.cnf` file path in the GreatSQL container, you can modify the relevant code of the [GreatSQL Docker project](https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL) yourself. This is not described here.

**Scan the QR code to follow our WeChat Official Account**

![greatsql-wx](../greatsql-wx.jpg)
