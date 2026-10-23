---
layout: post
title: 本地部署 GitLab：安装、首次登录、中文、Pages、Runner 与流水线发布
description: 用 Docker Compose 在内网部署 GitLab CE 的分步清单：与 GitHub 的对比、安装前规划、首次登录必做事项、切换中文、开启 Pages、注册 Runner、构建镜像并自动发布。
tags: [GitLab, Docker, CI/CD, 运维, 部署]
math: false
mermaid: false
---

本文是一份**按顺序执行的清单**。环境：Ubuntu 22.04 / 24.04 + Docker Compose v2。示例地址 `gitlab.example.com` → `192.168.1.10`，按实际替换。

部署完成后的团队、权限和开发规范见下篇：[GitLab 团队协作与开发流程规范]({% post_url 2026-10-23-gitlab-team-workflow %})。

## 1. GitLab 和 GitHub 怎么选

| 对比项 | GitHub | 自建 GitLab CE |
| --- | --- | --- |
| 部署 | 只有云服务（企业版 GHES 可自建，收费） | 免费自建，代码不出内网 |
| 费用 | 公开/私有仓库免费，高级功能按人收费 | 软件免费，只花服务器钱 |
| 维护 | 无需维护 | 自己负责备份、升级、安全 |
| 内网访问 | 依赖外网，国内速度不稳定 | 局域网速度，断外网也能用 |
| CI/CD | GitHub Actions，`.github/workflows/*.yml` | GitLab CI，`.gitlab-ci.yml`，Runner 自建 |
| 静态网站 | GitHub Pages | GitLab Pages |
| 镜像库 | GHCR | 内置 Container Registry |
| 组织结构 | Organization → Team，一层 | Group → 子 Group，可多层嵌套 |
| 权限粒度 | Read / Triage / Write / Maintain / Admin | Guest / Planner / Reporter / Developer / Maintainer / Owner |
| 合并请求 | Pull Request (PR) | Merge Request (MR) |
| 开源生态 | 全球最大，社区协作首选 | 较小 |

**结论**：开源项目、个人项目用 GitHub；公司内网、代码保密、需要自主可控的 CI/CD 用自建 GitLab。GitHub 的用法见 [GitHub 使用指南]({% post_url 2026-09-23-github-guide %})。

## 2. 安装前准备

**① 确认配置**：至少 4 核 8 GB 内存，50 GB SSD。内存小于 4 GB 跑不起来。

**② 加 swap**（`free -h` 显示没有 swap 时）：

```bash
sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

**③ 定访问地址**：推荐用域名，客户端 hosts 加一行即可（Windows 在 `C:\Windows\System32\drivers\etc\hosts`）：

```text
192.168.1.10  gitlab.example.com
```

> 地址定了就不要改，克隆地址、Runner、Pages 都依赖它。

**④ 规划端口**，并检查是否被占用：

| 端口 | 用途 |
| --- | --- |
| 80 | Web、Pages |
| 2222 → 22 | Git SSH（宿主机 sshd 占着 22） |
| 5050 | 镜像库 |

```bash
sudo ss -lntp | grep -E ':(80|2222|5050)\s'
```

**⑤ 建数据目录**：

```bash
sudo mkdir -p /srv/gitlab/{config,logs,data}
```

## 3. 启动 GitLab

**① 新建 `/srv/gitlab/.env`**，版本到 [Docker Hub](https://hub.docker.com/r/gitlab/gitlab-ce/tags) 查，不要用 `latest`：

```bash
GITLAB_VERSION=18.5.1-ce.0
```

**② 新建 `/srv/gitlab/compose.yml`**：

```yaml
services:
  gitlab:
    image: gitlab/gitlab-ce:${GITLAB_VERSION}
    container_name: gitlab
    restart: always
    hostname: gitlab.example.com
    shm_size: "256m"
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url 'http://gitlab.example.com'
        gitlab_rails['gitlab_shell_ssh_port'] = 2222
        gitlab_rails['time_zone'] = 'Asia/Shanghai'
        puma['worker_processes'] = 2
        sidekiq['concurrency'] = 10
        prometheus_monitoring['enable'] = false
    ports:
      - "80:80"
      - "2222:22"
    volumes:
      - ./config:/etc/gitlab
      - ./logs:/var/log/gitlab
      - ./data:/var/opt/gitlab
```

**③ 启动**，等 `STATUS` 变成 `healthy`（约 3～5 分钟）：

```bash
cd /srv/gitlab
docker compose up -d
docker compose ps
```

**以后改配置**：改 `GITLAB_OMNIBUS_CONFIG` 后执行 `docker compose up -d`（`restart` 不生效）。

## 4. 第一次登录

**① 取 root 初始密码**（24 小时后自动删除）：

```bash
docker exec -it gitlab grep 'Password:' /etc/gitlab/initial_root_password
```

忘了就重置：`docker exec -it gitlab gitlab-rake "gitlab:password:reset[root]"`

**② 浏览器打开 `http://gitlab.example.com`，用 `root` 登录，依次完成：**

| # | 操作 | 位置 |
| --- | --- | --- |
| 1 | 改 root 密码 | 头像 → Edit profile → Password |
| 2 | **关闭公开注册** | Admin → Settings → General → Sign-up restrictions → 取消 Sign-up enabled |
| 3 | 建自己的管理员账号，之后不用 root | Admin → Users → New user → Access level: Administrator |
| 4 | 开启 2FA | 头像 → Edit profile → Account |
| 5 | 默认分支设为 `main` | Admin → Settings → Repository → Default branch |
| 6 | 允许 Webhook 访问内网 | Admin → Settings → Network → Outbound requests → 勾选 Allow requests to the local network |
| 7 | 添加 SSH 公钥 | 头像 → Edit profile → SSH Keys |

**③ 客户端配置 SSH 端口**，在 `~/.ssh/config` 加：

```text
Host gitlab.example.com
    Port 2222
    User git
```

验证：`ssh -T git@gitlab.example.com`，看到 `Welcome to GitLab` 即成功。

## 5. 界面改成中文

| 范围 | 位置 |
| --- | --- |
| 自己 | 头像 → Preferences → Localization → Language → **简体中文** → Save changes |
| 新用户默认 | Admin → Settings → Preferences → Localization → Default language |

已有用户需各自修改。部分页面中英混排属正常。

## 6. 开启 Pages

**① 选方案**：

| 有通配 DNS（`*.pages.example.com`） | 没有通配 DNS |
| --- | --- |
| 地址：`http://组名.pages.example.com/项目名` | 地址：`http://pages.example.com/组名/项目名` |
| 配置不加 `namespace_in_path` | 配置加 `gitlab_pages['namespace_in_path'] = true`（需较新版本） |

**② 在 `GITLAB_OMNIBUS_CONFIG` 中追加**，然后 `docker compose up -d`：

```ruby
pages_external_url 'http://pages.example.com'
gitlab_pages['enable'] = true
gitlab_pages['access_control'] = true
```

**③ 项目里添加 `.gitlab-ci.yml`**（需要先完成第 7 节 Runner）：

```yaml
pages:
  image: node:20-alpine
  script:
    - npm ci && npm run build
    - rm -rf public && mv dist public
  artifacts:
    paths: [public]
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```

> 两条规矩：任务名必须叫 `pages`，产物必须在 `public/`。

**④ 查看地址**：项目 → Deploy → Pages。

## 7. 安装 Runner

**① 在 GitLab 创建 Runner**：Admin → CI/CD → Runners → New instance runner → 勾选 **Run untagged jobs** → 创建 → 复制 `glrt-` 开头的令牌。

**② 新建 `/srv/gitlab-runner/compose.yml` 并启动**：

```yaml
services:
  gitlab-runner:
    image: gitlab/gitlab-runner:latest
    container_name: gitlab-runner
    restart: always
    volumes:
      - ./config:/etc/gitlab-runner
      - /var/run/docker.sock:/var/run/docker.sock
```

```bash
cd /srv/gitlab-runner && docker compose up -d
```

**③ 注册**：

```bash
docker exec -it gitlab-runner gitlab-runner register --non-interactive \
  --url "http://gitlab.example.com" \
  --token "glrt-xxxxxxxx" \
  --executor "docker" \
  --docker-image "alpine:latest"
```

**④ 修改 `/srv/gitlab-runner/config/config.toml`**，解决任务容器解析不了内网域名的问题：

```toml
[[runners]]
  clone_url = "http://192.168.1.10"
  [runners.docker]
    extra_hosts = ["gitlab.example.com:192.168.1.10"]
    privileged = true          # 第 8 节构建镜像需要，仅限可信项目
```

**⑤ 验证**：随便建个项目，提交下面的 `.gitlab-ci.yml`，在 Build → Pipelines 看到通过即可。

```yaml
hello:
  script: echo "Runner OK"
```

## 8. 流水线发布

流程：**合并到 `main` → 构建镜像 → 推到 GitLab 镜像库 → 点按钮 SSH 部署到服务器**。

**① 开启镜像库**：`GITLAB_OMNIBUS_CONFIG` 追加下面一行，`ports` 加 `"5050:5050"`，然后 `docker compose up -d`。

```ruby
registry_external_url 'http://gitlab.example.com:5050'
```

**② 允许 HTTP 镜像库**：Runner 机器和部署服务器的 `/etc/docker/daemon.json` 都加上，然后 `sudo systemctl restart docker`。

```json
{ "insecure-registries": ["gitlab.example.com:5050"] }
```

**③ 准备部署服务器**（示例 `192.168.1.20`）：

```bash
# 在任意机器生成 CI 专用密钥，公钥放到部署服务器
ssh-keygen -t ed25519 -f gitlab_ci_key -N ""
ssh-copy-id -i gitlab_ci_key.pub deploy@192.168.1.20

# 在部署服务器登录镜像库（项目 → Settings → Repository → Deploy tokens，勾 read_registry）
docker login gitlab.example.com:5050 -u <token用户名> -p <token>
```

部署服务器的 `/srv/myapp/compose.yml`：

```yaml
services:
  web:
    image: gitlab.example.com:5050/team/myapp:latest
    restart: always
    ports: ["8080:80"]
```

**④ 添加 CI/CD 变量**：项目 → Settings → CI/CD → Variables

| Key | 类型 | 值 | 勾选 |
| --- | --- | --- | --- |
| `SSH_PRIVATE_KEY` | File | `gitlab_ci_key` 私钥全文 | Protected |
| `DEPLOY_TARGET` | Variable | `deploy@192.168.1.20` | Protected |

**⑤ 项目根目录添加 `.gitlab-ci.yml`**：

```yaml
stages: [test, build, deploy, release]

variables:
  IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA
  DOCKER_HOST: tcp://docker:2375
  DOCKER_TLS_CERTDIR: ""

test:
  stage: test
  image: node:20-alpine
  script: [npm ci, npm test]
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

build:
  stage: build
  image: docker:27
  services:
    - name: docker:27-dind
      command: ["--insecure-registry=gitlab.example.com:5050"]
  script:
    - echo "$CI_REGISTRY_PASSWORD" | docker login -u "$CI_REGISTRY_USER" --password-stdin "$CI_REGISTRY"
    - docker build -t "$IMAGE" -t "$CI_REGISTRY_IMAGE:latest" .
    - docker push "$IMAGE"
    - docker push "$CI_REGISTRY_IMAGE:latest"
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

deploy:
  stage: deploy
  image: alpine:latest
  environment: production
  script:
    - apk add --no-cache openssh-client
    - chmod 600 "$SSH_PRIVATE_KEY"
    - ssh -i "$SSH_PRIVATE_KEY" -o StrictHostKeyChecking=accept-new "$DEPLOY_TARGET"
      "cd /srv/myapp && docker compose pull && docker compose up -d"
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
      when: manual     # 删掉这行即自动发布

release:
  stage: release
  image: registry.gitlab.com/gitlab-org/release-cli:latest
  script: echo "release $CI_COMMIT_TAG"
  release:
    tag_name: $CI_COMMIT_TAG
    description: "镜像 $IMAGE"
  rules:
    - if: $CI_COMMIT_TAG
```

**⑥ 效果**：

| 操作 | 触发 |
| --- | --- |
| 提 MR | `test` |
| 合并到 `main` | `test` → `build` → `deploy`（点 ▶ 发布） |
| 打 tag `v1.0.0` | 生成 Release（Deploy → Releases） |

> 内网不能访问外网时，`docker:27`、`node:20-alpine`、`release-cli` 等镜像要先在能联网的机器 `docker save`，再 `docker load` 导入。

## 9. 备份与升级

**备份**（两样都要，缺一不可）：

```bash
docker exec -t gitlab gitlab-backup create          # 产物在 /srv/gitlab/data/backups/
sudo tar czf /backup/gitlab-config-$(date +%F).tar.gz -C /srv/gitlab config   # 含 gitlab-secrets.json
```

定时执行可套用 [数据库定时备份与回滚]({% post_url 2026-10-14-db-backup %}) 里的 cron。

**升级**：

1. 先备份。
2. 用官方 [Upgrade Path 工具](https://gitlab-com.gitlab.io/support/toolbox/upgrade-path/) 查出必经版本。
3. 依次改 `.env` 的 `GITLAB_VERSION` → `docker compose up -d`。
4. 每步等 Admin → Monitoring → Background migrations 全部完成再升下一步。

## 10. 排障速查

| 现象 | 处理 |
| --- | --- |
| 页面 502 | 刚启动等几分钟；持续 502 查 `docker compose logs gitlab` 和内存 |
| 克隆地址不对 | 检查 `external_url`、`gitlab_shell_ssh_port` |
| 任务一直 pending | Runner 是否 Online；是否勾了 Run untagged jobs |
| `Could not resolve host` | 7.④ 的 `extra_hosts` / `clone_url` |
| `server gave HTTP response to HTTPS client` | 8.② 的 `insecure-registries` |
| `Cannot connect to the Docker daemon` | Runner 没开 `privileged` |
| Pages 404 | 任务名是否 `pages`，产物是否在 `public/` |
| 读不到 `SSH_PRIVATE_KEY` | 变量勾了 Protected，但分支/tag 没受保护 |

下一步：[GitLab 团队协作与开发流程规范]({% post_url 2026-10-23-gitlab-team-workflow %})。
