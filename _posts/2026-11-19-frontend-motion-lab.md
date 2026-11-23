---
layout: post
title: 前端动效入门：48 个可以亲手玩的网页效果
description: 从产品首屏一路走到模拟结账，动手体验文字、滚动、指针和界面反馈，了解每种动效是什么、何时用、怎么实现。
tags: [前端, CSS, JavaScript, 动画]
motion_lab: true
---

标题滑进来，是为了让你先看标题；加购按钮变成对勾，是为了告诉你「刚才点的那下成功了」。看着都是动画，解决的却不是同一个问题。

[上一篇动效资源整理]({% post_url 2026-11-18-frontend-animation-resources %})讲去哪找组件、怎么选库；[Vue 3 实用指南]({% post_url 2026-10-16-vue-ui-guide %})讲怎么搭应用、处理加载和错误。这篇不再列库：**先亲手试，再看这个效果是什么、通常放在哪、第一版怎么写。**

每节在实验台里选一个效果，再按提示点击、滚动或移动指针，不用装任何东西。手机可点按，键盘可用 `Tab` 找到控件；系统开启「减少动态效果」时，实验会跳过非必要的运动。

实验台会显示每项的实现来源。**原包**是实际调用开源项目；**源码移植**是按上游组件的关键逻辑改成原生 JavaScript，替换了文案、样式或触发方式；其余标为**原生教学示例**，不是第三方组件的复刻。参考图只有效果名称，没有原站或视频，所以不承诺逐帧还原。可以点来源对照原组件。第三方源码许可见[随站分发的许可证]({{ '/assets/js/vendor/motion-lab-LICENSES.txt' | relative_url }})。

## 1. 首屏入场：同样是出现，手感不一样

首屏就是打开网页、不滚动时先看到的部分。影子、文字和色块不必全都动；先选一个你希望读者先看的东西。

<div class="motion-lab" data-lab="entrance"></div>

| 效果 | 看什么 · 通常放在哪 | 第一版怎么做 |
| --- | --- | --- |
| 缓动 Easing | 同时到达，但一个匀速、一个减速；常用于按钮和卡片切换 | 对比 `linear` 与 `ease-out`，不要只调时长 |
| 弹簧 Spring | 向一侧拖动再松手，看把手越过中心后回弹；适合拖拽松手或收藏按钮 | 实验直接用 Motion 的物理弹簧；刚度越大越用力，阻尼越大越快平静 |
| 基础入场 Fade / Slide / Scale | 对比淡入、滑入、从小变大；适合标题、面板、小图标 | 分别改透明度、位移和缩放 |
| 按行显现 Line Reveal | 文字逐行从自己的窗口里露出；常见于首页大标题 | 外层裁切，内层向上移动 |
| 交错出现 Stagger | 三张卡先后入场；适合同级的一小组卡片 | 每项多等几十毫秒，别让长列表排队 |
| 模糊显现 Blur Reveal | 先虚后实；适合短标题或小图，不适合正文 | 用 `filter: blur()`，最后回到 `blur(0)` |
| 揭示 Reveal | 色块不动，遮挡它的边界退开；适合封面 | 动画改变 `clip-path: inset()` |
| 流光文字 Text Shimmer | 光带扫过字面，字没变；适合短品牌字标 | 渐变裁成字形，移动渐变位置 |

## 2. 首屏文字：变的是字，还是节奏？

<div class="motion-lab" data-lab="text"></div>

| 效果 | 看什么 · 通常放在哪 | 第一版怎么做 |
| --- | --- | --- |
| 按字符显现 Character Reveal | 字先占好位置，再依次浮出；适合短标题 | 逐字加延迟，辅助技术只读一次完整句子 |
| 乱码解码 Scramble Text | 字符随机变化后锁定；适合游戏或终端风标题 | 定时替换还未锁定的字，别挡关键信息 |
| 文字变形 Text Morphing | 旧词化开、新词凝实，中间边缘会黏在一起；适合短标语轮换 | Inspira UI 用两层模糊字叠加，再用 SVG 透明度阈值收紧边缘；不是字形路径插值 |
| 打字机 Typewriter | 打出一句、停顿、擦掉再换句；适合短标语或终端示例 | 分开处理打字、停顿和删除三种状态，不要让正文等着打完 |

## 3. 滚动：滚到以后播，还是滚多少播多少？

在样例框**里面**滚，或拖动滑块。滚到一半停手并往回拖：触发型会继续播，联动型停住并能倒放。实验不改变整篇博客的滚动方式。

<div class="motion-lab" data-lab="scroll"></div>

| 效果 | 看什么 · 通常放在哪 | 第一版怎么做 |
| --- | --- | --- |
| 平滑滚动 Smooth Scroll | 用 Lenis 按钮与瞬间跳转对比；常见于目录或回到顶部 | 本例用 `lenis.scrollTo()` 调整跳转时长；只需默认平滑时也可用浏览器原生 `scrollTo()` |
| 滚动触发 Scroll-triggered | 进视口启动一次，停手也会播完；适合初次露面的区块 | 用 `IntersectionObserver` 检查可见性 |
| 跟着滚动走 Scroll-linked | 色块走多远由进度决定；适合阅读进度和可倒放展示 | 把 `scrollTop` 换算成 `0–1`，再映射到位置 |
| 视差 Parallax | 前后两层移动距离不同；适合装饰风景或封面 | 给两层分配不同位移比例，不要让正文漂移 |
| 固定式滚动叙事 Sticky Scrollytelling | 舞台留在原地，步骤依次经过；适合讲功能演进 | `position: sticky` 固定舞台，正文照常滚 |
| 滚动缩放 Scroll Zoom | 同一画面随进度放大；适合推近产品细节 | 进度映射到 `scale()`，舞台裁切溢出 |
| 图片序列 Image Sequence | 旋钮随滚动切换离散帧；适合拆解、360° 产品图 | 进度换算为帧号；本例用 12 张轻量 SVG 帧，实拍图需考虑预载 |
| 横向滚动 Horizontal Scroll | 卡片左右滑，不强制停在某张；适合窄屏短卡片轨道 | `overflow-x: auto`，保留滚动条与前后控制 |
| 滚动吸附 Scroll Snap | 停下时卡片对齐；适合一屏一卡的画册 | 容器设 `scroll-snap-type`，卡片设 `scroll-snap-align` |
| 跑马灯 Marquee | 不滚页面也会循环；适合非必要标志或短词 | 复制一轮轨道再平移半条，并提供暂停 |

## 4. 指针和卡片：装饰不能挡操作

用鼠标移动更容易看出跟随的效果；手机点按实验色块，键盘聚焦后按回车也能触发示例。

<div class="motion-lab" data-lab="pointer"></div>

| 效果 | 看什么 · 通常放在哪 | 第一版怎么做 |
| --- | --- | --- |
| 悬停 Hover | 按钮轻轻抬起；也常见于链接和列表行 | 配对写 `:hover`、`:focus-visible` 和过渡 |
| 下拉菜单 | 展开一组选项，选完收起；适合分组链接和简单筛选 | 普通展开列表先考虑 `details`，不只靠悬停 |
| 磁吸按钮 | 指针靠近，按钮表面朝它挪；适合展示页主按钮 | 固定可点击区域，只移动内层 |
| 跟随鼠标转动 | 箭头随指针方向转；适合小插画 | 从元素中心到指针用 `Math.atan2()` 算角度 |
| 自定义光标 | 实验区显示另一个指针形状；适合局部摄影画廊 | 用 `cursor` 设置图形和回退，不要替换全站光标 |
| 指针响应背景 | 整片背景随横移变色；适合互动展示区 | 横坐标映射为色相，用 CSS 变量传值 |
| 光标拖尾 | 移动后，多个光标副本依次跟上；常见于创意作品集 | 用 `cursor-effects` 的 `trailingCursor()`，把效果限制在局部区域；触屏没有鼠标光标 |
| 倾斜卡片 | 近侧朝你抬起；适合产品封面卡 | 用 `perspective()`、`rotateX()`、`rotateY()`，限制幅度 |
| 悬停显现 | 卡片上浮出额外说明，点按也可打开；适合预览元数据 | 配对悬停、聚焦和点按，别把重要信息藏进去 |
| 提示气泡 Tooltip | 小气泡解释图标意思；适合陌生按钮 | 按钮本身有可访问名称，气泡只补充说明，不放操作 |
| 光标聚光灯 Spotlight | 背景不整体变色，而是亮斑跟着指针；适合产品卡 | 指针坐标定位 `radial-gradient()` 的中心 |

## 5. 看详情：内容换了，位置感还在

<div class="motion-lab" data-lab="detail"></div>

| 效果 | 看什么 · 通常放在哪 | 第一版怎么做 |
| --- | --- | --- |
| 共享元素转场 | 同一个物件从缩略图长成详情图；适合商品和照片 | 让两端共享视觉身份，本例记录同一节点的新旧位置和大小 |
| 轮播 Carousel | 用手指滑或鼠标拖，下张画面跟着移动后贴齐；适合产品图集 | 用 Embla 做拖拽和吸附，自己补前后按钮和位置提示，不必自动播 |
| 标签切换 Tabs | 同一位置换不同主题；适合「规格 / 配送」 | 用标签和面板关联，支持方向键，选中态不只靠运动 |
| 图标形变 Icon Morph | 三条线变成关闭符号；适合菜单开关 | 复用同一批线条，改旋转、位移和透明度 |

## 6. 加购反馈：别让人猜点了有没有用

<div class="motion-lab" data-lab="feedback"></div>

| 效果 | 看什么 · 通常放在哪 | 第一版怎么做 |
| --- | --- | --- |
| 点击涟漪 Ripple | 波纹从点击点扩散；适合按下反馈，不代表请求成功 | 点击坐标换算成按钮内坐标，键盘从中心起波 |
| 成功反馈 | 原位出现对勾和「已加入」；适合保存、提交、加购 | 真正成功后再更新按钮，并提供文字状态 |
| 数字滚动 | 连点两次从 98 到 100，看个位、十位和新增百位各自变化；适合购物车或计分板 | 用 NumberFlow 更新数值，不要把整个字符串当成一张图整块滚走 |
| 轻提示 Toast | 出现一句不抢焦点的通知；适合「链接已复制」 | 用状态区域；重要错误不要只靠转瞬消失的消息 |
| 抽屉 Drawer | 面板从边缘进来；适合购物袋或筛选 | 先决定是否锁住背景；本例用模态 `dialog` |
| 布局过渡 Layout Transition | 第一张卡挪到末尾，邻居也移动；适合排序和筛选 | 记旧位置，改真实布局，再从位置差值动画到零 |

## 7. 结账收尾：动效要对应真实状态

<div class="motion-lab" data-lab="checkout"></div>

| 效果 | 看什么 · 通常放在哪 | 第一版怎么做 |
| --- | --- | --- |
| 折叠展开 Accordion | 标题在原位，答案按需展开；适合 FAQ | 用 `details` / `summary`，动画是可选项 |
| 骨架屏 Skeleton | 等待时灰块占位，完成后换成实际内容；适合列表或卡片 | 占位尺寸接近真实内容，失败时给出重试入口 |
| 弹窗 Modal | 焦点进入对话框，背景暂不可操作；适合提交前确认 | 用 `dialog.showModal()`，提供取消、确认和 `Esc` 关闭 |
| 错误反馈 | 输入不符时指出问题，改对后提示消失；适合表单 | 写清哪里错、怎么改；抖动只是附加效果 |
| 页面转场 Page Transition | 内容从购物袋换成订单确认；适合连贯的流程步骤 | 先做好无动画切换与焦点管理，再加动画；本例模拟局部换页，不发起导航 |

## 8. 第一次自己写：从一个按钮开始

保存为 `demo.html` 并用浏览器打开。`transition` 是「属性变了，不要瞬间跳过去」；`160ms` 是时长，`ease-out` 是减速方式。改成 `linear`，或把 `2px` 改成 `12px`，感受区别。

```html
<!doctype html>
<html lang="zh-CN">
<meta charset="utf-8">
<title>我的第一个动效</title>
<style>
  @media (prefers-reduced-motion: no-preference) {
    button { transition: transform 160ms ease-out; }
    button:is(:hover, :focus-visible) { transform: translateY(-2px); }
  }
</style>
<button type="button">移入鼠标，或按 Tab</button>
</html>
```

想让**一个状态**顺滑变化，用 `transition`；想在点击后播完**一段变化**，用 `@keyframes` 或 `element.animate()`；想让**滚动位置**控制进度，先试容器滚动和 `position: sticky`。用手指、键盘和减少动态设置各试一次：不播动画，也要能操作和看懂结果。

可以边试边看本站的[实验脚本]({{ '/assets/js/motion-lab.js' | relative_url }})与[样式]({{ '/assets/css/motion-lab.css' | relative_url }})。想进一步分清 3D、WebGL、three.js、GSAP 的关系和选型，接着读[前端动效资源整理]({% post_url 2026-11-18-frontend-animation-resources %})。继续阅读：MDN 的 [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)、[滚动驱动动画](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations)、[减少动态效果](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) 和 [`dialog`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)。
