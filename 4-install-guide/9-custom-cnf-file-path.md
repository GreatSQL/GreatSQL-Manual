# 自定义 GreatSQL 配置文件路径

本文档介绍在不同环境下如何自定义指定 GreatSQL 配置文件（my.cnf）的路径。

## RPM 包方式安装 GreatSQL 时自定义 my.cnf 文件路径

使用 RPM 包方式成功安装 GreatSQL 之后，默认采用 systemd 管理 GreatSQL 数据库服务，默认的配置文件路径为`/etc/my.cnf`。如果需要使用自定义路径的配置文件，可以通过修改 systemd 服务配置文件来实现。

下面以 CentOS 系统环境为例，说明如何自定义 my.cnf 文件路径。

- 1. 查看当前的 systemd 服务配置文件

```bash
cat /lib/systemd/system/mysqld.service
```

- 2. 编辑该服务配置文件

```bash
vi /lib/systemd/system/mysqld.service
```

- 3. 在 `ExecStart` 参数中添加 `--defaults-file` 选项来指定自定义配置文件路径

```ini
# 自定义配置文件路径为 /opt/my.cnf
ExecStart=/usr/sbin/mysqld --defaults-file=/opt/my.cnf $MYSQLD_OPTS
```

- 4. 保存并退出编辑器

- 5. 重新加载 systemd 配置

```bash
systemctl daemon-reload
```

- 6. 重启 GreatSQL 服务使配置生效

```bash
systemctl restart mysqld
```

查看 GreatSQL 日志文件，确认自定义配置文件生效并能正确启动。

## 二进制包方式安装 GreatSQL 时自定义 my.cnf 文件路径

### 使用 systemd 方式启动时自定义配置文件路径

- 1. 查看或创建 GreatSQL 的 systemd 服务配置文件

```bash
cat /usr/lib/systemd/system/greatsql.service
```

如果文件不存在，可以创建一个新的配置文件。详情参考：[利用 systemd 管理 GreatSQL](./8-greatsql-with-systemd.md)。

- 2. 编辑该服务配置文件，在 `ExecStart` 参数中添加 `--defaults-file` 选项

```ini
# 自定义配置文件路径为 /opt/my.cnf
ExecStart=/usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=/opt/my.cnf $MYSQLD_OPTS
```

- 3. 保存并退出编辑器

- 4. 重新加载 systemd 配置

```bash
systemctl daemon-reload
```

- 5. 重启 GreatSQL 服务

```bash
systemctl restart greatsql
```

查看 GreatSQL 日志文件，确认自定义配置文件生效并能正确启动。

### 使用命令行方式启动时自定义配置文件路径

在使用命令行直接启动 GreatSQL 时，可以通过`--defaults-file`选项来指定自定义配置文件路径：

```bash
# 自定义配置文件路径为 /opt/my.cnf
/usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin/mysqld --defaults-file=/opt/my.cnf &
```

也可以使用 `mysqld_safe` 命令：

```bash
# 自定义配置文件路径为 /opt/my.cnf
/usr/local/GreatSQL-8.4.4-5-Linux-glibc2.28-x86_64/bin/mysqld_safe --defaults-file=/opt/my.cnf &
```

查看 GreatSQL 日志文件，确认自定义配置文件生效并能正确启动。

## Docker 容器中自定义外部 my.cnf 文件路径

在 Docker 环境中，默认情况下 GreatSQL 容器会使用容器内部自带的配置文件。如果需要使用外部自定义的配置文件，可以通过 Docker 的卷挂载功能实现。

### 方法一：直接替换容器的默认配置文件

也可以直接挂载自定义配置文件来替换容器内的默认配置文件：

```bash
# 自定义配置文件路径为 /opt/my.cnf
docker run -d \
  --name greatsql \
  -v /opt/my.cnf:/etc/my.cnf \
  greatsql/greatsql
```

### 方法二：使用 docker-compose 挂载配置文件

如果使用 docker-compose 管理容器，可以在 docker-compose.yml 文件中添加卷挂载配置：

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

如果需要在 GreatSQL 容器中自定义默认的`/etc/my.cnf`文件路径，可以自行修改 [GreatSQL Docker 项目](https://gitee.com/GreatSQL/GreatSQL-Docker/tree/master/GreatSQL) 相关代码实现，这里不赘述。

**扫码关注微信公众号**

![greatsql-wx](../greatsql-wx.jpg)
