/* 共用动画下拉框：触发器 + 弹出菜单，展开淡入、选中项打勾描线。
   用 button/role=listbox 保证键盘与读屏可用，替换原生 select。
   demo-lab 与 motion-lab 都引用这一个实现。 */

const CHECK_ICON = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8"/></svg>';
const ARROW_ICON = '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>';

function make(tag, className = '', text = '') {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  if (tag === 'button') el.type = 'button';
  return el;
}

/* items: [{value, label}]；onChange(value)；ariaLabel 可选。
   返回的元素暴露 .value（当前值）与 .onchange（赋值即注册回调），
   兼容原生 select 的常见用法；同时 onChange 参数也会被调用。 */
export function animatedSelect(items, value, onChange, ariaLabel) {
  const root = make('div', 'aselect');
  const trigger = make('button', 'aselect-trigger');
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  if (ariaLabel) trigger.setAttribute('aria-label', ariaLabel);
  const current = make('span', 'aselect-value', items.find(i => i.value === value)?.label || '');
  const arrow = make('span', 'aselect-arrow');
  arrow.innerHTML = ARROW_ICON;
  trigger.append(current, arrow);

  const menu = make('div', 'aselect-menu');
  menu.setAttribute('role', 'listbox');
  menu.hidden = true;   /* 初始收起，否则 CSS 的 [hidden] 规则不生效、菜单默认展开 */
  let open = false;

  const options = items.map(item => {
    const opt = make('div', 'aselect-option');
    opt.setAttribute('role', 'option');
    opt.dataset.value = item.value;
    const check = make('span', 'aselect-check');
    check.innerHTML = CHECK_ICON;
    opt.append(check, make('span', '', item.label));
    opt.addEventListener('click', () => {
      value = item.value;
      current.textContent = item.label;
      options.forEach(o => o.classList.toggle('selected', o.dataset.value === value));
      setOpen(false);
      trigger.focus();
      if (typeof onChange === 'function') onChange(value);
      if (typeof root.onchange === 'function') root.onchange(value);
    });
    menu.append(opt);
    return opt;
  });
  options.find(o => o.dataset.value === value)?.classList.add('selected');

  const setOpen = next => {
    open = next;
    menu.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
    root.classList.toggle('open', open);
    if (open) options.find(o => o.classList.contains('selected'))?.focus();
  };
  trigger.addEventListener('click', () => setOpen(!open));
  trigger.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' && !open) { event.preventDefault(); setOpen(true); }
  });
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && open) { event.stopPropagation(); setOpen(false); trigger.focus(); }
  });
  document.addEventListener('pointerdown', event => {
    if (open && !root.contains(event.target)) setOpen(false);
  });
  [trigger, ...options].forEach(el => { el.tabIndex = 0; });
  root.append(trigger, menu);

  /* 兼容原生 select 的 .value 读取 */
  Object.defineProperty(root, 'value', { get: () => value, configurable: true });
  return root;
}
