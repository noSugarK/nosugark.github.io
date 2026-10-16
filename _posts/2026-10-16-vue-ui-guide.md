---
layout: post
title: Vue 3 前端实用指南：Vite、路由、状态管理与 UI 组件库怎么选
description: 从 Vue 3 + TypeScript 项目搭建开始，比较 Element Plus、Naive UI、Ant Design Vue、Vuetify、PrimeVue 和 Vant，完成带搜索、加载与错误处理的列表页，并整理接口、主题、图表和部署的常见问题。
tags: [Vue, TypeScript, 前端, UI, Vite, 部署]
math: false
mermaid: false
---

前后端分离项目里，Vue 负责页面和交互，但真正开始做业务，还会遇到一串选择：项目用什么构建，页面怎么切换，接口怎么调用，表格、弹窗、表单从哪里来，需不需要状态管理。

这篇以 **Vue 3 + TypeScript** 为主线，把这些配套工具放到同一个项目里说明。先选一套够用的组合，再做一个能请求接口、搜索和处理错误的列表页。

部署部分可以结合 [Docker 实用教程]({% post_url 2026-09-24-docker-guide %}) 阅读；Django、Nginx 和服务器排障见 [Ubuntu 小型 Web 项目运维实录]({% post_url 2026-10-16-ubuntu-web-operations %})。

{% raw %}

## 1. 先分清这些工具分别负责什么

| 工具 | 负责什么 | 什么时候需要 |
| --- | --- | --- |
| Vue | 组件、响应式状态、模板渲染 | 本文的基础 |
| TypeScript | 开发时的类型检查与提示 | 新项目推荐使用 |
| Vite | 开发服务器、模块处理与生产构建 | 常见 Vue 单页应用 |
| Vue Router | URL 与页面组件之间的映射 | 有多个页面、需要可分享的页面地址 |
| Pinia | 跨组件、跨页面共享客户端状态 | 登录用户、共享设置等状态变复杂时 |
| UI 组件库 | 表单、表格、弹窗、日期选择器等 | 后台、业务系统，或需要统一交互规范时 |
| Nuxt | 基于 Vue 的应用框架，提供路由、服务端渲染等能力 | 内容站、SEO 或首屏渲染有相应要求时 |

Vite 不负责路由，Pinia 不负责请求缓存，组件库也不会自动完成业务校验。把职责分开，后面才不会为了一个表格把所有库都装上。

常见的几套组合：

- **内部管理系统**：Vue + Vite + TypeScript + Vue Router + Element Plus。
- **需要更灵活主题的后台**：在同类组合中考虑 Naive UI 或 PrimeVue。
- **移动端 H5**：Vue + Vite + Vue Router + Vant。
- **内容网站**：优先评估 Nuxt；文档网站也可以考虑 VitePress。
- **简单展示页**：可能只需要 HTML、CSS 和少量 JavaScript。

## 2. Vue UI 组件库怎么选

### 2.1 常见组件库对比

| 组件库 | 主要特点 | 适合场景 | 选择时重点看 |
| --- | --- | --- | --- |
| [Element Plus](https://element-plus.org/) | Vue 3 组件丰富，后台常见表格与表单齐全，中文资料多 | 管理系统、CRUD 业务 | 复杂表格能力和自定义视觉是否够用 |
| [Naive UI](https://www.naiveui.com/) | TypeScript 支持完善，通过主题配置调整整体风格 | 后台、工具平台 | 渲染函数式表格列配置是否适合团队 |
| [Ant Design Vue](https://antdv.com/) | 遵循 Ant Design，企业级表单和交互规范成熟 | 企业业务系统 | 团队是否采用 Ant Design 的设计语言 |
| [Vuetify](https://vuetifyjs.com/) | Material Design 风格，组件与布局体系完整 | 接受 Material 视觉规范的应用 | 默认视觉与产品品牌是否匹配 |
| [PrimeVue](https://primevue.org/) | 业务组件覆盖广，提供主题及无样式使用方式 | 业务系统、定制设计系统 | 主题方案、模板和附加资源的授权边界 |
| [Vant](https://vant-ui.github.io/vant/) | 以移动端触摸交互为主 | 移动端 H5、轻量业务页 | 实际设备、键盘弹出和安全区适配 |
| [shadcn-vue](https://www.shadcn-vue.com/) | 将可定制组件代码放进项目，常与 Tailwind CSS 配合 | 自定义视觉、愿意维护组件代码的团队 | 后续修改、升级与可访问性维护成本 |
| [Reka UI](https://reka-ui.com/) | 提供无样式的交互基础组件 | 自建设计系统 | 需要自己补足样式与业务组件 |

它们解决的问题并不完全一样。Element Plus 这类库开箱即用；无样式组件和代码分发方案给了更多控制权，也意味着要承担更多设计与维护工作。

不要只看首页截图。拿项目里最难的一页试做：带校验的弹窗表单、可编辑表格、远程搜索下拉框，再看键盘操作、错误提示、移动端和暗色模式是否符合需求。

组件 API、主题方式和打包体积会随版本变化，最终以所选版本的官方文档和实际构建结果为准。

### 2.2 一个项目尽量只用一套主组件库

同时混用几套完整 UI 库，会遇到按钮高度、字体、弹窗层级、主题变量和 CSS 重置互相打架的问题。

更稳的组合是一套主 UI 库，加确实缺少的专项能力。例如 Element Plus + ECharts，而不是为了另一个日期选择器再引入整套后台 UI。

组件库负责基础一致性，页面是否好用还取决于信息层级、布局、内容和交互反馈。统一间距、减少无用卡片、明确主操作，通常比给所有组件加阴影更有效。

## 3. 创建 Vue 3 + TypeScript 项目

先安装满足当前 Vite 要求的 Node.js LTS。不要照抄多年以前的 Node 版本；以初始化工具提示为准。

```bash
node --version
npm --version

npm create vite@latest vue-admin -- --template vue-ts
cd vue-admin
npm install
npm install vue-router element-plus
npm run dev
```

也可以使用 Vue 官方的 `npm create vue@latest`，按提示选择 TypeScript、Router 等功能。本文采用 Vite 模板，下面手动接入路由，方便看清各部分的关系。

团队统一一种包管理器，并提交对应锁文件。本文使用 npm，提交 `package-lock.json`，CI 中使用 `npm ci`；不要在同一个项目里轮流生成 npm、pnpm、Yarn 的锁文件。

示例目录：

```text
src/
  api/
    users.ts
  router/
    index.ts
  views/
    UsersView.vue
  App.vue
  main.ts
  style.css
vite.config.ts
```

## 4. 接入 Element Plus 与路由

### 4.1 注册组件库

`src/main.ts`：

```ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'
import router from './router'

createApp(App)
  .use(router)
  .use(ElementPlus, { locale: zhCn })
  .mount('#app')
```

这里先用全量注册，接入最直观。需要优化生产体积时，再按照 Element Plus 官方文档配置按需引入或自动导入，并检查构建产物；不要把几种导入方案重复叠在一起。

### 4.2 定义路由

`src/router/index.ts`：

```ts
import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/users' },
    { path: '/users', component: () => import('../views/UsersView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/users' },
  ],
})
```

动态 `import()` 让页面按路由拆包。示例把未知地址重定向到列表页，正式产品通常应该提供独立的 404 页面。

`src/App.vue`：

```vue
<template>
  <div class="app-shell">
    <header class="app-header">
      <strong>业务工作台</strong>
      <nav aria-label="主导航">
        <RouterLink to="/users">用户管理</RouterLink>
      </nav>
    </header>
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>
```

将 Vite 模板的 `src/style.css` 替换为下面内容，移除演示页面里居中布局等默认样式：

```css
:root {
  font-family: system-ui, "Microsoft YaHei", sans-serif;
  color: #243041;
  background: #f5f7fa;
  font-synthesis: none;
}

* { box-sizing: border-box; }
body { margin: 0; }
a { color: #2563eb; }
.app-shell { max-width: 1200px; margin: auto; }
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid #dfe5ec;
}
.app-main { padding: 24px; }
```

## 5. 做一个有完整状态的列表页

一个列表页至少要考虑加载、成功、无数据和失败，不能只有“请求成功时显示表格”。

### 5.1 约定接口，再写请求

本文假设 `GET /api/users/` 返回：

```json
[
  { "id": 1, "name": "张三", "email": "zhangsan@example.com" },
  { "id": 2, "name": "李四", "email": "lisi@example.com" }
]
```

后端如果返回 `{ "results": [...] }`，需要在请求层适配，不能直接照搬数组接口。

`src/api/users.ts`：

```ts
export interface User {
  id: number
  name: string
  email: string
}

export async function getUsers(signal?: AbortSignal): Promise<User[]> {
  const response = await fetch('/api/users/', { signal })
  if (!response.ok) {
    throw new Error(`加载用户失败（HTTP ${response.status}）`)
  }

  const data: unknown = await response.json()
  if (!Array.isArray(data) || !data.every(item =>
    item !== null && typeof item === 'object' &&
    typeof item.id === 'number' &&
    typeof item.name === 'string' &&
    typeof item.email === 'string'
  )) {
    throw new Error('用户接口的数据格式不符合约定')
  }
  return data as User[]
}
```

TypeScript 不会校验网络返回值，所以这里对最小数据结构做了运行时检查。业务接口很多、结构复杂时，再考虑引入 Zod 等工具统一校验。

`fetch` 遇到 400、401、500 不会自动抛出异常，需要检查 `response.ok`。示例直接显示 HTTP 状态，正式项目还可以按接口约定提取业务错误信息。

### 5.2 列表、搜索和失败重试

`src/views/UsersView.vue`：

```vue
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getUsers, type User } from '../api/users'

const users = ref<User[]>([])
const keyword = ref('')
const loading = ref(false)
const error = ref('')
let controller: AbortController | undefined

const filteredUsers = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  return users.value.filter(user =>
    `${user.name} ${user.email}`.toLowerCase().includes(query)
  )
})

async function loadUsers() {
  if (loading.value) return
  controller = new AbortController()
  loading.value = true
  error.value = ''
  try {
    users.value = await getUsers(controller.signal)
  } catch (cause) {
    if (!controller.signal.aborted) {
      error.value = cause instanceof Error ? cause.message : '加载失败，请重试'
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadUsers)
onUnmounted(() => controller?.abort())
</script>

<template>
  <section aria-labelledby="users-title">
    <h1 id="users-title">用户管理</h1>
    <div class="users-toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索姓名或邮箱"
        aria-label="搜索姓名或邮箱"
        clearable
      />
      <el-button :loading="loading" @click="loadUsers">刷新</el-button>
    </div>

    <div v-if="error" role="alert">
      <el-alert :title="error" type="error" :closable="false" show-icon />
      <el-button :loading="loading" @click="loadUsers">重试</el-button>
    </div>

    <p class="users-summary" aria-live="polite">
      {{ loading ? '正在加载…' : `当前显示 ${filteredUsers.length} 条记录` }}
    </p>
    <el-table
      :data="filteredUsers"
      :aria-busy="loading"
      row-key="id"
      empty-text="暂无匹配的用户"
    >
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="name" label="姓名" min-width="130" />
      <el-table-column prop="email" label="邮箱" min-width="220" />
    </el-table>
  </section>
</template>

<style scoped>
.users-toolbar { display: flex; gap: 12px; margin: 20px 0; }
.users-toolbar .el-input { max-width: 360px; }
.users-summary { color: #64748b; font-size: 14px; }
@media (max-width: 480px) {
  .users-toolbar { flex-wrap: wrap; }
}
</style>
```

这里演示的是小数据量的**前端过滤**。几万条记录不应一次全部拉到浏览器：改用后端搜索、分页或游标，并处理连续搜索时的请求取消或响应顺序。

示例还保留了上次成功的数据。刷新失败时显示错误，不会把原列表突然清空；首次失败则显示空表格和错误提示。离开页面会取消正在进行的请求。

## 6. 开发环境代理与生产环境不是一回事

开发时让浏览器向 Vite 请求 `/api/`，再由 Vite 转发给后端。`vite.config.ts`：

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
```

这里保留 `/api` 前缀，后端应提供 `/api/users/`。只有后端路由确实不带前缀时才添加 `rewrite`。

**Vite 的开发代理不会被打包进生产产物。** 上线后由 Nginx 或其他网关转发 `/api/`。前后端同域部署时，前端继续使用相对路径，可以减少跨域配置。

Vue 不会自动替 Django 配好 CSRF。使用 Django Session 登录时，写请求还需要按照后端约定获取并发送 CSRF Token；跨域 Cookie 还涉及 `credentials`、CORS、SameSite 与 HTTPS，不能只改一项前端选项。

## 7. Pinia：共享状态确实出现时再加

单个页面的表格、搜索词和弹窗状态，用 `ref`、`computed` 就够了。跨组件先考虑 props 与事件；多个页面共同使用的登录用户或偏好设置，可以放 Pinia。

```bash
npm install pinia
```

在 `main.ts` 的应用链上注册 `.use(createPinia())`，并添加 `import { createPinia } from 'pinia'`。定义 `src/stores/preferences.ts`：

```ts
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePreferencesStore = defineStore('preferences', () => {
  const compact = ref(false)
  function toggleCompact() {
    compact.value = !compact.value
  }
  return { compact, toggleCompact }
})
```

读取 store 时，直接解构响应式属性会丢失响应式联系。使用 `storeToRefs`，动作可以直接解构：

```ts
import { storeToRefs } from 'pinia'
import { usePreferencesStore } from './stores/preferences'

const preferences = usePreferencesStore()
const { compact } = storeToRefs(preferences)
const { toggleCompact } = preferences
```

上面的导入路径假设调用文件直接位于 `src/`，其他位置按相对路径调整。Pinia 默认不会把状态持久化；是否保存到本地应按数据类型决定，不要把整个 store 不加区分地塞进 `localStorage`。

## 8. 图表、图标、样式和请求还需要哪些库

| 需求 | 可选工具 | 建议 |
| --- | --- | --- |
| 业务图表 | ECharts、Chart.js | 复杂报表可考虑 ECharts，简单图表按需求选；记得销毁实例与处理容器尺寸变化 |
| 图标 | 主组件库配套图标、Lucide | 尽量统一一套，纯图标按钮要有可访问名称 |
| 工具式 CSS | Tailwind CSS、UnoCSS | 适合统一间距和布局规则；普通 CSS 也完全够用 |
| 请求封装 | 原生 fetch、Axios | 请求少先用 fetch；已有 Axios 规范就沿用 |
| 服务端状态 | TanStack Query 的 Vue 适配 | 多页面请求缓存、失效与后台更新变复杂时再评估 |
| 表单校验 | UI 库自带规则、VeeValidate、Zod | 普通表单先用组件库规则；复杂跨字段校验再组合 |
| 单元与组件测试 | Vitest、Vue Test Utils | 覆盖业务规则、状态切换和关键交互 |
| 浏览器端测试 | Playwright | 覆盖登录、提交等核心流程 |

安装库之前先明确它解决什么问题。比如简单的搜索不需要工具函数库，两个页面的共享状态也不一定需要请求缓存框架。

## 9. 主题定制与表单交互

Element Plus 的一部分设计变量可以通过 CSS 自定义属性修改，例如在全局样式中：

```css
:root {
  --el-color-primary: #2563eb;
}
```

如果要统一 hover 等派生色，需按官方主题方案同步调整相关变量或通过 Sass 生成主题；只替换一个颜色变量，不保证所有交互态都会自动重算。

优先使用组件公开的属性、插槽与主题变量。不要到处依赖内部 DOM 选择器和 `!important`，组件升级后容易失效。

表单页还有几条比样式更直接的要求：

- 字段有可见标签，必填和错误不能只靠颜色表示。
- 提交时显示状态并阻止重复点击；关键写操作仍需后端保证幂等性或约束。
- 校验错误靠近字段，提交失败保留用户输入。
- 删除等破坏性动作明确对象和后果；不要只显示一个含糊的“确定吗”。
- 能用键盘完成操作，弹窗有合理焦点，窄屏下操作按钮仍可触达。

暗色模式也要同时覆盖应用背景、文本、图表和组件浮层，不能只给页面加一个深色背景。

## 10. 构建与部署的常见问题

### 10.1 生产构建

```bash
npm run build
npm run preview
```

检查当前模板的 `package.json`。Vue + TypeScript 模板通常在构建脚本中包含 `vue-tsc`；如果团队修改过脚本，要确保 CI 仍执行类型检查。单独运行 Vite 构建并不等于完成 TypeScript 类型检查。

生产产物通常在 `dist/`，交给静态服务器托管。`npm run preview` 用于检查构建结果，不作为正式生产服务器。

### 10.2 刷新子路由 404

使用 history 路由时，直接请求 `/users` 需要服务器回退到 `index.html`。Nginx 根路径部署示例：

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $http_host;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
    try_files $uri $uri/ /index.html;
}
```

`proxy_pass` 这里不带末尾斜杠，会保留 `/api/` 前缀。不能把不存在的 API 也回退为前端 HTML，否则前端解析 JSON 时会出现 `Unexpected token '<'` 等错误。

### 10.3 放在子目录后资源 404

如果站点部署到 `/admin/`，在 Vite 设置 `base: '/admin/'`，Vue Router 使用前面的 `import.meta.env.BASE_URL`，服务器也应按该目录配置静态资源和回退路径。API 是否仍使用根路径 `/api/` 则由后端约定决定。

### 10.4 环境变量里不能放密钥

```dotenv
VITE_API_BASE_URL=/api
```

通过 `import.meta.env.VITE_API_BASE_URL` 读取的值会进入客户端构建，用户能够查看。数据库密码、服务端私钥和第三方服务密钥都不应放进去。

这些变量通常在构建时替换。修改生产服务器上的 `.env` 后，如果没有专门的运行时配置机制，就需要重新构建，不能期待已有 JavaScript 文件自动变化。

## 11. 开始做业务前检查一遍

1. 选定一套主组件库，先试做最复杂的表格或表单页。
2. 与后端确认字段、分页、错误格式、日期时区和登录方式。
3. 请求页面具备加载、无数据、失败、重试和重复操作处理。
4. 路由地址可直接打开，刷新后不 404；按钮权限不能代替服务端鉴权。
5. 在生产构建上验证资源路径、接口代理和浏览器控制台。
6. 真实检查窄屏、键盘操作与输入错误；关键业务逻辑和流程有相应测试。

对多数内部业务系统，Vue + Vite + Router + 一套 UI 库已经能完成第一版。状态管理、请求缓存和更深的组件抽象，等出现明确的共享需求和重复逻辑时再加入。

{% endraw %}
