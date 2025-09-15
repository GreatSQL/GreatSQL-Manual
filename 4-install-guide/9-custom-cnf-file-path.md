# 自定义GreatSQL配置文件路径

本文档介绍在不同环境下如何自定义指定GreatSQL配置文件（my.cnf）的路径。

## RPM包方式安装GreatSQL时自定义my.cnf文件路径

使用RPM包方式成功安装GreatSQL之后，默认采用systemd管理GreatSQL数据库服务，默认的配置文件路径为`/etc/my.cnf`。如果需要使用自定义路径的配置文件，可以通过修改systemd服务配置文件来实现。

下面以CentOS系统环境为例，说明如何自定义my.cnf文件路径。

- 1. 查看当前的systemd服务配置文件

```bash
cat /lib/systemd/system/mysqld.service
```

- 2. 编辑该服务配置文件

```bash
vi /lib/systemd/system/mysqld.service
```

- 3. 在`ExecStart`参数中添加`--defaults-file`选项来指定自定义配置文件路径

```ini
# 自定义配置文件路径为 /opt/my.cnf
ExecStart=/usr/sbin/mysqld --defaults-file=/opt/my.cnf $MYSQLD_OPTS
```

- 4. 保存并退出编辑器

- 5. 重新加载systemd配置

```bash
systemctl daemon-reload
```

6. 重启GreatSQL服务使配置生效

```bash
systemctl restart mysqld
```

查看GreatSQL日志文件，确认自定义配置文件生效并能正确启动。

## 二进制包方式安装GreatSQL时自定义my.cnf文件路径

### 使用systemd方式启动时自定义配置文件路径

- 1. 查看或创建GreatSQL的systemd服务配置文件

```bash
cat /usr/lib/systemd/system/greatsql.service
```

如果文件不存在，可以创建一个新的配置文件。详情参考：[利用systemd管理GreatSQL](./8-greatsql-with-systemd.md)。

2. 编辑该服务配置文件，在`ExecStart`参数中添加`--defaults-file`选项

```ini
# 自定义配置文件路径为 /opt/my.cnf
ExecStart=/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=/opt/my.cnf $MYSQLD_OPTS
```

- 3. 保存并退出编辑器

- 4. 重新加载systemd配置

```bash
systemctl daemon-reload
```

- 5. 重启GreatSQL服务

```bash
systemctl restart greatsql
```

查看GreatSQL日志文件，确认自定义配置文件生效并能正确启动。

### 使用命令行方式启动时自定义配置文件路径

在使用命令行直接启动GreatSQL时，可以通过`--defaults-file`选项来指定自定义配置文件路径：

```bash
# 自定义配置文件路径为 /opt/my.cnf
/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=/opt/my.cnf &
```

也可以使用`mysqld_safe`命令：

```bash
# 自定义配置文件路径为 /opt/my.cnf
/usr/local/GreatSQL-8.0.32-27-Linux-glibc2.28-x86_64/bin/mysqld_safe --defaults-file=/opt/my.cnf &
```

查看GreatSQL日志文件，确认自定义配置文件生效并能正确启动。

## Docker容器中自定义外部my.cnf文件路径

在Docker环境中，默认情况下GreatSQL容器会使用容器内部自带的配置文件。如果需要使用外部自定义的配置文件，可以通过Docker的卷挂载功能实现。

### 方法一：直接替换容器的默认配置文件

也可以直接挂载自定义配置文件来替换容器内的默认配置文件：

```bash
# 自定义配置文件路径为 /opt/my.cnf
docker run -d \
  --name greatsql \
  -v /opt/my.cnf:/etc/my.cnf \
  greatsql/greatsql
```

### 方法二：使用docker-compose挂载配置文件

如果使用docker-compose管理容器，可以在docker-compose.yml文件中添加卷挂载配置：

```yaml
version: '2'
services:
  greatsql:
    image: greatsql/greatsql
    container_name: greatsql
    volumes:
      - /opt/my.cnf:/etc/my.cnf
```

然后使用以下命令启动容器：

```bash
docker-compose -f docker-compose.yml up -d
```

### 注意事项

1. 确保宿主机上的自定义配置文件路径正确，并且文件具有适当的权限；
2. 自定义配置文件中的参数会覆盖容器默认配置文件中的同名参数；
3. 自定义配置文件时如果无法启动容器，可以执行`docker logs greatsql`查看报错信息，再根据错误提示解决相应问题。

如果需要在GreatSQL容器中自定义默认的`/etc/my.cnf`文件路径，可以自行修改 [GreatSQL Docker项目](https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL) 相关代码实现，这里不赘述。

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
