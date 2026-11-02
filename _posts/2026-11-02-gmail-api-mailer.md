---
layout: post
title: 用 Gmail API 自动发送邮件：Python + OAuth 2.0 一次授权长期使用
description: 浏览器授权一次，之后 Python 脚本靠 Refresh Token 自动续期、调用 Gmail API 发信。七步走完：建项目、配同意屏幕、建客户端、装依赖、写脚本、首次授权、长期运行。
tags: [Python, Gmail, OAuth, 自动化]
math: false
mermaid: false
---

浏览器里授权一次，之后 Python 脚本自动刷新令牌、自动发信，不用存邮箱密码。

## 第 1 步：建项目并启用 Gmail API

1. 打开 [Google Cloud Console](https://console.cloud.google.com/)，用要发信的邮箱登录。
2. 顶部项目选择器 → **新建项目**，名称填 `Mail-Agent`，创建后切换过去。
3. 打开 [Gmail API](https://console.cloud.google.com/apis/library/gmail.googleapis.com)，点 **Enable**。

## 第 2 步：配置 OAuth 同意屏幕

打开 [Google Auth Platform](https://console.cloud.google.com/auth/overview)：

1. App name 填 `Mail-Agent`，两个联系邮箱都填自己的邮箱。
2. Audience 选 **Internal**（公司 Workspace 账号）；个人账号只能选 External，并把自己加为 Test user。
3. Data Access → 添加 Scope：`https://www.googleapis.com/auth/gmail.send`（只能发信，读不了收件箱）。

## 第 3 步：创建 OAuth 客户端

打开 [Clients](https://console.cloud.google.com/auth/clients)：

1. **Create Client**，类型选 **Desktop app**（不要选 Web application）。
2. 下载 JSON，改名为 `credentials.json`，放到脚本同目录。

## 第 4 步：安装依赖

```powershell
py -m pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

## 第 5 步：写发信脚本

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

## 第 6 步：首次授权

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

## 第 7 步：长期运行

### 7.1 让令牌不再过期

第 2 步选的是哪种 Audience，决定了要不要做这一步：

- **Internal**：令牌不会按时间过期，跳过。
- **External**：Testing 状态下令牌 **7 天**就失效，需要发布应用：
  1. 打开 [Audience](https://console.cloud.google.com/auth/audience)，点 **Publish app** → Confirm。
  2. 删掉 `token.json`，重新运行 `py .\mailer.py` 授权一次。
  3. 授权页提示"Google 尚未验证此应用"时，点 **高级** → **继续**。自己用不需要提交验证。

### 7.2 设置定时任务

**Windows**（每天 9:00 运行）：

```powershell
schtasks /Create /TN "MailAgent" /SC DAILY /ST 09:00 /TR "py C:\path\to\mailer.py"
```

验证：`schtasks /Run /TN "MailAgent"` 手动跑一次，看邮件是否收到。

**Linux**（`crontab -e` 添加一行）：

```text
0 9 * * * /usr/bin/python3 /path/to/mailer.py >> /path/to/mailer.log 2>&1
```

> 脚本里用 `Path(__file__)` 定位 `token.json`，所以定时任务从哪个目录启动都能找到文件。

### 7.3 令牌仍会失效的情况

以下情况会报 `invalid_grant`，删掉 `token.json` 重新授权即可：

- 修改了 Google 账号密码。
- 在账号设置里撤销了应用授权。
- 令牌连续 6 个月没用过。

## 常见问题

| 报错 | 解决 |
| --- | --- |
| `redirect_uri_mismatch` | 客户端类型选错，重建为 Desktop app |
| `accessNotConfigured` | 回到第 1 步启用 Gmail API |
| `insufficient authentication scopes` | 检查第 2 步的 Scope，删掉 `token.json` 重新授权 |
| `invalid_grant` | 令牌失效，见第 7.3 节 |

## 安全

- `credentials.json`、`token.json` 加进 `.gitignore`，不要提交。
- 令牌泄露时去 [Google 账号 → 第三方应用](https://myaccount.google.com/connections) 撤销授权。

📖 [Gmail API 发送邮件](https://developers.google.com/workspace/gmail/api/guides/sending) · [Python Quickstart](https://developers.google.com/workspace/gmail/api/quickstart/python)
