/* ==========================================================
   改简历 = 改下面的数据，不用碰 HTML / CSS。
   需要翻译的字段写成 {zh:"…", en:"…"}；技术名 / URL / 日期直接写字符串。
   ========================================================== */
const BIO = {
  zh:"计算机科学与技术在读，做 Django + Vue 的 Web 系统，也写 PySide6 桌面工具。ICPC 省赛银奖、蓝桥杯国赛二等奖。正在找工作。",
  en:"CS undergrad. I build Django + Vue web systems and PySide6 desktop tools. ICPC provincial silver, Lanqiao Cup national 2nd prize. Currently job hunting."
};
const TAGS = [
  {zh:"全栈开发",en:"Full-stack"},{zh:"数据可视化",en:"Data Viz"},
  {zh:"算法竞赛",en:"Competitive Programming"},"Python / C++"
];
const FACTS = [
  [{zh:"出生",en:"BORN"},   "2004.05"],
  [{zh:"籍贯",en:"FROM"},   {zh:"湖北 · 荆州",en:"Jingzhou, Hubei"}],
  [{zh:"院校",en:"SCHOOL"}, {zh:"湖北第二师范学院",en:"Hubei Univ. of Education"}],
  [{zh:"邮箱",en:"EMAIL"},  "nosugark@qq.com"],
  [{zh:"状态",en:"STATUS"}, {zh:"2026.06 毕业 / 可实习",en:"Graduating 2026.06 / open to work"}],
];
const CATS = [ {zh:"全部",en:"All"}, {zh:"Web",en:"Web"}, {zh:"桌面",en:"Desktop"}, {zh:"工具",en:"Tools"} ];

const PROJECTS = [
  {name:"algoscent", cat:"Web", url:"https://github.com/noSugarK/algoscent",
   desc:{zh:"基于大语言模型的个性化调香网站。前后端分离，用户填问卷后调用 Qwen 模型做个性化分析。",
         en:"LLM-powered personalized perfumery site. Decoupled front/back end; a Qwen model analyses each user's questionnaire."},
   stack:["Django5","Vue3","ElementPlus","MySQL8"]},
  {name:"hbszDataVisual", cat:"Web", url:"https://github.com/noSugarK/hbszDataVisual",
   desc:{zh:"基于 Django5 的数据分析可视化网站，实习期间落地的内部平台。",
         en:"Django5 data-analysis dashboard — an internal platform shipped during my internship."},
   stack:["Django5","Bootstrap5","ECharts5","jQuery3"]},
  {name:"tools_for_3d_detection", cat:"桌面", url:"https://github.com/noSugarK/tools_for_3d_detection",
   desc:{zh:"3D 标注自动化质检工具。集成 YOLO、3D→2D 投影与 Qwen3-VL，校验人工标注质量。",
         en:"Automated QA tool for 3D annotations. Combines YOLO, 3D→2D projection and Qwen3-VL to verify manual labels."},
   stack:["Python3.13","PySide6","Ultralytics","OpenCV"]},
];

const SKILLS = ["Python","C / C++","Django","Vue3","PySide6 / PyQt6","MySQL",
                "ECharts","PyTorch","Ultralytics","Git","Bootstrap","OpenCV"];

const EDU = [
  {when:"2022.09 – 2026.06",
   org:{zh:"湖北第二师范学院 · 计算机科学与技术",en:"Hubei University of Education · Computer Science"},
   role:{zh:"本科 / GPA 3.6 · 5.0",en:"B.Eng. / GPA 3.6 of 5.0"},
   items:[{zh:"算法分析与设计、数据结构、编译原理、软件测试、网络安全、Python 数据分析",
           en:"Algorithm design, data structures, compilers, software testing, network security, Python data analysis"}]},
];

const EXP = [
  {when:"2025.07 – 2025.09",
   org:{zh:"湖北市政集团",en:"Hubei Municipal Group"},
   role:{zh:"数据分析 / 全栈开发（实习）",en:"Data Analysis / Full-stack (Intern)"},
   items:[
     {zh:"基于 Django5 的可视化数据分析平台：数据可视化、填报、用户管理、数据预测",
      en:"Django5 analytics platform: visualisation, data entry, user management, forecasting"},
     {zh:"负责前期数据清洗、中期分析方式设计、后期效果落地",
      en:"Owned data cleaning, analysis design, and final delivery"},
     {zh:"Bootstrap + Chart.js + Font Awesome 构建前端",
      en:"Built the front end with Bootstrap, Chart.js and Font Awesome"}]},
  {when:"2024.02 – 2025.01",
   org:{zh:"HUE_ACM 算法协会",en:"HUE_ACM Algorithm Club"},
   role:{zh:"会长",en:"President"},
   items:[{zh:"管理团队并提升成员编程能力",en:"Led the team and coached members' programming skills"},
          {zh:"收集竞赛信息，统筹报名与参赛",en:"Tracked contests and coordinated registration and participation"}]},
  {when:"2023.09 – 2024.09",
   org:{zh:"院社团指导中心",en:"Faculty Student Club Center"},
   role:{zh:"指导主席",en:"Chair"},
   items:[{zh:"负责学院社团活动指导与审核",en:"Supervised and reviewed faculty club activities"},
          {zh:"担任院校两级沟通协调枢纽",en:"Acted as liaison between faculty and university levels"}]},
];

const AWARDS = [
  [{zh:"银奖",en:"Silver"},   {zh:"2025 ICPC 贵州省赛",en:"2025 ICPC Guizhou Provincial Contest"}],
  [{zh:"国二",en:"Nat. 2nd"}, {zh:"2025 第十六届蓝桥杯 Python 组国赛",en:"2025 16th Lanqiao Cup, Python group, national final"}],
  [{zh:"国三",en:"Nat. 3rd"}, {zh:"2023 第十四届蓝桥杯 C/C++ 组国赛",en:"2023 14th Lanqiao Cup, C/C++ group, national final"}],
  [{zh:"三等",en:"3rd"},      {zh:"2024 睿抗机器人开发者大赛全国总决赛",en:"2024 RAICOM Robot Developer Contest, national final"}],
  [{zh:"二等",en:"2nd"},      {zh:"2024 第十七届智能汽车竞赛 5G 无人车",en:"2024 17th Smart Car Competition, 5G autonomous vehicle"}],
  [{zh:"三等",en:"3rd"},      {zh:"2025 第十届团体程序设计天梯赛总决赛",en:"2025 10th GPLT national final"}],
  [{zh:"三等",en:"3rd"},      {zh:"2025 第十七届华中杯数学建模",en:"2025 17th Huazhong Cup Mathematical Modeling"}],
];

const ABOUT = {
  zh:"扎实的编程基础，熟练 C / C++ / Python；对嵌入式与 Web 开发都有涉猎。善于分析和吸取经验，性格开朗，团队荣誉感强，有明确的职业规划。",
  en:"Solid programming fundamentals in C, C++ and Python, with hands-on exposure to both embedded and web development. Analytical, easy to work with, and clear about where I'm heading."
};

const UI = {
  more:{zh:"+ 更多项目施工中",en:"+ More projects in progress"},
  repo:{zh:"查看仓库",en:"View repo"},
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
const t = o => (o && typeof o === "object" && !Array.isArray(o)) ? o[lang] : o;
/* 搜索索引双语拼接，中英文都能搜到 */
const idx = (...xs) => esc(xs.flat(9)
  .map(x => (x && typeof x === "object") ? Object.values(x).join(" ") : x).join(" "));

/* 按页面类型分流：首页筛简历、列表页筛文章、文章页文内查找 */
const isHome = !!$("#grid");
const prose  = $(".prose");
const isPost = !!prose;

/* ===================== 渲染 ===================== */
function renderResume(){
  if(!isHome) return;

  $("#tags").innerHTML = TAGS.map(x=>`<span class="tag">${esc(t(x))}</span>`).join("");
  $("#bio").textContent = t(BIO);
  $("#facts").innerHTML = FACTS.map(([k,v])=>`<dt>${esc(t(k))}</dt><dd>${esc(t(v))}</dd>`).join("");

  $("#filters").innerHTML = CATS.map(c=>
    `<button data-f="${esc(c.zh)}"${c.zh===cat?' class="on"':''}>${esc(t(c))}</button>`).join("");

  /* view-transition-name 让筛选时卡片是「移动」而不是「闪现」 */
  $("#grid").innerHTML = PROJECTS.map((p,i)=>`
    <article class="card proj" style="view-transition-name:proj${i}" data-cat="${esc(p.cat)}"
             data-s="${idx(p.name,p.desc,p.stack,p.cat)}">
      <h3>${esc(p.name)}</h3>
      <div class="sub">${esc(t(CATS.find(c=>c.zh===p.cat)||p.cat)).toUpperCase()}</div>
      <p>${esc(t(p.desc))}</p>
      <div class="stack">${p.stack.map(s=>`<i>${esc(s)}</i>`).join("")}</div>
      <a class="go" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(t(UI.repo))} <i>→</i></a>
    </article>`).join("") +
    `<article class="card proj add" style="view-transition-name:projAdd" data-cat="全部" data-s="">
       <div>${esc(t(UI.more))}</div></article>`;

  $("#skills-list").innerHTML = SKILLS.map(s=>`<span class="skill" data-s="${esc(s)}">${esc(s)}</span>`).join("");

  const tl = list => list.map(e=>`
    <article class="card" data-s="${idx(e.org,e.role,e.items)}">
      <div class="when">${esc(e.when)}</div>
      <div><h3>${esc(t(e.org))}</h3><div class="role">${esc(t(e.role))}</div>
        <ul>${e.items.map(i=>`<li>${esc(t(i))}</li>`).join("")}</ul></div>
    </article>`).join("");
  $("#exp-list").innerHTML = tl(EXP);
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
    const okQ = !q || el.dataset.s.toLowerCase().includes(q);
    el.hidden = !(okC && okQ);
  });
  $$("main section").forEach(s=>{
    const inner = s.querySelectorAll("[data-s]");
    s.hidden = inner.length > 0 && ![...inner].some(e=>!e.hidden);
  });
  /* #empty 是 main 的直接子元素，不会被上面的折叠波及 */
  $("#empty").style.display = (q && !all.some(e=>!e.hidden)) ? "block" : "none";
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
  const hs = [...prose.querySelectorAll("h2, h3")];
  if(hs.length < 2){ el.remove(); return null; }   /* 一两个标题不值得做目录 */
  el.innerHTML = "<ul>" + hs.map((h, i) => {
    if(!h.id) h.id = "h-" + i;                     /* kramdown 一般会生成，这里兜底 */
    /* 用 lv2/lv3 而不是 h2/h3：animate() 的 `main .h2` 会把目录项也当区块标题。
       刻度在前、标签在后——面板向右滑出，露在屏幕内的是左边那一截。 */
    return `<li class="lv${h.tagName[1]}">` +
      `<a href="#${h.id}"><span class="tick"></span>` +
      `<span class="label">${esc(h.textContent)}</span></a></li>`;
  }).join("") + "</ul>";
  return {hs, links: [...el.querySelectorAll("a")]};
}
const TOC = buildToc();

/* 当前位置 = 最后一个顶边已经越过粘性顶栏的标题。
   比 IntersectionObserver 更贴合「我正在读哪一节」的语义。 */
function syncToc(){
  if(!TOC) return;
  const h = document.documentElement;
  /* 触底特判：末尾几节往往比剩余视口还短，标题永远滚不到顶栏以上，
     不特判的话读到最后一节时目录还高亮在倒数第三节上。 */
  if(h.scrollTop + h.clientHeight >= h.scrollHeight - 4){
    TOC.links.forEach((a, i) => a.classList.toggle("on", i === TOC.links.length - 1));
    return;
  }
  let active = 0;
  TOC.hs.forEach((x, i) => { if(x.getBoundingClientRect().top <= 120) active = i; });
  TOC.links.forEach((a, i) => a.classList.toggle("on", i === active));
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
}, {passive:true});

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

setLang(lang);
if(!isHome){ animate(); filter(); }   /* 简历外的页面：进入动画和筛选各跑一次 */
syncToc();
