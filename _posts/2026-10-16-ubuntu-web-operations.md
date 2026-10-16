---
layout: post
title: Ubuntu 小型 Web 项目运维实录：Docker Compose、Django 排障与服务导航
description: 整理 Django + MySQL + Nginx 项目在 Ubuntu 上的日常发版、代理与 CSRF 排障、数据库导入，以及用 Python 标准库搭建本机服务导航和可选 Docker 运维入口的实践。
tags: [Linux, Docker, Django, Nginx, MySQL, 运维, 部署]
math: false
mermaid: false
---

小型 Web 项目部署起来以后，运维里反复遇到的往往是同一批问题：改了配置没生效，登录突然 400，HTTPS 反代后后台 403，或者服务器上的服务越来越多，已经记不清哪个端口对应哪个页面。

这篇把部署 Django + MySQL + Nginx 项目时整理的运维笔记串起来，再补上一个轻量的本机服务导航。命令以 **Ubuntu 22.04 / 24.04、Docker Engine 和 Docker Compose v2** 为例，默认在 `docker-compose.yml` 或 `compose.yml` 所在目录执行；`backend`、`web`、`db` 是示例服务名，按实际配置替换。

Docker 的安装、镜像和 Compose 基础可以先看 [Docker 实用教程]({% post_url 2026-09-24-docker-guide %})；定时备份与恢复的完整方案见 [数据库定时备份与回滚]({% post_url 2026-10-14-db-backup %})。

## 1. 日常发版：先分清重启与重建

最常用的几条命令：

```bash
# 查看运行状态、端口和健康检查
docker compose ps

# 更新代码后构建并启动
git pull
docker compose up -d --build

# 修改 Compose 配置或由 Compose 注入的环境变量后，更新容器
docker compose up -d

# 只重启现有容器里的进程
docker compose restart backend

# 查看最近日志，或持续跟踪
docker compose logs --tail 100 backend
docker compose logs -f backend

# 进入容器排查
docker compose exec backend sh
```

**改了 `.env`，不要只跑 `restart`。** 如果变量通过 Compose 的 `environment`、`env_file` 或变量替换传入容器，需要 `up -d` 让 Compose 应用新配置；`restart` 沿用原来的容器配置。如果 `.env` 只是挂载进容器、由应用自己读取的文件，则按应用的读取方式决定是否重启。

`up -d` 是否会执行数据库迁移，取决于项目的启动脚本。只有项目已经在入口脚本中安排了 `migrate`、`collectstatic`，才可以省去手动执行。

几个容易影响数据的操作要分清楚：

| 操作 | 作用 | 使用前确认 |
| --- | --- | --- |
| `docker compose stop backend` | 停止某个服务，保留容器 | 是否会中断用户请求 |
| `docker compose down` | 删除这套 Compose 的容器与网络，默认保留命名卷 | 整套应用会停机；容器可写层里的数据会丢失 |
| `docker compose down -v` | 连相关数据卷一起删除 | 业务数据库通常不能这样清理 |
| `docker image prune` | 默认清理悬空镜像 | 旧镜像是否还用于回滚 |

磁盘满了先执行 `docker system df` 找占用来源。不要把带 `--volumes` 的清理命令当成日常清理方式，数据卷不是缓存。

## 2. 端口规划：先把访问链路理顺

一套应用只让 Web 入口对外，后端和数据库通过 Compose 网络互相访问。比如：

```yaml
services:
  web:
    ports:
      - "${HTTP_BIND:-127.0.0.1}:${HTTP_PORT:-8088}:80"
```

宿主机已有 Nginx 负责 HTTPS 时，将应用入口绑定在 `127.0.0.1`，访问链路就是：

```text
浏览器 → 宿主机 Nginx（HTTPS）→ 127.0.0.1:8088
      → 容器 Nginx → Django → MySQL
```

这样外部请求只能经过宿主机 Nginx，认证、证书和访问控制也更容易集中配置。

如果确实要直接通过内网 IP 访问容器入口，可以将 `HTTP_BIND` 改为指定的内网地址，或在确认访问范围后使用 `0.0.0.0`。云安全组、主机防火墙和 Docker 发布端口规则要分别核对；Docker 发布端口可能绕过常规 UFW 入站规则，不能只凭一条 UFW 规则判断隔离是否生效。

查端口占用：

```bash
sudo ss -ltnp 'sport = :8088'
```

`.env` 中的数据库密码、应用密钥等不要提交到 Git，并限制文件权限：

```bash
chmod 600 .env
```

## 3. Django 上线后的几个典型故障

### 3.1 页面能打开，但登录或接口返回 400

先在浏览器 F12 → Network 看状态码和响应内容。**400 且响应是 HTML** 时，优先查看后端日志中的 `DisallowedHost`，确认 `ALLOWED_HOSTS` 是否包含地址栏里的主机名或 IP。

下面是项目自定义环境变量的示例；Django 本身不会自动读取它，需要在 `settings.py` 中完成解析：

```dotenv
DJANGO_ALLOWED_HOSTS=localhost,192.168.1.20,pm.example.com
```

这里只写主机名或 IP，不带 `http://` 和端口。修改后执行：

```bash
docker compose up -d
docker compose logs --tail 100 backend
```

前端也应区分错误类型。不要把所有失败都显示成“用户名或密码错误”，否则代理、数据库和应用异常都会被误判成登录问题。

### 3.2 HTTPS 反代后，`/admin/` 登录返回 403

两层代理中，浏览器走 HTTPS，Django 收到的却可能是 HTTP。先核对浏览器发送的 `Origin`，再检查 Django 是否识别了原始协议和主机名。

宿主机 Nginx 应覆盖客户端传来的协议头，写入自己看到的协议：

```nginx
proxy_set_header Host $http_host;
proxy_set_header X-Forwarded-Proto $scheme;
```

容器 Nginx 如果再写一次 `X-Forwarded-Proto $scheme`，上游传来的 `https` 就会被覆盖为 `http`。在**容器入口只允许受信宿主机代理访问**的前提下，可以在容器 Nginx 的 `http` 上下文中保留上游协议：

```nginx
map $http_x_forwarded_proto $forwarded_proto {
    default $http_x_forwarded_proto;
    ""      $scheme;
}
```

对应的 `location` 中：

```nginx
proxy_set_header Host $http_host;
proxy_set_header X-Forwarded-Proto $forwarded_proto;
```

`$http_host` 会保留非默认端口，避免 `Origin` 与应用收到的 Host 不一致。Django 部署在受信代理后面时，配置：

```python
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
```

这要求外部流量不能绕过代理直接抵达 Django，且边缘代理会覆盖用户自行提交的协议头。若确实存在跨源表单请求，再按实际来源设置 `CSRF_TRUSTED_ORIGINS`，不要通过关闭 CSRF 来解决问题。

### 3.3 上传文件返回 413

Nginx 默认请求体大小限制可能不够。宿主机和容器都有 Nginx 时，**两层都要检查**：

```nginx
client_max_body_size 20m;
```

修改后先检查语法，再加载：

```bash
# 宿主机
sudo nginx -t && sudo systemctl reload nginx

# 容器
docker compose exec web nginx -t && docker compose exec web nginx -s reload
```

如果配置通过镜像打包或 Compose 变量生成，还需要按项目方式重建、更新容器。

### 3.4 日志里的客户端 IP 全是网关地址

代理之间需要正确传递 `X-Forwarded-For`，应用也只能信任实际的代理来源。不要为了方便就信任所有 Docker 私网地址，尤其不要在容器端口直接对外时，把任何来自网关的请求都当成受信代理请求。

先固定访问路径，再按实际代理 IP 或专用代理网络配置 `set_real_ip_from`。否则日志里的客户端 IP 可能来自用户伪造的请求头。

## 4. MySQL 导入导出：命令能跑不代表数据进对了库

数据库不发布宿主机端口时，直接在 `db` 容器里使用客户端即可。下面假设镜像中有 `mysql`、`mysqldump`，且配置了 `MYSQL_ROOT_PASSWORD`、`MYSQL_DATABASE`；生产中也可以改用专门授权的运维账号。

### 4.1 导出与导入

```bash
# 导出整库
docker compose exec -T db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysqldump -uroot --single-transaction --routines --triggers --default-character-set=utf8mb4 "$MYSQL_DATABASE"' > dump.sql

# 导入 SQL 文件
docker compose exec -T db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot --default-character-set=utf8mb4 "$MYSQL_DATABASE"' < data.sql
```

这里有两个细节：

- **重定向或管道操作加 `-T`**，不要分配伪终端。
- `sh -c` 的内容用单引号包住，让密码变量在容器里展开；密码不直接写入命令行参数，但环境变量也不等于秘密存储。

`--single-transaction` 适用于 InnoDB 的一致性导出，导出期间应避免修改表结构。对混合存储引擎或有其他一致性要求的库，需要另行设计备份策略。

整库导入可能覆盖已有表。先备份当前数据，再按项目情况暂停所有写入来源，包括后端、任务队列和定时任务。恢复后再核对迁移状态与业务数据，不要直接假设“容器能启动就恢复成功”。

### 4.2 外部 SQL 先检查，再导入

收到 Navicat、其他环境或旧服务器导出的 SQL，先看开头和关键语句：

```bash
head -n 60 data.sql
grep -nE '^(CREATE DATABASE|USE |SET @@GLOBAL|SET @@SESSION.SQL_LOG_BIN)|DEFINER=' data.sql | head
```

| 内容 | 常见问题 | 处理思路 |
| --- | --- | --- |
| `CREATE DATABASE`、`USE` | 导到了别的库 | 在副本中确认并修改目标库 |
| `GTID_PURGED` 等全局设置 | 目标实例权限或复制配置不兼容 | 优先从源端按目标用途重新导出 |
| `DEFINER` | 目标实例不存在对应账号 | 检查视图、触发器和存储程序的授权归属 |
| 非 UTF-8 文件 | 中文乱码或导入失败 | 确认原始编码后转换，不要靠反复导入试错 |

不要对整份 SQL 盲目执行正则替换，复杂的存储程序和字符串内容也可能被改坏。来自其他系统的数据，如果表结构和业务规则不同，更适合走经过校验的数据导入流程。

需要用 Navicat 临时连接时，可以为 `db` 添加仅绑定本机的端口：

```yaml
ports:
  - "127.0.0.1:3307:3306"
```

执行 `docker compose up -d`，通过 SSH 隧道连接 `127.0.0.1:3307`，用完删除端口配置并再次更新容器。

## 5. 给服务器加一个轻量服务导航

服务数量多了，单靠记端口不太方便。我把这部分整理成了 [service-portal](https://github.com/noSugarK/service-portal)：读取本机监听 TCP 端口，探测 HTTP/HTTPS，并展示名称、访问地址和响应状态。

它使用 Python 3.10+ 标准库，不需要 pip 包、数据库，也不需要为了运行导航本身额外装 Docker。默认按配置每轮扫描结束后等待 60 秒再扫描；页面可见时每 10 秒读取最新缓存。

### 5.1 安装与配置

将项目下载到服务器后：

```bash
git clone https://github.com/noSugarK/service-portal.git
cd service-portal

# 先检查 80 是否已占用
sudo ss -ltn 'sport = :80'
python3 -m unittest discover tests -v
```

如果 80 已被 Nginx 占用，**首次安装前**先编辑项目的 `config.json`，将导航绑定到本机的其他端口：

```json
{
  "bind": "127.0.0.1",
  "port": 9080,
  "scan_interval": 60,
  "probe_timeout": 1.5,
  "workers": 16,
  "include_loopback": false,
  "exclude_ports": [22, 3306, 6379],
  "docker_enabled": false,
  "services": {
    "8088": {"name": "业务系统", "path": "/"},
    "3000": {"name": "监控面板", "path": "/"}
  }
}
```

然后安装：

```bash
sudo bash install.sh
sudo systemctl status service-portal --no-pager
```

没有其他 Web 入口时也可以保留项目默认的 `0.0.0.0:80`，在可信内网直接访问服务器 IP。安装脚本创建独立系统账户并通过 systemd 启动；导航进程使用普通账户运行，绑定低端口的能力由 systemd 单独授予。

安装后的文件位置：

| 内容 | 路径 |
| --- | --- |
| 应用程序 | `/opt/service-portal/` |
| 运行配置 | `/etc/service-portal/config.json` |
| systemd 单元 | `/etc/systemd/system/service-portal.service` |

**后续修改运行配置要改 `/etc/service-portal/config.json`。** 重新安装会保留它，不会用项目目录里的配置覆盖。

已有 Nginx 时，可以参考仓库中的 `deploy/nginx.conf.example`，将独立域名代理到 `127.0.0.1:9080`，并配置 HTTPS 和所需访问控制。不要直接新建一个与现有站点冲突的 `default_server`。

### 5.2 看见服务，不等于客户端一定能访问

这几个边界比页面样式更值得关注：

- **导航不代理目标服务。** 它只提供入口，点击后仍访问目标端口；仅开放导航端口不能让其他端口自动可达。
- 只读取宿主机当前网络命名空间的监听 socket。Docker 通过 userland-proxy 发布的端口通常可发现，纯 DNAT、没有宿主监听 socket 的端口可能不会出现。
- 默认不展示只绑定回环地址的服务。前面的业务系统如果绑定在 `127.0.0.1:8088`，不会因此得到一个可远程访问的卡片。
- 服务别名配置只改名称与路径，不能凭空创建在线服务，也不会自动把回环地址变成域名入口。
- `401` 表示目标要求授权，`500` 表示目标返回错误；收到有效 HTTP 响应不代表业务健康。
- 本地 HTTPS 探测接受自签名证书，浏览器点击后仍正常校验证书；HTTPS 数量不代表证书可信。
- 依赖特定域名或 Host 头的服务，需要另外规划入口，不能假设 IP 加端口能替代域名。

页面上的“刷新列表”只读取最近一次扫描缓存，不会立刻启动新扫描。排查时可以分别查看进程存活与扫描状态：

```bash
# 使用本文 9080 配置时
curl http://127.0.0.1:9080/healthz
curl http://127.0.0.1:9080/api/services
sudo journalctl -u service-portal -n 100 --no-pager
```

`/healthz` 只反映 HTTP 进程存活。扫描是否成功还要看 `/api/services` 的 `error`、`updated_at` 和日志。

## 6. 可选：开启 Docker 基础运维入口

项目另有一个独立的 `/docker` 页面，可以搜索容器、查看最近日志、启动、停止和重启。服务导航主页没有放跳转链接，需要直接访问该路径。

它默认关闭。只有确实需要网页操作容器时才开启：**Docker socket 的控制权限通常相当于主机 root 权限**，systemd 对导航进程的普通权限限制不能消除这项能力。

### 6.1 开启步骤

先确保宿主机已经安装并运行 Docker Engine，存在 `docker` 用户组和 `/var/run/docker.sock`。当前实现不支持 rootless 或远程 Docker。

编辑已安装的 `/etc/service-portal/config.json`，设置：

```json
"docker_enabled": true
```

上面是一项配置字段，需要放入原有 JSON 对象中。随后创建仅 root 可读的令牌文件；文件已存在时命令会报错，不覆盖旧令牌：

```bash
sudo install -d -m 755 /etc/service-portal
sudo python3 -c 'import os,secrets; fd=os.open("/etc/service-portal/docker.env", os.O_WRONLY|os.O_CREAT|os.O_EXCL, 0o600); os.write(fd, ("SERVICE_PORTAL_DOCKER_TOKEN="+secrets.token_hex(32)+"\n").encode()); os.close(fd)'
```

在项目目录重新安装，脚本会根据运行配置添加 Docker 用户组权限并重启服务：

```bash
sudo bash install.sh
sudo systemctl show service-portal -p SupplementaryGroups
sudo journalctl -u service-portal -n 50 --no-pager
```

`SupplementaryGroups` 应包含 `docker`。在服务器终端读取令牌文件，将等号后面的值输入页面：

```bash
sudo cat /etc/service-portal/docker.env
```

不要把令牌放进 URL、文章或截图。页面只在当前内存中保留令牌，刷新页面或断开后需要重新输入。

### 6.2 访问与操作边界

使用域名或公网 IP 访问 Docker 页面需要 HTTPS。页面也允许通过私有 IPv4、localhost 和回环地址使用 HTTP，但 HTTP 本身不加密令牌，只适合可信环境；这一前端检查不会自动为后端 API 限制来源 IP。

不准备配置公开入口时，可以通过 SSH 转发访问。沿用本文的 9080 配置：

```bash
ssh -N -L 19080:127.0.0.1:9080 user@server
```

在本机打开 `http://localhost:19080/docker`。如果导航在服务器监听的是 80，把转发目标的 `9080` 改为 `80`。

反向代理要保留原始 Host，并透传 `Authorization`，否则可能出现令牌认证或跨站检查失败。日常使用还要注意：

- 容器列表手动刷新；停止和重启前需要确认。
- 日志最多读取最近 200 行、256 KiB，不实时追踪。
- 只提供固定的日志、启动、停止、重启操作，不提供终端、删除、镜像或 Compose 管理。
- 请求超时后操作可能已经完成，先刷新状态，再决定是否重试。

关闭时，将 `docker_enabled` 改回 `false`，重新执行安装脚本。脚本会撤销自己管理的 Docker 用户组授权；管理员手动添加的其他授权仍需自行核对。

## 7. 把排障顺序固定下来

出问题时，按访问链路一层层缩小范围，比同时改几个配置有效：

1. **浏览器看请求。** 状态码、响应类型、实际 URL 和 Origin 是第一手线索。
2. **看容器状态。** `docker compose ps`，有没有反复重启或健康检查失败。
3. **查应用日志。** `docker compose logs --tail 200 backend`，重点找 Host、CSRF、迁移和数据库连接错误。
4. **查代理和数据库日志。** 分别看 `web`、`db`，再检查宿主机 Nginx 日志。
5. **绕过外层代理验证。** `curl -i http://127.0.0.1:8088/`，必要时指定业务需要的 Host；能通只能说明这一路径可达，还要继续核对协议与请求头。
6. **应用配置后复测。** Compose 环境变化用 `up -d`，Nginx 修改先 `nginx -t`，确认成功后再从其他机器访问。

服务导航本身升级时，上传新版代码并重新执行 `sudo bash install.sh`，已有运行配置与令牌会保留。自定义 systemd 配置通过 `systemctl edit service-portal` 写 override，避免直接改主单元后被升级覆盖。

发版回滚也要把代码和数据分开考虑。旧版本代码未必兼容新版本迁移后的表结构；真正需要整库恢复时，先备份当前状态，再在独立库验证备份，最后安排停写和切换。具体命令与定时备份脚本放在前面链接的备份文章中。
