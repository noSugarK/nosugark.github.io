/* 共用放大逻辑（demo-lab 与 motion-lab）：沿用站点图片灯箱的做法。
   单一状态源 expanded 决定图标、提示、pressed 与点击行为；
   卡片整块移进铺满视口的 dialog，点遮罩或 Esc 关闭后放回原容器。 */

const EXPAND_ICON = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg>';
const SHRINK_ICON = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M3 8h5V3M21 8h-5V3M3 16h5v5M21 16h-5v5"/></svg>';

export function makeExpandIcon(expand) {
  expand.innerHTML = EXPAND_ICON;
  expand.setAttribute('aria-label', '放大演示');
  expand.title = '放大演示';
  expand.setAttribute('aria-pressed', 'false');
}

/* host 为要移动的容器，默认就是 card。传入外层容器可保留 CSS 祖先链（如 motion-lab）。 */
export function wireExpand(card, expand, title, onResize = () => {}, host = card) {
  let expanded = false;
  let dialog = null;

  const render = () => {
    expand.innerHTML = expanded ? SHRINK_ICON : EXPAND_ICON;
    expand.setAttribute('aria-label', expanded ? '缩小演示' : '放大演示');
    expand.title = expanded ? '缩小演示' : '放大演示';
    expand.setAttribute('aria-pressed', String(expanded));
  };
  const setExpanded = value => {
    if (expanded === value) return;
    expanded = value;
    render();
  };

  const open = () => {
    dialog = document.createElement('dialog');
    dialog.className = 'demo-dialog';
    dialog.setAttribute('aria-label', title + '（放大演示）');
    dialog.tabIndex = -1;

    const parent = host.parentNode;
    const next = host.nextSibling;
    dialog.append(host);
    document.body.append(dialog);
    setExpanded(true);
    dialog.showModal();
    dialog.focus();
    requestAnimationFrame(onResize);

    dialog.addEventListener('close', () => {
      if (host.parentNode === dialog) parent.insertBefore(host, next);
      dialog.remove();
      dialog = null;
      setExpanded(false);
      expand.focus();
      requestAnimationFrame(onResize);
    }, {once: true});
    dialog.addEventListener('click', event => {
      if (!card.contains(event.target)) dialog.close();
    });
  };

  expand.addEventListener('click', () => {
    if (expanded) dialog?.close();
    else open();
  });
  render();
}
