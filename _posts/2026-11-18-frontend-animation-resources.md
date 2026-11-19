---
layout: post
title: 前端动效资源整理：React、Vue、动画引擎与交互设计怎么选
description: 整理 React Bits、Aceternity UI、Motion、GSAP、Inspira UI、Uiverse 等前端动效资源，补充 React 与 Vue 组件、滚动交互、3D、Lottie、Rive 和 Remotion，并说明不同项目的选型方式。
tags: [前端, React, Vue, CSS, 动画, 工具]
math: false
mermaid: false
---

做前端页面时，常常缺的不是一个按钮，而是按钮按下后的反馈、列表切换时的过渡，或者首屏里恰到好处的一段动画。

React Bits、Aceternity UI、GSAP、Uiverse 都能帮上忙，但它们的使用方式差别很大：有的直接复制组件，有的提供动画 API，有的是设计素材平台，还有的是用代码生成视频的工具。

这篇把常用资源按用途整理在一起。可以先按技术栈找入口，再根据项目需要选择，不必把整份清单都装进项目。

想先弄清「滚动触发」「布局过渡」这些词指的是什么？先去[前端动效入门实验台]({% post_url 2026-11-19-frontend-motion-lab %})亲手试，再回来看怎么选工具。

> 整理日期：2026-11-18。组件数量、价格、包体积和授权条款可能变化，本文不把这些数字当作固定结论；接入前以对应项目的官方文档、仓库和许可证为准。

## 1. 先看你要解决什么问题

| 需求 | 优先看 | 使用方式 |
| --- | --- | --- |
| React 页面快速加入背景、文字和卡片动效 | React Bits、Aceternity UI、Magic UI | 挑选组件，按文档复制源码或安装 |
| React 产品界面的状态切换、布局和进出场 | Motion、Motion Primitives | 用动画 API 或组合现成组件 |
| Vue 3 页面加入展示型动效 | Inspira UI、Vue Bits | 使用 Vue 版本组件 |
| Vue 中已有组件需要动画能力 | VueUse Motion | 给自己的组件添加动画 |
| 原生 HTML 页面需要按钮、加载与悬浮反馈 | Uiverse、CSS 原生能力 | 复制片段并调整样式 |
| 多段动画需要严格衔接，或与滚动联动 | GSAP、Anime.js | 编写时间轴、触发和更新逻辑 |
| 平滑滚动 | Lenis | 接入滚动控制工具 |
| 3D 场景、粒子、材质和着色器 | React Three Fiber、TresJS | 构建和维护 WebGL 场景 |
| 播放设计师交付的动画 | Lottie、Rive | 导入动画文件，接入播放器或运行时 |
| 生成宣传片、字幕视频、批量视频 | Remotion | 用 React 定义内容并渲染视频 |
| 找组件结构和视觉参考 | 21st.dev | 浏览案例，再检查具体组件的代码与依赖 |

**组件库负责提供起点，动画引擎负责控制变化，素材格式与视频框架负责另一类交付。** 先分清这几类，选型会容易很多。

## 2. React：优先找能直接改的组件

### 2.1 React Bits

- 官网：[reactbits.dev](https://reactbits.dev/)
- 源码：[DavidHDev/react-bits](https://github.com/DavidHDev/react-bits)

适合找文字、背景、交互和展示组件。先在演示中确认效果，再查看所选实现的依赖、参数和源码。

它比较适合个人主页、产品落地页和创意展示。不同组件的实现与运行成本并不相同，简单文字动画和持续渲染的背景需要分别评估。

### 2.2 Aceternity UI

- 官网：[ui.aceternity.com](https://ui.aceternity.com/)

适合制作视觉表现较强的产品页面，例如聚光灯背景、卡片悬浮和文字动效。常见组件会涉及 Tailwind CSS 与 Motion 等依赖，具体以组件文档为准。

使用时先挑一个能服务内容的重点效果，再统一字体、颜色和间距。把多个完整演示直接拼在一起，页面很容易失去一致性。免费组件与付费产品也要分别看授权。

### 2.3 Magic UI

- 官网：[magicui.design](https://magicui.design/)

适合补充产品展示页中的文字、边框、卡片和背景效果，常出现在 React、Tailwind CSS 与 shadcn/ui 相关项目中。

如果项目已有一套基础组件，可以从这里挑少量展示组件，不必再换整套 UI。复制后仍要检查颜色变量、暗色主题和所需依赖。

### 2.4 Motion Primitives

- 官网：[motion-primitives.com](https://motion-primitives.com/)

偏向可组合的 React 动效组件，适合文字变化、内容展开和界面切换等局部交互。

如果页面重点是阅读、操作和状态反馈，可以先从这类局部动效入手。它比大面积持续运动的背景更容易融入业务界面。

### 2.5 Animata

- 官网：[animata.design](https://animata.design/)

提供可参考和复制的 React 动画、交互示例。适合寻找某个局部效果的实现思路，再把它改成项目已有的组件风格。

不要只复制演示里最显眼的部分；触发条件、容器尺寸、状态和依赖也需要一起读。

### 2.6 Motion：原来搜索 Framer Motion 时常见的后续入口

- 官网：[motion.dev](https://motion.dev/)
- React 文档：[Motion for React](https://motion.dev/docs/react)

Motion 更接近动画能力层，适合自己编写组件时处理进出场、布局、手势和滚动相关动画。

搜索旧文章会经常看到 Framer Motion、`framer-motion`；当前 React 文档使用 `motion` 包和 `motion/react` 导入路径。接入已有项目时，要先检查它使用的包与版本，再参考迁移文档，避免把不同时期的写法混用。

需要直接拿一个背景组件时，可以先看 React Bits；需要控制自己组件的动画状态时，再看 Motion。

## 3. Vue：组件版本和动画能力分开选

Vue 的基础工程与业务组件选型，可以结合 [Vue 3 前端实用指南]({% post_url 2026-10-16-vue-ui-guide %}) 阅读。下面这些资源主要补充动效能力。

### 3.1 Inspira UI

- 官网：[inspira-ui.com](https://inspira-ui.com/)

面向 Vue 生态的展示与动效组件资源，适合寻找背景、卡片、文字等效果。

先看具体组件要求：是否适配自己的 Vue 或 Nuxt 项目、采用什么样式方案、是否包含浏览器专用 API。Vue 组件也可能依赖 Canvas 或 WebGL，不能仅凭框架名称判断性能。

### 3.2 Vue Bits

- 官网：[vue-bits.dev](https://vue-bits.dev/)

Vue 方向的创意动效组件资源。想找类似 React Bits 的文字、背景和交互效果时，可以先查看是否已有合适的 Vue 实现。

有现成 Vue 版本时，通常比手动翻译 React Hooks、生命周期和动画清理逻辑更容易接入和维护。

### 3.3 VueUse Motion

- 文档：[motion.vueuse.org](https://motion.vueuse.org/)

为 Vue 组件提供声明式动画能力，适合给项目已有元素添加进入、悬浮和状态变化效果。

它与展示组件库的区别在于：你保留自己的组件结构，再添加运动行为。需要统一一批业务组件的动画规则时，这种方式更方便。

VueUse Motion 与 motion.dev 提供的 Vue 方案是不同项目，查阅文档和安装依赖时不要混用。

## 4. 通用动画、滚动交互和微交互

### 4.1 Anime.js

- 官网与文档：[animejs.com](https://animejs.com/)

适合通过 JavaScript 控制元素属性、SVG 和对象数值变化，也可以组织时间轴和交错动画。

它不要求页面采用 React 或 Vue。选中目标、定义变化、控制播放，是比较直观的使用方式。参考示例时要核对版本，尤其不要混用不同大版本的 API 和导入方式。

“只有多少 KB”需要结合版本、导入模块、压缩与构建方式讨论，不能直接作为整个项目的加载成本。

### 4.2 GSAP

- 官网：[gsap.com](https://gsap.com/)
- 文档：[GSAP Docs](https://gsap.com/docs/v3/)
- 滚动插件：[ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)

适合多阶段时间轴、SVG 动画，以及滚动触发、固定区块和进度联动等复杂编排。

例如一个产品介绍区，需要依次展示图片、标题和说明，再让滚动进度控制整段播放，就可以评估 GSAP 与 ScrollTrigger。

组件卸载、页面切换和响应式断点变化时，需要清理或重建相应动画。插件能力、下载方式和授权以当前官方说明为准。

### 4.3 Lenis

- 官网：[lenis.dev](https://lenis.dev/)
- 源码：[darkroomengineering/lenis](https://github.com/darkroomengineering/lenis)

Lenis 主要处理平滑滚动，可以配合滚动动画使用。它本身并不提供一整套卡片、文字和背景动效。

只有页面确实需要特定滚动体验时再接入；同时测试锚点、键盘、触摸、嵌套滚动与浏览器返回后的滚动位置。业务列表和长篇文章通常可以先保留原生滚动。

### 4.4 Uiverse

- 官网：[uiverse.io](https://uiverse.io/)
- 源码：[uiverse-io/galaxy](https://github.com/uiverse-io/galaxy)

这是社区制作的 UI 资源，适合浏览样式和 CSS 交互片段。核对时官网拒绝了自动访问，因此具体组件和分类请以实际打开的页面为准。

每个作品都应单独检查可用代码、实现方式与授权。复制交互控件时，还要确认它接入表单后具备名称、键盘操作、焦点和禁用状态。

### 4.5 浏览器原生能力

简单的悬浮反馈、颜色变化和淡入淡出，优先考虑 CSS `transition` 与 [`animation`](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Animations)。需要用 JavaScript 控制播放时，可以了解 [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)。

[View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) 和 [CSS 滚动驱动动画](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations) 也值得关注，但应根据目标浏览器评估支持情况，并保留没有动画时的正常阅读和操作路径。

## 5. 3D、设计动画与视频

### 5.1 React Three Fiber 与 TresJS

- React：[React Three Fiber](https://r3f.docs.pmnd.rs/)
- Vue：[TresJS](https://tresjs.org/)
- 底层图形库：[Three.js](https://threejs.org/)

当页面需要可交互模型、粒子、光照和材质时，可以考虑 Three.js 生态。React Three Fiber 和 TresJS 分别提供与 React、Vue 结合的开发方式。

这类工具需要维护场景、相机、模型资源和渲染循环，不能按“复制一个 CSS 背景”的成本估算。只需要一段固定视觉效果时，也可以先比较视频或静态图片是否已经够用。

### 5.2 Lottie

- Web 播放器：[airbnb/lottie-web](https://github.com/airbnb/lottie-web)
- 素材与相关工具：[LottieFiles](https://lottiefiles.com/)

适合接入设计师制作的矢量动画，例如加载状态、成功反馈和功能引导。

要区分播放器的开源许可与动画素材的使用许可。还要确认设计工具中的效果能否被导出、播放器是否支持，以及动画文件和图片资源的实际大小。

### 5.3 Rive

- 官网：[rive.app](https://rive.app/)
- 文档：[Rive Docs](https://rive.app/docs/)

适合具有状态变化和输入响应的交互动画。例如一个角色会根据操作切换动作，或者图标随着产品状态变化而过渡。

选型时分别看编辑器、协作服务、运行时和素材的要求。与设计师一起确定状态、输入和触发方式，往往比前端拿到文件后再反推更省事。

### 5.4 Remotion

- 官网：[remotion.dev](https://www.remotion.dev/)
- 文档：[Remotion Docs](https://www.remotion.dev/docs/)

用 React 描述视频内容，再按帧渲染输出。适合产品宣传片、数据视频、字幕和批量生成内容。

它的主要交付物是视频，选型时要考虑帧率、时长、音频、字体、渲染环境和编码耗时。使用前也要查看当前许可证与适用条件，不能因为使用 React 就默认所有用途都免费。

## 6. 聚合站、动效片段与 AI 界面组件

### 6.1 21st.dev

- 入口：[21st.dev](https://21st.dev/)

适合浏览社区组件和页面片段，寻找结构、视觉和交互参考，也可以结合其 AI 相关工具探索界面方案。

聚合站里的不同组件可能来自不同作者，所需框架、依赖和许可也可能不同。选中之后继续查看具体来源，不要把整个平台理解成一套统一维护的动画库。

### 6.2 OriginKit

- 官网：[originkit.dev](https://www.originkit.dev/)

提供可浏览、复制的动效组件，也有 Framer 与 MCP 相关入口。适合先找到需要的视觉效果，再查看代码和对应的使用方式。

这里的 Framer 设计工具与 React 动画库 Framer Motion 是不同概念。“可用于 Framer”不能直接等同于“使用 Framer Motion 实现”。接入 React 项目时，仍要查看具体组件的框架和依赖。

### 6.3 AICSS

- 官网：[aicss.dev](https://www.aicss.dev/)

当前定位是面向 AI 应用界面的组件，涉及对话、思考状态、工具调用、流式输出和引用等内容，提供 React、Vue、Svelte 相关入口。

如果正在开发聊天助手或 Agent 产品，这类资源比单纯的装饰动效更贴近业务需求。选型时除了样式，还需要检查长文本、流式更新、工具执行状态与失败反馈能否清楚呈现。

## 7. 按项目选一套够用的组合

| 项目 | 可以先试的组合 | 重点检查 |
| --- | --- | --- |
| React 个人主页、产品落地页 | React Bits 或 Magic UI，按需补 Motion | 首屏资源、视觉一致性、移动端 |
| Vue 3 / Nuxt 展示站 | Inspira UI 或 Vue Bits | SSR、浏览器 API、组件依赖 |
| 后台和工具产品 | 现有业务 UI 库 + CSS；复杂状态变化再用 Motion 或 VueUse Motion | 表单、焦点、加载与错误反馈 |
| 滚动叙事页面 | GSAP + ScrollTrigger；需要时再加 Lenis | 触摸操作、内容可达性、滚动恢复 |
| 交互式 3D 产品展示 | React Three Fiber 或 TresJS | 模型大小、显存、帧率与静态替代 |
| 设计团队交付动画 | 根据导出内容选择 Lottie 或 Rive | 格式支持、状态接口、素材许可 |
| 批量生成视频 | Remotion | 渲染时间、字体与音频、输出规格 |

同一页面尽量明确每个工具的职责。例如 Motion 处理卡片状态，GSAP 编排一段独立滚动场景；不要让两套系统同时修改同一元素的 `transform`。

## 8. 复制组件之后，还要做什么

### 8.1 阅读依赖和源码

复制式组件进入仓库之后，就成为需要自己维护的代码。先确认它依赖哪些包、字体、图片和全局样式，再检查版本、主题变量与组件命名是否适合项目。

看到演示效果不等于完成接入。把默认文案换成真实内容，在容器宽度变化、长标题和空数据状态下再看一次。

### 8.2 用真实设备判断性能

优先检查持续运行的粒子、模糊、阴影、滤镜、Canvas 和 WebGL 效果。`transform` 与 `opacity` 往往更容易优化，但也不能据此保证整个页面流畅。

至少检查手机上的滚动与点击反馈、首屏资源，以及页面离开后动画是否停止。动画组件若需要持续计算，也要考虑不可见或后台状态下的暂停策略。

### 8.3 保留键盘操作和减少动态效果的体验

按钮要能通过键盘操作，悬浮内容不能只对鼠标用户开放，自定义光标不能成为唯一的操作提示。装饰层也不能遮住链接、文字或焦点。

针对系统的“减少动态效果”偏好，参考 [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) 减少大幅位移、视差和持续运动；处理动态内容时保留必要的状态反馈。

### 8.4 分别确认代码、素材与服务的许可

开源代码、付费模板、动画素材、在线编辑器和 AI 生成功能可能采用不同条款。复制前找到具体项目或组件的许可证，涉及客户交付、模板转售和视频生成时，查看相应使用条件。

选择一个最能说明产品或帮助用户操作的效果，把内容、性能和交互做好，再决定是否需要第二个。
