---
layout: post
title: 科学上网入门：方案与价格对比，Clash Verge Rev 使用教程
description: 机场、商业 VPN、自建 VPS 的价格对比，以及 Clash Verge Rev 的安装、订阅、模式、TUN 和终端代理
tags: [工具, 网络]
math: false
mermaid: true
---

> [!NOTE]
> 请遵守所在地法律法规，仅用于学习和工作。价格为 2026 年大致行情，以官网为准。

## 1. 方案对比

| 方案 | 优点 | 缺点 |
|--|--|--|
| **机场** | 便宜、节点多、导入订阅即用 | 质量参差，可能跑路 |
| 商业 VPN | 品牌大、隐私政策清楚 | 国内连通性差、贵 |
| 自建 VPS | 独享固定 IP | 要折腾，IP 被封要自己换 |

**结论：月付机场 + Clash Verge Rev，有固定 IP 需求再自建。**

## 2. 价格

### 2.1 机场

| 档位 | 月流量 | 价格 |
|--|--|--|
| 入门 | ~100 GB | ¥10–20 / 月 |
| 主流 | 200–500 GB | ¥20–40 / 月 |
| 专线（IPLC / IEPL） | 500 GB+ | ¥50–100+ / 月 |
| 按量 | 流量包，不限时 | ¥10–30 / 100 GB |

- 先月付，别年付。
- 用 AI 服务要有美国 / 日本 / 新加坡节点，香港一般不行。
- 节点标 `x2`、`x0.5` 是流量扣费倍率。

> [!TIP]
> 我在用 **追云加速**：[官网](https://zhuiyun.xyz/#/plan)，有按流量计费套餐；防失联发布页 [zhuiyun.me](https://zhuiyun.me)。

### 2.2 商业 VPN

| 服务 | 月付 | 长期折合每月 |
|--|--|--|
| [ExpressVPN](https://www.expressvpn.com/) | ~$13 | ~$5–8 |
| [NordVPN](https://nordvpn.com/) | ~$13 | ~$3–5 |
| [Surfshark](https://surfshark.com/) | ~$15 | ~$2–3 |
| [Astrill](https://www.astrill.com/) | ~$30 | ~$15–20 |

### 2.3 自建 VPS

| 服务商 | 价格 | 特点 |
|--|--|--|
| [Vultr](https://www.vultr.com/) | $5 / 月起 | 按小时计费，IP 被封随时换 |
| [RackNerd](https://www.racknerd.com/) | $10–20 / 年 | 便宜，晚高峰慢 |
| [搬瓦工](https://bandwagonhost.com/) | ~$50 / 季度起 | CN2 GIA，稳但贵 |
| [DMIT](https://www.dmit.io/) | $15–40 / 月 | 香港 / 洛杉矶优化线路 |

## 3. Clash Verge Rev

[Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev) 是 [Mihomo](https://github.com/MetaCubeX/mihomo)（原 Clash Meta）内核的开源图形客户端，支持 Windows / macOS / Linux。

| 平台 | 客户端 |
|--|--|
| 电脑 | Clash Verge Rev |
| Android | [Clash Meta for Android](https://github.com/MetaCubeX/ClashMetaForAndroid) / [FlClash](https://github.com/chen08209/FlClash) |
| iOS | Shadowrocket / Stash（~$3–4，需非国区 Apple ID） |

### 3.1 安装

从 [Releases](https://github.com/clash-verge-rev/clash-verge-rev/releases) 下载：Windows 选 `x64-setup.exe`，Apple 芯片选 `aarch64.dmg`，Intel Mac 选 `x64.dmg`。

macOS 提示「已损坏」：

```bash
sudo xattr -r -c /Applications/Clash\ Verge.app
```

### 3.2 使用

```mermaid
flowchart LR
  A[复制机场<br/>Clash 订阅链接] --> B[订阅页<br/>粘贴导入]
  B --> C[点选订阅<br/>使其生效]
  C --> D[代理页<br/>规则模式 + 选节点]
  D --> E[设置页<br/>开系统代理]
```

- 订阅链接等于密码，别外传；在订阅编辑里设自动更新（如 24 小时）。
- 代理页点闪电图标测延迟，选低延迟节点，或直接用「自动选择」组。

| 模式 | 用途 |
|--|--|
| **规则** | 国内直连、国外代理，日常用 |
| 全局 | 全部走代理，临时测试 |
| 直连 | 排查是否代理导致的问题 |

### 3.3 系统代理 vs TUN

| | 系统代理 | TUN 模式 |
|--|--|--|
| 覆盖 | 浏览器、大部分 GUI 程序 | 所有程序，包括终端、Docker |
| 开启 | 直接打开 | 先安装服务模式，再开虚拟网卡模式 |

默认混合端口 `7897`；打开「局域网连接」后手机、虚拟机可用 `电脑IP:7897`。

## 4. 终端代理

系统代理对终端无效，开 TUN 或手动设置：

```bash
export https_proxy=http://127.0.0.1:7897 http_proxy=http://127.0.0.1:7897 all_proxy=socks5://127.0.0.1:7897
```

```powershell
$env:HTTP_PROXY="http://127.0.0.1:7897"; $env:HTTPS_PROXY="http://127.0.0.1:7897"
```

```bash
git config --global http.https://github.com.proxy http://127.0.0.1:7897
pip config set global.proxy http://127.0.0.1:7897
npm config set proxy http://127.0.0.1:7897
```

Git 走 SSH 时，在 `~/.ssh/config` 加：

```
Host github.com
  HostName ssh.github.com
  Port 443
  User git
```

Docker：Docker Desktop → Settings → Resources → Proxies 填 `http://127.0.0.1:7897`。

## 5. 常见问题

| 现象 | 解决 |
|--|--|
| 导入订阅失败 | 先切直连再更新，或用备用订阅域名 |
| 节点全超时 | 订阅过期 / 流量用完 / 系统时间不准 |
| 浏览器能上，终端不行 | 见第 4 节，或开 TUN |
| 关掉 Clash 后断网 | 重开再正常退出，或手动关系统代理 |
| AI 服务提示地区不支持 | 换美国 / 日本节点 |
| 公司内网打不开 | 用内网时关 TUN |
