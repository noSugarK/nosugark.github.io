---
layout: post
title: 用 Jekyll 重写了个人主页
description: 记录一下这个站点的技术选型：为什么保留 Jekyll、为什么不引前端框架。
tags: [Jekyll, 前端]
---

这篇是占位文章，用来验证博客链路通不通。删掉它，然后在 `_posts/` 里新建
`YYYY-MM-DD-标题.md` 就是发一篇新文章。

## 技术选型

站点是纯静态的，**没有任何前端框架和动画库**：

- 样式全在 `assets/css/main.css`，用 CSS 自定义属性做浅色 / 深色两套 token
- 交互全在 `assets/js/site.js`，用 IntersectionObserver 和 View Transitions API
- 简历内容集中在 `site.js` 顶部的几个数组里，改简历不用碰 HTML

保留 Jekyll 是因为 GitHub Pages 原生就跑它——扔一个 markdown 进 `_posts/`
就自动出文章页、出列表、出 RSS，不需要 Node、不需要 GitHub Actions。

## 写文章

front matter 只有 `layout: post` 和 `title` 是必填的：

```yaml
---
layout: post
title: 文章标题
description: 列表页显示的摘要，不写就自动截取正文
tags: [标签一, 标签二]
---
```

代码块、表格、引用、图片的样式都调过了：

| 元素 | 说明 |
|---|---|
| 行内 `code` | 有边框和底色 |
| 表格 | 全宽，细边框 |

> 引用块左侧是强调色竖条。

## 关于双语

站点框架（导航、页脚、简历内容）跟着顶栏的语言按钮切换，**文章本身不做双语**
——每篇写两遍不现实。用你写的那个语言就行。
