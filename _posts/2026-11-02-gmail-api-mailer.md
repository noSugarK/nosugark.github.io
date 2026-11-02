---
layout: post
title: Python 自动发送 Gmail 邮件：Gmail API 与 SMTP 两种方案
description: 两种方案让 Python 脚本自动发 Gmail 邮件：Gmail API + OAuth 授权一次长期使用，或 SMTP + 应用专用密码零依赖。含定时任务、Docker 中运行任务后自动发信。
tags: [Python, Gmail, OAuth, SMTP, Docker, 自动化]
math: false
mermaid: false
---

让 Python 脚本自动发 Gmail 邮件，有两种方案：

| | 方案一：Gmail API | 方案二：SMTP |
| --- | --- | --- |
| 配置 | Google Cloud 建项目、建 OAuth 客户端 | 生成一个应用专用密码 |
| 依赖 | 3 个 Google 包 | 无，标准库 `smtplib` |
| 权限 | 只能发信 | 整个邮箱 |
| 前提 | 无 | 开启两步验证，管理员允许应用专用密码 |
| Docker 中 | 挂载 `token.json` | `--env-file .env` |

**怎么选：** 想快、要在 Docker 里跑，选 SMTP；在意权限范围，或公司禁用了应用专用密码，选 Gmail API。

两种方案的 `send_email(to, subject, body)` 接口一样，调用的代码不用改。

## 方案一：Gmail API

浏览器里授权一次，之后脚本自动刷新令牌、自动发信，不用存邮箱密码。

### 第 1 步：建项目并启用 Gmail API

1. 打开 [Google Cloud Console](https://console.cloud.google.com/)，用要发信的邮箱登录。
2. 顶部项目选择器 → **新建项目**，名称填 `Mail-Agent`，创建后切换过去。
3. 打开 [Gmail API](https://console.cloud.google.com/apis/library/gmail.googleapis.com)，点 **Enable**。

### 第 2 步：配置 OAuth 同意屏幕

打开 [Google Auth Platform](https://console.cloud.google.com/auth/overview)：

1. App name 填 `Mail-Agent`，两个联系邮箱都填自己的邮箱。
2. Audience 选 **Internal**（公司 Workspace 账号）；个人账号只能选 External，并把自己加为 Test user。
3. Data Access → 添加 Scope：`https://www.googleapis.com/auth/gmail.send`（只能发信，读不了收件箱）。

### 第 3 步：创建 OAuth 客户端

打开 [Clients](https://console.cloud.google.com/auth/clients)：

1. **Create Client**，类型选 **Desktop app**（不要选 Web application）。
2. 下载 JSON，改名为 `credentials.json`，放到脚本同目录。

### 第 4 步：安装依赖

```powershell
py -m pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

### 第 5 步：写发信脚本

新建 `mailer.py`：

```python
import base64
from pathlib import Path
from email.mime.text import MIMEText

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

BASE_DIR = Path(__file__).resolve().parent
CREDENTIALS_FILE = BASE_DIR / "credentials.json"
TOKEN_FILE = BASE_DIR / "token.json"
SCOPES = ["https://www.googleapis.com/auth/gmail.send"]


def get_gmail_service():
    creds = None
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())  # 过期自动刷新
        else:
            flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_FILE), SCOPES)
            # offline + consent 才能拿到 Refresh Token
            creds = flow.run_local_server(port=0, access_type="offline", prompt="consent")
        TOKEN_FILE.write_text(creds.to_json(), encoding="utf-8")

    return build("gmail", "v1", credentials=creds)


def send_email(to, subject, body):
    message = MIMEText(body, "plain", "utf-8")
    message["To"] = to
    message["Subject"] = subject  # 不设 From，默认用授权账号
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
    result = get_gmail_service().users().messages().send(
        userId="me", body={"raw": raw}
    ).execute()
    print("发送成功，Message ID：", result["id"])
    return result


if __name__ == "__main__":
    send_email("recipient@example.com", "测试邮件", "这是一封通过 Gmail API 发送的邮件。")
```

### 第 6 步：首次授权

```powershell
py .\mailer.py
```

1. 浏览器自动打开，选择发信邮箱。
2. 点 **允许**。
3. 终端打印 Message ID，目录里生成 `token.json`。

之后再运行不会弹浏览器，令牌过期会自动刷新。其他脚本里直接调用：

```python
from mailer import send_email
send_email("recipient@example.com", "构建完成", "v1.2.0 已发布。")
```

### 第 7 步：让令牌长期有效

第 2 步选的是哪种 Audience，决定了要不要做这一步：

- **Internal**：令牌不会按时间过期，跳过。
- **External**：Testing 状态下令牌 **7 天**就失效，需要发布应用：
  1. 打开 [Audience](https://console.cloud.google.com/auth/audience)，点 **Publish app** → Confirm。
  2. 删掉 `token.json`，重新运行 `py .\mailer.py` 授权一次。
  3. 授权页提示"Google 尚未验证此应用"时，点 **高级** → **继续**。自己用不需要提交验证。

以下情况令牌仍会失效（报 `invalid_grant`），删掉 `token.json` 重新授权即可：

- 修改了 Google 账号密码。
- 在账号设置里撤销了应用授权。
- 令牌连续 6 个月没用过。

### 常见问题

| 报错 | 解决 |
| --- | --- |
| `redirect_uri_mismatch` | 客户端类型选错，重建为 Desktop app |
| `accessNotConfigured` | 回到第 1 步启用 Gmail API |
| `insufficient authentication scopes` | 检查第 2 步的 Scope，删掉 `token.json` 重新授权 |
| `invalid_grant` | 令牌失效，见第 7 步 |

## 方案二：SMTP + 应用专用密码

### 第 1 步：生成应用专用密码

1. 确认 Google 账号已开启 [两步验证](https://myaccount.google.com/signinoptions/twosv)。
2. 打开 [应用专用密码](https://myaccount.google.com/apppasswords)，名称填 `Mail-Agent`，点 **创建**。
3. 复制弹出的 16 位密码，**去掉空格**保存。窗口关掉后就看不到了。

> 打不开这个页面：两步验证没开，或者公司管理员禁用了应用专用密码，只能用方案一。

### 第 2 步：新建 `.env` 文件

密码不写进代码，在脚本同目录新建 `.env`：

```text
SMTP_USER=me@example.com
SMTP_PASSWORD=abcdabcdabcdabcd
```

### 第 3 步：写发信脚本

新建 `mailer.py`：

```python
import os
import smtplib
from pathlib import Path
from email.mime.text import MIMEText

# 读取同目录的 .env；已有的环境变量优先（Docker 用 --env-file 传入时）
env_file = Path(__file__).with_name(".env")
if env_file.exists():
    for line in env_file.read_text(encoding="utf-8").splitlines():
        if "=" in line and not line.startswith("#"):
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())

SMTP_USER = os.environ["SMTP_USER"]
SMTP_PASSWORD = os.environ["SMTP_PASSWORD"]


def send_email(to, subject, body):
    message = MIMEText(body, "plain", "utf-8")
    message["From"] = SMTP_USER
    message["To"] = to
    message["Subject"] = subject
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(message)
    print("发送成功：", to)


if __name__ == "__main__":
    send_email("recipient@example.com", "测试邮件", "这是一封通过 SMTP 发送的邮件。")
```

运行 `py .\mailer.py`，收到邮件就完成了。

**报 `535 Username and Password not accepted`：** 用的是登录密码而不是应用专用密码，或者密码里还带着空格。修改账号密码后应用专用密码也会失效，需要重新生成。

## 定时运行

**Windows**（每天 9:00 运行）：

```powershell
schtasks /Create /TN "MailAgent" /SC DAILY /ST 09:00 /TR "py C:\path\to\mailer.py"
```

验证：`schtasks /Run /TN "MailAgent"` 手动跑一次，看邮件是否收到。

**Linux**（`crontab -e` 添加一行）：

```text
0 9 * * * /usr/bin/python3 /path/to/mailer.py >> /path/to/mailer.log 2>&1
```

> 脚本用 `Path(__file__)` 定位 `token.json` 和 `.env`，所以定时任务从哪个目录启动都能找到。

## 在 Docker 中运行：任务跑完自动发邮件

### 第 1 步：写任务脚本

新建 `task.py`，任务成功或失败都发邮件：

```python
import traceback
from mailer import send_email


def run():
    ...  # 你的自动化任务


try:
    run()
    send_email("me@example.com", "任务成功", "今天的任务已完成。")
except Exception:
    send_email("me@example.com", "任务失败", traceback.format_exc())
    raise
```

### 第 2 步：写 Dockerfile

```dockerfile
FROM python:3.12-slim
WORKDIR /app
# 方案一需要这行，方案二删掉
RUN pip install --no-cache-dir google-api-python-client google-auth-httplib2 google-auth-oauthlib
COPY mailer.py task.py ./
CMD ["python", "task.py"]
```

### 第 3 步：构建并运行

```bash
docker build -t mail-task .
```

**方案二**：直接用方案二第 2 步建的 `.env`：

```bash
docker run --rm --env-file .env mail-task
```

**方案一**：先在本机按第 1～7 步拿到长期有效的 `token.json`，再挂载进容器：

```bash
docker run --rm -v "$PWD/token.json:/app/token.json" mail-task
```

> 容器里没有浏览器，令牌失效时没法重新授权，所以方案一一定要先做第 7 步。`credentials.json` 只在首次授权时用到，不用挂载。

### 第 4 步：定时运行

把 `docker run` 命令放进 cron：

```text
0 9 * * * docker run --rm --env-file /path/to/.env mail-task
```

Docker 基础用法见 [Docker 指南]({% post_url 2026-09-24-docker-guide %})。

## 安全

- `credentials.json`、`token.json`、`.env` 加进 `.gitignore`，不要提交，也不要 `COPY` 进镜像。
- 方案一令牌泄露：去 [Google 账号 → 第三方应用](https://myaccount.google.com/connections) 撤销授权。
- 方案二密码泄露：去 [应用专用密码](https://myaccount.google.com/apppasswords) 删除该密码。

📖 [Gmail API 发送邮件](https://developers.google.com/workspace/gmail/api/guides/sending) · [Python Quickstart](https://developers.google.com/workspace/gmail/api/quickstart/python) · [应用专用密码](https://support.google.com/accounts/answer/185833)
