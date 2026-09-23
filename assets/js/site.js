/* ==========================================================
   改简历 = 改下面的数据，不用碰 HTML / CSS。
   需要翻译的字段写成 {zh:"…", en:"…"}；技术名 / URL / 日期直接写字符串。
   ========================================================== */
const BIO = {
  zh:"计算机科学与技术专业，现在创首科技做技术支持。写 Django + Vue 的 Web 系统、Tauri 与 PySide6 的桌面应用，也做视觉识别与大模型接入。ICPC 省赛银奖、蓝桥杯国赛二等奖。",
  en:"CS graduate, now doing technical support at Chuangshou Technology. I build Django + Vue web systems, Tauri and PySide6 desktop apps, and work on vision models and LLM integration. ICPC provincial silver, Lanqiao Cup national 2nd prize."
};
const TAGS = [
  {zh:"全栈开发",en:"Full-stack"},{zh:"计算机视觉",en:"Computer Vision"},
  {zh:"大模型接入",en:"LLM Integration"},{zh:"算法竞赛",en:"Competitive Programming"},
  "Python / C++"
];
const FACTS = [
  [{zh:"出生",en:"BORN"},   "2004.05"],
  [{zh:"籍贯",en:"FROM"},   {zh:"湖北 · 荆州",en:"Jingzhou, Hubei"}],
  [{zh:"院校",en:"SCHOOL"}, {zh:"湖北第二师范学院",en:"Hubei Univ. of Education"}],
  [{zh:"专业",en:"MAJOR"},  {zh:"计算机科学与技术",en:"Computer Science and Technology"}],
  [{zh:"邮箱",en:"EMAIL"},  "nosugark@qq.com"],
  [{zh:"所在地",en:"LOCATION"}, {zh:"湖北 · 武汉",en:"Wuhan, Hubei"}],
  [{zh:"状态",en:"STATUS"}, {zh:"在职",en:"employed"}],
];
/* 每个分类都必须有项目，否则点进去是空的。加分类前先确认有东西归进去 */
const CATS = [ {zh:"全部",en:"All"}, {zh:"Web",en:"Web"}, {zh:"桌面",en:"Desktop"},
               {zh:"AI 视觉",en:"AI & Vision"} ];

/* private:true 的仓库未公开，渲染成灰字而不是链接——让访客点出 404 更糟。
   有公开站点的用 site 字段，优先链站点。仓库开放后把 private 删掉即可。 */
const PROJECTS = [
  {name:"ReaLingo", cat:"桌面", site:"https://nosugark.github.io/ReaLingo/",
   url:"https://github.com/noSugarK/ReaLingo",
   desc:{zh:"桌面实时同声传译。接阿里云百炼 Qwen3.5-LiveTranslate，麦克风 / 系统声音 / 本地文件三种音源，60 语种互译；独立字幕窗可置顶、锁定后鼠标点击穿透，不挡住下面的播放器。",
         en:"Real-time desktop interpretation. Built on Alibaba Bailian's Qwen3.5-LiveTranslate; takes audio from the mic, system output or a local file and translates across 60 languages. The detached subtitle window stays on top and, once locked, passes clicks through so it never blocks the player underneath."},
   stack:["Tauri2","Rust","Vue3","TypeScript"]},

  {name:"AIM 赛事管理系统", cat:"Web", private:true, url:"https://github.com/junco-liu/vex-aim-score",
   desc:{zh:"VEX AIM 挑战赛的计分、排名与对阵一站式系统，前后端独立完成。支持 Docker 部署与 PyInstaller 单机打包（赛场一台笔记本即可开赛）；场控经 Web Bluetooth 直连硬件，计时用自研的分段时钟模型。",
         en:"One-stop scoring, ranking and bracket system for the VEX AIM challenge, built solo front to back. Ships either as a Docker deployment or a single PyInstaller executable so one laptop can run an event; field control talks to the hardware over Web Bluetooth, timing uses a custom segmented-clock model."},
   stack:["Vue3","Pinia","Django5","DRF","PostgreSQL","Docker"]},

  {name:"AIM Agent", cat:"AI 视觉", private:true, url:"https://github.com/junco-liu/aim-agent-dev",
   desc:{zh:"让 VEX AIM 机器人听懂人话。大模型负责意图理解与动作规划，本地 faster-whisper 识音、Piper 合成语音，工具层把 LED、运动、屏幕、声音、视觉封装成可被模型调用的能力。",
         en:"Makes the VEX AIM robot follow spoken instructions. An LLM handles intent and action planning; speech recognition (faster-whisper) and synthesis (Piper) run locally, and a tool layer exposes LEDs, motion, screen, sound and vision as callable capabilities."},
   stack:["PySide6","OpenAI API","faster-whisper","Piper","OpenCV"]},

  {name:"aim-plate", cat:"Web", private:true, site:"https://vexaim.cc.cd/",
   url:"https://github.com/junco-liu/aim-plate",
   desc:{zh:"浏览器直连机器人的局域网控制台，没有后端。四条 WebSocket 全由用户浏览器发起，Pyodide 在页面里跑 CPython，程序和数据都不出本机。官方方案要装 Python 跑脚本，这个打开网页就能用。",
         en:"A LAN console that drives the robot straight from the browser, with no backend at all. All four WebSockets are opened by the user's own browser and Pyodide runs CPython in-page, so neither the program nor the data ever leaves their machine — where the official route needs a Python install and a script, this just needs a tab."},
   stack:["Pyodide","WebSocket","Vanilla JS"]},

  {name:"aim-plate-desktop", cat:"桌面", private:true,
   url:"https://github.com/junco-liu/aim-plate-desktop",
   desc:{zh:"aim-plate 的 Tauri 外壳，只为两件事存在：窗口来源是 loopback，连 ws://192.168.x.x 不再弹本地网络权限框；Pyodide 与素材全部打进安装包，装完拔网线照样能用。",
         en:"A Tauri shell around aim-plate that exists for exactly two reasons: the window's origin is loopback, so reaching ws://192.168.x.x no longer triggers the Local Network Access prompt; and Pyodide plus all assets are bundled, so it works with the network cable pulled."},
   stack:["Tauri2","Rust","Python"]},

  {name:"tools_for_3d_detection", cat:"AI 视觉",
   url:"https://github.com/noSugarK/tools_for_3d_detection",
   desc:{zh:"3D 标注自动化质检工具，本科毕业设计。用 YOLO11n 配合 3D→2D 投影与 Qwen3-VL，校验图像与人工标注是否真的对应——这正是纯脚本查不出来的那一类错误。",
         en:"Automated QA for 3D annotations, my final-year project. YOLO11n plus 3D-to-2D projection and Qwen3-VL check whether an image and its human annotation actually correspond — precisely the class of error a format-checking script cannot catch."},
   stack:["Python3.13","PySide6","YOLO11n","OpenCV"]},

  {name:"algoscent", cat:"Web", url:"https://github.com/noSugarK/algoscent",
   desc:{zh:"基于大语言模型的个性化调香网站。前后端分离，用户填完问卷后调用 Qwen 模型做个性化分析并给出配方建议。",
         en:"LLM-powered personalized perfumery site. Decoupled front and back end; once a user finishes the questionnaire a Qwen model analyses it and proposes a formulation."},
   stack:["Django5","Vue3","ElementPlus","MySQL8"]},

  {name:"hbszDataVisual", cat:"Web", url:"https://github.com/noSugarK/hbszDataVisual",
   desc:{zh:"基于 Django5 的数据分析可视化平台，实习期间落地并交付业务方使用。涵盖数据可视化、数据填报、用户管理与数据预测。",
         en:"A Django5 analytics and visualisation platform built and handed over to the business during my internship: dashboards, data entry, user management and forecasting."},
   stack:["Django5","Bootstrap5","ECharts5","jQuery3"]},
];

const SKILLS = ["Python","C / C++","Django / DRF","Vue3","Tauri / Rust","PySide6 / PyQt6",
                "MySQL / SQLite","YOLO / Ultralytics","OpenCV","PyTorch",
                "LLM / Agent","WebSocket","Docker","Git"];

const EDU = [
  {when:"2022.09 - 2026.06",
   org:{zh:"湖北第二师范学院 · 计算机科学与技术",en:"Hubei University of Education · Computer Science"},
   role:{zh:"本科 / GPA 3.6 · 5.0",en:"B.Eng. / GPA 3.6 of 5.0"},
   items:[{zh:"算法分析与设计、数据结构、编译原理、软件测试、网络安全、Python 数据分析",
           en:"Algorithm design, data structures, compilers, software testing, network security, Python data analysis"}]},
];

/* 按 工作 / 实习 / 在校 分组，组内倒序。
   kind 同时决定时间线节点和组标记的几何形状，见 main.css 的 [data-kind] */
const EXP = [
  {kind:"work", kicker:"WORK", group:{zh:"工作经历",en:"Work"}, list:[
    {when:{zh:"2026.03 - 至今",en:"2026.03 - Present"},
     org:{zh:"创首科技（武汉）有限公司",en:"Chuangshou Technology (Wuhan)"},
     role:{zh:"技术支持",en:"Technical Support"},
     items:[
       {zh:"搭建 AIM Agent，将公司产品接入大语言模型，实现语音对话控制与图像理解",
        en:"Built the AIM Agent connecting company products to an LLM, adding voice-command control and image understanding"},
       {zh:"独立完成赛事管理系统前后端：赛队登记、对阵表自动生成、计分计时与场控",
        en:"Solely built a competition management system, front and back end: team registration, automatic bracket generation, scoring, timing and floor control"},
       {zh:"扩展视觉能力模块：人脸情绪识别、手势识别、图像识别",
        en:"Shipped vision modules: facial emotion recognition, gesture recognition and image recognition"},
       {zh:"吃透产品线并产出配套课程与扩展应用，同时参与硬件搭建与嵌入式编程",
        en:"Learned the product line end to end and produced companion courseware and extension apps; also handled hardware assembly and embedded programming"}]},
  ]},

  {kind:"intern", kicker:"INTERNSHIP", group:{zh:"实习经历",en:"Internships"}, list:[
    {when:"2025.10 - 2026.02",
     org:{zh:"东风悦享科技有限公司",en:"Dongfeng Yuexiang Technology"},
     role:{zh:"数据质检辅助工程师",en:"Data QA Engineer (Intern)"},
     items:[
       {zh:"对已标注数据做格式与数值校验，用 Python 编写自动化脚本批量质检与验收",
        en:"Validated the format and values of annotated data; wrote Python scripts for batch quality checks and acceptance"},
       {zh:"同期完成毕业设计：基于 YOLO11n 的 3D 标注自动化质检工具",
        en:"Delivered my final-year project in parallel: an automated 3D-annotation QA tool built on YOLO11n"},
       {zh:"补上纯脚本的盲区——脚本只能查格式，查不出图像与标注是否真的对应",
        en:"Closed the blind spot of script-only checking: scripts verify format, not whether an image and its annotation actually match"}]},
    {when:"2025.07 - 2025.09",
     org:{zh:"湖北市政集团",en:"Hubei Municipal Group"},
     role:{zh:"数据分析 / 全栈开发",en:"Data Analysis / Full-stack (Intern)"},
     items:[
       {zh:"独立交付基于 Django5 的数据分析平台：数据可视化、数据填报、用户管理、数据预测",
        en:"Delivered a Django5 analytics platform end to end: visualisation, data entry, user management and forecasting"},
       {zh:"从前期数据清洗、中期分析口径设计到后期效果落地全程负责",
        en:"Owned the whole chain — data cleaning, analysis design, and final delivery"},
       {zh:"前端使用 Bootstrap、Chart.js、Font Awesome 构建页面效果",
        en:"Built the front end with Bootstrap, Chart.js and Font Awesome"}]},
  ]},

  {kind:"campus", kicker:"CAMPUS", group:{zh:"在校经历",en:"Campus"}, list:[
    {when:"2024.02 - 2025.01",
     org:{zh:"HUE_ACM 算法协会",en:"HUE_ACM Algorithm Club"},
     role:{zh:"会长",en:"President"},
     items:[{zh:"管理团队并提升成员编程能力",en:"Led the team and coached members' programming skills"},
            {zh:"收集整理竞赛信息，统筹报名与参赛",en:"Tracked contest information and coordinated registration and participation"}]},
    {when:"2023.09 - 2024.09",
     org:{zh:"院社团指导中心",en:"Faculty Student Club Center"},
     role:{zh:"指导主席",en:"Chair"},
     items:[{zh:"负责学院所属社团的活动指导与审核",en:"Supervised and reviewed activities of the faculty's student clubs"},
            {zh:"担任院校两级沟通协调枢纽",en:"Acted as liaison between faculty and university levels"}]},
  ]},
];

const AWARDS = [
  [{zh:"银奖",en:"Silver"},   {zh:"2025 ICPC 贵州省赛",en:"2025 ICPC Guizhou Provincial Contest"}],
  [{zh:"二等",en:"2nd"},      {zh:"2025 第十六届蓝桥杯 Python 组国赛",en:"2025 16th Lanqiao Cup, Python group, national final"}],
  [{zh:"三等",en:"3rd"},      {zh:"2023 第十四届蓝桥杯 C/C++ 组国赛",en:"2023 14th Lanqiao Cup, C/C++ group, national final"}],
  [{zh:"三等",en:"3rd"},      {zh:"2024 睿抗机器人开发者大赛全国总决赛",en:"2024 RAICOM Robot Developer Contest, national final"}],
  [{zh:"二等",en:"2nd"},      {zh:"2024 第十七届智能汽车竞赛 5G 无人车",en:"2024 17th Smart Car Competition, 5G autonomous vehicle"}],
  [{zh:"三等",en:"3rd"},      {zh:"2025 第十届团体程序设计天梯赛总决赛",en:"2025 10th GPLT national final"}],
  [{zh:"三等",en:"3rd"},      {zh:"2025 第十七届华中杯数学建模",en:"2025 17th Huazhong Cup Mathematical Modeling"}],
];

const ABOUT = {
  zh:"扎实的编程基础，熟练使用流行Coding Agent工具开发：Claude Code、Codex、Trae、Qoder；对嵌入式与 Web 开发都有涉猎。善于分析和吸取经验，性格开朗，团队荣誉感强。",
  en:"Possesses a solid foundation in programming and is proficient in using popular AI coding agents—such as Claude Code, Codex, Trae, and Qoder—for development. Experienced in both embedded systems and web development. Skilled at analysis and learning from experience; possesses an outgoing personality and a strong sense of team spirit."
};

const UI = {
  more:{zh:"+ 更多项目施工中",en:"+ More projects in progress"},
  repo:{zh:"查看仓库",en:"View repo"},
  site:{zh:"访问站点",en:"Visit site"},
  privateRepo:{zh:"仓库未公开",en:"Repo not public"},
  privateTag:{zh:"私有",en:"PRIVATE"},
  search:{zh:"搜索项目 / 技能 / 奖项…",en:"Search projects / skills / awards…"},
  searchPosts:{zh:"搜索文章标题 / 标签 / 正文…",en:"Search posts by title, tag or text…"},
  findInPost:{zh:"在本文中查找…  ↵ 下一个",en:"Find in this article…  ↵ next"},
  langBtn:{zh:"EN",en:"中"},                                  /* 显示的是「切过去」的语言 */
  langTip:{zh:"Switch to English",en:"切换为中文"},
  themeTip:{zh:{light:"切换为深色",dark:"切换为浅色"},
            en:{light:"Switch to dark",dark:"Switch to light"}},
};

/* ===================== 工具 ===================== */
/* localStorage 在隐私模式下会抛异常，包一层 */
const store = {
  get(k){ try{ return localStorage.getItem(k); }catch{ return null; } },
  set(k,v){ try{ localStorage.setItem(k,v); }catch{} }
};
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

let lang = store.get("lang") === "en" ? "en" : "zh";
let cat = "全部";
/* 列表页 ?tag= 参数：点文章标签跳过来时按标签精确过滤。空串=不过滤。 */
const activeTag = (new URLSearchParams(location.search).get("tag") || "").toLowerCase();
const t = o => (o && typeof o === "object" && !Array.isArray(o)) ? o[lang] : o;
/* 搜索索引双语拼接，中英文都能搜到 */
const idx = (...xs) => esc(xs.flat(9)
  .map(x => (x && typeof x === "object") ? Object.values(x).join(" ") : x).join(" "));

/* 按页面类型分流：首页筛简历、列表页筛文章、文章页文内查找 */
const isHome = !!$("#grid");
const prose  = $(".prose");
const isPost = !!prose;
const isList = !!$("#post-list");   /* 博客列表页：只有它有左侧时间轴 */

/* ===================== 渲染 ===================== */
function renderResume(){
  if(!isHome) return;

  /* --d 是入场时的逐枚延迟；只有 <html class="boot"> 在时 CSS 才会用它 */
  $("#tags").innerHTML = TAGS.map((x,i)=>
    `<span class="tag" style="--d:${(.72 + i * .07).toFixed(2)}s">${esc(t(x))}</span>`).join("");
  $("#bio").textContent = t(BIO);
  $("#facts").innerHTML = FACTS.map(([k,v])=>`<dt>${esc(t(k))}</dt><dd>${esc(t(v))}</dd>`).join("");

  $("#filters").innerHTML = CATS.map(c=>
    `<button data-f="${esc(c.zh)}"${c.zh===cat?' class="on"':''}>${esc(t(c))}</button>`).join("");

  /* 链接优先级：公开站点 > 公开仓库 > 灰字「仓库未公开」。
     私有仓库不做成链接——让访客点出一个 404 比不给链接更糟。 */
  const cta = p => p.site
    ? `<a class="go" href="${esc(p.site)}" target="_blank" rel="noopener">${esc(t(UI.site))} <i>→</i></a>`
    : !p.private
      ? `<a class="go" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(t(UI.repo))} <i>→</i></a>`
      : `<span class="go off">${esc(t(UI.privateRepo))}</span>`;

  /* view-transition-name 让筛选时卡片是「移动」而不是「闪现」 */
  $("#grid").innerHTML = PROJECTS.map((p,i)=>`
    <article class="card proj" style="view-transition-name:proj${i}" data-cat="${esc(p.cat)}"
             data-s="${idx(p.name,p.desc,p.stack,p.cat,p.site||"")}">
      <h3>${esc(p.name)}</h3>
      <div class="sub">${esc(t(CATS.find(c=>c.zh===p.cat)||p.cat)).toUpperCase()}${
        p.private ? ` · ${esc(t(UI.privateTag))}` : ""}</div>
      <p>${esc(t(p.desc))}</p>
      <div class="stack">${p.stack.map(s=>`<i>${esc(s)}</i>`).join("")}</div>
      ${cta(p)}
    </article>`).join("") +
    `<article class="card proj add" style="view-transition-name:projAdd" data-cat="全部" data-s="">
       <div>${esc(t(UI.more))}</div></article>`;

  $("#skills-list").innerHTML = SKILLS.map(s=>`<span class="skill" data-s="${esc(s)}">${esc(s)}</span>`).join("");

  const tl = list => list.map(e=>`
    <article class="card" data-s="${idx(e.when,e.org,e.role,e.items)}">
      <div class="when">${esc(t(e.when))}</div>
      <div><h3>${esc(t(e.org))}</h3><div class="role">${esc(t(e.role))}</div>
        <ul>${e.items.map(i=>`<li>${esc(t(i))}</li>`).join("")}</ul></div>
    </article>`).join("");
  /* 分组：每组一条竖轴，组内条目挂节点。空组由 filter() 收掉 */
  $("#exp-list").innerHTML = EXP.map(g=>`
    <div class="tl-sec" data-kind="${esc(g.kind)}">
      <h3 class="tl-title">${esc(t(g.group))}<em>${esc(g.kicker)}</em></h3>
      ${tl(g.list)}
    </div>`).join("");
  $("#edu-list").innerHTML = tl(EDU);

  $("#awards-list").innerHTML = AWARDS.map(([m,a])=>`
    <article class="card award" data-s="${idx(m,a)}">
      <span class="medal">${esc(t(m))}</span><span>${esc(t(a))}</span></article>`).join("");

  $("#about-text").textContent = t(ABOUT);
  $("#about-text").dataset.s = idx(ABOUT);

  animate();
  filter();
}

/* ===================== 语言 ===================== */
/* 静态文案原文存进 data-zh，切换时按 lang 取 */
function setLang(l){
  lang = l; store.set("lang", l);
  document.documentElement.lang = l === "en" ? "en" : "zh-CN";
  $$("[data-en]").forEach(el=>{
    if(el.dataset.zh === undefined) el.dataset.zh = el.textContent;
    el.textContent = el.dataset[l];
  });
  const q = $("#q");
  if(q) q.placeholder = t(isPost ? UI.findInPost : isHome ? UI.search : UI.searchPosts);
  const lb = $("#lang");
  if(lb){ lb.textContent = t(UI.langBtn); lb.title = lb.ariaLabel = t(UI.langTip); }
  syncTheme();
  renderResume();
}

/* ===================== 深浅色 ===================== */
/* 首屏的 data-theme 由 <head> 里的内联脚本定好，这里只负责切换和提示文案 */
function syncTheme(){
  const tb = $("#theme");
  if(!tb) return;
  const tip = UI.themeTip[lang][document.documentElement.dataset.theme] || "";
  tb.title = tb.ariaLabel = tip;
}
function toggleTheme(){
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  store.set("theme", next);
  syncTheme();
}

/* ===================== 搜索 + 筛选 ===================== */
/* 过滤所有带 data-s 的块，整段空了就折叠。
   首页筛简历卡片、列表页筛文章行，同一套代码。 */
function filter(){
  const box = $("#q");
  if(!box || isPost) return;
  const q = box.value.trim().toLowerCase();
  const all = [...$$("[data-s]")];
  all.forEach(el=>{
    const okC = !el.dataset.cat || cat === "全部" || el.dataset.cat === cat;
    const okT = !activeTag || (el.dataset.tags || "").toLowerCase().split(",").includes(activeTag);
    const okQ = !q || el.dataset.s.toLowerCase().includes(q);
    el.hidden = !(okC && okT && okQ);
  });
  /* 整段空了就折叠。也作用于经历分组，否则筛掉全部条目后只剩一个光秃秃的组标题。
     .mo 是博客列表的月份分组（div，不在 section 那批里），单独并进来。 */
  $$("main section, .tl-sec, .mo").forEach(s=>{
    const inner = s.querySelectorAll("[data-s]");
    s.hidden = inner.length > 0 && ![...inner].some(e=>!e.hidden);
  });
  tlVisibility();
  /* #empty 是 main 的直接子元素，不会被上面的折叠波及 */
  $("#empty").style.display = ((q || activeTag) && !all.some(e=>!e.hidden)) ? "block" : "none";
}

/* 列表页顶部显示当前标签过滤 + 一个「清除」回到全部。
   纯链接跳转，不造 SPA 状态；清除就是回到不带 ?tag= 的当前页。 */
function initTagbar(){
  const bar = $("#tagbar");
  if(!bar || !activeTag) return;
  const raw = new URLSearchParams(location.search).get("tag");
  const lbl = lang === "en" ? "Tag" : "标签";
  const clr = lang === "en" ? "clear ×" : "清除 ×";
  bar.innerHTML = `${lbl} <b>${esc(raw)}</b> <a href="${esc(location.pathname)}">${clr}</a>`;
  bar.hidden = false;
}

/* ===================== 文内查找 =====================
   CSS Custom Highlight API：只给 Range 上色，不动 DOM，
   所以反复搜索不会把正文结构搞坏。不支持的浏览器仍能计数和跳转，只是没底色。
   ponytail: 只在单个文本节点内匹配，跨标签的词（如「前**端**」）搜不到；
   真要跨标签就得先拼全文再映射回 Range，代价不值。
   ============================================== */
const CAN_HL = typeof Highlight !== "undefined" && window.CSS && CSS.highlights;
let hits = [], cur = 0;

function paintHits(){
  const info = $("#qinfo"), box = $("#q");
  if(info) info.textContent = (isPost && box && box.value.trim())
    ? (hits.length ? `${cur + 1}/${hits.length}` : "0") : "⌕";
  if(!CAN_HL) return;
  CSS.highlights.delete("find"); CSS.highlights.delete("find-cur");
  if(!hits.length) return;
  CSS.highlights.set("find", new Highlight(...hits));
  const one = new Highlight(hits[cur]);
  one.priority = 1;                       /* 压住上面那层通用命中 */
  CSS.highlights.set("find-cur", one);
}

function jumpTo(i){
  if(!hits.length) return;
  cur = (i + hits.length) % hits.length;
  paintHits();
  const r = hits[cur].getBoundingClientRect();
  scrollBy({top: r.top - innerHeight * 0.32, behavior: MOTION ? "smooth" : "auto"});
}

function findInArticle(q){
  hits = []; cur = 0;
  if(q){
    const w = document.createTreeWalker(prose, NodeFilter.SHOW_TEXT);
    for(let n; (n = w.nextNode());){
      const s = n.nodeValue.toLowerCase();
      for(let i = s.indexOf(q); i !== -1; i = s.indexOf(q, i + q.length)){
        const r = document.createRange();
        r.setStart(n, i); r.setEnd(n, i + q.length);
        hits.push(r);
      }
    }
  }
  paintHits();
  if(hits.length) jumpTo(0);
}

/* ===================== 文章目录 ===================== */
function buildToc(){
  const el = $("#toc");
  if(!el || !prose) return null;
  const hs = [...prose.querySelectorAll("h2, h3, h4")];
  if(hs.length < 2){ el.remove(); return null; }   /* 一两个标题不值得做目录 */
  /* 按级别嵌套成真正的树：栈顶保存「当前这一级往下挂的那个 ul」，
     遇到同级或更浅的标题就把栈弹到合适的祖先。三级混排、跳级（h2 直接到 h4）都接得住。
     用 lv2/lv3/lv4 而不是 h2/h3/h4：animate() 的 `main .h2` 会把目录项也当区块标题。
     刻度在前、标签在后——面板向右滑出，露在屏幕内的是左边那一截。 */
  const root = document.createElement("ul");
  const stack = [{lv: 1, ul: root}];
  hs.forEach((h, i) => {
    if(!h.id) h.id = "h-" + i;                     /* kramdown 一般会生成，这里兜底 */
    const lv = +h.tagName[1];
    while(stack.length > 1 && stack[stack.length - 1].lv >= lv) stack.pop();
    const li = document.createElement("li");
    li.className = "lv" + lv;
    li.innerHTML = `<a href="#${h.id}"><span class="tick"></span>` +
      `<span class="label">${esc(h.textContent)}</span></a><ul></ul>`;
    stack[stack.length - 1].ul.appendChild(li);
    stack.push({lv, ul: li.lastElementChild});
  });
  /* 有子项的才配折叠钮，并且默认收起：230px 的侧栏摊开三级会长得离谱。
     当前读到哪一节由 syncToc 顺着祖先链展开，所以「收起」不会藏住正在读的内容。 */
  root.querySelectorAll("li").forEach(li => {
    if(li.lastElementChild.children.length){
      li.classList.add("shut");
      li.insertAdjacentHTML("afterbegin",
        `<button class="fold" type="button" aria-expanded="false" aria-label="展开或折叠子目录"></button>`);
    } else {
      li.lastElementChild.remove();               /* 空 ul 不留 */
    }
  });
  /* 委托一个 click 就够：折叠钮是 li 的兄弟而不是 a 的子节点，
     点标题跳转和点钮开合天然不打架，不用 stopPropagation 那一套。 */
  el.addEventListener("click", e => {
    const b = e.target.closest(".fold");
    if(!b) return;
    b.setAttribute("aria-expanded", b.parentElement.classList.toggle("shut") ? "false" : "true");
  });
  el.appendChild(root);
  return {hs, links: [...el.querySelectorAll("a")]};
}
const TOC = buildToc();

/* 当前位置 = 最后一个顶边已经越过粘性顶栏的标题。
   比 IntersectionObserver 更贴合「我正在读哪一节」的语义。 */
let tocActive = -1;
function syncToc(){
  if(!TOC) return;
  const h = document.documentElement;
  let active = 0;
  /* 触底特判：末尾几节往往比剩余视口还短，标题永远滚不到顶栏以上，
     不特判的话读到最后一节时目录还高亮在倒数第三节上。 */
  if(h.scrollTop + h.clientHeight >= h.scrollHeight - 4){
    active = TOC.links.length - 1;
  } else {
    TOC.hs.forEach((x, i) => { if(x.getBoundingClientRect().top <= 120) active = i; });
  }
  if(active === tocActive) return;   /* 小节没变就别动，省得每帧重排 */
  tocActive = active;
  TOC.links.forEach((a, i) => a.classList.toggle("on", i === active));
  /* 当前项可能被收在某个折叠的祖先里，先顺着链展开再谈「滚进视野」 */
  for(let li = TOC.links[active].closest("li"); li; li = li.parentElement.closest("li")){
    li.classList.remove("shut");
    const b = li.querySelector(":scope > .fold");
    if(b) b.setAttribute("aria-expanded", "true");
  }
  keepTocVisible(TOC.links[active]);
}

/* 目录长过一屏时，只滚 .toc 这个容器把当前项留在视野里。
   不能用 scrollIntoView——它会把整页一起跳到那一节。 */
function keepTocVisible(el){
  const box = el && el.closest(".toc");
  if(!box || box.scrollHeight <= box.clientHeight + 1) return;
  const br = box.getBoundingClientRect(), er = el.getBoundingClientRect();
  const pad = 12;
  let d = 0;
  if(er.top < br.top + pad)            d = er.top - br.top - pad;
  else if(er.bottom > br.bottom - pad) d = er.bottom - br.bottom + pad;
  if(d) box.scrollBy({top: d, behavior: MOTION ? "smooth" : "auto"});
}

/* ===================== 代码块：语言角标 + 复制按钮 =====================
   不引第三方高亮库。把每个 pre 包进 .codeblock，头部一条放语言名和复制按钮。
   做成非滚动的头部而不是叠在 pre 上：pre 会横向滚动，绝对定位的按钮会跟着
   滚没；头部留在滚动区外面才稳。 */
function copyText(txt){
  /* 旧 API：非安全上下文或 clipboard 被拒时兜底 */
  const legacy = () => new Promise((res, rej) => {
    const ta = document.createElement("textarea");
    ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try{ document.execCommand("copy") ? res() : rej(); }
    catch(e){ rej(e); }
    finally{ ta.remove(); }
  });
  if(navigator.clipboard?.writeText)
    return navigator.clipboard.writeText(txt).catch(legacy);
  return legacy();
}

function enhanceCode(){
  if(!isPost) return;
  $$(".prose pre").forEach(pre => {
    const code = pre.querySelector("code");
    /* 语言名的位置分两种：Rouge 认识的语言会被高亮，语言名落在外层
       <div class="language-python highlighter-rouge"> 上，code 上什么都没；
       Rouge 不认的（比如 mermaid）没有外层 div，反而留在 code 上。两处都找。 */
    const host = pre.closest('[class*="language-"]');
    const lang = (code && code.dataset.lang) ||
      (((code ? code.className : "") + " " + (host ? host.className : ""))
        .match(/language-([\w-]+)/) || [])[1] || "";

    /* mermaid 块由 post.html 里的渲染脚本接管，不包成带复制按钮的代码块 */
    if(lang === "mermaid") return;

    const wrap = document.createElement("div");
    wrap.className = "codeblock";
    pre.parentNode.insertBefore(wrap, pre);

    const head = document.createElement("div");
    head.className = "codeblock-head";
    const tag = document.createElement("span");
    tag.className = "lang";
    tag.textContent = lang || "code";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy";
    btn.dataset.zh = "复制"; btn.dataset.en = "Copy";
    btn.textContent = t({zh:"复制", en:"Copy"});
    btn.addEventListener("click", () => {
      copyText((code || pre).innerText).then(() => {
        btn.textContent = t({zh:"已复制", en:"Copied"});
        btn.classList.add("done");
        clearTimeout(btn._t);
        btn._t = setTimeout(() => {
          btn.textContent = t({zh:"复制", en:"Copy"});
          btn.classList.remove("done");
        }, 1600);
      }).catch(() => { /* 两种 API 都被拒（少见）：不假装成功，静默即可 */ });
    });

    head.append(tag, btn);
    wrap.append(head, pre);

    /* 超过 FOLD 行先折叠，底部整宽按钮展开/收起。复制按钮照旧拿完整代码。 */
    const FOLD = 20;
    const n = (code || pre).textContent.replace(/\n$/, "").split("\n").length;
    if(n <= FOLD) return;
    const more = {zh:`展开全部（共 ${n} 行）`, en:`Show all (${n} lines)`};
    const less = {zh:"收起", en:"Collapse"};
    const fold = document.createElement("button");
    fold.type = "button";
    fold.className = "fold";
    const label = s => { fold.dataset.zh = s.zh; fold.dataset.en = s.en; fold.textContent = t(s); };
    label(more);
    wrap.classList.add("collapsed");
    fold.addEventListener("click", () => {
      const c = wrap.classList.toggle("collapsed");
      label(c ? more : less);
      /* 收起时如果代码块顶部已滚出视口，拉回来，免得停在一片正文中间 */
      if(c) wrap.scrollIntoView({block:"nearest"});
    });
    wrap.append(fold);
  });
}

/* ===================== 博客列表左侧时间轴 =====================
   扫描已渲染的 .yr / .mo / .post-row，现建「年 → 月 → 日号」三级树。
   只出现有文章的年/月/日；日号叶子锚到对应卡片，点一下原生滚动过去。
   展开：桌面 hover 即开（CSS），点标题 .open 常驻；滚动经过的分支加 .cur 自动摊开。 */
function buildTimeline(){
  const side = $("#tl-side");
  if(!side || !isList) return;
  const yrs = [...document.querySelectorAll(".tl-list .yr")];
  if(!yrs.length){ side.remove(); return; }
  const n = s => parseInt(s, 10) || s;   /* 去年份/月份/日号的前导零 */
  side.innerHTML = '<ul class="tl-tree">' + yrs.map(yr=>{
    const mos = [...yr.querySelectorAll(":scope > .mo")].map(mo=>{
      const leaves = [...mo.querySelectorAll(".post-row")].map(c=>{
        const day = (c.dataset.date || "").split("-")[2] || "";
        const a = c.querySelector(".post-h a");
        const title = a ? a.textContent.trim() : "";
        return `<li><a class="nd-leaf" href="#${c.id}" data-for="${c.id}"
          title="${esc(title)}"><b>${n(day)}</b>${esc(title)}</a></li>`;
      }).join("");
      return `<li class="nd" data-lv="mo" data-for="${mo.id}">
        <button class="nd-head" type="button">${n((mo.dataset.month||"").split("-")[1])}</button>
        <div class="nd-sub"><ul>${leaves}</ul></div></li>`;
    }).join("");
    return `<li class="nd" data-lv="yr" data-for="${yr.id}">
      <button class="nd-head" type="button">${yr.dataset.year}</button>
      <div class="nd-sub"><ul>${mos}</ul></div></li>`;
  }).join("") + "</ul>";

  /* 点标题：常驻展开 / 收起（窄屏整棵常驻摊开，这条只在宽屏有意义） */
  side.addEventListener("click", e=>{
    const head = e.target.closest(".nd-head");
    if(head) head.closest(".nd").classList.toggle("open");
  });
}

/* 搜索 / 标签过滤后，时间轴里对应分组没剩文章就一起藏掉，避免留下点了没反应的节点 */
function tlVisibility(){
  const side = $("#tl-side");
  if(!side) return;
  side.querySelectorAll(".nd").forEach(nd=>{
    const grp = document.getElementById(nd.dataset.for);
    nd.hidden = !grp || ![...grp.querySelectorAll(".post-row")].some(c=>!c.hidden);
  });
}

/* 当前位置 = 顶边越过顶栏的最后一张卡片；高亮其 年/月/日 分支并展开 */
let tlActive = "";
function syncTimeline(){
  const side = $("#tl-side");
  if(!side) return;
  const cards = [...document.querySelectorAll(".post-row:not([hidden])")];
  let cur = null;
  /* 顶栏约 66px + scroll-margin 104，取卡片顶边越过 ~170 这条线才算「读到了」 */
  for(const c of cards){ if(c.getBoundingClientRect().top <= 170) cur = c; }
  if(!cur) cur = cards[0];
  if(!cur || cur.id === tlActive) return;
  tlActive = cur.id;
  side.querySelectorAll(".on,.cur").forEach(e=>e.classList.remove("on", "cur"));
  const leaf = side.querySelector('.nd-leaf[data-for="' + cur.id + '"]');
  if(!leaf) return;
  leaf.classList.add("on");
  const mo = leaf.closest(".nd[data-lv=mo]"), yr = leaf.closest(".nd[data-lv=yr]");
  mo?.classList.add("on", "cur");
  yr?.classList.add("cur");
  keepTlVisible(leaf);
}

/* 时间轴长过一屏时只滚容器把当前项留住，不用 scrollIntoView（它会连整页一起跳） */
function keepTlVisible(el){
  const box = el && el.closest(".tl-side");
  if(!box || box.scrollHeight <= box.clientHeight + 1) return;
  const br = box.getBoundingClientRect(), er = el.getBoundingClientRect();
  const pad = 12;
  let d = 0;
  if(er.top < br.top + pad)            d = er.top - br.top - pad;
  else if(er.bottom > br.bottom - pad) d = er.bottom - br.bottom + pad;
  if(d) box.scrollBy({top: d, behavior: MOTION ? "smooth" : "auto"});
}

/* ===================== 动效 ===================== */
const MOTION = !matchMedia("(prefers-reduced-motion: reduce)").matches;
let firstPaint = true;

const io = new IntersectionObserver(es => es.forEach(e => {
  if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
}), {rootMargin:"0px 0px -8% 0px"});

/* 首次渲染才做进入动画；切语言是重绘，直接显示，否则整页闪一下 */
function animate(){
  $$("main .h2, main .card, main .skill, .filters button").forEach(el=>{
    el.classList.add("reveal");
    if(!firstPaint || !MOTION){ el.classList.add("in"); return; }
    /* 同一容器内依次延迟，容器之间不累积 */
    const i = [...el.parentNode.children].indexOf(el);
    el.style.setProperty("--d", Math.min(i,6) * 55 + "ms");
    io.observe(el);
  });
  firstPaint = false;
}

/* 顶部阅读进度线 + 目录跟随，共用一个滚动监听 */
addEventListener("scroll", ()=>{
  const h = document.documentElement;
  $("#bar").style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100 || 0) + "%";
  syncToc();
  syncTimeline();
}, {passive:true});


/* 磁吸 + 卡片强调块：全站共用一个 pointermove。
   按钮、技能、卡片都是脚本现渲染的，所以走委托而不是逐个绑定。
   这里只写 CSS 变量，位移交给合成层，不碰布局。
   .mag 挂上就不摘：摘掉会把 transition 一起摘掉，指针移开时元素会瞬回原位。 */
if(MOTION) addEventListener("pointermove", e => {
  const el = e.target.closest?.(".filters button,.tgl,.skill,.stack a,.gh");
  if(el){
    const r = el.getBoundingClientRect();
    el.classList.add("mag");
    el.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * .25).toFixed(1) + "px");
    el.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * .35).toFixed(1) + "px");
  }
  /* 色块宽 72，夹在卡片内，不让它探出边框 */
  const card = e.target.closest?.(".proj:not(.add),.post-row");
  if(card){
    const r = card.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - r.left - 36, 0), Math.max(r.width - 72, 0));
    card.style.setProperty("--px", x.toFixed(1) + "px");
  }
}, {passive:true});


/* 点击涟漪：动画靠重挂类名重启，中间那次 offsetWidth 是必要的强制重排，
   不然同一个按钮连点第二下不会重新播放。 */
if(MOTION) addEventListener("pointerdown", e => {
  const el = e.target.closest?.(".filters button,.tgl,.gh");
  if(!el) return;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--rx", (e.clientX - r.left).toFixed(1) + "px");
  el.style.setProperty("--ry", (e.clientY - r.top).toFixed(1) + "px");
  el.classList.remove("rip"); void el.offsetWidth; el.classList.add("rip");
}, {passive:true});

/* hero 主名逐字落位：逐个建 span 而不是拼 innerHTML，省掉转义这一层 */
const heroName = $(".hero h1 b");
if(heroName && MOTION) heroName.replaceChildren(...[...heroName.textContent].map((c, i) => {
  const s = document.createElement("span");
  s.textContent = c;
  s.style.setProperty("--d", i * 45 + 260 + "ms");
  /* 大字状态的歪斜量。三个固定算式而不是 Math.random()：
     每次刷新姿态一致，随机会让人以为是渲染出错。 */
  s.style.setProperty("--r", (((i * 37) % 11 - 5) * 1.8 + (i % 2 ? 1.6 : -1.6)).toFixed(1) + "deg");
  s.style.setProperty("--x", (((i * 17) % 7 - 3) * .012).toFixed(3) + "em");
  s.style.setProperty("--y", (((i * 53) % 9 - 4) * .016).toFixed(3) + "em");
  return s;
}));

/* 入场序列（最后一枚标签 ~1.5s 落定）跑完就摘掉门控类：
   之后切语言重建的节点不会再播一遍入场。等动画结束再摘，中途摘会把它们掐断。 */
setTimeout(()=> document.documentElement.classList.remove("boot"), 2400);

/* 导航跟随当前区块高亮 */
const spy = new IntersectionObserver(es => es.forEach(e => {
  if(!e.isIntersecting) return;
  $$("nav a").forEach(a => a.classList.toggle("on", a.hash === "#" + e.target.id));
}), {rootMargin:"-45% 0px -50% 0px"});
$$("main section[id]").forEach(s => spy.observe(s));

/* 点击类操作走 View Transitions，不支持的浏览器直接执行 */
const vt = fn => {
  if(!(MOTION && document.startViewTransition)) return fn();
  const tr = document.startViewTransition(fn);
  /* 快速连点会中断上一个过渡，这是预期行为，别让它变成未捕获的 rejection */
  tr.ready.catch(()=>{}); tr.finished.catch(()=>{});
  return tr;
};

/* ===================== 绑定 ===================== */
$("#lang")?.addEventListener("click", ()=> vt(()=> setLang(lang === "zh" ? "en" : "zh")));
$("#theme")?.addEventListener("click", ()=> vt(toggleTheme));
/* 打字要即时反馈，不走 View Transitions */
$("#q")?.addEventListener("input", ()=>{
  const q = $("#q").value.trim().toLowerCase();
  if(isPost) findInArticle(q); else filter();
});
/* 文章页：↵ 下一个，⇧↵ 上一个，Esc 清空 */
$("#q")?.addEventListener("keydown", e=>{
  if(!isPost) return;
  if(e.key === "Enter"){ e.preventDefault(); jumpTo(cur + (e.shiftKey ? -1 : 1)); }
  else if(e.key === "Escape"){ e.target.value = ""; findInArticle(""); }
});
$("#filters")?.addEventListener("click", e=>{
  const b = e.target.closest("button");
  if(!b || b.classList.contains("on")) return;
  vt(()=>{
    cat = b.dataset.f;
    $("#filters .on")?.classList.remove("on"); b.classList.add("on");
    filter();
  });
});

/* ===================== 联系方式二维码 =====================
   页面里只存链接，码在浏览器现编码现画。
   编码器（MIT，本地化在 vendor/）在首次悬停时才注入 <script>，
   不碰这两个图标就一个字节都不加载。显示与否全交给 CSS 的 :hover / :focus-within。
   ======================================================== */
const qrLib = $(".contacts")?.dataset.lib;
let qrLoading = null;
const loadQrLib = () => qrLoading ||= new Promise((res, rej)=>{
  if(window.qrcode) return res(window.qrcode);
  const el = document.createElement("script");
  el.src = qrLib;
  el.onload = ()=> window.qrcode ? res(window.qrcode) : rej(new Error("no qrcode"));
  el.onerror = ()=> rej(new Error("load failed"));
  document.head.appendChild(el);
});

$$(".qr-host").forEach(host => {
  const btn = host.querySelector("[data-qr]"), box = host.querySelector(".qr-box");
  if(!btn || !box || !qrLib) return;
  let drawn = false;

  async function draw(){
    if(drawn) return;
    drawn = true;                       /* 先占位，避免连续悬停重复触发 */
    try{
      const qrcode = await loadQrLib();
      const qr = qrcode(0, "M");        /* 0 = 按内容自动选版本 */
      qr.addData(btn.dataset.qr);
      qr.make();
      const n = qr.getModuleCount(), Q = 2, size = n + Q * 2;
      /* 同一行连续的黑块并成一段，路径短一大半 */
      let d = "";
      for(let y = 0; y < n; y++){
        for(let x = 0; x < n; x++){
          if(!qr.isDark(y, x)) continue;
          let w = 1;
          while(x + w < n && qr.isDark(y, x + w)) w++;
          d += `M${x + Q} ${y + Q}h${w}v1h-${w}z`;
          x += w - 1;
        }
      }
      box.innerHTML =
        `<svg viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges" aria-hidden="true">` +
        `<rect width="${size}" height="${size}" fill="#fff"/>` +
        `<path fill="#16161A" d="${d}"/></svg>`;
    }catch{
      /* 编码器没起来也得给出路：把链接本身显示出来 */
      drawn = false;
      box.textContent = btn.dataset.qr;
      box.classList.add("qr-fallback");
    }
  }

  ["pointerenter", "focusin"].forEach(ev => host.addEventListener(ev, draw));
  btn.addEventListener("click", draw);   /* 触屏点一下也先把码备好 */
});

setLang(lang);
if(!isHome){ animate(); }
buildTimeline();          /* 列表页：现建时间轴，之后的 filter 才能同步它的显隐 */
if(!isHome){ filter(); }   /* 简历外的页面：筛选跑一次 */
initTagbar();
syncToc();
syncTimeline();
enhanceCode();

/* 提示块：GitHub 的 > [!NOTE] 语法 kramdown 不认，原样留在 <blockquote> 第一段开头。
   在这儿把标记摘掉、补图标和标签、打上 .callout + data-callout，配色全在 CSS 里。
   - 类型不设白名单：> [!XXX] 也认，走默认色 + 方块图标，
     要专属配色在 main.css 里加一条 [data-callout=xxx] 就行，这里不用动。
   - 标记后跟 - 或 + 则折叠：- 默认收起，+ 默认展开，用原生 <details>。
   图标都画在 16×16 网格上，只给路径，描边颜色 CSS 用 currentColor 接。 */
const ICON = {
  note:      '<circle cx="8" cy="8" r="7"/><path d="M8 7.2v4.6M8 4.2v1"/>',
  tip:       '<path d="M5.4 9.6a4 4 0 1 1 5.2 0c-.6.5-.9 1-.9 1.7v.6H6.3v-.6c0-.7-.3-1.2-.9-1.7z"/><path d="M6.4 14h3.2"/>',
  important: '<rect x="1.4" y="1.4" width="13.2" height="13.2"/><path d="M8 4.2v4.8M8 11.2v1"/>',
  warning:   '<path d="M8 1.6 15.2 14H.8z"/><path d="M8 6.2v3.4M8 11.6v1"/>',
  caution:   '<circle cx="8" cy="8" r="7"/><path d="m5.5 5.5 5 5M10.5 5.5l-5 5"/>',
  _:         '<rect x="2.5" y="2.5" width="11" height="11"/>'   /* 自定义类型的兜底 */
};

if(isPost) $$(".prose blockquote").forEach(bq => {
  const p1 = bq.firstElementChild, txt = p1 && p1.firstChild;
  if(!txt || txt.nodeType !== 3) return;          /* 首段不是以纯文本开头，不是提示块 */
  const m = txt.data.match(/^\s*\[!([\w-]+)\]([-+]?)\s*\n?/);
  if(!m) return;
  const type = m[1].toLowerCase(), fold = m[2];
  txt.data = txt.data.slice(m[0].length);
  bq.className = "callout";
  bq.dataset.callout = type;

  const head = document.createElement(fold ? "summary" : "b");
  head.className = "callout-label";
  head.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true">' +
    (ICON[type] || ICON._) + "</svg>" + esc(type);
  if(!fold){ bq.prepend(head); return; }

  const d = document.createElement("details");
  d.open = fold === "+";
  d.append(head, ...bq.childNodes);   /* 展开式取静态快照，再把正文整体搬进 details */
  bq.append(d);
});

/* 正文图片：懒加载 + 异步解码，顺带把 alt 兜成图注。markdown 语法带不了属性，只能在这儿补。 */
if(isPost) $$(".prose img").forEach(im => {
  im.loading = "lazy"; im.decoding = "async";
  /* 只处理"图片独占一段"这种：kramdown 输出 <p><img></p>，
     figure 不能嵌在 p 里，所以是把整个 p 换掉而不是往里插。
     行内图、带链接的图（img 的父节点是 a）都跳过，不加图注。 */
  const p = im.parentNode;
  if(!im.alt || p.tagName !== "P" || p.children.length !== 1 || p.textContent.trim()) return;
  const cap = document.createElement("figcaption");
  cap.textContent = im.alt;
  const fig = document.createElement("figure");
  fig.append(im, cap);
  p.replaceWith(fig);
});

/* 正文配图点开看大图：直接用原生 <dialog>——Esc 关闭、背景遮罩、焦点收进弹层、
   置顶层全是浏览器给的，自己只要塞一张 img 进去，不引灯箱库。
   整篇共用一个弹层，点第一张图时才建。 */
let lightbox, shots = [], shotAt = 0;

/* 切到第 i 张，取模绕回，首尾相接 */
function showShot(i){
  shotAt = (i + shots.length) % shots.length;
  const im = shots[shotAt], big = lightbox.firstElementChild;
  /* currentSrc 而不是 src：srcset 选中的那一张才是屏幕上正在看的 */
  big.src = im.currentSrc || im.src;
  big.alt = im.alt;
}

if(isPost && prose) prose.addEventListener("click", e => {
  const im = e.target.closest("img");
  if(!im || im.closest("a")) return;   /* 带链接的图归链接，点了该跳转就跳转 */
  /* 每次打开重新取一遍：文章里的图可能是懒加载或脚本后插的，建弹层时那一刻的快照会漏 */
  shots = [...$$(".prose img")].filter(x => !x.closest("a"));   /* $$ 给的是 NodeList，没有 filter */
  if(!lightbox){
    lightbox = document.createElement("dialog");
    lightbox.className = "lightbox";
    /* 让弹层自己能接焦点。showModal() 默认把焦点丢给第一个可聚焦后代，
       也就是左箭头，一打开就顶个焦点框；写 autofocus 不管用，Chrome 只认后代上的。 */
    lightbox.tabIndex = -1;
    lightbox.innerHTML = '<img alt="">' +
      `<button type="button" class="lb-nav prev" aria-label="${esc(t({zh:"上一张", en:"Previous image"}))}"></button>` +
      `<button type="button" class="lb-nav next" aria-label="${esc(t({zh:"下一张", en:"Next image"}))}"></button>`;
    lightbox.addEventListener("click", e2 => {
      const b = e2.target.closest(".lb-nav");
      if(b) showShot(shotAt + (b.classList.contains("next") ? 1 : -1));
      else lightbox.close();          /* 点图、点遮罩都关 */
    });
    /* 弹层是模态，焦点就在它里面，键盘事件必然冒泡到这儿 */
    lightbox.addEventListener("keydown", e2 => {
      if(e2.key === "ArrowRight") showShot(shotAt + 1);
      else if(e2.key === "ArrowLeft") showShot(shotAt - 1);
    });
    document.body.append(lightbox);
  }
  /* 独苗一张就别摆左右钮了，两侧空白还能当关闭热区 */
  lightbox.querySelectorAll(".lb-nav").forEach(b => b.hidden = shots.length < 2);
  showShot(shots.indexOf(im));
  lightbox.showModal();
  /* 焦点收回容器：箭头上的焦点框留给真的 Tab 过去的时候。
     同步执行、绘制之前，不会闪一下。方向键照样冒泡到这儿，Tab 也照样能走到箭头。 */
  lightbox.focus();
});


/* ---- hero 主名粒子汇聚 ----
   离屏按 <b> 的字体画一遍 nosugark，逐像素取样当粒子的「家」，粒子飞进来落位后就常驻：
   之后走弹簧回家 + 指针排斥，鼠标扫过去把字推散，离开再自己聚回来。
   画面不再交还给真文字（那一下换人看着就是断的），真文字只是永远透明地垫在下面，
   读屏、选中、搜索都照旧。
   等 fonts.ready 再取样：字体没到就量，采到的是回退字形。 */
if(heroName && MOTION && heroName.offsetWidth) document.fonts.ready.then(() => {
  const PAD = 10;      /* 画布四周外扩：字形会溢出行盒，推散的粒子也要有地方去 */
  const STEP = 3;      /* 取样步长，也就是粒子的间距 */
  const R0 = 80;       /* 指针排斥半径 */
  const text = heroName.textContent.toLowerCase();   /* 标题整体 text-transform:lowercase，取样要跟着 */
  const cv = document.createElement("canvas");
  const g = cv.getContext("2d");
  const off = document.createElement("canvas").getContext("2d", {willReadFrequently:true});
  const ease = t => 1 + 2.4 * --t * t * t + 1.4 * t * t;   /* back-out：末尾轻微过冲，落位有顿挫 */
  let ps = [], W = 0, H = 0, K = [], END = 0;
  let run = false, intro = true, born = 0, mx = -1e4, my = -1e4, moved = -1e9;

  /* 深色下 --k1/--k2/--k3 全是同一个强调色，三色自然收敛成单色，不用在这儿分主题 */
  function colors(){
    const root = getComputedStyle(document.documentElement);
    K = ["--k1","--k2","--k3"].map(v => root.getPropertyValue(v).trim() || "#E1261C");
    for(const p of ps) p.c = K[p.k];
  }

  function build(){
    const bw = heroName.offsetWidth, bh = heroName.offsetHeight;
    if(!bw) return;
    W = bw + PAD * 2; H = bh + PAD * 2;
    const cs = getComputedStyle(heroName);
    off.canvas.width = W; off.canvas.height = H;
    /* 不用 cs.font：部分浏览器这个简写读出来是空串，拆开拼才稳 */
    off.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily}`;
    /* 字距不给的话整行会宽出十几像素；老浏览器忽略这个属性，只是略宽，不影响观感 */
    off.letterSpacing = cs.letterSpacing;
    const m = off.measureText(text), asc = m.fontBoundingBoxAscent, desc = m.fontBoundingBoxDescent;
    /* 行盒里的基线：剩余行距上下均分，再往下落一个 ascent —— 跟 CSS 摆 inline 盒同一个算法 */
    off.fillText(text, PAD, PAD + (bh - (asc + desc)) / 2 + asc);
    const d = off.getImageData(0, 0, W, H).data;

    const R = Math.hypot(W, H);
    ps = [];
    for(let y = 0; y < H; y += STEP) for(let x = 0; x < W; x += STEP){
      if(d[(y * W + x) * 4 + 3] < 128) continue;
      /* 起点压在画布内圈：飞得再远也只是被裁掉，看着像凭空冒出来 */
      const a = Math.random() * Math.PI * 2, r = R * (.12 + Math.random() * .38);
      ps.push({hx:x, hy:y, x, y, vx:0, vy:0,
        sx: W / 2 + Math.cos(a) * r, sy: H / 2 + Math.sin(a) * r * .6,
        /* 起飞时刻从左往右推，看着像有人在写；叠一点随机免得成一堵直墙 */
        t0: 260 + x / W * 340 + Math.random() * 240,
        dur: 760 + Math.random() * 420,
        /* 固定算式而不是 Math.random()：每次刷新配色一致，随机反而像渲染出错 */
        k: (x * 5 + y * 7) / STEP % 3 | 0});
    }
    if(!ps.length) return;                    /* 一个点都没采到就别接管，真文字留着 */
    ps.sort((a, b) => a.k - b.k);             /* 同色连着画，一帧只切两次 fillStyle */
    colors();
    END = Math.max(0, ...ps.map(p => p.t0 + p.dur));

    /* 宽屏开屏时 <b> 被 name-grow 放大到 1.3 倍，backing store 先多备这一档，缩放时才不糊 */
    const dpr = Math.min(devicePixelRatio || 1, 2) * 1.35;
    cv.width = W * dpr; cv.height = H * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    if(!cv.isConnected){ heroName.classList.add("pb"); heroName.append(cv); }
    wake();
  }

  function wake(){ if(!run){ run = true; requestAnimationFrame(step); } }

  function step(now){
    born = born || now;
    const t = now - born;
    if(intro && t > END) intro = false;
    /* 指针离开时浏览器不一定给最后一个事件（比如直接划出窗口），超时兜底把它挪远，
       不然排斥力一直挂着，粒子回不了家，循环也就永远停不下来 */
    if(now - moved > 200){ mx = my = -1e4; }
    g.clearRect(0, 0, W, H);
    let live = false, last = "";
    for(const p of ps){
      let s = 2.6, a = 1;
      if(intro){
        const k = Math.min(Math.max((t - p.t0) / p.dur, 0), 1);
        if(k <= 0) continue;
        const e = ease(k);
        p.x = p.sx + (p.hx - p.sx) * e; p.y = p.sy + (p.hy - p.sy) * e;
        s = 4.4 - 1.8 * k;                    /* 边飞边收小，落定正好是字形的颗粒度 */
        a = Math.min(k * 4, 1);
        live = true;
      }else{
        const dx = p.x - mx, dy = p.y - my, q = dx * dx + dy * dy;
        if(q < R0 * R0){                      /* 越靠近指针推得越狠 */
          const dist = Math.sqrt(q) || .001, f = (1 - dist / R0) * 4.4;
          p.vx += dx / dist * f; p.vy += dy / dist * f;
        }
        /* 弹簧回家：加速度朝原位，再统一衰减，省掉一套碰撞参数 */
        p.vx = (p.vx + (p.hx - p.x) * .055) * .86;
        p.vy = (p.vy + (p.hy - p.y) * .055) * .86;
        p.x += p.vx; p.y += p.vy;
        if(Math.abs(p.vx) + Math.abs(p.vy) > .05) live = true;
      }
      if(p.c !== last) g.fillStyle = last = p.c;
      g.globalAlpha = a;
      g.fillRect(p.x - s / 2, p.y - s / 2, s, s);
    }
    /* 全体归位、指针也不在附近，就把循环停掉；再有动静由 pointermove 唤醒。
       入场阶段必须显式续上：最早的粒子也要 260ms 才起飞，头几帧一个都没动。 */
    if(intro || live || mx > -1e3) requestAnimationFrame(step);
    else run = false;
  }

  /* 指针只在画布附近才唤醒循环；远处不管，正在跑的循环自己会停 */
  addEventListener("pointermove", e => {
    const r = cv.getBoundingClientRect();
    if(!r.width) return;
    /* 按 rect 换算而不是直接减：宽屏开屏时 <b> 正被放大 1.3 倍，rect 已经把缩放算进去了 */
    const x = (e.clientX - r.left) * W / r.width, y = (e.clientY - r.top) * H / r.height;
    if(x < -R0 || x > W + R0 || y < -R0 || y > H + R0) return;
    mx = x; my = y; moved = performance.now();
    wake();
  }, {passive:true});

  /* 字号跟着 vw 走，换尺寸得重新取样；重建后粒子直接摆在家里，不再放一遍入场 */
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); intro = false; rt = setTimeout(build, 200); });
  /* 切主题只是换色，重画一帧就够 */
  new MutationObserver(() => { colors(); wake(); })
    .observe(document.documentElement, {attributeFilter:["data-theme"]});

  build();
});
