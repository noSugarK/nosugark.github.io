---
layout: post
title: GitHub 上手：账号、Pages、Actions 与 Releases
description: GitHub 注册与 2FA、个人主页 README、GitHub Pages 建站与自定义域名、用 GitHub Actions 跑测试和发布 Releases
tags: [GitHub, 工具, 部署]
math: false
mermaid: false
---
{%- comment -%} 正文的 Actions 示例里有双花括号表达式，整篇关掉 Liquid 解析 {%- endcomment -%}
{% raw %}

> [!NOTE]
> 这篇接着 [Git 入门](/blog/2026/09/23/git-basics/) 写：Git 是本地的版本管理工具，GitHub 是托管 Git 仓库的网站，在它上面还能建站、跑自动化任务、发布软件。

## 1. 注册账号

1. 打开 [github.com/signup](https://github.com/signup)，填邮箱、密码、**用户名**。
2. 邮箱会收到一个验证码，填回去完成验证。
3. 选择免费计划（Free）就够用：公开仓库和私有仓库都不限数量。

> [!TIP]
> **用户名要慎重。**它会出现在你的主页地址 `github.com/用户名`、Pages 网址 `用户名.github.io` 和所有仓库地址里。以后可以改，但改名后旧链接会失效，别人引用你仓库的地址也得跟着改。

注册完建议马上做两件事：

- **Settings → Emails**：勾选 *Keep my email addresses private*。之后网页上的操作会用 `ID+用户名@users.noreply.github.com` 代替你的真实邮箱。
- 本地 Git 的 `user.email` 设成**已添加到 GitHub 账号**的邮箱（或上面那个 noreply 邮箱），这样提交记录才会关联到你的头像和贡献图。

## 2. 开启两步验证（2FA）

GitHub 要求所有提交代码的账号开启两步验证，没开的账号会收到限期开启的提醒，到期后部分功能会被限制。与其等提醒，不如注册完就开。

**路径**：右上角头像 → **Settings** → **Password and authentication** → **Enable two-factor authentication**

可选的验证方式：

| 方式 | 说明 |
|--|--|
| **验证器 App（推荐）** | 用 Microsoft Authenticator、Google Authenticator、1Password 等扫描页面上的二维码，之后每次登录输入 App 里的 6 位动态码 |
| **GitHub Mobile** | 装了 GitHub 手机 App 后，登录时手机上点一下"批准"即可 |
| **Passkey / 安全密钥** | 用指纹、面容或 YubiKey 这类硬件密钥，最安全也最方便 |
| 短信 | 部分地区可用，安全性最弱，只建议当备用 |

> [!WARNING]
> 开启时 GitHub 会给出一组 **Recovery codes（恢复码）**，一定要下载下来存到安全的地方（密码管理器最合适）。手机丢了、验证器 App 被删时，恢复码是找回账号的唯一办法，GitHub 客服也没法绕过 2FA 帮你登录。

开启 2FA 以后，命令行 `git push` **不能再用账号密码**，需要改用下面两种方式之一：

- **SSH 密钥**（推荐）：在 **Settings → SSH and GPG keys** 添加公钥，具体步骤见 [Git 入门](/blog/2026/09/23/git-basics/) 第 2 节。
- **Personal Access Token**：在 **Settings → Developer settings → Personal access tokens** 生成，push 时把它当密码填。建议选 *Fine-grained tokens*，只授权需要的仓库，并设置过期时间。

## 3. 同名仓库：定制个人主页

新建一个**和用户名完全相同**的公开仓库，比如用户名是 `noSugarK`，仓库就叫 `noSugarK`。创建时 GitHub 会提示这是一个特殊仓库（*special repository*）。

仓库根目录的 `README.md` 会显示在你的个人主页 `github.com/用户名` 最上方，可以用来写自我介绍、技术栈、联系方式：

```markdown
## 你好，我是 noSugarK 👋

- 🔭 正在做：个人博客 [nosugark.cc.cd](https://nosugark.cc.cd)
- 🌱 在学：Rust、计算机视觉
- 📫 联系我：在 Issue 里 @我

### 技术栈

![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white)
![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?logo=javascript&logoColor=black)
```

生效条件：仓库必须是**公开**的，并且根目录有 `README.md`。

> [!TIP]
> 个人主页上还可以 **Pin（置顶）** 最多 6 个仓库：主页上 *Popular repositories* 右边的 *Customize your pins*。把最能代表你的项目放上去。

## 4. GitHub Pages：免费托管静态网站

GitHub Pages 把仓库里的 HTML/CSS/JS 直接发布成网站，公开仓库免费使用。只能托管**静态网站**，不能跑 PHP、数据库这类后端程序。

### 4.1 两种站点

| 类型 | 仓库名 | 网址 |
|--|--|--|
| 用户站点 | `用户名.github.io`（必须完全一致） | `https://用户名.github.io` |
| 项目站点 | 任意仓库 | `https://用户名.github.io/仓库名` |

每个账号只有**一个**用户站点，但每个仓库都能再开一个项目站点。本站就是用户站点，仓库是 `noSugarK/nosugark.github.io`。

### 4.2 最快上线：从分支发布

1. 新建仓库 `用户名.github.io`，设为公开。
2. 根目录放一个 `index.html`：

   ```html
   <!doctype html>
   <html lang="zh-CN">
   <head><meta charset="utf-8"><title>我的主页</title></head>
   <body><h1>Hello, GitHub Pages!</h1></body>
   </html>
   ```

3. 仓库 **Settings → Pages → Build and deployment**：
   - **Source** 选 *Deploy from a branch*
   - **Branch** 选 `main`，目录选 `/ (root)`（也可以选 `/docs`，只发布 docs 目录）
4. 保存后等一两分钟，页面顶部会显示网址，打开就能看到。之后每次 push 到 `main`，网站都会自动更新。

> [!NOTE]
> 从分支发布时 GitHub 默认会用 **Jekyll** 处理一遍仓库，Markdown 会被转成网页，本站的博客就是这么来的。如果你放的是纯 HTML 或者 Vue/React 打包后的产物，在根目录放一个空文件 `.nojekyll` 关掉这一步，否则以下划线开头的目录（如 `_assets`）会被忽略。

### 4.3 Vue / React / Vite 项目：用 Actions 发布

需要先构建（`npm run build`）的项目，把 **Source** 改成 *GitHub Actions*，再加一个工作流，每次 push 自动构建并发布（Actions 的写法见第 6 节）：

```yaml
# .github/workflows/pages.yml
name: Deploy Pages

on:
  push:
    branches: [main]
  workflow_dispatch:          # 允许在 Actions 页面手动运行

permissions:
  contents: read
  pages: write                # 发布 Pages 需要
  id-token: write             # 部署时的身份验证需要

concurrency:                  # 同时只跑一个部署，新的会排队
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v6
      - uses: actions/upload-pages-artifact@v5
        with:
          path: dist           # 构建产物目录，Vite 默认是 dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

> [!TIP]
> 项目站点的网址带着仓库名（`/仓库名/`），Vite 要在 `vite.config.js` 里设置 `base: "/仓库名/"`，否则页面能打开但 JS、CSS 全部 404。用户站点和自定义域名不需要设置。

## 5. 自定义域名

`用户名.github.io` 能用，但换成自己的域名更好记。以本站为例，`nosugark.cc.cd` 指向的就是 `nosugark.github.io`。

### 5.1 在域名服务商添加 DNS 记录

**子域名**（如 `blog.example.com`、`www.example.com`）：加一条 CNAME 记录。

| 类型 | 主机记录 | 记录值 |
|--|--|--|
| CNAME | `blog` | `用户名.github.io` |

**根域名**（如 `example.com`）：不能用 CNAME，改加 4 条 A 记录（想支持 IPv6 就再加 4 条 AAAA 记录）：

| 类型 | 主机记录 | 记录值 |
|--|--|--|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |

根域名最好再给 `www` 加一条 CNAME 指向 `用户名.github.io`，GitHub 会自动把 `www.example.com` 和 `example.com` 互相跳转。

### 5.2 在 GitHub 上绑定

1. 仓库 **Settings → Pages → Custom domain**，填入域名，点 *Save*。
2. GitHub 会检查 DNS，显示 *DNS check successful* 就说明解析生效了（DNS 生效可能要几分钟到几小时）。
3. 勾选 **Enforce HTTPS**。GitHub 会自动申请免费的 HTTPS 证书，刚绑定时这个选项可能是灰的，等证书签发好（通常十几分钟）再勾。

从分支发布的站点，保存后 GitHub 会在仓库根目录提交一个 `CNAME` 文件，内容就是你的域名，**不要删**。用 Actions 发布的站点不读这个文件，以 Settings 里填的为准。

```bash
# 检查解析是否生效
nslookup blog.example.com
```

> [!WARNING]
> 建议再去**账号**的 **Settings → Pages → Add a domain** 验证域名所有权（按提示加一条 TXT 记录）。不验证的话，如果你哪天删了仓库但 DNS 还指着 GitHub，别人就能在自己的仓库里绑定你的域名，冒用它发布内容。

## 6. GitHub Actions：自动化

GitHub Actions 是 GitHub 自带的 CI/CD 服务：发生某个事件（push、提 PR、打 tag、定时）时，GitHub 会分配一台虚拟机，按你写的步骤执行命令。公开仓库免费不限时长，私有仓库每月有免费额度。

### 6.1 基本概念

| 概念 | 含义 |
|--|--|
| **Workflow（工作流）** | `.github/workflows/` 下的一个 `.yml` 文件，一个仓库可以有多个 |
| **Event（触发事件）** | `on:` 里写什么时候运行：`push`、`pull_request`、`schedule`、`workflow_dispatch`（手动） |
| **Job（任务）** | 一个工作流由一个或多个 Job 组成，默认**并行**运行，每个 Job 在一台全新的虚拟机里跑 |
| **Runner（运行器）** | `runs-on:` 指定的虚拟机：`ubuntu-latest`、`windows-latest`、`macos-latest` |
| **Step（步骤）** | Job 里按顺序执行的每一步，可以是 `run:` 一条命令，也可以是 `uses:` 一个现成的 Action |
| **Action** | 别人封装好的可复用步骤，在 [GitHub Marketplace](https://github.com/marketplace?type=actions) 里找 |

### 6.2 第一个工作流

在仓库里新建 `.github/workflows/hello.yml`，push 上去：

```yaml
name: Hello

on: [push]

jobs:
  hello:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7          # 把仓库代码拉到虚拟机里
      - run: echo "Hello, ${{ github.actor }}!"
      - run: ls -la
```

打开仓库的 **Actions** 标签页，就能看到这次运行，点进去可以看每一步的输出日志。失败时会显示红叉，GitHub 默认也会发邮件通知你。

### 6.3 用 Actions 跑测试

最常见的用法：每次 push 或提 PR，自动跑一遍测试，没通过就亮红叉，别人一眼就能看到。

**Python 项目（pytest）**，同时在三个 Python 版本上测试：

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:                               # 矩阵：每个版本各跑一遍，并行执行
        python-version: ["3.11", "3.12", "3.13"]
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-python@v7
        with:
          python-version: ${{ matrix.python-version }}
          cache: pip                        # 缓存依赖，第二次起安装更快
      - run: pip install -r requirements.txt
      - run: pip install pytest
      - run: pytest -v
```

**Node.js 项目**：

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 22
          cache: npm
      - run: npm ci                  # 按 package-lock.json 精确安装
      - run: npm run lint --if-present
      - run: npm test
```

> [!TIP]
> 配合 [Git 入门](/blog/2026/09/23/git-basics/) 里说的分支保护：仓库 **Settings → Branches** 给 `main` 加规则，勾选 *Require status checks to pass*，选上 `test`。这样测试没通过的 PR 就合并不了。

### 6.4 密钥：Secrets

工作流里要用到 API Key、服务器密码时，**不要写进 yml 文件**，而是放到仓库 **Settings → Secrets and variables → Actions → New repository secret**，在工作流里这样引用：

```yaml
      - run: python deploy.py
        env:
          API_KEY: ${{ secrets.API_KEY }}
```

Secrets 在日志里会自动显示成 `***`。另外每次运行 GitHub 会自动提供一个 `GITHUB_TOKEN`，用来操作当前仓库（发 Release、评论 PR），不用自己创建，权限在工作流的 `permissions:` 里声明。

### 6.5 其他常用触发方式

```yaml
on:
  schedule:
    - cron: "0 1 * * *"      # 每天 UTC 1:00（北京时间 9:00）运行
  workflow_dispatch:          # Actions 页面出现 "Run workflow" 按钮，可手动触发
  push:
    paths: ["src/**"]         # 只有 src 目录有改动才运行
```

## 7. 发布 Releases

Release 是给某个版本打的"正式发布包"：一个 Git 标签 + 更新说明 + 可下载的文件（安装包、压缩包），用户在仓库右侧的 **Releases** 里就能下载。

### 7.1 版本号：语义化版本

版本号一般写成 `v主版本.次版本.修订号`，比如 `v1.4.2`：

- **主版本**：有不兼容的改动，`v1.x.x → v2.0.0`
- **次版本**：新增功能，向下兼容，`v1.4.x → v1.5.0`
- **修订号**：只修 bug，`v1.4.2 → v1.4.3`

### 7.2 在网页上手动发布

1. 仓库主页右侧 **Releases → Draft a new release**。
2. **Choose a tag** 输入新版本号（如 `v1.0.0`），选 *Create new tag on publish*。
3. 点 **Generate release notes**，GitHub 会根据上次发布以来合并的 PR 自动生成更新说明，再手动补充。
4. 把安装包、压缩包拖到附件区域。
5. 测试版勾选 *Set as a pre-release*，最后点 **Publish release**。

### 7.3 用 Actions 自动发布

更省事的做法：本地打一个标签推上去，剩下的交给 Actions。

```bash
git tag -a v1.0.0 -m "v1.0.0：首个正式版"
git push origin v1.0.0
```

工作流监听 `v` 开头的标签，构建后自动创建 Release 并上传文件：

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags: ["v*"]

permissions:
  contents: write              # 创建 Release 需要写权限

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-python@v7
        with:
          python-version: "3.13"
      - run: pip install build
      - run: python -m build   # 生成 dist/*.whl 和 dist/*.tar.gz

      # 用 Runner 上自带的 gh 命令行创建 Release，并上传 dist 里的文件
      - run: gh release create "$GITHUB_REF_NAME" dist/* --generate-notes
        env:
          GH_TOKEN: ${{ github.token }}
```

打完标签一两分钟，Releases 页面就会出现 `v1.0.0`，附带自动生成的更新说明和构建好的文件。

> [!NOTE]
> 除了 `gh release create`，也可以用 [softprops/action-gh-release](https://github.com/softprops/action-gh-release) 这个 Action，写法更声明式，支持草稿、预发布等选项。

## 8. 相关链接

| 链接 | 说明 |
|--|--|
| [GitHub Docs（中文）](https://docs.github.com/zh) | 官方文档，本文所有功能都能在这里查到详细说明 |
| [GitHub Pages 文档](https://docs.github.com/zh/pages) | 建站、自定义域名、HTTPS 的完整说明 |
| [GitHub Actions 文档](https://docs.github.com/zh/actions) | 工作流语法、触发事件、Runner 规格 |
| [GitHub Marketplace](https://github.com/marketplace?type=actions) | 搜索现成的 Actions |
| [GitHub CLI](https://cli.github.com/) | 命令行里操作 PR、Issue、Release |
| [Shields.io](https://shields.io/) | 生成 README 里的各种徽章 |
| [语义化版本](https://semver.org/lang/zh-CN/) | 版本号规范原文 |
{% endraw %}
