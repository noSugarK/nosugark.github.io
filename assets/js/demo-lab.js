/* 文章里的可交互示例区：three.js / GSAP / 组合 / WebGL。
   每张卡片把「示例」和紧随其后的代码块合成两个 Tab，可切换查看。
   由 front matter 的 demo_lab 开关按需加载；依赖走 CDN，失败时示例区降级，
   但代码 Tab 仍可复制。尊重系统「减少动态效果」偏好。 */
import { animatedSelect } from './animated-select.js';
import { makeExpandIcon, wireExpand } from './card-expand.js';

(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CDN = {
    three: 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js',
    gsap: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js'
  };
  const cache = {};

  const make = (tag, className = '', text = '') => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    if (tag === 'button') el.type = 'button';
    return el;
  };
  const btn = (text, onClick, pressed) => {
    const b = make('button', 'demo-btn', text);
    if (typeof pressed === 'boolean') b.setAttribute('aria-pressed', String(pressed));
    if (typeof onClick === 'function') b.addEventListener('click', onClick);
    return b;
  };
  const loadScript = src => {
    if (!cache[src]) {
      cache[src] = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => resolve();
        s.onerror = () => { delete cache[src]; reject(new Error('load failed: ' + src)); };
        document.head.appendChild(s);
      });
    }
    return cache[src];
  };
  const loadThree = () => import(/* @vite-ignore */ CDN.three);
  const loadGsap = async () => { await loadScript(CDN.gsap); return window.gsap; };
  const fallback = (stage, msg) => stage.replaceChildren(make('p', 'demo-fallback', msg));

  /* 加载期给舞台套一圈流光边框（参考 BorderTrail），依赖就绪后移除。
     减少动态偏好下只留静态提示，不转圈。 */
  const withTrail = async (stage, task) => {
    if (reduced) return task();
    stage.classList.add('is-loading');
    try { return await task(); }
    finally { stage.classList.remove('is-loading'); }
  };

  /* 把容器 + 紧随其后的代码块，组成一张带「示例 / 代码」Tab 的卡片 */
  function shell(root, title) {
    root.classList.add('demo-lab');
    const card = make('div', 'demo');

    /* 顶部只留一行：Tab 在左、标题居中、放大按钮在最右（标题下移到这行，省掉一行） */
    const head = make('div', 'demo-head');
    const tabs = make('div', 'demo-tabs');
    tabs.setAttribute('role', 'tablist');
    const tabDemo = make('button', 'demo-tab', '示例');
    const tabCode = make('button', 'demo-tab', '代码');
    [tabDemo, tabCode].forEach((tab, i) => {
      tab.type = 'button';
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', String(i === 0));
      tab.tabIndex = i === 0 ? 0 : -1;
    });
    tabs.append(tabDemo, tabCode);
    const titleEl = make('span', 'demo-title', title);
    const actions = make('div', 'demo-actions');
    const expand = make('button', 'demo-icon');
    makeExpandIcon(expand);
    actions.append(expand);
    head.append(tabs, titleEl, actions);

    const viewDemo = make('div', 'demo-view');
    viewDemo.setAttribute('role', 'tabpanel');
    const stage = make('div', 'demo-stage');
    /* 底部一行：控件在左，状态注释靠右，不单独占一行 */
    const foot = make('div', 'demo-foot');
    const controls = make('div', 'demo-controls');
    const status = make('p', 'demo-status');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    foot.append(controls, status);
    viewDemo.append(stage, foot);

    const viewCode = make('div', 'demo-view');
    viewCode.setAttribute('role', 'tabpanel');
    viewCode.hidden = true;

    /* 搬移 site.js 已增强过的代码块（含复制按钮）到代码 Tab。
       两种实际结构都要认：
       - 本地 preview（mistune）：<div class="codeblock"><pre>…</pre></div>
       - 真实 Jekyll（Rouge）：<div class="language-x highlighter-rouge">
           <div class="highlight"><div class="codeblock"><pre class="highlight">…</pre></div></div></div>
       后者最外层不是 .codeblock / PRE，只看类名会漏掉，代码就单独留在卡片外。 */
    const codeHost = root.nextElementSibling;
    if (codeHost && (codeHost.tagName === 'PRE' ||
        codeHost.classList.contains('codeblock') ||
        codeHost.querySelector('.codeblock, pre'))) {
      viewCode.append(codeHost);
    } else {
      viewCode.append(make('p', 'demo-fallback', '下方代码块即本例对应源码。'));
    }

    card.append(head, viewDemo, viewCode);
    root.replaceChildren(card);

    const select = which => {
      const showCode = which === 'code';
      tabDemo.setAttribute('aria-selected', String(!showCode));
      tabCode.setAttribute('aria-selected', String(showCode));
      tabDemo.tabIndex = showCode ? -1 : 0;
      tabCode.tabIndex = showCode ? 0 : -1;
      viewDemo.hidden = showCode;
      viewCode.hidden = !showCode;
    };
    tabDemo.addEventListener('click', () => select('demo'));
    tabCode.addEventListener('click', () => select('code'));
    tabs.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const next = tabDemo.getAttribute('aria-selected') === 'true' ? tabCode : tabDemo;
      next.focus();
      next.click();
    });

    return {root, card, expand, stage, controls, status};
  }

  async function mountThree(ctx) {
    const {card, expand, stage, controls, status} = ctx;
    const say = text => { status.textContent = text; };
    let THREE;
    try { THREE = await withTrail(stage, () => loadThree()); }
    catch { fallback(stage, '无法加载 three.js（CDN 被拦截或离线）。切到「代码」Tab 可复制到本地运行。'); return; }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(2.6, 1.9, 3.2);
    camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    stage.append(renderer.domElement);

    const palette = [0xE1261C, 0xF5C400, 0x1B4D9E];
    let colorIndex = 0;
    const material = new THREE.MeshStandardMaterial({color: palette[0], roughness: .55, metalness: .1});
    const cube = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), material);
    cube.add(new THREE.LineSegments(new THREE.EdgesGeometry(cube.geometry), new THREE.LineBasicMaterial({color: 0x16161A})));
    scene.add(cube, new THREE.AmbientLight(0xffffff, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(3, 4, 5);
    scene.add(key);

    let spinning = !reduced, angle = 0, dragging = false, lastX = 0, lastY = 0;
    const resize = () => {
      const w = Math.max(stage.clientWidth, 1), h = Math.max(stage.clientHeight, 1);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(stage);
    resize();

    const loop = () => {
      if (spinning && !dragging) { angle += 0.006; cube.rotation.y = angle; }
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    };
    loop();

    const canvas = renderer.domElement;
    canvas.style.touchAction = 'none';
    canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => {
      if (!dragging) return;
      cube.rotation.y += (e.clientX - lastX) * 0.01;
      cube.rotation.x += (e.clientY - lastY) * 0.01;
      lastX = e.clientX; lastY = e.clientY;
      say('拖动旋转');
    });
    canvas.addEventListener('pointerup', () => { dragging = false; });
    canvas.addEventListener('pointercancel', () => { dragging = false; });

    const playBtn = btn(spinning ? '暂停旋转' : '自动旋转', () => {
      spinning = !spinning;
      playBtn.textContent = spinning ? '暂停旋转' : '自动旋转';
      playBtn.setAttribute('aria-pressed', String(spinning));
    }, spinning);
    const colorBtn = btn('换颜色', () => {
      colorIndex = (colorIndex + 1) % palette.length;
      material.color.setHex(palette[colorIndex]);
      say(['红', '黄', '蓝'][colorIndex] + '色');
    });
    const resetBtn = btn('重置视角', () => { cube.rotation.set(0, 0, 0); angle = 0; say('已重置'); });
    controls.append(playBtn, colorBtn, resetBtn);
    say(reduced ? '已暂停动态，可拖动' : '拖动旋转 · 可换色');
    wireExpand(card, expand, 'three.js · 可旋转立方体', resize);
  }

  async function mountGsap(ctx) {
    const {card, expand, stage, controls, status} = ctx;
    const say = text => { status.textContent = text; };
    let gsap;
    try { gsap = await withTrail(stage, () => loadGsap()); }
    catch { fallback(stage, '无法加载 GSAP（CDN 被拦截或离线）。切到「代码」Tab 可复制到本地运行。'); return; }

    const rail = make('div', 'demo-timeline');
    const boxes = ['图片', '标题', '说明', '按钮'].map(t => {
      const b = make('div', 'demo-box', t);
      rail.append(b);
      return b;
    });
    stage.append(rail);

    const slider = make('input');
    slider.type = 'range'; slider.min = '0'; slider.max = '1'; slider.step = '0.01'; slider.value = '0';
    slider.setAttribute('aria-label', '时间轴进度');
    const tl = gsap.timeline({paused: true, onUpdate: () => { slider.value = tl.progress(); }});
    const speed = animatedSelect(
      [{value: '1', label: '正常速度'}, {value: '0.5', label: '慢速'}, {value: '2', label: '快速'}],
      '1',
      value => tl.timeScale(Number(value)),
      '播放速度'
    );
    const label = make('label', '', '进度');
    label.append(slider);
    controls.append(label, speed);

    tl.from(boxes[0], {opacity: 0, y: 24, duration: .5})
      .from(boxes[1], {opacity: 0, y: 24, duration: .5}, '-=0.2')
      .from(boxes[2], {opacity: 0, y: 24, duration: .5}, '-=0.2')
      .from(boxes[3], {opacity: 0, scale: .6, duration: .4}, '-=0.2');
    if (reduced) tl.progress(1);
    else tl.play();

    const replay = btn('重播', () => { tl.restart(); say('重播'); });
    const toggle = btn(tl.paused() ? '播放' : '暂停', () => {
      if (tl.paused()) tl.play(); else tl.pause();
      toggle.textContent = tl.paused() ? '播放' : '暂停';
      toggle.setAttribute('aria-pressed', String(!tl.paused()));
    }, !tl.paused());
    controls.prepend(toggle, replay);
    slider.addEventListener('input', () => {
      tl.pause();
      toggle.textContent = '播放';
      toggle.setAttribute('aria-pressed', 'false');
      tl.progress(Number(slider.value));
      say('可倒放');
    });
    say(reduced ? '已到终态' : '拖进度可倒放');
    wireExpand(card, expand, 'GSAP · 时间轴与进度', () => {});
  }

  async function mountCombo(ctx) {
    const {card, expand, stage, controls, status} = ctx;
    const say = text => { status.textContent = text; };
    let THREE, gsap;
    try { [THREE, gsap] = await withTrail(stage, () => Promise.all([loadThree(), loadGsap()])); }
    catch { fallback(stage, '无法加载 three.js / GSAP（CDN 被拦截或离线）。切到「代码」Tab 可复制到本地运行。'); return; }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    stage.append(renderer.domElement);

    /* 一条展台隧道：相机随进度向前穿过 6 个包豪斯色块 */
    const palette = [0xE1261C, 0xF5C400, 0x1B4D9E, 0xE1261C, 0xF5C400, 0x1B4D9E];
    const blocks = palette.map((color, i) => {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 1.1, 1.1),
        new THREE.MeshStandardMaterial({color, roughness: .5})
      );
      m.position.set((i % 2 ? 1 : -1) * 1.15, ((i % 3) - 1) * 0.7, -1.5 - i * 2.4);
      m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), new THREE.LineBasicMaterial({color: 0x16161A})));
      scene.add(m);
      return m;
    });
    scene.add(new THREE.AmbientLight(0xffffff, 1.7));
    const light = new THREE.DirectionalLight(0xffffff, 2.2);
    light.position.set(2, 3, 5);
    scene.add(light);

    const resize = () => {
      const w = Math.max(stage.clientWidth, 1), h = Math.max(stage.clientHeight, 1);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(stage);
    resize();

    const slider = make('input');
    slider.type = 'range'; slider.min = '0'; slider.max = '1'; slider.step = '0.005'; slider.value = '0';
    slider.setAttribute('aria-label', '滚动进度');
    const label = make('label', '', '滚动');
    label.append(slider);
    const auto = btn('自动播放', null, false);
    controls.append(label, auto);

    let progress = 0, playing = !reduced;
    const apply = p => {
      progress = p;
      slider.value = p;
      /* GSAP 只改数值：相机沿 z 轴穿过隧道，并轻微左右摆动 */
      gsap.set(camera.position, {z: 5 - p * 16, x: Math.sin(p * Math.PI * 2) * 0.45, y: Math.cos(p * Math.PI) * 0.25});
      camera.lookAt(0, 0, camera.position.z - 4);
      blocks.forEach((b, i) => { b.rotation.y = p * Math.PI * 2 + i; b.rotation.x = p * 1.2; });
      const stop = Math.min(blocks.length, Math.floor(p * blocks.length) + 1);
      say(Math.round(p * 100) + '% · 第 ' + stop + '/' + blocks.length + ' 站');
    };
    const stopAuto = () => { playing = false; auto.textContent = '自动播放'; auto.setAttribute('aria-pressed', 'false'); };
    slider.addEventListener('input', () => { stopAuto(); apply(Number(slider.value)); });
    auto.addEventListener('click', () => {
      playing = !playing;
      auto.textContent = playing ? '暂停' : '自动播放';
      auto.setAttribute('aria-pressed', String(playing));
    });
    /* 鼠标停在框内时，滚轮交给框内动画：驱动镜头进度并阻止页面跟着滚。
       监听挂在 stage 上，放大后 stage 整块移进 dialog，行为自动沿用。
       走到进度边界仍往同方向滚时放行，避免用户被困在框里滚不动页面。 */
    stage.addEventListener('wheel', event => {
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1;
      const next = Math.max(0, Math.min(1, progress + event.deltaY * unit * 0.0009));
      if (Math.abs(next - progress) < 1e-6) return;
      event.preventDefault();
      stopAuto();
      apply(next);
    }, {passive: false});

    const loop = () => {
      if (playing) {
        let next = progress + 0.0016;
        if (next > 1) next = 0;
        apply(next);
      }
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    };
    apply(0);
    loop();
    say(reduced ? '框内滚动可查看' : '框内滚动驱动镜头');
    wireExpand(card, expand, '组合 · 滚动驱动相机', resize);
  }

  async function mountWebgl(ctx) {
    const {card, expand, stage, controls, status} = ctx;
    const say = text => { status.textContent = text; };
    const canvas = make('canvas');
    stage.append(canvas);
    const gl = canvas.getContext('webgl');
    if (!gl) { fallback(stage, '当前浏览器未启用 WebGL。切到「代码」Tab 可复制到支持 WebGL 的环境运行。'); return; }

    /* 顶点着色器做旋转 + 顶点色 varying 插值：旋转和渐变都在 GPU 上算 */
    const vs = `
      attribute vec2 p;
      attribute vec3 c;
      varying vec3 vC;
      uniform float uAngle;
      void main(){
        float s = sin(uAngle), co = cos(uAngle);
        mat2 r = mat2(co, -s, s, co);
        gl_Position = vec4(r * p, 0.0, 1.0);
        vC = c;
      }`;
    const fs = `
      precision mediump float;
      varying vec3 vC;
      void main(){ gl_FragColor = vec4(vC, 1.0); }`;
    const shader = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    let program;
    try {
      program = gl.createProgram();
      gl.attachShader(program, shader(gl.VERTEX_SHADER, vs));
      gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    } catch { fallback(stage, '着色器编译失败。切到「代码」Tab 可复制到本地排查。'); return; }
    gl.useProgram(program);

    const pos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pos);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, .78, -.72, -.66, .72, -.66]), gl.STATIC_DRAW);
    const locP = gl.getAttribLocation(program, 'p');
    gl.enableVertexAttribArray(locP);
    gl.vertexAttribPointer(locP, 2, gl.FLOAT, false, 0, 0);

    const schemes = [
      [[.88, .15, .11], [.96, .77, 0], [.11, .3, .62]],
      [[.11, .3, .62], [.88, .15, .11], [.96, .77, 0]]
    ];
    let scheme = 0;
    const colorBuf = gl.createBuffer();
    const locC = gl.getAttribLocation(program, 'c');
    const uAngle = gl.getUniformLocation(program, 'uAngle');
    const uploadColors = () => {
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(schemes[scheme].flat()), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(locC);
      gl.vertexAttribPointer(locC, 3, gl.FLOAT, false, 0, 0);
    };
    uploadColors();

    let angle = 0, spinning = !reduced;
    const draw = () => {
      const w = Math.max(stage.clientWidth, 1), h = Math.max(stage.clientHeight, 1);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uAngle, angle);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    new ResizeObserver(draw).observe(stage);
    const loop = () => { if (spinning) { angle += 0.012; draw(); } requestAnimationFrame(loop); };
    draw();
    loop();

    const playBtn = btn(spinning ? '暂停旋转' : '自动旋转', () => {
      spinning = !spinning;
      playBtn.textContent = spinning ? '暂停旋转' : '自动旋转';
      playBtn.setAttribute('aria-pressed', String(spinning));
    }, spinning);
    const colorBtn = btn('换渐变', () => {
      scheme = (scheme + 1) % schemes.length;
      uploadColors();
      draw();
      say('已换渐变');
    });
    controls.append(playBtn, colorBtn);
    say(reduced ? '已暂停' : '着色器实时计算');
    wireExpand(card, expand, 'WebGL · 着色器渐变三角', draw);
  }

  const mounts = {three: mountThree, gsap: mountGsap, combo: mountCombo, webgl: mountWebgl};
  document.querySelectorAll('.demo-lab[data-demo]').forEach(root => {
    const mount = mounts[root.dataset.demo];
    if (mount) mount(shell(root, {
      three: 'three.js · 可旋转立方体',
      gsap: 'GSAP · 时间轴与进度',
      combo: '组合 · 滚动驱动相机',
      webgl: 'WebGL · 着色器渐变三角'
    }[root.dataset.demo]));
  });
})();
