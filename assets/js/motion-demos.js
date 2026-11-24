/* 动效索引的十五个示例：挂载即自动播放，右上角「重播」图标重新挂载当前示例。
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
    render({stage, play, later, every, motion, signal}) {
      const port = h('div', 'mx-port');
      const block = h('div', 'mx-step', '向下滚动 · 进入视口后显现');
      port.append(block, h('div', 'mx-step', '继续滚动'));
      stage.append(port);
      const stop = inView(block, () => play(block,
        [{opacity: 0, transform: 'translateY(22px)'}, {opacity: 1, transform: 'none'}],
        {duration: 650, easing: 'cubic-bezier(.16,1,.3,1)'}), {root: port, amount: .55});
      signal.addEventListener('abort', stop, {once: true});
      const cycle = () => {
        block.style.opacity = '0';
        block.style.transform = 'translateY(22px)';
        port.scrollTop = 0;
        later(() => port.scrollTo({top: port.scrollHeight, behavior: motion() ? 'smooth' : 'auto'}), 320);
      };
      later(cycle, 400);
      every(cycle, 3600);
    }
  },
  {
    id: 'lenis-scroll', category: 'scroll', title: '平滑滚动', tag: 'lenis',
    source: 'Lenis', url: 'https://github.com/darkroomengineering/lenis',
    render({stage, later, every, motion, signal}) {
      const port = h('div', 'mx-port');
      const content = h('div');
      ['01 · 认识产品', '02 · 看见细节', '03 · 完成体验'].forEach(text => content.append(h('div', 'mx-step', text)));
      port.append(content);
      stage.append(port);
      const lenis = motion() ? new Lenis({wrapper: port, content, autoRaf: true, smoothWheel: false}) : null;
      if (lenis) signal.addEventListener('abort', () => lenis.destroy(), {once: true});
      const go = (where, duration) => {
        if (lenis) lenis.scrollTo(where, {duration});
        else port.scrollTo({top: where === 'bottom' ? port.scrollHeight : 0, behavior: 'auto'});
      };
      const cycle = () => {
        go('top', .6);
        later(() => go('bottom', 1.2), 700);
      };
      later(cycle, 500);
      every(cycle, 4200);
    }
  },
  {
    id: 'scroll-progress', category: 'scroll', title: '滚动进度', tag: 'scroll-progress',
    source: 'Motion Primitives · Scroll Progress', url: 'https://motion-primitives.com/docs/scroll-progress',
    render({stage, listen, later, every, motion}) {
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
      const cycle = () => {
        port.scrollTop = 0;
        later(() => port.scrollTo({top: port.scrollHeight, behavior: motion() ? 'smooth' : 'auto'}), 350);
      };
      later(cycle, 500);
      every(cycle, 4200);
    }
  },
  {
    id: 'infinite-slider', category: 'scroll', title: '无缝跑马灯', tag: 'infinite-slider',
    source: 'Motion Primitives · Infinite Slider', url: 'https://motion-primitives.com/docs/infinite-slider',
    render({stage, play, motion}) {
      const view = h('div', 'mx-marquee');
      const group = h('div', 'mx-marquee-group');
      ['设计', '原型', '开发', '测试', '上线'].forEach(name => {
        group.append(h('span', '', name), h('span', '', name));
      });
      view.append(group);
      stage.append(view);
      if (motion()) play(group,
        [{transform: 'translateX(0)'}, {transform: 'translateX(-50%)'}],
        {duration: 6000, easing: 'linear', iterations: Infinity});
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
      listen(card, 'pointermove', event => {
        if (!motion()) return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(700px) rotateX(${-y * 16}deg) rotateY(${x * 16}deg)`;
      });
      listen(card, 'pointerleave', () => { card.style.transform = ''; });
      every(() => play(card,
        [{transform: 'perspective(700px) rotateY(-8deg)'},
         {transform: 'perspective(700px) rotateY(8deg)'},
         {transform: 'perspective(700px) rotateY(0deg)'}],
        {duration: 1800, easing: 'ease-in-out'}), 4200);
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
    render({stage, play, later, every, motion}) {
      const trigger = h('button', 'mx-ripple', '点这里产生涟漪');
      stage.append(trigger);
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
      every(pulse, 2400);
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
    render({stage, play, every}) {
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
      every(() => show((current + 1) % texts.length), 3000);
    }
  }
];
