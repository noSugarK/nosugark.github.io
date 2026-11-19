import { animate, stagger, inView, scroll, springValue, EmblaCarousel, Lenis, NumberFlow, trailingCursor } from './vendor/motion-lab-vendor.js';

(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const transforms = (from, to = 'none') => [{transform: from}, {transform: to}];
  const fade = [{opacity: 0}, {opacity: 1}];
  const rise = [{opacity: 0, transform: 'translateY(24px)'}, {opacity: 1, transform: 'none'}];
  const clamp = value => Math.max(0, Math.min(1, value));
  const motionDocs = name => `https://motion.dev/docs/${name}`;
  const inspira = (title, path) => [`Inspira UI · ${title}（源码移植）`, `https://github.com/unovue/inspira-ui/blob/eec920b047589058b4b02ba64deb614869e7237a/app/components/inspira/ui/${path}.vue`];
  const primitives = (title, name) => [`Motion Primitives · ${title}（源码移植）`, `https://github.com/ibelick/motion-primitives/blob/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core/${name}.tsx`];
  const engine = (title, doc) => [`Motion · ${title}（原包 API）`, motionDocs(doc)];
  const textEffect = primitives('TextEffect', 'text-effect');
  const scrollSource = engine('scroll()', 'scroll');
  const sources = {
    entrance: {
      0: engine('easing', 'easing-functions'), 1: engine('spring', 'spring'), 2: textEffect, 3: textEffect,
      4: engine('stagger()', 'stagger'), 5: inspira('BlurReveal', 'blur-reveal/BlurReveal'),
      7: primitives('TextShimmer', 'text-shimmer')
    },
    text: {
      0: textEffect, 1: primitives('TextScramble', 'text-scramble'),
      2: inspira('MorphingText', 'morphing-text/MorphingText'), 3: inspira('TypewriterText', 'typewriter-text/TypewriterText')
    },
    scroll: {
      0: ['Lenis（原包）', 'https://github.com/darkroomengineering/lenis'],
      1: engine('inView()', 'inview'), 2: scrollSource, 3: scrollSource, 4: scrollSource,
      5: scrollSource, 6: scrollSource, 9: inspira('Marquee', 'marquee/Marquee')
    },
    pointer: {
      2: primitives('Magnetic', 'magnetic'), 6: ['cursor-effects · trailingCursor（原包）', 'https://github.com/tholman/cursor-effects#trailingcursor'],
      7: primitives('Tilt', 'tilt'), 10: inspira('CardSpotlight', 'card-spotlight/CardSpotlight')
    },
    detail: {1: ['Embla Carousel（原包）', 'https://www.embla-carousel.com/get-started/javascript/']},
    feedback: {
      0: inspira('RippleButton', 'ripple-button/RippleButton'),
      2: ['NumberFlow（原包）', 'https://number-flow.barvian.me/']
    }
  };

  function create(tag, className = '', text = '') {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    if (tag === 'button') element.type = 'button';
    return element;
  }

  const groups = {
    entrance: [
      ({stage, run, upstream}) => {
        const markers = ['匀速 linear', '减速 ease-out'].map(name => {
          const track = create('div', 'ml-track');
          const marker = create('div', 'ml-marker', '●');
          track.append(marker);
          stage.append(create('span', '', name), track);
          return [marker, track];
        });
        run('同时出发', () => markers.forEach(([marker, track], index) => upstream(marker,
          {x: [0, track.clientWidth - marker.offsetWidth]}, {duration: 1.1, ease: index ? 'easeOut' : 'linear'})));
      },
      ({stage, button, run, upstream, listen, motion}) => {
        const track = create('div', 'ml-spring-track');
        const sample = button('拖我', 'ml-spring-handle');
        track.append(sample);
        stage.append(track);
        let start;
        let offset = 0;
        let release;
        function bounce(from) {
          release?.stop();
          sample.style.translate = '';
          release = upstream(sample, {x: [from, 0]}, {type: 'spring', stiffness: 240, damping: 13, mass: 1});
        }
        listen(sample, 'pointerdown', event => {
          if (!motion() || !event.isPrimary || event.button !== 0) return;
          release?.stop();
          sample.style.transform = '';
          sample.setPointerCapture(event.pointerId);
          start = {x: event.clientX, id: event.pointerId};
          offset = 0;
        });
        listen(sample, 'pointermove', event => {
          if (start?.id !== event.pointerId) return;
          const limit = (track.clientWidth - sample.offsetWidth) / 2;
          offset = Math.min(limit, Math.max(-limit, event.clientX - start.x));
          sample.style.translate = `${offset}px 0`;
        });
        listen(sample, 'lostpointercapture', () => {
          start = undefined;
          bounce(offset);
        });
        listen(sample, 'click', event => { if (!event.detail) bounce(-64); });
        run('从左侧释放', () => bounce(-Math.min(120, (track.clientWidth - sample.offsetWidth) / 2)), false);
      },
      ({row, run, upstream}) => {
        const samples = row(['淡入', '滑入', '缩放']);
        const variants = [{}, {y: [20, 0]}, {scale: [0, 1]}];
        run('一起播放', () => samples.forEach((sample, index) => upstream(sample, {opacity: [0, 1], ...variants[index]}, {duration: .75})));
      },
      ({stage, run, upstream}) => {
        const lines = ['从第一行', '看到第二行'].map(text => {
          const mask = create('div', 'ml-clip');
          const line = create('div', 'ml-display', text);
          mask.append(line);
          stage.append(mask);
          return line;
        });
        run('逐行播放', () => upstream(lines, {opacity: [0, 1], y: ['105%', '0%']}, {duration: .65, delay: stagger(.1)}));
      },
      ({row, run, upstream}) => {
        const cards = row(['01', '02', '03']);
        run('错开播放', () => upstream(cards, {opacity: [0, 1], y: [24, 0]}, {duration: .48, delay: stagger(.17)}));
      },
      ({stage, run, upstream}) => {
        const sample = create('div', 'ml-display', '从模糊到清晰');
        stage.append(sample);
        run('播放显现', () => upstream(sample, {opacity: [0, 1], filter: ['blur(20px)', 'blur(0px)'], y: [20, 0]}, {duration: 1, ease: 'easeInOut'}));
      },
      ({tile, run, play}) => {
        const cover = tile('封面');
        run('移开遮罩', () => play(cover, [{clipPath: 'inset(0 100% 0 0)'}, {clipPath: 'inset(0)'}], {duration: 800}));
      },
      ({stage, run, play}) => {
        const sample = create('div', 'ml-display ml-shimmer', 'LIGHT / 流光');
        sample.style.setProperty('--ml-shimmer-spread', `${sample.textContent.length * 2}px`);
        stage.append(sample);
        run('扫过一次', () => play(sample, [{backgroundPosition: '100% center'}, {backgroundPosition: '0% center'}], {duration: 2000, easing: 'linear'}));
      }
    ],
    text: ['character', 'scramble', 'morph', 'type'].map(kind => context => {
      const {stage, run, upstream, motion, later} = context;
      if (kind === 'morph') return morphingText(context);
      if (kind === 'type') return typewriter(context);
      const words = kind === 'scramble' ? 'SIGNAL FOUND' : '每个字都有节奏';
      const sample = create('div', 'ml-display', words);
      stage.append(sample);
      sample.setAttribute('aria-label', words);
      sample.setAttribute('role', 'img');
      if (kind === 'character') {
        sample.replaceChildren(...Array.from(words, char => create('span', '', char)));
        Array.from(sample.children).forEach(char => char.setAttribute('aria-hidden', 'true'));
        run('逐字播放', () => upstream(Array.from(sample.children), {opacity: [0, 1], y: [20, 0]}, {duration: .45, delay: stagger(.065)}));
        return;
      }
      const visual = create('span', '', words);
      visual.setAttribute('aria-hidden', 'true');
      sample.replaceChildren(visual);
      run('开始解码', () => {
        if (!motion()) { visual.textContent = words; return; }
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const steps = .8 / .04;
        let step = 0;
        function update() {
          const progress = step / steps;
          visual.textContent = Array.from(words, (char, index) => char === ' ' || progress * words.length > index
            ? char : characters[Math.floor(Math.random() * characters.length)]).join('');
          if (step++ < steps) later(update, 40);
          else visual.textContent = words;
        }
        update();
      });
    }),
    scroll: ['smooth', 'trigger', 'linked', 'parallax', 'sticky', 'zoom', 'sequence', 'horizontal', 'snap', 'marquee'].map(kind => context => scrolling(kind, context)),
    pointer: ['hover', 'menu', 'magnet', 'rotate', 'cursor', 'background', 'trail', 'tilt', 'reveal', 'tooltip', 'spot'].map(kind => context => pointing(kind, context)),
    detail: [
      ({stage, button, run, play}) => {
        const product = button('◈', 'ml-product');
        product.setAttribute('aria-label', '切换商品缩略图与详情');
        product.setAttribute('aria-expanded', 'false');
        const toggle = () => {
          const before = product.getBoundingClientRect();
          product.getAnimations().forEach(animation => animation.cancel());
          const expanded = product.classList.toggle('ml-expanded');
          product.setAttribute('aria-expanded', expanded);
          stage.querySelector('.ml-caption').textContent = expanded ? '详情 · 雾蓝款' : '缩略图 · 雾蓝款';
          const after = product.getBoundingClientRect();
          play(product, transforms(`translate(${before.left - after.left}px, ${before.top - after.top}px) scale(${before.width / after.width}, ${before.height / after.height})`));
        };
        product.addEventListener('click', toggle);
        stage.append(product, create('span', 'ml-caption', '缩略图 · 雾蓝款'));
        run('切换缩略图 / 详情', toggle, false);
      },
      carousel,
      ({stage, button, play}) => {
        const strip = create('div', 'ml-actions');
        strip.setAttribute('role', 'tablist');
        strip.setAttribute('aria-label', '商品详情');
        const tabs = ['规格', '配送'].map(name => button(name));
        const panels = ['雾蓝色 · 直径 42 毫米', '预计 2 天内发货'].map((text, index) => {
          const panel = create('div', 'ml-tile', text);
          panel.id = `ml-details-panel-${index}`;
          panel.tabIndex = 0;
          panel.setAttribute('role', 'tabpanel');
          panel.setAttribute('aria-labelledby', `ml-details-tab-${index}`);
          return panel;
        });
        function select(index, focus = false) {
          tabs.forEach((tab, position) => {
            tab.setAttribute('aria-selected', position === index);
            tab.tabIndex = position === index ? 0 : -1;
            panels[position].hidden = position !== index;
          });
          if (focus) { tabs[index].focus(); play(panels[index], fade); }
        }
        tabs.forEach((tab, index) => {
          tab.id = `ml-details-tab-${index}`;
          tab.setAttribute('role', 'tab');
          tab.setAttribute('aria-controls', panels[index].id);
          tab.onclick = () => select(index, true);
          tab.onkeydown = event => {
            const destination = {ArrowLeft: 1 - index, ArrowRight: 1 - index, Home: 0, End: 1}[event.key];
            if (destination !== undefined) { event.preventDefault(); select(destination, true); }
          };
        });
        strip.append(...tabs);
        stage.append(strip, ...panels);
        select(0);
      },
      ({stage, button}) => {
        const icon = button('', 'ml-icon');
        icon.setAttribute('aria-label', '切换菜单图标');
        icon.setAttribute('aria-pressed', 'false');
        icon.append(...Array.from({length: 3}, () => create('span')));
        icon.onclick = () => icon.setAttribute('aria-pressed', icon.getAttribute('aria-pressed') === 'false');
        stage.append(icon);
      }
    ],
    feedback: [
      ({stage, button, play, motion}) => {
        const sample = button('', 'ml-ripple');
        sample.append(create('span', 'ml-ripple-label', '点这里'));
        sample.onclick = event => {
          if (!motion()) return;
          const rect = sample.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const wave = create('span', 'ml-wave');
          wave.style.width = wave.style.height = `${size}px`;
          wave.style.left = `${(event.detail ? event.clientX - rect.left : rect.width / 2) - size / 2}px`;
          wave.style.top = `${(event.detail ? event.clientY - rect.top : rect.height / 2) - size / 2}px`;
          sample.append(wave);
          const animation = play(wave, [{scale: 0, opacity: 1}, {scale: 2, opacity: 0}], {duration: 600});
          if (animation) animation.onfinish = () => wave.remove();
          else wave.remove();
        };
        stage.append(sample);
      },
      ({stage, button, status, play, later}) => {
        const sample = button('加入购物袋');
        stage.append(sample);
        let added = false;
        sample.onclick = () => {
          if (added) return;
          added = true;
          sample.textContent = '✓ 已加入';
          status('模拟加购成功，没有发起请求。');
          play(sample, transforms('scale(.92)'));
          later(() => { added = false; sample.textContent = '加入购物袋'; }, 1400);
        };
      },
      ({stage, run, status, motion}) => {
        const number = new NumberFlow();
        number.className = 'ml-count';
        number.animated = motion();
        number.respectMotionPreference = false;
        stage.append(number);
        number.update(98);
        const change = count => {
          number.update(count);
          status(`购物袋有 ${count} 件`);
        };
        run('数量 −1', () => change(Math.max(0, number.value - 1)), false);
        run('数量 +1', () => change(number.value + 1), false);
      },
      ({stage, run, play, status, later}) => {
        const toast = create('div', 'ml-toast', '✓ 已复制（模拟）');
        toast.hidden = true;
        toast.setAttribute('aria-hidden', 'true');
        stage.append(toast);
        run('模拟复制链接', () => {
          toast.hidden = false;
          play(toast, rise);
          status('已显示轻提示；并未修改剪贴板。');
          later(() => { toast.hidden = true; }, 2400);
        });
      },
      context => dialogDemo(context, true),
      ({row, run, play}) => {
        const cards = row(['01', '02', '03']);
        const grid = cards[0].parentElement;
        run('第一张挪到最后', () => {
          const first = Array.from(grid.children, card => [card, card.getBoundingClientRect()]);
          grid.append(grid.firstElementChild);
          first.forEach(([card, before]) => {
            const after = card.getBoundingClientRect();
            play(card, transforms(`translate(${before.left - after.left}px, ${before.top - after.top}px)`));
          });
        });
      }
    ],
    checkout: [
      ({stage, play}) => {
        ['什么时候发货？', '可以退换吗？'].forEach((title, index) => {
          const details = create('details', 'ml-accordion');
          const answer = create('p', '', index ? '这是退换条款的示意。' : '通常在两个工作日内发出。');
          details.append(create('summary', '', title), answer);
          details.ontoggle = () => { if (details.open) play(answer, fade); };
          stage.append(details);
        });
      },
      ({stage, run, later, status, play}) => {
        const card = create('div', 'ml-load', '商品卡 · 雾蓝旋钮');
        stage.append(card);
        run('模拟重新加载', () => {
          card.setAttribute('aria-busy', 'true');
          card.replaceChildren(create('span'), create('span'), create('span'));
          status('正在加载示例…');
          later(() => {
            card.textContent = '商品卡 · 雾蓝旋钮';
            card.setAttribute('aria-busy', 'false');
            status('加载完成。');
            play(card, fade);
          }, 1200);
        });
      },
      context => dialogDemo(context, false),
      ({stage, button, play, status}) => {
        const form = create('form', 'ml-form');
        const label = create('label', '', '模拟邮编（6 位数字）');
        const field = create('input');
        field.inputMode = 'numeric';
        field.setAttribute('aria-describedby', stage.id + '-status');
        label.append(field);
        const submit = button('校验');
        submit.type = 'submit';
        form.append(label, submit);
        field.oninput = () => { field.removeAttribute('aria-invalid'); status(''); };
        form.onsubmit = event => {
          event.preventDefault();
          if (/^\d{6}$/.test(field.value.trim())) { status('格式正确。'); return; }
          field.setAttribute('aria-invalid', 'true');
          status('邮编需要 6 位数字，例如 430000。');
          field.focus();
          play(field, [0, -7, 6, -4, 0].map(x => ({transform: `translateX(${x}px)`})), {duration: 320});
        };
        stage.append(form);
      },
      ({stage, run, play}) => {
        const heading = create('div', 'ml-display', '购物袋');
        const summary = create('div', 'ml-caption', '1 件商品 · 雾蓝旋钮');
        heading.setAttribute('role', 'heading');
        heading.setAttribute('aria-level', '4');
        heading.tabIndex = -1;
        stage.append(heading, summary);
        let done = false;
        run('切换流程步骤', () => {
          done = !done;
          heading.textContent = done ? '订单确认' : '购物袋';
          summary.textContent = done ? '模拟订单已确认 · 未发起支付' : '1 件商品 · 雾蓝旋钮';
          stage.dataset.tone = Number(done);
          heading.focus({preventScroll: true});
          play(stage, [{opacity: .25, transform: `translateX(${done ? 22 : -22}px)`}, {opacity: 1, transform: 'none'}]);
        });
      }
    ]
  };

  function morphingText({stage, run, upstream, status}) {
    const words = ['轻装出发', '慢慢发现', '保留好奇'];
    const filterId = stage.id + '-threshold';
    stage.insertAdjacentHTML('beforeend', `<svg class="ml-filter" aria-hidden="true"><defs><filter id="${filterId}"><feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140"/></filter></defs></svg>`);
    const sample = create('div', 'ml-display ml-morph');
    sample.setAttribute('aria-hidden', 'true');
    sample.style.filter = `url(#${filterId}) blur(.6px)`;
    const old = create('span', '', words[0]);
    const next = create('span');
    sample.append(old, next);
    stage.append(sample);
    let index = 0;
    function render(fraction) {
      const paint = (span, amount) => {
        span.style.filter = `blur(${Math.min(8 / amount - 8, 100)}px)`;
        span.style.opacity = amount ** .4;
      };
      paint(old, 1 - fraction);
      paint(next, fraction);
    }
    run('变成下一个词', () => {
      old.textContent = words[index];
      index = (index + 1) % words.length;
      next.textContent = words[index];
      status(words[index]);
      if (!upstream(0, 1, {duration: 1.5, ease: 'linear', onUpdate: render})) render(1);
    });
  }

  function typewriter({stage, run, motion, later, status}) {
    const words = ['你好，动效。', '先体验，再动手。'];
    const sample = create('div', 'ml-display ml-typewriter');
    const text = create('span', '', words[0]);
    sample.append(text, create('span', 'ml-caret', '|'));
    sample.setAttribute('aria-hidden', 'true');
    stage.append(sample);
    run('打字、擦除、换一句', () => {
      if (!motion()) { text.textContent = words[1]; status(words[1]); return; }
      let index = 0;
      let deleting = false;
      text.textContent = '';
      function step() {
        if (deleting) {
          text.textContent = text.textContent.slice(0, -1);
          if (text.textContent) { later(step, 42); return; }
          index++;
          deleting = false;
          later(step, 240);
        } else if (text.textContent.length < words[index].length) {
          text.textContent += words[index][text.textContent.length];
          later(step, 82);
        } else {
          status(words[index]);
          if (index + 1 < words.length) { deleting = true; later(step, 900); }
        }
      }
      step();
    });
  }

  function carousel({stage, run, signal, status, motion}) {
    const viewport = create('div', 'ml-carousel');
    const rail = create('div', 'ml-carousel-rail');
    const names = ['正面', '侧面', '背面'];
    viewport.setAttribute('role', 'region');
    viewport.setAttribute('aria-label', '雾蓝旋钮图集');
    names.forEach((name, index) => {
      const panel = create('div', 'ml-tile');
      const dial = create('span', 'ml-gallery-dial');
      dial.setAttribute('aria-hidden', 'true');
      panel.dataset.tone = index;
      panel.append(dial, create('span', '', `0${index + 1} · ${name}`));
      rail.append(panel);
    });
    viewport.append(rail);
    stage.append(viewport);
    const embla = EmblaCarousel(viewport, {loop: true, watchDrag: motion()});
    signal.addEventListener('abort', () => embla.destroy(), {once: true});
    embla.on('select', () => status(`第 ${embla.selectedScrollSnap() + 1} 张，共 ${names.length} 张`));
    run('上一张', () => embla.scrollPrev(!motion()), false);
    run('下一张', () => embla.scrollNext(!motion()), false);
  }

  function dialogDemo({stage, run, button, status, play, listen}, drawer) {
    const panel = create('dialog', drawer ? 'ml-drawer' : '');
    const title = create('strong', '', drawer ? '购物袋 · 1 件' : '确认提交模拟订单？');
    title.id = stage.id + '-dialog';
    panel.setAttribute('aria-labelledby', title.id);
    const close = button(drawer ? '关闭' : '取消');
    const confirm = button('确认');
    close.onclick = () => panel.close();
    confirm.onclick = () => { panel.close(); status('已确认（仅演示）。'); };
    const actions = create('div', 'ml-actions');
    actions.append(close);
    if (!drawer) actions.append(confirm);
    panel.append(title, create('p', '', '这只是本地实验，不会购买或发送数据。'), actions);
    stage.append(panel);
    const opener = run(drawer ? '打开购物袋' : '打开确认弹窗', () => {
      opener.focus({preventScroll: true});
      panel.showModal();
      play(panel, drawer ? transforms('translateX(100%)') : [{opacity: .2, transform: 'scale(.94)'}, {opacity: 1, transform: 'none'}]);
    });
    listen(panel, 'close', () => opener.focus({preventScroll: true}));
  }

  function scrolling(kind, {stage, run, play, listen, motion, status, signal}) {
    if (kind === 'marquee') {
      const viewport = create('div', 'ml-marquee');
      const names = ['设计', '原型', '开发', '测试', '上线'];
      for (let repeat = 0; repeat < 4; repeat++) {
        const group = create('div', 'ml-marquee-group');
        if (repeat) group.setAttribute('aria-hidden', 'true');
        group.append(...names.map(name => create('span', 'ml-marquee-item', name)));
        viewport.append(group);
      }
      stage.append(viewport);
      const toggle = run('播放跑马灯', () => {
        if (!motion()) { status('先在实验台上方勾选播放动态效果。'); return; }
        viewport.classList.add('ml-marquee-started');
        const running = viewport.classList.toggle('ml-marquee-running');
        toggle.textContent = running ? '暂停' : '继续播放';
      }, false);
      return;
    }
    const port = create('div', 'ml-port');
    port.tabIndex = 0;
    port.setAttribute('role', 'region');
    port.setAttribute('aria-label', '实验滚动区');
    stage.append(port);
    if (kind === 'horizontal' || kind === 'snap') {
      port.classList.add('ml-horizontal');
      if (kind === 'snap') port.classList.add('ml-snap');
      ['01 · 正面', '02 · 侧面', '03 · 背面', '04 · 配件'].forEach(text => port.append(create('div', 'ml-tile', text)));
      const move = direction => port.scrollBy({left: direction * port.firstChild.offsetWidth, behavior: motion() ? 'smooth' : 'instant'});
      run('向左', () => move(-1));
      run('向右', () => move(1));
      return;
    }
    const slider = create('input');
    slider.type = 'range';
    slider.min = 0;
    slider.max = 100;
    slider.value = 0;
    const label = create('label', 'ml-slider', '手动滚动');
    label.append(slider);
    stage.append(label);
    const cover = create('div', 'ml-scroll-cover', kind === 'sticky' ? '01 · 认识产品' : '');
    const sections = ['01 · 认识产品', '02 · 看见细节', '03 · 完成体验'].map(text => create('div', 'ml-step', text));
    if (kind === 'smooth') {
      const content = create('div');
      content.append(...sections);
      port.append(content);
      const lenis = motion() ? new Lenis({wrapper: port, content, autoRaf: true, smoothWheel: false}) : null;
      if (lenis) signal.addEventListener('abort', () => lenis.destroy(), {once: true});
      run('Lenis 平滑跳到底部', () => lenis ? lenis.scrollTo('bottom', {duration: 1.2}) : port.scrollTo(0, port.scrollHeight));
      run('瞬间跳到底部', () => lenis ? lenis.scrollTo('bottom', {immediate: true}) : port.scrollTo(0, port.scrollHeight));
      run('瞬间回到顶部', () => lenis ? lenis.scrollTo(0, {immediate: true}) : port.scrollTo(0, 0));
    } else if (kind === 'trigger') {
      port.append(...sections);
      if ('IntersectionObserver' in window) {
        sections[1].classList.add('ml-trigger');
        const stop = inView(sections[1], () => {
          sections[1].classList.add('ml-triggered');
          play(sections[1], rise, {duration: 900});
          status('已触发：停住滑块也会播完。');
        }, {root: port, amount: .55});
        signal.addEventListener('abort', stop, {once: true});
      }
    } else {
      port.append(cover, ...sections);
    }
    const far = create('span', 'ml-far', '远山');
    const near = create('span', 'ml-near', kind === 'parallax' ? '近景' : '◈');
    const image = create('img', 'ml-frame');
    const frames = kind === 'sequence' ? Array.from({length: 12}, (_, index) => 'data:image/svg+xml,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="84" height="84" viewBox="0 0 84 84"><circle cx="42" cy="42" r="34" fill="#253d75" stroke="#a7c2ff" stroke-width="4"/><path d="M42 20v13" stroke="white" stroke-width="5" stroke-linecap="round" transform="rotate(${index * 30} 42 42)"/></svg>`)) : [];
    if (kind === 'parallax') cover.append(far, near);
    if (kind === 'linked' || kind === 'zoom') cover.append(near);
    if (kind === 'sequence') cover.append(image);
    function update(progress) {
      const animated = motion() ? progress : 0;
      slider.value = progress * 100;
      if (kind === 'sticky') cover.textContent = sections[Math.min(2, Math.floor(progress * 3))].textContent;
      if (kind === 'linked') near.style.transform = `translateX(${animated * (cover.clientWidth - near.offsetWidth)}px)`;
      if (kind === 'parallax') {
        far.style.transform = `translateX(${animated * 36}px)`;
        near.style.transform = `translateX(${-animated * 96}px)`;
      }
      if (kind === 'zoom') near.style.transform = `scale(${1 + animated * 2.2})`;
      if (kind === 'sequence') {
        const index = Math.round((frames.length - 1) * animated);
        image.src = frames[index];
        image.alt = `旋钮 · 第 ${index + 1} 帧，共 ${frames.length} 帧`;
      }
    }
    const stop = scroll(update, {container: port});
    signal.addEventListener('abort', stop, {once: true});
    listen(slider, 'input', () => { port.scrollTop = slider.value / 100 * (port.scrollHeight - port.clientHeight); });
    if (kind === 'trigger') run('回到起点并重置', () => stage.dispatchEvent(new Event('ml-reset')));
    update(0);
  }

  function pointing(kind, {stage, button, play, status, motion, listen, signal}) {
    if (kind === 'menu') {
      const details = create('details', 'ml-menu');
      const choices = create('div', 'ml-actions');
      ['雾蓝', '暖白'].forEach(name => {
        const choice = button(name);
        choice.onclick = () => { details.open = false; details.firstChild.focus(); status(`已选：${name}`); };
        choices.append(choice);
      });
      details.append(create('summary', '', '选择颜色'), choices);
      details.ontoggle = () => { if (details.open) play(choices, rise); };
      stage.append(details);
      return;
    }
    if (kind === 'trail') {
      const area = create('div', 'ml-trail', '在框里移动鼠标，观察多个光标逐个跟上。');
      stage.append(area);
      if (motion()) {
        const trail = trailingCursor({element: area, particles: 12, rate: .37});
        signal.addEventListener('abort', () => trail?.destroy(), {once: true});
      }
      return;
    }
    const labels = {hover: '悬停或聚焦', magnet: '磁吸', rotate: '➜', cursor: '准星光标', background: '变色背景', tilt: '◈ 倾斜卡片', reveal: '产品卡片', tooltip: 'ⓘ', spot: '跟随的亮斑'};
    const zone = button('', `ml-pointer ml-${kind}`);
    if (kind === 'spot') zone.append(create('span', 'ml-spot-gradient'));
    const face = create('span', 'ml-face', labels[kind]);
    zone.append(face);
    stage.append(zone);
    let alternate = false;
    let springX;
    let springY;
    if (motion() && (kind === 'magnet' || kind === 'tilt')) {
      const config = kind === 'magnet' ? {stiffness: 26.7, damping: 4.1, mass: .2} : {stiffness: 160, damping: 20};
      springX = springValue(0, config);
      springY = springValue(0, config);
      const render = () => {
        face.style.transform = kind === 'magnet'
          ? `translate(${springX.get()}px, ${springY.get()}px)`
          : `perspective(1000px) rotateX(${springY.get() * 30}deg) rotateY(${springX.get() * -30}deg)`;
      };
      const stopX = springX.on('change', render);
      const stopY = springY.on('change', render);
      signal.addEventListener('abort', () => { stopX(); stopY(); springX.destroy(); springY.destroy(); }, {once: true});
    }
    function update(x, y) {
      const dx = x - .5, dy = y - .5;
      const active = motion();
      if (kind === 'magnet' && springX) {
        const distanceX = dx * zone.offsetWidth;
        const distanceY = dy * zone.offsetHeight;
        const range = 100;
        const attraction = .6 * Math.max(0, 1 - Math.hypot(distanceX, distanceY) / range);
        springX.set(distanceX * attraction);
        springY.set(distanceY * attraction);
      }
      if (kind === 'rotate' && active) face.style.transform = `rotate(${Math.atan2(dy * zone.offsetHeight, dx * zone.offsetWidth)}rad)`;
      if (kind === 'tilt' && springX) { springX.set(dx); springY.set(dy); }
      if (kind === 'background' && active) zone.style.setProperty('--ml-hue', 200 + x * 135);
      if (kind === 'spot' && active) {
        zone.style.setProperty('--ml-x', `${x * zone.clientWidth}px`);
        zone.style.setProperty('--ml-y', `${y * zone.clientHeight}px`);
        zone.classList.add('ml-lit');
      }
    }
    listen(zone, 'pointermove', event => {
      const rect = zone.getBoundingClientRect();
      update(clamp((event.clientX - rect.left) / rect.width), clamp((event.clientY - rect.top) / rect.height));
    });
    listen(zone, 'pointerleave', () => {
      if (springX) { springX.set(0); springY.set(0); }
      else face.style.transform = '';
      zone.classList.remove('ml-lit');
    });
    if (kind === 'reveal' || kind === 'tooltip') {
      const bubble = create('span', 'ml-bubble', kind === 'reveal' ? '雾蓝款 · 金属外壳' : '这是关于样品的说明');
      bubble.id = stage.id + '-bubble';
      zone.setAttribute('aria-describedby', bubble.id);
      zone.setAttribute('aria-pressed', 'false');
      if (kind === 'tooltip') { zone.setAttribute('aria-label', '关于样品'); bubble.setAttribute('role', 'tooltip'); }
      zone.append(bubble);
      zone.onkeydown = event => { if (event.key === 'Escape') { zone.setAttribute('aria-pressed', 'false'); zone.classList.add('ml-dismissed'); } };
      zone.onblur = zone.onpointerenter = () => zone.classList.remove('ml-dismissed');
    }
    zone.onclick = () => {
      alternate = !alternate;
      update(alternate ? .58 : .42, .25);
      zone.classList.remove('ml-dismissed');
      if (zone.hasAttribute('aria-pressed')) zone.setAttribute('aria-pressed', alternate);
      if (kind === 'hover') zone.classList.toggle('ml-hovered');
      if (kind === 'cursor') status('桌面试试移动鼠标；触屏没有系统光标。');
    };
  }

  document.querySelectorAll('.motion-lab[data-lab]').forEach((lab, index) => {
    const demos = groups[lab.dataset.lab];
    const rows = lab.nextElementSibling?.querySelectorAll('tbody tr') ?? [];
    if (!demos || rows.length !== demos.length) return;
    const picker = create('select');
    rows.forEach((row, position) => {
      const option = create('option', '', row.cells[0].textContent.trim());
      option.value = position;
      picker.append(option);
    });
    const selectorLabel = create('label', '', '选择实验');
    selectorLabel.append(picker);
    const toggle = create('input');
    toggle.type = 'checkbox';
    toggle.checked = !preference.matches;
    const motionLabel = create('label', 'ml-motion');
    motionLabel.append(toggle, '播放动态效果');
    const header = create('div', 'ml-header');
    header.append(selectorLabel, motionLabel);
    const credit = create('div', 'ml-source');
    const stage = create('div', 'ml-stage');
    stage.id = `ml-stage-${index}`;
    const actions = create('div', 'ml-actions');
    const message = create('div', 'ml-status');
    message.id = stage.id + '-status';
    message.setAttribute('role', 'status');
    lab.append(header, credit, stage, actions, message);
    let controller;
    function mount() {
      controller?.abort();
      controller = new AbortController();
      const {signal} = controller;
      const animated = new Set();
      const upstreamAnimations = new Set();
      const timers = new Set();
      const clear = () => {
        animated.forEach(animation => animation.cancel());
        animated.clear();
        upstreamAnimations.forEach(animation => animation.stop());
        upstreamAnimations.clear();
        timers.forEach(clearTimeout);
        timers.clear();
      };
      signal.addEventListener('abort', clear, {once: true});
      stage.replaceChildren();
      actions.replaceChildren();
      actions.hidden = true;
      stage.removeAttribute('data-tone');
      stage.dataset.effect = picker.value;
      const source = sources[lab.dataset.lab]?.[picker.value];
      credit.textContent = '';
      if (source) {
        const link = create('a', '', source[0]);
        link.href = source[1];
        credit.append('实现来源：', link);
      } else {
        credit.textContent = '实现来源：原生教学示例，未按第三方组件复刻';
      }
      lab.dataset.motion = toggle.checked ? 'on' : 'off';
      const status = text => { message.textContent = text; };
      status('');
      const listen = (element, name, callback, options) => element.addEventListener(name, callback, {...options, signal});
      listen(stage, 'ml-reset', () => { mount(); actions.querySelector('button')?.focus(); });
      const button = (text, className = '') => create('button', className, text);
      const tile = text => stage.appendChild(create('div', 'ml-tile', text));
      demos[Number(picker.value)]({
        stage, button, tile, status, listen, signal,
        motion: () => toggle.checked,
        later(callback, time) {
          const id = setTimeout(() => { timers.delete(id); callback(); }, time);
          timers.add(id);
        },
        row(labels) {
          const grid = create('div', 'ml-row');
          const items = labels.map(text => create('div', 'ml-tile', text));
          grid.append(...items);
          stage.append(grid);
          return items;
        },
        run(text, action, reset = true) {
          const control = button(text);
          control.onclick = () => { if (reset) clear(); action(); };
          actions.append(control);
          actions.hidden = false;
          return control;
        },
        upstream(...args) {
          if (!toggle.checked) return;
          const animation = animate(...args);
          upstreamAnimations.add(animation);
          animation.then(() => upstreamAnimations.delete(animation), () => upstreamAnimations.delete(animation));
          return animation;
        },
        play(element, frames, options, replace = true) {
          if (!toggle.checked || !element.animate) return;
          if (replace) element.getAnimations().forEach(animation => animation.cancel());
          const animation = element.animate(frames, {duration: 480, easing: 'ease-out', fill: 'backwards', ...options});
          animated.add(animation);
          const forget = () => animated.delete(animation);
          animation.addEventListener('finish', forget, {once: true});
          animation.addEventListener('cancel', forget, {once: true});
          return animation;
        }
      });
    }
    picker.onchange = toggle.onchange = mount;
    preference.addEventListener('change', event => { toggle.checked = !event.matches; mount(); });
    mount();
  });
})();
