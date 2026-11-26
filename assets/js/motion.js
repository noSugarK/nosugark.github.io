/* 动效索引页外壳：左栏检索 + 自动播放卡片 + 单条详情。
   示例实现全部来自 motion-demos.js；这里只负责目录、状态、Tab、筛选与详情过渡。 */
import { DEMOS, CATEGORIES } from './motion-demos.js';
import { highlightLines } from './code-highlight.js';

/* 卡片按分类顺序编号，和左栏目录一致 */
const LIST = CATEGORIES.flatMap(cat => DEMOS.filter(demo => demo.category === cat.id));

(() => {
  const create = (tag, className = '', text = '') => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    if (tag === 'button') el.type = 'button';
    return el;
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = () => !reduced.matches;
  const EASE = 'cubic-bezier(.32, .72, 0, 1)';
  const VT_NAME = 'mx-focus-card';
  /* 同一张卡片跨越列表/对话框，由浏览器做共享元素衔接；不支持或减动时直接换 */
  const withTransition = update => {
    if (!motion() || !document.startViewTransition || document.hidden) { update(); return Promise.resolve(); }
    let applied = false;
    const run = () => { if (!applied) { applied = true; update(); } };
    try {
      const t = document.startViewTransition(run);
      /* 后台标签页会拒绝过渡，三个 promise 都要接住，否则冒出未处理异常 */
      t.ready.catch(() => {});
      return t.updateCallbackDone.catch(run).then(() => t.finished.catch(() => {}));
    } catch { run(); return Promise.resolve(); }
  };

  const REPLAY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1"/><path d="M20.5 4v5h-5"/></svg>';
  const EXPAND_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg>';
  const SHRINK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M3 8h5V3M21 8h-5V3M3 16h5v5M21 16h-5v5"/></svg>';
  const COPY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><rect x="9" y="9" width="11" height="11"/><path d="M5 15H4V4h11v1"/></svg>';
  const DONE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M4 12l5 5L20 6"/></svg>';

  const nav = $('#mx-nav');
  const chips = $('#mx-chips');
  const groupsHost = $('#mx-groups');
  const count = $('#mx-count');
  const empty = $('#mx-empty');
  const cardById = new Map();
  const controllers = new Map();
  const navById = new Map();
  const state = {query: '', category: 'all'};
  const total = LIST.length;
  let focused = null;

  /* ---------- 目录 ---------- */
  CATEGORIES.forEach(cat => {
    const group = create('div', 'mx-nav-group');
    const head = create('div', 'mx-nav-group-head');
    head.append(create('span', '', cat.name), create('span', '', String(LIST.filter(d => d.category === cat.id).length).padStart(2, '0')));
    group.append(head);
    LIST.forEach((demo, i) => {
      if (demo.category !== cat.id) return;
      const link = create('a', 'mx-nav-item');
      link.href = `#mx-${demo.id}`;
      link.dataset.id = demo.id;
      link.append(create('em', '', String(i + 1).padStart(2, '0')), create('span', '', demo.title));
      navById.set(demo.id, link);
      group.append(link);
    });
    nav.append(group);
  });

  ['all', ...CATEGORIES.map(c => c.id)].forEach((id, i) => {
    const chip = create('button', 'mx-chip', id === 'all' ? '全部' : CATEGORIES[i - 1].name);
    chip.dataset.cat = id;
    chip.setAttribute('aria-pressed', String(id === 'all'));
    chip.addEventListener('click', () => {
      state.category = id;
      [...chips.children].forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
      applyFilters();
    });
    chips.append(chip);
  });

  /* ---------- 卡片 ---------- */
  const icon = (className, svg, label) => {
    const btn = create('button', className);
    btn.innerHTML = svg;
    btn.setAttribute('aria-label', label);
    btn.title = label;
    return btn;
  };
  const expandIcon = (btn, expanded) => {
    btn.innerHTML = expanded ? SHRINK_ICON : EXPAND_ICON;
    const label = expanded ? '缩小演示' : '放大演示';
    btn.setAttribute('aria-label', label);
    btn.title = label;
    btn.setAttribute('aria-pressed', String(expanded));
  };

  LIST.forEach((demo, index) => {
    const card = create('article', 'mx-card');
    card.id = `mx-${demo.id}`;
    card.dataset.id = demo.id;
    card.dataset.search = `${demo.title} ${demo.tag} ${demo.source} ${demo.category}`.toLowerCase();

    /* 顶部只留两件事：预览/代码切换、重播与放大。标题和来源退到底部当图注，
       舞台占满卡片主体，动效本身才是焦点。 */
    const bar = create('div', 'mx-card-bar');
    const seg = create('div', 'mx-switch');
    seg.setAttribute('role', 'tablist');
    seg.setAttribute('aria-label', '预览与源码');

    const stage = create('div', 'mx-stage');
    stage.id = `mx-stage-${demo.id}`;
    stage.setAttribute('role', 'tabpanel');
    stage.setAttribute('aria-labelledby', `mx-tab-${demo.id}-0`);
    const canvas = create('div', 'mx-canvas');
    stage.append(canvas);

    const code = create('div', 'mx-code');
    code.id = `mx-code-${demo.id}`;
    code.setAttribute('role', 'tabpanel');
    code.setAttribute('aria-labelledby', `mx-tab-${demo.id}-1`);
    code.hidden = true;
    const codeSource = demo.render.toString();
    const pre = create('pre', 'highlight');
    pre.tabIndex = 0;
    pre.setAttribute('aria-label', `${demo.title} 源码`);
    const frag = document.createDocumentFragment();
    highlightLines(codeSource, create).forEach(parts => {
      const row = create('span', 'mx-line');
      parts.forEach(part => row.append(part));
      if (!row.childNodes.length) row.append(document.createTextNode(' '));
      frag.append(row);
    });
    pre.append(frag);
    const copy = icon('mx-copy', COPY_ICON, '复制源码');
    code.append(pre, copy);

    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(codeSource);
      } catch {
        const ta = create('textarea');
        ta.value = codeSource;
        document.body.append(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      copy.innerHTML = DONE_ICON;
      copy.setAttribute('aria-label', '已复制');
      copy.title = '已复制';
      copy.classList.add('done');
      clearTimeout(copy._t);
      copy._t = setTimeout(() => {
        copy.innerHTML = COPY_ICON;
        copy.setAttribute('aria-label', '复制源码');
        copy.title = '复制源码';
        copy.classList.remove('done');
      }, 1600);
    });

    const showView = i => {
      stage.hidden = i === 1;
      code.hidden = i === 0;
      seg.style.setProperty('--on', String(i));
      tabs.forEach((t, j) => {
        t.setAttribute('aria-selected', String(j === i));
        t.tabIndex = j === i ? 0 : -1;
      });
    };
    const tabs = ['预览', '代码'].map((label, i) => {
      const tab = create('button', '', label);
      tab.setAttribute('role', 'tab');
      tab.id = `mx-tab-${demo.id}-${i}`;
      tab.setAttribute('aria-selected', String(i === 0));
      tab.setAttribute('aria-controls', i ? code.id : stage.id);
      tab.tabIndex = i === 0 ? 0 : -1;
      tab.addEventListener('click', () => showView(i));
      seg.append(tab);
      return tab;
    });
    seg.style.setProperty('--on', '0');
    seg.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const current = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
      tabs[(current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length].click();
    });

    /* 右上角两个图标：重播当前效果、放大为单条详情（放大后再点即缩小） */
    const tools = create('div', 'mx-card-tools');
    const replay = icon('mx-icon', REPLAY_ICON, '重播');
    const expand = icon('mx-icon', EXPAND_ICON, '放大演示');
    expandIcon(expand, false);
    replay.addEventListener('click', () => {
      mount(demo);
      if (motion()) replay.animate([{transform: 'rotate(0)'}, {transform: 'rotate(360deg)'}], {duration: 480, easing: 'ease-out'});
    });
    expand.addEventListener('click', () => focused ? closeFocus() : openFocus(card, expand));
    tools.append(replay, expand);
    bar.append(seg, tools);

    const meta = create('div', 'mx-card-meta');
    meta.append(create('span', 'mx-card-no', String(index + 1).padStart(2, '0')), create('h3', '', demo.title));
    const src = create('a', 'mx-src', demo.source.split(' · ')[0] + ' ↗');
    src.href = demo.url;
    src.target = '_blank';
    src.rel = 'noopener noreferrer';
    meta.append(src);

    card.append(bar, stage, code, meta);
    cardById.set(demo.id, card);

    const groupId = `mx-group-${demo.category}`;
    let group = $(`#${groupId}`, groupsHost);
    if (!group) {
      group = create('section', 'mx-group');
      group.id = groupId;
      const cat = CATEGORIES.find(c => c.id === demo.category);
      const head = create('div', 'mx-group-head');
      head.append(create('h2', '', cat.name), create('p', '', cat.note));
      const grid = create('div', 'mx-grid');
      group.append(head, grid);
      groupsHost.append(group);
    }
    $('.mx-grid', group).append(card);
  });

  /* ---------- 示例挂载：每次挂载都从初态自动播放 ---------- */
  const mount = demo => {
    const card = cardById.get(demo.id);
    const stage = $('.mx-canvas', card);
    controllers.get(demo.id)?.abort();
    const controller = new AbortController();
    controllers.set(demo.id, controller);
    const {signal} = controller;
    const timers = new Set();

    const listen = (el, type, fn, options) => el.addEventListener(type, fn, {...options, signal});
    const later = (fn, ms) => {
      const id = setTimeout(() => { timers.delete(id); fn(); }, motion() ? ms : 0);
      timers.add(id);
    };
    const every = (fn, ms) => {
      if (!motion()) return;
      const id = setInterval(fn, ms);
      signal.addEventListener('abort', () => clearInterval(id), {once: true});
    };
    const play = (el, frames, options = {}) => {
      if (!motion() || !el.animate) return null;
      el.getAnimations().forEach(a => a.cancel());
      const anim = el.animate(frames, {duration: 480, easing: 'ease-out', fill: 'backwards', ...options});
      anim.addEventListener('finish', () => anim.cancel(), {once: true});
      return anim;
    };
    signal.addEventListener('abort', () => timers.forEach(clearTimeout), {once: true});
    stage.replaceChildren();
    demo.render({stage, listen, later, every, play, signal, motion, h: create});
  };
  LIST.forEach(mount);
  count.textContent = `${total} / ${total}`;
  const totalLabel = $('.mx-head-meta span');
  if (totalLabel) totalLabel.textContent = `${String(total).padStart(2, '0')} EFFECTS`;
  const sideTotal = $('#mx-side-total');
  if (sideTotal) sideTotal.textContent = String(total);
  reduced.addEventListener('change', () => LIST.forEach(mount));

  /* ---------- 筛选与目录高亮 ---------- */
  function applyFilters() {
    let visible = 0;
    LIST.forEach(demo => {
      const card = cardById.get(demo.id);
      const hit = (state.category === 'all' || demo.category === state.category)
        && (!state.query || card.dataset.search.includes(state.query));
      card.hidden = !hit;
      navById.get(demo.id).hidden = !hit;
      if (hit) visible++;
    });
    groupsHost.querySelectorAll('.mx-group').forEach(group => {
      group.hidden = ![...$('.mx-grid', group).children].some(card => !card.hidden);
    });
    count.textContent = `${visible} / ${LIST.length}`;
    empty.hidden = visible > 0;
  }
  /* 全站顶栏搜索在动效页复用为索引筛选（site.js 同一按页面分流的做法） */
  const search = $('#q');
  search?.addEventListener('input', () => {
    state.query = search.value.trim().toLowerCase();
    applyFilters();
  });

  let ticking = false;
  const side = $('.mx-side');
  let sideManualUntil = 0;
  /* 用户自己在目录上滚轮/触摸时，页面滚动不再抢他的滚动位置 */
  ['wheel', 'pointerdown', 'touchstart'].forEach(type =>
    side?.addEventListener(type, () => { sideManualUntil = performance.now() + 1500; }, {passive: true}));
  const centerNav = link => {
    if (!side || performance.now() < sideManualUntil || side.scrollHeight <= side.clientHeight) return;
    const box = side.getBoundingClientRect();
    const row = link.getBoundingClientRect();
    const top = Math.max(0, side.scrollTop + row.top - box.top - (side.clientHeight - row.height) / 2);
    if (Math.abs(top - side.scrollTop) < 4) return;
    /* 页面滚动每帧都会触发，这里必须直接落位；用 smooth 会被下一帧重启而卡住 */
    side.scrollTop = top;
  };
  const highlight = () => {
    const active = LIST.find(demo => {
      const card = cardById.get(demo.id);
      const rect = card.getBoundingClientRect();
      return !card.hidden && rect.top < 220 && rect.bottom > 220;
    });
    navById.forEach((link, id) => link.classList.toggle('is-active', Boolean(active) && active.id === id));
    if (active) centerNav(navById.get(active.id));
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (ticking || focused) return;
    ticking = true;
    requestAnimationFrame(highlight);
  }, {passive: true});
  highlight();

  /* ---------- 单条详情：iOS 式从原位生长 / 回原位 ---------- */
  const focusedList = () => LIST.filter(d => !cardById.get(d.id).hidden);
  const label = demo => `${CATEGORIES.find(c => c.id === demo.category).name} / ${demo.title}`;
  const expandOf = card => $('.mx-card-tools .mx-icon:last-child', card);
  const slotFor = card => {
    const slot = create('div', 'mx-focus-slot');
    slot.style.height = `${card.getBoundingClientRect().height}px`;
    slot.setAttribute('aria-hidden', 'true');
    return slot;
  };

  function updateFocusNav() {
    if (!focused) return;
    const list = focusedList();
    const index = list.indexOf(focused.demo);
    const before = list[index - 1];
    const after = list[index + 1];
    const {prev, next} = focused;
    prev.disabled = !before;
    next.disabled = !after;
    prev.textContent = before ? `← ${label(before)}` : '← 上一条';
    next.textContent = after ? `${label(after)} →` : '下一条 →';
  }

  function openFocus(card, opener) {
    if (focused) closeFocus(false);
    const demo = LIST.find(d => d.id === card.dataset.id);
    const slot = slotFor(card);

    const dialog = create('dialog', 'mx-focus');
    dialog.setAttribute('aria-label', `${demo.title} · 单独查看`);
    const panel = create('div', 'mx-focus-panel');
    const head = create('div', 'mx-focus-head');
    const title = create('h2', '', demo.title);
    const actions = create('div', 'mx-focus-actions');
    const source = create('a', 'mx-focus-src', demo.source.split(' · ')[0] + ' ↗');
    source.href = demo.url;
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    /* 卡片顶栏里的切换和工具直接搬进标题栏：详情里仍然从顶部切换，不再多一行 */
    const bar = $('.mx-card-bar', card);
    const seg = $('.mx-switch', card);
    const cardActions = $('.mx-card-tools', card);
    const shrink = expandOf(card);
    expandIcon(shrink, true);
    actions.append(source, seg, cardActions);
    head.append(title, actions);

    const body = create('div', 'mx-focus-body');
    const foot = create('div', 'mx-focus-foot');
    const prev = create('button');
    const next = create('button');
    foot.append(prev, next);
    panel.append(head, body, foot);
    dialog.append(panel);

    prev.addEventListener('click', () => goFocus(-1));
    next.addEventListener('click', () => goFocus(1));
    dialog.addEventListener('cancel', event => { event.preventDefault(); closeFocus(); });
    dialog.addEventListener('click', event => { if (event.target === dialog) closeFocus(); });

    card.style.viewTransitionName = VT_NAME;
    withTransition(() => {
      card.replaceWith(slot);
      document.body.append(dialog);
      body.append(card);
      card.classList.add('is-focused');
      dialog.showModal();
      dialog.classList.add('is-open');
      bar.hidden = true;
      focused = {card, dialog, panel, body, slot, opener, demo, prev, next, title, source, bar, seg, cardActions, closing: false};
      mount(demo);   /* 放大同时让效果从头播放 */
      updateFocusNav();
      shrink.focus({preventScroll: true});
    }).finally(() => { card.style.viewTransitionName = ''; });
  }

  function closeFocus(restoreFocus = true) {
    if (!focused || focused.closing) return;
    const f = focused;
    f.closing = true;
    const {card, dialog, slot, opener} = f;
    const finish = () => {
      dialog.classList.remove('is-open', 'is-closing');
      dialog.close();
      slot.parentNode?.insertBefore(card, slot);
      slot.remove();
      card.classList.remove('is-focused');
      f.bar.hidden = false;
      f.bar.append(f.seg, f.cardActions);
      expandIcon(expandOf(card), false);
      dialog.remove();
      if (focused === f) focused = null;
      if (restoreFocus) opener?.focus({preventScroll: true});
    };
    card.style.viewTransitionName = VT_NAME;
    withTransition(finish).finally(() => { card.style.viewTransitionName = ''; });
  }

  function goFocus(delta) {
    if (!focused || focused.closing) return;
    const list = focusedList();
    const target = list[list.indexOf(focused.demo) + delta];
    if (!target) return;
    const f = focused;
    const old = f.card;
    const nextCard = cardById.get(target.id);
    old.style.viewTransitionName = VT_NAME;
    const finishSwap = () => {
      if (focused !== f) return;
      old.style.viewTransitionName = '';
      nextCard.style.viewTransitionName = VT_NAME;
      old.getAnimations().forEach(a => a.cancel());
      f.slot.parentNode?.insertBefore(old, f.slot);
      f.slot.remove();
      old.classList.remove('is-focused');
      const oldBar = $('.mx-card-bar', old);
      oldBar.hidden = false;
      oldBar.append(f.seg, f.cardActions);
      expandIcon(expandOf(old), false);

      const slot = slotFor(nextCard);
      nextCard.replaceWith(slot);
      f.body.append(nextCard);
      nextCard.classList.add('is-focused');
      const nextActions = $('.mx-card-tools', nextCard);
      const nextSeg = $('.mx-switch', nextCard);
      const nextBar = $('.mx-card-bar', nextCard);
      const nextShrink = expandOf(nextCard);
      expandIcon(nextShrink, true);
      $('.mx-focus-actions', f.panel).append(nextSeg, nextActions);
      nextBar.hidden = true;
      Object.assign(f, {card: nextCard, slot, opener: nextShrink, demo: target,
                        bar: nextBar, seg: nextSeg, cardActions: nextActions});
      f.title.textContent = target.title;
      f.source.textContent = target.source.split(' · ')[0] + ' ↗';
      f.source.href = target.url;
      f.dialog.setAttribute('aria-label', `${target.title} · 单独查看`);
      mount(target);
      updateFocusNav();
    };
    withTransition(finishSwap).finally(() => { nextCard.style.viewTransitionName = ''; });
  }
})();
