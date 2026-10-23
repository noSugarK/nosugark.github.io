---
layout: post
title: GitLab 团队协作与开发流程规范：组、权限、分支、提交与合并请求
description: 自建 GitLab 部署好之后的团队落地清单：组与项目结构、角色权限、分支命名、提交信息规范、合并请求流程与模板、标签与看板、版本发布。
tags: [GitLab, Git, 团队协作, 规范]
math: false
mermaid: false
---

本文接 [本地部署 GitLab]({% post_url 2026-10-23-gitlab-self-hosted %})，讲 GitLab 装好之后**怎么让团队用起来**。每节末尾附官方文档链接，需要细节时点过去看。Git 命令本身见 [Git 基础]({% post_url 2026-09-23-git-basics %})。

## 1. 建立组织结构

GitLab 用 **组（Group）** 管人和项目，组可以嵌套。成员加在组上，下面所有项目自动继承权限。

**推荐结构：**

```text
company                 ← 顶级组：全员 Reporter
├── backend             ← 子组：后端组成员 Developer
│   ├── user-service
│   └── order-service
├── frontend            ← 子组：前端组成员 Developer
│   └── web-admin
└── infra               ← 子组：运维
    └── deploy-scripts
```

**步骤：**

1. 左上角 **+** → New group → Create group，填组名 `company`，Visibility 选 **Private**。
2. 进入 `company` → 右上角 New subgroup，依次建 `backend`、`frontend`、`infra`。
3. 进入子组 → New project → Create blank project，建项目。

> 项目尽量建在组下，不要建在个人名下。人员离职时个人名下的项目处理起来很麻烦。

📖 [Groups](https://docs.gitlab.com/user/group/) · [Subgroups](https://docs.gitlab.com/user/group/subgroups/)

## 2. 分配角色权限

| 角色 | 能做什么 | 给谁 |
| --- | --- | --- |
| Guest | 看 Issue、发评论 | 外部人员 |
| Planner | 管理 Issue、看板、里程碑，不能看代码 | 产品、项目经理 |
| Reporter | 看代码、拉代码、管理 Issue | 测试、只读的同事 |
| **Developer** | 推非保护分支、提 MR、跑流水线 | 开发人员 |
| **Maintainer** | 合并 MR、管理保护分支、CI 变量、项目设置 | 组长、核心开发 |
| Owner | 删除组/项目、管理成员和计费 | 负责人（1～2 人） |

**添加成员步骤：**

1. 进入组（或项目）→ 左侧 Manage → Members → **Invite members**。
2. 选用户、选角色，可设到期时间（适合外包、实习）。
3. 点 Invite。

**原则：**

- 权限加在组上，不要逐个项目加。
- 默认给 Developer，确实需要合并权限再升 Maintainer。
- 离职人员：Admin → Users → 选中用户 → **Block**（保留提交记录，禁止登录）。

📖 [Roles and permissions](https://docs.gitlab.com/user/permissions/) · [Members](https://docs.gitlab.com/user/project/members/)

## 3. 分支规范

采用**主干 + 短期分支**：`main` 永远可发布，所有改动走短期分支 + MR 合入。

| 分支 | 用途 | 示例 | 来源 → 合入 |
| --- | --- | --- | --- |
| `main` | 可发布的主干，受保护 | — | — |
| `feat/<issue号>-<描述>` | 新功能 | `feat/42-user-login` | main → main |
| `fix/<issue号>-<描述>` | Bug 修复 | `fix/57-token-expire` | main → main |
| `hotfix/<描述>` | 线上紧急修复 | `hotfix/payment-crash` | tag → main |
| `docs/`、`refactor/`、`chore/` | 文档、重构、杂项 | `docs/api-readme` | main → main |

规则：

- 小写、用 `-` 连接，带上 Issue 号。
- 分支存活不超过一周，合并后立即删除。
- 项目需要测试环境时，可以加一个长期分支 `develop` 对应测试环境自动部署，`main` 对应生产。

**设置保护分支**：项目 → Settings → Repository → Protected branches

| 分支 | Allowed to merge | Allowed to push and merge | Allowed to force push |
| --- | --- | --- | --- |
| `main` | Maintainers | **No one** | 关 |

**限制分支命名**（可选）：项目 → Settings → Repository → Push rules → Branch name，填正则：

```text
^(main|develop|(feat|fix|hotfix|docs|refactor|chore)\/[a-z0-9._-]+)$
```

> Push rules 在部分版本中属于付费功能；CE 中没有该选项时，靠 Code Review 约定执行。

📖 [Protected branches](https://docs.gitlab.com/user/project/repository/branches/protected/) · [GitLab Flow](https://about.gitlab.com/topics/version-control/what-is-gitlab-flow/)

## 4. 提交信息规范

采用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/)，格式：

```text
<类型>(<范围>): <简短描述>

<可选：详细说明>

Closes #42
```

| 类型 | 含义 |
| --- | --- |
| `feat` | 新功能 |
| `fix` | 修 Bug |
| `docs` | 文档 |
| `style` | 格式（不影响逻辑） |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `test` | 测试 |
| `chore` | 构建、依赖、配置 |

示例：

```text
feat(auth): 登录支持手机验证码

Closes #42
```

- 描述写“做了什么”，不超过 50 字。
- `Closes #42` 写在提交或 MR 描述里，合并到默认分支时自动关闭 Issue。

📖 [Closing issues automatically](https://docs.gitlab.com/user/project/issues/managing_issues/#closing-issues-automatically)

## 5. 合并请求（MR）流程

**开发者每次改动都按这 8 步走：**

1. **建 Issue**：写清楚要做什么，打标签、指派给自己。
2. **从 Issue 建分支**：Issue 页面右侧 **Create merge request** 下拉 → 改分支名为 `feat/42-xxx` → 创建（会同时生成草稿 MR）。
3. **本地拉取并开发**：
   ```bash
   git fetch origin
   git switch feat/42-user-login
   # 开发、提交
   git push
   ```
4. **同步主干**（MR 提示冲突时）：
   ```bash
   git fetch origin
   git rebase origin/main
   git push --force-with-lease
   ```
5. **完善 MR**：填写模板、指定 Reviewer，点 **Mark as ready** 去掉草稿状态。
6. **等 CI 通过**：流水线红了先自己修。
7. **Code Review**：Reviewer 逐行评论，作者修改后点 **Resolve thread**。
8. **Maintainer 合并**：勾选 **Squash commits** 和 **Delete source branch**，点 Merge。

**项目级强制检查**：项目 → Settings → Merge requests

| 设置项 | 推荐值 | 作用 |
| --- | --- | --- |
| Merge method | Merge commit with semi-linear history | 历史整洁，要求先 rebase |
| Squash commits when merging | Encourage | 一个 MR 一个提交 |
| Pipelines must succeed | ✅ | CI 不过不能合 |
| All threads must be resolved | ✅ | 评论没处理不能合 |
| Enable "Delete source branch" by default | ✅ | 合并后自动删分支 |

**Review 要点**（Reviewer 对照检查）：

- [ ] 改动和 Issue 描述一致，没有夹带无关修改
- [ ] 有对应测试，CI 通过
- [ ] 没有提交密钥、调试代码、大文件
- [ ] 命名清楚，复杂逻辑有注释
- [ ] 数据库变更有迁移脚本，能回滚

📖 [Merge requests](https://docs.gitlab.com/user/project/merge_requests/) · [Merge methods](https://docs.gitlab.com/user/project/merge_requests/methods/) · [Auto-merge](https://docs.gitlab.com/user/project/merge_requests/auto_merge/)

## 6. Issue 与 MR 模板

在仓库里建目录，提交到 `main` 后，新建 Issue / MR 时可以在 **Description** 上方选择模板。

```text
.gitlab/
├── issue_templates/
│   ├── Bug.md
│   └── Feature.md
└── merge_request_templates/
    └── Default.md
```

**`.gitlab/merge_request_templates/Default.md`**：

```markdown
## 改了什么

## 为什么改

Closes #

## 怎么测试

- [ ] 本地测试通过
- [ ] 已补充/更新测试

## 截图（界面改动时）

/assign me
```

**`.gitlab/issue_templates/Bug.md`**：

```markdown
## 现象

## 复现步骤
1.
2.

## 期望结果

## 环境（版本 / 浏览器 / 系统）

/label ~bug
```

模板末尾的 `/assign me`、`/label ~bug` 是快捷命令，提交时自动执行。

📖 [Description templates](https://docs.gitlab.com/user/project/description_templates/) · [Quick actions](https://docs.gitlab.com/user/project/quick_actions/)

## 7. 标签、里程碑与看板

**① 在顶级组建标签**（所有项目共用）：组 → Manage → Labels

| 类别 | 标签 |
| --- | --- |
| 类型 | `bug`、`feature`、`docs`、`tech-debt` |
| 优先级 | `P0`（立即）、`P1`（本迭代）、`P2`（排期） |
| 状态 | `status::todo`、`status::doing`、`status::review` |

**② 建里程碑**（按迭代，如两周一个）：组 → Plan → Milestones → New milestone，填起止日期。

**③ 配看板**：组 → Plan → Issue boards → 添加列表，按 `status::todo`、`status::doing`、`status::review` 建列。拖动卡片即可改状态。

📖 [Labels](https://docs.gitlab.com/user/project/labels/) · [Milestones](https://docs.gitlab.com/user/project/milestones/) · [Issue boards](https://docs.gitlab.com/user/project/issue_board/)

## 8. 版本发布

版本号用 [语义化版本](https://semver.org/lang/zh-CN/)：`v主版本.次版本.修订号`

| 变化 | 示例 |
| --- | --- |
| 不兼容的改动 | `v1.4.2` → `v2.0.0` |
| 新功能，向下兼容 | `v1.4.2` → `v1.5.0` |
| 修 Bug | `v1.4.2` → `v1.4.3` |

**发布步骤：**

1. 确认 `main` 流水线是绿的。
2. Code → Tags → New tag，名称 `v1.5.0`，基于 `main`，Message 写本次变更摘要。
3. 流水线的 `release` 任务自动生成 Release（配置见 [部署篇第 8 节]({% post_url 2026-10-23-gitlab-self-hosted %})）。
4. 在 Settings → Repository → Protected tags 把 `v*` 设为仅 Maintainers 可创建。

📖 [Releases](https://docs.gitlab.com/user/project/releases/) · [Protected tags](https://docs.gitlab.com/user/project/protected_tags/)

## 9. 新人入职清单

| # | 事项 | 谁做 |
| --- | --- | --- |
| 1 | 创建账号，加入对应子组（Developer） | 管理员 |
| 2 | 登录改密码、开启 2FA、界面改中文 | 新人 |
| 3 | 添加 SSH 公钥，配置 `~/.ssh/config` 端口 2222 | 新人 |
| 4 | 配置 `git config user.name / user.email`，与 GitLab 账号邮箱一致 | 新人 |
| 5 | 阅读本文，按第 5 节提交第一个 MR | 新人 |

把这张表和本文链接放进团队 Wiki 或顶级组的 README，就是一份完整的团队开发规范。
