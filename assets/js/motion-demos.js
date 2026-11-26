import { highlightLines } from './code-highlight.js';

/* 动效索引的二十五个示例：挂载即自动播放，右上角「重播」图标重新挂载当前示例。
   render 只接收 ctx（stage / play / later / every / listen / signal / motion / h），
   不碰页面外壳，所以同一份实现能同时出现在卡片和单条详情里。
   ctx.h(tag, className, text) 创建元素；play 为 WAAPI 封装，自动遵守减少动态偏好。 */
import { inView, Lenis, NumberFlow } from './vendor/motion-lab-vendor.js';

const h = (tag, className = '', text = '') => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  if (tag === 'button') el.type = 'button';
  return el;
};

/* 匀速慢滚：每 16ms 走 speed 像素；isPaused() 为真时原地等待，
   把滚动权交还给用户。减少动态偏好下直接落到终点。 */
const glide = (port, target, {later, motion, signal}, isPaused, speed = 1) => {
  if (!motion()) { port.scrollTop = target; return; }
  const step = () => {
    if (signal.aborted) return;
    if (!isPaused()) {
      const diff = target - port.scrollTop;
      if (Math.abs(diff) < 1) { port.scrollTop = target; return; }
      port.scrollTop += Math.sign(diff) * Math.min(Math.abs(diff), speed);
    }
    later(step, 16);
  };
  step();
};

const hoverFlag = (el, listen) => {
  let hovering = false;
  listen(el, 'pointerenter', () => { hovering = true; });
  listen(el, 'pointerleave', () => { hovering = false; });
  return () => hovering;
};

export const CATEGORIES = [
  { id: 'text',   name: '文字',     note: '强调一句话，或揭晓一个结果。' },
  { id: 'reveal', name: '入场',     note: '告诉读者从哪里开始看。' },
  { id: 'scroll', name: '滚动',     note: '把阅读进度和画面变化绑在一起。' },
  { id: 'pointer',name: '指针',     note: '确认可操作区域，但不能挡住操作。' },
  { id: 'ui',     name: '界面反馈', note: '让用户知道刚才那一下产生了什么结果。' }
];

export const DEMOS = [
  {
    id: 'text-shimmer', category: 'text', title: '流光文字', tag: 'text-shimmer',
    source: 'Motion Primitives · Text Shimmer', url: 'https://motion-primitives.com/docs/text-shimmer',
    render({stage, play, motion}) {
      const line = h('div', 'mx-display mx-shimmer', 'LIGHT / 流光');
      stage.append(line);
      if (motion()) play(line,
        [{backgroundPosition: '100% center'}, {backgroundPosition: '0% center'}],
        {duration: 1800, easing: 'linear', iterations: Infinity});
    }
  },
  {
    id: 'rolling-text', category: 'text', title: '翻牌换字', tag: 'rolling-text',
    source: 'Animate UI · Rolling Text', url: 'https://animate-ui.com/docs/vue/primitives/animate-ui/rolling-text',
    render({stage, play, later, every, motion}) {
      const words = ['动效实验室', '恰到好处动'];
      const row = h('div', 'mx-roll');
      const chars = [...words[0]].map(ch => {
        const span = h('span', '', ch);
        row.append(span);
        return span;
      });
      stage.append(row);
      let index = 0;
      const swap = () => {
        const next = words[index];
        chars.forEach((span, i) => {
          if (!motion()) { span.textContent = next[i] || ''; return; }
          play(span, [{transform: 'rotateX(0deg)'}, {transform: 'rotateX(-90deg)'}, {transform: 'rotateX(0deg)'}],
            {duration: 580, delay: i * 75});
          later(() => { span.textContent = next[i] || ''; }, 290 + i * 75);
        });
        index = (index + 1) % words.length;
      };
      later(swap, 700);
      every(swap, 2600);
    }
  },
  {
    id: 'text-scramble', category: 'text', title: '字符解码', tag: 'text-scramble',
    source: 'Motion Primitives · Text Scramble', url: 'https://motion-primitives.com/docs/text-scramble',
    render({stage, later, every, motion}) {
      const target = 'SIGNAL FOUND';
      const out = h('code', '', target);
      const bar = h('div', 'mx-term-bar');
      for (let i = 0; i < 3; i++) bar.append(h('i'));
      const term = h('div', 'mx-term');
      term.append(bar, out);
      stage.append(term);
      const decode = () => {
        if (!motion()) { out.textContent = target; return; }
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let step = 0;
        const tick = () => {
          out.textContent = [...target].map((ch, i) =>
            ch === ' ' || i / target.length < step / 20 ? ch : chars[Math.floor(Math.random() * chars.length)]
          ).join('');
          if (step++ < 20) later(tick, 45); else out.textContent = target;
        };
        tick();
      };
      later(decode, 300);
      every(decode, 5200);
    }
  },
  {
    id: 'blur-reveal', category: 'reveal', title: '由模糊到清晰', tag: 'blur-reveal',
    source: 'Inspira UI · Blur Reveal', url: 'https://github.com/unovue/inspira-ui/blob/main/app/components/inspira/ui/blur-reveal/BlurReveal.vue',
    render({stage, play, later, every}) {
      const box = h('div');
      box.append(h('div', 'mx-display', '从模糊到清晰'), h('p', 'mx-sub', '内容先到场，注意力随后到位。'));
      stage.append(box);
      const show = () => play(box,
        [{opacity: 0, filter: 'blur(16px)', transform: 'translateY(14px)'},
         {opacity: 1, filter: 'blur(0)', transform: 'none'}],
        {duration: 900, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards'});
      later(show, 200);
      every(show, 4400);
    }
  },
  {
    id: 'text-effect', category: 'reveal', title: '逐字入场', tag: 'text-effect',
    source: 'Motion Primitives · Text Effect', url: 'https://motion-primitives.com/docs/text-effect',
    render({stage, play, later, every}) {
      const line = h('div', 'mx-display');
      [...'让动效有理由'].forEach(ch => line.append(h('span', '', ch)));
      stage.append(line);
      const show = () => [...line.children].forEach((span, i) => play(span,
        [{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'none'}],
        {duration: 500, delay: i * 65, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards'}));
      later(show, 200);
      every(show, 4400);
    }
  },
  {
    id: 'in-view', category: 'reveal', title: '进入视口', tag: 'in-view',
    source: 'Motion · inView()', url: 'https://motion.dev/docs/inview',
    render({stage, play, later, every, listen, motion, signal}) {
      const port = h('div', 'mx-port');
      const block = h('div', 'mx-step', '向下滚动 · 进入视口后显现');
      port.append(block, h('div', 'mx-step', '继续滚动'));
      stage.append(port);
      const stop = inView(block, () => play(block,
        [{opacity: 0, transform: 'translateY(22px)'}, {opacity: 1, transform: 'none'}],
        {duration: 650, easing: 'cubic-bezier(.16,1,.3,1)'}), {root: port, amount: .55});
      signal.addEventListener('abort', stop, {once: true});
      let hovering = false;
      listen(port, 'pointerenter', () => { hovering = true; });
      listen(port, 'pointerleave', () => { hovering = false; });
      const ctx = {later, motion, signal};
      const cycle = () => {
        block.style.opacity = '0';
        block.style.transform = 'translateY(22px)';
        port.scrollTop = 0;
        later(() => glide(port, port.scrollHeight, ctx, () => hovering, .9), 600);
      };
      later(cycle, 900);
      every(cycle, 10000);
    }
  },
  {
    id: 'lenis-scroll', category: 'scroll', title: '平滑滚动', tag: 'lenis',
    source: 'Lenis', url: 'https://github.com/darkroomengineering/lenis',
    render({stage, later, every, listen, motion, signal}) {
      const port = h('div', 'mx-port');
      const content = h('div');
      ['01 · 认识产品', '02 · 看见细节', '03 · 完成体验'].forEach(text => content.append(h('div', 'mx-step', text)));
      port.append(content);
      stage.append(port);
      const lenis = motion() ? new Lenis({wrapper: port, content, autoRaf: true, smoothWheel: false}) : null;
      if (lenis) {
        signal.addEventListener('abort', () => lenis.destroy(), {once: true});
        listen(port, 'pointerenter', () => lenis.stop());
        listen(port, 'pointerleave', () => lenis.start());
      }
      const go = (where, duration) => {
        if (lenis) lenis.scrollTo(where, {duration});
        else port.scrollTo({top: where === 'bottom' ? port.scrollHeight : 0, behavior: 'auto'});
      };
      const cycle = () => {
        go('top', 1.4);
        later(() => go('bottom', 3.4), 1800);
      };
      later(cycle, 800);
      every(cycle, 11000);
    }
  },
  {
    id: 'scroll-progress', category: 'scroll', title: '滚动进度', tag: 'scroll-progress',
    source: 'Motion Primitives · Scroll Progress', url: 'https://motion-primitives.com/docs/scroll-progress',
    render({stage, listen, later, every, motion, signal}) {
      const track = h('div', 'mx-progress');
      const fill = h('i');
      track.append(fill);
      const port = h('div', 'mx-port');
      ['第一段', '第二段', '第三段'].forEach(t => port.append(h('div', 'mx-step', t)));
      stage.append(track, port);
      listen(port, 'scroll', () => {
        const max = port.scrollHeight - port.clientHeight;
        fill.style.transform = `scaleX(${max ? port.scrollTop / max : 0})`;
      });
      let hovering = false;
      listen(port, 'pointerenter', () => { hovering = true; });
      listen(port, 'pointerleave', () => { hovering = false; });
      const ctx = {later, motion, signal};
      const cycle = () => {
        port.scrollTop = 0;
        later(() => glide(port, port.scrollHeight, ctx, () => hovering, .9), 500);
      };
      later(cycle, 700);
      every(cycle, 10000);
    }
  },
  {
    id: 'infinite-slider', category: 'scroll', title: '无缝跑马灯', tag: 'infinite-slider',
    source: 'Motion Primitives · Infinite Slider', url: 'https://motion-primitives.com/docs/infinite-slider',
    render({stage, listen, play, motion, signal}) {
      const view = h('div', 'mx-marquee');
      const track = h('div', 'mx-marquee-track');
      const names = ['设计', '原型', '开发', '测试', '上线'];
      const makeGroup = () => {
        const group = h('div', 'mx-marquee-group');
        names.forEach(name => group.append(h('span', '', name)));
        return group;
      };
      track.append(makeGroup());
      view.append(track);
      stage.append(view);
      if (!motion()) return;
      let hovering = false;
      const pauseAll = () => track.getAnimations().forEach(a => a.pause());
      const playAll = () => track.getAnimations().forEach(a => a.play());
      listen(view, 'pointerenter', () => { hovering = true; pauseAll(); });
      listen(view, 'pointerleave', () => { hovering = false; playAll(); });
      let lastWidth = 0;
      const setup = () => {
        const groupWidth = track.firstChild.getBoundingClientRect().width;
        const viewWidth = view.getBoundingClientRect().width;
        if (!groupWidth || !viewWidth) return;
        /* 视口右侧永远再留一组以上的内容，跑完一组时不会露出空白 */
        const groups = Math.max(2, Math.ceil(viewWidth / groupWidth) + 1);
        while (track.children.length < groups) track.append(makeGroup());
        while (track.children.length > groups) track.lastChild.remove();
        play(track, [{transform: 'translateX(0)'}, {transform: `translateX(-${groupWidth}px)`}],
          {duration: Math.round(groupWidth * 22), easing: 'linear', iterations: Infinity});
        if (hovering) pauseAll();
      };
      setup();
      const observer = new ResizeObserver(() => {
        const width = Math.round(view.getBoundingClientRect().width);
        if (width === lastWidth) return;
        lastWidth = width;
        setup();
      });
      observer.observe(view);
      signal.addEventListener('abort', () => observer.disconnect(), {once: true});
    }
  },
  {
    id: 'magnetic', category: 'pointer', title: '磁吸按钮', tag: 'magnetic',
    source: 'Motion Primitives · Magnetic', url: 'https://motion-primitives.com/docs/magnetic',
    render({stage, listen, motion}) {
      const zone = h('div', 'mx-zone');
      const target = h('button', '', '磁吸');
      zone.append(target);
      stage.append(zone);
      listen(zone, 'pointermove', event => {
        if (!motion()) return;
        const rect = zone.getBoundingClientRect();
        target.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * .18}px, ${(event.clientY - rect.top - rect.height / 2) * .18}px)`;
      });
      listen(zone, 'pointerleave', () => { target.style.transform = ''; });
    }
  },
  {
    id: 'tilt', category: 'pointer', title: '倾斜卡片', tag: 'tilt',
    source: 'Motion Primitives · Tilt', url: 'https://motion-primitives.com/docs/tilt',
    render({stage, listen, play, every, motion}) {
      const card = h('div', 'mx-tilt-card');
      card.append(h('strong', '', '◈ TILT CARD'), h('small', '', '指针位置决定角度'));
      stage.append(card);
      const isHovering = hoverFlag(card, listen);
      listen(card, 'pointermove', event => {
        if (!motion()) return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(700px) rotateX(${-y * 16}deg) rotateY(${x * 16}deg)`;
      });
      listen(card, 'pointerleave', () => { card.style.transform = ''; });
      every(() => {
        if (isHovering()) return;
        play(card,
          [{transform: 'perspective(700px) rotateY(-8deg)'},
           {transform: 'perspective(700px) rotateY(8deg)'},
           {transform: 'perspective(700px) rotateY(0deg)'}],
          {duration: 1800, easing: 'ease-in-out'});
      }, 4200);
    }
  },
  {
    id: 'spotlight', category: 'pointer', title: '聚光卡片', tag: 'card-spotlight',
    source: 'Inspira UI · Card Spotlight', url: 'https://github.com/unovue/inspira-ui/blob/main/app/components/inspira/ui/card-spotlight/CardSpotlight.vue',
    render({stage, listen}) {
      const zone = h('div', 'mx-spot', '跟随的亮斑');
      const glow = h('i');
      zone.append(glow);
      stage.append(zone);
      listen(zone, 'pointermove', event => {
        const rect = zone.getBoundingClientRect();
        zone.style.setProperty('--mx-x', `${event.clientX - rect.left}px`);
        zone.style.setProperty('--mx-y', `${event.clientY - rect.top}px`);
        zone.classList.add('is-lit');
      });
      listen(zone, 'pointerleave', () => zone.classList.remove('is-lit'));
    }
  },
  {
    id: 'ripple', category: 'ui', title: '涟漪按钮', tag: 'ripple-button',
    source: 'Animate UI · Ripple Button', url: 'https://animate-ui.com/docs/vue/primitives/animate-ui/ripple-button',
    render({stage, listen, play, later, every, motion}) {
      const trigger = h('button', 'mx-ripple', '点这里产生涟漪');
      stage.append(trigger);
      const isHovering = hoverFlag(trigger, listen);
      const waveAt = (x, y) => {
        if (!motion()) return;
        const rect = trigger.getBoundingClientRect();
        const wave = h('span', 'mx-wave');
        const size = Math.max(rect.width, rect.height);
        wave.style.width = wave.style.height = `${size}px`;
        wave.style.left = `${x - rect.left - size / 2}px`;
        wave.style.top = `${y - rect.top - size / 2}px`;
        trigger.append(wave);
        const anim = play(wave, [{transform: 'scale(0)', opacity: 1}, {transform: 'scale(2)', opacity: 0}], {duration: 600});
        if (anim) anim.finished.finally(() => wave.remove()); else wave.remove();
      };
      const pulse = () => {
        const rect = trigger.getBoundingClientRect();
        waveAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
      };
      trigger.addEventListener('click', event => waveAt(event.clientX, event.clientY));
      later(pulse, 600);
      every(() => { if (!isHovering()) pulse(); }, 2400);
    }
  },
  {
    id: 'counting-number', category: 'ui', title: '数字滚动', tag: 'counting-number',
    source: 'Animate UI · Counting Number', url: 'https://animate-ui.com/docs/vue/primitives/animate-ui/counting-number',
    render({stage, every, motion}) {
      const number = new NumberFlow();
      number.className = 'mx-numeral';
      number.animated = motion();
      number.respectMotionPreference = false;
      number.update(98);
      stage.append(number);
      every(() => number.update(Number(number.value) % 999 + 1), 2600);
    }
  },
  {
    id: 'animated-tabs', category: 'ui', title: '切换面板', tag: 'tabs',
    source: 'Animate UI · Tabs', url: 'https://animate-ui.com/docs/vue/primitives/reka-ui/tabs',
    render({stage, listen, play, every}) {
      const bar = h('div', 'mx-tabbar');
      bar.setAttribute('role', 'tablist');
      const texts = ['雾蓝色 · 直径 42 毫米', '预计 2 天内发货'];
      const panels = texts.map((text, i) => {
        const panel = h('div', 'mx-panel-text', text);
        panel.hidden = i !== 0;
        stage.append(panel);
        return panel;
      });
      let current = 0;
      const buttons = texts.map((name, i) => {
        const tab = h('button', '', i ? '配送' : '规格');
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', String(i === 0));
        tab.addEventListener('click', () => show(i));
        bar.append(tab);
        return tab;
      });
      const show = i => {
        current = i;
        buttons.forEach((b, j) => b.setAttribute('aria-selected', String(j === i)));
        panels.forEach((p, j) => {
          p.hidden = j !== i;
          if (!p.hidden) play(p, [{opacity: 0, transform: 'translateY(6px)'}, {opacity: 1, transform: 'none'}], {duration: 320});
        });
      };
      stage.append(bar);
      const isHovering = hoverFlag(bar, listen);
      every(() => { if (!isHovering()) show((current + 1) % texts.length); }, 3000);
    }
  },
  {
    id: 'glitch-text', category: 'text', title: '故障文字', tag: 'glitch-text',
    source: 'React Bits · Glitch Text', url: 'https://reactbits.dev/text-animations/glitch-text',
    render({stage, play, later, every, motion}) {
      const wrap = h('div', 'mx-glitch');
      const layers = ['', 'mx-glitch-r', 'mx-glitch-b'].map(cls => {
        const el = h('span', cls, 'GLITCH / 故障');
        wrap.append(el);
        return el;
      });
      stage.append(wrap);
      const jitter = () => {
        if (!motion()) return;
        layers.forEach((el, i) => {
          const dx = i === 0 ? 0 : (i === 1 ? 7 : -7);
          play(el, [
            {transform: 'translate(0,0)', clipPath: 'inset(0 0 0 0)', offset: 0},
            {transform: `translate(${dx}px,-2px)`, clipPath: 'inset(12% 0 58% 0)', offset: .25},
            {transform: `translate(${-dx}px,2px)`, clipPath: 'inset(58% 0 12% 0)', offset: .5},
            {transform: 'translate(0,0)', clipPath: 'inset(0 0 0 0)', offset: 1}
          ], {duration: 620, easing: 'steps(5,end)'});
        });
      };
      later(jitter, 400);
      every(jitter, 2800);
    }
  },
  {
    id: 'typewriter', category: 'text', title: '打字机', tag: 'typewriter',
    source: 'Aceternity UI · Typewriter Effect', url: 'https://ui.aceternity.com/components/typewriter-effect',
    render({stage, later, motion}) {
      const text = '好的动效，说清楚一件事。';
      const out = h('span');
      const line = h('div', 'mx-type');
      line.append(out, h('i', 'mx-caret'));
      stage.append(line);
      let i = 0, deleting = false;
      const tick = () => {
        if (!motion()) { out.textContent = text; return; }
        out.textContent = text.slice(0, deleting ? --i : ++i);
        if (!deleting && i === text.length) { deleting = true; later(tick, 1400); return; }
        if (deleting && i === 0) { deleting = false; later(tick, 450); return; }
        later(tick, deleting ? 45 : 85);
      };
      later(tick, 300);
    }
  },
  {
    id: 'accordion', category: 'reveal', title: '折叠面板', tag: 'accordion',
    source: 'Motion Primitives · Accordion', url: 'https://motion-primitives.com/docs/accordion',
    render({stage, every}) {
      const data = [
        ['触发条件', '滚动、悬停还是点击？先把触发方式定清楚。'],
        ['终态路径', '减少动态效果时，直接给到结果，不让人等动画。'],
        ['回放边界', '循环播放要能停下，别把注意力一直挂在上面。']
      ];
      const wrap = h('div', 'mx-acc');
      const items = data.map(([t, c], i) => {
        const item = h('div', 'mx-acc-item' + (i === 0 ? ' is-open' : ''));
        const btn = h('button', 'mx-acc-head', t);
        const inner = h('div');
        inner.append(h('p', '', c));
        const body = h('div', 'mx-acc-body');
        body.append(inner);
        item.append(btn, body);
        wrap.append(item);
        btn.addEventListener('click', () => open(i));
        return item;
      });
      const open = i => items.forEach((el, j) => el.classList.toggle('is-open', j === i));
      stage.append(wrap);
      let current = 0;
      every(() => { current = (current + 1) % items.length; open(current); }, 2600);
    }
  },
  {
    id: 'card-swap', category: 'reveal', title: '卡片轮替', tag: 'card-swap',
    source: 'React Bits · Card Swap', url: 'https://reactbits.dev/components/card-swap',
    render({stage, every}) {
      const stack = h('div', 'mx-stack');
      const cards = ['01 / 先看清', '02 / 再动手', '03 / 看反馈'].map(t => {
        const card = h('div', 'mx-stack-card', t);
        stack.append(card);
        return card;
      });
      const arrange = () => cards.forEach((c, i) => { c.dataset.pos = String(i); });
      arrange();
      stage.append(stack);
      every(() => { cards.push(cards.shift()); arrange(); }, 2400);
    }
  },
  {
    id: 'border-beam', category: 'ui', title: '流光描边', tag: 'border-beam',
    source: 'Magic UI · Border Beam', url: 'https://magicui.design/docs/components/border-beam',
    render({stage}) {
      stage.append(h('div', 'mx-beam', '光沿边框走一圈'));
    }
  },
  {
    id: 'confetti-button', category: 'ui', title: '彩纸反馈', tag: 'confetti',
    source: 'Magic UI · Confetti', url: 'https://magicui.design/docs/components/confetti',
    render({stage, listen, play, later, every, motion}) {
      const btn = h('button', 'mx-confetti', '点一下庆祝');
      stage.append(btn);
      const isHovering = hoverFlag(btn, listen);
      const burst = () => {
        if (!motion()) return;
        for (let i = 0; i < 14; i++) {
          const bit = h('i');
          if (i % 3 === 1) bit.style.background = 'var(--k2)';
          if (i % 3 === 2) bit.style.background = 'var(--k3)';
          btn.append(bit);
          const a = (i / 14) * Math.PI * 2;
          const dist = 70 + Math.random() * 60;
          const anim = play(bit, [
            {transform: 'translate(-50%,-50%) scale(1)', opacity: 1},
            {transform: `translate(${Math.cos(a) * dist}px,${Math.sin(a) * dist}px) scale(0)`, opacity: 0}
          ], {duration: 900, easing: 'cubic-bezier(.16,1,.3,1)'});
          if (anim) anim.finished.finally(() => bit.remove()); else bit.remove();
        }
      };
      btn.addEventListener('click', burst);
      later(burst, 500);
      every(() => { if (!isHovering()) burst(); }, 3000);
    }
  },
  {
    id: 'image-comparison', category: 'pointer', title: '对比滑块', tag: 'image-comparison',
    source: 'Motion Primitives · Image Comparison', url: 'https://motion-primitives.com/docs/image-comparison',
    render({stage, listen, play, motion}) {
      const box = h('div', 'mx-compare');
      const after = h('div', 'mx-after', '实现结果');
      const split = h('div', 'mx-split');
      box.append(h('div', 'mx-before', '设计稿'), after, split);
      stage.append(box);
      const isHovering = hoverFlag(box, listen);
      let dragging = false;
      const setSplit = clientX => {
        const rect = box.getBoundingClientRect();
        const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
        split.style.left = `${pct}%`;
      };
      const startAuto = () => {
        if (!motion()) return;
        const pct = parseFloat(split.style.left) || 50;
        const to = pct < 50 ? 80 : 20;
        const timing = {duration: 3600, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out'};
        play(after, [{clipPath: `inset(0 ${100 - pct}% 0 0)`}, {clipPath: `inset(0 ${100 - to}% 0 0)`}], timing);
        play(split, [{left: `${pct}%`}, {left: `${to}%`}], timing);
      };
      const pause = () => [box, after, split].forEach(el => el.getAnimations().forEach(a => a.pause()));
      const resume = () => {
        const els = [box, after, split];
        if (els.some(el => el.getAnimations().length)) els.forEach(el => el.getAnimations().forEach(a => a.play()));
        else startAuto();
      };
      listen(box, 'pointerenter', pause);
      listen(box, 'pointerleave', () => { if (!dragging) resume(); });
      listen(split, 'pointerdown', event => {
        dragging = true;
        split.setPointerCapture(event.pointerId);
        [after, split].forEach(el => el.getAnimations().forEach(a => a.cancel()));
        setSplit(event.clientX);
      });
      listen(box, 'pointermove', event => { if (dragging) setSplit(event.clientX); });
      const stop = () => {
        if (!dragging) return;
        dragging = false;
        if (!isHovering()) startAuto();
      };
      listen(split, 'pointerup', stop);
      listen(split, 'pointercancel', stop);
      startAuto();
    }
  },
  {
    id: 'spinning-text', category: 'pointer', title: '环形文字', tag: 'spinning-text',
    source: 'Motion Primitives · Spinning Text', url: 'https://motion-primitives.com/docs/spinning-text',
    render({stage, play, motion}) {
      const ring = h('div', 'mx-spin');
      const text = 'MOTION · 动效 · MOTION · 动效 · ';
      [...text].forEach((ch, i) => {
        const span = h('span', '', ch);
        span.style.transform = `rotate(${(360 / text.length) * i}deg) translateY(-70px) rotate(${(-360 / text.length) * i}deg)`;
        ring.append(span);
      });
      ring.append(h('i'));
      stage.append(ring);
      if (motion()) play(ring, [{transform: 'rotate(0deg)'}, {transform: 'rotate(360deg)'}],
        {duration: 12000, iterations: Infinity, easing: 'linear'});
    }
  },
  {
    id: 'sliding-number', category: 'ui', title: '滚动数字', tag: 'sliding-number',
    source: 'Motion Primitives · Sliding Number', url: 'https://motion-primitives.com/docs/sliding-number',
    render({stage, play, later, every, motion}) {
      const od = h('div', 'mx-odo');
      const cols = [...'024'].map(() => {
        const col = h('span', 'mx-odo-col');
        for (let n = 0; n <= 9; n++) col.append(h('i', '', String(n)));
        od.append(col);
        return col;
      });
      stage.append(od);
      let prev = [0, 2, 4];
      const setNumber = value => {
        const next = String(value).padStart(3, '0').split('').map(Number);
        cols.forEach((col, i) => {
          const to = `translateY(-${next[i] * 1.25}em)`;
          col.style.transform = to;
          if (!motion()) return;
          play(col, [{transform: `translateY(-${prev[i] * 1.25}em)`}, {transform: to}],
            {duration: 620, easing: 'cubic-bezier(.16,1,.3,1)'});
        });
        prev = next;
      };
      later(() => setNumber(148), 500);
      every(() => setNumber(Math.floor(Math.random() * 1000)), 2600);
    }
  },
  {
    id: 'code-block', category: 'text', title: '代码行聚焦', tag: 'code-focus',
    source: '本站实现 · 行聚焦', url: 'https://github.com/noSugarK/nosugark.github.io',
    render({stage, listen, later, every}) {
      const sample = `const focus = (line) => {\n  line.classList.add('is-active');\n  // 让读者知道该看哪一行\n  return line.textContent;\n};\nfocus(currentLine);`;
      const pre = h('pre', 'mx-demo-code highlight');
      const lines = highlightLines(sample, h).map(parts => {
        const row = h('span', 'mx-line');
        parts.forEach(part => row.append(part));
        if (!row.childNodes.length) row.append(document.createTextNode(' '));
        pre.append(row);
        return row;
      });
      stage.append(pre);
      let current = 0;
      const set = i => lines.forEach((row, j) => row.classList.toggle('is-active', j === i));
      let hovering = false;
      listen(pre, 'pointerenter', () => { hovering = true; pre.classList.add('is-user'); });
      listen(pre, 'pointerleave', () => { hovering = false; pre.classList.remove('is-user'); });
      set(current);
      later(() => set(current = 1), 500);
      every(() => {
        if (hovering) return;
        current = (current + 1) % lines.length;
        set(current);
      }, 1500);
    }
  }
];
