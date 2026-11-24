/* 动效索引页外壳：左栏检索 + 自动播放卡片 + 单条详情。
   示例实现全部来自 motion-demos.js；这里只负责目录、状态、Tab、筛选与详情过渡。 */
import { DEMOS, CATEGORIES } from './motion-demos.js';

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

  const REPLAY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1"/><path d="M20.5 4v5h-5"/></svg>';
  const EXPAND_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg>';
  const SHRINK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M3 8h5V3M21 8h-5V3M3 16h5v5M21 16h-5v5"/></svg>';

  const nav = $('#mx-nav');
  const chips = $('#mx-chips');
  const groupsHost = $('#mx-groups');
  const count = $('#mx-count');
  const empty = $('#mx-empty');
  const cardById = new Map();
  const controllers = new Map();
  const navById = new Map();
  const state = {query: '', category: 'all'};
  let focused = null;

  /* ---------- 目录 ---------- */
  CATEGORIES.forEach(cat => {
    const group = create('div', 'mx-nav-group');
    const head = create('div', 'mx-nav-group-head');
    head.append(create('span', '', cat.name), create('span', '', String(DEMOS.filter(d => d.category === cat.id).length).padStart(2, '0')));
    group.append(head);
    DEMOS.forEach((demo, i) => {
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
  const codeText = demo =>
    `/* ${demo.title} — ${demo.source}\n   来源：${demo.url}\n   ctx: { stage, play, later, every, listen, signal, motion, h } */\n${demo.render.toString()}`;

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

  DEMOS.forEach((demo, index) => {
    const card = create('article', 'mx-card');
    card.id = `mx-${demo.id}`;
    card.dataset.id = demo.id;
    card.dataset.search = `${demo.title} ${demo.tag} ${demo.source} ${demo.category}`.toLowerCase();

    const top = create('div', 'mx-card-top');
    const idEl = create('span', 'mx-card-id', String(index + 1).padStart(2, '0'));
    idEl.append(create('i', '', '/'), '15');
    top.append(idEl, create('h3', '', demo.title));
    const src = create('a', 'mx-src', demo.source.split(' · ')[0] + ' ↗');
    src.href = demo.url;
    src.target = '_blank';
    src.rel = 'noopener noreferrer';
    top.append(src);

    /* 右上角两个图标：重播当前效果、放大为单条详情（放大后再点即缩小） */
    const actions = create('div', 'mx-card-actions');
    const replay = icon('mx-icon', REPLAY_ICON, '重播');
    const expand = icon('mx-icon', EXPAND_ICON, '放大演示');
    expandIcon(expand, false);
    replay.addEventListener('click', () => {
      mount(demo);
      if (motion()) replay.animate([{transform: 'rotate(0)'}, {transform: 'rotate(360deg)'}], {duration: 480, easing: 'ease-out'});
    });
    expand.addEventListener('click', () => focused ? closeFocus() : openFocus(card, expand));
    actions.append(replay, expand);
    top.append(actions);

    const stage = create('div', 'mx-stage');
    stage.append(create('span', 'mx-stage-tag', demo.tag));
    const canvas = create('div', 'mx-canvas');
    stage.append(canvas);

    const code = create('div', 'mx-code');
    code.hidden = true;
    const bar = create('div', 'mx-code-bar');
    bar.append(create('span', '', '实现源码 · motion-demos.js'));
    const copy = create('button', 'mx-copy', '复制');
    bar.append(copy);
    const pre = create('pre');
    const sourceLines = codeText(demo).split('\n');
    sourceLines.forEach(line => pre.append(create('span', 'mx-line', line || ' ')));
    const sourceLink = create('div', 'mx-code-src');
    sourceLink.append('实现参考：');
    const link = create('a', '', demo.source + ' ↗');
    link.href = demo.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    sourceLink.append(link);
    code.append(bar, pre, sourceLink);

    copy.addEventListener('click', async () => {
      const text = sourceLines.join('\n');
      try {
        await navigator.clipboard.writeText(text);
        copy.textContent = '已复制';
      } catch {
        const ta = create('textarea');
        ta.value = text;
        document.body.append(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        copy.textContent = '已复制';
      }
      setTimeout(() => { copy.textContent = '复制'; }, 1600);
    });

    const cardFoot = create('div', 'mx-card-foot');
    const seg = create('div', 'mx-seg');
    seg.setAttribute('role', 'tablist');
    const tabs = ['预览', '代码'].map((label, i) => {
      const tab = create('button', '', label);
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(i === 0));
      tab.tabIndex = i === 0 ? 0 : -1;
      tab.addEventListener('click', () => {
        stage.hidden = i === 1;
        code.hidden = i === 0;
        tabs.forEach((t, j) => {
          t.setAttribute('aria-selected', String(j === i));
          t.tabIndex = j === i ? 0 : -1;
        });
      });
      seg.append(tab);
      return tab;
    });
    seg.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const current = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
      tabs[(current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length].click();
    });
    cardFoot.append(seg);

    card.append(top, stage, code, cardFoot);
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
  DEMOS.forEach(mount);
  reduced.addEventListener('change', () => DEMOS.forEach(mount));

  /* ---------- 筛选与目录高亮 ---------- */
  function applyFilters() {
    let visible = 0;
    DEMOS.forEach(demo => {
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
    count.textContent = `${visible} / ${DEMOS.length}`;
    empty.hidden = visible > 0;
  }
  /* 全站顶栏搜索在动效页复用为索引筛选（site.js 同一按页面分流的做法） */
  const search = $('#q');
  search?.addEventListener('input', () => {
    state.query = search.value.trim().toLowerCase();
    applyFilters();
  });

  let ticking = false;
  const highlight = () => {
    const active = DEMOS.find(demo => {
      const card = cardById.get(demo.id);
      const rect = card.getBoundingClientRect();
      return !card.hidden && rect.top < 220 && rect.bottom > 220;
    });
    navById.forEach((link, id) => link.classList.toggle('is-active', Boolean(active) && active.id === id));
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (ticking || focused) return;
    ticking = true;
    requestAnimationFrame(highlight);
  }, {passive: true});
  highlight();

  /* ---------- 单条详情：iOS 式从原位生长 / 回原位 ---------- */
  const focusedList = () => DEMOS.filter(d => !cardById.get(d.id).hidden);
  const label = demo => `${CATEGORIES.find(c => c.id === demo.category).name} / ${demo.title}`;
  const expandOf = card => $('.mx-card-actions .mx-icon:last-child', card);
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
    const demo = DEMOS.find(d => d.id === card.dataset.id);
    const sourceRect = card.getBoundingClientRect();
    const slot = slotFor(card);

    const dialog = create('dialog', 'mx-focus');
    dialog.setAttribute('aria-label', `${demo.title} · 单独查看`);
    const panel = create('div', 'mx-focus-panel');
    const head = create('div', 'mx-focus-head');
    const heading = create('div');
    const kicker = create('span', 'mx-focus-kicker', label(demo));
    const title = create('h2', '', demo.title);
    heading.append(kicker, title);
    const actions = create('div', 'mx-focus-actions');
    const source = create('a', 'mx-focus-src', `${demo.source} ↗`);
    source.href = demo.url;
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    const close = icon('mx-focus-close', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19"/></svg>', '关闭单独查看');
    actions.append(source, close);
    head.append(heading, actions);

    const body = create('div', 'mx-focus-body');
    const foot = create('div', 'mx-focus-foot');
    const prev = create('button');
    const next = create('button');
    foot.append(prev, next);
    panel.append(head, body, foot);
    dialog.append(panel);

    card.replaceWith(slot);
    document.body.append(dialog);
    body.append(card);
    card.classList.add('is-focused');
    expandIcon(expandOf(card), true);
    focused = {card, dialog, panel, body, slot, opener, demo, prev, next, kicker, title, source, closing: false};
    prev.addEventListener('click', () => goFocus(-1));
    next.addEventListener('click', () => goFocus(1));
    close.addEventListener('click', () => closeFocus());
    dialog.addEventListener('cancel', event => { event.preventDefault(); closeFocus(); });
    dialog.addEventListener('click', event => { if (event.target === dialog) closeFocus(); });
    dialog.showModal();
    dialog.classList.add('is-open');

    if (motion()) {
      const to = panel.getBoundingClientRect();
      const sx = Math.max(sourceRect.width / to.width, .12);
      const sy = Math.max(sourceRect.height / to.height, .12);
      panel.animate([
        {transform: `translate(${sourceRect.left - to.left}px, ${sourceRect.top - to.top}px) scale(${sx}, ${sy})`, opacity: .92},
        {transform: 'none', opacity: 1}
      ], {duration: 520, easing: EASE});
    }
    mount(demo);   /* 放大同时让效果从头播放 */
    close.focus({preventScroll: true});
    updateFocusNav();
  }

  function closeFocus(restoreFocus = true) {
    if (!focused || focused.closing) return;
    const f = focused;
    f.closing = true;
    const {card, dialog, panel, slot, opener} = f;
    const finish = () => {
      dialog.classList.remove('is-open', 'is-closing');
      dialog.close();
      slot.parentNode?.insertBefore(card, slot);
      slot.remove();
      card.classList.remove('is-focused');
      expandIcon(expandOf(card), false);
      dialog.remove();
      if (focused === f) focused = null;
      if (restoreFocus) opener?.focus({preventScroll: true});
    };
    if (!motion() || !dialog.open) { finish(); return; }
    dialog.classList.remove('is-open');
    dialog.classList.add('is-closing');
    const from = panel.getBoundingClientRect();
    const to = slot.getBoundingClientRect();
    const sx = Math.max(to.width / from.width, .12);
    const sy = Math.max(to.height / from.height, .12);
    const anim = panel.animate([
      {transform: 'none', opacity: 1},
      {transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${sx}, ${sy})`, opacity: .9}
    ], {duration: 380, easing: EASE, fill: 'forwards'});
    anim.finished.then(finish, finish);
  }

  function goFocus(delta) {
    if (!focused || focused.closing) return;
    const list = focusedList();
    const target = list[list.indexOf(focused.demo) + delta];
    if (!target) return;
    const f = focused;
    const old = f.card;
    const nextCard = cardById.get(target.id);
    const finishSwap = () => {
      if (focused !== f) return;
      old.getAnimations().forEach(a => a.cancel());
      f.slot.parentNode?.insertBefore(old, f.slot);
      f.slot.remove();
      old.classList.remove('is-focused');
      expandIcon(expandOf(old), false);

      const rect = nextCard.getBoundingClientRect();
      const slot = slotFor(nextCard);
      nextCard.replaceWith(slot);
      f.body.append(nextCard);
      nextCard.classList.add('is-focused');
      expandIcon(expandOf(nextCard), true);
      Object.assign(f, {card: nextCard, slot, opener: expandOf(nextCard), demo: target});
      f.kicker.textContent = label(target);
      f.title.textContent = target.title;
      f.source.textContent = `${target.source} ↗`;
      f.source.href = target.url;
      f.dialog.setAttribute('aria-label', `${target.title} · 单独查看`);
      mount(target);
      updateFocusNav();
      if (motion()) nextCard.animate(
        [{opacity: 0, transform: `translateX(${delta > 0 ? 20 : -20}px)`}, {opacity: 1, transform: 'none'}],
        {duration: 300, easing: EASE});
    };
    if (!motion()) { finishSwap(); return; }
    const out = old.animate(
      [{opacity: 1, transform: 'none'}, {opacity: 0, transform: `translateX(${delta > 0 ? -20 : 20}px)`}],
      {duration: 180, easing: 'ease-in', fill: 'forwards'});
    out.finished.then(finishSwap, finishSwap);
  }
})();
